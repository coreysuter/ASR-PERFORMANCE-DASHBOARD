function renderServicesHome(){
  // reuse tech-details header sizing/spacing rules
  try{ document.body.classList.add("route-tech"); }catch(e){}
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

    const dialASR = Number.isFinite(pctAsr) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctAsr,"ASR")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialSold = Number.isFinite(pctSold) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctSold,"Sold")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialGoal = Number.isFinite(pctGoal) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctGoal,"Goal")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialFocus = Number.isFinite(focusPct) ? `<div class="svcGaugeWrap" style="--sz:112px">${svcGauge(focusPct,focusLbl)}</div>` : `<div class="svcGaugeWrap" style="--sz:112px"></div>`;

    const rows = cats.map(cat=>serviceTile(cat)).join("");

    // EXACT tech-details style header layout
    return `
      <div class="panel">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div class="h2 techH2">${safe(sec.name)}</div>
                <div class="secMiniDials">${dialASR}${dialSold}${dialGoal}</div>
              </div>
              <div class="sub">${safe(appliedParts.join(" • "))}</div>
            </div>
            <div class="secHdrRight">
              <div class="secFocusDial">${dialFocus}</div>
              <div class="secHdrStats" style="text-align:right">
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

      <div class="pills">
        <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
        <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
        <div class="pill"><div class="k">Avg ASR/RO</div><div class="v">${fmtPctPlain(overallAvgReq)}</div></div>
      </div>
    </div>
  </div>
`;

const top5Panel = `
  <div class="panel techPickPanel">
    <div class="phead" style="border-bottom:none;padding:12px">
      <div class="pickHdrRow">
        <div class="pickHdrLabel">ASR</div>
        <div class="pickHdrLabel">SOLD</div>
      </div>

      <div class="pickGrid2">
        <div class="pickBox">
          <div class="pickMiniHdr pickMiniHdrTop">TOP 5 MOST RECOMMENDED <span class="thumbIcon up" aria-hidden="true">${ICON_THUMBS_UP}</span></div>
          <div class="pickList">${topReqTB.map((x,i)=>tbRow(x,i+1,"asr")).join("") || `<div class="notice">—</div>`}</div>

          <div class="pickMiniHdr pickMiniHdrBot" style="margin-top:12px">BOTTOM 5 LEAST RECOMMENDED <span class="thumbIcon down" aria-hidden="true">${ICON_THUMBS_DOWN}</span></div>
          <div class="pickList">${botReqTB.map((x,i)=>tbRow(x,i+1,"asr")).join("") || `<div class="notice">—</div>`}</div>
        </div>

        <div class="pickBox">
          <div class="pickMiniHdr pickMiniHdrTop">TOP 5 MOST SOLD <span class="thumbIcon up" aria-hidden="true">${ICON_THUMBS_UP}</span></div>
          <div class="pickList">${topCloseTB.map((x,i)=>tbRow(x,i+1,"sold")).join("") || `<div class="notice">—</div>`}</div>

          <div class="pickMiniHdr pickMiniHdrBot" style="margin-top:12px">BOTTOM 5 LEAST SOLD <span class="thumbIcon down" aria-hidden="true">${ICON_THUMBS_DOWN}</span></div>
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
  });

  try{ window.animateSvcGauges?.(); }catch(e){}
  try{ window.initSectionToggles?.(); }catch(e){}

// animate gauges + enable section collapse toggles (same as tech details)
  try{ window.animateSvcGauges?.(); }catch(e){}
  try{ window.initSectionToggles?.(); }catch(e){}

}
window.renderServicesHome = renderServicesHome;
