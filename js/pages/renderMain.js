function renderMain(){

// Dashboard-only style overrides (must run after base.css injections)
(function ensureTechDashOverrides(){
  const id = "techDashOverrides";
  let el = document.getElementById(id);
  if(!el){
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = `
    /* Scope EVERYTHING to main technician dashboard only */
    /* Add breathing room so the header panel never visually overlaps the two team panels */
    .pageTechDash .techHeaderPanel{
      margin-bottom:14px !important;
      position:relative !important;
      z-index:2 !important;
    }
    .pageTechDash .teamsGrid{position:relative !important; z-index:1 !important; margin-top:22px;}

    .pageTechDash .techRow .techNameStats .tnLbl{
      font-size:11px !important;
      line-height:1.05 !important;
      text-transform:none !important;
      letter-spacing:.2px !important;
    }
    .pageTechDash .techRow .techNameStats .tnVal{
      font-size:15px !important;
      line-height:1.05 !important;
    }
  `;
})();

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

<!-- Header stage: padding-left carves out room for the floating box -->
<div class="techNotchStage" style="position:relative; width:100%; overflow:visible;">

  <!-- Floating menu box — sits outside the header to the left -->
  <div class="panel techMenuFloat" style="
    position:absolute;
    left:-80px;
    top:4px;
    width:72px;
    height:72px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:14px;
    z-index:2;
  ">
    <label for="menuToggle" class="hamburgerMini" aria-label="Menu" style="
      font-size:2.2em;
      line-height:1;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      color:inherit;
      user-select:none;
    ">☰</label>
  </div>

  <div class="panel techHeaderPanel" style="
    width:100%;
    min-width:0;
  ">
      <div class="phead">
        <style>
          /* Align title row to top, not bottom */
          .techHeaderPanel .techTitleRow{align-items:flex-start !important;}

          /* Keep pills in the top row and prevent overlap with the title */
          .techHeaderPanel .techDashTopRow{display:flex !important;flex-wrap:nowrap !important;align-items:center !important;}
          .techHeaderPanel .techH2Big{flex:0 0 auto !important;white-space:nowrap !important;font-size:32px !important;font-weight:1000 !important;line-height:1.05 !important;}
          .techHeaderPanel .pills{flex-wrap:nowrap !important;white-space:nowrap !important;flex:0 0 auto !important;}

          /* Tech header stat pills sizing (requested) */
          .techHeaderPanel .pills .pill .v{font-size:22px !important;line-height:1.05 !important;}
          .techHeaderPanel .pills .pill .k{font-size:18px !important;line-height:1.05 !important;color:rgba(255,255,255,.55) !important;text-transform:none !important;}

          /* Make the header filters 30% wider than the base app.css sizing */
          .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen select{
            min-width:152px !important;
            max-width:237px !important;
          }

          /* Dropdown text colors */
          .techHeaderPanel .mainFiltersBar select{color:#fff !important;}
          .techHeaderPanel .mainFiltersBar select option{color:#000 !important;}

        </style>
        <div class="titleRow techTitleRow">
<div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;justify-content:flex-start">
              <div class="techH2Big">Technician Dashboard</div>
            <div class="pills" style="margin-left:34px;display:flex;gap:12px;flex-wrap:nowrap;white-space:nowrap;flex:0 0 auto">
              <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
              <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
              <div class="pill"><div class="k">ASRs</div><div class="v">${fmtInt(totalAsr)}</div></div>
              <div class="pill"><div class="k">Sold</div><div class="v">${fmtInt(totalSold)}</div></div>
              <div class="pill"><div class="k">Sold/ASRs</div><div class="v">${soldPerAsr===null ? "—" : fmtPct(soldPerAsr)}</div></div>
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

            <div class="overallMetric" style="font-size:26px;line-height:1.05;color:#fff;font-weight:1000">
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
                <option value="asr_per_ro" ${st.sortBy==="asr_per_ro"?"selected":""}>ASR/RO</option>
                <option value="sold_pct" ${st.sortBy==="sold_pct"?"selected":""}>Sold</option>
                <option value="goal" ${st.sortBy==="goal"?"selected":""}>Goal</option>
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
                <option value="team">Team</option>
                <option value="store">Store</option>
                <option value="goal" selected>Goal</option>
              </select>
            </div>
            ` : `
            <div>
              <label>Comparison</label>
              <select data-scope="main" data-ctl="compare">
                <option value="team" ${compareMode==="team"?"selected":""}>Team</option>
                <option value="store" ${compareMode==="store"?"selected":""}>Store</option>
                <option value="goal" ${compareMode==="goal"?"selected":""}>Goal</option>
              </select>
            </div>
            `}
          </div>
          <button class="iconBtn pushRight" onclick="openTechSearch()" aria-label="Search" title="Search" style="display:none">${typeof ICON_SEARCH!=='undefined' ? ICON_SEARCH : '🔎'}</button>
        </div>
      </div>
    </div>

  <!-- Heartbeat accent on techHeaderPanel -->
  <svg viewBox="0 0 120 48" width="113" height="45" style="position:absolute;bottom:-19px;right:18px;overflow:visible;pointer-events:none;z-index:5;" aria-hidden="true"><rect x="0" y="27" width="120" height="3" fill="#0f1730"/><polyline points="0,28 18,28 26,28 32,8 38,44 44,20 50,28 68,28 76,28 82,8 88,44 94,20 100,28 120,28" fill="none" stroke="rgba(200,45,45,.45)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 3px rgba(200,40,40,.22));"/></svg>

</div>
  `;
app.innerHTML = `<div class="pageTechDash">${header}<div class="teamsGrid">${renderTeam("EXPRESS", state.EXPRESS)}${renderTeam("KIA", state.KIA)}</div></div>`;

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

