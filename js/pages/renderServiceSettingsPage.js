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

  // ── Op-codes storage ────────────────────────────────────
  const OPC_KEY = "svcOpCodes_v1";
  const OPC_DEFAULTS = [
    { service:"ROTATE",                          opcode:"TR, ROTATE",                   desc:"ROTATE TIRES" },
    { service:"WIPERS",                          opcode:"FWIPER, RWIPER",                desc:"WIPER" },
    { service:"ALIGNMENT",                       opcode:"ALIGN",                         desc:"ALIGNMENT" },
    { service:"BATTERY",                         opcode:"RBATT",                         desc:"BATTERY - REPLACE" },
    { service:"SPARK PLUGS",                     opcode:"4PLUG, 6PLUG, 8PLUG",           desc:"SPARK PLUGS" },
    { service:"ENGINE AIR FILTER",               opcode:"AF",                            desc:"AIR CLEANER ELEMENT, ENGINE AIR FILTER" },
    { service:"CABIN AIR FILTER",                opcode:"CF",                            desc:"AIR CONDITIONER FILTER, CABIN AIR FILTER" },
    { service:"MOA OIL ADDITIVE",                opcode:"MOA",                           desc:"MOA" },
    { service:"CF5 - FUEL TREATMENT",            opcode:"CF5",                           desc:"CF5" },
    { service:"CFS - FUEL INDUCTION SERVICE",    opcode:"CFS",                           desc:"CFS" },
    { service:"BRAKE FLUID EXCHANGE",            opcode:"BRAKEF",                        desc:"BRAKE SYSTEM, REPLACE BRAKE/CLUTCH FLUID" },
    { service:"ENGINE COOLANT",                  opcode:"CSS",                           desc:"ENGINE COOLANT" },
    { service:"TRANS FLUID",                     opcode:"TRANSF",                        desc:"TRANSMISSION FLUID, TRANSAXLE FLUID" },
    { service:"FRONT BRAKES & ROTORS (RED)",     opcode:"FBS",                           desc:"Brake Pads (Front) - Replace & Resurface Rotors ($???.??) (Red), Brake Pads (Front) - Replace and Resurface Rotors ($???.??) (Red), Brake Pads and Rotors (Front) - Replace ($???.??) (Red), Brake Pads (Front) - Replace & Resurface Rotors ($?,???.??) (Red), Brake Pads (Front) - Replace and Resurface Rotors ($?,???.??) (Red), Brake Pads and Rotors (Front) - Replace ($?,???.??) (Red)" },
    { service:"FRONT BRAKES & ROTORS (YELLOW)",  opcode:"FBS",                           desc:"Brake Pads (Front) - Replace & Resurface Rotors ($???.??) (Yellow), Brake Pads (Front) - Replace and Resurface Rotors ($???.??) (Yellow), Brake Pads and Rotors (Front) - Replace ($???.??) (Yellow), Brake Pads (Front) - Replace & Resurface Rotors ($?,???.??) (Yellow), Brake Pads (Front) - Replace and Resurface Rotors ($?,???.??) (Yellow), Brake Pads and Rotors (Front) - Replace ($?,???.??) (Yellow)" },
    { service:"REAR BRAKES & ROTORS (RED)",      opcode:"RBS",                           desc:"Brake Pads (Rear) - Replace & Resurface Rotors ($???.??) (Red), Brake Pads (Rear) - Replace and Resurface Rotors ($???.??) (Red), Brake Pads and Rotors (Rear) - Replace ($???.??) (Red), Brake Pads (Rear) - Replace & Resurface Rotors ($?,???.??) (Red), Brake Pads (Rear) - Replace and Resurface Rotors ($?,???.??) (Red), Brake Pads and Rotors (Rear) - Replace ($?,???.??) (Red)" },
    { service:"REAR BRAKES & ROTORS (YELLOW)",   opcode:"RBS",                           desc:"Brake Pads (Rear) - Replace & Resurface Rotors ($???.??) (Yellow), Brake Pads (Rear) - Replace and Resurface Rotors ($???.??) (Yellow), Brake Pads and Rotors (Rear) - Replace ($???.??) (Yellow), Brake Pads (Rear) - Replace & Resurface Rotors ($?,???.??) (Yellow), Brake Pads (Rear) - Replace and Resurface Rotors ($?,???.??) (Yellow), Brake Pads and Rotors (Rear) - Replace ($?,???.??) (Yellow)" },
    { service:"TWO TIRES (RED)",                 opcode:"2TIRE",                         desc:"Replace 2 Tires ($???.??) (Red), Replace 2 Tires ($?,???.??) (Red)" },
    { service:"TWO TIRES (YELLOW)",              opcode:"2TIRE",                         desc:"Replace 2 Tires ($???.??) (Yellow), Replace 2 Tires ($?,???.??) (Yellow)" },
    { service:"FOUR TIRES (RED)",                opcode:"4TIRE",                         desc:"Replace 4 Tires ($???.??) (Red), Replace 4 Tires ($?,???.??) (Red)" },
    { service:"FOUR TIRES (YELLOW)",             opcode:"4TIRE",                         desc:"Replace 4 Tires ($???.??) (Yellow), Replace 4 Tires ($?,???.??) (Yellow)" },
  ];
  function _loadOpc(){
    try{
      const raw = localStorage.getItem(OPC_KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    return OPC_DEFAULTS.map((r,i)=>({...r, id:i+1}));
  }
  function _saveOpc(rows){
    try{ localStorage.setItem(OPC_KEY, JSON.stringify(rows)); }catch(e){}
  }

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

  // Compute a stable name column width (matches the longest service name)
  const allCats = secs.flatMap(s => Array.isArray(s?.categories) ? s.categories : []).map(v=>String(v||""));
  const longest = allCats.reduce((a,b)=> (String(b||"").length > String(a||"").length ? b : a), "");
  const nameWch = Math.max(14, Math.min(44, String(longest||"").length + 2));
  const nameW = `${nameWch}ch`;

  function rowHtml(cat){
    const k = keyFor(cat);
    const id = "minMiles_" + encodeURIComponent(k);
    return `
      <div class="svcSetRow">
        <div class="svcSetLeft">
          <div class="svcSetName">${esc(cat)}</div>
        </div>
        <div class="svcSetRight">
          <input class="svcSetMiles" id="${id}" type="number" inputmode="numeric" min="0" step="500" placeholder="0" value="${esc(valFor(cat))}">
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
        <div class="svcSetSectionHdr">
          <div class="svcSetSectionHdrName">${esc(name)}</div>
          <div class="svcSetSectionHdrMiles">Min. Miles</div>
        </div>
        <div class="svcSetRows">
          ${cats.map(rowHtml).join("")}
        </div>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <!-- Notched header panel: fixed-height notch that only wraps the menu button -->
    <div class="techNotchStage" style="position:relative; width:100%; overflow:visible;">
      <div class="panel techMenuFloat" style="
        position:absolute;
        left:-80px;
        top:4px;
        width:72px;
        height:72px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:14px;
        z-index:2;
      ">
        <label for="menuToggle" class="hamburgerMini" aria-label="Menu" style="
          font-size:2.2em;
          line-height:1;
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          color:inherit;
          user-select:none;
        ">☰</label>
      </div>

      <div class="panel svcSetPanel" style="--svcSetNameW:${nameW};min-width:0;">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div class="h2" style="font-size:33px;letter-spacing:.2px">SERVICE SETTINGS</div>
              <div class="sub"><a href="#/settings" style="text-decoration:none">← Back to settings</a></div>
            </div>
          </div>

        <div class="notice" style="padding:8px 0 0 0">
          Set the minimum vehicle mileage required for each service to be included in reporting.
        </div>

        <div class="svcSetGrid">
          ${sectionsHtml || `<div class="notice">No services found in DATA.sections.</div>`}
        </div>

        <!-- Op-Codes Section -->
        <div class="svcSetSection" style="margin-top:20px">
          <div class="svcSetSectionHdr" style="align-items:center">
            <div class="svcSetSectionHdrName">Services, Op-Codes &amp; Descriptions</div>
          </div>
          <div style="padding:10px 14px 4px">
            <div class="notice" style="padding:0 0 10px 0;margin:0">
              Search terms used to match repair orders to services. Op-codes and descriptions are comma-separated.
            </div>
          </div>
          <div id="opcTableWrap" style="padding:0 14px 14px"></div>
          <div style="padding:0 14px 14px;display:flex;justify-content:flex-end">
            <button id="opcAddBtn" style="
              background:rgba(79,142,247,.15);border:1px solid rgba(79,142,247,.4);
              color:#93c5fd;border-radius:10px;padding:8px 16px;cursor:pointer;
              font-family:inherit;font-size:13px;font-weight:800">+ Add Service</button>
          </div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px">
          <button id="svcSetClear" class="menuClose" style="width:auto;padding:8px 12px">Clear</button>
          <div id="svcSetSaved" class="sub" style="margin:0;opacity:.8;display:none">Saved</div>
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
  app.querySelectorAll(".svcSetMiles").forEach(inp=>{
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
      app.querySelectorAll(".svcSetMiles").forEach(inp=>inp.value="");
      for(const k of Object.keys(map)) delete map[k];
      flashSaved();
    });
  }

  // ── Op-Codes table ────────────────────────────────────
  let opcRows = _loadOpc();
  let opcNextId = Math.max(0, ...opcRows.map(r=>r.id||0)) + 1;
  let opcEditId  = null; // id of row currently being edited

  function opcFlashSaved(){
    const el = document.getElementById("svcSetSaved");
    if(!el) return;
    el.style.display="block"; el.textContent="✓ Saved";
    clearTimeout(opcFlashSaved._t);
    opcFlashSaved._t = setTimeout(()=>{ el.style.display="none"; }, 900);
  }

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function renderOpcTable(){
    const wrap = document.getElementById("opcTableWrap");
    if(!wrap) return;
    if(!opcRows.length){
      wrap.innerHTML = "<div class=\"sub\" style=\"text-align:center;opacity:.4;padding:16px 0\">No services added yet.</div>";
      return;
    }

    wrap.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 140px 1fr 72px;gap:1px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
        <!-- Header -->
        <div style="display:contents">
          ${["Service","Op-Code(s)","Description(s)",""].map(h=>`
            <div style="padding:8px 12px;background:rgba(255,255,255,.05);
              font-size:11px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;
              color:rgba(234,240,255,.5)">${h}</div>`).join("")}
        </div>
        <!-- Rows -->
        ${opcRows.map(row=>{
          if(opcEditId === row.id){
            return `
              <div style="display:contents" data-opc-id="${row.id}">
                <div style="background:rgba(79,142,247,.08);padding:8px">
                  <input class="svcSetMiles opcEditInp" data-field="service" value="${_esc(row.service)}"
                    style="width:100%;box-sizing:border-box">
                </div>
                <div style="background:rgba(79,142,247,.08);padding:8px">
                  <input class="svcSetMiles opcEditInp" data-field="opcode" value="${_esc(row.opcode)}"
                    style="width:100%;box-sizing:border-box">
                </div>
                <div style="background:rgba(79,142,247,.08);padding:8px">
                  <input class="svcSetMiles opcEditInp" data-field="desc" value="${_esc(row.desc)}"
                    style="width:100%;box-sizing:border-box">
                </div>
                <div style="background:rgba(79,142,247,.08);padding:8px;display:flex;gap:6px;align-items:center">
                  <button data-opc-save="${row.id}" title="Save" style="
                    background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.4);
                    color:#86efac;border-radius:7px;padding:5px 9px;cursor:pointer;
                    font-family:inherit;font-size:12px;font-weight:800">✓</button>
                  <button data-opc-cancel title="Cancel" style="
                    background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
                    color:rgba(234,240,255,.6);border-radius:7px;padding:5px 9px;cursor:pointer;
                    font-family:inherit;font-size:12px">✕</button>
                </div>
              </div>`;
          }
          return `
            <div style="display:contents" data-opc-id="${row.id}">
              <div style="padding:9px 12px;background:rgba(0,0,0,.15);font-size:13px;font-weight:700;
                border-bottom:1px solid rgba(255,255,255,.05)">${_esc(row.service)}</div>
              <div style="padding:9px 12px;background:rgba(0,0,0,.15);font-size:12px;
                color:rgba(234,240,255,.7);border-bottom:1px solid rgba(255,255,255,.05)">${_esc(row.opcode)}</div>
              <div style="padding:9px 12px;background:rgba(0,0,0,.15);font-size:11px;
                color:rgba(234,240,255,.55);line-height:1.5;border-bottom:1px solid rgba(255,255,255,.05)">
                ${row.desc.split(",").map(d=>`<span style="display:inline-block;margin:1px 4px 1px 0;
                  padding:2px 7px;border-radius:6px;background:rgba(255,255,255,.06);
                  border:1px solid rgba(255,255,255,.08)">${_esc(d.trim())}</span>`).join("")}
              </div>
              <div style="padding:9px 10px;background:rgba(0,0,0,.15);display:flex;gap:6px;align-items:center;
                border-bottom:1px solid rgba(255,255,255,.05)">
                <button data-opc-edit="${row.id}" title="Edit" style="
                  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
                  color:rgba(234,240,255,.7);border-radius:7px;padding:5px 8px;cursor:pointer;
                  font-family:inherit;font-size:12px">✏️</button>
                <button data-opc-del="${row.id}" title="Delete" style="
                  background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);
                  color:#fca5a5;border-radius:7px;padding:5px 8px;cursor:pointer;
                  font-family:inherit;font-size:12px">🗑</button>
              </div>
            </div>`;
        }).join("")}
      </div>`;

    // Wire edit buttons
    wrap.querySelectorAll("[data-opc-edit]").forEach(b=>{
      b.addEventListener("click", ()=>{
        opcEditId = parseInt(b.getAttribute("data-opc-edit"));
        renderOpcTable();
      });
    });
    // Wire save buttons
    wrap.querySelectorAll("[data-opc-save]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = parseInt(b.getAttribute("data-opc-save"));
        const container = b.closest("[data-opc-id]");
        const inputs = container ? container.querySelectorAll(".opcEditInp") : [];
        const vals = {};
        inputs.forEach(inp=>{ vals[inp.getAttribute("data-field")] = inp.value.trim(); });
        const idx = opcRows.findIndex(r=>r.id===id);
        if(idx>=0){ opcRows[idx] = {...opcRows[idx], ...vals}; }
        _saveOpc(opcRows);
        opcEditId = null;
        renderOpcTable();
        opcFlashSaved();
      });
    });
    // Wire cancel
    wrap.querySelectorAll("[data-opc-cancel]").forEach(b=>{
      b.addEventListener("click", ()=>{ opcEditId=null; renderOpcTable(); });
    });
    // Wire delete
    wrap.querySelectorAll("[data-opc-del]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = parseInt(b.getAttribute("data-opc-del"));
        if(!confirm("Delete this service entry?")) return;
        opcRows = opcRows.filter(r=>r.id!==id);
        _saveOpc(opcRows);
        renderOpcTable();
        opcFlashSaved();
      });
    });
  }

  // Add new row
  const opcAddBtn = document.getElementById("opcAddBtn");
  if(opcAddBtn){
    opcAddBtn.addEventListener("click", ()=>{
      const newRow = { id: opcNextId++, service:"", opcode:"", desc:"" };
      opcRows.push(newRow);
      opcEditId = newRow.id;
      renderOpcTable();
      // Scroll new row into view
      const wrap = document.getElementById("opcTableWrap");
      if(wrap) wrap.scrollIntoView({behavior:"smooth",block:"nearest"});
    });
  }

  renderOpcTable();
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

window.getOpCodes = function(){
  try{
    const raw = localStorage.getItem("svcOpCodes_v1");
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return [];
};

window.renderServiceSettingsPage = renderServiceSettingsPage;
