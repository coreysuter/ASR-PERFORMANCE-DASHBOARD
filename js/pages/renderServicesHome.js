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
      if(k==="focus") focus = decodeURIComponent(v||"asr") || "asr";
    }
  }

  const techs = getTechsByTeam(teamKey);
  const totalRos = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const avgOdo = totalRos ? techs.reduce((s,t)=>s+(Number(t.odo)||0)*(Number(t.ros)||0),0)/totalRos : 0;

  const allCats = getAllCategoriesSet();
  const groupKeys = Object.keys(GROUPS||{}).sort((a,b)=>String(a).localeCompare(String(b)));

  function groupStats(key){
    const g = GROUPS[key];
    const services = (g?.services||[]).filter(s=>allCats.has(s));
    if(!services.length){
      return {avgReq:null, avgClose:null, svcCount:0};
    }
    let reqSum=0, closeSum=0, nReq=0, nClose=0;
    for(const svc of services){
      // aggregate across techs
      let asr=0, sold=0;
      for(const t of techs){
        const c = (t.categories||{})[svc];
        asr += Number(c?.asr)||0;
        sold += Number(c?.sold)||0;
      }
      const req = totalRos ? (asr/totalRos) : null;
      const close = asr ? (sold/asr) : null;
      if(Number.isFinite(req)){ reqSum+=req; nReq++; }
      if(Number.isFinite(close)){ closeSum+=close; nClose++; }
    }
    return {
      avgReq: nReq ? (reqSum/nReq) : null,
      avgClose: nClose ? (closeSum/nClose) : null,
      svcCount: services.length
    };
  }

  const tiles = groupKeys.map(key=>{
    const g = GROUPS[key];
    const s = groupStats(key);
    const link = `#/group/${encodeURIComponent(key)}?team=${encodeURIComponent(teamKey)}&focus=${encodeURIComponent(focus)}`;
    const v1 = focus==="sold" ? fmtPct(s.avgClose) : fmtPctPlain(s.avgReq);
    const v2 = focus==="sold" ? fmtPctPlain(s.avgReq) : fmtPct(s.avgClose);
    const l1 = focus==="sold" ? "Avg Sold%" : "Avg ASR/RO";
    const l2 = focus==="sold" ? "Avg ASR/RO" : "Avg Sold%";
    return `
      <a class="catCard serviceCard" href="${link}" style="text-decoration:none;color:inherit">
        <div class="catHeader">
          <div>
            <div class="catTitle">${safe(g?.label||key)}</div>
            <div class="catCounts">${fmtInt(s.svcCount)} services</div>
          </div>
          <div class="catRank">
            <div class="rankNum">→</div>
            <div class="rankLbl">OPEN</div>
          </div>
        </div>
        <div class="techTilesRow">
          <div class="statTile t3">
            <div class="tLbl">${safe(l1)}</div>
            <div class="tVal">${v1}</div>
          </div>
          <div class="statTile t4">
            <div class="tLbl">${safe(l2)}</div>
            <div class="tVal">${v2}</div>
          </div>
        </div>
      </a>
    `;
  }).join("");

  const filters = `
    <div class="iconBar">
      <button class="iconBtn" onclick="toggleGroupFilters('_services_home')" aria-label="Filters" title="Filters">${ICON_FILTER}</button>
      <button class="iconBtn" onclick="openTechSearch()" aria-label="Search" title="Search">${ICON_SEARCH}</button>
    </div>
    <div class="ctlPanel ${(UI.groupFilters['_services_home'])?'open':''}">
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

  document.getElementById("app").innerHTML = `
    <div class="panel">
      <div class="phead">
        <div class="titleRow">
          <div>
            <div class="h2">SERVICES</div>
            <div class="sub"><a href="#/" style="text-decoration:none">← Back to technician dashboard</a></div>
          </div>
          <div>
            <div class="big">${fmtInt(totalRos)}</div>
            <div class="tag">ROs (Selected Team)</div>
          </div>
        </div>
        <div class="pills">
          <div class="pill"><div class="k">Team</div><div class="v">${safe(teamKey.toUpperCase())}</div></div>
          <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
        </div>
        ${filters}
      </div>
    </div>
    <div class="sectionFrame">
      <div class="categoryGrid">${tiles}</div>
    </div>
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
