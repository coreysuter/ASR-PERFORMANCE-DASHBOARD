function renderServiceSettingsPage(){
  const app = document.getElementById("app");
  const secs = (typeof DATA!=='undefined' && Array.isArray(DATA.sections)) ? DATA.sections : [];

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

  // Compute fixed name column width (in ch) based on the longest service name
  let maxChars = 18;
  try{
    const all = [];
    secs.forEach(sec=>{
      const cats = Array.isArray(sec?.categories) ? sec.categories : [];
      cats.forEach(c=>{ if(c!=null) all.push(String(c)); });
    });
    all.forEach(s=>{ maxChars = Math.max(maxChars, String(s).trim().length); });
    maxChars = Math.min(Math.max(maxChars + 2, 18), 56); // clamp
  }catch(e){}
  app.style.setProperty('--svcSetNameW', `${maxChars}ch`);

  function rowHtml(cat){
    const k = keyFor(cat);
    const id = "minMiles_" + encodeURIComponent(k);
    return `
      <div class="svcSetRow">
        <div class="svcSetLeft"><div class="svcSetName">${esc(cat)}</div></div>
        <div class="svcSetRight">
          <input class="svcSetInput" id="${id}" type="number" inputmode="numeric" min="0" step="500" placeholder="0" value="${esc(valFor(cat))}">
        </div>
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
    <div class="techNotchStage pageServiceSettings" style="position:relative; width:100%; overflow:visible;">
      <div class="panel techMenuNotch" style="
        position:absolute;
        left:-68px;
        top:0px;
        width:68px;
        height:56px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-top-right-radius:0px;
        border-bottom-right-radius:0px;
        border-right:none;
        z-index:3;
      ">
        <label for="menuToggle" class="hamburgerMini" aria-label="Menu" style="
          font-size:1.5em;
          line-height:1;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:8px 10px;
          cursor:pointer;
          color:inherit;
          user-select:none;
        ">☰</label>
      </div>

      <div class="panel techHeaderPanel svcSetPanel" style="border-top-left-radius:0px;border-left:none;min-width:0;">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div class="h2">SERVICE SETTINGS</div>
            </div>
          </div>

          <div class="notice svcSetNotice">
            Set the minimum vehicle mileage required for each service to be included in reporting.
          </div>

          <div class="svcSetGrid">
            <div class="svcSetHdr">
              <div class="svcSetHdrLeft">Service</div>
              <div class="svcSetHdrRight">Minimum Miles</div>
            </div>

            ${sectionsHtml || `<div class="notice">No services found in DATA.sections.</div>`}
          </div>

          <div class="svcSetFooter">
            <button id="svcSetClear" class="menuClose svcSetClearBtn">Clear</button>
            <div id="svcSetSaved" class="sub svcSetSaved" style="display:none">Saved</div>
          </div>
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
      const raw = String(inp.value||"").trim();
      const n = Number(raw);
      if(raw===""){
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
