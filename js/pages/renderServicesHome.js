function renderServicesHome(){
  // reuse tech-details header sizing/spacing rules
  try{ document.body.classList.add("route-tech"); }catch(e){}
  try{ document.body.classList.add("route-services"); }catch(e){}
  try{ document.body.classList.add("route-services"); }catch(e){}
  // Route: #/servicesHome?team=all|express|kia&focus=asr|sold&filter=total|without_fluids|fluids_only&compare=team|store
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  let teamKey = "all";
  let focus = "asr";
  let filterKey = UI.servicesFilterKey || "total";
  let compareBasis = UI.servicesCompareBasis || "team"; // "team" or "store"

  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      const val = decodeURIComponent(v||"");
      if(k==="team") teamKey = val || "all";
      if(k==="focus") focus = (val==="sold") ? "sold" : "asr";
      if(k==="filter") filterKey = val || "total";
      if(k==="compare") compareBasis = (val==="store") ? "store" : "team";
    }
  }

  function filterLabel(k){
    return k==="without_fluids" ? "Without Fluids" : (k==="fluids_only" ? "Fluids Only" : "With Fluids (Total)");
  }

  const teamLabel = (teamKey==="all") ? "ALL" : teamKey.toUpperCase();
  const techs = getTechsByTeam(teamKey);
  const svcSectionCats = {};
  const storeTechs = getTechsByTeam("all");
  const compareTechs = (compareBasis==="store") ? storeTechs : techs;

  // NOTE: The underlying data currently doesn't change per filterKey in this Services page.
  // We still show the filter control + text to match the Tech Details header UX.
  UI.servicesFilterKey = filterKey;
  UI.servicesCompareBasis = compareBasis;

  const totalRos = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const avgOdo = totalRos
    ? techs.reduce((s,t)=>s+(Number(t.odo)||0)*(Number(t.ros)||0),0)/totalRos
    : 0;

  const allCats = getAllCategoriesSet();
  const allServiceKeys = Array.from(allCats);

  const mean = (arr)=> arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : NaN;

  function initServicesSectionToggles(){
    // One toggle button per section header, placed to the LEFT of the title, and wired to collapse the section list.
    document.querySelectorAll(".panel").forEach(panel=>{
      const phead = panel.querySelector(".phead");
      const list = panel.querySelector(".list");
      const h2 = phead ? phead.querySelector(".techH2") : null;
      if(!phead || !list || !h2) return;

      // Ensure we have a head row container
      let row = phead.querySelector(".secHeadRow");
      if(!row){
        row = document.createElement("div");
        row.className = "secHeadRow";
        // Insert row at top of the title area (try to use h2's parent)
        const host = h2.parentElement || phead;
        host.insertBefore(row, host.firstChild);
      }

      // Remove any existing toggles inside this phead
      phead.querySelectorAll("button.secToggle").forEach(b=>b.remove());

      // Create a single toggle button
      const btn = document.createElement("button");
      btn.className = "secToggle";
      btn.type = "button";
      btn.setAttribute("aria-label","Toggle section");

      // Put toggle BEFORE title
      row.insertBefore(btn, row.firstChild);

      // Move title into the row right after toggle (keeps it top-left)
      if(h2.parentElement != row){
        row.appendChild(h2);
      }

      // default expanded
      const sync = ()=>{
        const collapsed = panel.classList.contains("secCollapsed");
        btn.textContent = collapsed ? "+" : "−";
        list.style.display = collapsed ? "none" : "";
      };
      sync();

      btn.onclick = (e)=>{
        e.preventDefault();
        panel.classList.toggle("secCollapsed");
        sync();
      };
    });
  }

  function bandFromPct(p){
    if(!Number.isFinite(p)) return "neutral";
    if(p < 0.60) return "red";
    if(p < 0.80) return "yellow";
    return "green";
  }

  function triBadgeSvg(color, num){
    const fill = color==="red" ? "#f04545" : "#f3a91a";
    const txtFill = "#ffffff";
    // Slight left bias on number via dx
    return `
      <span class="triBadge tri-${color}">
        <svg viewBox="0 0 120 110" width="56" height="50" aria-hidden="true" focusable="false">
          <polygon points="60,4 116,104 4,104" fill="${fill}"></polygon>
          <rect x="54" y="30" width="12" height="44" rx="6" fill="#111"></rect>
          <circle cx="60" cy="90" r="7" fill="#111"></circle>
          <text x="90" y="98" font-size="28" font-weight="900" fill="${txtFill}" text-anchor="middle">${num}</text>
        </svg>
      </span>
    `;
  }

  function badgeButton(secId, metric, color, num, size="mini"){
    const cls = (size==="focus") ? "svcBadgeBtn svcBadgeBtnFocus" : "svcBadgeBtn";
    return `
      <button class="${cls}" type="button"
        data-sec="${safe(secId)}" data-metric="${metric}" data-color="${color}"
        onclick="return window.openSvcBadgePopup && window.openSvcBadgePopup(event)">
        ${triBadgeSvg(color, num)}
      </button>
    `;
  }

  function ensureBadgePopupCss(){
    if(document.getElementById("svcBadgePopupCss")) return;
    const st = document.createElement("style");
    st.id = "svcBadgePopupCss";
    st.textContent = `
      .svcBadgeBtn{background:transparent;border:0;padding:0;margin:0;cursor:pointer}
      .svcBadgeBtn:focus{outline:2px solid rgba(255,255,255,.18);outline-offset:4px;border-radius:10px}
      .svcBadgePopup{
        position:fixed;z-index:9999;
        width:420px;max-width:calc(100vw - 24px);
        max-height:60vh;overflow:auto;
        border-radius:18px;
        background:linear-gradient(180deg,rgba(20,27,45,.98),rgba(10,14,26,.98));
        border:1px solid rgba(255,255,255,.12);
        box-shadow:0 24px 80px rgba(0,0,0,.55);
      }
      .svcBadgePopupHead{display:flex;align-items:center;gap:12px;padding:14px 14px 10px;border-bottom:1px solid rgba(255,255,255,.10)}
      .svcBadgePopupTitle{font-size:26px;font-weight:1100;letter-spacing:.3px}
      .svcBadgePopupClose{margin-left:auto;width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:var(--text);cursor:pointer}
      .svcBadgePopupList{padding:12px;display:grid;gap:10px}
      .svcBadgePopupItem{
        display:flex;align-items:center;justify-content:space-between;gap:14px;
        padding:10px 12px;border-radius:14px;
        background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.08);
        text-decoration:none;color:inherit;
      }
      .svcBadgePopupItem:hover{background:rgba(255,255,255,.06)}
      .flashPick{outline:2px solid rgba(255,255,255,.18);outline-offset:6px;border-radius:16px}
      .svcBadgePopupName{font-weight:1000;letter-spacing:.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .svcBadgePopupVal{font-weight:1000;color:rgba(255,255,255,.86);white-space:nowrap}
    `;
    document.head.appendChild(st);
  }

  window.closeSvcBadgePopup = function(){
    const ex = document.getElementById("svcBadgePopup");
    if(ex) ex.remove();
  };

  window.openSvcBadgePopup = function(e){
    try{
      ensureBadgePopupCss();
      window.closeSvcBadgePopup();

      const btn = e.currentTarget;
      const secId = btn.getAttribute("data-sec") || "";
      const metric = btn.getAttribute("data-metric") || "asr"; // "asr" or "sold"
      const color = btn.getAttribute("data-color") || "red";

      const cats = (svcSectionCats && svcSectionCats[secId]) ? svcSectionCats[secId] : [];
      const rows = [];
      for(const cat of cats){
        const a = aggFor(cat, techs);
        const gReq = Number(getGoal(cat,"req"));
        const gClose = Number(getGoal(cat,"close"));
        const pctReq = (Number.isFinite(a.reqTot) && Number.isFinite(gReq) && gReq>0) ? (a.reqTot/gReq) : NaN;
        const pctClose = (Number.isFinite(a.closeTot) && Number.isFinite(gClose) && gClose>0) ? (a.closeTot/gClose) : NaN;
        const band = (metric==="sold") ? bandFromPct(pctClose) : bandFromPct(pctReq);
        if(band !== color) continue;
        rows.push({
          key: cat,
          name: (typeof catLabel==="function") ? catLabel(cat) : String(cat),
          val: (metric==="sold") ? a.closeTot : a.reqTot
        });
      }
      // Sort high-to-low for readability
      rows.sort((x,y)=>(y.val||0)-(x.val||0));

      const title = (metric==="sold") ? "SOLD" : "ASR";
      const icon = triBadgeSvg(color, "");
      const popup = document.createElement("div");
      popup.id = "svcBadgePopup";
      popup.className = "svcBadgePopup";
      popup.innerHTML = `
        <div class="svcBadgePopupHead">
          <div class="svcBadgePopupTitle">${title}</div>
          <div>${icon}</div>
          <button class="svcBadgePopupClose" type="button" onclick="window.closeSvcBadgePopup()">✕</button>
        </div>
        <div class="svcBadgePopupList">
          ${rows.length ? rows.map((r, i)=>`
            <a class="svcBadgePopupItem" href="javascript:void(0)" onclick="window.closeSvcBadgePopup(); return (window.jumpToService ? window.jumpToService('${safeId(r.key)}') : false);">
              <div class="svcBadgePopupName">${(i+1)+'. '} ${safe(r.name)}</div>
              <div class="svcBadgePopupVal">${(metric==='sold'?'Sold% ':'ASR% ')}${fmtPct(r.val)}</div>
            </a>
          `).join("") : `<div class="sub">No services in this band.</div>`}
        </div>
      `;
      document.body.appendChild(popup);

      const r = btn.getBoundingClientRect();
      const pad = 12;
      const pw = popup.offsetWidth;
      const ph = popup.offsetHeight;
      let left = Math.min(window.innerWidth - pw - pad, Math.max(pad, r.left));
      let top = Math.min(window.innerHeight - ph - pad, Math.max(pad, r.bottom + 8));
      popup.style.left = left + "px";
      popup.style.top = top + "px";

      // click outside closes
      setTimeout(()=>{
        const onDoc = (ev)=>{
          if(!popup.contains(ev.target)) window.closeSvcBadgePopup();
        };
        document.addEventListener("mousedown", onDoc, { once:true });
      }, 0);

      return false;
    }catch(err){
      console.error(err);
      return false;
    }
  };

const ICON_THUMBS_UP = `<svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true"><path fill="currentColor" d="M2 10h4v12H2V10zm20 1c0-1.1-.9-2-2-2h-6.3l.9-4.4.02-.2c0-.3-.13-.6-.33-.8L13 2 7.6 7.4c-.4.4-.6.9-.6 1.4V20c0 1.1.9 2 2 2h7c.8 0 1.5-.5 1.8-1.2l3-7c.1-.3.2-.6.2-.8v-2z"/></svg>`;
const ICON_THUMBS_DOWN = `<svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true"><path fill="currentColor" d="M2 2h4v12H2V2zm20 11c0 1.1-.9 2-2 2h-6.3l.9 4.4.02.2c0 .3-.13.6-.33.8L13 22l-5.4-5.4c-.4-.4-.6-.9-.6-1.4V4c0-1.1.9-2 2-2h7c.8 0 1.5.5 1.8 1.2l3 7c.1.3.2.6.2.8v2z"/></svg>`;

function topBottomForAllServices(mode, n=5){
  const rows = [];
  for(const cat of allServiceKeys){
    const a = aggFor(cat, techs);
    const v = (mode==="sold") ? Number(a.closeTot) : Number(a.reqTot);
    if(!Number.isFinite(v)) continue;
    rows.push({ cat, label: (typeof catLabel==="function") ? catLabel(cat) : String(cat), v });
  }
  rows.sort((a,b)=>b.v-a.v);
  return { top: rows.slice(0,n), bot: rows.slice(-n).reverse() };
}

function tbRow(item, idx, mode){
  const metricLbl = mode==="sold" ? "Sold%" : "ASR%";
  return `
    <div class="techRow pickRowFrame">
      <div class="techRowLeft">
        <span class="rankNum">${idx}.</span>
        <a href="#" data-jump="svc-${safeId(item.cat)}">${safe(item.label)}</a>
      </div>
      <div class="mini">${metricLbl} ${fmtPct(item.v)}</div>
    </div>
  `;
}

  function aggFor(serviceName, scopeTechs){
    const totalRosScope = scopeTechs.reduce((s,t)=>s+(Number(t.ros)||0),0);
    let asr=0, sold=0;
    const techRows=[];
    for(const t of scopeTechs){
      const c = (t.categories||{})[serviceName];
      const a = Number(c?.asr)||0;
      const so = Number(c?.sold)||0;
      asr += a; sold += so;
      const rosTech = Number(t.ros)||0;
      const req = rosTech ? (a/rosTech) : 0;
      const close = a ? (so/a) : 0;
      techRows.push({id:t.id, name:t.name, ros:rosTech, asr:a, sold:so, req, close});
    }
    const reqTot = totalRosScope ? (asr/totalRosScope) : 0;
    const closeTot = asr ? (sold/asr) : 0;
    return {serviceName, totalRos: totalRosScope, asr, sold, reqTot, closeTot, techRows};
  }

  // Overall Avg ASR/RO across all services (mean of each service's reqTot)
  const overallAggs = allServiceKeys.map(k=> aggFor(k, techs));
  const overallAvgReq = overallAggs.length ? mean(overallAggs.map(x=>x.reqTot).filter(n=>Number.isFinite(n))) : NaN;

  // Benchmarks helpers (copied pattern from Tech Details)
  function getTeamBenchmarks(cat, _team){
    const reqs=[], closes=[];
    const techList = (_team==="EXPRESS") ? getTechsByTeam("express")
                  : (_team==="KIA") ? getTechsByTeam("kia")
                  : getTechsByTeam("all");
    for(const t of techList){
      const c = (t.categories||{})[cat];
      const r = Number(c?.req);
      const cl = Number(c?.close);
      if(Number.isFinite(r)) reqs.push(r);
      if(Number.isFinite(cl)) closes.push(cl);
    }
    return { avgReq: reqs.length ? mean(reqs) : NaN, avgClose: closes.length ? mean(closes) : NaN };
  }
  function getStoreBenchmarks(cat){
    const reqs=[], closes=[];
    for(const t of storeTechs){
      const c = (t.categories||{})[cat];
      const r = Number(c?.req);
      const cl = Number(c?.close);
      if(Number.isFinite(r)) reqs.push(r);
      if(Number.isFinite(cl)) closes.push(cl);
    }
    return { avgReq: reqs.length ? mean(reqs) : NaN, avgClose: closes.length ? mean(closes) : NaN };
  }

  // Tech list formatting (same as Category pages)
  function techListFor(service){
    const rows = (service.techRows||[]).slice().sort((a,b)=>{
      return focus==="sold" ? (b.close - a.close) : (b.req - a.req);
    });

    return rows.map((r, idx)=>{
      const rank = idx + 1;

      if(focus==="sold"){
        return `<div class="techRow">
          <div class="techRowLeft">
            <span class="rankNum">${rank}.</span>
            <a href="#/tech/${encodeURIComponent(r.id)}">${safe(r.name)}</a>
          </div>
          <span class="mini">
            ROs ${fmtInt(r.ros)} • ASR ${fmtInt(r.asr)} • Sold ${fmtInt(r.sold)} • <b>${fmtPct(r.close)}</b>
          </span>
        </div>`;
      }

      return `<div class="techRow">
        <div class="techRowLeft">
          <span class="rankNum">${rank}.</span>
          <a href="#/tech/${encodeURIComponent(r.id)}">${safe(r.name)}</a>
        </div>
        <span class="mini">
          ROs ${fmtInt(r.ros)} • ASR ${fmtInt(r.asr)} • <b>${fmtPctPlain(r.req)}</b>
        </span>
      </div>`;
    }).join("");
  }

  function safeId(s){
    return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  }

  // Service tile: header like Tech Details tile, body is technician list
  function serviceTile(catKey){
    const name = (typeof catLabel==="function") ? catLabel(catKey) : String(catKey);
    const agg = aggFor(catKey, techs);

    // Compare benchmarks for focus dial in header (team or store, to match tech details behavior)
    const bench = (compareBasis==="store") ? getStoreBenchmarks(catKey) : getTeamBenchmarks(catKey, teamLabel);

    const pctVsAvgReq = (Number.isFinite(agg.reqTot) && Number.isFinite(bench.avgReq) && bench.avgReq>0) ? (agg.reqTot/bench.avgReq) : NaN;
    const pctVsAvgClose = (Number.isFinite(agg.closeTot) && Number.isFinite(bench.avgClose) && bench.avgClose>0) ? (agg.closeTot/bench.avgClose) : NaN;

    const gauge = focus==="sold"
      ? (Number.isFinite(pctVsAvgClose) ? svcGauge(pctVsAvgClose, "Sold%") : "")
      : (Number.isFinite(pctVsAvgReq) ? svcGauge(pctVsAvgReq, "ASR%") : "");

    // Rank vs peers (store) for the focus label, same function used elsewhere if available
    let rk = { rank: "—", total: "" };
    try{
      if(typeof computeServiceRanksForTeam === "function"){
        // ranks across selected teamKey
        const ranks = computeServiceRanksForTeam(catKey, teamKey, focus);
        rk = ranks || rk;
      }
    }catch(e){}

    const techListHtml = `<div class="techList">${techListFor(agg) || '<div class="sub">No technicians found.</div>'}</div>`;

    return `
      <div class="catCard" id="svc-${safeId(catKey)}">
        <div class="catHeader">
          <div class="svcGaugeWrap" style="--sz:72px">${gauge}</div>
          <div>
            <div class="catTitle">${safe(name)}</div>
            <div class="muted svcMetaLine" style="margin-top:2px">
              ${fmt1(agg.asr,0)} ASR • ${fmt1(agg.sold,0)} Sold • ${fmt1(agg.totalRos,0)} ROs
            </div>
          </div>
          <div class="catRank">
            <div class="rankNum">${rk.rank ?? "—"}${rk.total ? `<span class="rankDen">/${rk.total}</span>` : ""}</div>
            <div class="rankLbl">${focus==="sold" ? "SOLD%" : "ASR%"}</div>
          </div>
        </div>

        ${techListHtml}
      </div>
    `;
  }

  // Controls / applied text to match Tech Details header UX
  UI.groupFilters = UI.groupFilters || {};
  const openKey = "_services_main";
  const open = !!UI.groupFilters[openKey];

  const appliedParts = [
    filterLabel(filterKey),
    (compareBasis==="team" ? `Compare: ${teamLabel}` : "Compare: Store"),
    (focus==="sold" ? "Focus: Sold" : "Focus: ASR/RO")
  ];
  const appliedTextHtml = (typeof renderFiltersText==="function") ? renderFiltersText(appliedParts) : appliedParts.join(" • ");

  const controls = ``;

  // Section header stats: averages across all technicians (selected team)
  function sectionStatsAllTechs(sec){
    const cats = sec.categories || [];
    const reqs = [];
    const closes = [];
    for(const cat of cats){
      for(const t of techs){
        const c = (t.categories||{})[cat];
        const r = Number(c?.req);
        const cl = Number(c?.close);
        if(Number.isFinite(r)) reqs.push(r);
        if(Number.isFinite(cl)) closes.push(cl);
      }
    }
    return {
      avgReq: reqs.length ? mean(reqs) : NaN,
      avgClose: closes.length ? mean(closes) : NaN
    };
  }

  const topReqTB = topBottomForAllServices('asr',5).top;
  const botReqTB = topBottomForAllServices('asr',5).bot;
  const topCloseTB = topBottomForAllServices('sold',5).top;
  const botCloseTB = topBottomForAllServices('sold',5).bot;

  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const cats = Array.from(new Set((sec.categories||[]).filter(Boolean))).filter(c=>allCats.has(c));
    const secId = safeId(sec.name||'section');
    svcSectionCats[secId] = cats;
    if(!cats.length) return "";

    const secStats = sectionStatsAllTechs(sec);

    // Section-level compare benchmarks (average of per-category compare benchmarks)
    const benchReqs = cats.map(cat=>{
      const b = (compareBasis==="store") ? getStoreBenchmarks(cat) : getTeamBenchmarks(cat, teamLabel);
      return Number(b && b.avgReq);
    }).filter(n=>Number.isFinite(n) && n>0);

    const benchCloses = cats.map(cat=>{
      const b = (compareBasis==="store") ? getStoreBenchmarks(cat) : getTeamBenchmarks(cat, teamLabel);
      return Number(b && b.avgClose);
    }).filter(n=>Number.isFinite(n) && n>0);

    const benchReq = benchReqs.length ? mean(benchReqs) : NaN;
    const benchClose = benchCloses.length ? mean(benchCloses) : NaN;

    // Goals (average of per-category goals)
    const goalReqs = cats.map(cat=>Number(getGoal(cat,"req"))).filter(n=>Number.isFinite(n) && n>0);
    const goalCloses = cats.map(cat=>Number(getGoal(cat,"close"))).filter(n=>Number.isFinite(n) && n>0);
    const goalReq = goalReqs.length ? mean(goalReqs) : NaN;
    const goalClose = goalCloses.length ? mean(goalCloses) : NaN;

    // Triangle badge counts (how many services are red/yellow vs GOAL) within this section
    let redReqCount=0, yellowReqCount=0, redCloseCount=0, yellowCloseCount=0;
    for(const cat of cats){
      const a = aggFor(cat, techs);
      const gReq = Number(getGoal(cat,"req"));
      const gClose = Number(getGoal(cat,"close"));
      const pctReq = (Number.isFinite(a.reqTot) && Number.isFinite(gReq) && gReq>0) ? (a.reqTot/gReq) : NaN;
      const pctClose = (Number.isFinite(a.closeTot) && Number.isFinite(gClose) && gClose>0) ? (a.closeTot/gClose) : NaN;
      const bReq = bandFromPct(pctReq);
      const bClose = bandFromPct(pctClose);
      if(bReq==="red") redReqCount++;
      if(bReq==="yellow") yellowReqCount++;
      if(bClose==="red") redCloseCount++;
      if(bClose==="yellow") yellowCloseCount++;
    }

    const asrVal = Number(secStats.avgReq);
    const soldVal = Number(secStats.avgClose);

    const pctAsr = (Number.isFinite(asrVal) && Number.isFinite(benchReq) && benchReq>0) ? (asrVal/benchReq) : NaN;
    const pctSold = (Number.isFinite(soldVal) && Number.isFinite(benchClose) && benchClose>0) ? (soldVal/benchClose) : NaN;

    const pctGoalAsr = (Number.isFinite(asrVal) && Number.isFinite(goalReq) && goalReq>0) ? (asrVal/goalReq) : NaN;
    const pctGoalSold = (Number.isFinite(soldVal) && Number.isFinite(goalClose) && goalClose>0) ? (soldVal/goalClose) : NaN;
    const pctGoal = [pctGoalAsr,pctGoalSold].filter(n=>Number.isFinite(n)).length
      ? mean([pctGoalAsr,pctGoalSold].filter(n=>Number.isFinite(n)))
      : NaN;

    const focusPct = (focus==="sold") ? pctSold : pctAsr;
    const focusLbl = (focus==="sold") ? "Sold" : "ASR";

    const dialASR = Number.isFinite(pctAsr) ? `<div class="svcGaugeWrap" style="--sz:29px">${svcGauge(pctAsr,"ASR")}</div>` : `<div class="svcGaugeWrap" style="--sz:29px"></div>`;
    const dialSold = Number.isFinite(pctSold) ? `<div class="svcGaugeWrap" style="--sz:29px">${svcGauge(pctSold,"Sold")}</div>` : `<div class="svcGaugeWrap" style="--sz:29px"></div>`;
    const dialGoal = Number.isFinite(pctGoal) ? `<div class="svcGaugeWrap" style="--sz:29px">${svcGauge(pctGoal,"Goal")}</div>` : `<div class="svcGaugeWrap" style="--sz:29px"></div>`;
    const dialFocus = Number.isFinite(focusPct) ? `<div class="svcGaugeWrap" style="--sz:112px">${svcGauge(focusPct,focusLbl)}</div>` : `<div class="svcGaugeWrap" style="--sz:112px"></div>`;

    const rows = cats.map(cat=>serviceTile(cat)).join("");

    // EXACT tech-details style header layout
    return `
      <div class="panel">
        <div class="phead">
          <div class="titleRow" style="justify-content:space-between;align-items:flex-start;position:relative">
            <div>
              <div class="secLeftTop" style="max-width:72%;padding-right:420px">
              <div class="secLeftRow" style="display:grid;grid-template-columns:auto auto;column-gap:22px;align-items:start">
                <div class="secTitleBlock" style="min-width:320px">
                  <div class="secHeadRow" style="display:flex;align-items:center;gap:12px">
                    <button class="secToggle" type="button" aria-label="Toggle section">−</button>
                    <div class="h2 techH2">${safe(sec.name)}</div>
                  </div>
                  <div class="sub">${safe(appliedParts.join(" • "))}</div>
                </div>

                <div class="miniDialStack" style="display:flex;flex-direction:column;gap:8px;align-items:center">
                  <div class="secMiniDials" style="display:flex;gap:10px;align-items:center">${dialASR}${dialSold}${dialGoal}</div>
                  <div class="secBadgeUnderMini" style="display:flex;gap:34px;align-items:flex-start">
                    <div class="badgeGroup" style="display:flex;flex-direction:column;align-items:center;gap:4px">
                      <div class="badgePair" style="display:flex;gap:10px;align-items:center">${badgeButton(secId,"asr","red", redReqCount)}${badgeButton(secId,"asr","yellow", yellowReqCount)}</div>
                      <div class="badgeCap">ASR</div>
                    </div>
                    <div class="badgeGroup" style="display:flex;flex-direction:column;align-items:center;gap:4px">
                      <div class="badgePair" style="display:flex;gap:10px;align-items:center">${badgeButton(secId,"sold","red", redCloseCount)}${badgeButton(secId,"sold","yellow", yellowCloseCount)}</div>
                      <div class="badgeCap">SOLD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
<div class="secHdrRight" style="position:absolute;right:0;top:0;display:flex;align-items:flex-start;gap:18px">
              <div class="secFocusDial" style="display:flex;flex-direction:row;align-items:flex-start;gap:14px;justify-content:flex-end">
                <div class="focusBadgePair" style="display:flex;flex-direction:column;align-items:center;gap:6px">
                  <div class="badgePair big" style="display:flex;gap:10px;align-items:center">
                    ${(focus==="sold") ? `${badgeButton(secId,"sold","red", redCloseCount)}${badgeButton(secId,"sold","yellow", yellowCloseCount)}` : `${badgeButton(secId,"asr","red", redReqCount)}${badgeButton(secId,"asr","yellow", yellowReqCount)}`}
                  </div>
                  <div class="badgeCap big focusCap" style="font-size:15px;letter-spacing:.25px;color:var(--muted);font-weight:1100;text-transform:uppercase">
                    ${focus==="sold" ? "SOLD" : "ASR"}
                  </div>
                </div>
                ${dialFocus}
              </div>
              <div class="secHdrStats" style="text-align:right;align-self:flex-start">
                <div class="big">${fmtPct(secStats.avgReq)}</div>
                <div class="tag">ASR%</div>
                <div style="margin-top:6px;text-align:right;color:var(--muted);font-weight:900;font-size:13px">
                  Sold%: <b style="color:var(--text)">${fmtPct(secStats.avgClose)}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="list">${rows ? `<div class="categoryGrid">${rows}</div>` : `<div class="notice">No categories found in this section.</div>`}</div>
      </div>
    `;
  }).join("");

  
// Header like tech details page but name is "Services" and pills per your spec
const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>

          <div class="techNameWrap">
            <div class="h2 techH2Big">SERVICES</div>
            <div class="techTeamLine">${safe(teamLabel)} • ${focus==="sold" ? "SOLD%" : "ASR/RO"}</div>
            <div class="sub"><a href="#/" style="text-decoration:none">← Back to technician dashboard</a></div>
          </div>

          <div class="overallBlock">
            <div class="big">${fmtPctPlain(overallAvgReq)}</div>
            <div class="tag">Avg ASR/RO (All Services)</div>
          </div>
        </div>

        <div class="pills" style="margin-top:10px">
          <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
          <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
          <div class="pill"><div class="k">Avg ASR/RO</div><div class="v">${fmtPctPlain(overallAvgReq)}</div></div>
        </div>

        <div class="filtersRow" style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;width:100%;padding-top:12px;border-top:1px solid rgba(255,255,255,.08)">
          <div class="filter">
            <div class="smallLabel">With/Without Fluids</div>
            <select class="sel" id="svcFilter">
              <option value="total" ${filterKey==="total"?"selected":""}>With Fluids (Total)</option>
              <option value="without_fluids" ${filterKey==="without_fluids"?"selected":""}>Without Fluids</option>
              <option value="fluids_only" ${filterKey==="fluids_only"?"selected":""}>Fluids Only</option>
            </select>
          </div>

          <div class="filter">
            <div class="smallLabel">Compare</div>
            <select class="sel" id="svcCompareBasis">
              <option value="team" ${compareBasis==="team"?"selected":""}>Team</option>
              <option value="store" ${compareBasis==="store"?"selected":""}>Store</option>
            </select>
          </div>

          <div class="filter">
            <div class="smallLabel">Focus</div>
            <select class="sel" id="svcFocus">
              <option value="asr" ${focus==="asr"?"selected":""}>ASR/RO</option>
              <option value="sold" ${focus==="sold"?"selected":""}>Sold</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;

const top5Panel = `
    <div class="panel techPickPanel">
      <div class="phead" style="border-bottom:none;padding:12px">
        <div class="pickHdrRow" style="margin-bottom:10px">
          <div class="pickHdrLabel">ASR</div>
        </div>

        <div class="pickGrid2" style="grid-template-columns:1fr 1fr">
          <div class="pickBox">
            <div class="pickMiniHdr pickMiniHdrTop">TOP 5 MOST RECOMMENDED <span class="thumbIcon up" aria-hidden="true">${ICON_THUMBS_UP}</span></div>
            <div class="pickList">${topReqTB.map((x,i)=>tbRow(x,i+1,"asr")).join("") || `<div class="notice">—</div>`}</div>
          </div>

          <div class="pickBox">
            <div class="pickMiniHdr pickMiniHdrBot">BOTTOM 5 LEAST RECOMMENDED <span class="thumbIcon down" aria-hidden="true">${ICON_THUMBS_DOWN}</span></div>
            <div class="pickList">${botReqTB.map((x,i)=>tbRow(x,i+1,"asr")).join("") || `<div class="notice">—</div>`}</div>
          </div>
        </div>

        <div class="pickHdrRow" style="margin:18px 0 10px">
          <div class="pickHdrLabel">SOLD</div>
        </div>

        <div class="pickGrid2" style="grid-template-columns:1fr 1fr">
          <div class="pickBox">
            <div class="pickMiniHdr pickMiniHdrTop">TOP 5 MOST SOLD <span class="thumbIcon up" aria-hidden="true">${ICON_THUMBS_UP}</span></div>
            <div class="pickList">${topCloseTB.map((x,i)=>tbRow(x,i+1,"sold")).join("") || `<div class="notice">—</div>`}</div>
          </div>

          <div class="pickBox">
            <div class="pickMiniHdr pickMiniHdrBot">BOTTOM 5 LEAST SOLD <span class="thumbIcon down" aria-hidden="true">${ICON_THUMBS_DOWN}</span></div>
            <div class="pickList">${botCloseTB.map((x,i)=>tbRow(x,i+1,"sold")).join("") || `<div class="notice">—</div>`}</div>
          </div>
        </div>
      </div>
    </div>
  `;

document.getElementById("app").innerHTML = `
  <div class="techHeaderWrap">
    ${header}
    ${top5Panel}
  </div>

  ${sectionsHtml}
`;
  // bind top/bottom jump links
  document.querySelectorAll('[data-jump]').forEach(a=>{
    a.addEventListener('click',(e)=>{
      e.preventDefault();
      const id = a.getAttribute('data-jump');
      const el = document.getElementById(id);
      if(el){
        const sec = el.closest('.sectionFrame') || el.closest('.panel');
        if(sec && sec.classList && sec.classList.contains('secCollapsed')) sec.classList.remove('secCollapsed');
        el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });  initServicesSectionToggles();
  pinSectionTitlesTopLeft();
  try{ window.animateSvcGauges?.(); }catch(e){}
// animate gauges + enable section collapse toggles (same as tech details)
  
  const updateHash = ()=>{
    const f = document.getElementById('svcFocus');
    const flt = document.getElementById('svcFilter');
    const cb = document.getElementById('svcCompareBasis');
    const focusV = f ? f.value : focus;
    const filterV = flt ? flt.value : filterKey;
    const compareV = cb ? cb.value : compareBasis;
    UI.servicesFilterKey = filterV;
    UI.servicesCompareBasis = compareV;
    location.hash = `#/servicesHome?team=${encodeURIComponent(teamKey)}&focus=${encodeURIComponent(focusV)}&filter=${encodeURIComponent(filterV)}&compare=${encodeURIComponent(compareV)}`;
  };

  const focusSel = document.getElementById('svcFocus');
  const filterSel = document.getElementById('svcFilter');
  const compareSel = document.getElementById('svcCompareBasis');
  if(focusSel) focusSel.addEventListener('change', updateHash);
  if(filterSel) filterSel.addEventListener('change', updateHash);
  if(compareSel) compareSel.addEventListener('change', updateHash);

initServicesSectionToggles();
  
  function pinSectionTitlesTopLeft(){
    // Keep layout untouched: hide the original title text (keeps its space) and render an overlay *clone*
    // so it matches Tech Details styling exactly.
    document.querySelectorAll(".panel").forEach(panel=>{
      const phead = panel.querySelector(".phead");
      const h2 = phead ? phead.querySelector(".techH2") : null;
      const toggle = phead ? phead.querySelector("button.secToggle") : null;
      if(!phead || !h2 || !toggle) return;

      phead.style.position = "relative";

      // Hide original title text but keep its layout box
      h2.style.visibility = "hidden";

      // Create/update overlay as a clone of the h2 (inherits all the correct styles)
      let ov = phead.querySelector(".svcTitleOverlay");
      if(!ov){
        ov = h2.cloneNode(true);
        ov.classList.add("svcTitleOverlay");
        ov.style.position = "absolute";
        ov.style.zIndex = "5";
        ov.style.pointerEvents = "none";
        ov.style.visibility = "visible";
        ov.style.margin = "0";
        phead.appendChild(ov);
      }else{
        ov.textContent = h2.textContent;
      }

      const left = toggle.offsetLeft + toggle.offsetWidth + 12;
      ov.style.left = left + "px";
      ov.style.top = "10px";
    });
  }

try{ window.animateSvcGauges?.(); }catch(e){}
}

  
window.renderServicesHome = renderServicesHome;
