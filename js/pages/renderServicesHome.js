function renderServicesHome(){
  // Services Dashboard (Categories + Individual Services)
  try{ document.body.classList.add("route-tech"); }catch(e){}
  try{ document.body.classList.add("route-servicesHome"); }catch(e){}
  try{ document.body.classList.add("route-services"); }catch(e){}

  // Route: #/servicesHome?team=all|express|kia&focus=asr|sold&filter=total|without_fluids|fluids_only&compare=team|store
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";

  let teamKey = "all";
  let focus = "asr";           // asr | sold
  let filterKey = UI.servicesFilterKey || "total";
  let compareBasis = UI.servicesCompareBasis || "team"; // team | store

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

  // Persist last-used dropdown selections
  UI.servicesFilterKey = filterKey;
  UI.servicesCompareBasis = compareBasis;

  const app = document.getElementById("app");
  if(!app) return;

  const teamLabel = (teamKey==="all") ? "ALL" : teamKey.toUpperCase();

  function filterLabel(k){
    return k==="without_fluids" ? "Without Fluids" : (k==="fluids_only" ? "Fluids Only" : "With Fluids (Total)");
  }

  // Data scope (selected team vs store)
  const techs = (typeof getTechsByTeam==="function") ? getTechsByTeam(teamKey) : [];
  const storeTechs = (typeof getTechsByTeam==="function") ? getTechsByTeam("all") : [];
  const compareTechs = (compareBasis==="store") ? storeTechs : techs;

  const totalRos = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const avgOdo = totalRos
    ? techs.reduce((s,t)=>s+(Number(t.odo)||0)*(Number(t.ros)||0),0)/totalRos
    : 0;

  // Aggregate a service key across a set of techs
  function aggFor(serviceName, scopeTechs){
    const totalRosScope = scopeTechs.reduce((s,t)=>s+(Number(t.ros)||0),0);
    let asr=0, sold=0;
    for(const t of scopeTechs){
      const c = (t.categories||{})[serviceName];
      const a = Number(c?.asr)||0;
      const so = Number(c?.sold)||0;
      asr += a;
      sold += so;
    }
    const asrPerRo = totalRosScope ? (asr/totalRosScope) : 0;  // ASRs/RO (ratio form)
    const soldPct  = asr ? (sold/asr) : 0;                     // Sold% (ratio form)
    const soldPerRo = totalRosScope ? (sold/totalRosScope) : 0; // Sold/RO (ratio form)
    return { serviceName, totalRos: totalRosScope, asr, sold, asrPerRo, soldPct, soldPerRo };
  }

  // Safely create keys used for group pages in the existing router
  function sectionKey(name){
    return String(name||"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  }
  function safeSvcId(cat){
    return "svc-" + String(cat||"").toLowerCase()
      .replace(/&/g,"and")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"");
  }

  // Banding for colored pills (vs comparison average)
  function bandOfPct(pct){
    if(!Number.isFinite(pct)) return "neutral";
    if(pct >= 0.80) return "good";
    if(pct >= 0.60) return "warn";
    return "bad";
  }

  function rankBadgeHtml(rank, total, focus, size="sm"){
    const top = (focus==="sold") ? "SOLD%" : "ASR%";
    const r = (rank==null) ? "—" : rank;
    const t = (total==null) ? "—" : total;
    const cls = (size==="sm") ? "rankFocusBadge sm" : "rankFocusBadge";
    return `
      <div class="${cls}">
        <div class="rfbFocus" style="font-weight:1000">${top}</div>
        <div class="rfbMain" style="font-weight:1000"><span class="rfbHash" style="font-weight:1000">#</span>${r}</div>
        <div class="rfbOf" style="font-weight:1000"><span class="rfbOfWord" style="font-weight:1000">of</span><span class="rfbOfNum" style="font-weight:1000">${t}</span></div>
      </div>
    `;
  }

  // -------- CATEGORIES (4 rows: Maintenance/Fluids/Brakes/Tires/etc from DATA.sections) --------
  const sections = Array.isArray(DATA?.sections) ? DATA.sections : [];
  const allCatsSet = (typeof getAllCategoriesSet==="function") ? getAllCategoriesSet() : new Set();
  const allServiceKeys = Array.from(allCatsSet);

  // Keep only categories that exist in DATA.techs categories map
  function catsThatExist(list){
    const exist = new Set(allServiceKeys);
    return (list||[]).filter(c=>exist.has(c));
  }

  function sectionAgg(sec, scopeTechs){
    const cats = catsThatExist(sec?.categories||[]);
    // sum ASR + sold across cats, then compute ratios vs totalRosScope
    const totalRosScope = scopeTechs.reduce((s,t)=>s+(Number(t.ros)||0),0);
    let asr=0, sold=0;
    for(const cat of cats){
      for(const t of scopeTechs){
        const c = (t.categories||{})[cat];
        const a = Number(c?.asr)||0;
        const so = Number(c?.sold)||0;
        asr += a; sold += so;
      }
    }
    const asrPerRo = totalRosScope ? (asr/totalRosScope) : 0;
    const soldPct  = asr ? (sold/asr) : 0;
    const soldPerRo = totalRosScope ? (sold/totalRosScope) : 0;
    return { key: sectionKey(sec?.name), name: String(sec?.name||"Category"), cats, totalRos: totalRosScope, asr, sold, asrPerRo, soldPct, soldPerRo };
  }

  const categoryRows = sections.map(sec=> sectionAgg(sec, techs));
  const compareCategoryRows = sections.map(sec=> sectionAgg(sec, compareTechs));

  // Bench averages for pill banding
  const catAvgAsrPerRo = categoryRows.length ? (categoryRows.reduce((s,x)=>s+(Number(x.asrPerRo)||0),0)/categoryRows.length) : 0;
  const catAvgSoldPct  = categoryRows.length ? (categoryRows.reduce((s,x)=>s+(Number(x.soldPct)||0),0)/categoryRows.length) : 0;

  // Ranking (within the comparison basis)
  function buildRankMap(rows, mode){
    const list = (rows||[]).slice().map(x=>{
      const v = (mode==="sold") ? Number(x.soldPct) : Number(x.asrPerRo);
      return { key: x.key, v };
    }).filter(o=>Number.isFinite(o.v)).sort((a,b)=>b.v-a.v);
    const map = new Map();
    list.forEach((o,i)=> map.set(o.key, { rank: i+1, total: list.length }));
    return map;
  }
  const catRankMap = buildRankMap(compareCategoryRows, focus);

  function categoryRowHtml(row){
    const rk = catRankMap.get(row.key) || {rank:null,total:categoryRows.length};

    const asrBand = bandOfPct(catAvgAsrPerRo>0 ? (row.asrPerRo/catAvgAsrPerRo) : NaN);
    const soldBand = bandOfPct(catAvgSoldPct>0 ? (row.soldPct/catAvgSoldPct) : NaN);

    return `
      <div class="svcListRow">
        <div class="svcLeft">
          <div class="svcNameLine">
            <a class="svcLink" href="#/services/${encodeURIComponent(row.key)}">${safe(row.name)}</a>
          </div>
          <div class="svcSubLine">${safe(row.cats.length)} services</div>
        </div>

        <div class="svcMid">
          <div class="svcPills">
            <div class="pill svcPill ${asrBand}">
              <div class="k">ASRs/RO</div>
              <div class="v">${fmt1(row.asrPerRo,2)}</div>
            </div>
            <div class="pill svcPill ${soldBand}">
              <div class="k">Sold%</div>
              <div class="v">${fmtPct(row.soldPct)}</div>
            </div>
            <div class="pill svcPill neutral">
              <div class="k">Sold/RO</div>
              <div class="v">${fmtPct(row.soldPerRo)}</div>
            </div>
          </div>
        </div>

        <div class="svcRight">
          ${rankBadgeHtml(rk.rank, rk.total, focus, "sm")}
        </div>
      </div>
    `;
  }

  // -------- INDIVIDUAL SERVICES (all categories) --------
  const serviceAggs = allServiceKeys.map(k=> aggFor(k, techs));
  const compareServiceAggs = allServiceKeys.map(k=> aggFor(k, compareTechs));

  const svcAvgAsrPerRo = serviceAggs.length ? (serviceAggs.reduce((s,x)=>s+(Number(x.asrPerRo)||0),0)/serviceAggs.length) : 0;
  const svcAvgSoldPct  = serviceAggs.length ? (serviceAggs.reduce((s,x)=>s+(Number(x.soldPct)||0),0)/serviceAggs.length) : 0;

  const svcRankMap = (function(){
    const list = (compareServiceAggs||[]).map(x=>{
      const v = (focus==="sold") ? Number(x.soldPct) : Number(x.asrPerRo);
      return { key: x.serviceName, v };
    }).filter(o=>Number.isFinite(o.v)).sort((a,b)=>b.v-a.v);
    const map = new Map();
    list.forEach((o,i)=> map.set(o.key, { rank: i+1, total: list.length }));
    return map;
  })();

  function serviceRowHtml(row){
    const rk = svcRankMap.get(row.serviceName) || {rank:null,total:serviceAggs.length};

    const asrBand = bandOfPct(svcAvgAsrPerRo>0 ? (row.asrPerRo/svcAvgAsrPerRo) : NaN);
    const soldBand = bandOfPct(svcAvgSoldPct>0 ? (row.soldPct/svcAvgSoldPct) : NaN);

    const label = (typeof window.catLabel==="function") ? window.catLabel(row.serviceName) : String(row.serviceName);

    return `
      <div class="svcListRow" id="${safeSvcId(row.serviceName)}">
        <div class="svcLeft">
          <div class="svcNameLine">
            <a class="svcLink" href="#/services/${encodeURIComponent(sectionKey(findSectionNameFor(row.serviceName) || ''))}"
              onclick="event.preventDefault(); window.jumpToService && window.jumpToService('${safe(row.serviceName)}'); return false;">
              ${safe(label)}
            </a>
          </div>
          <div class="svcSubLine">ASR ${fmtInt(row.asr)} • Sold ${fmtInt(row.sold)} • ROs ${fmtInt(row.totalRos)}</div>
        </div>

        <div class="svcMid">
          <div class="svcPills">
            <div class="pill svcPill ${asrBand}">
              <div class="k">ASRs/RO</div>
              <div class="v">${fmt1(row.asrPerRo,2)}</div>
            </div>
            <div class="pill svcPill ${soldBand}">
              <div class="k">Sold%</div>
              <div class="v">${fmtPct(row.soldPct)}</div>
            </div>
            <div class="pill svcPill neutral">
              <div class="k">Sold/RO</div>
              <div class="v">${fmtPct(row.soldPerRo)}</div>
            </div>
          </div>
        </div>

        <div class="svcRight">
          ${rankBadgeHtml(rk.rank, rk.total, focus, "sm")}
        </div>
      </div>
    `;
  }

  function findSectionNameFor(cat){
    for(const s of sections){
      const list = s && Array.isArray(s.categories) ? s.categories : [];
      if(list.includes(cat)) return s.name;
    }
    return "";
  }

  // Sort services by focus metric (highest to lowest)
  const sortedServices = serviceAggs.slice().sort((a,b)=>{
    const av = (focus==="sold") ? Number(a.soldPct) : Number(a.asrPerRo);
    const bv = (focus==="sold") ? Number(b.soldPct) : Number(b.asrPerRo);
    return (Number.isFinite(bv)?bv:-1) - (Number.isFinite(av)?av:-1);
  });

  // Header stats (like main)
  const totalAsr = serviceAggs.reduce((s,x)=>s+(Number(x.asr)||0),0);
  const totalSold = serviceAggs.reduce((s,x)=>s+(Number(x.sold)||0),0);
  const asrPerRoAll = totalRos ? (totalAsr/totalRos) : null;
  const soldPerRoAll = totalRos ? (totalSold/totalRos) : null;

  const focusIsSold = focus==="sold";
  const topStatVal = focusIsSold ? soldPerRoAll : asrPerRoAll;
  const topStatLbl = focusIsSold ? "Sold/RO" : "ASRs/RO";
  const subStatVal = focusIsSold ? asrPerRoAll : soldPerRoAll;
  const subStatLbl = focusIsSold ? "ASRs/RO" : "Sold/RO";

  // Build UI
  const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <style>
          /* keep header pills aligned like technician dashboard */
          .techHeaderPanel .techDashTopRow{flex-wrap:nowrap !important;}
          .techHeaderPanel .techH2Big{flex:0 0 auto !important;}
          .techHeaderPanel .pills{flex-wrap:nowrap !important;white-space:nowrap !important;flex:0 0 auto !important;}
          .techHeaderPanel .pills .pill .v{font-size:24px !important;line-height:1.05 !important;}
          .techHeaderPanel .pills .pill .k{font-size:16px !important;line-height:1.05 !important;color:rgba(255,255,255,.55) !important;}
          .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen select{ min-width:152px !important; max-width:237px !important; }
        </style>

        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>

          <div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;justify-content:flex-start">
              <div class="h2 techH2Big">Services Dashboard</div>
              <div class="pills" style="margin-left:34px;display:flex;gap:12px;flex-wrap:nowrap;white-space:nowrap;flex:0 0 auto">
                <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
                <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
                <div class="pill"><div class="k">ASRs/RO</div><div class="v">${asrPerRoAll==null ? "—" : fmt1(asrPerRoAll,2)}</div></div>
                <div class="pill"><div class="k">Sold/RO</div><div class="v">${soldPerRoAll==null ? "—" : fmtPct(soldPerRoAll)}</div></div>
              </div>
            </div>
            <div class="techTeamLine">${safe(teamLabel)} <span class="teamDot">•</span> ${focusIsSold ? "SOLD" : "ASR/RO"}</div>
          </div>

          <div class="overallBlock">
            <div class="bigMain" style="font-size:38px;line-height:1.05;color:#fff;font-weight:1000">
              ${topStatVal==null ? "—" : (focusIsSold ? fmtPct(topStatVal) : fmt1(topStatVal,2))}
            </div>
            <div class="tag">${topStatLbl}</div>

            <div class="overallMetric" style="font-size:28px;line-height:1.05;color:rgba(255,255,255,.55);font-weight:1000">
              ${subStatVal==null ? "—" : (focusIsSold ? fmt1(subStatVal,2) : fmtPct(subStatVal))}
            </div>
            <div class="tag">${subStatLbl}</div>
          </div>
        </div>

        <div class="mainFiltersBar">
          <div class="controls mainAlwaysOpen">
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
            <div>
              <label>Filter</label>
              <select id="svcFilter">
                <option value="total" ${filterKey==="total"?"selected":""}>${filterLabel("total")}</option>
                <option value="without_fluids" ${filterKey==="without_fluids"?"selected":""}>${filterLabel("without_fluids")}</option>
                <option value="fluids_only" ${filterKey==="fluids_only"?"selected":""}>${filterLabel("fluids_only")}</option>
              </select>
            </div>
            <div>
              <label>Comparison</label>
              <select id="svcCompareBasis">
                <option value="team" ${compareBasis==="team"?"selected":""}>Team</option>
                <option value="store" ${compareBasis==="store"?"selected":""}>Store</option>
              </select>
            </div>
          </div>
          <button class="iconBtn pushRight" onclick="openTechSearch()" aria-label="Search" title="Search">${typeof ICON_SEARCH!=='undefined' ? ICON_SEARCH : '🔎'}</button>
        </div>
      </div>
    </div>
  `;

  const catsHtml = categoryRows.map(categoryRowHtml).join("");
  const svcsHtml = sortedServices.map(serviceRowHtml).join("");

  const body = `
    <div class="servicesDashGrid">
      <div class="panel">
        <div class="phead">
          <div class="h2" style="font-size:22px;font-weight:1200;letter-spacing:.2px">Categories</div>
          <div class="sub" style="margin-top:6px">${safe(teamLabel)} • ${safe(compareBasis.toUpperCase())} comparison • ${safe(filterLabel(filterKey))}</div>
        </div>
        <div class="list svcList">
          ${catsHtml || `<div class="notice">No categories found.</div>`}
        </div>
      </div>

      <div class="panel">
        <div class="phead">
          <div class="h2" style="font-size:22px;font-weight:1200;letter-spacing:.2px">Services</div>
          <div class="sub" style="margin-top:6px">Ranked by <b>${focusIsSold ? "Sold%" : "ASRs/RO"}</b></div>
        </div>
        <div class="list svcList">
          ${svcsHtml || `<div class="notice">No services found.</div>`}
        </div>
      </div>
    </div>
  `;

  app.innerHTML = `${header}${body}`;

  // Wire controls (update hash + re-render)
  const updateHash = ()=>{
    const t = document.getElementById("svcTeam");
    const f = document.getElementById("svcFocus");
    const flt = document.getElementById("svcFilter");
    const cb = document.getElementById("svcCompareBasis");

    const teamV = t ? t.value : teamKey;
    const focusV = f ? f.value : focus;
    const filterV = flt ? flt.value : filterKey;
    const compareV = cb ? cb.value : compareBasis;

    UI.servicesFilterKey = filterV;
    UI.servicesCompareBasis = compareV;

    location.hash = `#/servicesHome?team=${encodeURIComponent(teamV)}&focus=${encodeURIComponent(focusV)}&filter=${encodeURIComponent(filterV)}&compare=${encodeURIComponent(compareV)}`;
  };

  ["svcTeam","svcFocus","svcFilter","svcCompareBasis"].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener("change", updateHash);
  });
}

window.renderServicesHome = renderServicesHome;
