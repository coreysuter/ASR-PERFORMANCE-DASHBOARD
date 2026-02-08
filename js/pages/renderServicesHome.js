function renderServicesHome(){
  // Route: #/servicesHome?team=all|express|kia&focus=asr|sold
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

  // Filters UI (matches category pages)
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

  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const cats = Array.from(new Set((sec.categories||[]).filter(Boolean))).filter(c=>allCats.has(c));
    if(!cats.length) return "";
    return `
      <div class="panel sectionFrame">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div class="h2 techH2">${safe(sec.name||"Section")}</div>
              <div class="sub">${safe(applied)}</div>
            </div>
          </div>
        </div>
        <div class="list">
          <div class="categoryGrid">
            ${cats.map(k=>serviceTile(k)).join("")}
          </div>
        </div>
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

  const teamSel = document.getElementById("svcTeam");
  const focusSel = document.getElementById("svcFocus");
  const updateHash = ()=>{
    location.hash = `#/servicesHome?team=${encodeURIComponent(teamSel.value)}&focus=${encodeURIComponent(focusSel.value)}`;
  };
  if(teamSel && focusSel){
    teamSel.addEventListener("change", updateHash);
    focusSel.addEventListener("change", updateHash);
  }
}
window.renderServicesHome = renderServicesHome;
