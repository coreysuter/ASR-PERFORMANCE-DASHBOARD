function renderServicesHome(){
  // Route: #/servicesHome?team=all|express|kia&focus=asr|sold
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  let teamKey = "all";
  let focus = "asr";
  let filterKey = UI.servicesFilterKey || "total";
  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      if(k==="team") teamKey = decodeURIComponent(v||"all") || "all";
      if(k==="compare"){ UI.servicesCompareBasis = decodeURIComponent(v||"team") || "team"; }
      if(k==="filter"){ filterKey = decodeURIComponent(v||"total") || "total"; }
      if(k==="focus"){
        const vv = decodeURIComponent(v||"asr") || "asr";
        focus = (vv==="sold") ? "sold" : "asr";
      }
    }
  }

  const techs = getTechsByTeam(teamKey);
  const storeTechs = getTechsByTeam("all");

  const totalRos = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const avgOdo = totalRos
    ? techs.reduce((s,t)=>s+(Number(t.odo)||0)*(Number(t.ros)||0),0)/totalRos
    : 0;

  const allCats = getAllCategoriesSet();
  const allServiceKeys = Array.from(allCats);

  const mean = (arr)=> arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : NaN;

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

  function storeBench(serviceName){
    const reqs=[], closes=[];
    for(const t of storeTechs){
      const c = (t.categories||{})[serviceName];
      if(!c) continue;
      const r = Number(c.req);
      const cl = Number(c.close);
      if(Number.isFinite(r)) reqs.push(r);
      if(Number.isFinite(cl)) closes.push(cl);
    }
    return {
      avgReq: reqs.length ? mean(reqs) : NaN,
      avgClose: closes.length ? mean(closes) : NaN
    };
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

  // Service tile: SAME header title as tech details tiles, but body is technician list (like Category pages)
  function serviceTile(catKey){
    const name = (typeof catLabel==="function") ? catLabel(catKey) : String(catKey);
    const agg = aggFor(catKey, techs);
    const bench = storeBench(catKey);

    const pctVsStore = (focus==="sold")
      ? ((Number.isFinite(agg.closeTot) && Number.isFinite(bench.avgClose) && bench.avgClose>0) ? (agg.closeTot/bench.avgClose) : NaN)
      : ((Number.isFinite(agg.reqTot) && Number.isFinite(bench.avgReq) && bench.avgReq>0) ? (agg.reqTot/bench.avgReq) : NaN);

    const gaugeHtml = Number.isFinite(pctVsStore)
      ? `<div class="svcGaugeWrap" style="--sz:72px">${svcGauge(pctVsStore, (focus==="sold"?"Sold%":"ASR%"))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:72px"></div>`;

    const roPill = `<div class="pill small"><div class="k">ROs</div><div class="v">${fmtInt(agg.totalRos)}</div></div>`;

    return `
      <div class="card serviceCard" id="svc-${safeId(catKey)}">
        <div class="svcHead">
          <div class="svcLeft">
            <div class="svcName">${safe(name)}</div>
            <div class="svcSub">${roPill}</div>
          </div>
          <div class="svcRight">${gaugeHtml}</div>
        </div>

        <div class="svcBody">
          <div class="svcTechList">
            <div class="techList">
              ${techListFor(agg)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const applied = `${teamKey.toUpperCase()} • ${focus==="sold" ? "SOLD%" : "ASR/RO"}`;

  const openKey = "_services_main";
  UI.groupFilters = UI.groupFilters || {};
  const open = !!UI.groupFilters[openKey];

  // Match tech-details appliedParts text line
  let compareBasis = UI.servicesCompareBasis || "team"; // "team" or "store"
  const teamLabel = (teamKey==="all") ? "ALL" : teamKey.toUpperCase();
  const appliedParts = [
    `${filterLabel(filterKey)}`,
    (compareBasis==="team" ? `Compare: ${teamLabel}` : "Compare: Store"),
    (focus==="sold" ? "Focus: Sold" : "Focus: ASR/RO")
  ];
  const appliedTextHtml = renderFiltersText(appliedParts);

  const filters = `
    <div class="iconBar" style="margin-top:0">
      <button class="iconBtn" onclick="toggleGroupFilters('${openKey}')" aria-label="Filters" title="Filters">${ICON_FILTER}</button>
      <div class="appliedInline">${appliedTextHtml}</div>
    </div>
    <div class="ctlPanel ${open?"open":""}">
      <div class="controls" style="margin-top:10px">
        <div>
          <label>Summary Filter</label>
          <select id="svcFilter">
            <option value="total" ${filterKey==="total"?"selected":""}>With Fluids (Total)</option>
            <option value="without_fluids" ${filterKey==="without_fluids"?"selected":""}>Without Fluids</option>
            <option value="fluids_only" ${filterKey==="fluids_only"?"selected":""}>Fluids Only</option>
          </select>
        </div>
        <div>
          <label>Comparison</label>
          <select id="svcCompareBasis">
            <option value="team" ${compareBasis==="team"?"selected":""}>Team</option>
            <option value="store" ${compareBasis==="store"?"selected":""}>Store</option>
          </select>
        </div>
        <div>
          <label>Team</label>
          <select id="svcTeam">
            <option value="all" ${teamKey==="all"?"selected":""}>All</option>
            <option value="express" ${teamKey==="express"?"selected":""}>Express</option>
            <option value="kia" ${teamKey==="kia"?"selected":""}>Kia</option>
          </select>
        </div>
        <div>
          <label>Focus</label>
          <select id="svcFocus">
            <option value="asr" ${focus==="asr"?"selected":""}>ASR/RO</option>
            <option value="sold" ${focus==="sold"?"selected":""}>Sold</option>
          </select>
        </div>
      </div>
    </div>
  `;

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
      avgReq: reqs.length ? mean(reqs) : null,
      avgClose: closes.length ? mean(closes) : null
    };
  }

  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const secStats = sectionStatsAllTechs(sec);
    const cats = (sec.categories||[]);

    // Benchmarks for section-level dials (avg across categories)
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

    // Goals for section-level dials (avg across categories)
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

    const __cats = Array.from(new Set((sec.categories||[]).filter(Boolean))).filter(c=>allCats.has(c));
    const rows = __cats.map(cat=>serviceTile(cat)).join("");

    return `
      <div class="panel">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div class="h2 techH2">${safe(sec.name)}</div>
                <div class="secMiniDials">${dialASR}${dialSold}${dialGoal}</div>
              </div>
              <div class="sub">${appliedParts.join(" • ")}</div>
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
  document.getElementById("app").innerHTML = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>

          <div class="techNameWrap">
            <div class="h2 techH2Big">SERVICES</div>
            <div class="techTeamLine">${safe(applied)}</div>
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

        ${filters}
      </div>
    </div>

    ${sectionsHtml}
  `;

    const teamSel = document.getElementById('svcTeam');
  const focusSel = document.getElementById('svcFocus');
  const filterSel = document.getElementById('svcFilter');
  const compareSel = document.getElementById('svcCompareBasis');
  const updateHash = ()=>{
    const t = document.getElementById('svcTeam');
    const f = document.getElementById('svcFocus');
    const flt = document.getElementById('svcFilter');
    const cb = document.getElementById('svcCompareBasis');
    const teamV = t ? t.value : teamKey;
    const focusV = f ? f.value : focus;
    const filterV = flt ? flt.value : filterKey;
    const compareV = cb ? cb.value : (UI.servicesCompareBasis||'team');
    UI.servicesFilterKey = filterV;
    UI.servicesCompareBasis = compareV;
    location.hash = `#/servicesHome?team=${encodeURIComponent(teamV)}&focus=${encodeURIComponent(focusV)}&filter=${encodeURIComponent(filterV)}&compare=${encodeURIComponent(compareV)}`;
  };
  if(teamSel) teamSel.addEventListener('change', updateHash);
  if(focusSel) focusSel.addEventListener('change', updateHash);
  if(filterSel) filterSel.addEventListener('change', updateHash);
  if(compareSel) compareSel.addEventListener('change', updateHash);
}
window.renderServicesHome = renderServicesHome;
