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

        <div class="svcSetMinMilesHeading">Minimum Miles</div>

        <div class="svcSetGrid">
          ${sectionsHtml || `<div class="notice">No services found in DATA.sections.</div>`}
        </div>

        </div>
      </div>
    </div>

    <!-- Op-Codes Panel (separate) -->
    <div class="techNotchStage" style="position:relative;width:100%;overflow:visible;margin-top:18px;">
      <div class="panel svcSetPanel" style="min-width:0;width:100%;">
        <div class="phead">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
            <div class="svcSetMinMilesHeading" style="margin:0;">Services, Op-Codes &amp; Descriptions</div>
            <button id="opcAddBtn" style="
              background:rgba(79,142,247,.15);border:1px solid rgba(79,142,247,.4);
              color:#93c5fd;border-radius:10px;padding:8px 18px;cursor:pointer;
              font-family:inherit;font-size:13px;font-weight:800;flex-shrink:0;white-space:nowrap">+ Add Service</button>
          </div>
          <div id="opcTableWrap" style="margin-top:14px;"></div>
        </div>
      </div>
    </div>

    <div id="svcSetSaved" class="sub" style="margin:8px 0 0 0;opacity:.8;display:none;text-align:right">Saved</div>
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

  // ── Op-Codes table ────────────────────────────────────
  let opcRows = _loadOpc();
  let opcNextId = Math.max(0, ...opcRows.map(r=>r.id||0)) + 1;

  function opcFlashSaved(){
    const el = document.getElementById("svcSetSaved");
    if(!el) return;
    el.style.display="block"; el.textContent="✓ Saved";
    clearTimeout(opcFlashSaved._t);
    opcFlashSaved._t = setTimeout(()=>{ el.style.display="none"; }, 900);
  }

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  function splitItems(str){ return String(str||"").split(",").map(s=>s.trim()).filter(Boolean); }

  function pillsHtml(items, rowId, field){
    return items.map((item,idx)=>`
      <span class="opcPill">
        <span class="opcPillText" contenteditable="true" spellcheck="false"
          data-row="${rowId}" data-field="${field}" data-idx="${idx}">${_esc(item)}</span><button class="opcPillDel" data-row="${rowId}" data-field="${field}" data-idx="${idx}" title="Remove">×</button>
      </span>`).join("")
    + `<button class="opcPillAdd" data-row="${rowId}" data-field="${field}" title="Add">+</button>`;
  }

  function renderOpcTable(){
    const wrap = document.getElementById("opcTableWrap");
    if(!wrap) return;
    if(!opcRows.length){
      wrap.innerHTML = `<div class="sub" style="text-align:center;opacity:.4;padding:16px 0">No services added yet.</div>`;
      return;
    }

    wrap.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr 2fr 44px;gap:1px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.08)">
        <div style="display:contents">
          ${["Service","Op-Code(s)","Description(s)",""].map(h=>`
            <div style="padding:8px 12px;background:rgba(255,255,255,.05);
              font-size:11px;font-weight:900;letter-spacing:.4px;text-transform:uppercase;
              color:rgba(234,240,255,.5)">${h}</div>`).join("")}
        </div>
        ${opcRows.map(row=>{
          const opcodes = splitItems(row.opcode);
          const descs   = splitItems(row.desc);
          return `
            <div style="display:contents" data-opc-id="${row.id}">
              <div style="padding:9px 12px;background:rgba(0,0,0,.15);border-bottom:1px solid rgba(255,255,255,.05);vertical-align:top">
                <span class="opcPillText opcServiceName" contenteditable="true" spellcheck="false"
                  data-row="${row.id}" data-field="service"
                >${_esc(row.service)}</span>
              </div>
              <div style="padding:9px 12px;background:rgba(0,0,0,.15);border-bottom:1px solid rgba(255,255,255,.05);display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start;align-content:flex-start">
                ${pillsHtml(opcodes, row.id, "opcode")}
              </div>
              <div style="padding:9px 12px;background:rgba(0,0,0,.15);border-bottom:1px solid rgba(255,255,255,.05);display:flex;flex-wrap:wrap;gap:4px;align-items:flex-start;align-content:flex-start">
                ${pillsHtml(descs, row.id, "desc")}
              </div>
              <div style="padding:9px 8px;background:rgba(0,0,0,.15);border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center">
                <button data-opc-del="${row.id}" title="Delete row" style="
                  background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);
                  color:#fca5a5;border-radius:7px;padding:5px 7px;cursor:pointer;
                  font-family:inherit;font-size:12px;line-height:1">🗑</button>
              </div>
            </div>`;
        }).join("")}
      </div>`;

    // Helper to get/set items
    function getItems(rowId, field){ const r=opcRows.find(r=>r.id===rowId); return r ? splitItems(r[field]) : []; }
    function setItems(rowId, field, items){
      const i=opcRows.findIndex(r=>r.id===rowId); if(i<0) return;
      opcRows[i]={...opcRows[i],[field]:items.join(", ")};
      _saveOpc(opcRows); opcFlashSaved();
    }

    // Wire contenteditable blur → save
    wrap.querySelectorAll(".opcPillText").forEach(el=>{
      el.addEventListener("blur",()=>{
        const rowId=parseInt(el.getAttribute("data-row"));
        const field=el.getAttribute("data-field");
        const idxAttr=el.getAttribute("data-idx");
        if(idxAttr===null){
          // service name
          const i=opcRows.findIndex(r=>r.id===rowId);
          if(i>=0){ opcRows[i].service=el.textContent.trim(); _saveOpc(opcRows); opcFlashSaved(); }
          return;
        }
        const items=getItems(rowId,field);
        const val=el.textContent.trim();
        if(val){ items[parseInt(idxAttr)]=val; setItems(rowId,field,items.filter(Boolean)); }
        else { items.splice(parseInt(idxAttr),1); setItems(rowId,field,items); renderOpcTable(); }
      });
      el.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); el.blur(); } });
    });

    // Wire × delete pill
    wrap.querySelectorAll(".opcPillDel").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const rowId=parseInt(btn.getAttribute("data-row"));
        const field=btn.getAttribute("data-field");
        const idx=parseInt(btn.getAttribute("data-idx"));
        const items=getItems(rowId,field);
        items.splice(idx,1);
        setItems(rowId,field,items);
        renderOpcTable();
      });
    });

    // Wire + add pill
    wrap.querySelectorAll(".opcPillAdd").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const rowId=parseInt(btn.getAttribute("data-row"));
        const field=btn.getAttribute("data-field");
        const items=getItems(rowId,field);
        items.push("new");
        setItems(rowId,field,items);
        renderOpcTable();
        const newIdx=items.length-1;
        const newEl=wrap.querySelector(`.opcPillText[data-row="${rowId}"][data-field="${field}"][data-idx="${newIdx}"]`);
        if(newEl){ newEl.focus(); const r=document.createRange(),s=window.getSelection(); r.selectNodeContents(newEl); s.removeAllRanges(); s.addRange(r); }
      });
    });

    // Wire row delete
    wrap.querySelectorAll("[data-opc-del]").forEach(b=>{
      b.addEventListener("click",()=>{
        const id=parseInt(b.getAttribute("data-opc-del"));
        if(!confirm("Delete this service entry?")) return;
        opcRows=opcRows.filter(r=>r.id!==id);
        _saveOpc(opcRows); renderOpcTable(); opcFlashSaved();
      });
    });
  }

  // Add new row
  const opcAddBtn = document.getElementById("opcAddBtn");
  if(opcAddBtn){
    opcAddBtn.addEventListener("click",()=>{
      const newRow={ id:opcNextId++, service:"New Service", opcode:"", desc:"" };
      opcRows.push(newRow);
      _saveOpc(opcRows);
      renderOpcTable();
      const wrap=document.getElementById("opcTableWrap");
      if(wrap) wrap.scrollIntoView({behavior:"smooth",block:"nearest"});
      // Focus service name of new row
      setTimeout(()=>{
        const el=wrap && wrap.querySelector(`.opcServiceName[data-row="${newRow.id}"]`);
        if(el){ el.focus(); const r=document.createRange(),s=window.getSelection(); r.selectNodeContents(el); s.removeAllRanges(); s.addRange(r); }
      }, 50);
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
