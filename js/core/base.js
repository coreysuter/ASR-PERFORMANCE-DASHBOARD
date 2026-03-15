
function renderMenuTechLists(){
  try{
    const ex = document.getElementById('menuTechListExpress');
    const ki = document.getElementById('menuTechListKia');
    if(!ex || !ki) return;

    const mk = (teamKey, el)=>{
      const list = getTechsByTeam(teamKey).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
      el.innerHTML = list.map(t=>`<a class="menuLink menuTechLink" href="#/tech/${encodeURIComponent(t.id)}" onclick="return goTech(${JSON.stringify(t.id)})">${safe(t.name||t.id)}</a>`).join("");
    };

    mk("express", ex);
    mk("kia", ki);
  }catch(e){}

  // Advisor menu list
  try{
    const advEl = document.getElementById('menuAdvisorList');
    if(advEl && Array.isArray(DATA.advisors)){
      const advList = DATA.advisors
        .filter(a => a && String(a.id||"").toLowerCase()!=="total")
        .slice().sort((a,b)=>(a.name||"").localeCompare(b.name||""));
      advEl.innerHTML = advList.map(a=>`<a class="menuLink menuTechLink" href="#/advisor/${encodeURIComponent(a.id)}" onclick="return goAdvisor(${JSON.stringify(a.id)})">${safe(a.name||a.id)}</a>`).join("");
    }
  }catch(e){}
}

function fmtInt(v){ if(v===null||v===undefined||!Number.isFinite(Number(v))) return "—"; return Math.round(Number(v)).toLocaleString(); }
function fmt1(v,d=1){ if(v===null||v===undefined||!Number.isFinite(Number(v))) return "—"; return Number(v).toFixed(d); }
// Percent display: no decimals (per dashboard preference)
function fmtPct(v){
  if(v===null||v===undefined||!Number.isFinite(Number(v))) return "—";
  return Math.round(Number(v)*100) + "%";
}
function clamp01(x){ x=Number(x); if(!Number.isFinite(x)) return 0; return Math.max(0, Math.min(1, x)); }
function miniGauge(pct){
  if(!(Number.isFinite(pct))) return "";
  const p = clamp01(pct);
  const p100 = Math.round(p*100);
  return `<span class="miniGauge" style="--p:${p100}"><span class="needle"></span></span>`;
}


function _gradeFromPct100(pct100){
  const n = Number(pct100);
  if(!Number.isFinite(n)) return "—";
  if(n >= 90) return "A";
  if(n >= 80) return "B";
  if(n >= 70) return "C";
  if(n >= 60) return "D";
  return "F";
}

function ensureSvcGaugeHoldStyles(){
  try{
    const ID = "svcGaugeHoldStyles_v1";
    if(document.getElementById(ID)) return;
    const st = document.createElement("style");
    st.id = ID;
    st.textContent = `
      .svcGauge{ position:relative; display:inline-flex; align-items:center; justify-content:center; cursor:default; user-select:none; -webkit-user-select:none; }
      .svcGauge:hover{ cursor:pointer; }
      .svcGauge .pctText{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); display:flex; align-items:center; justify-content:center; text-align:center; line-height:1.05; }
      .svcGauge .pctDefault{ display:flex; flex-direction:column; gap:2px; }
      .svcGauge .pctAlt{ display:none; flex-direction:column; gap:2px; }
      .svcGauge.showAlt .pctDefault{ display:none; }
      .svcGauge.showAlt .pctAlt{ display:flex; }

      .svcGauge .pctGrade{
        font-size: 20px;
        font-weight: 1000;
        letter-spacing: 0.5px;
      }
      .svcGauge .pctTitle{
        font-size: 10px;
        font-weight: 900;
        opacity: 0.95;
        letter-spacing: 0.3px;
      }
      .svcGauge .pctAlt .pctMain{
        font-size: 14px;
        font-weight: 900;
      }
      .svcGauge .pctAlt .pctArrow{
        font-size: 12px;
        font-weight: 1000;
        line-height: 1;
      }
      .svcGauge .pctAlt .pctSub{
        font-size: 11px;
        font-weight: 900;
        opacity: 0.95;
        letter-spacing: 0.4px;
      }
    `;
    document.head.appendChild(st);
  }catch(e){}
}

function initSvcGaugeHold(){
  ensureSvcGaugeHoldStyles();
  _ensureGaugePopupStyles();
  const HOLD_MS = 250; // press-and-hold threshold
  const els = document.querySelectorAll('.svcGauge[data-p]');
  els.forEach(el=>{
    if(el.getAttribute("data-hold") === "1") return;
    el.setAttribute("data-hold","1");
    el.style.touchAction = "none";

    // If this gauge has popup data, use click-to-popup instead of hold-to-toggle
    if(el.hasAttribute("data-gauge-popup")){
      el.addEventListener("click", (e)=>{
        e.preventDefault();
        e.stopPropagation();
        _showGaugePopup(el);
      });
      return; // skip old hold behavior
    }

    let t = null;
    let isDown = false;

    const clear = ()=>{
      if(t){ clearTimeout(t); t=null; }
    };
    const show = ()=>{
      // Only show alt when we have valid alt content
      if(el.querySelector(".pctAlt")) el.classList.add("showAlt");
    };
    const hide = ()=>{
      el.classList.remove("showAlt");
    };

    el.addEventListener("pointerdown", (e)=>{
      isDown = true;
      clear();
      // don't let long-press trigger text selection / drag
      try{ el.setPointerCapture(e.pointerId); }catch(_){}
      t = setTimeout(()=>{ if(isDown) show(); }, HOLD_MS);
    });

    const end = ()=>{
      isDown = false;
      clear();
      hide();
    };

    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("pointerleave", end);
  });
}

/* --- Gauge Popup System --- */
function _closeGaugePopup(){
  const el = document.getElementById("gaugePopup");
  if(el) el.remove();
  document.removeEventListener("click", _gaugePopupOutsideClick, true);
  document.removeEventListener("keydown", _gaugePopupEsc, true);
  document.removeEventListener("scroll", _gaugePopupScroll, true);
}
function _gaugePopupEsc(e){ if(e.key==="Escape") _closeGaugePopup(); }
function _gaugePopupScroll(){ _closeGaugePopup(); }
function _gaugePopupOutsideClick(e){
  const pop = document.getElementById("gaugePopup");
  if(!pop) return;
  if(!pop.contains(e.target) && !e.target.closest('.svcGauge[data-gauge-popup]')){
    _closeGaugePopup();
  }
}

function _showGaugePopup(el){
  _closeGaugePopup();
  let data;
  try{ data = JSON.parse(el.getAttribute("data-gauge-popup")); }catch(e){ return; }
  if(!data || !data.rows) return;

  const rows = data.rows || [];
  const grade = data.grade || "—";
  const pctAttained = data.pctAttained || "—";
  const iconBand = data.iconBand || null; // "green" | "yellow" | "orange" | "red"

  // Color the grade
  let gradeColor = "#ff4b4b"; // F
  if(grade === "A") gradeColor = "#1fcb6a";
  else if(grade === "B") gradeColor = "#2ecc71";
  else if(grade === "C") gradeColor = "#ffbf2f";
  else if(grade === "D") gradeColor = "#ff8844";

  let rowsHtml = rows.map(r => `
    <div class="gpRow">
      <span class="gpLabel">${_safePopup(r.label)}</span>
      <span class="gpVal">${_safePopup(r.value)}</span>
    </div>
  `).join("");

  // Bottom line: icon (if iconBand set) or letter grade
  let bottomHtml;
  if(iconBand){
    const uid = 'gp-' + Math.random().toString(36).slice(2,7);
    const fill   = iconBand==='green' ? '#1fcb6a' : iconBand==='yellow' ? '#ffbf2f' : iconBand==='orange' ? '#f97316' : '#ff4b4b';
    const fillHi = iconBand==='green' ? '#7CFFB0' : iconBand==='yellow' ? '#ffd978' : iconBand==='orange' ? '#fdba74' : '#ff8b8b';
    const iconSvg = iconBand==='green'
      ? `<svg viewBox="0 0 64 64" width="28" height="28" style="display:block;flex-shrink:0">
          <defs>
            <radialGradient id="gpChkHi-${uid}" cx="35%" cy="25%" r="70%"><stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
            <linearGradient id="gpChkGr-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${fillHi}"/><stop offset="100%" stop-color="${fill}"/></linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#gpChkGr-${uid})"/><circle cx="32" cy="32" r="28" fill="url(#gpChkHi-${uid})"/>
          <path d="M19 33.5l7.2 7.2L46 21.9" fill="none" stroke="#fff" stroke-width="7.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      : `<svg viewBox="0 0 100 87" width="28" height="24" style="display:block;flex-shrink:0">
          <defs>
            <linearGradient id="gpTriGr-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${fillHi}"/><stop offset="100%" stop-color="${fill}"/></linearGradient>
            <radialGradient id="gpTriHi-${uid}" cx="35%" cy="20%" r="75%"><stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <path d="M50 0 C53 0 55 2 56.5 4.5 L99 85 C101 88 99 91 95 91 L5 91 C1 91 -1 88 1 85 L43.5 4.5 C45 2 47 0 50 0Z" fill="url(#gpTriGr-${uid})"/>
          <path d="M50 6 C52 6 54 7.2 55.2 9.6 L92 80 C94 83 92.2 86 88.4 86 L11.6 86 C7.8 86 6 83 8 80 L44.8 9.6 C46 7.2 48 6 50 6Z" fill="url(#gpTriHi-${uid})"/>
          <rect x="46" y="20" width="8" height="34" rx="3" fill="rgba(0,0,0,.78)"/>
          <circle cx="50" cy="66" r="5" fill="rgba(0,0,0,.78)"/>
        </svg>`;
    bottomHtml = `<div class="gpRow gpGradeRow" style="justify-content:center;gap:8px;">${iconSvg}<span class="gpAttained">${_safePopup(pctAttained)} of Goal</span></div>`;
  } else {
    // original letter grade
    bottomHtml = `
      <div class="gpRow gpGradeRow">
        <span class="gpGrade" style="color:${gradeColor}">${_safePopup(grade)}</span>
        <span class="gpAttained">(${_safePopup(pctAttained)})</span>
      </div>
    `;
  }

  const pop = document.createElement("div");
  pop.id = "gaugePopup";
  pop.className = "gaugePopup";
  pop.innerHTML = rowsHtml + bottomHtml;

  document.body.appendChild(pop);

  // Position the popup near the gauge
  const rect = el.getBoundingClientRect();
  const popRect = pop.getBoundingClientRect();
  
  // Try to place above the dial first, fall back to below
  let top = rect.top - popRect.height - 8;
  let left = rect.left + (rect.width/2) - (popRect.width/2);
  
  // If above goes off screen, place below
  if(top < 4){
    top = rect.bottom + 8;
    pop.classList.add("gpBelow");
  } else {
    pop.classList.add("gpAbove");
  }
  
  // Keep within viewport horizontally
  if(left < 4) left = 4;
  if(left + popRect.width > window.innerWidth - 4) left = window.innerWidth - popRect.width - 4;

  pop.style.top = top + "px";
  pop.style.left = left + "px";

  // Close handlers
  setTimeout(()=>{
    document.addEventListener("click", _gaugePopupOutsideClick, true);
    document.addEventListener("keydown", _gaugePopupEsc, true);
    document.addEventListener("scroll", _gaugePopupScroll, true);
  }, 10);
}

function _safePopup(s){ return String(s==null?"":s).replace(/[<>"'&]/g, m=>({"<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","&":"&amp;"}[m])); }

function _ensureGaugePopupStyles(){
  if(document.getElementById("gaugePopupStyles")) return;
  const st = document.createElement("style");
  st.id = "gaugePopupStyles";
  st.textContent = `
    .gaugePopup{
      position:fixed;
      z-index:99999;
      min-width:150px;
      max-width:220px;
      background:linear-gradient(135deg, #1a1e2e 0%, #232940 100%);
      border:1px solid rgba(255,255,255,.18);
      border-radius:12px;
      padding:10px 14px;
      box-shadow:0 8px 32px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06);
      backdrop-filter:blur(12px);
      animation:gpFadeIn .15s ease-out;
      pointer-events:auto;
    }
    @keyframes gpFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    .gaugePopup.gpAbove{animation-name:gpFadeInUp}
    @keyframes gpFadeInUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    .gaugePopup.gpBelow{animation-name:gpFadeInDown}
    @keyframes gpFadeInDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}

    .gaugePopup .gpRow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:4px 0;
      gap:12px;
    }
    .gaugePopup .gpRow + .gpRow{
      border-top:1px solid rgba(255,255,255,.08);
    }
    .gaugePopup .gpLabel{
      font-size:11px;
      font-weight:800;
      letter-spacing:.4px;
      color:rgba(234,240,255,.6);
      white-space:nowrap;
    }
    .gaugePopup .gpVal{
      font-size:15px;
      font-weight:1000;
      color:#fff;
      text-align:right;
    }
    .gaugePopup .gpGrade{
      font-size:20px;
      font-weight:1000;
      letter-spacing:.5px;
    }
    .gaugePopup .gpGradeRow{
      justify-content:center;
      gap:6px;
      padding-top:6px;
    }
    .gaugePopup .gpAttained{
      font-size:13px;
      font-weight:900;
      color:rgba(234,240,255,.55);
      align-self:center;
    }
  `;
  document.head.appendChild(st);
}

function svcGauge(pct, label="", popupData){
  // pct is a ratio vs comparison (e.g., 0.8 = 80% of benchmark). We show a ring gauge.
  const p = Number.isFinite(pct) ? Math.max(0, pct) : 0;
  const disp = Math.round(p*100);                 // text can exceed 100
  const ring = Math.round(Math.min(p, 1) * 100);  // ring fills to 100 max

  let cls = "gRed";
  if(window.getDialClass){
    cls = window.getDialClass(p);
  } else {
    if(p >= 0.80) cls = "gGreen";
    else if(p >= 0.60) cls = "gYellow";
  }

  const lbl = String(label||"").trim();

  // DEFAULT: grade
  const grade = _gradeFromPct100(disp);

  // ALTERNATE: +/- vs baseline (assumes pct is ratio vs baseline, so 1.00 === baseline)
  const basis = (lbl && /goal/i.test(lbl)) ? "GOAL" : "AVG";
  const delta = Math.round((p - 1) * 100); // percent points over/under baseline
  const absDelta = Math.abs(delta);
  const arrow = (delta >= 0) ? "▲" : "▼";
  const arrowColor = (delta >= 0) ? "#2ecc71" : "#f04545";

  const titleHtml = lbl ? `<span class="pctTitle">${safe(lbl)}</span>` : ``;
  const defaultHtml = `<span class="pctText pctDefault"><span class="pctGrade">${safe(grade)}</span>${titleHtml}</span>`;
  const altHtml = `<span class="pctText pctAlt"><span class="pctMain">${absDelta}%</span><span class="pctArrow" style="color:${arrowColor}">${arrow}</span><span class="pctSub">${basis}</span></span>`;

  // Popup data attribute (for tech details page click-popup)
  const popupAttr = popupData ? ` data-gauge-popup="${safe(JSON.stringify(popupData)).replace(/'/g,"&#39;")}"` : '';

  // SVG circle with r=15.915494... => circumference ≈ 100 (so we can use percent-based dash)
  return `<span class="svcGauge ${cls}" data-p="${ring}"${popupAttr}>
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle class="bg" cx="18" cy="18" r="15.91549430918954"></circle>
      <circle class="fg" cx="18" cy="18" r="15.91549430918954"></circle>
    </svg>
    ${defaultHtml}
    ${altHtml}
  </span>`;
}




function animateSvcGauges(){
  const els = document.querySelectorAll('.svcGauge[data-p]');
  // set to 0 first so transition is visible, then animate to target on next frame
  els.forEach(el=>{ el.style.setProperty('--p', '0'); });
  requestAnimationFrame(()=>{
    els.forEach(el=>{
      const target = Number(el.getAttribute('data-p')||0);
      if(Number.isFinite(target)) el.style.setProperty('--p', String(Math.max(0, Math.min(100, target))));
    });
  });

  try{ initSvcGaugeHold(); }catch(e){}
}

function initSectionToggles(){
  const panels = Array.from(document.querySelectorAll(".panel"))
    .filter(p=>p.querySelector(".techH2") && p.querySelector(".list"));
  if(!panels.length) return;

  panels.forEach((p, i)=>{
    const h2 = p.querySelector(".techH2");
    if(!h2) return;

    // wrap the header line so toggle sits consistently
    const h2Wrap = document.createElement("div");
    h2Wrap.className = "secHeadRow";
    const toggle = document.createElement("div");
    toggle.className = "secToggle";
    toggle.textContent = i===0 ? "−" : "+";

    // move h2 into wrapper
    const parent = h2.parentElement;
    parent.insertBefore(h2Wrap, h2);
    h2Wrap.appendChild(toggle);
    h2Wrap.appendChild(h2);

    // Make the entire header row clickable
    h2Wrap.style.cursor = "pointer";
    h2Wrap.style.userSelect = "none";

    // default: first expanded, rest collapsed
    if(i!==0) p.classList.add("secCollapsed");

    h2Wrap.addEventListener("click", (e)=>{
      e.preventDefault();
      const collapsed = p.classList.toggle("secCollapsed");
      toggle.textContent = collapsed ? "+" : "−";
    });
  });
}


function fmtPctPlain(v){
  if(v===null||v===undefined||v==="") return "—";
  const n = Number(v);
  if(!isFinite(n)) return "—";
  return Math.round(n) + "%";
}


// Focus Rank Badge (matches Technician Details page)
function rankBadgeHtmlDash(rank, total, focus, size="sm"){
  let top = "ASRs/RO";
  if(focus==="sold") top = "SOLD%";
  if(focus==="goal_asr") top = "ASR Goal";
  if(focus==="goal_sold") top = "Sold Goal";
  const r = (rank===null || rank===undefined || rank==="") ? "—" : rank;
  const t = (total===null || total===undefined || total==="") ? "—" : total;
  const cls = (size==="sm") ? "rankFocusBadge sm" : "rankFocusBadge";
  // Force bold to match Tech Details badges
  return `
    <div class="${cls}">
      <div class="rfbFocus" style="font-weight:1000">${top}</div>
      <div class="rfbMain" style="font-weight:1000">${r}</div>
      <div class="rfbOf" style="font-weight:1000"><span class="rfbOfWord" style="font-weight:1000">of</span><span class="rfbOfNum" style="font-weight:1000">${t}</span></div>
    </div>
  `;
}

// -------------------- Goals (user-configurable) --------------------
const GOALS_STORAGE_KEY = "techDashGoals_v1";

// Goals are stored as decimal fractions (e.g., 0.30 = 30%)
function _goalKey(cat, metric){ return String(cat||"").trim() + "||" + String(metric||""); }

function loadGoals(){
  try{
    const raw = localStorage.getItem(GOALS_STORAGE_KEY);
    if(!raw) return {};
    const obj = JSON.parse(raw);
    return (obj && typeof obj === "object") ? obj : {};
  }catch(e){ return {}; }
}
function saveGoals(obj){
  try{ localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(obj||{})); }catch(e){}
}

function parseGoalInput(str){
  const s = String(str||"").trim();
  if(!s) return null;
  const cleaned = s.replace(/[%\s]/g,"");
  const n = Number(cleaned);
  if(!isFinite(n)) return null;
  // If user enters 30 or 30.5 treat as percent; if 0.3 treat as fraction.
  if(n > 1) return n/100;
  if(n >= 0) return n;
  return null;
}

// Convert an input string (e.g., "30" or "0.3" or "30%") into the stored raw goal fraction.
// Kept as a separate helper because later code expects an `inputToGoal()` function.
function inputToGoal(str){
  return parseGoalInput(str);
}
function goalToInput(v){
  if(v===null||v===undefined||v===""||!isFinite(Number(v))) return "";
  return (Number(v)*100).toFixed(1).replace(/\.0$/,"");
}
function isFluidCategory(cat){
  try{
    const arr = (DATA && Array.isArray(DATA.fluid_categories)) ? DATA.fluid_categories : [];
    return arr.indexOf(String(cat)) !== -1;
  }catch(e){ return false; }
}

// Raw goal lookup (no fluids fallback)
function getGoalRaw(cat, metric){
  const goals = loadGoals();
  const v = goals[_goalKey(cat, metric)];
  const n = Number(v);
  return isFinite(n) ? n : null;
}

// Store a *raw* goal value (already parsed as a fraction like 0.3).
// This is used by the Goals page UI to persist values directly without re-parsing.
function setGoalRaw(cat, metric, rawVal){
  const goals = loadGoals();
  const key = _goalKey(cat, metric);
  const n = Number(rawVal);
  if(rawVal===null || rawVal===undefined || rawVal==="" || !isFinite(n)){
    delete goals[key];
  }else{
    goals[key] = n;
  }
  saveGoals(goals);
}

// Effective goal lookup: fluids services fall back to universal FLUIDS goals if no override exists.
function getGoal(cat, metric){
  // Fluids apply-all override
  if(isFluidCategory(cat) && String(getGoalRaw("__META_FLUIDS","apply_all"))==="1"){
    const v = getGoalRaw("__FLUIDS_ALL", metric);
    return (v!==null && v!==undefined) ? v : null;
  }
  const raw = getGoalRaw(cat, metric);
  if(raw!==null && raw!==undefined) return raw;
  if(isFluidCategory(cat)){
    const defv = getGoalRaw("FLUIDS", metric);
    return (defv!==null && defv!==undefined) ? defv : null;
  }
  return null;
}
function setGoal(cat, metric, rawVal){
  const goals = loadGoals();
  const key = _goalKey(cat, metric);
  const parsed = parseGoalInput(rawVal);
  if(parsed===null){
    delete goals[key];
  }else{
    goals[key] = parsed;
  }
  saveGoals(goals);
}
function fmtGoal(v){
  return (v===null||v===undefined||!isFinite(Number(v))) ? "—" : fmtPct(Number(v));
}

/**
 * Compute overall ASRs/RO and Sold/RO goals by summing per-category goals.
 * This mirrors the calculation on the Goals settings page.
 *
 * @param {string} [filterKey] - "total" (default), "without_fluids", or "fluids_only"
 * @returns {{ asrPerRo: number|null, soldPerRo: number|null, soldPct: number|null }}
 */
function calcOverallGoals(filterKey){
  const allSet = (typeof getAllCategoriesSet==="function") ? getAllCategoriesSet() : new Set();
  let cats = Array.from(allSet).map(String).filter(Boolean);

  // Apply fluid filter
  if(filterKey === "without_fluids"){
    cats = cats.filter(c => !isFluidCategory(c));
  } else if(filterKey === "fluids_only"){
    cats = cats.filter(c => isFluidCategory(c));
  }

  let asrPerRo = 0;
  let soldPerRo = 0;
  let hasAny = false;

  for(const cat of cats){
    const reqVal = Number(getGoal(cat, "req"));
    const closeVal = Number(getGoal(cat, "close"));
    if(Number.isFinite(reqVal) && reqVal > 0){
      asrPerRo += reqVal;
      hasAny = true;
      if(Number.isFinite(closeVal)){
        soldPerRo += reqVal * closeVal;
      }
    }
  }

  if(!hasAny) return { asrPerRo: null, soldPerRo: null, soldPct: null };

  const soldPct = asrPerRo > 0 ? (soldPerRo / asrPerRo) : null;
  return { asrPerRo, soldPerRo, soldPct };
}

function mean(arr){ const xs=(arr||[]).map(Number).filter(n=>Number.isFinite(n)); if(!xs.length) return null; return xs.reduce((a,b)=>a+b,0)/xs.length; }
function byTeam(team){ return (DATA.techs||[]).filter(t=>t.team===team); }
function safe(s){
  return String(s ?? "").replace(/[&<>"]/g, ch => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;"
  }[ch]));
}

function catLabel(cat){
  const map = (typeof DATA!=="undefined" && (DATA.categoryLabels || DATA.category_labels)) ? (DATA.categoryLabels || DATA.category_labels) : {};
  const raw = (map && map[cat]) ? map[cat] : (cat ?? "");
  return String(raw).replace(/_/g," ").trim();
}


function renderFiltersText(parts){
  const clean = (parts||[]).filter(Boolean).map(x=>String(x));
  const txt = "Filters: " + clean.join(", ");
  return `<span class="filtersText"><i>${safe(txt)}</i></span>`;
}


 // ===== Icons (inline SVG) =====
const ICON_FILTER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18l-7 8v5l-4 2v-7L3 5z"/></svg>';
const ICON_SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 4a6 6 0 104.47 10.03l4.25 4.25 1.41-1.41-4.25-4.25A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"/></svg>';


// ===== Dashboard typography overrides (Technician Dashboard page only) =====
function ensureDashTypographyOverrides(){
  try{
    const h = location.hash || "#/";
    const isMainDash = (h === "#/" || h === "#" || h.startsWith("#/?"));

    // Always clear any prior injected dashboard-only overrides
    ["dashTypographyOverrides","dashTypographyOverrides_v2_ODO2PILLS","dashRankRightStyle"].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.remove();
    });

    // These overrides are ONLY meant for the main dashboard list (#/).
    // If we're not on the main dashboard, don't inject anything (prevents breaking ServicesHome tech rows, etc.).
    if(!isMainDash) return;
    const css = `
/* Technician Dashboard header */
.techH2Big{font-size:36px;}
@media (max-width: 700px){ .techH2Big{font-size:28px;} }

/* EXPRESS / KIA headers */
.catTitle{font-size:28px;}
@media (max-width: 700px){ .catTitle{font-size:26px;} }

/* Team header stats layout (dashboard) */
.catRank{display:flex !important; flex-direction:column !important; align-items:flex-end !important; gap:8px !important;}
.catRank .rankMain, .catRank .rankSub{display:flex !important; flex-direction:column !important; align-items:flex-end !important; gap:2px !important;}
.catRank .rankNum{font-size:36px !important; font-weight:1000 !important; line-height:1 !important;}
.catRank .rankLbl{font-size:13px !important; font-weight:900 !important; letter-spacing:.35px !important; text-transform:uppercase !important; color:var(--muted) !important; opacity:.75 !important; margin-top:2px !important;}
.catRank .rankNum.sub{font-size:26px !important;}
.catRank .rankLbl.sub{font-size:13px !important;}
@media (max-width: 700px){
  .catRank .rankNum{font-size:30px !important;}
  .catRank .rankNum.sub{font-size:24px !important;}
}



/* Technician names on dashboard list */
.techRow .val.name{font-size:23px !important;font-weight:1000 !important;white-space:nowrap;}
@media (max-width: 700px){ .techRow .val.name{font-size:19px !important;} }

/* Rank badge pinned to far right of technician rows (dashboard) */
.techRow{position:relative;}
.techRow .techMetaRight{position:absolute;right:16px;top:14px;margin-left:0 !important;}
.techRow .pills{padding-right:96px;}

/* Pill grouping: thin grey outline around (ASRs/RO + ASR Goal) and (Sold/ASR + Sold/RO + Sold Goal) */
.pillGroup{
  display:flex;
  align-items:center;
  gap:10px;
  padding:6px 8px;
  border:1px solid rgba(190,190,190,.35);
  border-radius:14px;
}

/* Focus behavior: make the selected Focus pill group ~10% larger */
.techRow .pillGroup.focusGroup .pill{
  transform:scale(1.1);
  transform-origin:center;
}

/* Goal focus: only the selected goal pill is ~10% larger */
.techRow .pill.goalFocusSel{
  transform:scale(1.1);
  transform-origin:center;
}


@media (max-width: 700px){
  .techRow .techMetaRight{right:12px;top:12px;}
  .techRow .pills{padding-right:86px;}
}

/* Dashboard tech-row layout tweaks (Technician Dashboard list) */
.techRow{
  position:relative;
  min-height:150px !important;
  padding-top:0 !important;
  display:block !important;
  overflow:hidden !important;
}

/* Tech name pinned top-left */
.techRow .val.name{
  position:absolute !important;
  top:12px !important;
  left:18px !important;
  margin:0 !important;
  text-align:left !important;
  white-space:nowrap !important;
  overflow:hidden !important;
  text-overflow:ellipsis !important;
  max-width:58% !important;
  font-weight:1000 !important;
}

/* Tech name stats block (prevents overlap; sits directly below name) */
.techRow .techNameStats{
  position:absolute !important;
  top:48px !important;
  left:18px !important;
  display:flex !important;
  flex-direction:column !important;
  gap:6px !important;
  align-items:flex-start !important;
  max-width:240px !important;   /* prevent it from pushing into pills/rank area */
  min-width:0 !important;
  overflow:hidden !important;
}
.techRow .techNameStats .tnRow{display:flex !important; flex-wrap:nowrap !important; align-items:baseline !important; gap:10px !important;}
.techRow .techNameStats .tnRow2{gap:14px !important;}
.techRow .techNameStats .tnMini{display:inline-flex !important; align-items:baseline !important; gap:8px !important;}
.techRow .techNameStats .tnLbl{
  font-size:11px !important;
  color:var(--muted) !important;
  font-weight:900 !important;
  letter-spacing:.2px !important;
  text-transform:uppercase !important;
}
.techRow .techNameStats .tnVal{
  font-size:15px !important;
  font-weight:1000 !important;
  line-height:1 !important;
}
.techRow .pill.odoHeaderLike{
  width:190px !important;
  height:56px !important;
  min-width:190px !important;
  padding:10px 14px !important;
  border-radius:999px !important;
  display:flex !important;
  align-items:center !important;
  justify-content:center !important;

  background:linear-gradient(180deg, rgba(0,0,0,.42), rgba(0,0,0,.62)) !important;
  border:1px solid rgba(255,255,255,.18) !important;
  box-shadow:0 10px 26px rgba(0,0,0,.55) inset, 0 10px 24px rgba(0,0,0,.18) !important;
}
.techRow .pill.odoHeaderLike .kv{
  display:flex !important;
  align-items:baseline !important;
  justify-content:center !important;
  gap:12px !important;
  width:100% !important;
}
.techRow .pill.odoHeaderLike .k{
  width:auto !important;
  font-size:12px !important;
  font-weight:1000 !important;
  letter-spacing:.28px !important;
  opacity:.92 !important;
}
.techRow .pill.odoHeaderLike .v{
  width:auto !important;
  font-size:26px !important;
  font-weight:1000 !important;
}

/* Rank badge pinned far-right, vertically centered */
.techRow .techMetaRight{
  position:absolute !important;
  right:18px !important;
  top:50% !important;
  transform:translateY(-50%) !important;
  margin:0 !important;
  z-index:2 !important;
}

/* Pills row: positioned left of rank badge; starts AFTER the name column */
.techRow .pills{
  position:absolute !important;
  top:50% !important;
  transform:translateY(-50%) !important;
  left: 222px !important; /* start after Avg ODO area */
  right: 118px !important; /* leave room for rank badge */
  display:flex !important;
  flex-wrap:nowrap !important;
  gap:10px !important;
  align-items:center !important;
  justify-content:center !important;
  margin:0 !important;
  padding:0 !important;
  min-width:0 !important;
  overflow:hidden !important;
}

/* Darker, higher-contrast square pills */
.techRow .pill{
  width:85px !important;
  height:85px !important;
  min-width:85px !important;
  padding:9px 9px !important;
  display:flex !important;
  flex-direction:column !important;
  justify-content:center !important;
  align-items:center !important;
  border-radius:14px !important;
  gap:5px !important;

  background:linear-gradient(180deg, rgba(0,0,0,.42), rgba(0,0,0,.68)) !important;
  border:1px solid rgba(255,255,255,.16) !important;
  box-shadow:0 10px 26px rgba(0,0,0,.60) inset, 0 10px 22px rgba(0,0,0,.18) !important;
}
.techRow .pill .k{
  width:100% !important;
  text-align:center !important;
  margin:0 !important;
  padding:0 !important;
  font-weight:1000 !important;
  letter-spacing:.22px !important;
  line-height:1.0 !important;
  font-size:12px !important;
  opacity:.92 !important;
}
.techRow .pill .v{
  width:100% !important;
  text-align:center !important;
  margin:0 !important;
  font-weight:1000 !important;
  line-height:1 !important;
  font-size:23px !important;
}

.techRow .pill .k + .v{ margin-top:0 !important; }

@media (max-width: 700px){
  .techRow{min-height:136px !important;}
  .techRow .val.name{top:10px !important; left:14px !important; font-size:19px !important; max-width:60% !important;}
  .techRow .odoUnderName{top:46px !important; left:14px !important; width:min(60%, 280px) !important;}
  .techRow .pill.odoHeaderLike{width:170px !important; min-width:170px !important; height:52px !important; padding:9px 12px !important;}
  .techRow .pill.odoHeaderLike .k{font-size:11px !important;}
  .techRow .pill.odoHeaderLike .v{font-size:20px !important;}

  .techRow .techMetaRight{right:14px !important;}
  .techRow .pills{
    left: 198px !important;
    right: 104px !important;
    gap:9px !important;
  }
  .techRow .pill{width:76px !important;height:76px !important;min-width:76px !important;border-radius:13px !important;padding:8px 8px !important;gap:4px !important;}
  .techRow .pill .k{font-size:11px !important;}
  .techRow .pill .v{font-size:20px !important;}
}

  .techRow .val.name{top:10px !important; left:14px !important; font-size:22px !important; max-width:72% !important;}
  .techRow .odoUnderName{top:46px !important; left:14px !important; width:170px !important;}
  .techRow .pill.odoHeaderLike{width:170px !important; min-width:170px !important; height:52px !important; padding:9px 12px !important;}
  .techRow .pill.odoHeaderLike .k{font-size:11px !important;}
  .techRow .pill.odoHeaderLike .v{font-size:20px !important;}

  .techRow .pills{left:198px !important; right:14px !important; gap:9px !important;}
  .techRow .pill{width:76px !important;height:76px !important;min-width:76px !important;border-radius:13px !important;padding:8px 8px !important;gap:4px !important;}
  .techRow .pill .k{font-size:11px !important;}
  .techRow .pill .v{font-size:20px !important;}
  .techRow .techMetaRight{margin-left:9px !important;}
}

  .techRow .val.name{top:10px !important; left:14px !important; font-size:22px !important; max-width:72% !important;}
  .techRow .odoUnderName{top:46px !important; left:14px !important;}
  .techRow .pill.odoHeaderLike{width:170px !important; min-width:170px !important; height:52px !important; padding:9px 12px !important;}
  .techRow .pill.odoHeaderLike .k{font-size:11px !important;}
  .techRow .pill.odoHeaderLike .v{font-size:20px !important;}

  .techRow .techMetaRight{right:14px !important;}
  .techRow .pills{left:14px !important; right:104px !important; gap:9px !important;}
  .techRow .pill{width:76px !important;height:76px !important;min-width:76px !important;border-radius:13px !important;padding:8px 8px !important;gap:4px !important;}
  .techRow .pill .k{font-size:11px !important;}
  .techRow .pill .v{font-size:20px !important;}
}

  .techRow .val.name{top:10px !important; left:14px !important; font-size:22px !important; max-width:70% !important;}
  .techRow .techMetaRight{right:14px !important;}
  .techRow .pills{left:14px !important; right:104px !important; gap:7px !important;}
  .techRow .pill{width:60px !important;height:60px !important;min-width:60px !important;border-radius:11px !important;padding:6px 6px !important;gap:3px !important;}
  .techRow .pill .k{font-size:10px !important;}
  .techRow .pill .v{font-size:16.5px !important;}
  .techRow .pill.odoWide{width:132px !important;min-width:132px !important;gap:8px !important;}
  .techRow .pill.odoWide .k{font-size:10px !important;}
  .techRow .pill.odoWide .v{font-size:16.5px !important;}
}

  .techRow .val.name{top:10px !important; left:14px !important; font-size:22px !important; max-width:60% !important;}
  .techRow .pills{gap:7px !important; padding-left:14px !important; padding-right:104px !important;}
  .techRow .pill{width:62px !important;height:62px !important;min-width:62px !important;border-radius:11px !important;padding:6px 6px !important;}
  .techRow .pill .k{font-size:10px !important;}
  .techRow .pill .v{font-size:17px !important;}
}

  .techRow .val.name{top:10px !important; right:14px !important; font-size:22px !important; max-width:60% !important;}
  .techRow .pills{gap:8px !important; padding-right:96px !important;}
  .techRow .pill{width:68px !important;height:68px !important;min-width:68px !important;border-radius:12px !important;padding:7px 7px !important;}
  .techRow .pill .k{font-size:11px !important;}
  .techRow .pill .v{font-size:18px !important;}
}


/* Dashboard tech-row middle pills container */
.techRow{position:relative !important;}
.techRow .midPills{
  position:absolute !important;
  top:50% !important;
  transform:translateY(-50%) !important;
  /* left edge: after the Avg ODO pill area; right edge: before rank badge */
  left: 280px !important;
  right: 130px !important;
  display:flex !important;
  justify-content:center !important;
  align-items:center !important;
  pointer-events:none !important; /* avoids accidental overlay clicks */
}
.techRow .midPills .pills{
  position:static !important;
  transform:none !important;
  left:auto !important;
  right:auto !important;
  width:auto !important;
  justify-content:center !important;
  overflow:visible !important;
}

@media (max-width: 700px){
  .techRow .midPills{left: 250px !important; right: 118px !important;}
}


/* ---- Dashboard tweaks: tighter gaps + more contrast + smaller Avg ODO pill ---- */.techRow .odoUnderName{left:18px !important; width:auto !important; justify-content:flex-start !important;}

.techRow .pill.odoHeaderLike{
  width:178px !important;
  min-width:178px !important;
  height:52px !important;
  padding:9px 12px !important;
}
.techRow .midPills{
  left:206px !important;
  right:118px !important;
}
.techRow .midPills .pills{
  gap:8px !important;
}
/* Darker pills with contrast */
.techRow .pill{
  background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(0,0,0,.72)) !important;
  border:1px solid rgba(255,255,255,.18) !important;
  box-shadow:0 12px 30px rgba(0,0,0,.58) inset, 0 10px 24px rgba(0,0,0,.22) !important;
}

/* Mobile adjustments */
@media (max-width: 700px){
  .techRow .pill.odoHeaderLike{
    width:159px !important;
    min-width:159px !important;
    height:48px !important;
    padding:8px 10px !important;
  }
  .techRow .midPills{
    left:186px !important;
    right:108px !important;
  }
}

/* --- FINAL: dashboard tech-row flex layout (prevents wrapping / 2-row layouts) --- */
.techRow.dashTechRow{
  position:relative !important;
  display:flex !important;
  align-items:center !important;
  gap:18px !important;
  padding:12px 14px !important;
  min-height:auto !important;
  overflow:visible !important;
}
.techRow.dashTechRow .dashLeft{
  flex:1 1 260px !important;
  max-width:260px !important;   /* hard limit so it can’t push pills/rank */
  min-width:0 !important;
  display:flex !important;
  flex-direction:column !important;
  gap:8px !important;
}

.techRow.dashTechRow .dashLeft *{min-width:0 !important;}
.techRow.dashTechRow .val.name{overflow:hidden !important; text-overflow:ellipsis !important; white-space:nowrap !important;}
.techRow.dashTechRow .val.name{
  position:static !important;
  max-width:100% !important;
  font-size: 24px !important;
}

@media (max-width: 700px){
  .techRow.dashTechRow .val.name{font-size: 21px !important;}
}
.techRow.dashTechRow .techNameStats{
  position:static !important;
  max-width:100% !important;
  overflow:hidden !important;
}
.techRow.dashTechRow .techNameStats .tnRow{
  display:flex !important;
  flex-wrap:nowrap !important;
  gap:12px !important;
}
.techRow.dashTechRow .dashRight{
  flex:0 0 auto !important;
  display:flex !important;
  align-items:center !important;
  justify-content:flex-start !important; /* starts immediately after name block */
  gap:12px !important;
  min-width:0 !important;
}
.techRow.dashTechRow .pills{
  position:static !important;
  transform:none !important;
  left:auto !important;
  right:auto !important;
  top:auto !important;
  display:flex !important;
  flex-wrap:nowrap !important;
  justify-content:flex-start !important;
  gap:10px !important;
  padding:0 !important;
  margin:0 !important;
}
.techRow.dashTechRow .techMetaRight{
  position:static !important;
  transform:none !important;
  margin:0 !important;
}



/* Comparison shading (dashboard tech-row pills)
   Bright, noticeable tint with NO glow outside the pill */
.techRow .pill{
  position: relative;
  overflow: hidden; /* clips everything at pill edge */
  box-shadow: inset 0 10px 26px rgba(0,0,0,.60) !important; /* no outside glow */
}

/* stronger overlay layer (off by default) */
.techRow .pill::before{
  content:"";
  position:absolute; inset:0;
  pointer-events:none;
  opacity: 0;
  background: transparent;
}

/* bright inner ring (still clipped) */
.techRow .pill::after{
  content:"";
  position:absolute; inset:0;
  border-radius: inherit;
  pointer-events:none;
  opacity: 0;
}

/* ensure text/content stays above overlays */
.techRow .pill > *{
  position: relative !important;
  z-index: 2 !important;
}

/* RED (BRIGHT) */
.techRow .pill.compR::before{
  opacity: .78;
  background:
    radial-gradient(circle at 50% 55%,
      rgba(0,0,0,.30) 0 42%,
      rgba(255, 55, 55, .40) 70%,
      rgba(255, 55, 55, .65) 100%
    ),
    linear-gradient(180deg, rgba(255,55,55,.25), rgba(255,55,55,.10));
}
.techRow .pill.compR::after{
  opacity: 1;
  box-shadow:
    inset 0 0 0 1px rgba(255, 90, 90, .55),
    inset 0 0 16px rgba(255, 70, 70, .35);
}

/* YELLOW (BRIGHT lemon, not gold) */
.techRow .pill.compY::before{
  opacity: .72;
  background:
    radial-gradient(circle at 50% 55%,
      rgba(0,0,0,.28) 0 42%,
      rgba(255, 245, 120, .35) 70%,
      rgba(255, 245, 120, .60) 100%
    ),
    linear-gradient(180deg, rgba(255,245,120,.22), rgba(255,245,120,.10));
}
.techRow .pill.compY::after{
  opacity: 1;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 160, .50),
    inset 0 0 16px rgba(255, 235, 90, .30);
}

/* GREEN (BRIGHT) */
.techRow .pill.compG::before{
  opacity: .68;
  background:
    radial-gradient(circle at 50% 55%,
      rgba(0,0,0,.30) 0 42%,
      rgba(60, 255, 140, .30) 70%,
      rgba(60, 255, 140, .55) 100%
    ),
    linear-gradient(180deg, rgba(60,255,140,.18), rgba(60,255,140,.08));
}
.techRow .pill.compG::after{
  opacity: 1;
  box-shadow:
    inset 0 0 0 1px rgba(120, 255, 180, .45),
    inset 0 0 16px rgba(60, 255, 140, .28);
}

/* ORANGE */
.techRow .pill.compO::before{
  opacity: .72;
  background:
    radial-gradient(circle at 50% 55%,
      rgba(0,0,0,.28) 0 42%,
      rgba(249, 115, 22, .35) 70%,
      rgba(249, 115, 22, .60) 100%
    ),
    linear-gradient(180deg, rgba(249,115,22,.22), rgba(249,115,22,.10));
}
.techRow .pill.compO::after{
  opacity: 1;
  box-shadow:
    inset 0 0 0 1px rgba(253, 150, 60, .50),
    inset 0 0 16px rgba(249, 115, 22, .30);
}


/* --- Force ALL pill text white (dashboard only) --- */
.pill, .pill *{
  color:#fff !important;
}



/* --- Tech rows only: shrink pills 10% (smaller) --- */
.techRow.dashTechRow .pills{
  transform:scale(0.9) !important;
  transform-origin:left center !important;
}


/* --- Fix: allow pill row to expand so last pill (Sold Goal) never clips --- */
.techRow .techRight,
.techRow .pills,
.techRow .pillGroup{
  overflow:visible !important;
}
.techRow .techRight{
  flex:1 1 auto !important;
  min-width:0 !important;
}
.techRow .pills{
  width:auto !important;
  max-width:none !important;
  flex:0 0 auto !important;
}



/* === FINAL: keep pills + rank badge inside the tech row (no overflow) === */
.techRow.dashTechRow{
  overflow:hidden !important;
  padding-right:18px !important; /* breathing room so the badge stays inside */
}
.techRow.dashTechRow .techRight{
  max-width:100% !important;
  overflow:hidden !important;
  transform:scale(0.9) !important;          /* shrink pills + badge together */
  transform-origin:right center !important; /* keep aligned to right edge */
}
.techRow.dashTechRow .pills{transform:none !important;}


/* --- Fix: let tech row flex to fit right-side (pills + rank badge), prevent clipping --- */
.techRow.dashTechRow{ overflow: visible !important; }
.techRow.dashTechRow .techRowInner{
  display:flex !important;
  align-items:center !important;
  gap:14px !important;
  min-width:0 !important;
}
.techRow.dashTechRow .techLeft{
  flex:1 1 auto !important;   /* left side can shrink to make room */
  min-width:0 !important;
}
.techRow.dashTechRow .techRight{
  flex:0 0 auto !important;   /* right side (pills+badge) keeps its width */
  min-width:0 !important;
}
.techRow.dashTechRow .pills{ min-width:0 !important; flex-wrap:nowrap !important; }



/* Category header split (left pills / right focus stats) */
.catHeader.catHeaderSplit{display:flex !important; justify-content:space-between !important; align-items:flex-start !important; gap:12px !important;}
.catHdrLeft{display:flex !important; flex-direction:column !important; align-items:flex-start !important; gap:6px !important; min-width:0 !important;}
.catHdrLeft .pills{margin-top:6px !important; justify-content:flex-start !important;}
.catHdrLeft .dashPills2Row{display:flex !important; flex-direction:column !important; gap:8px !important; margin-top:6px !important;}
.catHdrLeft .dashPills2Row .pills{margin-top:0 !important;}
.catHdrRight{display:flex !important; justify-content:flex-end !important; align-items:flex-start !important; flex:0 0 auto !important;}


/* === Requested: EXPRESS/KIA category header pills font sizing === */
.catDashPills .pill .v{font-size:18px !important; line-height:1.05 !important;}
.catDashPills .pill .k{font-size:13px !important; line-height:1.05 !important; text-transform:none !important;}
/* Requested: EXPRESS/KIA category header pills padding */
.catDashPills .pill{padding:7px 10px !important;}

/* === Requested: Technician mini stats under names (tnVal/tnLbl) === */
.techRow .techNameStats .tnVal{font-size:15px !important; line-height:1 !important;}
.techRow .techNameStats .tnLbl{font-size:11px !important; line-height:1 !important;}

/* === Requested: rank badge +15% on main dashboard tech rows only === */
.techRow.dashTechRow .techMetaRight .rankFocusBadge{transform:scale(1.15) !important; transform-origin:center !important;}



/* === Requested: TechRow colored pills sizing (dashboard tech rows) === */
/* Labels stay 10px; values (numbers/%/ratios) 16px; values in the active Focus group 17px */
.techRow.dashTechRow .pill .k{
  font-size:10px !important;
  line-height:1.05 !important;
  text-transform:none !important;
}
.techRow.dashTechRow .pill .v{
  font-size:16px !important;
  line-height:1.05 !important;
}
.techRow.dashTechRow .pillGroup.focusGroup .pill .v{
  font-size:17px !important;
}
`;
    const style = document.createElement("style");
    style.id = "dashTypographyOverrides_v2_ODO2PILLS";
    style.textContent = css;
    document.head.appendChild(style);
  }catch(e){}
}

// ===== UI (filters open state on routed pages) =====
const UI = { groupFilters:{}, techFilters:{} };

// ===== Technician search modal =====
function renderTechSearchResults(q){
  const list = (DATA.techs||[]).slice();
  const needle = (q||"").toLowerCase().trim();
  const matches = needle ? list.filter(t => (t.name||"").toLowerCase().includes(needle)) : list;
  matches.sort((a,b)=> (a.name||"").localeCompare(b.name||""));
  const out = matches.slice(0, 80).map(t=>{
    const team = t.team || "";
    return `<a class="resItem" href="#/tech/${encodeURIComponent(t.id)}" onclick="closeTechSearch(); return goTech(${JSON.stringify(t.id)})">
      <span>${safe(t.name || t.id)}</span>
      <span class="resBadge">${safe(team)}</span>
    </a>`;
  }).join("") || `<div class="notice">No matches.</div>`;
  const box = document.getElementById("techSearchResults");
  if(box) box.innerHTML = out;
}

function openTechSearch(prefill=""){
  const m = document.getElementById("techSearchModal");
  const inp = document.getElementById("techSearchInput");
  if(!m || !inp) return;
  m.classList.add("open");
  inp.value = prefill || "";
  renderTechSearchResults(inp.value);
  setTimeout(()=>inp.focus(), 0);
}

function closeTechSearch(){
  const m = document.getElementById("techSearchModal");
  if(m) m.classList.remove("open");
}

function initTechSearchModal(){
  const m = document.getElementById("techSearchModal");
  const inp = document.getElementById("techSearchInput");
  if(!m || !inp) return;

  // click outside closes
  m.addEventListener("click", (e)=>{
    if(e.target === m) closeTechSearch();
  });

  inp.addEventListener("input", ()=> renderTechSearchResults(inp.value));
  inp.addEventListener("keydown", (e)=>{
    if(e.key === "Escape"){ e.preventDefault(); closeTechSearch(); }
  });

  window.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") closeTechSearch();
    // Quick open (Ctrl/Cmd+K)
    if((e.ctrlKey || e.metaKey) && (e.key||"").toLowerCase() === "k"){
      e.preventDefault();
      openTechSearch();
    }
  });
}

function techAsrPerRo(t, filterKey){
  const v=Number(t?.summary?.[filterKey]?.asr_per_ro);
  return Number.isFinite(v)?v:null;
}
function techSoldPct(t, filterKey){
  const v=Number(t?.summary?.[filterKey]?.sold_pct);
  return Number.isFinite(v)?v:null;
}
function teamAsrPerRo(teamTechs, filterKey){
  let asr=0, ros=0;
  for(const t of (teamTechs||[])){
    const r=Number(t.ros);
    const a=Number(t?.summary?.[filterKey]?.asr);
    if(Number.isFinite(r) && r>0) ros+=r;
    if(Number.isFinite(a)) asr+=a;
  }
  return ros>0 ? (asr/ros) : null;
}

function teamSoldPerRo(teamTechs, filterKey){
  let sold=0, ros=0;
  for(const t of (teamTechs||[])){
    const r = Number(t.ros);
    const s = Number(t?.summary?.[filterKey]?.sold);
    if(Number.isFinite(r) && r>0) ros += r;
    if(Number.isFinite(s)) sold += s;
  }
  return ros>0 ? (sold/ros) : null;
}

function teamAverages(teamTechs, filterKey){
  return {
    ros_avg: mean(teamTechs.map(t=>t.ros)),
    odo_avg: mean(teamTechs.map(t=>t.odo)),
    asr_total_avg: mean(teamTechs.map(t=>t.summary?.[filterKey]?.asr)),
    asr_per_ro_avg: teamAsrPerRo(teamTechs, filterKey),
    sold_pct_avg: mean(teamTechs.map(t=>techSoldPct(t, filterKey))),
    sold_per_ro_avg: teamSoldPerRo(teamTechs, filterKey),
    sold_avg: mean(teamTechs.map(t=>t.summary?.[filterKey]?.sold)),
  };
}

function renderTeam(team, st){
  const techs=byTeam(team);
  const av=teamAverages(techs, st.filterKey);

  // Goal metric selection (from dashboard header Goal dropdown)
  const goalMetric = (st && st.goalMetric) ? String(st.goalMetric) : 'asr';
  const focusIsGoal = (st && st.sortBy) ? String(st.sortBy) === "goal" : false;

  // Two goal targets for row pills computed from per-category goals (matches Goals page):
  const _overallGoals = calcOverallGoals(st.filterKey);
  const asrGoalTarget = (Number.isFinite(_overallGoals.asrPerRo) && _overallGoals.asrPerRo > 0)
    ? _overallGoals.asrPerRo
    : (Number.isFinite(av.asr_per_ro_avg) ? av.asr_per_ro_avg : null);

  const soldGoalTarget = (Number.isFinite(_overallGoals.soldPct) && _overallGoals.soldPct > 0)
    ? _overallGoals.soldPct
    : (Number.isFinite(av.sold_pct_avg) ? av.sold_pct_avg : null);

  // Comparison mode for pill shading (TEAM | STORE | GOAL)
  const compareMode = (st && st.compare) ? String(st.compare).toLowerCase() : 'team';
  const storeTechs = (DATA.techs||[]);
  const storeAv = teamAverages(storeTechs, st.filterKey);

  function avgDerived(listIn, fn){
    let sum=0, n=0;
    for(const tt of listIn){
      const v = fn(tt);
      if(Number.isFinite(v)){
        sum += v; n += 1;
      }
    }
    return n ? (sum/n) : null;
  }

  // Baselines for comparison
  const baseAsrpr = (compareMode==="store") ? storeAv.asr_per_ro_avg : av.asr_per_ro_avg;
  const baseSoldPct = (compareMode==="store") ? storeAv.sold_pct_avg : av.sold_pct_avg;
  const baseAsrGoalRatio = (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 && Number.isFinite(baseAsrpr)) ? (baseAsrpr/asrGoalTarget) : null;
  const baseSoldGoalRatio = (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 && Number.isFinite(baseSoldPct)) ? (baseSoldPct/soldGoalTarget) : null;

  const groupList = (compareMode==="store") ? storeTechs : techs;

  const baseSoldRo = avgDerived(groupList, (tt)=>{
    const ss = (tt.summary && tt.summary[st.filterKey]) ? tt.summary[st.filterKey] : {};
    const ro = Number(tt.ros);
    const sold = Number(ss.sold);
    return (Number.isFinite(ro) && ro>0 && Number.isFinite(sold)) ? (sold/ro) : null;
  });

  const baseSoldAsr = avgDerived(groupList, (tt)=>{
    const ss = (tt.summary && tt.summary[st.filterKey]) ? tt.summary[st.filterKey] : {};
    const sold = Number(ss.sold);
    const asr = Number(ss.asr);
    return (Number.isFinite(asr) && asr>0 && Number.isFinite(sold)) ? (sold/asr) : null; // ratio (0-1)
  });

  // Global goal baselines for Sold/RO shading (if compareMode === "goal")
  const soldRoGoalTarget = (Number.isFinite(_overallGoals.soldPerRo) && _overallGoals.soldPerRo > 0)
    ? _overallGoals.soldPerRo
    : null;

  function compClass(actual, baseline){
    if(!Number.isFinite(actual) || !Number.isFinite(baseline) || baseline<=0) return "";
    const r = actual / baseline;
    if(window.getColorBand){
      const band = window.getColorBand(r);
      if(band==="green")  return " compG";
      if(band==="yellow") return " compY";
      if(band==="orange") return " compO";
      return " compR";
    }
    if(r >= 0.80) return " compG";
    if(r >= 0.60) return " compY";
    return " compR";
  }


  const list=techs.slice();
  list.sort((a,b)=>{
    const asrA = techAsrPerRo(a, st.filterKey);
    const asrB = techAsrPerRo(b, st.filterKey);
    const soldA = techSoldPct(a, st.filterKey);
    const soldB = techSoldPct(b, st.filterKey);

    // Goal focus ranks by (actual / goal) for the selected goal metric.
    const score = (t, asrpr, soldpct)=>{
      if(!focusIsGoal){
        return (st.sortBy==="sold_pct") ? soldpct : asrpr;
      }
      if(goalMetric==="sold"){
        return (Number.isFinite(soldpct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (soldpct/soldGoalTarget) : null;
      }
      return (Number.isFinite(asrpr) && Number.isFinite(asrGoalTarget) && asrGoalTarget>0) ? (asrpr/asrGoalTarget) : null;
    };

    const na = score(a, asrA, soldA);
    const nb = score(b, asrB, soldB);
    return (Number.isFinite(nb)?nb:-999) - (Number.isFinite(na)?na:-999);
  });

  // ranking follows the selected Focus (ASR/RO, Sold%, or Goal)
  const ranked = list.slice().sort((a,b)=>{
    const asrA = techAsrPerRo(a, st.filterKey);
    const asrB = techAsrPerRo(b, st.filterKey);
    const soldA = techSoldPct(a, st.filterKey);
    const soldB = techSoldPct(b, st.filterKey);

    const score = (t, asrpr, soldpct)=>{
      if(!focusIsGoal){
        return (st.sortBy==="sold_pct") ? soldpct : asrpr;
      }
      if(goalMetric==="sold"){
        return (Number.isFinite(soldpct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (soldpct/soldGoalTarget) : null;
      }
      return (Number.isFinite(asrpr) && Number.isFinite(asrGoalTarget) && asrGoalTarget>0) ? (asrpr/asrGoalTarget) : null;
    };

    const na = score(a, asrA, soldA);
    const nb = score(b, asrB, soldB);
    return (Number.isFinite(nb)?nb:-999) - (Number.isFinite(na)?na:-999);
  });
  const rankIndex = new Map();
  ranked.forEach((t,i)=>rankIndex.set(t.id, {rank:i+1,total:ranked.length}));

  const rows=list.map(t=>{
    const s=(t.summary && t.summary[st.filterKey]) ? t.summary[st.filterKey] : {};
    const rk = rankIndex.get(t.id) || {rank:null,total:null};
    const asrpr = techAsrPerRo(t, st.filterKey);
    const soldpct = techSoldPct(t, st.filterKey);

    // Goal ratios (always show both ASR Goal and Sold Goal)
    const asrGoalRatio = (Number.isFinite(asrpr) && Number.isFinite(asrGoalTarget) && asrGoalTarget>0) ? (asrpr/asrGoalTarget) : null;
    const soldGoalRatio = (Number.isFinite(soldpct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (soldpct/soldGoalTarget) : null;

    const asrGoalTxt = asrGoalRatio==null ? '—' : fmtPct(asrGoalRatio);
    const soldGoalTxt = soldGoalRatio==null ? '—' : fmtPct(soldGoalRatio);

    const soldRoVal = (Number.isFinite(Number(s.sold)) && Number.isFinite(Number(t.ros)) && Number(t.ros)>0) ? (Number(s.sold)/Number(t.ros)) : null;
    const soldAsrRatio = (Number.isFinite(Number(s.sold)) && Number.isFinite(Number(s.asr)) && Number(s.asr)>0) ? (Number(s.sold)/Number(s.asr)) : null;

    // Pill shading is controlled by Comparison mode only (TEAM | STORE | GOAL).
    const inGoalMode = compareMode==='goal';

    const compAsrBase = (compareMode==='goal')
      ? (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 ? asrGoalTarget : baseAsrpr)
      : baseAsrpr;

    const compSoldAsrBase = (compareMode==='goal')
      ? (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 ? soldGoalTarget : baseSoldAsr)
      : baseSoldAsr;

    const clsAsrpr   = compClass(asrpr, compAsrBase);
    const clsAsrGoal = compClass(asrGoalRatio, inGoalMode ? 1 : baseAsrGoalRatio);

    const clsSoldAsr = compClass(soldAsrRatio, compSoldAsrBase);
    // Sold/RO should remain shaded in GOAL comparison mode based on the overall SOLD goal (Sold/RO) from Goals.
    const soldRoBase = inGoalMode ? (Number.isFinite(soldRoGoalTarget) && soldRoGoalTarget>0 ? soldRoGoalTarget : baseSoldRo) : baseSoldRo;
    const clsSoldRo  = compClass(soldRoVal, soldRoBase);
    const clsSoldGoal= compClass(soldGoalRatio, inGoalMode ? 1 : baseSoldGoalRatio);

    const focusIsSold = st.sortBy === "sold_pct";

    return `
      <div class="techRow dashTechRow">
        <div class="dashLeft">
          <div class="val name" style="font-size:22px">
            <a href="#/tech/${encodeURIComponent(t.id)}" style="text-decoration:none;color:inherit" onclick="return goTech(${JSON.stringify(t.id)})">${safe(t.name)}</a>
          </div>

          <div class="techNameStats">
            <div class="tnRow tnRow1">
              <span class="tnMini"><span class="tnLbl">Avg ODO</span><span class="tnVal">${fmtInt(t.odo)}</span></span>
              <span class="miniDot">•</span>
              <span class="tnMini"><span class="tnLbl">ROs</span><span class="tnVal">${fmtInt(t.ros)}</span></span>
            </div>
            <div class="tnRow tnRow2">
              <span class="tnMini"><span class="tnLbl">ASRs</span><span class="tnVal">${fmtInt(s.asr)}</span></span>
              <span class="miniDot">•</span>
              <span class="tnMini"><span class="tnLbl">Sold</span><span class="tnVal">${fmtInt(s.sold)}</span></span>
            </div>
          </div>
        </div>

          <div class="dashRight">
          <div class="pills">
            ${/* Focus ordering (closest to rank badge) */""}
            ${focusIsGoal ? `
              <div class="pillGroup pillGroupNonGoal">
                <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(t.ros)) && Number(t.ros)>0) ? fmt1(Number(s.sold)/Number(t.ros),2) : "—"}</div></div>
                <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(s.asr)) && Number(s.asr)>0) ? fmtPct(Number(s.sold)/Number(s.asr)) : "—"}</div></div>
              </div>
              <div class="pillGroup pillGroupGoal">
                ${goalMetric==='asr'
                  ? `
                    <div class="pill${clsSoldGoal}${goalMetric==='sold' ? ' goalFocusSel' : ''}"><div class="k">Sold/ASRs Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                    <div class="pill${clsAsrGoal}${goalMetric==='asr' ? ' goalFocusSel' : ''}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                  `
                  : `
                    <div class="pill${clsAsrGoal}${goalMetric==='asr' ? ' goalFocusSel' : ''}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                    <div class="pill${clsSoldGoal}${goalMetric==='sold' ? ' goalFocusSel' : ''}"><div class="k">Sold/ASRs Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                  `
                }
              </div>
            ` : (focusIsSold ? `
              <div class="pillGroup pillGroupA">
                <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                <div class="pill${clsAsrGoal}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
              </div>
              <div class="pillGroup pillGroupB focusGroup">
                <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(t.ros)) && Number(t.ros)>0) ? fmt1(Number(s.sold)/Number(t.ros),2) : "—"}</div></div>
                <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(s.asr)) && Number(s.asr)>0) ? fmtPct(Number(s.sold)/Number(s.asr)) : "—"}</div></div>
                <div class="pill${clsSoldGoal}"><div class="k">Sold/ASRs Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
              </div>
            ` : `
              <div class="pillGroup pillGroupB">
                <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(t.ros)) && Number(t.ros)>0) ? fmt1(Number(s.sold)/Number(t.ros),2) : "—"}</div></div>
                <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(s.asr)) && Number(s.asr)>0) ? fmtPct(Number(s.sold)/Number(s.asr)) : "—"}</div></div>
                <div class="pill${clsSoldGoal}"><div class="k">Sold/ASRs Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
              </div>
              <div class="pillGroup pillGroupA focusGroup">
                <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                <div class="pill${clsAsrGoal}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
              </div>
            `)}          </div>

          <div class="techMetaRight">
            ${rankBadgeHtmlDash(rk.rank??"—", rk.total??"—", (focusIsGoal ? (goalMetric==="sold" ? "goal_sold" : "goal_asr") : (st.sortBy==="sold_pct" ? "sold" : "asr")), "sm")}
          </div>
        </div>
      </div>
    `;
  }).join("");

  const filterLabel = st.filterKey==="without_fluids" ? "Without Fluids" : (st.filterKey==="fluids_only" ? "Fluids Only" : "With Fluids (Total)");

  const appliedParts = [
    `${filterLabel}`,
    (st.sortBy==="sold_pct" ? "Focus: Sold" : "Focus: ASR/RO")
  ];
  const appliedTextHtml = renderFiltersText(appliedParts);


  return `
    <div class="panel">
      <div class="phead">
        <div class="catHeader catHeaderSplit">
          <div class="catHdrLeft">
            <div>
              <div class="catTitle" style="font-size:32px">${safe(team)}</div>
              <div class="muted svcMetaLine" style="margin-top:2px;color:rgba(255,255,255,.55)">${fmtInt(techs.length)} Technicians</div>
            </div>
          </div>

          <div class="catHdrMid">
            <div class="dashPills2Row catDashPills">
              <div class="pills pillsTop">
                <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(av.odo_avg)}</div></div>
                <div class="pill roPill"><div class="k">Avg ROs</div><div class="v">${fmtInt(av.ros_avg)}</div></div>
                <div class="pill"><div class="k">Avg ASRs</div><div class="v">${fmtInt(av.asr_total_avg)}</div></div>
              </div>
              <div class="pills pillsBottom">
                <div class="pill"><div class="k">Avg Sold</div><div class="v">${fmtInt(av.sold_avg)}</div></div>
                <div class="pill"><div class="k">Sold/ASRs</div><div class="v">${fmtPct(av.sold_pct_avg)}</div></div>
              </div>
            </div>
          </div>

          <div class="catHdrRight">
            <div class="catRank">
              ${st.sortBy==="sold_pct" ? `
                <div class="rankMain">
                  <div class="rankNum">${Number.isFinite(av.sold_per_ro_avg) ? fmt1(av.sold_per_ro_avg,2) : "—"}</div>
                  <div class="rankLbl">Sold/RO</div>
                </div>
                <div class="rankSub">
                  <div class="rankNum sub" style="color:#fff">${fmt1(av.asr_per_ro_avg,1)}</div>
                  <div class="rankLbl sub">ASRs/RO</div>
                </div>
              ` : `
                <div class="rankMain">
                  <div class="rankNum">${fmt1(av.asr_per_ro_avg,1)}</div>
                  <div class="rankLbl">ASRs/RO</div>
                </div>
                <div class="rankSub">
                  <div class="rankNum sub" style="color:#fff">${Number.isFinite(av.sold_per_ro_avg) ? fmt1(av.sold_per_ro_avg,2) : "—"}</div>
                  <div class="rankLbl sub">Sold/RO</div>
                </div>
              `}
            </div>
          </div>
</div>

        <!-- Removed per-team filters from EXPRESS/KIA category panels (filters are controlled in the main header) -->
      </div>
      <div class="list">${rows || `<div class="notice">No technicians found.</div>`}</div>
    </div>
  `;
}

const state = {
  EXPRESS: {filterKey:"total", sortBy:"asr_per_ro", goalMetric:"asr", filtersOpen:false},
  KIA: {filterKey:"total", sortBy:"asr_per_ro", goalMetric:"asr", filtersOpen:false},
};
// expose state for module scripts (app.js)
window.state = state;


function toggleTeamFilters(team){
  if(!state[team]) return;
  state[team].filtersOpen = !state[team].filtersOpen;
  renderMain();
}

function toggleGroupFilters(groupKey){
  UI.groupFilters[groupKey] = !UI.groupFilters[groupKey];
  renderGroupPage(groupKey);
}

function toggleTechFilters(techId){
  UI.techFilters[techId] = !UI.techFilters[techId];
  renderTech(techId);
}
// --- Split-repo glue: keep left menu populated ---
function __refreshSideMenu(){
  ensureDashTypographyOverrides();
  try { renderMenuTechLists(); } catch(e) { /* ignore */ }
  try { populateAsrMenuLinks(); } catch(e) { /* ignore */ }
}
window.addEventListener("DOMContentLoaded", __refreshSideMenu);
window.addEventListener("hashchange", __refreshSideMenu);

// === FIX: keep ranking badge inside row by shrinking the entire pills+badge group (tech rows only) ===
(function(){
  const ID = "dashTechRowPillsBadgeScale";
  if(document.getElementById(ID)) return;
  const st = document.createElement("style");
  st.id = ID;
  st.textContent = `
    .techRow.dashTechRow .techRight{
      display:flex !important;
      align-items:center !important;
      gap:10px !important;
      max-width:100% !important;
      transform:scale(0.9) !important;
      transform-origin:left center !important;
    }
    .techRow.dashTechRow .pills{ transform:none !important; }
  `;
  document.head.appendChild(st);
})();
