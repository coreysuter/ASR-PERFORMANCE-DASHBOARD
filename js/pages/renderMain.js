function renderMain(){
  const app=document.getElementById('app');

  // Main header filters are always visible (no collapse)

  // keep Express/Kia in sync
  if(state && state.EXPRESS && state.KIA){
    state.KIA.filterKey = state.EXPRESS.filterKey;
    state.KIA.sortBy = state.EXPRESS.sortBy;
    if(state.EXPRESS.goalMetric !== undefined) state.KIA.goalMetric = state.EXPRESS.goalMetric;
    if(state.EXPRESS.compare !== undefined) state.KIA.compare = state.EXPRESS.compare;
  }

  const techs = (typeof DATA !== 'undefined' && Array.isArray(DATA.techs))
    ? DATA.techs.filter(t=>t && (t.team==="EXPRESS" || t.team==="KIA"))
    : [];

  const totalRos = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const avgOdo = totalRos
    ? techs.reduce((s,t)=>s+(Number(t.odo)||0)*(Number(t.ros)||0),0)/totalRos
    : 0;
  const totalAsr = techs.reduce((s,t)=>s+(Number(t.summary?.total?.asr)||0),0);
  const totalSold = techs.reduce((s,t)=>s+(Number(t.summary?.total?.sold)||0),0);
  const asrPerRo = totalRos ? (totalAsr/totalRos) : null;
  const soldPerRo = totalRos ? (totalSold/totalRos) : null;

  
  const soldPerAsr = totalAsr ? (totalSold/totalAsr) : null;
const st = state?.EXPRESS || {filterKey:"total", sortBy:"asr_per_ro", goalMetric:"asr", compare:"team"};
  const focusIsGoal = st.sortBy === "goal";
  const goalMetric = (st.goalMetric === "sold") ? "sold" : "asr";
  // If Focus=GOAL, force Comparison=GOAL (and keep both teams in sync)
  if(focusIsGoal){
    state.EXPRESS.compare = "goal";
    state.KIA.compare = "goal";
  }
  // Comparison mode (forced to GOAL when Focus=GOAL)
  const compareMode = focusIsGoal ? "goal" : ((st.compare === "store") ? "store" : (st.compare === "goal" ? "goal" : "team"));
  const appliedTextHtml = "";

  // Top-right status block shows the Focus stat on top (bigger/white), non-focus below (smaller/grey)
  const focusIsSold = st.sortBy === "sold_pct";
  // (focusIsGoal defined above)
  const topStatVal = focusIsSold ? soldPerRo : asrPerRo;
  const topStatLbl = focusIsSold ? "Sold/RO" : "ASRs/RO";
  const subStatVal = focusIsSold ? asrPerRo : soldPerRo;
  const subStatLbl = focusIsSold ? "ASRs/RO" : "Sold/RO";

  const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <style>
          /* Keep pills in the top row and prevent overlap with the title */
          .techHeaderPanel .techDashTopRow{flex-wrap:nowrap !important;}
          .techHeaderPanel .techH2Big{flex:0 0 auto !important;}
          .techHeaderPanel .pills{flex-wrap:nowrap !important;white-space:nowrap !important;flex:0 0 auto !important;}

          /* Tech header stat pills sizing (requested) */
          .techHeaderPanel .pills .pill .v{font-size:24px !important;line-height:1.05 !important;}
          .techHeaderPanel .pills .pill .k{font-size:16px !important;line-height:1.05 !important;color:rgba(255,255,255,.55) !important;}

          /* Make the header filters 30% wider than the base app.css sizing */
          .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen select{
            min-width:152px !important;
            max-width:237px !important;
          }
        </style>
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>
          
          <div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;justify-content:flex-start">
              <div class="h2 techH2Big">Technician Dashboard</div>
            <div class="pills" style="margin-left:34px;display:flex;gap:12px;flex-wrap:nowrap;white-space:nowrap;flex:0 0 auto">
              <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
          <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
          <div class="pill"><div class="k">ASRs/RO</div><div class="v">${asrPerRo===null ? "—" : fmt1(asrPerRo,1)}</div></div>
          <div class="pill"><div class="k">Sold/RO</div><div class="v">${soldPerRo===null ? "—" : fmt1(soldPerRo,2)}</div></div>
            </div>
            </div>
            <div class="techTeamLine">EXPRESS <span class="teamDot">•</span> KIA</div>
          </div>
          <div class="overallBlock">
            <!-- app.css hides .overallBlock .big with !important; use a different class name -->
            <div class="bigMain" style="font-size:38px;line-height:1.05;color:#fff;font-weight:1000">
              ${topStatVal===null ? "—" : (focusIsSold ? fmt1(topStatVal,2) : fmt1(topStatVal,1))}
            </div>
            <div class="tag">${topStatLbl}</div>

            <div class="overallMetric" style="font-size:28px;line-height:1.05;color:#fff;font-weight:1000">
              ${subStatVal===null ? "—" : (focusIsSold ? fmt1(subStatVal,1) : fmt1(subStatVal,2))}
            </div>
            <div class="tag">${subStatLbl}</div>
          </div>
        </div>

        <div class="mainFiltersBar">
          <div class="controls mainAlwaysOpen">
            <div>
              <label>Filter</label>
              <select data-scope="main" data-ctl="filter">
                <option value="total" ${st.filterKey==="total"?"selected":""}>With Fluids (Total)</option>
                <option value="without_fluids" ${st.filterKey==="without_fluids"?"selected":""}>Without Fluids</option>
                <option value="fluids_only" ${st.filterKey==="fluids_only"?"selected":""}>Fluids Only</option>
              </select>
            </div>
            <div>
              <label>Focus</label>
              <select data-scope="main" data-ctl="sort">
                <option value="asr_per_ro" ${st.sortBy==="asr_per_ro"?"selected":""}>ASR/RO (default)</option>
                <option value="sold_pct" ${st.sortBy==="sold_pct"?"selected":""}>Sold</option>
                <option value="goal" ${st.sortBy==="goal"?"selected":""}>GOAL</option>
              </select>
            </div>
            ${focusIsGoal ? `
            <div>
              <label>Goal</label>
              <select data-scope="main" data-ctl="goal">
                <option value="asr" ${goalMetric==="asr"?"selected":""}>ASR</option>
                <option value="sold" ${goalMetric==="sold"?"selected":""}>Sold</option>
              </select>
            </div>
            <div>
              <label>Comparison</label>
              <select data-scope="main" data-ctl="compare" disabled style="opacity:.55;filter:grayscale(1);cursor:not-allowed">
                <option value="team">TEAM</option>
                <option value="store">STORE</option>
                <option value="goal" selected>GOAL</option>
              </select>
            </div>
            ` : `
            <div>
              <label>Comparison</label>
              <select data-scope="main" data-ctl="compare">
                <option value="team" ${compareMode==="team"?"selected":""}>TEAM</option>
                <option value="store" ${compareMode==="store"?"selected":""}>STORE</option>
                <option value="goal" ${compareMode==="goal"?"selected":""}>GOAL</option>
              </select>
            </div>
            `}
          </div>
          <button class="iconBtn pushRight" onclick="openTechSearch()" aria-label="Search" title="Search">${typeof ICON_SEARCH!=='undefined' ? ICON_SEARCH : '🔎'}</button>
        </div>
      </div>
    </div>
  `;

  app.innerHTML = `${header}<div class="teamsGrid">${renderTeam("EXPRESS", state.EXPRESS)}${renderTeam("KIA", state.KIA)}</div>`;

  document.querySelectorAll('[data-ctl]').forEach(el=>{
    const ctl=el.getAttribute('data-ctl');
    const scope=el.getAttribute('data-scope');
    const team=el.getAttribute('data-team');

    const apply=()=>{
      if(scope==="main"){
        if(ctl==="filter"){ state.EXPRESS.filterKey=el.value; state.KIA.filterKey=el.value; }
        if(ctl==="sort"){ state.EXPRESS.sortBy=el.value; state.KIA.sortBy=el.value; }
        if(ctl==="goal"){ state.EXPRESS.goalMetric=el.value; state.KIA.goalMetric=el.value; }
        if(ctl==="compare"){ state.EXPRESS.compare=el.value; state.KIA.compare=el.value; }
      } else if(team && state[team]){
        const st=state[team];
        if(ctl==="filter") st.filterKey=el.value;
        if(ctl==="sort") st.sortBy=el.value;
        if(ctl==="goal") st.goalMetric=el.value;
        if(ctl==="compare") st.compare=el.value;
        if(ctl==="search") st.search=el.value;
      }
      renderMain();
    };
    el.addEventListener('change', apply);
    el.addEventListener('input', apply);
  });
}

// Filters are always visible; no toggle.

function buildTeamCategoryStats(team){
  const techs = byTeam(team);
  const stats = {}; // cat -> {avgReq, topReq, topTech, avgClose}
  const cats = new Set();
  for(const t of techs){
    for(const k of Object.keys(t.categories||{})) cats.add(k);
  }
  for(const cat of cats){
    const reqs=[], closes=[];
    let topReq=-1, topTech=null;
    for(const t of techs){
      const c=t.categories?.[cat];
      const req=Number(c?.req);
      if(Number.isFinite(req)){
        reqs.push(req);
        if(req>topReq){ topReq=req; topTech=t.name; }
      }
      const cl=Number(c?.close);
      if(Number.isFinite(cl)) closes.push(cl);
    }
    stats[cat]={
      avgReq: reqs.length ? reqs.reduce((a,b)=>a+b,0)/reqs.length : null,
      topReq: topReq>=0 ? topReq : null,
      topTech,
      avgClose: closes.length ? closes.reduce((a,b)=>a+b,0)/closes.length : null,
    };
  }
  return stats;
}

function bandClass(val, base){
    if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) return "";
    const pct = val/base;
    if(pct>=0.80) return "bGreen";
    if(pct>=0.60) return "bYellow";
    return "bRed";
  }function renderROListForTech(techId, query){
  const t = (DATA.techs||[]).find(x=>x.id===techId);
  const ros = (DATA.ros_by_tech||{})[techId] || [];
  const q = (query||"").toLowerCase().trim();

  const filtered = !q ? ros : ros.filter(r=>{
    const a = (r.sold_text||"").toLowerCase();
    const b = (r.unsold_text||"").toLowerCase();
    return a.includes(q) || b.includes(q);
  });

  const rows = filtered.map(r=>`
    <div class="techRow">
      <div class="rowGrid" style="grid-template-columns: 1.2fr 1fr 1fr 1fr;gap:10px">
        <div class="cell"><span class="lbl">RO#</span><span class="val">${safe(r.ro||"—")}</span></div>
        <div class="cell"><span class="lbl">RO Date</span><span class="val">${safe(r.ro_date||"—")}</span></div>
        <div class="cell"><span class="lbl">Miles</span><span class="val">${fmtInt(r.miles)}</span></div>
        <div class="cell"><span class="lbl">Hrs</span><span class="val">${fmt1(r.hrs,1)}</span></div>
      </div>
      <div style="margin-top:8px;color:var(--muted);font-size:12px;line-height:1.35">
        <div><b>Sold:</b> ${safe(r.sold_text||"")}</div>
        <div><b>Unsold:</b> ${safe(r.unsold_text||"")}</div>
      </div>
    </div>
  `).join("");

  document.getElementById('app').innerHTML = `
    <div class="panel">
      <div class="phead">
        <div class="titleRow">
          <div>
            <div class="h2">ROs • ${safe(t?.name||"Unknown")}</div>
            <div class="sub"><a href="#/tech/${encodeURIComponent(techId)}" style="text-decoration:none">← Back to technician</a></div>
          </div>
          <div style="text-align:right">
            <div class="big">${filtered.length.toLocaleString()}</div>
            <div class="tag">Matching ROs</div>
          </div>
        </div>
        <div class="sub" style="margin-top:10px">Filter term: <b>${safe(query||"(none)")}</b> (matches Sold/Unsold lines text)</div>
      </div>
      <div class="list">${rows || `<div class="notice">No ROs matched this category term.</div>`}</div>
    </div>
  `;
}


window.renderMain = renderMain;
