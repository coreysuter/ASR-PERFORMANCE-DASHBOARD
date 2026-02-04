const DATA = JSON.parse(document.getElementById('data').textContent);

// ---------------------
// Helpers / utils
// ---------------------
const $ = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
const nowISO = ()=>new Date().toISOString().slice(0,10);

function safe(s){
  return String(s??"").replace(/[&<>"]/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"
  }[ch]));
}
function fmtInt(v){
  const n = Number(v);
  if(v===null||v===undefined||!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString();
}
function fmt1(v,d=1){
  const n = Number(v);
  if(v===null||v===undefined||!Number.isFinite(n)) return "—";
  return n.toFixed(d);
}
function fmtPct(v){
  const n = Number(v);
  if(v===null||v===undefined||!Number.isFinite(n)) return "—";
  return (n*100).toFixed(1) + "%";
}
function fmtPctPlain(v){
  const n = Number(v);
  if(v===null||v===undefined||v==="") return "—";
  if(!Number.isFinite(n)) return "—";
  return (Math.round(n*1000)/10).toFixed(1) + "%";
}
function fmtMoney(v){
  const n = Number(v);
  if(!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined,{style:"currency",currency:"USD",maximumFractionDigits:0});
}

// ---------------------
// Gauge helpers
// ---------------------
function clamp01(x){
  x=Number(x);
  if(!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function miniGauge(pct){
  if(!(Number.isFinite(pct))) return "";
  const p = clamp01(pct);
  const p100 = Math.round(p*100);
  return `<span class="miniGauge" style="--p:${p100}"><span class="needle"></span></span>`;
}

function svcGauge(pct, label=""){
  const p = Number.isFinite(pct) ? Math.max(0, pct) : 0;
  const disp = Math.round(p*100);
  const ring = Math.round(Math.min(p, 1) * 100);

  let cls = "gRed";
  if(p >= 0.80) cls = "gGreen";
  else if(p >= 0.60) cls = "gYellow";

  const lbl = String(label||"").trim();
  const textHtml = lbl
    ? `<span class="pctText pctStack"><span class="pctMain">${disp}%</span><span class="pctSub">${safe(lbl)}</span></span>`
    : `<span class="pctText">${disp}%</span>`;

  return `<span class="svcGauge ${cls}" data-p="${ring}">
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle class="bg" cx="18" cy="18" r="15.91549430918954"></circle>
      <circle class="fg" cx="18" cy="18" r="15.91549430918954"></circle>
    </svg>
    ${textHtml}
  </span>`;
}

function animateSvcGauges(root=document){
  const els = root.querySelectorAll('.svcGauge[data-p]');
  els.forEach(el=>{ el.style.setProperty('--p', '0'); });
  requestAnimationFrame(()=>{
    els.forEach(el=>{
      const target = Number(el.getAttribute('data-p')||0);
      if(Number.isFinite(target)) el.style.setProperty('--p', String(Math.max(0, Math.min(100, target))));
    });
  });
}

// ---------------------
// Global UI state
// ---------------------
const UI = {
  groupFilters: {},       // { [groupKey]: boolean }
  techFilters: {},        // { [techId]: boolean }
  focus: "asr",           // "asr" | "sold" (used by tech pages)
  techSearchOpen:false,
  techSearchQuery:"",
};

window.UI = UI;

// ---------------------
// Side menu: tech lists + services links
// ---------------------
function renderMenuTechLists(){
  const expWrap = document.getElementById("menuTechListExpress");
  const kiaWrap = document.getElementById("menuTechListKia");
  if(!expWrap || !kiaWrap) return;

  const exp = (DATA?.teams?.EXPRESS?.techs || []).slice().sort((a,b)=>String(a.name).localeCompare(String(b.name)));
  const kia = (DATA?.teams?.KIA?.techs || []).slice().sort((a,b)=>String(a.name).localeCompare(String(b.name)));

  expWrap.innerHTML = exp.map(t=>`<a class="menuLink" href="#/tech/${encodeURIComponent(t.id)}">${safe(t.name)}</a>`).join("") || `<div class="muted" style="padding:6px 10px">No technicians</div>`;
  kiaWrap.innerHTML = kia.map(t=>`<a class="menuLink" href="#/tech/${encodeURIComponent(t.id)}">${safe(t.name)}</a>`).join("") || `<div class="muted" style="padding:6px 10px">No technicians</div>`;
}

/**
 * Builds the Services list in the hamburger menu.
 * IMPORTANT: links MUST use #/services/<groupKey> to match the router.
 */
function populateAsrMenuLinks(){
  const wrap = document.getElementById("asrMenuLinks");
  if(!wrap) return;

  const groups = DATA?.groups || {};
  const keys = Object.keys(groups);

  // Stable order if provided, otherwise alpha by display name
  const ordered = (DATA?.groupOrder && Array.isArray(DATA.groupOrder) && DATA.groupOrder.length)
    ? DATA.groupOrder.filter(k=>keys.includes(k))
    : keys.sort((a,b)=>String(groups[a]?.name||a).localeCompare(String(groups[b]?.name||b)));

  wrap.innerHTML = ordered.map(key=>{
    const g = groups[key];
    const name = g?.name || key;
    // ✅ router-compatible link
    return `<a class="menuLink" href="#/services/${encodeURIComponent(key)}">${safe(name)}</a>`;
  }).join("") || `<div class="muted" style="padding:6px 10px">No services</div>`;
}

// ---------------------
// Filters / Search helpers
// ---------------------
function renderFiltersText({focus="asr",teamKey="ALL"}={}){
  const focusTxt = focus==="sold" ? "SOLD%" : "ASR/RO";
  const teamTxt = teamKey ? String(teamKey).toUpperCase() : "ALL";
  return `${focusTxt} • ${teamTxt}`;
}

function openTechSearch(){
  UI.techSearchOpen = true;
  const modal = document.getElementById("techSearchModal");
  if(modal) modal.classList.add("open");
  const inp = document.getElementById("techSearchInput");
  if(inp){ inp.value = UI.techSearchQuery || ""; inp.focus(); }
  renderTechSearchResults();
}
function closeTechSearch(){
  UI.techSearchOpen = false;
  const modal = document.getElementById("techSearchModal");
  if(modal) modal.classList.remove("open");
}
window.closeTechSearch = closeTechSearch;

function renderTechSearchResults(){
  const list = document.getElementById("techSearchResults");
  if(!list) return;

  const q = (UI.techSearchQuery || "").trim().toLowerCase();
  const all = []
    .concat(DATA?.teams?.EXPRESS?.techs || [])
    .concat(DATA?.teams?.KIA?.techs || []);

  const hits = q
    ? all.filter(t=>String(t.name||"").toLowerCase().includes(q))
    : all;

  list.innerHTML = hits.slice(0,50).map(t=>`
    <a class="modalRow" href="#/tech/${encodeURIComponent(t.id)}" onclick="window.closeTechSearch && window.closeTechSearch()">
      <div class="modalName">${safe(t.name)}</div>
      <div class="modalSub">${safe(t.team || "")}</div>
    </a>
  `).join("") || `<div class="muted" style="padding:10px">No matches</div>`;
}

// Bind live search
window.addEventListener("DOMContentLoaded", ()=>{
  const inp = document.getElementById("techSearchInput");
  if(inp){
    inp.addEventListener("input", ()=>{
      UI.techSearchQuery = inp.value || "";
      renderTechSearchResults();
    });
    inp.addEventListener("keydown", (e)=>{
      if(e.key==="Escape") closeTechSearch();
    });
  }
});

// ---------------------
// Team panel state (used by Main dashboard)
// ---------------------
const state = {
  EXPRESS: {filterKey:"total", sortBy:"asr_per_ro", filtersOpen:false},
  KIA: {filterKey:"total", sortBy:"asr_per_ro", filtersOpen:false},
};

function toggleTeamFilters(team){
  if(!state[team]) return;
  state[team].filtersOpen = !state[team].filtersOpen;
  renderMain();
}

function toggleGroupFilters(groupKey){
  UI.groupFilters[groupKey] = !UI.groupFilters[groupKey];
  // renderGroupPage is defined in js/pages/renderGroupPage.js
  renderGroupPage(groupKey);
}

function toggleTechFilters(techId){
  UI.techFilters[techId] = !UI.techFilters[techId];
  // renderTech is defined in js/pages/renderTech.js
  renderTech(techId);
}

// ---------------------
// Shared team panel renderer (used by Main dashboard)
// ---------------------
function renderTeam(teamKey, teamState){
  const team = DATA?.teams?.[teamKey];
  if(!team) return "";

  const focus = teamState.sortBy==="sold_pct" ? "sold" : "asr";
  const filtersOpen = !!teamState.filtersOpen;

  const filters = [
    {key:"total", label:"Total"},
    ...(team?.groups || []).map(g=>({key:g.key,label:g.name}))
  ];

  const filterBar = `
    <div class="filterBar ${filtersOpen ? "open" : ""}">
      <button class="iconBtn" onclick="toggleTeamFilters('${teamKey}')" title="Filters" aria-label="Filters">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18l-7 8v5l-4 2v-7L3 5z"/></svg>
      </button>
      <button class="iconBtn" onclick="openTechSearch()" title="Search" aria-label="Search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 4a6 6 0 104.47 10.03l4.25 4.25 1.41-1.41-4.25-4.25A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"/></svg>
      </button>

      <div class="filterPills">
        ${filters.map(f=>`
          <button class="pillBtn ${teamState.filterKey===f.key ? "on" : ""}"
                  onclick="(state['${teamKey}'].filterKey='${f.key}', renderMain())">
            ${safe(f.label)}
          </button>
        `).join("")}
      </div>

      <div class="sortPills">
        <button class="pillBtn ${focus==="asr" ? "on" : ""}" onclick="(state['${teamKey}'].sortBy='asr_per_ro', renderMain())">ASR/RO</button>
        <button class="pillBtn ${focus==="sold" ? "on" : ""}" onclick="(state['${teamKey}'].sortBy='sold_pct', renderMain())">SOLD%</button>
      </div>
    </div>
  `;

  const activeGroupKey = teamState.filterKey;
  const list = (team?.techs || []).map(t=>{
    // If a group filter is active, find that group stats; else total
    const gStats = (activeGroupKey==="total")
      ? (t.total || {})
      : (t.groups?.[activeGroupKey] || {});

    const val = focus==="sold" ? Number(gStats.sold_pct) : Number(gStats.asr_per_ro);
    const dial = svcGauge(val, "");

    const rank = focus==="sold" ? t.rank_sold?.[activeGroupKey] : t.rank_asr?.[activeGroupKey];
    const rankTxt = Number.isFinite(rank) ? String(rank) : "—";

    return {
      name: t.name,
      id: t.id,
      dial,
      valTxt: focus==="sold" ? fmtPct(val) : fmtPctPlain(val),
      rankTxt,
      ros: fmtInt(gStats.ros),
      asrs: fmtInt(gStats.asrs),
      sold: fmtInt(gStats.sold),
    };
  });

  // Sort list based on selected metric
  list.sort((a,b)=>{
    const av = parseFloat(String(a.valTxt).replace("%","")) || 0;
    const bv = parseFloat(String(b.valTxt).replace("%","")) || 0;
    return bv - av;
  });

  const rows = list.map(t=>`
    <a class="tRow" href="#/tech/${encodeURIComponent(t.id)}">
      <div class="tLeft">
        <div class="tRank">${safe(t.rankTxt)}</div>
        <div class="tName">${safe(t.name)}</div>
        <div class="tMeta">
          <span class="muted">ROs</span> <b>${t.ros}</b>
          <span class="dotSep">•</span>
          <span class="muted">ASRs</span> <b>${t.asrs}</b>
          <span class="dotSep">•</span>
          <span class="muted">Sold</span> <b>${t.sold}</b>
        </div>
      </div>
      <div class="tRight">
        <div class="tDial">${t.dial}</div>
        <div class="tVal">${t.valTxt}</div>
      </div>
    </a>
  `).join("");

  return `
    <div class="teamPanel">
      <div class="teamHead">
        <div class="teamName">${safe(team.name || teamKey)}</div>
        <div class="teamSub">${safe(renderFiltersText({focus,teamKey}))}</div>
      </div>
      ${filterBar}
      <div class="list">${rows || `<div class="notice">No technicians found.</div>`}</div>
    </div>
  `;
}

/* --- Split-repo glue: keep left menu populated --- */
function __refreshSideMenu(){
  try { renderMenuTechLists(); } catch(e) { /* ignore */ }
  try { populateAsrMenuLinks(); } catch(e) { /* ignore */ }
}

window.addEventListener("DOMContentLoaded", () => {
  __refreshSideMenu();
});

window.addEventListener("hashchange", () => {
  __refreshSideMenu();
});
