// ═══════════════════════════════════════════════════════════════════════════════
// Advisor Detail Page – mirrors renderTech but uses DATA.advisors
// Route: #/advisor/{advisorId}?filter=...&compare=...&focus=...&goal=...
// ═══════════════════════════════════════════════════════════════════════════════

// === Global advisor pie-slice click handler (intercepts before renderTech handler) ===
(function(){
  function escHtml(s){
    return String(s==null?"":s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }
  function fmtPctLocal(v){
    const n = Number(v);
    if(!Number.isFinite(n)) return "—";
    return (n*100).toFixed(1) + "%";
  }
  function safeSvcIdLocal(cat){
    return "svc-" + String(cat||"").toLowerCase()
      .replace(/&/g,"and")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"");
  }
  function catList(){
    const set = new Set();
    (DATA.sections||[]).forEach(s=>(s.categories||[]).forEach(c=>c && set.add(c)));
    return Array.from(set);
  }
  function buildAdvBench(scopeAdvisors, cats){
    const bench = {};
    for(const cat of cats){
      const reqs=[], closes=[];
      for(const x of scopeAdvisors){
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
  function bandOfPct(pct){
    if(!Number.isFinite(pct)) return null;
    if(pct < 0.60) return "red";
    if(pct < 0.80) return "yellow";
    return "green";
  }

  document.addEventListener("click", (e)=>{
    const slice = e.target && e.target.closest ? e.target.closest(".diagPieSlice") : null;
    if(!slice) return;
    const compare = slice.getAttribute("data-compare") || "";
    if(compare !== "advisors") return; // let renderTech handler deal with non-advisor slices

    e.preventDefault();
    e.stopImmediatePropagation();

    const advId = slice.getAttribute("data-tech");
    const mode = slice.getAttribute("data-mode");
    const band = slice.getAttribute("data-band");

    const advisors = (DATA.advisors||[]).filter(a => a && String(a.id||"").toLowerCase()!=="total");
    const t = advisors.find(x=>String(x.id)===String(advId));
    if(!t) return;

    const cats = catList();
    const bench = buildAdvBench(advisors, cats);

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
    const isRed = (band==="red");
    const isYellow = (band==="yellow");
    const isGreen = (band==="green");
    const popFill = isRed ? "#ff4b4b" : (isYellow ? "#ffbf2f" : "#1fcb6a");
    const popFillHi = isRed ? "#ff8b8b" : (isYellow ? "#ffd978" : "#7CFFB0");
    const lbl = (mode==="sold") ? "SOLD" : "ASR";
    const uid = `${mode}-${band}-adv-${advId}`;

    const iconSvg = isGreen
      ? `<svg viewBox="0 0 64 64" aria-hidden="true" style="width:34px;height:34px;display:block;filter:drop-shadow(0 10px 18px rgba(0,0,0,.35))">
          <defs>
            <radialGradient id="popChkHi-${uid}" cx="35%" cy="25%" r="70%"><stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="60%" stop-color="rgba(255,255,255,.10)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
            <linearGradient id="popChkGrad-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${popFillHi}"/><stop offset="100%" stop-color="${popFill}"/></linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#popChkGrad-${uid})"/><circle cx="32" cy="32" r="28" fill="url(#popChkHi-${uid})"/>
          <path d="M19 33.5l7.2 7.2L46 21.9" fill="none" stroke="#fff" stroke-width="7.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      : `<svg viewBox="0 0 100 87" aria-hidden="true" style="width:34px;height:auto;display:block;filter:drop-shadow(0 10px 18px rgba(0,0,0,.35))">
          <defs>
            <linearGradient id="popTriGrad-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${popFillHi}"/><stop offset="100%" stop-color="${popFill}"/></linearGradient>
            <radialGradient id="popTriHi-${uid}" cx="35%" cy="20%" r="75%"><stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="55%" stop-color="rgba(255,255,255,.10)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <path d="M50 0 C53 0 55 2 56.5 4.5 L99 85 C101 88 99 91 95 91 L5 91 C1 91 -1 88 1 85 L43.5 4.5 C45 2 47 0 50 0Z" fill="url(#popTriGrad-${uid})"/>
          <path d="M50 6 C52 6 54 7.2 55.2 9.6 L92 80 C94 83 92.2 86 88.4 86 L11.6 86 C7.8 86 6 83 8 80 L44.8 9.6 C46 7.2 48 6 50 6Z" fill="url(#popTriHi-${uid})"/>
          <rect x="46" y="20" width="8" height="34" rx="3" fill="rgba(0,0,0,.78)"/>
          <circle cx="50" cy="66" r="5" fill="rgba(0,0,0,.78)"/>
        </svg>`;

    const rows = items.length ? items.map((it, i)=>{
      const id = safeSvcIdLocal(it.cat);
      const nm = (typeof window.catLabel==="function") ? window.catLabel(it.cat) : it.cat;
      return `
        <button class="diagPopRowBtn" type="button" data-target="${id}" style="width:100%;text-align:left;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:8px 10px;color:inherit;display:flex;align-items:center;gap:6px;cursor:pointer">
          <span class="rankNum">${i+1}.</span>
          <span class="tbName" style="flex:0 1 340px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(nm)}</span>
          <span class="tbVal" style="margin-left:6px;color:rgba(255,255,255,.75);font-weight:900;white-space:nowrap">${lbl} ${fmtPctLocal(it.val)}</span>
        </button>
      `;
    }).join("") : `<div class="notice" style="padding:8px 2px">No services</div>`;

    // Remove any existing popup
    if(window.closeDiagPopup) window.closeDiagPopup();

    const pop = document.createElement("div");
    pop.id = "diagBandPopup";
    pop.className = "diagPopup";
    pop.style.cssText = "position:fixed;z-index:9999;width:520px;max-width:calc(100vw - 24px);background:linear-gradient(180deg, rgba(22,28,44,.98), rgba(10,14,24,.98));border:1px solid rgba(255,255,255,.10);border-radius:16px;box-shadow:0 22px 60px rgba(0,0,0,.55);overflow:hidden";

    pop.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08)">
        <div style="font-weight:1000;letter-spacing:.4px;display:flex;align-items:center;gap:10px">${title}${iconSvg}</div>
        <button onclick="window.closeDiagPopup&&window.closeDiagPopup()" aria-label="Close"
          style="margin-left:auto;background:transparent;border:none;color:rgba(255,255,255,.75);font-size:22px;cursor:pointer;line-height:1">×</button>
      </div>
      <div style="padding:10px 12px;display:grid;gap:8px;max-height:420px;overflow:auto;overflow-x:hidden">
        ${rows}
      </div>
    `;
    document.body.appendChild(pop);

    pop.addEventListener("click", (ev)=>{
      const btn = ev.target && ev.target.closest ? ev.target.closest(".diagPopRowBtn") : null;
      if(!btn) return;
      const targetId = btn.getAttribute("data-target");
      if(targetId){ const el = document.getElementById(targetId); if(el) el.scrollIntoView({behavior:"smooth", block:"start"}); }
      window.closeDiagPopup && window.closeDiagPopup();
    }, true);

    const r = slice.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    let left = r.right + 10, top = r.top - 6;
    const vw = window.innerWidth, vh = window.innerHeight;
    if(left + pr.width > vw - 8) left = r.left - pr.width - 10;
    if(top + pr.height > vh - 8) top = Math.max(8, vh - pr.height - 8);
    if(top < 8) top = 8;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    setTimeout(()=>{
      const onDoc = (ev2)=>{
        if(!pop.contains(ev2.target)){ document.removeEventListener("mousedown", onDoc, true); window.closeDiagPopup && window.closeDiagPopup(); }
      };
      document.addEventListener("mousedown", onDoc, true);
    }, 0);
    const onEsc = (ev2)=>{ if(ev2.key==="Escape"){ document.removeEventListener("keydown", onEsc, true); window.closeDiagPopup && window.closeDiagPopup(); } };
    document.addEventListener("keydown", onEsc, true);
  }, true);
})();

function renderAdvisorDetail(advisorId){

  // --- Inject scoped CSS (only once) ---
  (function ensureAdvDetailCSS(){
    if(document.getElementById('advDetailCSS')) return;
    const st = document.createElement('style');
    st.id = 'advDetailCSS';
    st.textContent = `
      /* Prevent Bottom 3 lists from being clipped */
      .advPickPanel.diagSection{display:flex;flex-direction:column;overflow:hidden}
      .advPickPanel.diagSection>.phead{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden}
      .advPickPanel.diagSection .pickRow{min-height:0}

      .advPickPanel.diagSection .diagBandLegend{color:#fff}
      .advPickPanel.diagSection .diagBandLegend .legendRest{color:#fff}
      .advPickPanel.diagSection .diagBandLegend .legendName{font-weight:1000}
      .advPickPanel.diagSection .diagBandLegend .legendRed{color:#ff4b4b}
      .advPickPanel.diagSection .diagBandLegend .legendYellow{color:#ffbf2f}
      .advPickPanel.diagSection .diagBandLegend .legendGreen{color:#1fcb6a}

      /* Pie chart styles (mirrors .techPickPanel rules in app.css) */
      body.route-advisor .advPickPanel.diagSection .diagPieWrap{display:flex;align-items:center;justify-content:center;margin-top:10px}
      body.route-advisor .advPickPanel.diagSection .diagPieSvg{width:142px;height:142px;display:block;overflow:visible}
      body.route-advisor .advPickPanel.diagSection .diagPieTxt{fill:#fff;font-weight:700;font-size:20px}
      body.route-advisor .advPickPanel.diagSection .diagPieLeader{stroke:rgba(255,255,255,.9);stroke-width:1}
      body.route-advisor .advPickPanel.diagSection .diagPieRing{stroke:rgba(255,255,255,.85);stroke-width:1.2}
      body.route-advisor .advPickPanel.diagSection .diagPieWrap,
      body.route-advisor .advPickPanel.diagSection .diagPieSvg{cursor:pointer}
      body.route-advisor .advPickPanel.diagSection .diagPieSlice{cursor:pointer;transition:filter 140ms ease, opacity 140ms ease, transform 140ms ease;transform-origin:center center}
      body.route-advisor .advPickPanel.diagSection .diagPieSlice:hover{opacity:1;filter:brightness(1.35) drop-shadow(0 6px 10px rgba(0,0,0,.35))}

      .advDetailControls select{color:#fff}
      .advDetailControls select option{color:#000}

      body.route-advisor .catCard .catHeader .svcGauge .pctSub,
      body.route-advisor .catCard .catHeader .svcGauge .pctTitle{
        font-size:12px !important;
        letter-spacing:.25px !important;
      }
    `;
    document.head.appendChild(st);
  })();

  // --- Find advisor ---
  const advisors = (DATA.advisors||[]).filter(a => a && String(a.id||"").toLowerCase()!=="total");
  const t = advisors.find(x=>String(x.id)===String(advisorId));
  if(!t){
    document.getElementById('app').innerHTML = `<div class="panel"><div class="phead" style="display:flex;flex-direction:column;min-height:0"><div class="h2">Advisor not found</div><div class="sub"><a href="#/advisors">Back to Advisors</a></div></div></div>`;
    return;
  }

  // --- Parse query string ---
  let filterKey = "total";
  let compareBasis = "advisors"; // advisors | goal
  let focus = "sold"; // sold | goal
  let goalMetric = "sold"; // always sold for advisors
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      if(k==="filter") filterKey = decodeURIComponent(v||"") || "total";
      if(k==="compare"){
        const vv = decodeURIComponent(v||"") || "advisors";
        compareBasis = (vv==="goal") ? "goal" : "advisors";
      }
      if(k==="focus"){
        const vv = decodeURIComponent(v||"") || "sold";
        focus = (vv==="sold"||vv==="goal") ? vv : "sold";
      }
      if(k==="goal"){
        goalMetric = "sold"; // always sold for advisors
      }
    }
  }

  try{ document.body.dataset.techFocus = focus; document.body.dataset.techGoalMetric = goalMetric; }catch(e){}

  // --- Helper functions ---
  function _fmtDec(v){ return Number.isFinite(v) ? v.toFixed(2) : "—"; }
  function _fmtPctPop(v){ return Number.isFinite(v) ? Math.round(v*100)+"%" : "—"; }
  function _gradeAndPct(ratio){
    const pct100 = Number.isFinite(ratio) ? Math.round(ratio*100) : NaN;
    const gr = Number.isFinite(pct100) ? _gradeFromPct100(pct100) : "—";
    const pa = Number.isFinite(pct100) ? pct100+"%" : "—";
    return { grade: gr, pctAttained: pa };
  }

  const _cmpLabel = "Advisor Avg";

  function _popupSold(cmpClose, techClose, pctCmpClose){
    const gp = _gradeAndPct(pctCmpClose);
    return { rows:[
      { label: _cmpLabel+" Sold %", value: _fmtPctPop(cmpClose) },
      { label: "Advisor's Sold %", value: _fmtPctPop(techClose) }
    ], grade: gp.grade, pctAttained: gp.pctAttained };
  }
  function _popupSoldGoal(goalClose, techClose, pctGoalClose){
    const gp = _gradeAndPct(pctGoalClose);
    return { rows:[
      { label: "Sold/ASR % Goal", value: _fmtPctPop(goalClose) },
      { label: "Advisor's Sold/ASR %", value: _fmtPctPop(techClose) }
    ], grade: gp.grade, pctAttained: gp.pctAttained };
  }
  function _popupAsrGoal(goalReq, techReq, pctGoalReq){
    const gp = _gradeAndPct(pctGoalReq);
    return { rows:[
      { label: "ASRs/RO Goal", value: _fmtDec(goalReq) },
      { label: "Advisor's ASRs/RO", value: _fmtDec(techReq) }
    ], grade: gp.grade, pctAttained: gp.pctAttained };
  }
  function _popupAsr(cmpReq, techReq, pctCmpReq){
    const gp = _gradeAndPct(pctCmpReq);
    return { rows:[
      { label: _cmpLabel+" ASRs/RO", value: _fmtDec(cmpReq) },
      { label: "Advisor's ASRs/RO", value: _fmtDec(techReq) }
    ], grade: gp.grade, pctAttained: gp.pctAttained };
  }

  function safeSvcId(cat){
    return "adv-svc-" + String(cat||"").toLowerCase()
      .replace(/&/g,"and")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"");
  }

  // --- Category universe & benchmarks ---
  function categoryUniverse(){
    const cats=new Set();
    for(const x of advisors){
      for(const k of Object.keys(x.categories||{})) cats.add(k);
    }
    return Array.from(cats);
  }
  const CAT_LIST = categoryUniverse();

  function buildBench(scopeAdvisors){
    const bench={};
    for(const cat of CAT_LIST){
      const reqs=[], closes=[], asrCounts=[];
      let topReq=-1, topName="—", topClose=null;
      for(const x of scopeAdvisors){
        const c=x.categories?.[cat];
        const req=Number(c?.req);
        const close=Number(c?.close);
        const asrN=Number(c?.asr);
        if(Number.isFinite(req)) reqs.push(req);
        if(Number.isFinite(close)) closes.push(close);
        if(Number.isFinite(asrN)) asrCounts.push(asrN);
        if(Number.isFinite(req) && req>topReq){
          topReq=req; topName=x.name||"—";
          topClose=Number.isFinite(close)?close:null;
        }
      }
      bench[cat]={
        avgReq: reqs.length? reqs.reduce((a,b)=>a+b,0)/reqs.length : null,
        avgClose: closes.length? closes.reduce((a,b)=>a+b,0)/closes.length : null,
        avgAsr: asrCounts.length? asrCounts.reduce((a,b)=>a+b,0)/asrCounts.length : null,
        topReq: topReq>=0? topReq : null,
        topClose, topName
      };
    }
    return bench;
  }

  const ADV_BENCH = buildBench(advisors);

  function getBenchmarks(cat){
    try{ return (ADV_BENCH && ADV_BENCH[cat]) ? ADV_BENCH[cat] : {}; }catch(e){ return {}; }
  }

  // --- Band counts for diag pie ---
  function countBandsFor(mode){
    let red=0, yellow=0, green=0;
    for(const cat of CAT_LIST){
      const mine = t?.categories?.[cat];
      if(!mine) continue;
      const val = (mode==="sold") ? Number(mine.close) : Number(mine.req);
      const base = (mode==="sold") ? Number(ADV_BENCH?.[cat]?.avgClose) : Number(ADV_BENCH?.[cat]?.avgReq);
      if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) continue;
      const pct = val/base;
      if(pct >= 0.80) { green++; continue; }
      if(pct >= 0.60) yellow++;
      else red++;
    }
    return {red, yellow, green};
  }

  // --- Ranking ---
  function rankFor(cat){
    const total = advisors.length || 0;
    function scoreFor(x){
      const c = x.categories?.[cat] || {};
      let v = NaN;
      if(focus==="goal"){
        const close = Number(c.close);
        const gClose = Number(getGoal(cat,"close"));
        v = (Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN;
      }else{
        v = Number(c.close);
      }
      return Number.isFinite(v) ? v : -Infinity;
    }
    const scored = advisors.map(x=>({id:x.id, v: scoreFor(x)}));
    scored.sort((a,b)=> (a.v < b.v) ? 1 : (a.v > b.v) ? -1 : 0);
    const meScore = scoreFor(t);
    if(!total) return {rank:null, total:0};
    if(meScore === -Infinity) return {rank: total, total};
    const idx = scored.findIndex(o=>o.id===t.id);
    return {rank: (idx>=0 ? idx+1 : total), total};
  }

  // --- Focus rank badge ---
  function rankBadgeHtml(rank, total, foc, size="lg"){
    let top;
    if(foc==="sold") top = (size==="lg") ? "Sold/RO" : "SOLD%";
    else if(foc==="goal") top = "Sold Goal";
    else top = "Sold/RO";
    const r = (rank===null || rank===undefined || rank==="") ? "—" : rank;
    const tt = (total===null || total===undefined || total==="") ? "—" : total;
    const cls = (size==="sm") ? "rankFocusBadge sm" : "rankFocusBadge";
    const style = (size==="lg") ? ' style="--w:99px;--h:99px;--r:20px;"' : ((size==="dial") ? ' style="--w:90px;--h:90px;--r:20px;"' : "");
    return `
      <div class="${cls}"${style}>
        <div class="rfbFocus" style="font-weight:1000;text-transform:none">${top}</div>
        <div class="rfbMain" style="font-weight:1000">${r}</div>
        <div class="rfbOf" style="font-weight:1000"><span class="rfbOfWord" style="font-weight:1000">of</span><span class="rfbOfNum" style="font-weight:1000">${tt}</span></div>
      </div>
    `;
  }

  // --- Advisor metrics ---
  const s = t.summary?.[filterKey] || {};

  function advAsrPerRo(a, fk){
    const sm = a?.summary?.[fk];
    const v = Number(sm?.asr_per_ro);
    return Number.isFinite(v) ? v : NaN;
  }
  function advSoldPct(a, fk){
    const sm = a?.summary?.[fk];
    const v = Number(sm?.sold_pct);
    return Number.isFinite(v) ? v : NaN;
  }

  function advGoalScore(x){
    let sum=0, n=0;
    for(const cat of CAT_LIST){
      const c = x.categories?.[cat];
      if(!c) continue;
      const close = Number(c.close ?? NaN);
      const gClose = Number(getGoal(cat,"close"));
      if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0){ sum += (close/gClose); n++; }
    }
    return n ? (sum/n) : null;
  }

  // --- Overall ranking ---
  const metricForRank = (x)=> {
    if(focus==="goal") return Number(advGoalScore(x));
    return Number(advSoldPct(x, filterKey));
  };
  const ordered = advisors.slice().sort((a,b)=>{
    const nb = metricForRank(b);
    const na = metricForRank(a);
    return (Number.isFinite(nb)?nb:-999) - (Number.isFinite(na)?na:-999);
  });
  const myV = metricForRank(t);
  const idx = Number.isFinite(myV) ? ordered.findIndex(o=>o.id===t.id) : -1;
  const overall = ordered.length ? {rank: (idx>=0?idx+1:null), total: ordered.length} : {rank:null,total:null};

  const __asrsTotal = Number(s.asr);
  const __soldTotal = Number(s.sold);
  const __rosTotal = Number(t.ros);
  const __soldAsrPct = (Number.isFinite(__soldTotal) && Number.isFinite(__asrsTotal) && __asrsTotal>0) ? (__soldTotal/__asrsTotal) : NaN;
  const __soldAsrPctTxt = Number.isFinite(__soldAsrPct) ? `(${(__soldAsrPct*100).toFixed(1)}%)` : "";
  const __soldAsrPctFocus = Number.isFinite(__soldAsrPct) ? `${(__soldAsrPct*100).toFixed(1)}%` : "—";
  const __asrPerRoVal = advAsrPerRo(t, filterKey);
  const __asrPerRoTxt = fmt1(__asrPerRoVal, 1);
  const __soldPerRoVal = (Number.isFinite(__soldTotal) && Number.isFinite(t.ros) && Number(t.ros)>0) ? (__soldTotal/Number(t.ros)) : NaN;
  const __soldPerRoTxt = Number.isFinite(__soldPerRoVal) ? fmt1(__soldPerRoVal, 1) : "—";

  const __effFocusHdr = "sold";
  const __topFocusVal = __soldPerRoTxt;
  const __topFocusLbl = "Sold/RO";
  const __botFocusVal = __asrPerRoTxt;
  const __botFocusLbl = "ASRs/RO";

  const __fullName = String(t.name||"").trim();
  const __parts = __fullName.split(/\s+/).filter(Boolean);
  const __first = (__parts.shift() || __fullName || "—");
  const __rest = __parts.join(" ");
  const __nameHtml = __rest
    ? `<span style="display:block;line-height:1.02">${safe(__first)}</span><span style="display:block;line-height:1.02">${safe(__rest)}</span>`
    : `${safe(__first)}`;

  // --- Filters ---
  const filters = `
    <div class="controls advDetailControls" style="margin-top:0">
      <div>
        <label>Fluids</label>
        <select id="advFilter">
          <option value="total" ${filterKey==="total"?"selected":""}>With Fluids (Total)</option>
          <option value="without_fluids" ${filterKey==="without_fluids"?"selected":""}>Without Fluids</option>
          <option value="fluids_only" ${filterKey==="fluids_only"?"selected":""}>Fluids Only</option>
        </select>
      </div>
      <div>
        <label>Focus</label>
        <select id="advFocus">
          <option value="sold" ${focus==="sold"?"selected":""}>Sold</option>
          <option value="goal" ${focus==="goal"?"selected":""}>Sold Goal</option>
        </select>
      </div>
    </div>
  `;

  // --- Header HTML ---
  const header = `
<div class="techNotchStage" style="position:relative; width:100%; overflow:visible;">
  <div class="panel techMenuNotch" style="
    position:absolute; left:-68px; top:0px; width:68px; height:56px;
    display:flex; align-items:center; justify-content:center;
    border-top-right-radius:0px; border-bottom-right-radius:0px; border-right:none; z-index:3;">
    <label for="menuToggle" class="hamburgerMini" aria-label="Menu" style="
      font-size:1.5em; line-height:1; display:flex; align-items:center; justify-content:center;
      padding:8px 10px; cursor:pointer; color:inherit; user-select:none;">☰</label>
  </div>

  <div class="panel techHeaderPanel" style="height:100%;min-width:0;border-top-left-radius:0px;border-left:none;">
    <div class="phead">
      <div class="techHdrTop" style="display:flex;flex-direction:column;min-height:0">
        <div class="titleRow techTitleRow" style="position:relative;align-items:flex-start;">
          <div style="display:flex;flex-direction:column;min-width:0;flex:0 1 auto;">
            <div style="min-width:0;">
              <div class="h2 techH2Big">${__nameHtml}</div>
              <div class="techTeamLine">ADVISOR</div>
            </div>
            <div style="margin-top:14px; display:flex !important; flex-direction:column !important; flex-wrap:nowrap !important; gap:6px;">
              <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="pillMini" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);">
                  <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">Avg ODO</div>
                  <div class="v" style="font-size:20px; font-weight:1000; line-height:1;">${fmtInt(t.odo)}</div>
                </div>
                <div class="pillMini" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);">
                  <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">ROs</div>
                  <div class="v" style="font-size:20px; font-weight:1000; line-height:1;">${fmtInt(t.ros)}</div>
                </div>
                <div class="pillMini" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);">
                  <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">ASRs/RO</div>
                  <div class="v" style="font-size:20px; font-weight:1000; line-height:1;">${__asrPerRoTxt}</div>
                </div>
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                <div class="pillMini" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);">
                  <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">ASRs</div>
                  <div class="v" style="font-size:20px; font-weight:1000; line-height:1;">${fmtInt(s.asr)}</div>
                </div>
                <div class="pillMini sold" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(190,255,210,.22);background:rgba(0,0,0,.18);">
                  <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">Sold</div>
                  <div class="v" style="font-size:20px; font-weight:1000; line-height:1; color:#fff;">${fmtInt(s.sold)}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="techRankPinned" style="position:absolute;top:2px;right:0;display:flex;flex-direction:row;align-items:flex-start;gap:12px;margin-right:4px;">
            ${rankBadgeHtml(overall.rank ?? "—", overall.total ?? "—", focus, "lg")}
            <div style="text-align:right;line-height:1;align-self:center;display:flex;flex-direction:column;align-items:flex-end;gap:10px;">
              <div style="text-align:right">
                <div style="font-size:38px;font-weight:1000;letter-spacing:.2px;color:#fff;">${__soldPerRoTxt}</div>
                <div style="margin-top:4px;font-size:14px;font-weight:1000;letter-spacing:.3px;color:rgba(255,255,255,.70);text-transform:none;">Sold/RO</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:28px;font-weight:1000;letter-spacing:.2px;color:#fff;">${__soldAsrPctFocus}</div>
                <div style="margin-top:4px;font-size:14px;font-weight:1000;letter-spacing:.3px;color:rgba(255,255,255,.70);text-transform:none;">Sold/ASRs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="techHdrBottom" style="margin-top:auto">
        <div style="height:1px; background:rgba(255,255,255,.14); margin:12px 0 12px 0;"></div>
        ${filters}
      </div>
    </div>
  </div>
</div>
  `;

  // --- Category card rendering ---
  function renderCategoryCard(cat){
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const asrCount = Number(c.asr ?? 0);
    const soldCount = Number(c.sold ?? 0);
    const req = Number(c.req ?? NaN);
    const close = Number(c.close ?? NaN);
    const advRos = Number(t.ros ?? 0);

    const basis = getBenchmarks(cat) || {};
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

    let hdrPct = pctCmpClose;
    if(focus==="goal"){
      const parts = [];
      if(Number.isFinite(pctGoalClose)) parts.push(pctGoalClose);
      hdrPct = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
    }

    const _hdrPopup = (focus==="goal")
      ? _popupSoldGoal(goalClose, close, pctGoalClose)
      : _popupSold(cmpClose, close, pctCmpClose);

    const rk = rankFor(cat);
    const compareLabel = "Advisor Avg";

    const avgAsrCount = Number(basis.avgAsr);
    const avgAsrTxt = Number.isFinite(avgAsrCount) ? fmt1(avgAsrCount, 1) : "—";

    const asrBlock = `
      <div class="metricBlock metricBlockDivided">
        <div class="mbLeft">
          <div class="mbKicker">ASR/RO</div>
          <div class="mbStat ${bandClass(pctCmpReq)}">${fmtPct(req)}</div>
        </div>
        <div class="mbRight">
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpReq)}</div>
              <div class="mbSub" style="margin-top:2px;font-size:11px;color:rgba(255,255,255,.50)">${avgAsrTxt} avg ASRs</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpReq)? svcGauge(pctCmpReq,"", _popupAsr(cmpReq, req, pctCmpReq)):""}</div>
          </div>
        </div>
      </div>
    `;

    const soldBlock = `
      <div class="metricBlock metricBlockDivided">
        <div class="mbLeft">
          <div class="mbKicker">Sold</div>
          <div class="mbStat ${bandClass(pctCmpClose)}">${fmtPct(close)}</div>
        </div>
        <div class="mbRight">
          ${(focus==="goal") ? `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalClose)? svcGauge(pctGoalClose,"", _popupSoldGoal(goalClose, close, pctGoalClose)):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpClose)? svcGauge(pctCmpClose,"", _popupSold(cmpClose, close, pctCmpClose)):""}</div>
          </div>
          ` : `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpClose)? svcGauge(pctCmpClose,"", _popupSold(cmpClose, close, pctCmpClose)):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalClose)? svcGauge(pctGoalClose,"", _popupSoldGoal(goalClose, close, pctGoalClose)):""}</div>
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
      <div class="catCard" id="${safeSvcId(cat)}">
        <div class="catHeader">
          <div class="svcGaugeWrap" style="--sz:74px">${Number.isFinite(hdrPct)? svcGauge(hdrPct, (focus==="goal"?"Goal":"Sold%"), _hdrPopup) : ""}</div>
          <div>
            <div class="catTitle">${safe(catLabel(cat))}</div>
            <div class="muted svcMetaLine" style="margin-top:2px">
              <span class="svcMetaTopLine">${fmt1(advRos,0)} ROs · ${fmt1(asrCount,0)} ASRs</span><br><span class="svcMetaSoldLine" style="display:block;margin-top:2px;">${fmt1(soldCount,0)} Sold</span>
            </div>
          </div>
          <div class="catRank">${rankBadgeHtml(rk && rk.rank ? rk.rank : "—", rk && rk.total ? rk.total : "—", focus, "sm")}</div>
        </div>
        <div class="metricStack">
          ${soldBlock}
          ${asrBlock}
        </div>
      </div>
    `;
  }

  // --- Section stats ---
  function sectionStatsForAdvisor(sec){
    const cats = sec.categories || [];
    const reqs = cats.map(cat=>Number(t.categories?.[cat]?.req)).filter(n=>Number.isFinite(n));
    const closes = cats.map(cat=>Number(t.categories?.[cat]?.close)).filter(n=>Number.isFinite(n));
    const sumReq = reqs.length ? reqs.reduce((a,b)=>a+b,0) : null;
    const avgClose = closes.length ? closes.reduce((a,b)=>a+b,0)/closes.length : null;
    return { sumReq, avgClose };
  }

  function sectionScoreForAdvisor(sec, x){
    const cats = sec.categories || [];
    const vals = [];
    for(const cat of cats){
      const c = x.categories?.[cat];
      if(!c) continue;
      if(focus==="goal"){
        const v = Number(c.close);
        const g = Number(getGoal(cat,"close"));
        if(Number.isFinite(v) && Number.isFinite(g) && g>0) vals.push(v/g);
      }else{
        const v = Number(c.close);
        if(Number.isFinite(v)) vals.push(v);
      }
    }
    if(!vals.length) return NaN;
    return vals.reduce((a,b)=>a+b,0)/vals.length;
  }

  function sectionRankFor(sec){
    const vals = advisors
      .map(x=>({id:x.id, v: sectionScoreForAdvisor(sec, x)}))
      .filter(o=>Number.isFinite(o.v))
      .sort((a,b)=>b.v-a.v);
    const me = sectionScoreForAdvisor(sec, t);
    if(!Number.isFinite(me)) return {rank:null, total: vals.length};
    const _idx = vals.findIndex(o=>o.id===t.id);
    return {rank: _idx>=0 ? _idx+1 : null, total: vals.length};
  }

  // --- Sections HTML ---
  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const secStats = sectionStatsForAdvisor(sec);
    const secRank = sectionRankFor(sec);
    const cats = (sec.categories||[]);

    const benchReqs = cats.map(cat=>{
      const b = getBenchmarks(cat);
      return Number(b && b.avgReq);
    }).filter(n=>Number.isFinite(n) && n>0);
    const benchCloses = cats.map(cat=>{
      const b = getBenchmarks(cat);
      return Number(b && b.avgClose);
    }).filter(n=>Number.isFinite(n) && n>0);

    const benchReq = benchReqs.length ? benchReqs.reduce((a,b)=>a+b,0) : NaN;
    const benchClose = benchCloses.length ? mean(benchCloses) : NaN;

    const goalCloses = cats.map(cat=>Number(getGoal(cat,"close"))).filter(n=>Number.isFinite(n) && n>0);
    const goalClose = goalCloses.length ? mean(goalCloses) : NaN;

    const asrVal = Number(secStats.sumReq);
    const soldVal = Number(secStats.avgClose);

    const pctAsr = (Number.isFinite(asrVal) && Number.isFinite(benchReq) && benchReq>0) ? (asrVal/benchReq) : NaN;
    const pctSold = (Number.isFinite(soldVal) && Number.isFinite(benchClose) && benchClose>0) ? (soldVal/benchClose) : NaN;
    const pctGoalSold = (Number.isFinite(soldVal) && Number.isFinite(goalClose) && goalClose>0) ? (soldVal/goalClose) : NaN;

    const goalFocusPct = pctGoalSold;
    const goalFocusLbl = "Sold Goal";
    const focusPct = (focus==="goal") ? goalFocusPct : pctSold;
    const focusLbl = (focus==="goal") ? goalFocusLbl : "Sold%";

    const dialASR = Number.isFinite(pctAsr)
      ? `<div class="svcGaugeWrap" style="--sz:55px">${svcGauge(pctAsr,"ASRs/RO", _popupAsr(benchReq, asrVal, pctAsr))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:55px"></div>`;
    const dialSold = Number.isFinite(pctSold)
      ? `<div class="svcGaugeWrap" style="--sz:55px">${svcGauge(pctSold,"Sold%", _popupSold(benchClose, soldVal, pctSold))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:55px"></div>`;
    const dialGoalSold = Number.isFinite(pctGoalSold)
      ? `<div class="svcGaugeWrap" style="--sz:55px">${svcGauge(pctGoalSold,"Sold Goal", _popupSoldGoal(goalClose, soldVal, pctGoalSold))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:55px"></div>`;

    const _focusPopup = (focus==="goal")
      ? _popupSoldGoal(goalClose, soldVal, pctGoalSold)
      : _popupSold(benchClose, soldVal, pctSold);
    const dialFocus = Number.isFinite(focusPct)
      ? `<div class="svcGaugeWrap" style="--sz:140px">${svcGauge(focusPct,focusLbl, _focusPopup)}</div>`
      : `<div class="svcGaugeWrap" style="--sz:140px"></div>`;

    // Mini dials: show the dials NOT used as focus dial
    // ASR always shown as mini, Sold and SoldGoal shown when not the focus
    const _miniDials = [dialASR];
    if(focus==="sold"){ _miniDials.push(dialGoalSold); }
    else if(focus==="goal"){ _miniDials.push(dialSold); }
    else { _miniDials.push(dialSold); _miniDials.push(dialGoalSold); }
    const miniHtml = `<div class="secMiniDials" style="gap:22px">${_miniDials.join("")}</div>`;

    const __cats = Array.from(new Set((sec.categories||[]).filter(Boolean)));

    // Section header pills
    const __agg = __cats.reduce((a,cat)=>{
      const cc = t.categories?.[cat] || {};
      const asr = Number(cc.asr);
      const sold = Number(cc.sold);
      if(Number.isFinite(asr)) a.asr += asr;
      if(Number.isFinite(sold)) a.sold += sold;
      return a;
    },{asr:0, sold:0});

    const __secROs = Number(t.ros ?? 0);
    const __secASRs = __agg.asr;
    const __secSold = __agg.sold;
    const __soldPerRo = (Number.isFinite(__secROs) && __secROs>0 && Number.isFinite(__secSold)) ? (__secSold/__secROs) : NaN;
    const __soldPerRoTxt = Number.isFinite(__soldPerRo) ? (__soldPerRo.toFixed(2)) : "—";

    const __secHeaderPills = `
      <div class="secNamePills pills">
        <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(t.odo)}</div></div>
        <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(__secROs)}</div></div>
        <div class="pill"><div class="k">ASRs</div><div class="v">${fmtInt(__secASRs)}</div></div>
        <div class="pill"><div class="k">ASRs/RO</div><div class="v">${Number.isFinite(secStats.sumReq) ? fmt1(secStats.sumReq,1) : "—"}</div></div>
        <div class="pill"><div class="k">Sold</div><div class="v">${fmtInt(__secSold)}</div></div>
      </div>
    `;

    let topStatVal, topStatTitle, botStatVal, botStatTitle;
    topStatVal = fmtPct(secStats.avgClose); topStatTitle = "Sold";
    botStatVal = __soldPerRoTxt; botStatTitle = "Sold/RO";

    const rows = __cats.map(cat=>renderCategoryCard(cat)).join("");

    return `
      <div class="panel">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div class="h2 techH2">${safe(sec.name)}</div>
                ${__secHeaderPills}
              </div>
              <div class="sub"></div>
            </div>
            <div class="secHdrRight" style="gap:22px">${miniHtml}<div class="secFocusDial" style="margin:0">${dialFocus}</div><div class="secHdrRank" style="margin:0">${rankBadgeHtml(secRank && secRank.rank ? secRank.rank : "—", secRank && secRank.total ? secRank.total : "—", focus, "dial")}</div><div class="secHdrStats" style="text-align:right;display:flex;flex-direction:column;align-items:flex-end">
                <div class="secStatBlock">
                  <div class="secStatVal" style="font-size:36px;font-weight:1000;line-height:1;color:#fff">${topStatVal}</div>
                  <div class="secStatTitle" style="margin-top:4px;font-size:13px;font-weight:900;color:rgba(255,255,255,.65)">${topStatTitle}</div>
                </div>
                <div class="secStatBlock" style="margin-top:10px">
                  <div class="secStatVal" style="font-size:28px;font-weight:1000;line-height:1;color:rgba(255,255,255,.78)">${botStatVal}</div>
                  <div class="secStatTitle" style="margin-top:4px;font-size:13px;font-weight:900;color:rgba(255,255,255,.55)">${botStatTitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="list">${rows ? `<div class="categoryGrid">${rows}</div>` : `<div class="notice">No categories found in this section.</div>`}</div>
      </div>
    `;
  }).join("");

  // --- Top/Bottom 3 panel ---
  const allCatsTB = Array.from(new Set((DATA.sections||[]).flatMap(s => (s.categories||[])).filter(Boolean)));
  const svcRowsTB = allCatsTB.map(cat=>{
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const req = Number(c.req);
    const close = Number(c.close);
    const label = (typeof catLabel==="function") ? catLabel(cat) : String(cat);
    return { cat, label, req, close };
  });

  const byCloseTB = svcRowsTB.filter(x=>Number.isFinite(x.close)).sort((a,b)=>b.close-a.close);
  const topCloseTB = byCloseTB.slice(0,3);
  const botCloseTB = byCloseTB.slice(-3).reverse();

  const ICON_THUMBS_UP = `<svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true"><path fill="currentColor" d="M2 10h4v12H2V10zm20 1c0-1.1-.9-2-2-2h-6.3l.9-4.4.02-.2c0-.3-.13-.6-.33-.8L13 2 7.6 7.4c-.4.4-.6.9-.6 1.4V20c0 1.1.9 2 2 2h7c.8 0 1.5-.5 1.8-1.2l3-7c.1-.3.2-.6.2-.8v-2z"/></svg>`;
  const ICON_THUMBS_DOWN = `<svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true"><path fill="currentColor" d="M2 2h4v12H2V2zm20 11c0 1.1-.9 2-2 2h-6.3l.9 4.4.02.2c0 .3-.13.6-.33.8L13 22l-5.4-5.4c-.4-.4-.6-.9-.6-1.4V4c0-1.1.9-2 2-2h7c.8 0 1.5.5 1.8 1.2l3 7c.1.3.2.6.2.8v2z"/></svg>`;

  function tbRow(item, idx2, mode){
    const metric = mode==="sold" ? item.close : item.req;
    const metricLbl = mode==="sold" ? "SOLD" : "ASR";
    return `
      <div class="techRow pickRowFrame" style="font-size:14px;font-weight:700;line-height:1.2">
        <div class="techRowLeft" style="min-width:0">
          <span class="rankNum" style="font-size:14px;font-weight:700">${idx2}.</span>
          <button type="button" class="tbJump" data-cat="${safeSvcId(item.cat)}"
            style="background:transparent;border:none;padding:0;color:inherit;cursor:pointer;text-align:left;text-decoration:underline;font:inherit;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">
            ${safe(item.label)}
          </button>
        </div>
        <div class="mini" style="font-size:14px;font-weight:700;color:#fff;white-space:nowrap;margin-left:12px">${metricLbl} = ${fmtPct(metric)}</div>
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

  const bandCounts_sold = countBandsFor('sold');

  // --- Pie chart (copied from renderTech) ---
  function diagPieChart(counts, mode){
    const red = Math.max(0, Number(counts?.red)||0);
    const yellow = Math.max(0, Number(counts?.yellow)||0);
    const green = Math.max(0, Number(counts?.green)||0);
    const total = red + yellow + green;

    const cx = 80, cy = 80, rad = 70;
    const toRad = (deg)=> (deg*Math.PI/180);
    const at = (angDeg, r)=>({
      x: cx + r * Math.cos(toRad(angDeg)),
      y: cy + r * Math.sin(toRad(angDeg))
    });
    const arcPath = (a0, a1)=>{
      const p0 = at(a0, rad);
      const p1 = at(a1, rad);
      const large = (Math.abs(a1-a0) > 180) ? 1 : 0;
      return `M ${cx} ${cy} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${rad} ${rad} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
    };

    const parts = [
      {band:"red", n:red, fill:"#ff4b4b"},
      {band:"yellow", n:yellow, fill:"#ffbf2f"},
      {band:"green", n:green, fill:"#1fcb6a"},
    ].filter(p=>p.n>0);

    if(total<=0 || !parts.length){
      return `
        <div class="diagPieWrap" aria-label="${mode.toUpperCase()} distribution (no data)">
          <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
            <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
            <text class="diagPieTxt" x="80" y="80" text-anchor="middle" dominant-baseline="middle">0</text>
          </svg>
        </div>
      `;
    }

    let ang = -90;
    const slices = [];
    for(const p of parts){
      const span = (p.n/total) * 360;
      const a0 = ang;
      const a1 = ang + span;
      ang = a1;
      const mid = (a0 + a1) / 2;
      const tooSmall = span < 26;
      const inside = at(mid, rad * 0.58);
      const outside = at(mid, rad * 1.14);
      const leader0 = at(mid, rad * 0.88);
      const leader1 = at(mid, rad * 1.04);
      slices.push({
        ...p, span, mid,
        path: arcPath(a0, a1),
        tooSmall,
        lx: (tooSmall ? outside.x : inside.x),
        ly: (tooSmall ? outside.y : inside.y),
        l0x: leader0.x, l0y: leader0.y,
        l1x: leader1.x, l1y: leader1.y
      });
    }

    return `
      <div class="diagPieWrap" aria-label="${mode.toUpperCase()} distribution">
        <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
          <defs>
            <filter id="advDiagPieShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(0,0,0,.45)" />
            </filter>
          </defs>
          <g filter="url(#advDiagPieShadow)">
            ${slices.map(s=>`
              <path class="diagPieSlice" data-tech="${t.id}" data-mode="${mode}" data-band="${s.band}" data-compare="advisors"
                d="${s.path}" fill="${s.fill}" stroke="rgba(255,255,255,.95)" stroke-width="1.6" stroke-linejoin="round" />
            `).join('')}
          </g>
          ${slices.map(s=> s.tooSmall ? `
            <line x1="${s.l0x.toFixed(2)}" y1="${s.l0y.toFixed(2)}" x2="${s.l1x.toFixed(2)}" y2="${s.l1y.toFixed(2)}"
              stroke="rgba(255,255,255,.95)" stroke-width="1.2" />
          ` : '').join('')}
          ${slices.map(s=>`
            <text class="diagPieTxt" x="${s.lx.toFixed(2)}" y="${s.ly.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${s.n}</text>
          `).join('')}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
        </svg>
      </div>
    `;
  }

  const top3Panel = `
    <div style="position:relative;overflow:visible;height:100%;">
    <div class="panel advPickPanel techPickPanel diagSection" style="height:100%;min-width:0;overflow:hidden">
      <div class="phead" style="border-bottom:none;padding:12px;display:grid;gap:14px">
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;align-self:flex-start;font-size:22px;line-height:1">SOLD</div>
              ${diagPieChart(bandCounts_sold, "sold")}
            </div>
            <div>${tbMiniBox("Top 3 Most Sold", topCloseTB, "sold", "up")}</div>
            <div>${tbMiniBox("Bottom 3 Least Sold", botCloseTB, "sold", "down")}</div>
          </div>
        </div>
      </div>
    </div>
    <svg viewBox="0 0 120 48" width="113" height="45" style="position:absolute;bottom:-19px;right:18px;overflow:visible;pointer-events:none;z-index:5;" aria-hidden="true"><rect x="0" y="27" width="120" height="3" fill="#0f1730"/><polyline points="0,28 18,28 26,28 32,8 38,44 44,20 50,28 68,28 76,28 82,8 88,44 94,20 100,28 120,28" fill="none" stroke="rgba(200,45,45,.45)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 3px rgba(200,40,40,.22));"/></svg>
    </div>
  `;

  const headerWrap = `<div class="techHeaderWrap" style="display:grid;grid-template-columns:minmax(0,0.70fr) minmax(0,1.30fr);gap:14px;align-items:stretch;margin-bottom:32px;">${header}${top3Panel}</div>`;

  // --- Render ---
  document.getElementById('app').innerHTML = `${headerWrap}${sectionsHtml}`;

  // Sync notch background
  (function syncNotchBg(){
    const notch = document.querySelector('.techNotchStage .techMenuNotch');
    const panel = document.querySelector('.techNotchStage .techHeaderPanel');
    if(!notch || !panel) return;
    const apply = ()=>{
      const cs = getComputedStyle(panel);
      notch.style.backgroundColor = cs.backgroundColor;
      notch.style.backgroundImage = cs.backgroundImage;
      notch.style.backgroundRepeat = cs.backgroundRepeat;
      notch.style.backgroundPosition = cs.backgroundPosition;
      notch.style.backgroundSize = cs.backgroundSize;
      notch.style.backgroundAttachment = cs.backgroundAttachment;
      notch.style.borderColor = cs.borderTopColor;
    };
    requestAnimationFrame(()=>{ apply(); requestAnimationFrame(apply); });
  })();

  // Top/Bottom 3 clicks → jump to service card
  const tp = document.querySelector('.advPickPanel');
  if(tp){
    tp.addEventListener('click', (e)=>{
      const b = e.target && e.target.closest ? e.target.closest('.tbJump') : null;
      if(!b) return;
      e.preventDefault();
      const id = b.getAttribute('data-cat');
      if(!id) return;
      const el = document.getElementById(id);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }, true);
  }

  animateSvcGauges();
  initSectionToggles();

  // --- Wire up filter controls ---
  function buildHash(){
    const f = encodeURIComponent(filterKey);
    const c = encodeURIComponent(compareBasis||"advisors");
    const fo = encodeURIComponent(focus||"sold");
    const g = encodeURIComponent("sold");
    return `#/advisor/${encodeURIComponent(advisorId)}?filter=${f}&compare=${c}&focus=${fo}&goal=${g}`;
  }

  const advFilterSel = document.getElementById('advFilter');
  if(advFilterSel){
    advFilterSel.addEventListener('change', ()=>{
      filterKey = advFilterSel.value || "total";
      location.hash = buildHash();
    });
  }

  const advFocusSel = document.getElementById('advFocus');
  if(advFocusSel){
    advFocusSel.addEventListener('change', ()=>{
      focus = advFocusSel.value || "sold";
      location.hash = buildHash();
    });
  }

}

window.renderAdvisorDetail = renderAdvisorDetail;
