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

  
  document.body.classList.add('route-tech');
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

  // ---- Triangle badges (red/yellow dial counts) ----
  // We count how many service dials fall into the Warn/Bad bands relative to the
  // group's average, then show them as clickable triangle badges (same SVG as
  // tech details, but sized via CSS on the services page).
  function triSvg(fill, num){
    const n = (num==null ? 0 : Number(num))|0;
    return `
      <svg class="triSvg" viewBox="0 0 120 108" aria-hidden="true" focusable="false">
        <polygon points="60,4 116,104 4,104" fill="${fill}"></polygon>
        <rect x="56" y="26" width="8" height="44" rx="4" fill="#0b0f1a"></rect>
        <circle cx="60" cy="84" r="5" fill="#0b0f1a"></circle>
        <text x="80" y="86" text-anchor="middle" dominant-baseline="middle" class="triNum">${safe(n)}</text>
      </svg>
    `;
  }

  function toSvcId(name){
    return 'svc-' + String(name||'')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'');
  }

  // Jump helper for the group page (so popup items can scroll to the service card)
  window.jumpToGroupService = (serviceName)=>{
    const id = toSvcId(serviceName);
    const el = document.getElementById(id);
    if(!el) return false;
    el.scrollIntoView({behavior:'smooth', block:'start'});
    el.classList.add('flashPick');
    setTimeout(()=>{ const el2=document.getElementById(id); if(el2) el2.classList.remove('flashPick'); }, 900);
    window.__closeTriPop && window.__closeTriPop();
    return false;
  };

  function bandFromPct(pct){
    if(!Number.isFinite(pct)) return "neutral";
    if(pct >= 0.80) return "good";
    if(pct >= 0.60) return "warn";
    return "bad";
  }

  function countBands(which){
    let red=0, yellow=0;
    for(const s of serviceAggs){
      const pct = (which==="sold")
        ? ((Number.isFinite(s.closeTot) && Number.isFinite(avgClose) && avgClose>0) ? (s.closeTot/avgClose) : NaN)
        : ((Number.isFinite(s.reqTot)   && Number.isFinite(avgReq)   && avgReq>0)   ? (s.reqTot/avgReq)     : NaN);
      const b = bandFromPct(pct);
      if(b==="bad") red++;
      else if(b==="warn") yellow++;
    }
    return {red, yellow};
  }

  const asrBands = countBands("asr");
  const soldBands = countBands("sold");

  // simple popup next to the badges
  window.__closeTriPop = ()=>{
    const el = document.getElementById('triPop');
    if(el) el.remove();
  };
  window.__openTriPop = (evt, mode)=>{
    try{
      window.__closeTriPop();
      const t = (mode==="sold") ? soldBands : asrBands;
      const title = (mode==="sold") ? "SOLD" : "ASR";
      const list = serviceAggs
        .map(s=>{
          const pct = (mode==="sold")
            ? ((Number.isFinite(s.closeTot) && Number.isFinite(avgClose) && avgClose>0) ? (s.closeTot/avgClose) : NaN)
            : ((Number.isFinite(s.reqTot)   && Number.isFinite(avgReq)   && avgReq>0)   ? (s.reqTot/avgReq)     : NaN);
          const b = bandFromPct(pct);
          return {name:s.serviceName, band:b, pct};
        })
        .filter(x=>x.band!=="good" && x.band!=="neutral")
        .sort((a,b)=>a.pct-b.pct);

      const items = list.length ? list.map(x=>{
        const val = (mode==="sold") ? fmtPct((serviceAggs.find(s=>s.serviceName===x.name)?.closeTot)||0) : fmtPctPlain((serviceAggs.find(s=>s.serviceName===x.name)?.reqTot)||0);
        return `<div class="triPopRow"><a href="#${toSvcId(x.name)}" onclick="return window.jumpToGroupService && window.jumpToGroupService(${JSON.stringify(x.name)})">${safe(x.name)}</a><span class="mini">${val}</span></div>`;
      }).join("") : `<div class="sub">No red/yellow services.</div>`;

      const pop = document.createElement('div');
      pop.id = 'triPop';
      pop.className = 'triPop';
      pop.innerHTML = `
        <div class="triPopHead">
          <div class="triPopTitle">${safe(title)}</div>
          <div class="triPopIcon">${triSvg('#ffffff00', 0).replace('fill="#ffffff00"','fill="#ffffff00"')}</div>
          <button class="triPopX" onclick="window.__closeTriPop()" aria-label="Close">×</button>
        </div>
        <div class="triPopCounts">
          <div class="triChip">${triSvg('#f04545', t.red)}<span class="mini">Red</span></div>
          <div class="triChip">${triSvg('#f3a91a', t.yellow)}<span class="mini">Yellow</span></div>
        </div>
        <div class="triPopList">${items}</div>
      `;
      document.body.appendChild(pop);
      const r = (evt && evt.currentTarget && evt.currentTarget.getBoundingClientRect) ? evt.currentTarget.getBoundingClientRect() : null;
      if(r){
        pop.style.left = Math.min(window.innerWidth - pop.offsetWidth - 12, Math.max(12, r.left + r.width + 10)) + 'px';
        pop.style.top  = Math.min(window.innerHeight - pop.offsetHeight - 12, Math.max(12, r.top - 6)) + 'px';
      }
      setTimeout(()=>{
        const onDoc = (e)=>{
          const p = document.getElementById('triPop');
          if(!p) return document.removeEventListener('mousedown', onDoc, true);
          if(p.contains(e.target)) return;
          if(evt && evt.currentTarget && evt.currentTarget.contains && evt.currentTarget.contains(e.target)) return;
          window.__closeTriPop();
          document.removeEventListener('mousedown', onDoc, true);
        };
        document.addEventListener('mousedown', onDoc, true);
      },0);
    }catch(e){
      console.error('tri popup error', e);
    }
  };

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
  <div class="panel techHeaderPanel">
    <div class="phead">

      <div class="titleRow techTitleRow">
        <div class="techTitleLeft">
          <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
        </div>

        <div class="techNameWrap">
          <div class="h2 techH2Big">${safe(title)}</div>
          <div class="techTeamLine">${safe(teamKey.toUpperCase())} • ${focus==="sold" ? "SOLD%" : "ASR/RO"}</div>
          <div class="sub">
            <a href="#/" style="text-decoration:none">← Back to dashboard</a>
          </div>
        </div>

        <div class="overallBlock">
          <div class="big">${fmt1(avgReq,1)}</div>
          <div class="tag">Avg ASR/RO (Summary)</div>
          <div class="overallMetric">${fmtPct(avgClose)}</div>
          <div class="tag">Avg Sold% (Summary)</div>
        </div>
      </div>

      <div class="pills">
        <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
        <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
        <div class="pill"><div class="k">Sold %</div><div class="v">${fmtPct(avgClose)}</div></div>
      </div>

      <div class="triSummaryRow">
        <div class="triSummaryBlock" onclick="window.__openTriPop(event,'asr')" role="button" tabindex="0" aria-label="ASR red/yellow counts">
          <div class="triPair">
            <div class="triBadge">${triSvg('#f04545', asrBands.red)}</div>
            <div class="triBadge">${triSvg('#f3a91a', asrBands.yellow)}</div>
          </div>
          <div class="triLbl">ASR</div>
        </div>
        <div class="triSummaryBlock" onclick="window.__openTriPop(event,'sold')" role="button" tabindex="0" aria-label="SOLD red/yellow counts">
          <div class="triPair">
            <div class="triBadge">${triSvg('#f04545', soldBands.red)}</div>
            <div class="triBadge">${triSvg('#f3a91a', soldBands.yellow)}</div>
          </div>
          <div class="triLbl">SOLD</div>
        </div>
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

  function bandClass(pct){
  if(!Number.isFinite(pct)) return "bandNeutral";
  if(pct >= 0.80) return "bandGood";
  if(pct >= 0.60) return "bandWarn";
  return "bandBad";
}

const cards = serviceAggs.map(s=>{
  const rk = rankMap.get(s.serviceName) || {rank:null,total:serviceAggs.length};
  const svcId = 'svc-' + String(s.serviceName||'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');

  // Compare each service to the selected team's average across services
  const pctVsAvgReq   = (Number.isFinite(s.reqTot)   && Number.isFinite(avgReq)   && avgReq>0)   ? (s.reqTot/avgReq)   : NaN;
  const pctVsAvgClose = (Number.isFinite(s.closeTot) && Number.isFinite(avgClose) && avgClose>0) ? (s.closeTot/avgClose) : NaN;

  const asrDial  = Number.isFinite(pctVsAvgReq)   ? `<div class="mbGauge" style="--sz:56px">${svcGauge(pctVsAvgReq, "")}</div>` : "";
  const soldDial = Number.isFinite(pctVsAvgClose) ? `<div class="mbGauge" style="--sz:56px">${svcGauge(pctVsAvgClose, "")}</div>` : "";

  const asrBlock = `
    <div class="metricBlock">
      <div class="mbLeft">
        <div class="mbKicker">ASR/RO%</div>
        <div class="mbStat ${bandClass(pctVsAvgReq)}">${fmtPctPlain(s.reqTot)}</div>
      </div>
      <div class="mbRight">
        <div class="mbRow">
          <div class="mbItem">
            <div class="mbLbl">Goal</div>
            <div class="mbNum">${fmtPctPlain(avgReq)}</div>
          </div>
          ${asrDial}
        </div>
      </div>
    </div>
  `;

  const soldBlock = `
    <div class="metricBlock">
      <div class="mbLeft">
        <div class="mbKicker">SOLD%</div>
        <div class="mbStat ${bandClass(pctVsAvgClose)}">${fmtPct(s.closeTot)}</div>
      </div>
      <div class="mbRight">
        <div class="mbRow">
          <div class="mbItem">
            <div class="mbLbl">Goal</div>
            <div class="mbNum">${fmtPct(avgClose)}</div>
          </div>
          ${soldDial}
        </div>
      </div>
    </div>
  `;

  const roLink = `#/ros?group=${encodeURIComponent(groupKey)}&service=${encodeURIComponent(s.serviceName)}&team=${encodeURIComponent(teamKey)}`;

  return `
    
<div class="catCard" id="${svcId}">
  <div class="catHeader">
    <div class="svcGaugeWrap" style="--sz:72px">
      ${
        focus==="sold"
          ? (Number.isFinite(pctVsAvgClose) ? svcGauge(pctVsAvgClose, "Sold%") : "")
          : (Number.isFinite(pctVsAvgReq)   ? svcGauge(pctVsAvgReq, "ASR%")  : "")
      }
    </div>
    <div>
      <div class="catTitle">${safe(s.serviceName)}</div>
      <div class="muted svcMetaLine" style="margin-top:2px">
        ${fmt1(s.asr,0)} ASR • ${fmt1(s.sold,0)} Sold • ${fmt1(s.totalRos,0)} ROs
      </div>
    </div>
    <div class="catRank">
      <div class="rankNum">${rk.rank ?? "—"}${rk.total ? `<span class="rankDen">/${rk.total}</span>` : ""}</div>
      <div class="rankLbl">${focus==="sold" ? "SOLD%" : "ASR%"}</div>
    </div>
  </div>

        <div class="metricStack">

        ${asrBlock}
        ${soldBlock}
        </div>

        <div class="techList">${techListFor(s) || '<div class="sub">No technicians found.</div>'}</div>

        <div class="catFooter"><a class="linkPill" href="${roLink}">ROs</a></div>
      </div>
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
