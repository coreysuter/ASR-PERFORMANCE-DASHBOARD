// ═══════════════════════════════════════════════════════════════════════════════
// Advisor Detail Page – mirrors renderTech but uses DATA.advisors
// Route: #/advisor/{advisorId}?filter=...&compare=...&focus=...&goal=...
// ═══════════════════════════════════════════════════════════════════════════════

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
  let focus = "asr"; // asr | sold | goal
  let goalMetric = "asr"; // asr | sold
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
        const vv = decodeURIComponent(v||"") || "asr";
        focus = (vv==="sold"||vv==="goal"||vv==="asr") ? vv : "asr";
      }
      if(k==="goal"){
        const vv = decodeURIComponent(v||"") || "asr";
        goalMetric = (vv==="sold") ? "sold" : "asr";
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
      const reqs=[], closes=[];
      let topReq=-1, topName="—", topClose=null;
      for(const x of scopeAdvisors){
        const c=x.categories?.[cat];
        const req=Number(c?.req);
        const close=Number(c?.close);
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
      if(focus==="sold") v = Number(c.close);
      else if(focus==="goal"){
        const req = Number(c.req);
        const close = Number(c.close);
        const gReq = Number(getGoal(cat,"req"));
        const gClose = Number(getGoal(cat,"close"));
        if(goalMetric==="sold"){
          v = (Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN;
        }else{
          v = (Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN;
        }
      }else{
        v = Number(c.req);
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
    else if(foc==="goal") top = (goalMetric==="sold") ? "Sold Goal" : "ASR Goal";
    else top = "ASRs/RO";
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
      const req = Number(c.req ?? NaN);
      const close = Number(c.close ?? NaN);
      const gReq = Number(getGoal(cat,"req"));
      const gClose = Number(getGoal(cat,"close"));
      if(goalMetric==="sold"){
        if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0){ sum += (close/gClose); n++; }
      }else{
        if(Number.isFinite(req) && Number.isFinite(gReq) && gReq>0){ sum += (req/gReq); n++; }
      }
    }
    return n ? (sum/n) : null;
  }

  // --- Overall ranking ---
  const metricForRank = (x)=> {
    if(focus==="sold") return Number(advSoldPct(x, filterKey));
    if(focus==="goal") return Number(advGoalScore(x));
    return Number(advAsrPerRo(x, filterKey));
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
  const __asrPerRoVal = advAsrPerRo(t, filterKey);
  const __asrPerRoTxt = fmt1(__asrPerRoVal, 1);
  const __soldPerRoVal = (Number.isFinite(__soldTotal) && Number.isFinite(t.ros) && Number(t.ros)>0) ? (__soldTotal/Number(t.ros)) : NaN;
  const __soldPerRoTxt = Number.isFinite(__soldPerRoVal) ? fmt1(__soldPerRoVal, 1) : "—";

  const __effFocusHdr = (focus==="goal") ? goalMetric : focus;
  const __topFocusVal = (__effFocusHdr==="sold") ? __soldPerRoTxt : __asrPerRoTxt;
  const __topFocusLbl = (__effFocusHdr==="sold") ? "Sold/RO" : "ASRs/RO";
  const __botFocusVal = (__effFocusHdr==="sold") ? __asrPerRoTxt : __soldPerRoTxt;
  const __botFocusLbl = (__effFocusHdr==="sold") ? "ASRs/RO" : "Sold/RO";

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
          <option value="asr" ${focus==="asr"?"selected":""}>ASR</option>
          <option value="sold" ${focus==="sold"?"selected":""}>Sold</option>
          <option value="goal" ${focus==="goal"?"selected":""}>Goal</option>
        </select>
      </div>
      ${focus==="goal" ? `
      <div>
        <label>Goal</label>
        <select id="advGoalMetric">
          <option value="asr" ${goalMetric==="asr"?"selected":""}>ASR</option>
          <option value="sold" ${goalMetric==="sold"?"selected":""}>Sold</option>
        </select>
      </div>` : ``}
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
          <div class="techTitlePinnedLeft" style="display:flex;align-items:flex-start;gap:18px;min-width:0;flex:1 1 auto;">
            <div class="techNameWrap techNamePinned" style="min-width:0;max-width:320px;">
              <div class="h2 techH2Big">${__nameHtml}</div>
              <div class="techTeamLine">ADVISOR</div>
            </div>
          </div>
          <div class="techRankPinned" style="position:absolute;top:2px;right:0;display:flex;flex-direction:row;align-items:flex-start;gap:12px;">
            ${rankBadgeHtml(overall.rank ?? "—", overall.total ?? "—", focus, "lg")}
            <div class="techFocusStatsPinned" style="text-align:right;line-height:1;align-self:center;display:flex;flex-direction:column;align-items:flex-end;gap:10px;margin-right:4px;">
              <div class="techFocusTop" style="text-align:right">
                <div style="font-size:38px;font-weight:1000;letter-spacing:.2px;color:#fff;">${__topFocusVal}</div>
                <div style="margin-top:4px;font-size:14px;font-weight:1000;letter-spacing:.3px;color:rgba(255,255,255,.70);text-transform:none;">${__topFocusLbl}</div>
              </div>
              <div class="techFocusBottom" style="text-align:right">
                <div style="font-size:28px;font-weight:1000;letter-spacing:.2px;color:#fff;">${__botFocusVal}</div>
                <div style="margin-top:4px;font-size:14px;font-weight:1000;letter-spacing:.3px;color:rgba(255,255,255,.70);text-transform:none;">${__botFocusLbl}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="pillsMini" style="margin-top:8px !important; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
          <div class="pillMini" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);">
            <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">Avg Odo</div>
            <div class="v" style="font-size:20px; font-weight:1000; line-height:1;">${fmtInt(t.odo)}</div>
          </div>
          <div class="pillMini" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);">
            <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">ROs</div>
            <div class="v" style="font-size:20px; font-weight:1000; line-height:1;">${fmtInt(t.ros)}</div>
          </div>
          <div class="pillMini" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.18);">
            <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">ASRs</div>
            <div class="v" style="font-size:20px; font-weight:1000; line-height:1;">${fmtInt(s.asr)}</div>
          </div>
          <div class="pillMini sold" style="display:inline-flex;gap:6px;align-items:baseline;padding:8px 12px;border-radius:999px;border:1px solid rgba(190,255,210,.22);background:rgba(0,0,0,.18);">
            <div class="k" style="font-size:16px; color:var(--muted); font-weight:900; letter-spacing:.2px; text-transform:none;">Sold/ASRs</div>
            <div class="v" style="font-size:20px; font-weight:1000; line-height:1; color:#fff;">${fmtInt(s.sold)}<span style="font-size:18px;font-weight:1000;color:#fff;margin-left:8px;white-space:nowrap">${__soldAsrPctTxt}</span></div>
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

    let hdrPct = pctCmpReq;
    if(focus==="sold") hdrPct = pctCmpClose;
    if(focus==="goal"){
      const parts = [];
      if(Number.isFinite(pctGoalReq)) parts.push(pctGoalReq);
      if(Number.isFinite(pctGoalClose)) parts.push(pctGoalClose);
      hdrPct = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
    }

    const _hdrPopup = (focus==="sold")
      ? _popupSold(cmpClose, close, pctCmpClose)
      : (focus==="goal")
        ? ((goalMetric==="sold") ? _popupSoldGoal(goalClose, close, pctGoalClose) : _popupAsrGoal(goalReq, req, pctGoalReq))
        : _popupAsr(cmpReq, req, pctCmpReq);

    const rk = rankFor(cat);
    const compareLabel = "Advisor Avg";

    const asrBlock = `
      <div class="metricBlock metricBlockDivided">
        <div class="mbLeft">
          <div class="mbKicker">ASR/RO</div>
          <div class="mbStat ${bandClass(pctCmpReq)}">${fmtPct(req)}</div>
        </div>
        <div class="mbRight">
          ${(focus==="goal") ? `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalReq)? svcGauge(pctGoalReq,"", _popupAsrGoal(goalReq, req, pctGoalReq)):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpReq)? svcGauge(pctCmpReq,"", _popupAsr(cmpReq, req, pctCmpReq)):""}</div>
          </div>
          ` : `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpReq)? svcGauge(pctCmpReq,"", _popupAsr(cmpReq, req, pctCmpReq)):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalReq)? svcGauge(pctGoalReq,"", _popupAsrGoal(goalReq, req, pctGoalReq)):""}</div>
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
          <div class="svcGaugeWrap" style="--sz:74px">${Number.isFinite(hdrPct)? svcGauge(hdrPct, (focus==="sold"?"Sold%":(focus==="goal"?"Goal":"ASR%")), _hdrPopup) : ""}</div>
          <div>
            <div class="catTitle">${safe(catLabel(cat))}</div>
            <div class="muted svcMetaLine" style="margin-top:2px">
              <span class="svcMetaTopLine">${fmt1(advRos,0)} ROs · ${fmt1(asrCount,0)} ASRs</span><br><span class="svcMetaSoldLine" style="display:block;margin-top:2px;">${fmt1(soldCount,0)} Sold</span>
            </div>
          </div>
          <div class="catRank">${rankBadgeHtml(rk && rk.rank ? rk.rank : "—", rk && rk.total ? rk.total : "—", focus, "sm")}</div>
        </div>
        <div class="metricStack">
          ${asrBlock}
          ${soldBlock}
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
      if(focus==="sold"){
        const v = Number(c.close);
        if(Number.isFinite(v)) vals.push(v);
      }else if(focus==="goal"){
        if(goalMetric==="sold"){
          const v = Number(c.close);
          const g = Number(getGoal(cat,"close"));
          if(Number.isFinite(v) && Number.isFinite(g) && g>0) vals.push(v/g);
        }else{
          const v = Number(c.req);
          const g = Number(getGoal(cat,"req"));
          if(Number.isFinite(v) && Number.isFinite(g) && g>0) vals.push(v/g);
        }
      }else{
        const v = Number(c.req);
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

    const goalReqs = cats.map(cat=>Number(getGoal(cat,"req"))).filter(n=>Number.isFinite(n) && n>0);
    const goalCloses = cats.map(cat=>Number(getGoal(cat,"close"))).filter(n=>Number.isFinite(n) && n>0);
    const goalReq = goalReqs.length ? goalReqs.reduce((a,b)=>a+b,0) : NaN;
    const goalClose = goalCloses.length ? mean(goalCloses) : NaN;

    const asrVal = Number(secStats.sumReq);
    const soldVal = Number(secStats.avgClose);

    const pctAsr = (Number.isFinite(asrVal) && Number.isFinite(benchReq) && benchReq>0) ? (asrVal/benchReq) : NaN;
    const pctSold = (Number.isFinite(soldVal) && Number.isFinite(benchClose) && benchClose>0) ? (soldVal/benchClose) : NaN;
    const pctGoalAsr = (Number.isFinite(asrVal) && Number.isFinite(goalReq) && goalReq>0) ? (asrVal/goalReq) : NaN;
    const pctGoalSold = (Number.isFinite(soldVal) && Number.isFinite(goalClose) && goalClose>0) ? (soldVal/goalClose) : NaN;

    const goalFocusPct = (goalMetric==="sold") ? pctGoalSold : pctGoalAsr;
    const goalFocusLbl = (goalMetric==="sold") ? "Sold Goal" : "ASR Goal";
    const focusPct = (focus==="sold") ? pctSold : (focus==="goal" ? goalFocusPct : pctAsr);
    const focusLbl = (focus==="sold") ? "Sold%" : (focus==="goal" ? goalFocusLbl : "ASRs/RO");

    const dialASR = Number.isFinite(pctAsr)
      ? `<div class="svcGaugeWrap" style="--sz:55px">${svcGauge(pctAsr,"ASRs/RO", _popupAsr(benchReq, asrVal, pctAsr))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:55px"></div>`;
    const dialSold = Number.isFinite(pctSold)
      ? `<div class="svcGaugeWrap" style="--sz:55px">${svcGauge(pctSold,"Sold%", _popupSold(benchClose, soldVal, pctSold))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:55px"></div>`;
    const dialGoalAsr = Number.isFinite(pctGoalAsr)
      ? `<div class="svcGaugeWrap" style="--sz:55px">${svcGauge(pctGoalAsr,"ASR Goal", _popupAsrGoal(goalReq, asrVal, pctGoalAsr))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:55px"></div>`;
    const dialGoalSold = Number.isFinite(pctGoalSold)
      ? `<div class="svcGaugeWrap" style="--sz:55px">${svcGauge(pctGoalSold,"Sold Goal", _popupSoldGoal(goalClose, soldVal, pctGoalSold))}</div>`
      : `<div class="svcGaugeWrap" style="--sz:55px"></div>`;

    const _focusPopup = (focus==="sold")
      ? _popupSold(benchClose, soldVal, pctSold)
      : (focus==="goal")
        ? ((goalMetric==="sold") ? _popupSoldGoal(goalClose, soldVal, pctGoalSold) : _popupAsrGoal(goalReq, asrVal, pctGoalAsr))
        : _popupAsr(benchReq, asrVal, pctAsr);
    const dialFocus = Number.isFinite(focusPct)
      ? `<div class="svcGaugeWrap" style="--sz:140px">${svcGauge(focusPct,focusLbl, _focusPopup)}</div>`
      : `<div class="svcGaugeWrap" style="--sz:140px"></div>`;

    // Mini dials (same logic as renderTech)
    const _miniMap = { ASR: dialASR, Sold: dialSold, ASRGoal: dialGoalAsr, SoldGoal: dialGoalSold };
    if(focus==="sold") _miniMap.Sold = "";
    else if(focus==="goal"){ if(goalMetric==="sold") _miniMap.SoldGoal = ""; else _miniMap.ASRGoal = ""; }
    else _miniMap.ASR = "";

    let _adjKey = "Sold";
    if(focus==="sold") _adjKey = "SoldGoal";
    else if(focus==="goal") _adjKey = (goalMetric==="sold") ? "Sold" : "ASR";
    else _adjKey = "ASRGoal";

    const _baseOrder = ["ASR","Sold","ASRGoal","SoldGoal"];
    const _rest = _baseOrder.filter(k => k !== _adjKey && _miniMap[k]);
    const minisOrdered = _rest.map(k => _miniMap[k]);
    if(_miniMap[_adjKey]) minisOrdered.push(_miniMap[_adjKey]);
    const miniHtml = `<div class="secMiniDials" style="gap:22px">${minisOrdered.join("")}</div>`;

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
        <div class="pill"><div class="k">Sold</div><div class="v">${fmtInt(__secSold)}</div></div>
        <div class="pill"><div class="k">Sold/RO</div><div class="v">${__soldPerRoTxt}</div></div>
      </div>
    `;

    let topStatVal, topStatTitle, botStatVal, botStatTitle;
    if(focus==="goal"){
      if(goalMetric==="sold"){
        topStatVal = fmtPct(secStats.avgClose); topStatTitle = "Sold";
        botStatVal = fmt1(secStats.sumReq,1); botStatTitle = "ASRs/RO";
      }else{
        topStatVal = fmt1(secStats.sumReq,1); topStatTitle = "ASRs/RO";
        botStatVal = fmtPct(goalClose); botStatTitle = "Sold Goal";
      }
    }else if(focus==="sold"){
      topStatVal = fmtPct(secStats.avgClose); topStatTitle = "Sold";
      botStatVal = fmt1(secStats.sumReq,1); botStatTitle = "ASRs/RO";
    }else{
      topStatVal = fmt1(secStats.sumReq,1); topStatTitle = "ASRs/RO";
      botStatVal = fmtPct(secStats.avgClose); botStatTitle = "Sold";
    }

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

  const byReqTB = svcRowsTB.filter(x=>Number.isFinite(x.req)).sort((a,b)=>b.req-a.req);
  const byCloseTB = svcRowsTB.filter(x=>Number.isFinite(x.close)).sort((a,b)=>b.close-a.close);
  const topReqTB = byReqTB.slice(0,3);
  const botReqTB = byReqTB.slice(-3).reverse();
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

  const bandCounts_asr = countBandsFor('asr');
  const bandCounts_sold = countBandsFor('sold');

  // --- Pie chart (reuse same logic as renderTech) ---
  function diagPieChart(counts, mode){
    const red = Math.max(0, Number(counts?.red)||0);
    const yellow = Math.max(0, Number(counts?.yellow)||0);
    const green = Math.max(0, Number(counts?.green)||0);
    const total = red + yellow + green;

    const cx2 = 80, cy2 = 80, rad = 70;
    const toRad = (deg)=> (deg*Math.PI/180);
    const at = (angDeg, r)=>({ x: cx2 + r * Math.cos(toRad(angDeg)), y: cy2 + r * Math.sin(toRad(angDeg)) });
    const arcPath = (a0, a1)=>{
      const p0 = at(a0, rad); const p1 = at(a1, rad);
      const large = (Math.abs(a1-a0) > 180) ? 1 : 0;
      return `M ${cx2} ${cy2} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${rad} ${rad} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
    };

    const partsList = [
      {band:"red", n:red, fill:"#ff4b4b"},
      {band:"yellow", n:yellow, fill:"#ffbf2f"},
      {band:"green", n:green, fill:"#1fcb6a"},
    ].filter(p=>p.n>0);

    if(total<=0 || !partsList.length){
      return `<div class="diagPieWrap" aria-label="${mode.toUpperCase()} distribution (no data)">
        <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
          <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
          <text class="diagPieTxt" x="80" y="80" text-anchor="middle" dominant-baseline="middle">0</text>
        </svg>
      </div>`;
    }

    let ang = -90;
    const slices = [];
    for(const p of partsList){
      const span = (p.n/total) * 360;
      const a0 = ang; const a1 = ang + span; ang = a1;
      const mid2 = (a0 + a1) / 2;
      const tooSmall = span < 26;
      const inside = at(mid2, rad * 0.58);
      const outside = at(mid2, rad * 1.14);
      slices.push({ ...p, span, mid:mid2, path: arcPath(a0, a1), tooSmall,
        lx: (tooSmall ? outside.x : inside.x), ly: (tooSmall ? outside.y : inside.y),
        l0x: at(mid2, rad*0.88).x, l0y: at(mid2, rad*0.88).y,
        l1x: at(mid2, rad*1.04).x, l1y: at(mid2, rad*1.04).y });
    }

    return `
      <div class="diagPieWrap" aria-label="${mode.toUpperCase()} distribution">
        <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
          <defs><filter id="advDiagPieShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="rgba(0,0,0,.45)" /></filter></defs>
          <g filter="url(#advDiagPieShadow)">
            ${slices.map(s2=>`<path class="diagPieSlice" data-tech="${t.id}" data-mode="${mode}" data-band="${s2.band}" data-compare="advisors"
              d="${s2.path}" fill="${s2.fill}" stroke="rgba(255,255,255,.95)" stroke-width="1.6" stroke-linejoin="round" />`).join('')}
          </g>
          ${slices.map(s2=> s2.tooSmall ? `<line x1="${s2.l0x.toFixed(2)}" y1="${s2.l0y.toFixed(2)}" x2="${s2.l1x.toFixed(2)}" y2="${s2.l1y.toFixed(2)}" stroke="rgba(255,255,255,.95)" stroke-width="1.2" />` : '').join('')}
          ${slices.map(s2=>`<text class="diagPieTxt" x="${s2.lx.toFixed(2)}" y="${s2.ly.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${s2.n}</text>`).join('')}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
        </svg>
      </div>
    `;
  }

  const top3Panel = `
    <div class="panel advPickPanel diagSection" style="height:100%;min-width:0;overflow:hidden">
      <div class="phead" style="border-bottom:none;padding:12px;display:grid;gap:14px">
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;align-self:flex-start;font-size:22px;line-height:1">ASR</div>
              ${diagPieChart(bandCounts_asr, "asr")}
            </div>
            <div>${tbMiniBox("Top 3 Most Recommended", topReqTB, "asr", "up")}</div>
            <div>${tbMiniBox("Bottom 3 Least Recommended", botReqTB, "asr", "down")}</div>
          </div>
        </div>
        <div class="diagDivider" style="height:1px;background:rgba(255,255,255,.12);margin:0 12px"></div>
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
  `;

  const headerWrap = `<div class="techHeaderWrap" style="display:grid;grid-template-columns:minmax(0,0.70fr) minmax(0,1.30fr);gap:14px;align-items:stretch;">${header}${top3Panel}</div>`;

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
    const fo = encodeURIComponent(focus||"asr");
    const g = encodeURIComponent(goalMetric||"asr");
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
      focus = advFocusSel.value || "asr";
      location.hash = buildHash();
    });
  }

  const advGoalSel = document.getElementById('advGoalMetric');
  if(advGoalSel){
    advGoalSel.addEventListener('change', ()=>{
      goalMetric = advGoalSel.value || "asr";
      location.hash = buildHash();
    });
  }
}

window.renderAdvisorDetail = renderAdvisorDetail;
