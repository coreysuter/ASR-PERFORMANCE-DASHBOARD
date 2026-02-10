// === Global diag popup handlers (used by clickable triangle badges) ===
(function(){
  function catList(){
    const set = new Set();
    (DATA.sections||[]).forEach(s=>(s.categories||[]).forEach(c=>c && set.add(c)));
    return Array.from(set);
  }
  function buildBench(scopeTechs, cats){
    const bench = {};
    for(const cat of cats){
      const reqs=[], closes=[];
      for(const x of scopeTechs){
        const c = x.categories?.[cat];
        const req = Number(c?.req);
        const close = Number(c?.close);
        if(Number.isFinite(req)) reqs.push(req);
        if(Number.isFinite(close)) closes.push(close);
      }
      const avgReq = reqs.length ? (reqs.reduce((a,b)=>a+b,0)/reqs.length) : NaN;
      const avgClose = closes.length ? (closes.reduce((a,b)=>a+b,0)/closes.length) : NaN;
      bench[cat] = {avgReq, avgClose};
    }
    return bench;
  }

  function closeDiagPopup(){
    const el = document.getElementById("diagBandPopup");
    if(el) el.remove();
    document.removeEventListener("keydown", onEsc, true);
  }
  function onEsc(e){ if(e.key==="Escape") closeDiagPopup(); }

  function bandOfPct(pct){
    if(!Number.isFinite(pct)) return null;
    if(pct < 0.60) return "red";
    if(pct < 0.80) return "yellow";
    return null;
  }

  window.closeDiagPopup = closeDiagPopup;

  window.openDiagBandPopup = function(ev, techId, mode, band, compareBasis){
    ev.preventDefault();
    ev.stopPropagation();
    closeDiagPopup();

    const t = (DATA.techs||[]).find(x=>String(x.id)===String(techId));
    if(!t) return;

    const cats = catList();
    const team = t.team || t.group || t.teamKey || "";
    const scope = (String(compareBasis)==="team")
      ? (DATA.techs||[]).filter(x=>(x.team||x.group||x.teamKey||"")===team)
      : (DATA.techs||[]);

    const bench = buildBench(scope, cats);

    const items = [];
    for(const cat of cats){
      const mine = t.categories?.[cat];
      if(!mine) continue;
      const val = (mode==="sold") ? Number(mine.close) : Number(mine.req);
      const base = (mode==="sold") ? Number(bench?.[cat]?.avgClose) : Number(bench?.[cat]?.avgReq);
      if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) continue;
      const pct = val/base;
      const b = bandOfPct(pct);
      if(b !== band) continue;
      items.push({cat, val, pct});
    }
    items.sort((a,b)=>a.pct-b.pct);

    const title = (mode==="sold") ? "SOLD" : "ASR";
    const colorClass = (band==="red") ? "diagRed" : "diagYellow";

    const rows = items.length ? items.map((it, i)=>{
      const id = "svc-" + String(it.cat||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
      const onClick = `event.preventDefault(); window.closeDiagPopup(); const el=document.getElementById('${id}'); if(el) el.scrollIntoView({behavior:'smooth',block:'start'});`;
      const lbl = (mode==="sold") ? "Sold%" : "ASR%";
      const nm = (window.catLabel ? window.catLabel(it.cat) : it.cat);
      return `
        <a class="diagPopRow" href="#${id}" onclick="${onClick}" style="text-decoration:none;color:inherit">
          <span class="rankNum">${i+1}.</span>
          <span class="tbName">${safe(nm)}</span>
          <span class="tbVal">${lbl} ${fmtPct(it.val)}</span>
        </a>
      `;
    }).join("") : `<div class="notice" style="padding:8px 2px">No services</div>`;

    const pop = document.createElement("div");
    pop.id = "diagBandPopup";
    pop.className = "diagPopup";
    pop.innerHTML = `
      <div class="diagPopHead">
        <div class="diagPopTitle">${title}</div>
        <div class="diagPopIcon">
          <svg class="diagTriSvg ${colorClass}" viewBox="0 0 100 87" aria-hidden="true">
            <polygon class="triFill" points="50,0 0,87 100,87"></polygon>
            <rect class="triBang" x="46" y="20" width="8" height="34" rx="3"></rect>
            <circle class="triBang" cx="50" cy="66" r="5"></circle>
          </svg>
        </div>
        <button class="diagPopClose" onclick="window.closeDiagPopup()" aria-label="Close">×</button>
      </div>
      <div class="diagPopList">${rows}</div>
    `;
    document.body.appendChild(pop);

    const r = ev.currentTarget.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    const pad = 10;
    let left = r.right + pad;
    let top = r.top - 6;

    const vw = window.innerWidth, vh = window.innerHeight;
    if(left + pr.width > vw - 8) left = r.left - pr.width - pad;
    if(top + pr.height > vh - 8) top = Math.max(8, vh - pr.height - 8);
    if(top < 8) top = 8;

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    setTimeout(()=>{
      const onDoc = (e)=>{
        if(!pop.contains(e.target)) { document.removeEventListener("mousedown", onDoc, true); closeDiagPopup(); }
      };
      document.addEventListener("mousedown", onDoc, true);
    }, 0);

    document.addEventListener("keydown", onEsc, true);
  };
})();

function renderTech(techId){
  const t = (DATA.techs||[]).find(x=>x.id===techId);
  if(!t){
    document.getElementById('app').innerHTML = `<div class="panel"><div class="phead"><div class="h2">Technician not found</div><div class="sub"><a href="#/">Back</a></div></div></div>`;
    return;
  }

  const team = t.team;

  const logoSrc = (document.querySelector(".brandLogo")||{}).src || "";

  let filterKey = "total";
  let compareBasis = "team";
  let focus = "asr"; // asr | sold
const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      if(k==="filter") filterKey = decodeURIComponent(v||"") || "total";
      if(k==="compare"){
        const vv = decodeURIComponent(v||"") || "team";
        compareBasis = (vv==="store") ? "store" : "team";
      }
      if(k==="focus"){
        const vv = decodeURIComponent(v||"") || "asr";
        focus = (vv==="sold"||vv==="goal"||vv==="asr") ? vv : "asr";
      }
    }
  }
  function filterLabel(k){ return k==="without_fluids"?"Without Fluids":(k==="fluids_only"?"Fluids Only":"With Fluids (Total)"); }

  const s = t.summary?.[filterKey] || {};

  function allTechs(){ return (DATA.techs||[]).filter(x=>x.team==="EXPRESS" || x.team==="KIA"); }
  function categoryUniverse(){
    const cats=new Set();
    for(const x of (DATA.techs||[])){
      for(const k of Object.keys(x.categories||{})) cats.add(k);
    }
    return Array.from(cats);
  }
  const CAT_LIST = categoryUniverse();

  function buildBench(scopeTechs){
    const bench={};
    for(const cat of CAT_LIST){
      const reqs=[], closes=[];
      let topReq=-1, topName="—", topClose=null;
      for(const x of scopeTechs){
        const c=x.categories?.[cat];
        const req=Number(c?.req);     // treat as ASR/RO
        const close=Number(c?.close); // treat as Sold%
        if(Number.isFinite(req)) reqs.push(req);
        if(Number.isFinite(close)) closes.push(close);
        if(Number.isFinite(req) && req>topReq){
          topReq=req; topName=x.name||"—";
          topClose=Number.isFinite(close)?close:null;
        }
      }
      bench[cat]={
        avgReq: reqs.length? reqs.reduce((a,b)=>a+b,0)/reqs.length : null,
        avgClose: closes.length? closes.reduce((a,b)=>a+b,0)/closes.length : null,
        topReq: topReq>=0? topReq : null,
        topClose, topName
      };
    }
    return bench;
  }

  const TEAM_TECHS = byTeam(team);
  const STORE_TECHS = allTechs();
  const TEAM_B = buildBench(TEAM_TECHS);
  const STORE_B = buildBench(STORE_TECHS);


  function diagTriBadge(color, num, mode, band){
    const n = Number(num)||0;
    if(!n) return "";
    const cls = (color==="red") ? "diagRed" : "diagYellow";
    // clickable triangle -> popup of services for this band
    return `
      <button class="diagTriBtn" onclick="window.openDiagBandPopup(event,'${t.id}','${mode}','${band}','${compareBasis}')" aria-label="${mode.toUpperCase()} ${band} services">
        <svg class="diagTriSvg ${cls}" viewBox="0 0 100 87" aria-hidden="true">
          <polygon class="triFill" points="50,0 0,87 100,87"></polygon>
          <!-- exclamation mark -->
          <rect class="triBang" x="46" y="20" width="8" height="34" rx="3"></rect>
          <circle class="triBang" cx="50" cy="66" r="5"></circle>
          <text class="triNum" x="88" y="82">${fmtInt(n)}</text>
        </svg>
      </button>
    `;
  }

  function countBandsFor(mode){
    let red=0, yellow=0;
    const bench = (compareBasis==="team") ? TEAM_B : STORE_B;
    for(const cat of CAT_LIST){
      const mine = t?.categories?.[cat];
      if(!mine) continue;
      const val = (mode==="sold") ? Number(mine.close) : Number(mine.req);
      const base = (mode==="sold") ? Number(bench?.[cat]?.avgClose) : Number(bench?.[cat]?.avgReq);
      if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) continue;
      const pct = val/base;
      if(pct >= 0.80) continue;
      if(pct >= 0.60) yellow++;
      else red++;
    }
    return {red, yellow};function bandOfPct(pct){
    if(!Number.isFinite(pct)) return null;
    if(pct < 0.60) return "red";
    if(pct < 0.80) return "yellow";
    return null;
  }

  function bandItems(mode, band){
    const bench = (compareBasis==="team") ? TEAM_B : STORE_B;
    const items = [];
    for(const cat of CAT_LIST){
      const mine = t?.categories?.[cat];
      if(!mine) continue;
      const val = (mode==="sold") ? Number(mine.close) : Number(mine.req);
      const base = (mode==="sold") ? Number(bench?.[cat]?.avgClose) : Number(bench?.[cat]?.avgReq);
      if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) continue;
      const pct = val/base;
      const b = bandOfPct(pct);
      if(b !== band) continue;
      items.push({cat, val, pct});
    }
    // list sorted lowest -> highest %
    items.sort((a,b)=>a.pct-b.pct);
    return items;
  }

  function closeDiagPopup(){
    const el = document.getElementById("diagBandPopup");
    if(el) el.remove();
    document.removeEventListener("keydown", _diagEsc, true);
  }
  function _diagEsc(e){
    if(e.key==="Escape") closeDiagPopup();
  }

  function openDiagBandPopup(ev, mode, band){
    ev.preventDefault();
    ev.stopPropagation();
    closeDiagPopup();

    const items = bandItems(mode, band);
    const title = (mode==="sold") ? "SOLD" : "ASR";
    const colorClass = (band==="red") ? "red" : "yellow";

    const rows = items.length ? items.map((it, i)=>{
      const id = "svc-" + String(it.cat||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
      const onClick = `event.preventDefault(); closeDiagPopup(); const el=document.getElementById('${id}'); if(el) el.scrollIntoView({behavior:'smooth',block:'start'});`;
      const lbl = (mode==="sold") ? "Sold%" : "ASR%";
      return `
        <a class="diagPopRow" href="#${id}" onclick="${onClick}" style="text-decoration:none;color:inherit">
          <span class="rankNum">${i+1}.</span>
          <span class="tbName">${safe(catLabel ? catLabel(it.cat) : it.cat)}</span>
          <span class="tbVal">${lbl} ${fmtPct(it.val)}</span>
        </a>
      `;
    }).join("") : `<div class="notice" style="padding:8px 2px">No services</div>`;

    const pop = document.createElement("div");
    pop.id = "diagBandPopup";
    pop.className = "diagPopup";
    pop.innerHTML = `
      <div class="diagPopHead">
        <div class="diagPopTitle">${title}</div>
        <div class="diagPopIcon">
          <div class="diagTriBadge ${colorClass} noNum">
            <div class="triBang">!</div>
          </div>
        </div>
        <button class="diagPopClose" onclick="closeDiagPopup()" aria-label="Close">×</button>
      </div>
      <div class="diagPopList">${rows}</div>
    `;
    document.body.appendChild(pop);

    // position next to the clicked triangle
    const r = ev.currentTarget.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    const pad = 10;
    let left = r.right + pad;
    let top = r.top - 6;

    // keep on-screen
    const vw = window.innerWidth, vh = window.innerHeight;
    if(left + pr.width > vw - 8) left = r.left - pr.width - pad;
    if(top + pr.height > vh - 8) top = Math.max(8, vh - pr.height - 8);
    if(top < 8) top = 8;

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    // click outside closes
    setTimeout(()=>{
      const onDoc = (e)=>{
        if(!pop.contains(e.target)) { document.removeEventListener("mousedown", onDoc, true); closeDiagPopup(); }
      };
      document.addEventListener("mousedown", onDoc, true);
    }, 0);

    document.addEventListener("keydown", _diagEsc, true);
  }

  }



  // Benchmarks helpers (tech detail)
  // TEAM_B / STORE_B are computed above from the current comparison team and full store tech list.
  function getTeamBenchmarks(cat, _team){
    try{ return (TEAM_B && TEAM_B[cat]) ? TEAM_B[cat] : {}; }catch(e){ return {}; }
  }
  function getStoreBenchmarks(cat){
    try{ return (STORE_B && STORE_B[cat]) ? STORE_B[cat] : {}; }catch(e){ return {}; }
  }


  function bandClass(val, base){
    if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) return "";
    const pct = val/base;
    if(pct>=0.80) return "bGreen";
    if(pct>=0.60) return "bYellow";
    return "bRed";
  }

  function rankFor(cat){
    const CMP_TECHS = (compareBasis==="team") ? TEAM_TECHS : STORE_TECHS;
    const vals = CMP_TECHS
      .map(x=>{
        const c = x.categories?.[cat] || {};
        let v = NaN;
        if(focus==="sold"){
          v = Number(c.close);
        }else if(focus==="goal"){
          const req = Number(c.req ?? NaN);
          const close = Number(c.close ?? NaN);
          const gReq = Number(getGoal(cat,"req"));
          const gClose = Number(getGoal(cat,"close"));
          const parts = [];
          if(Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) parts.push(req/gReq);
          if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) parts.push(close/gClose);
          v = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
        }else{
          v = Number(c.req);
        }
        return {id:x.id, v};
      })
      .filter(o=>Number.isFinite(o.v))
      .sort((a,b)=>b.v-a.v);

    const meC = t.categories?.[cat] || {};
    let me = NaN;
    if(focus==="sold"){
      me = Number(meC.close);
    }else if(focus==="goal"){
      const req = Number(meC.req);
      const close = Number(meC.close);
      const gReq = Number(getGoal(cat,"req"));
      const gClose = Number(getGoal(cat,"close"));
      const parts = [];
      if(Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) parts.push(req/gReq);
      if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) parts.push(close/gClose);
      me = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
    }else{
      me = Number(meC.req);
    }

    if(!Number.isFinite(me) || !vals.length) return null;
    const idx = vals.findIndex(o=>o.id===t.id);
    return {rank: idx>=0?idx+1:null, total: vals.length};
  }
const tfOpen = !!UI.techFilters[techId];
  const appliedParts = [
    `${filterLabel(filterKey)}`,
    (compareBasis==="team" ? `Compare: ${team}` : "Compare: Store"),
    (focus==="sold" ? "Focus: Sold" : (focus==="goal" ? "Focus: Goal" : "Focus: ASR/RO"))
  ];
  const appliedTextHtml = renderFiltersText(appliedParts);


  const filters = `
    <div class="iconBar" style="margin-top:0">
      <button class="iconBtn" onclick="toggleTechFilters('${safe(techId)}')" aria-label="Filters" title="Filters">${ICON_FILTER}</button>
      <div class="appliedInline">${appliedTextHtml}</div>
    </div>
    <div class="ctlPanel ${tfOpen?"open":""}">
      <div class="controls" style="margin-top:10px">
        <div>
          <label>Summary Filter</label>
          <select id="techFilter">
            <option value="total" ${filterKey==="total"?"selected":""}>With Fluids (Total)</option>
            <option value="without_fluids" ${filterKey==="without_fluids"?"selected":""}>Without Fluids</option>
            <option value="fluids_only" ${filterKey==="fluids_only"?"selected":""}>Fluids Only</option>
          </select>
        </div>
        <div>
          <label>Comparison</label>
          <select id="compareBasis">
            <option value="team" ${compareBasis==="team"?"selected":""}>Team</option>
            <option value="store" ${compareBasis==="store"?"selected":""}>Store</option>
          </select>
        </div>
        <div>
          <label>Focus</label>
          <select id="techFocus">
            <option value="asr" ${focus==="asr"?"selected":""}>ASR/RO</option>
            <option value="sold" ${focus==="sold"?"selected":""}>Sold%</option>
            <option value="goal" ${focus==="goal"?"selected":""}>Goal</option>
          </select>
        </div>
      </div>
    </div>
  `;

  const scopeTechs = (compareBasis==="team") ? byTeam(team) : allTechs();
  function techGoalScore(x){
    let sum=0, n=0;
    for(const cat of CAT_LIST){
      const c = x.categories?.[cat];
      if(!c) continue;
      const req = Number(c.req ?? NaN);
      const close = Number(c.close ?? NaN);
      const gReq = Number(getGoal(cat,"req"));
      const gClose = Number(getGoal(cat,"close"));
      if(Number.isFinite(req) && Number.isFinite(gReq) && gReq>0){ sum += (req/gReq); n++; }
      if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0){ sum += (close/gClose); n++; }
    }
    return n ? (sum/n) : null; // ratio (1.0 = 100% of goal)
  }
  const metricForRank = (x)=> {
    if(focus==="sold") return Number(techSoldPct(x, filterKey));
    if(focus==="goal") return Number(techGoalScore(x));
    return Number(techAsrPerRo(x, filterKey));
  };
  const ordered = scopeTechs.slice().sort((a,b)=>{
    const nb = metricForRank(b);
    const na = metricForRank(a);
    return (Number.isFinite(nb)?nb:-999) - (Number.isFinite(na)?na:-999);
  });

  const myV = metricForRank(t);
  const idx = Number.isFinite(myV) ? ordered.findIndex(o=>o.id===t.id) : -1;
  const overall = ordered.length ? {rank: (idx>=0?idx+1:null), total: ordered.length} : {rank:null,total:null};
  const focusLbl = focus==="sold" ? "SOLD%" : (focus==="goal" ? "GOAL%" : "ASR/RO");
  const focusVal = focus==="sold" ? fmtPct(techSoldPct(t, filterKey)) : (focus==="goal" ? fmtPct(techGoalScore(t)) : fmt1(techAsrPerRo(t, filterKey),1));

  
const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>
          <div class="techNameWrap">
            <div class="h2 techH2Big">${safe(t.name)}</div>
            <div class="techTeamLine">${safe(team)}</div>
          </div>
          <div class="overallBlock">
            <div class="big">${overall.rank ?? "—"}/${overall.total ?? "—"}</div>
            <div class="tag">${focus==="sold" ? "Overall Sold Rank" : "Overall ASR Rank"}</div>
            <div class="overallMetric">${focusVal}</div>
            <div class="tag">${focus==="sold" ? "Sold%" : "Total ASR/RO"}</div>
          </div>
        </div>
        <div class="pills">
          <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(t.ros)}</div></div>
          <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(t.odo)}</div></div>
          <div class="pill"><div class="k">Avg ASR/RO</div><div class="v">${fmt1(techAsrPerRo(t, filterKey),1)}</div></div>
          <div class="pill"><div class="k">Sold %</div><div class="v">${fmtPct(techSoldPct(t, filterKey))}</div></div>
        </div>
        ${filters}
      </div>
    </div>
  `;

  function fmtDelta(val){ return val===null || val===undefined || !Number.isFinite(Number(val)) ? "—" : (Number(val)*100).toFixed(1); }

  function renderCategoryRectSafe(cat, compareBasis){
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const asrCount = Number(c.asr ?? 0);
    const soldCount = Number(c.sold ?? 0);
    const req = Number(c.req ?? NaN);
    const close = Number(c.close ?? NaN);
    const ro = Number(c.ro ?? 0);

        const techRos = Number(t.ros ?? 0);
const tb = getTeamBenchmarks(cat, team) || {};
    const sb = getStoreBenchmarks(cat) || {};
    const basis = (compareBasis==="store") ? sb : tb;

    const goalReq = Number(getGoal(cat,"req"));
    const goalClose = Number(getGoal(cat,"close"));

    const cmpReq = Number(basis.avgReq);
    const cmpClose = Number(basis.avgClose);

    const pctGoalReq = (Number.isFinite(req) && Number.isFinite(goalReq) && goalReq>0) ? (req/goalReq) : NaN;
    const pctGoalClose = (Number.isFinite(close) && Number.isFinite(goalClose) && goalClose>0) ? (close/goalClose) : NaN;

    const pctCmpReq = (Number.isFinite(req) && Number.isFinite(cmpReq) && cmpReq>0) ? (req/cmpReq) : NaN;
    const pctCmpClose = (Number.isFinite(close) && Number.isFinite(cmpClose) && cmpClose>0) ? (close/cmpClose) : NaN;

    function bandClass(pct){
      if(!Number.isFinite(pct)) return "bandNeutral";
      if(pct >= 0.80) return "bandGood";
      if(pct >= 0.60) return "bandWarn";
      return "bandBad";
    }

    // Header gauge follows Focus:
    let hdrPct = pctCmpReq;
    if(focus==="sold") hdrPct = pctCmpClose;
    if(focus==="goal"){
      const parts = [];
      if(Number.isFinite(pctGoalReq)) parts.push(pctGoalReq);
      if(Number.isFinite(pctGoalClose)) parts.push(pctGoalClose);
      hdrPct = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
    }
    const gaugeHtml = Number.isFinite(hdrPct) ? `<div class="svcGaugeWrap" style="--sz:72px">${svcGauge(hdrPct, (focus==="sold"?"Sold%":(focus==="goal"?"Goal%":"ASR%")))}</div>
` : `<div class="svcGaugeWrap" style="--sz:72px"></div>`;

    const rk = rankFor(cat);

    const showFocusTag = (focus==="sold") ? "SOLD%" : (focus==="goal" ? "GOAL%" : "ASR/RO");

    const compareLabel = (compareBasis==="store") ? "Store Avg" : "Team Avg";

    const asrBlock = `
      <div class="metricBlock">
        <div class="mbLeft">
          <div class="mbKicker">ASR/RO%</div>
          <div class="mbStat ${bandClass(pctCmpReq)}">${fmtPct(req)}</div>
        </div>
        <div class="mbRight">
          ${(focus==="goal") ? `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalReq)? svcGauge(pctGoalReq):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpReq)? svcGauge(pctCmpReq):""}</div>
          </div>
          ` : `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpReq)? svcGauge(pctCmpReq):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalReq)? svcGauge(pctGoalReq):""}</div>
          </div>
          `}
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Top Performer</div>
              <div class="mbSub">(${safe((basis.topName)||"—")})</div>
              <div class="mbNum">${fmtPct(basis.topReq)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

const soldBlock = `
      <div class="metricBlock">
        <div class="mbLeft">
          <div class="mbKicker">Sold%</div>
          <div class="mbStat ${bandClass(pctCmpClose)}">${fmtPct(close)}</div>
        </div>
        <div class="mbRight">
          ${(focus==="goal") ? `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalClose)? svcGauge(pctGoalClose):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpClose)? svcGauge(pctCmpClose):""}</div>
          </div>
          ` : `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpClose)? svcGauge(pctCmpClose):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalClose)? svcGauge(pctGoalClose):""}</div>
          </div>
          `}
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Top Performer</div>
              <div class="mbSub">(${safe((basis.topCloseName)||basis.topName||"—")})</div>
              <div class="mbNum">${fmtPct(basis.topClose)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

return `
      <div class="catCard" id="svc-${cat}">
        <div class="catHeader">
          <div class="svcGaugeWrap" style="--sz:72px">${Number.isFinite(hdrPct)? svcGauge(hdrPct, (focus==="sold"?"Sold%":(focus==="goal"?"Goal%":"ASR%"))) : ""}</div>
<div>
            <div class="catTitle">${safe(catLabel(cat))}</div>
            <div class="muted svcMetaLine" style="margin-top:2px">
              ${fmt1(asrCount,0)} ASR · ${fmt1(soldCount,0)} Sold · ${fmt1(techRos,0)} ROs
            </div>
          </div>
          <div class="catRank">
            <div class="rankNum">${rk && rk.rank ? rk.rank : "—"}${rk && rk.total ? `<span class="rankDen">/${rk.total}</span>`:""}</div>
            <div class="rankLbl">${focus==="sold"?"SOLD%":(focus==="goal"?"GOAL%":"ASR%")}</div>
          </div>
        </div>

        <div class="metricStack">
          ${asrBlock}
          ${soldBlock}
        </div>

        <div class="catFooter">
          <a class="linkPill" href="#/raw?tech=${encodeURIComponent(t.id)}&cat=${encodeURIComponent(cat)}">ROs</a>
        </div>
      </div>
    `;
  }
  function sectionStatsForTech(sec){
    const cats = sec.categories || [];
    const reqs = cats.map(cat=>Number(t.categories?.[cat]?.req)).filter(n=>Number.isFinite(n));
    const closes = cats.map(cat=>Number(t.categories?.[cat]?.close)).filter(n=>Number.isFinite(n));
    return {
      avgReq: reqs.length ? reqs.reduce((a,b)=>a+b,0)/reqs.length : null,
      avgClose: closes.length ? closes.reduce((a,b)=>a+b,0)/closes.length : null
    };
  }

  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const secStats = sectionStatsForTech(sec);
    const cats = (sec.categories||[]);
    // Benchmarks for section-level dials (avg across categories)
    const benchReqs = cats.map(cat=>{
      const b = (compareBasis==="store") ? getStoreBenchmarks(cat) : getTeamBenchmarks(cat, team);
      return Number(b && b.avgReq);
    }).filter(n=>Number.isFinite(n) && n>0);
    const benchCloses = cats.map(cat=>{
      const b = (compareBasis==="store") ? getStoreBenchmarks(cat) : getTeamBenchmarks(cat, team);
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

    const focusPct = (focus==="sold") ? pctSold : (focus==="goal" ? pctGoal : pctAsr);
    const focusLbl = (focus==="sold") ? "Sold" : (focus==="goal" ? "Goal" : "ASR");

    const dialASR = Number.isFinite(pctAsr) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctAsr,"ASR")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialSold = Number.isFinite(pctSold) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctSold,"Sold")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialGoal = Number.isFinite(pctGoal) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctGoal,"Goal")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialFocus = Number.isFinite(focusPct) ? `<div class="svcGaugeWrap" style="--sz:112px">${svcGauge(focusPct,focusLbl)}</div>` : `<div class="svcGaugeWrap" style="--sz:112px"></div>`;

    const __cats = Array.from(new Set((sec.categories||[]).filter(Boolean)));
    const rows = __cats.map(cat=>renderCategoryRectSafe(cat, compareBasis)).join("");
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
            <div class="secHdrRight"><div class="secFocusDial">${dialFocus}</div><div class="secHdrStats" style="text-align:right">
                <div class="big">${fmtPct(secStats.avgReq)}</div>
                <div class="tag">ASR%</div>
                <div style="margin-top:6px;text-align:right;color:var(--muted);font-weight:900;font-size:13px">Sold%: <b style="color:var(--text)">${fmtPct(secStats.avgClose)}</b></div></div>
            </div>
          </div>
        </div>
        <div class="list">${rows ? `<div class="categoryGrid">${rows}</div>` : `<div class="notice">No categories found in this section.</div>`}</div>
      </div>
    `;
  }).join("");

  
  // === Top/Bottom 3 panel (ASR% and Sold%) ===
  const allCatsTB = Array.from(new Set((DATA.sections||[]).flatMap(s => (s.categories||[])).filter(Boolean)));
  const svcRowsTB = allCatsTB.map(cat=>{
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const req = Number(c.req);
    const close = Number(c.close);
    const label = (typeof catLabel==="function") ? catLabel(cat) : String(cat);
    return { cat, label, req, close };
  });

  const byReqTB = svcRowsTB.filter(x=>Number.isFinite(x.req)).sort((a,b)=>b.req-a.req);
  const byCloseTB = svcRowsTB.filter(x=>Number.isFinite(x.close)).sort((a,b)=>b.close-a.close);

  const topReqTB = byReqTB.slice(0,3);
  const botReqTB = byReqTB.slice(-3).reverse();
  const topCloseTB = byCloseTB.slice(0,3);
  const botCloseTB = byCloseTB.slice(-3).reverse();

  // Safe jump helper (never throws on null)
  window.jumpToService = function(cat){
    const id = `svc-${cat}`;
    const el = document.getElementById(id);
    if(!el){ console.warn("jumpToService: not found", id); return false; }
    const sec = el.closest(".sectionFrame") || el.closest(".panel") || null;
    if(sec && sec.classList && sec.classList.contains("secCollapsed")) sec.classList.remove("secCollapsed");
    el.scrollIntoView({behavior:"smooth", block:"start"});
    if(el.classList){
      el.classList.add("flashPick");
      setTimeout(()=>{ const el2=document.getElementById(id); if(el2 && el2.classList) el2.classList.remove("flashPick"); }, 900);
    }
    return false;
  };

  // Inline icons (colored via CSS)
  const ICON_THUMBS_UP = `<svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true">
    <path fill="currentColor" d="M2 10h4v12H2V10zm20 1c0-1.1-.9-2-2-2h-6.3l.9-4.4.02-.2c0-.3-.13-.6-.33-.8L13 2 7.6 7.4c-.4.4-.6.9-.6 1.4V20c0 1.1.9 2 2 2h7c.8 0 1.5-.5 1.8-1.2l3-7c.1-.3.2-.6.2-.8v-2z"/>
  </svg>`;
  const ICON_THUMBS_DOWN = `<svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true">
    <path fill="currentColor" d="M2 2h4v12H2V2zm20 11c0 1.1-.9 2-2 2h-6.3l.9 4.4.02.2c0 .3-.13.6-.33.8L13 22l-5.4-5.4c-.4-.4-.6-.9-.6-1.4V4c0-1.1.9-2 2-2h7c.8 0 1.5.5 1.8 1.2l3 7c.1.3.2.6.2.8v2z"/>
  </svg>`;


  function tbRow(item, idx, mode){
    const metric = mode==="sold" ? item.close : item.req;
    const metricLbl = mode==="sold" ? "Sold%" : "ASR%";
    return `
      <div class="techRow pickRowFrame">
        <div class="techRowLeft">
          <span class="rankNum">${idx}.</span>
          <a href="javascript:void(0)" onclick="return window.jumpToService && window.jumpToService(${JSON.stringify(item.cat)})">${safe(item.label)}</a>
        </div>
        <div class="mini">${metricLbl} ${fmtPct(metric)}</div>
      </div>
    `;
  }

  
  function tbMiniBox(title, arr, mode, iconDir){
    const html = arr.length ? arr.map((x,i)=>tbRow(x,i+1,mode)).join("") : `<div class="notice">No data</div>`;
    const icon = iconDir==="down"
      ? `<span class="thumbIcon down" aria-hidden="true">${ICON_THUMBS_DOWN}</span>`
      : `<span class="thumbIcon up" aria-hidden="true">${ICON_THUMBS_UP}</span>`;
    return `
      <div class="pickBox">
        <div class="pickMiniHdr">${safe(title)} ${icon}</div>
        <div class="pickList">${html}</div>
      </div>
    `;
  }
  const bandCounts_asr = countBandsFor('asr');
  const bandCounts_sold = countBandsFor('sold');


  const top3Panel = `
    <div class="panel techPickPanel diagSection">
      <div class="phead" style="border-bottom:none;padding:12px">
        <!-- ASR row -->
        <div class="pickRow" style="display:grid;grid-template-columns:52px 1fr 1fr;gap:12px;align-items:start">
          <div class="diagLabelCol">
            <div class="pickHdrLabel" style="margin:2px 0 0 0;align-self:start;justify-self:start">ASR</div>
            <div class="diagBadgeRow">
              ${diagTriBadge("red", bandCounts_asr.red, "asr", "red")}
              ${diagTriBadge("yellow", bandCounts_asr.yellow, "asr", "yellow")}
            </div>
          </div>
          <div>${tbMiniBox("Top 3 Most Recommended", topReqTB, "asr", "up")}</div>
          <div>${tbMiniBox("Bottom 3 Least Recommended", botReqTB, "asr", "down")}</div>
        </div>

        <!-- SOLD row -->
        <div class="pickRow" style="display:grid;grid-template-columns:52px 1fr 1fr;gap:12px;align-items:start;margin-top:14px">
          <div class="diagLabelCol">
            <div class="pickHdrLabel" style="margin:2px 0 0 0;align-self:start;justify-self:start">SOLD</div>
            <div class="diagBadgeRow">
              ${diagTriBadge("red", bandCounts_sold.red, "sold", "red")}
              ${diagTriBadge("yellow", bandCounts_sold.yellow, "sold", "yellow")}
            </div>
          </div>
          <div>${tbMiniBox("Top 3 Most Sold", topCloseTB, "sold", "up")}</div>
          <div>${tbMiniBox("Bottom 3 Least Sold", botCloseTB, "sold", "down")}</div>
        </div>
      </div>
    </div>
  `;

  const headerWrap = `<div class="techHeaderWrap">${header}${top3Panel}</div>`;

  document.getElementById('app').innerHTML = `${headerWrap}${sectionsHtml}`;
  animateSvcGauges();
  initSectionToggles();

  const sel = document.getElementById('techFilter');
  if(sel){
    sel.addEventListener('change', ()=>{
      const v = sel.value || "total";
      const c = encodeURIComponent(compareBasis||"team");
      const fo = encodeURIComponent(focus||"asr");
      location.hash = `#/tech/${encodeURIComponent(t.id)}?filter=${encodeURIComponent(v)}&compare=${c}&focus=${fo}`;
    });
  }

  const compSel = document.getElementById('compareBasis');
  if(compSel){
    compSel.addEventListener('change', ()=>{
      const f = encodeURIComponent(filterKey);
      const c = encodeURIComponent(compSel.value||"team");
      const fo = encodeURIComponent(focus||"asr");
      location.hash = `#/tech/${encodeURIComponent(techId)}?filter=${f}&compare=${c}&focus=${fo}`;
    });
  }

  const focusSel = document.getElementById('techFocus');
  if(focusSel){
    focusSel.addEventListener('change', ()=>{
      const f = encodeURIComponent(filterKey);
      const c = encodeURIComponent(compareBasis||'team');
      const fo = encodeURIComponent(focusSel.value||'asr');
      location.hash = `#/tech/${encodeURIComponent(techId)}?filter=${f}&compare=${c}&focus=${fo}`;
    });
  }
}



// ===== Group pages (Maintenance / Fluids / Brakes & Tires) =====
const GROUPS = (() => {
  const obj = {};
  for (const sec of (DATA.sections || [])) {
    const key = String(sec.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!key) continue;
    obj[key] = {
      label: String(sec.name || "").toUpperCase(),
      services: Array.isArray(sec.categories) ? sec.categories.slice() : []
    };
  }
  return obj;
})();

// Populate hamburger menu "ASR Categories" from DATA.sections (so it always includes every category).


window.renderTech = renderTech;
