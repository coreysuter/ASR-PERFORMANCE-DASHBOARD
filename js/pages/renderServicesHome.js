function renderServicesHome(){
  // Querystring: ?team=all|express|kia&focus=asr|sold
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  let teamKey = "all";
  let focus = "asr";
  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      if(k==="team") teamKey = decodeURIComponent(v||"all") || "all";
      if(k==="focus"){
        const vv = decodeURIComponent(v||"asr") || "asr";
        focus = (vv==="sold") ? "sold" : "asr";
      }
    }
  }

  // Data scope
  const techs = getTechsByTeam(teamKey);
  const storeTechs = getTechsByTeam("all");

  const totalRos = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const avgOdo = totalRos
    ? techs.reduce((s,t)=>s+(Number(t.odo)||0)*(Number(t.ros)||0),0)/totalRos
    : 0;

  const allCats = getAllCategoriesSet();

  // Helpers
  const mean = (arr)=> arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length) : NaN;

  function aggForTechList(serviceName, scopeTechs){
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

  function storeBench(serviceName){
    // Store benchmarks: average of per-tech ratios (same logic used in tech detail)
    const reqs=[], closes=[];
    let topReq=-1, topReqName="—";
    let topClose=-1, topCloseName="—";
    for(const t of storeTechs){
      const c = (t.categories||{})[serviceName];
      if(!c) continue;
      const r = Number(c.req);
      const cl = Number(c.close);
      if(Number.isFinite(r)) reqs.push(r);
      if(Number.isFinite(cl)) closes.push(cl);
      if(Number.isFinite(r) && r>topReq){ topReq=r; topReqName=t.name||"—"; }
      if(Number.isFinite(cl) && cl>topClose){ topClose=cl; topCloseName=t.name||"—"; }
    }
    return {
      avgReq: reqs.length ? mean(reqs) : NaN,
      avgClose: closes.length ? mean(closes) : NaN,
      topReq: topReq>=0 ? topReq : NaN,
      topReqName,
      topClose: topClose>=0 ? topClose : NaN,
      topCloseName
    };
  }

  // Build overall stats across *all* services
  const allServiceKeys = Array.from(allCats);
  const overallAggs = allServiceKeys.map(k=> aggForTechList(k, techs));
  const overallAvgReq = overallAggs.length ? mean(overallAggs.map(x=>x.reqTot).filter(n=>Number.isFinite(n))) : NaN;
  const overallAvgClose = overallAggs.length ? mean(overallAggs.map(x=>x.closeTot).filter(n=>Number.isFinite(n))) : NaN;

  // Filters UI (keep existing pattern)
  const filtersKey = "_services_home";
  const open = !!(UI.groupFilters && UI.groupFilters[filtersKey]);
  const filters = `
    <div class="iconBar">
      <button class="iconBtn" onclick="toggleGroupFilters('${filtersKey}')" aria-label="Filters" title="Filters">${ICON_FILTER}</button>
      <button class="iconBtn" onclick="openTechSearch()" aria-label="Search" title="Search">${ICON_SEARCH}</button>
    </div>
    <div class="ctlPanel ${open?'open':''}">
      <div class="filtersRow">
        <div class="filter">
          <div class="smallLabel">Team</div>
          <select class="sel" id="svcTeam">
            <option value="all" ${teamKey==="all"?"selected":""}>All</option>
            <option value="express" ${teamKey==="express"?"selected":""}>Express</option>
            <option value="kia" ${teamKey==="kia"?"selected":""}>Kia</option>
          </select>
        </div>
        <div class="filter">
          <div class="smallLabel">Focus</div>
          <select class="sel" id="svcFocus">
            <option value="asr" ${focus==="asr"?"selected":""}>ASR/RO</option>
            <option value="sold" ${focus==="sold"?"selected":""}>Sold%</option>
          </select>
        </div>
      </div>
    </div>
  `;

  // Tech list (same format as group/category pages)
  function techListFor(serviceAgg){
    const rows = (serviceAgg.techRows||[]).slice().sort((a,b)=>{
      return focus==="sold" ? (b.close - a.close) : (b.req - a.req);
    });

    const metricLbl = (focus==="sold") ? "Sold%" : "ASR%";
    return rows.map((r, idx)=>{
      const rank = idx + 1;
      const metric = (focus==="sold") ? r.close : r.req;
      const metricFmt = fmtPct(metric);
      const link = `#/tech/${encodeURIComponent(r.id)}`;
      return `
        <a class="techRow" href="${link}" style="text-decoration:none;color:inherit">
          <div class="techRowLeft">
            <span class="rankNum">${rank}.</span>
            <span class="techName">${safe(r.name)}</span>
          </div>
          <div class="mini">${metricLbl} <b>${metricFmt}</b></div>
        </a>
      `;
    }).join("");
  }

  function serviceCard(catKey){
    const name = (typeof catLabel==="function") ? catLabel(catKey) : String(catKey);
    const agg = aggForTechList(catKey, techs);
    const bench = storeBench(catKey);

    const req = Number(agg.reqTot);
    const close = Number(agg.closeTot);

    const goalReq = Number(getGoal(catKey,"req"));
    const goalClose = Number(getGoal(catKey,"close"));

    const pctGoalReq = (Number.isFinite(req) && Number.isFinite(goalReq) && goalReq>0) ? (req/goalReq) : NaN;
    const pctGoalClose = (Number.isFinite(close) && Number.isFinite(goalClose) && goalClose>0) ? (close/goalClose) : NaN;

    const pctStoreReq = (Number.isFinite(req) && Number.isFinite(bench.avgReq) && bench.avgReq>0) ? (req/bench.avgReq) : NaN;
    const pctStoreClose = (Number.isFinite(close) && Number.isFinite(bench.avgClose) && bench.avgClose>0) ? (close/bench.avgClose) : NaN;

    function bandClass(pct){
      if(!Number.isFinite(pct)) return "bandNeutral";
      if(pct >= 0.80) return "bandGood";
      if(pct >= 0.60) return "bandWarn";
      return "bandBad";
    }

    // Header gauge follows focus vs store avg
    const hdrPct = (focus==="sold") ? pctStoreClose : pctStoreReq;
    const gaugeHtml = Number.isFinite(hdrPct)
      ? `<div class="svcGaugeWrap" style="--sz:72px">${svcGauge(hdrPct, (focus==="sold"?"Sold%":"ASR%"))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:72px"></div>`;

    const compareLabel = "Store Avg";

    const asrBlock = `
      <div class="metricBlock">
        <div class="mbLeft">
          <div class="mbKicker">ASR/RO%</div>
          <div class="mbStat ${bandClass(pctStoreReq)}">${fmtPct(req)}</div>
        </div>
        <div class="mbRight">
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(bench.avgReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctStoreReq)? svcGauge(pctStoreReq):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalReq)? svcGauge(pctGoalReq):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Top Performer</div>
              <div class="mbSub">(${safe(bench.topReqName||"—")})</div>
              <div class="mbNum">${fmtPct(bench.topReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px"></div>
          </div>
        </div>
      </div>
    `;

    const soldBlock = `
      <div class="metricBlock">
        <div class="mbLeft">
          <div class="mbKicker">SOLD%</div>
          <div class="mbStat ${bandClass(pctStoreClose)}">${fmtPct(close)}</div>
        </div>
        <div class="mbRight">
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(bench.avgClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctStoreClose)? svcGauge(pctStoreClose):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalClose)? svcGauge(pctGoalClose):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Top Performer</div>
              <div class="mbSub">(${safe(bench.topCloseName||"—")})</div>
              <div class="mbNum">${fmtPct(bench.topClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px"></div>
          </div>
        </div>
      </div>
    `;

    const roPill = `<div class="pill small"><div class="k">ROs</div><div class="v">${fmtInt(agg.totalRos)}</div></div>`;

    const techList = techListFor(agg) || `<div class="notice">No tech data</div>`;

    return `
      <div class="card serviceCard" id="svc-${safeId(catKey)}">
        <div class="svcHead">
          <div class="svcLeft">
            <div class="svcName">${safe(name)}</div>
            <div class="svcSub">${roPill}</div>
          </div>
          <div class="svcRight">
            ${gaugeHtml}
          </div>
        </div>

        <div class="svcBody">
          <div class="svcMetrics">
            ${asrBlock}
            ${soldBlock}
          </div>

          <div class="svcTechList">
            <div class="sub" style="margin:8px 2px 8px;font-weight:900;color:var(--muted)">Technicians</div>
            <div class="techList">
              ${techList}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function safeId(s){
    return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
  }

  // Render sections like technician details page
  const applied = `${teamKey.toUpperCase()} • ${focus==="sold"?"SOLD%":"ASR/RO"}`;

  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const cats = Array.from(new Set((sec.categories||[]).filter(Boolean))).filter(c=>allCats.has(c));
    if(!cats.length) return "";

    // section-level summary
    const aggs = cats.map(k=> aggForTechList(k, techs));
    const secAvgReq = mean(aggs.map(x=>x.reqTot).filter(n=>Number.isFinite(n)));
    const secAvgClose = mean(aggs.map(x=>x.closeTot).filter(n=>Number.isFinite(n)));

    const dialPct = (focus==="sold")
      ? ((Number.isFinite(secAvgClose) && Number.isFinite(overallAvgClose) && overallAvgClose>0) ? (secAvgClose/overallAvgClose) : NaN)
      : ((Number.isFinite(secAvgReq) && Number.isFinite(overallAvgReq) && overallAvgReq>0) ? (secAvgReq/overallAvgReq) : NaN);

    const dial = Number.isFinite(dialPct)
      ? `<div class="svcGaugeWrap" style="--sz:112px">${svcGauge(dialPct, (focus==="sold"?"Sold":"ASR"))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:112px"></div>`;

    const cards = cats.map(k=>serviceCard(k)).join("");

    return `
      <div class="panel sectionFrame">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div class="h2 techH2">${safe(sec.name||"Section")}</div>
              <div class="sub">${safe(applied)}</div>
            </div>
            <div class="secHdrRight">
              <div class="secFocusDial">${dial}</div>
              <div class="secHdrStats" style="text-align:right">
                <div class="big">${fmtPct(secAvgReq)}</div>
                <div class="tag">ASR%</div>
                <div style="margin-top:6px;text-align:right;color:var(--muted);font-weight:900;font-size:13px">Sold%: <b style="color:var(--text)">${fmtPct(secAvgClose)}</b></div>
              </div>
            </div>
          </div>
        </div>
        <div class="list">
          <div class="categoryGrid">
            ${cards}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Header like tech details page
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
            <div class="big">${fmtPct(overallAvgReq)}</div>
            <div class="tag">Avg ASR/RO (All Services)</div>
            <div class="overallMetric">${fmtPct(overallAvgClose)}</div>
            <div class="tag">Avg Sold% (All Services)</div>
          </div>
        </div>

        <div class="pills">
          <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
          <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
          <div class="pill"><div class="k">Services</div><div class="v">${fmtInt(allServiceKeys.length)}</div></div>
        </div>

        ${filters}
      </div>
    </div>

    ${sectionsHtml}
  `;

  const teamSel = document.getElementById("svcTeam");
  const focusSel = document.getElementById("svcFocus");
  const updateHash = ()=>{
    location.hash = `#/services?team=${encodeURIComponent(teamSel.value)}&focus=${encodeURIComponent(focusSel.value)}`;
  };
  if(teamSel && focusSel){
    teamSel.addEventListener("change", updateHash);
    focusSel.addEventListener("change", updateHash);
  }
}

window.renderServicesHome = renderServicesHome;
