function renderServiceSettingsPage(){
  const app = document.getElementById("app");
  const secs = (typeof DATA!=='undefined' && Array.isArray(DATA.sections)) ? DATA.sections : [];

  // compute a stable name column width (in ch units) based on the longest service name
  const _allSvcNames = secs.flatMap(s => Array.isArray(s?.categories) ? s.categories.map(String) : []).map(s=>String(s||"").trim()).filter(Boolean);
  const _maxLenRaw = _allSvcNames.reduce((m,n)=>Math.max(m, n.length), 0);
  const _nameColCh = Math.max(16, Math.min(46, _maxLenRaw || 16)); // clamp for sanity

  const LS_KEY = "svcMinMilesByService_v1";
  function _load(){
    try{ return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; }
    catch(e){ return {}; }
  }
  function _save(map){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(map || {})); }
    catch(e){}
  }
  const map = _load();

  function esc(s){
    return String(s==null?"":s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }
  function keyFor(svc){
    return String(svc||"").trim();
  }
  function valFor(svc){
    const k = keyFor(svc);
    const v = map[k];
    if(v===0) return "0";
    return (v==null || v==="") ? "" : String(v);
  }

  function rowHtml(cat){
    const k = keyFor(cat);
    const id = "minMiles_" + encodeURIComponent(k);
    return `
      <div class="svcSetRow">
        <div class="svcSetLeft"><div class="svcSetName">${esc(cat)}</div></div>
        <div class="svcSetRight"><input class="svcSetInput" id="${id}" type="number" inputmode="numeric" min="0" step="500" placeholder="0" value="${esc(valFor(cat))}"></div>
      </div>
    `;
  }

  const sectionsHtml = secs.map(sec=>{
    const name = String(sec?.name||"").trim();
    const cats = Array.isArray(sec?.categories) ? sec.categories.map(String).filter(Boolean) : [];
    if(!name || !cats.length) return "";
    return `
      <div class="svcSetSection">
        <div class="svcSetSectionHdr">${esc(name)}</div>
        <div class="svcSetRows">
          ${cats.map(rowHtml).join("")}
        </div>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <div class="panel">
      <div class="phead">
        <div class="titleRow">
          <div>
            <div class="h2">SERVICE SETTINGS</div>
            <div class="sub"><a href="#/settings" style="text-decoration:none">← Back to settings</a></div>
          </div>
        </div>

        <div class="notice" style="padding:12px 0 0 0">
          Set the minimum vehicle mileage required for each service to be included in reporting.
        </div>

        <div class="svcSetGrid" style="--svcSetNameW: ${_nameColCh}ch;">
          <div class="svcSetHdr">
            <div class="svcSetHdrLeft">Service</div>
            <div class="svcSetHdrRight">Minimum Miles</div>
          </div>
          ${sectionsHtml || `<div class="notice">No services found in DATA.sections.</div>`}
        </div>

        <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px">
          <button id="svcSetClear" class="menuClose" style="width:auto;padding:8px 12px">Clear</button>
          <div id="svcSetSaved" class="sub" style="margin:0;opacity:.8;display:none">Saved</div>
        </div>
      </div>
    </div>
  `;

  function flashSaved(){
    const el = document.getElementById("svcSetSaved");
    if(!el) return;
    el.style.display = "block";
    el.textContent = "Saved";
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(()=>{ el.style.display="none"; }, 900);
  }

  // Save on input
  app.querySelectorAll(".svcSetInput").forEach(inp=>{
    inp.addEventListener("input", ()=>{
      const id = inp.id || "";
      const k = decodeURIComponent(id.replace(/^minMiles_/, ""));
      const n = Number(String(inp.value||"").trim());
      if(String(inp.value||"").trim()===""){
        delete map[k];
      }else if(Number.isFinite(n) && n>=0){
        map[k] = Math.round(n);
      }
      _save(map);
      flashSaved();
    });
  });

  // Clear all
  const btn = document.getElementById("svcSetClear");
  if(btn){
    btn.addEventListener("click", ()=>{
      try{ localStorage.removeItem(LS_KEY); }catch(e){}
      // reset UI
      app.querySelectorAll(".svcSetInput").forEach(inp=>inp.value="");
      for(const k of Object.keys(map)) delete map[k];
      flashSaved();
    });
  }
}

// Optional helper for later filtering logic
window.getServiceMinMiles = function(serviceName){
  try{
    const m = JSON.parse(localStorage.getItem("svcMinMilesByService_v1") || "{}") || {};
    const v = m[String(serviceName||"").trim()];
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }catch(e){
    return 0;
  }
};

window.renderServiceSettingsPage = renderServiceSettingsPage;
