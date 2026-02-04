function renderCategoryRectSafe(cat, compareBasis){
  try{
    return renderCategoryRectSafe(cat, compareBasis);
  }catch(e){
    console.error('renderCategoryRect error', cat, e);
    const eh = (s)=>String(s==null?'':s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const msg = eh(e && e.message ? e.message : String(e));
    const catName = eh(cat || 'Service');
    return `
      <div class="card serviceCard" style="border:1px solid rgba(255,255,255,.08)">
        <div class="svcHead" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div class="svcName">${catName}</div>
          <div class="pill" style="opacity:.65">Error</div>
        </div>
        <div style="padding:12px 12px 14px;color:#fca5a5;font-size:12px;line-height:1.3">
          Service tile failed to render: <span style="color:#fee2e2">${msg}</span>
        </div>
      </div>
    `;
  }
}


function populateAsrMenuLinks(){
  const host = document.getElementById("asrMenuLinks");
  if(!host) return;
  const secs = Array.isArray(DATA.sections) ? DATA.sections : [];
  const links = [];
  for(const sec of secs){
    const name = String(sec?.name || "").trim();
    if(!name) continue;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    links.push(`<a class="menuLink" href="#/group/${encodeURIComponent(key)}">${safe(name)}</a>`);
  }
  host.innerHTML = links.join("");
}

// Lazily computed caches (DATA-based; no dependency on tech page helpers)
let __ALL_TECHS = null;
function getAllTechsCached(){
  if(__ALL_TECHS) return __ALL_TECHS;
  const techs = (typeof DATA!=='undefined' && Array.isArray(DATA.techs)) ? DATA.techs : [];
  // Only Express + Kia are in this project
  __ALL_TECHS = techs.filter(t => (t.team==="EXPRESS" || t.team==="KIA"));
  return __ALL_TECHS;
}
let __ALL_CATS = null;
function getAllCategoriesSet(){
  if(__ALL_CATS) return __ALL_CATS;
  const set = new Set();
  for(const t of getAllTechsCached()){
    const cats = t.categories || {};
    for(const k of Object.keys(cats)) set.add(k);
  }
  __ALL_CATS = set;
  return set;
}

function getTechsByTeam(teamKey){

  const techs = getAllTechsCached();
  if(teamKey==="all") return techs.slice();
  return techs.filter(t => (t.team||"").toLowerCase() === teamKey);
}

function aggService(serviceName, teamKey){
  const techs = getTechsByTeam(teamKey);
  const totalRos = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  let asr=0, sold=0;
  const rows=[];
  for(const t of techs){
    const c = (t.categories||{})[serviceName];
    if(!c) continue;
    const a = Number(c.asr)||0;
    const so = Number(c.sold)||0;
    asr += a; sold += so;
    const req = totalRos ? (a/totalRos) : 0;   // share of total ROs
    const close = a ? (so/a) : 0;
    rows.push({id:t.id, name:t.name, req, close});
  }
  const reqTot = totalRos ? (asr/totalRos) : 0;
  const closeTot = asr ? (sold/asr) : 0;
  return {serviceName, totalRos, asr, sold, reqTot, closeTot, techRows: rows};
}

function renderGroupPage(groupKey){
  const g = GROUPS[groupKey];
  if(!g){
    document.getElementById("app").innerHTML = `<div class="panel"><div class="h2">Unknown page</div><div class="sub"><a href="#/">Back</a></div></div>`;
    return;
  }

  // read querystring from hash
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  let teamKey = "all";
  let focus = "asr"; // asr | sold
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

  // Only include services that actually exist in DATA
  const allCats = getAllCategoriesSet();
  const services = g.services.filter(s => allCats.has(s));

  // Aggregate per service across the selected team
  const serviceAggs = services.map(serviceName=>{
    let asr=0, sold=0;
    // for per-tech list
    const techRows = [];
    for(const t of techs){
      const c = (t.categories||{})[serviceName];
      const a = Number(c?.asr)||0;
      const so = Number(c?.sold)||0;
      asr += a; sold += so;
      // per-tech metrics for this service (ratio form, not *100)
      const rosTech = Number(t.ros)||0;
      const req = rosTech ? (a/rosTech) : 0;
      const close = a ? (so/a) : 0;
      techRows.push({id:t.id, name:t.name, ros:rosTech, asr:a, sold:so, req, close});
    }
    const reqTot = totalRos ? (asr/totalRos) : 0;     // ASR/RO (ratio) for team/store/all in this group
    const closeTot = asr ? (sold/asr) : 0;            // Sold%
    return {serviceName, totalRos, asr, sold, reqTot, closeTot, techRows};
  });

  // Summary stats for the group page (average across services)
  const avgReq = serviceAggs.length ? serviceAggs.reduce((s,x)=>s+x.reqTot,0)/serviceAggs.length : 0;
  const avgClose = serviceAggs.length ? serviceAggs.reduce((s,x)=>s+x.closeTot,0)/serviceAggs.length : 0;

  // Rank services by ASR/RO (reqTot)
  const ranked = serviceAggs.slice().sort((a,b)=> (b.reqTot - a.reqTot));
  const rankMap = new Map();
  ranked.forEach((x,i)=>rankMap.set(x.serviceName, {rank:i+1,total:ranked.length}));

  // ---- Top header (same structure as tech detail header) ----
  const title = g.label;
  const gfOpen = !!UI.groupFilters[groupKey];
  const filters = `
    <div class="iconBar">
      <button class="iconBtn" onclick="toggleGroupFilters('${safe(groupKey)}')" aria-label="Filters" title="Filters">${ICON_FILTER}</button>
      <button class="iconBtn" onclick="openTechSearch()" aria-label="Search" title="Search">${ICON_SEARCH}</button>
    </div>
    <div class="ctlPanel ${gfOpen?"open":""}">
      <div class="filtersRow">
        <div class="filter">
          <div class="smallLabel">Team</div>
          <select class="sel" id="grpTeam">
            <option value="all" ${teamKey==="all"?"selected":""}>All</option>
            <option value="express" ${teamKey==="express"?"selected":""}>Express</option>
            <option value="kia" ${teamKey==="kia"?"selected":""}>Kia</option>
          </select>
        </div>
        <div class="filter">
          <div class="smallLabel">Focus</div>
          <select class="sel" id="grpFocus">
            <option value="asr" ${focus==="asr"?"selected":""}>ASR/RO</option>
            <option value="sold" ${focus==="sold"?"selected":""}>Sold%</option>
          </select>
        </div>
      </div>
    </div>
  `;

  const header = `
    <div class="panel">
      <div class="phead">
        <div class="titleRow">
          <div>
            <div class="h2">${safe(title)}</div>
            <div class="sub"><a href="#/" style="text-decoration:none">← Back to dashboard</a></div>
          </div>
          <div>
            <div class="big">${fmt1(avgReq,1)}</div>
            <div class="tag">Avg ASR/RO (Summary)</div>
          </div>
        </div>
        <div class="pills">
          <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
          <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
          <div class="pill"><div class="k">Sold %</div><div class="v">${fmtPct(avgClose)}</div></div>
        </div>
        ${filters}
      </div>
    </div>
  `;

  // ---- Service cards (look like tech detail category cards, but with technician list instead of benchmarks) ----
  function techListFor(service){
  const rows = service.techRows.slice().sort((a,b)=>{
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

  const cards = serviceAggs.map(s=>{
    const rk = rankMap.get(s.serviceName) || {rank:"—",total:"—"};
    const roLink = `#/ros/${encodeURIComponent(s.serviceName)}?team=${encodeURIComponent(teamKey)}`;
    return `
      <div class="catCard serviceCard">
        <div class="catHeader">
          <div>
            <div class="catTitle">${safe(s.serviceName)}</div>
            <div class="catCounts">ROs: <b>${fmtInt(totalRos)}</b> • ASR: <b>${fmtInt(s.asr)}</b> • Sold: <b>${fmtInt(s.sold)}</b></div>
          </div>
          <div class="catRank">${rk.rank} of ${rk.total}<div class="byAsr">ASR/RO%</div></div>
        </div>

        <div class="techTilesRow">
          <div class="statTile t3">
            <div class="tLbl">ASR/RO</div>
            <div class="tVal">${fmtPctPlain(s.reqTot)}</div>
            <div class="goalLine">Goal: ${fmtGoal(getGoal(s.serviceName,"req"))}</div>
          </div>
          <div class="statTile t4">
            <div class="tLbl">Sold%</div>
            <div class="tVal">${fmtPct(s.closeTot)}</div>
            <div class="goalLine">Goal: ${fmtGoal(getGoal(s.serviceName,"close"))}</div>
          </div>
        </div>

        <div class="techList">${techListFor(s) || '<div class="sub">No technicians found.</div>'}</div>

        <div class="roLink"><a href="${roLink}">ROs</a></div>
      </div>
    `;
  }).join("");

  document.getElementById("app").innerHTML = header + `
    <div class="sectionFrame">
      <div class="categoryGrid">${cards}</div>
    </div>
  `;

  // attach listeners
  const teamSel = document.getElementById("grpTeam");
  const focusSel = document.getElementById("grpFocus");
  const updateHash = ()=>{
    const t = teamSel.value;
    const f = focusSel.value;
    location.hash = `#/group/${groupKey}?team=${encodeURIComponent(t)}&focus=${encodeURIComponent(f)}`;
  };
  teamSel.addEventListener("change", updateHash);
  focusSel.addEventListener("change", updateHash);
}


window.renderCategoryRectSafe = renderCategoryRectSafe;
window.renderGroupPage = renderGroupPage;
