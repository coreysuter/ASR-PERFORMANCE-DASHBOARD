// ─────────────────────────────────────────────────────────────
//  Service Settings Page
//  Manages: service descriptions, op-codes, and min miles per category.
//  On every save, commits config/services-config.json to GitHub (if token set).
// ─────────────────────────────────────────────────────────────

function renderServiceSettingsPage(){
  const app  = document.getElementById("app");
  const secs = (typeof DATA !== "undefined" && Array.isArray(DATA.sections)) ? DATA.sections : [];

  // ── Storage ────────────────────────────────────────────────
  const LS_KEY = "svcConfig_v2";

  function _load(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; }
    catch(e){ return {}; }
  }
  function _save(cfg){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(cfg || {})); }
    catch(e){}
  }

  // cfg shape: { opCodes:{catName:"TR,ROTATE"}, descriptions:{catName:"..."}, minMiles:{catName:5000} }
  const cfg = _load();
  if(!cfg.opCodes)      cfg.opCodes      = {};
  if(!cfg.descriptions) cfg.descriptions = {};
  if(!cfg.minMiles)     cfg.minMiles     = {};

  // ── Helpers ────────────────────────────────────────────────
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"]/g, c =>
      ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  }
  function key(cat){ return String(cat || "").trim(); }

  // ── Build config object for GitHub commit ──────────────────
  function _buildConfig(){
    return {
      owner:       "coreysuter",
      repo:        "ASR-PERFORMANCE-DASHBOARD",
      branch:      "main",
      generatedAt: new Date().toISOString(),
      sections: secs.map(sec => ({
        name: String(sec?.name || "").trim(),
        categories: (Array.isArray(sec?.categories) ? sec.categories : [])
          .map(String).filter(Boolean)
          .map(cat => {
            const k     = key(cat);
            const raw   = String(cfg.opCodes[k] || "").trim();
            const codes = raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : [];
            const miles = Number(cfg.minMiles[k]);
            return {
              name:        cat,
              opCodes:     codes,
              description: String(cfg.descriptions[k] || "").trim(),
              minMiles:    Number.isFinite(miles) && miles > 0 ? miles : 0
            };
          })
      })).filter(s => s.name && s.categories.length)
    };
  }

  // ── GitHub sync (debounced) ────────────────────────────────
  let _syncTimer = null;
  function _triggerSync(){
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(async () => {
      if(!window.commitToGitHub) return;
      const token = window.getGitHubToken ? window.getGitHubToken() : "";
      if(!token) return;
      _setGhStatus("syncing");
      const result = await window.commitToGitHub(_buildConfig());
      _setGhStatus(result.ok ? "ok" : "err", result.err);
    }, 1200);
  }

  function _setGhStatus(state, msg){
    const el = document.getElementById("svcGhStatus");
    if(!el) return;
    if(state === "syncing"){
      el.style.display = "flex";
      el.innerHTML = `<span style="opacity:.6">↑ Syncing to GitHub…</span>`;
    } else if(state === "ok"){
      el.style.display = "flex";
      el.innerHTML = `<span style="color:#86efac">✓ Saved to GitHub</span>`;
      setTimeout(()=>{ el.style.display="none"; }, 3000);
    } else if(state === "err"){
      el.style.display = "flex";
      el.innerHTML = `<span style="color:#f87171" title="${esc(msg||"")}">✗ GitHub sync failed — ${esc((msg||"").substring(0,60))}</span>`;
    } else {
      el.style.display = "none";
    }
  }

  // ── Row HTML ───────────────────────────────────────────────
  function rowHtml(cat){
    const k    = key(cat);
    const encK = encodeURIComponent(k);
    return `
      <div class="svcSetRow" style="align-items:center;gap:8px;flex-wrap:nowrap">

        <div style="flex:0 0 var(--svcSetNameW,18ch);min-width:0">
          <div class="svcSetName" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
            title="${esc(cat)}">${esc(cat)}</div>
        </div>

        <div style="flex:2;min-width:0">
          <input class="svcSetMiles svcDescInput"
            id="desc_${encK}"
            type="text" maxlength="120"
            placeholder="Short description (optional)"
            value="${esc(cfg.descriptions[k] || "")}"
            style="width:100%;box-sizing:border-box;font-size:12px">
        </div>

        <div style="flex:1.2;min-width:0">
          <input class="svcSetMiles svcOpInput"
            id="op_${encK}"
            type="text" maxlength="200"
            placeholder="e.g. TR, ROTATE"
            value="${esc(cfg.opCodes[k] || "")}"
            style="width:100%;box-sizing:border-box;font-size:12px;font-family:monospace">
        </div>

        <div style="flex:0 0 90px">
          <input class="svcSetMiles svcMilesInput"
            id="miles_${encK}"
            type="number" inputmode="numeric" min="0" step="500"
            placeholder="0"
            value="${esc(cfg.minMiles[k] > 0 ? cfg.minMiles[k] : "")}"
            style="width:100%;box-sizing:border-box">
        </div>

      </div>
    `;
  }

  // ── Section HTML ───────────────────────────────────────────
  const sectionsHtml = secs.map(sec => {
    const name = String(sec?.name || "").trim();
    const cats = Array.isArray(sec?.categories)
      ? sec.categories.map(String).filter(Boolean)
      : [];
    if(!name || !cats.length) return "";
    return `
      <div class="svcSetSection">
        <div class="svcSetSectionHdr">
          <div class="svcSetSectionHdrName">${esc(name)}</div>
          <div style="display:flex;gap:8px;align-items:center;margin-left:auto">
            <div style="font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;
              color:rgba(234,240,255,.3);flex:2;text-align:left;padding-left:2px">Description</div>
            <div style="font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;
              color:rgba(234,240,255,.3);flex:1.2;text-align:left;padding-left:2px">Op-Codes</div>
            <div style="font-size:10px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;
              color:rgba(234,240,255,.3);width:90px;text-align:left;padding-left:2px">Min Miles</div>
          </div>
        </div>
        <div class="svcSetRows">
          ${cats.map(rowHtml).join("")}
        </div>
      </div>
    `;
  }).join("");

  // ── Page HTML ──────────────────────────────────────────────
  const allCats  = secs.flatMap(s => Array.isArray(s?.categories) ? s.categories : []).map(v=>String(v||""));
  const longest  = allCats.reduce((a,b)=> b.length > a.length ? b : a, "");
  const nameWch  = Math.max(14, Math.min(44, longest.length + 2));
  const hasToken = !!(window.getGitHubToken && window.getGitHubToken());

  app.innerHTML = `
    <div class="techNotchStage" style="position:relative; width:100%; overflow:visible;">
      <div class="panel techMenuFloat" style="
        position:absolute; left:-80px; top:4px;
        width:72px; height:72px;
        display:flex; align-items:center; justify-content:center;
        border-radius:14px; z-index:2;">
        <label for="menuToggle" class="hamburgerMini" aria-label="Menu" style="
          font-size:2.2em; line-height:1;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:inherit; user-select:none;">☰</label>
      </div>

      <div class="panel svcSetPanel" style="--svcSetNameW:${nameWch}ch;min-width:0;">
        <div class="phead">

          <div class="titleRow">
            <div>
              <div class="h2" style="font-size:33px;letter-spacing:.2px">SERVICE SETTINGS</div>
              <div class="sub"><a href="#/settings" style="text-decoration:none">← Back to settings</a></div>
            </div>
            ${hasToken ? `
            <div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;
              background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);flex-shrink:0">
              <span style="font-size:14px">🔗</span>
              <span style="font-size:11px;font-weight:800;color:#86efac">GitHub Connected</span>
            </div>` : `
            <div style="display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;
              background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);flex-shrink:0">
              <span style="font-size:14px">⚠</span>
              <span style="font-size:11px;font-weight:800;color:#fbbf24">Local Only
                <a href="#/settings/dealer" style="color:#fbbf24;margin-left:4px;font-weight:700">Add Token →</a>
              </span>
            </div>`}
          </div>

          <div class="notice" style="padding:8px 0 4px 0">
            Configure the op-codes, description, and minimum mileage for each service.
            Changes save instantly${hasToken ? " and sync to GitHub automatically" : ""}.
          </div>

          <div class="svcSetGrid" style="margin-top:8px">
            ${sectionsHtml || `<div class="notice">No services found in DATA.sections.</div>`}
          </div>

          <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;
            margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)">
            <div id="svcGhStatus" style="display:none;font-size:12px;font-weight:700;margin-right:auto"></div>
            <div id="svcSetSaved" class="sub" style="margin:0;opacity:.8;display:none">✓ Saved locally</div>
            <button id="svcSetClear" class="menuClose" style="width:auto;padding:8px 12px">Clear All</button>
          </div>

        </div>
      </div>
    </div>
  `;

  // ── Flash "saved locally" ──────────────────────────────────
  function flashSaved(){
    const el = document.getElementById("svcSetSaved");
    if(!el) return;
    el.style.display = "block";
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(()=>{ el.style.display = "none"; }, 1500);
  }

  // ── Wire up description inputs ─────────────────────────────
  app.querySelectorAll(".svcDescInput").forEach(inp => {
    inp.addEventListener("input", () => {
      const k = decodeURIComponent(inp.id.replace(/^desc_/, ""));
      const v = inp.value.trim();
      if(v) cfg.descriptions[k] = v; else delete cfg.descriptions[k];
      _save(cfg);
      flashSaved();
      _triggerSync();
    });
  });

  // ── Wire up op-code inputs ─────────────────────────────────
  app.querySelectorAll(".svcOpInput").forEach(inp => {
    inp.addEventListener("input", () => {
      const k = decodeURIComponent(inp.id.replace(/^op_/, ""));
      const v = inp.value.trim();
      if(v) cfg.opCodes[k] = v; else delete cfg.opCodes[k];
      _save(cfg);
      flashSaved();
      _triggerSync();
    });
  });

  // ── Wire up min-miles inputs ───────────────────────────────
  app.querySelectorAll(".svcMilesInput").forEach(inp => {
    inp.addEventListener("input", () => {
      const k   = decodeURIComponent(inp.id.replace(/^miles_/, ""));
      const raw = String(inp.value || "").trim();
      if(raw === ""){
        delete cfg.minMiles[k];
      } else {
        const n = Number(raw);
        if(Number.isFinite(n) && n >= 0) cfg.minMiles[k] = Math.round(n);
      }
      _save(cfg);
      flashSaved();
      _triggerSync();
    });
  });

  // ── Clear all ──────────────────────────────────────────────
  document.getElementById("svcSetClear")?.addEventListener("click", () => {
    if(!confirm("Clear all service descriptions, op-codes, and min miles?\nThis cannot be undone.")) return;
    try{ localStorage.removeItem(LS_KEY); }catch(e){}
    cfg.opCodes = {}; cfg.descriptions = {}; cfg.minMiles = {};
    app.querySelectorAll(".svcDescInput, .svcOpInput, .svcMilesInput")
      .forEach(inp => inp.value = "");
    flashSaved();
    _triggerSync();
  });
}

// ─────────────────────────────────────────────────────────────
//  Public helpers
// ─────────────────────────────────────────────────────────────

// Full config object for pipeline / other pages
window.getServiceConfig = function(){
  try{
    const cfg = JSON.parse(localStorage.getItem("svcConfig_v2") || "{}") || {};
    return {
      opCodes:      cfg.opCodes      || {},
      descriptions: cfg.descriptions || {},
      minMiles:     cfg.minMiles     || {}
    };
  } catch(e){
    return { opCodes:{}, descriptions:{}, minMiles:{} };
  }
};

// Legacy helper — backward-compatible with existing code
window.getServiceMinMiles = function(serviceName){
  try{
    const cfg = JSON.parse(localStorage.getItem("svcConfig_v2") || "{}") || {};
    const map = cfg.minMiles || {};
    const v   = map[String(serviceName || "").trim()];
    const n   = Number(v);
    return Number.isFinite(n) ? n : 0;
  } catch(e){
    return 0;
  }
};

window.renderServiceSettingsPage = renderServiceSettingsPage;
