function renderGoalsPage(){
  const app = document.getElementById("app");

  // Build section -> categories mapping from DATA.sections
  const sections = Array.isArray(DATA.sections) ? DATA.sections : [];
  const allSet = (typeof getAllCategoriesSet==="function") ? getAllCategoriesSet() : new Set();
  const allCats = Array.from(allSet).map(s=>String(s)).filter(Boolean);

  function catsForSectionName(name){
    const up = String(name||"").toUpperCase();
    const sec = sections.find(s=>String(s.name||"").toUpperCase().includes(up));
    const list = sec && Array.isArray(sec.categories) ? sec.categories.map(String).filter(Boolean) : [];
    // Keep only cats that actually exist in the dataset
    const exist = new Set(allCats);
    return list.filter(c=>exist.has(c));
  }

  // Desired display orders (append any remaining items afterwards)
  const MAINT_ORDER = ["ROTATE","ROTATE AND BALANCE","ALIGNMENT","BATTERY","SPARK PLUGS","CABIN AIR FILTER","ENGINE AIR FILTER"];
  const FLUIDS_ORDER = ["MOA","CF5","CFS","BRAKE FLUID","ENGINE COOLANT","TRANS FLUID"];
  const BRAKES_ORDER = ["TOTAL BRAKES AND ROTORS","FRONT BRAKES AND ROTORS","REAR BRAKES AND ROTORS"];
  const TIRES_ORDER = ["TOTAL SETS OF 2 TIRES","TWO TIRES","FOUR TIRES"];

  function orderCats(cats, orderArr){
    const upMap = new Map();
    (cats||[]).forEach(c=>upMap.set(String(c).toUpperCase(), c));
    const used = new Set();
    const out = [];
    (orderArr||[]).forEach(o=>{
      const key = String(o).toUpperCase();
      if(upMap.has(key)){
        out.push(upMap.get(key));
        used.add(upMap.get(key));
      }else{
        // try partial match (e.g., "TOTAL BRAKES AND ROTORS" vs "TOTAL BRAKES & ROTORS")
        const found = (cats||[]).find(c=>String(c).toUpperCase().replace(/&/g,"AND").includes(key.replace(/&/g,"AND")));
        if(found && !used.has(found)){ out.push(found); used.add(found); }
      }
    });
    const rest = (cats||[]).filter(c=>!used.has(c)).slice().sort((a,b)=>String(a).localeCompare(String(b)));
    return out.concat(rest);
  }

  const MAINT = orderCats(catsForSectionName("MAINTENANCE"), MAINT_ORDER);
  const FLUIDS = orderCats(catsForSectionName("FLUIDS"), FLUIDS_ORDER);
  const BRAKES = orderCats(catsForSectionName("BRAKES"), BRAKES_ORDER);
  const TIRES = orderCats(catsForSectionName("TIRES"), TIRES_ORDER);

  // Track mapped brakes categories (for saving goals back to dataset names)
  let BRAKES_FOUND = { total:null, front:null, rear:null };
  let TIRES_FOUND  = { total:null, two:null, four:null };

  const used = new Set([...MAINT, ...FLUIDS, ...BRAKES, ...TIRES]);
  const leftovers = allCats.filter(c=>!used.has(c)).sort((a,b)=>a.localeCompare(b));

  // Precompute store-wide averages for each category
  const AVG = {};
  for(const cat of allCats){
    let nReq=0, sReq=0, nClose=0, sClose=0;
    for(const t of (DATA.techs||[])){
      const c=t.categories?.[cat];
      const req=Number(c?.req);
      const close=Number(c?.close);
      if(Number.isFinite(req)){ sReq += req; nReq++; }
      if(Number.isFinite(close)){ sClose += close; nClose++; }
    }
    AVG[cat] = {
      avgReq: nReq? (sReq/nReq) : null,
      avgClose: nClose? (sClose/nClose) : null
    };
  }

  function avgLineHtml(cat){
    const a = AVG[cat] || {};
    const aReq = fmtPct(a.avgReq);
    const aClose = fmtPct(a.avgClose);
    return `
      <div class="gAvg">Avg ASR/RO%: ${safe(aReq)}</div>
      <div class="gAvg gAvgSold">Avg Sold%: ${safe(aClose)}</div>
    `;
  }

  function rowHtml(cat, displayName){
    const catEnc = encodeURIComponent(cat);
    const vReq = goalToInput(getGoalRaw(cat,"req"));
    const vClose = goalToInput(getGoalRaw(cat,"close"));
    return `
      <div class="goalRow tight" id="row_${catEnc}" data-goal-cat="${safe(cat)}">
        <div class="goalName">
          <div class="gTitle">${safe(displayName || cat)}</div>
          ${avgLineHtml(cat)}
        </div>
        <input class="goalMini" id="g_${catEnc}_req" inputmode="decimal" value="${safe(vReq)}" />
        <input class="goalMini" id="g_${catEnc}_close" inputmode="decimal" value="${safe(vClose)}" />
      </div>
    `;
  }

  function specialRowHtml(label, key){
    const kEnc = encodeURIComponent(key);
    const vReq = goalToInput(getGoalRaw(key,"req"));
    const vClose = goalToInput(getGoalRaw(key,"close"));
    return `
      <div class="goalRow tight">
        <div class="goalName">
          <div class="gTitle">${safe(label)}</div>
        </div>
        <input class="goalMini" id="g_${kEnc}_req" inputmode="decimal" value="${safe(vReq)}" />
        <input class="goalMini" id="g_${kEnc}_close" inputmode="decimal" value="${safe(vClose)}" />
      </div>
    `;
  }

  function quadHtml(title, cats, includeLeftovers=false, isBrakes=false, isTires=false){
    const list = (cats||[]).slice();
    let rows = list.map(c=>rowHtml(c)).join("");
    if(includeLeftovers && leftovers.length){
      rows += `
        <div class="goalDivider">Other</div>
        ${leftovers.map(c=>rowHtml(c)).join("")}
      `;
    }


    const slug = String(title||"other").toLowerCase().replace(/[^a-z0-9]+/g, "_");

    // Fluids quadrant: optional "ONE GOAL FOR ALL RECS?" toggle with synthetic ALL FLUIDS row
    if(String(title||"").toLowerCase()==="fluids"){
      const applyAllFl = String(getGoalRaw("__META_FLUIDS","apply_all"))==="1";
      const applyRow = `
        <div class="brApplyAllRow">
          <div class="q">ONE GOAL FOR ALL RECS?</div>
          <label><input type="radio" name="fl_apply_all" value="yes" ${applyAllFl?'checked':''}> Yes</label>
          <label><input type="radio" name="fl_apply_all" value="no"  ${!applyAllFl?'checked':''}> No</label>
        </div>
      `;
      // Add synthetic row (hidden unless apply-all is enabled)
      const allRow = rowHtml("__FLUIDS_ALL","ALL FLUIDS").replace('class="goalRow tight', 'class="goalRow tight fluidsAllRow');
      const body = `
        <div class="goalQuadTitle">${safe(title)}
          <div class="goalQuadHdrStats" style="margin-top:6px; font-size:13px; opacity:.85;">
            <span style="margin-right:14px;">ASRs/RO Goals: <b id="gh_${slug}_asrro">0.00</b></span>
            <span>Sold/RO Goals: <b id="gh_${slug}_soldro">0.00</b></span>
          </div>
        </div>
        ${applyRow}
        <div class="goalQuadHeadRow">
          <div class="ghName"></div>
          <div class="ghMetric">ASR/RO%</div>
          <div class="ghMetric">Sold%</div>
        </div>
        <div class="goalQuadBody ${applyAllFl?'applyAllOn':''}">
          <div class="${applyAllFl?'':'hidden'}">${allRow}</div>
          ${rows}
        </div>
      `;
      return `<div class="goalQuad" data-quad="${safe(slug)}">${body}</div>`;
    }

    // Brakes quadrant: TOTAL + FRONT + REAR with Apply-to-all and Red/Yellow toggle
    if(isBrakes){
  const norm = (x)=>String(x||"").toUpperCase().replace(/&/g,"AND");
  const totalCat = (list||[]).find(c=>{
    const u = norm(c);
    return u.includes("TOTAL") && u.includes("BRAK") && u.includes("ROTOR");
  }) || (list||[]).find(c=>{
    const u = norm(c);
    return u.includes("TOTAL") && u.includes("BRAK");
  }) || null;

  const frontCat = (list||[]).find(c=>{
    const u = norm(c);
    return u.includes("FRONT") && u.includes("BRAK") && u.includes("ROTOR");
  }) || (list||[]).find(c=>{
    const u = norm(c);
    return u.includes("FRONT") && u.includes("BRAK");
  }) || null;

  const rearCat = (list||[]).find(c=>{
    const u = norm(c);
    return u.includes("REAR") && u.includes("BRAK") && u.includes("ROTOR");
  }) || (list||[]).find(c=>{
    const u = norm(c);
    return u.includes("REAR") && u.includes("BRAK");
  }) || null;

  BRAKES_FOUND.total = totalCat;
  BRAKES_FOUND.front = frontCat;
  BRAKES_FOUND.rear  = rearCat;

  const applyAll = String(getGoalRaw("__META_BRAKES","apply_all"))==="1";
  const ryGlobal = String(getGoalRaw("__META_BRAKES","ry"))==="1";
  const applyRow = `
    <div class="brApplyAllRow">
      <div class="q">ONE GOAL FOR ALL RECS?</div>
      <label><input type="radio" name="br_apply_all" value="yes" ${applyAll?'checked':''}> Yes</label>
      <label><input type="radio" name="br_apply_all" value="no"  ${!applyAll?'checked':''}> No</label>
    </div>
    <div class="brApplyAllRow brGlobalRow" style="margin-top:6px">
      <div class="q">SET GOALS FOR RED/YELLOW?</div>
      <div class="brRYRight">
        <span class="swLab off">Off</span>
        <label class="switch sm">
          <input id="br_ry_global" type="checkbox" ${ryGlobal?'checked':''}>
          <span class="slider"></span>
        </label>
        <span class="swLab on">On</span>
      </div>
    </div>
  `;

function brakeRowHtml(key,label,mappedCat){
    const keyEnc = encodeURIComponent(key);
    const avgHtml = mappedCat ? avgLineHtml(mappedCat) : "";

    const rReq   = goalToInput(getGoalRaw(key,"req"));
    const rClose = goalToInput(getGoalRaw(key,"close"));
    const yReq   = goalToInput(getGoalRaw(key,"req_y"));
    const yClose = goalToInput(getGoalRaw(key,"close_y"));

    const rowDisabled = (applyAll && key!=="BRAKES_TOTAL");
    const ryOn = ryGlobal;

    return `
      <div class="goalRow tight brakeRow ${rowDisabled?'rowDisabled':''}" data-brake-key="${safe(key)}">
        <div class="goalName">
          <div class="gTitle">${safe(label)}</div>
          ${avgHtml}
        </div>

        <div class="brCell">
          <div class="brLine">
            <span class="brTag red">RED</span>
            <input id="b_${keyEnc}_req_red" class="goalMini" inputmode="numeric" value="${safe(rReq)}">
          </div>
          <div class="brLine brY ${ryOn?'':'disabled'}">
            <span class="brTag yellow">YELLOW</span>
            <input id="b_${keyEnc}_req_yellow" class="goalMini" ${ryOn?'':'disabled'} inputmode="numeric" value="${safe(yReq)}">
          </div>
        </div>

        <div class="brCell">
          <div class="brLine">
                        <input id="b_${keyEnc}_close_red" class="goalMini" inputmode="numeric" value="${safe(rClose)}">
          </div>
          <div class="brLine brY ${ryOn?'':'disabled'}">
                        <input id="b_${keyEnc}_close_yellow" class="goalMini" ${ryOn?'':'disabled'} inputmode="numeric" value="${safe(yClose)}">
          </div>
        </div>
      </div>
    `;
  }

  const totalRow = brakeRowHtml("BRAKES_TOTAL", "TOTAL BRAKES & ROTORS", totalCat);
  const frontRow = brakeRowHtml("BRAKES_FRONT", "FRONT BRAKES & ROTORS", frontCat);
  const rearRow  = brakeRowHtml("BRAKES_REAR",  "REAR BRAKES & ROTORS",  rearCat);

  return `
    <div class="goalQuad brakes ${ryGlobal?'ry-on':'ry-off'}" data-quad="${safe(slug)}">
      <div class="goalQuadTitle">${safe(title)}
        <div class="goalQuadHdrStats" style="margin-top:6px; font-size:13px; opacity:.85;">
          <span style="margin-right:14px;">ASRs/RO Goals: <b id="gh_${slug}_asrro">0.00</b></span>
          <span>Sold/RO Goals: <b id="gh_${slug}_soldro">0.00</b></span>
        </div>
      </div>
      ${applyRow}
      <div class="goalQuadHeadRow">
        <div class="ghName"></div>
        <div class="ghMetric">ASR/RO%</div>
        <div class="ghMetric">SOLD%</div>
      </div>
      <div class="goalQuadBody">
        ${totalRow}
        ${frontRow}
        ${rearRow}
      </div>
    </div>
  `;
}

    // Tires quadrant: TOTAL SETS OF 2 TIRES (global) + TWO TIRES + FOUR TIRES
    if(isTires){
      const norm = (x)=>String(x||"").toUpperCase().replace(/&/g,"AND");
      const totalCat = (list||[]).find(c=>{
        const u = norm(c);
        return u.includes("TOTAL") && u.includes("SET") && u.includes("2") && u.includes("TIRE");
      }) || null;

      const twoCat = (list||[]).find(c=>{
        const u = norm(c);
        return (u.startsWith("TWO TIRE") || (u.includes("TWO") && u.includes("TIRE"))) && !u.includes("FOUR") && !u.includes("TOTAL");
      }) || null;

      const fourCat = (list||[]).find(c=>{
        const u = norm(c);
        return u.includes("FOUR") && u.includes("TIRE") && !u.includes("TOTAL");
      }) || null;

      // Track mapped tires categories (for saving back to dataset names)
      TIRES_FOUND.total = totalCat;
      TIRES_FOUND.two   = twoCat;
      TIRES_FOUND.four  = fourCat;

      const applyAll = String(getGoalRaw("__META_TIRES","apply_all"))==="1";
      const ryGlobal = String(getGoalRaw("__META_TIRES","ry"))==="1";

      const applyRow = `
        <div class="brApplyAllRow">
          <div class="q">ONE GOAL FOR ALL RECS?</div>
          <label><input type="radio" name="tr_apply_all" value="yes" ${applyAll?'checked':''}> Yes</label>
          <label><input type="radio" name="tr_apply_all" value="no"  ${!applyAll?'checked':''}> No</label>
        </div>
        <div class="brApplyAllRow brGlobalRow" style="margin-top:6px">
          <div class="q">SET GOALS FOR RED/YELLOW?</div>
          <div class="brRYRight">
            <span class="swLab off">Off</span>
            <label class="switch sm">
              <input id="tr_ry_global" type="checkbox" ${ryGlobal?'checked':''}>
              <span class="slider"></span>
            </label>
            <span class="swLab on">On</span>
          </div>
        </div>
      `;

      function tireRowHtml(key,label,mappedCat){
        const keyEnc = encodeURIComponent(key);
        const avgHtml = mappedCat ? avgLineHtml(mappedCat) : "";

        const rReq   = goalToInput(getGoalRaw(key,"req"));
        const rClose = goalToInput(getGoalRaw(key,"close"));
        const yReq   = goalToInput(getGoalRaw(key,"req_y"));
        const yClose = goalToInput(getGoalRaw(key,"close_y"));

        const rowDisabled = (applyAll && key!=="TIRES_TOTAL2");
        const ryOn = ryGlobal;

        return `
          <div class="goalRow tight tireRow ${rowDisabled?'rowDisabled':''}" data-tire-key="${safe(key)}">
            <div class="goalName">
              <div class="gTitle">${safe(label)}</div>
              ${avgHtml}
            </div>

            <div class="brCell">
              <div class="brLine">
                <span class="brTag red">RED</span>
                <input id="t_${keyEnc}_req_red" class="goalMini" inputmode="numeric" value="${safe(rReq)}">
              </div>
              <div class="brLine brY ${ryOn?'':'disabled'}">
                <span class="brTag yellow">YELLOW</span>
                <input id="t_${keyEnc}_req_yellow" class="goalMini" ${rowDisabled?'disabled':''} ${ryOn?'':'disabled'} inputmode="numeric" value="${safe(yReq)}">
              </div>
            </div>

            <div class="brCell">
              <div class="brLine">
                <input id="t_${keyEnc}_close_red" class="goalMini" inputmode="numeric" value="${safe(rClose)}">
              </div>
              <div class="brLine brY ${ryOn?'':'disabled'}">
                <input id="t_${keyEnc}_close_yellow" class="goalMini" ${rowDisabled?'disabled':''} ${ryOn?'':'disabled'} inputmode="numeric" value="${safe(yClose)}">
              </div>
            </div>
          </div>
        `;
      }

      const totalRow = tireRowHtml("TIRES_TOTAL2","TOTAL SETS OF 2 TIRES", totalCat);
      const twoRow   = tireRowHtml("TIRES_TWO","TWO TIRES", twoCat);
      const fourRow  = tireRowHtml("TIRES_FOUR","FOUR TIRES", fourCat);

      return `
        <div class="goalQuad tires ${ryGlobal?'ry-on':'ry-off'}" data-quad="${safe(slug)}">
          <div class="goalQuadTitle">${safe(title)}
            <div class="goalQuadHdrStats" style="margin-top:6px; font-size:13px; opacity:.85;">
              <span style="margin-right:14px;">ASRs/RO Goals: <b id="gh_${slug}_asrro">0.00</b></span>
              <span>Sold/RO Goals: <b id="gh_${slug}_soldro">0.00</b></span>
            </div>
          </div>
          ${applyRow}
          <div class="goalQuadHeadRow">
            <div class="ghName"></div>
            <div class="ghMetric">ASR/RO%</div>
            <div class="ghMetric">SOLD%</div>
          </div>
          <div class="goalQuadBody">
            ${totalRow}
            ${twoRow}
            ${fourRow}
          </div>
        </div>
      `;
    }
    let applyRow = "";

    return `
      <div class="goalQuad" data-quad="${safe(slug)}">
        <div class="goalQuadTitle">${safe(title)}
          <div class="goalQuadHdrStats" style="margin-top:6px; font-size:13px; opacity:.85;">
            <span style="margin-right:14px;">ASRs/RO Goals: <b id="gh_${slug}_asrro">0.00</b></span>
            <span>Sold/RO Goals: <b id="gh_${slug}_soldro">0.00</b></span>
          </div>
        </div>
        ${applyRow}
        <div class="goalQuadHeadRow">
          <div class="ghName"></div>
          <div class="ghMetric">ASR/RO%</div>
          <div class="ghMetric">Sold%</div>
        </div>
        <div class="goalQuadBody">${rows}</div>
      </div>
    `;
  }

  // One big box; inside we render a 2x2 grid of quadrants
  app.innerHTML = `
    <div class="panel goalsBig halfPage">
      <div class="goalsBigTop">
        <div class="goalsTitleRow" style="position:relative;">
          <label for="menuToggle" class="hamburger" aria-label="Menu">☰</label>
          <div>
            <div class="goalsH1">GOALS</div>
                      </div>

          <div class="goalsMidGoals" style="position:absolute; left:50%; transform:translateX(-50%); top:2px; text-align:center;">
            <div style="font-size:12px; letter-spacing:.08em; opacity:.85; font-weight:800;">GOALS</div>
            <div style="display:flex; gap:18px; margin-top:4px; justify-content:center;">
              <div style="text-align:center;">
                <div id="gh_mid_asrro" style="font-size:20px; font-weight:800; line-height:1;">0.00</div>
                <div style="font-size:11px; opacity:.75; margin-top:2px;">ASRs/RO</div>
              </div>
              <div style="text-align:center;">
                <div id="gh_mid_soldro" style="font-size:20px; font-weight:800; line-height:1;">0.00</div>
                <div style="font-size:11px; opacity:.75; margin-top:2px;">SOLD</div>
              </div>
            </div>
          </div>
          <div class="goalsTopStats" style="margin-left:auto; display:flex; gap:14px; align-items:flex-end; padding-bottom:2px;">
            <div style="text-align:right;">
              <div style="font-size:12px; opacity:.75;">ASRs/RO Goal</div>
              <div id="gh_total_asrro" style="font-size:22px; font-weight:800; line-height:1;">0.00</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px; opacity:.75;">Sold/RO Goal</div>
              <div id="gh_total_soldro" style="font-size:22px; font-weight:800; line-height:1;">0.00</div>
            </div>
          </div>
        </div>
      </div>

      <div class="goalsQuads">
        ${quadHtml("Maintenance", MAINT, true, false)}
        ${quadHtml("Fluids", FLUIDS, false, false)}
        ${quadHtml("Brakes", BRAKES, false, true)}
        ${quadHtml("Tires", TIRES, false, false, true)}
      </div>
    </div>
  `;


  // -------------------- Live projections for category + total goals --------------------
  // Category ASRs/RO Goal = sum over services of (ASR% / 100)
  // Category Sold/RO Goal = sum over services of (ASR%/100) * (Sold%/100)
  // Total goals = sum of category goals
  function _pctToNum(v){
    if(v==null) return 0;
    const s = String(v).trim().replace(/%/g, "").replace(/,/g, "");
    if(!s) return 0;
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }

  function _sumGenericQuad(quadSlug){
    const quad = document.querySelector(`.goalQuad[data-quad="${quadSlug}"]`);
    if(!quad) return { asr: 0, sold: 0 };
    let asr = 0;
    let sold = 0;

    // Sum actual service rows (exclude synthetic ALL row)
    quad.querySelectorAll('.goalRow.tight').forEach(row=>{
      if(row.classList.contains('fluidsAllRow')) return;
      const req = row.querySelector('input[id$="_req"]');
      const close = row.querySelector('input[id$="_close"]');
      if(!req || !close) return;
      const asrPct = _pctToNum(req.value);
      const soldPct = _pctToNum(close.value);
      const asrRo = asrPct/100;
      const soldRo = asrRo*(soldPct/100);
      asr += asrRo;
      sold += soldRo;
    });
    return { asr, sold };
  }

  function _sumBrakes(){
    const keys = ["BRAKES_TOTAL","BRAKES_FRONT","BRAKES_REAR"];
    let asr = 0;
    let sold = 0;
    keys.forEach(k=>{
      const enc = encodeURIComponent(k);
      const asrPct = _pctToNum(document.getElementById(`b_${enc}_req_red`)?.value);
      const soldPct = _pctToNum(document.getElementById(`b_${enc}_close_red`)?.value);
      const asrRo = asrPct/100;
      const soldRo = asrRo*(soldPct/100);
      asr += asrRo;
      sold += soldRo;
    });
    return { asr, sold };
  }

  function _sumTires(){
    const keys = ["TIRES_TOTAL2","TIRES_TWO","TIRES_FOUR"];
    let asr = 0;
    let sold = 0;
    keys.forEach(k=>{
      const enc = encodeURIComponent(k);
      const asrPct = _pctToNum(document.getElementById(`t_${enc}_req_red`)?.value);
      const soldPct = _pctToNum(document.getElementById(`t_${enc}_close_red`)?.value);
      const asrRo = asrPct/100;
      const soldRo = asrRo*(soldPct/100);
      asr += asrRo;
      sold += soldRo;
    });
    return { asr, sold };
  }

  function _setHdr(id, val){
    const el = document.getElementById(id);
    if(el) el.textContent = Number(val||0).toFixed(2);
  }

  function recomputeGoals(){
    const maint = _sumGenericQuad('maintenance');
    const fluids = _sumGenericQuad('fluids');
    const brakes = _sumBrakes();
    const tires = _sumTires();

    _setHdr('gh_maintenance_asrro', maint.asr);
    _setHdr('gh_maintenance_soldro', maint.sold);
    _setHdr('gh_fluids_asrro', fluids.asr);
    _setHdr('gh_fluids_soldro', fluids.sold);
    _setHdr('gh_brakes_asrro', brakes.asr);
    _setHdr('gh_brakes_soldro', brakes.sold);
    _setHdr('gh_tires_asrro', tires.asr);
    _setHdr('gh_tires_soldro', tires.sold);

    const totalAsr = maint.asr + fluids.asr + brakes.asr + tires.asr;
    const totalSold = maint.sold + fluids.sold + brakes.sold + tires.sold;
    _setHdr('gh_total_asrro', totalAsr);
    _setHdr('gh_total_soldro', totalSold);
    _setHdr('gh_mid_asrro', totalAsr);
    _setHdr('gh_mid_soldro', totalSold);
  }

  let _rgRAF = 0;
  function _scheduleRecompute(){
    if(_rgRAF) cancelAnimationFrame(_rgRAF);
    _rgRAF = requestAnimationFrame(()=>{
      _rgRAF = 0;
      recomputeGoals();
    });
  }

  // Run once after paint
  requestAnimationFrame(recomputeGoals);

  // Live update whenever any input changes on this page
  const _goalsPanel = document.querySelector('.panel.goalsBig');
  if(_goalsPanel){
    _goalsPanel.addEventListener('input', _scheduleRecompute, true);
    _goalsPanel.addEventListener('change', _scheduleRecompute, true);
  }


  // Wire up Fluids controls (Apply-to-all)
  function _setGoalRowDisabled(cat, disabled){
    const id = "row_"+encodeURIComponent(cat);
    const row = document.getElementById(id);
    if(!row) return;
    row.classList.toggle("rowDisabled", !!disabled);
    row.querySelectorAll("input").forEach(inp=>{ inp.disabled = !!disabled; });
  }
  function _copyFluidsFromAll(targetCat){
    const uEnc = encodeURIComponent("__FLUIDS_ALL");
    const tEnc = encodeURIComponent(targetCat);
    const uReq = document.getElementById(`g_${uEnc}_req`);
    const uClose = document.getElementById(`g_${uEnc}_close`);
    const tReq = document.getElementById(`g_${tEnc}_req`);
    const tClose = document.getElementById(`g_${tEnc}_close`);
    if(tReq && uReq) tReq.value = uReq.value;
    if(tClose && uClose) tClose.value = uClose.value;
  }

  function _applyFluidsApplyAll(){
    const yes = document.querySelector('input[name="fl_apply_all"][value="yes"]');
    const on = !!(yes && yes.checked);
    setGoalRaw("__META_FLUIDS","apply_all", on ? 1 : 0);

    const wrap = document.querySelector('.fluidsAllRow')?.parentElement;
    if(wrap) wrap.classList.toggle("hidden", !on);

    for(const c of (FLUIDS||[])){
      _setGoalRowDisabled(c, on);
      if(on) _copyFluidsFromAll(c);
    }
    _setGoalRowDisabled("__FLUIDS_ALL", false);
    _scheduleRecompute();
  }
  document.querySelectorAll('input[name="fl_apply_all"]').forEach(r=>{
    r.addEventListener("change", _applyFluidsApplyAll);
  });
  _applyFluidsApplyAll();

  // When apply-all is ON, keep each fluids service in sync as you edit ALL FLUIDS
  (function _wireFluidsAllInputs(){
    const uEnc = encodeURIComponent("__FLUIDS_ALL");
    ["req","close"].forEach(f=>{
      const el = document.getElementById(`g_${uEnc}_${f}`);
      if(!el) return;
      el.addEventListener("input", ()=>{
        const on = !!(document.querySelector('input[name="fl_apply_all"][value="yes"]')?.checked);
        if(on){
          (FLUIDS||[]).forEach(c=>_copyFluidsFromAll(c));
          _scheduleRecompute();
        }
      });
    });
  })();

  // Wire up Brakes controls (Apply-to-all + Red/Yellow toggles)
  function _setRowDisabled(brakeKey, disabled){
    const row = document.querySelector(`.brakeRow[data-brake-key="${brakeKey}"]`);
    if(!row) return;
    row.classList.toggle("rowDisabled", !!disabled);
    row.querySelectorAll("input").forEach(inp=>{
      // Keep apply-all radios always enabled (they live in TOTAL row)
      if(inp.name==="br_apply_all") return;
      inp.disabled = !!disabled;
    });
  }

  function _applyYellowGlobal(){
    const ry = document.getElementById("br_ry_global");
    const on = !!(ry && ry.checked);

    const quad = document.querySelector(".goalQuad.brakes");
    if(quad){
      quad.classList.toggle("ry-on", on);
      quad.classList.toggle("ry-off", !on);
    }
["BRAKES_TOTAL","BRAKES_FRONT","BRAKES_REAR"].forEach(brakeKey=>{
      const row = document.querySelector(`.brakeRow[data-brake-key="${brakeKey}"]`);
      if(!row) return;

      const disabledRow = row.classList.contains("rowDisabled");

      row.querySelectorAll(".brLine.brY").forEach(line=>{
        line.classList.toggle("disabled", !on);
      });

      const keyEnc = encodeURIComponent(brakeKey);
      const yReq   = document.getElementById(`b_${keyEnc}_req_yellow`);
      const yClose = document.getElementById(`b_${keyEnc}_close_yellow`);
      [yReq,yClose].forEach(el=>{
        if(!el) return;
        el.disabled = (!on) || disabledRow;
      });
    });
  }

  

  // Universal apply-all (generic categories): first service becomes universal, others disabled + mirror values
  function _setGenericRowDisabled(cat, disabled){
    const catEnc = encodeURIComponent(cat);
    const row = document.getElementById(`row_${catEnc}`);
    if(row) row.classList.toggle("rowDisabled", !!disabled);
    const elReq = document.getElementById(`g_${catEnc}_req`);
    const elClose = document.getElementById(`g_${catEnc}_close`);
    if(elReq) elReq.disabled = !!disabled;
    if(elClose) elClose.disabled = !!disabled;
  }

  function _copyGenericFrom(universalCat, targetCat){
    const uEnc = encodeURIComponent(universalCat);
    const tEnc = encodeURIComponent(targetCat);
    const uReq = document.getElementById(`g_${uEnc}_req`);
    const uClose = document.getElementById(`g_${uEnc}_close`);
    const tReq = document.getElementById(`g_${tEnc}_req`);
    const tClose = document.getElementById(`g_${tEnc}_close`);
    if(tReq && uReq) tReq.value = uReq.value;
    if(tClose && uClose) tClose.value = uClose.value;
  }

  function _wireUniversalCategory(metaKey, cats){
    const yes = document.querySelector(`input[name="${metaKey}_apply_all"][value="yes"]`);
    const no  = document.querySelector(`input[name="${metaKey}_apply_all"][value="no"]`);
    if(!yes && !no) return;

    const universal = (cats && cats.length) ? cats[0] : null;

    const applyNow = ()=>{
      const on = !!(yes && yes.checked);
      (cats||[]).forEach((c, i)=>{
        if(!c) return;
        const disabled = on && i>0;
        _setGenericRowDisabled(c, disabled);
        if(disabled && universal){
          _copyGenericFrom(universal, c);
        }
      });
    };

    [yes,no].forEach(el=>{
      if(!el) return;
      el.addEventListener("change", ()=>{
        const on = !!(yes && yes.checked);
        setGoalRaw(metaKey, "apply_all", on ? "1" : "0");
        applyNow();
        equalizeGoalQuadrants();
      });
    });

    if(universal){
      const uEnc = encodeURIComponent(universal);
      ["req","close"].forEach(field=>{
        const el = document.getElementById(`g_${uEnc}_${field}`);
        if(!el) return;
        el.addEventListener("input", ()=>{
          const on = !!(yes && yes.checked);
          if(on){
            (cats||[]).slice(1).forEach(c=>_copyGenericFrom(universal, c));
          }
        });
      });
    }

    applyNow();
  }


  function _copyBrakeFromTotal(toKey){
    const tEnc = encodeURIComponent("BRAKES_TOTAL");
    const dEnc = encodeURIComponent(toKey);
    ["req_red","close_red","req_yellow","close_yellow"].forEach(sfx=>{
      const src = document.getElementById(`b_${tEnc}_${sfx}`);
      const dst = document.getElementById(`b_${dEnc}_${sfx}`);
      if(src && dst) dst.value = src.value;
    });
  }

function _wireBrakes(){
    const yes = document.querySelector('input[name="br_apply_all"][value="yes"]');
    const no  = document.querySelector('input[name="br_apply_all"][value="no"]');
    const applyNow = ()=>{
      const applyAll = !!(yes && yes.checked);
      _setRowDisabled("BRAKES_FRONT", applyAll);
      _setRowDisabled("BRAKES_REAR",  applyAll);
      if(applyAll){
        _copyBrakeFromTotal("BRAKES_FRONT");
        _copyBrakeFromTotal("BRAKES_REAR");
      }
      _applyYellowGlobal();
      _scheduleRecompute();
    };
    if(yes) yes.addEventListener("change", applyNow);
    if(no)  no.addEventListener("change", applyNow);


    // When apply-all is ON, keep FRONT/REAR in sync as you edit TOTAL
    ["req_red","close_red","req_yellow","close_yellow"].forEach(sfx=>{
      const id = `b_${encodeURIComponent("BRAKES_TOTAL")}_${sfx}`;
      const el = document.getElementById(id);
      if(el){
        el.addEventListener("input", ()=>{
          const applyAll = !!(document.querySelector('input[name="br_apply_all"][value="yes"]')?.checked);
          if(applyAll){
            _copyBrakeFromTotal("BRAKES_FRONT");
            _copyBrakeFromTotal("BRAKES_REAR");
            _scheduleRecompute();
          }
        });
      }
    });
    // If universal is enabled, keep TWO/Four in sync as you edit the TOTAL row
    ["req_red","close_red","req_yellow","close_yellow"].forEach(sfx=>{
      const id = `t_${encodeURIComponent("TIRES_TOTAL2")}_${sfx}`;
      const el = document.getElementById(id);
      if(el){
        el.addEventListener("input", ()=>{
          const applyAll = !!(document.querySelector('input[name="tr_apply_all"][value="yes"]')?.checked);
          if(applyAll){
            _copyTireFromTotal("TIRES_TWO");
            _copyTireFromTotal("TIRES_FOUR");
          }
        });
      }
    });

    
    const ry = document.getElementById("br_ry_global");
    if(ry) ry.addEventListener("change", ()=>{ _applyYellowGlobal(); equalizeGoalQuadrants(); });

    applyNow();
    equalizeGoalQuadrants();
  }


  function _setTireRowDisabled(key, disabled){
    const row = document.querySelector(`.tireRow[data-tire-key="${key}"]`);
    if(!row) return;
    row.classList.toggle("rowDisabled", !!disabled);
    row.querySelectorAll("input.goalMini").forEach(inp=>{
      const isYellow = inp.id.includes("_yellow");
      const ry = document.getElementById("tr_ry_global");
      const ryOn = !!(ry && ry.checked);
      if(isYellow && !ryOn){
        inp.disabled = true;
      }else{
        inp.disabled = !!disabled;
      }
    });
  }

  function _applyTiresRY(on){
    const quad = document.querySelector(".goalQuad.tires");
    if(!quad) return;
    quad.classList.toggle("ry-on", !!on);
    quad.classList.toggle("ry-off", !on);
    quad.querySelectorAll('input[id*="_yellow"]').forEach(inp=>{
      const row = inp.closest(".rowDisabled");
      inp.disabled = (!on) || !!row;
    });
  }

  

  // Tires: when "one goal for all recs" is enabled, use TOTAL SETS OF 2 TIRES as universal
  function _tireIds(key){
    const k = encodeURIComponent(key);
    return {
      rReq:   `t_${k}_req_red`,
      rClose: `t_${k}_close_red`,
      yReq:   `t_${k}_req_yellow`,
      yClose: `t_${k}_close_yellow`,
    };
  }

  function _snapshotTireRow(key){
    const row = document.querySelector(`.tireRow[data-tire-key="${key}"]`);
    if(!row) return;
    // snapshot only once per apply-all cycle
    if(row.dataset.snap === "1") return;
    const ids = _tireIds(key);
    Object.values(ids).forEach(id=>{
      const el = document.getElementById(id);
      if(el) row.dataset["prev_"+id] = el.value;
    });
    row.dataset.snap = "1";
  }

  function _restoreTireRow(key){
    const row = document.querySelector(`.tireRow[data-tire-key="${key}"]`);
    if(!row) return;
    const ids = _tireIds(key);
    Object.values(ids).forEach(id=>{
      const el = document.getElementById(id);
      const prev = row.dataset["prev_"+id];
      if(el && typeof prev === "string") el.value = prev;
      delete row.dataset["prev_"+id];
    });
    delete row.dataset.snap;
  }

  function _copyTireFromTotal(key){
    const srcIds = _tireIds("TIRES_TOTAL2");
    const dstIds = _tireIds(key);
    const map = [
      ["rReq","rReq"],["rClose","rClose"],
      ["yReq","yReq"],["yClose","yClose"],
    ];
    map.forEach(([s,d])=>{
      const src = document.getElementById(srcIds[s]);
      const dst = document.getElementById(dstIds[d]);
      if(src && dst) dst.value = src.value;
    });
  }
function _wireTires(){
    const applyNow = ()=>{
      const applyAll = !!(document.querySelector('input[name="tr_apply_all"][value="yes"]')?.checked);
      // Persist meta so refresh keeps state
      setGoalRaw("__META_TIRES","apply_all", applyAll ? "1" : "0");

      // Universal behavior: TOTAL SETS OF 2 TIRES drives all tire goals when enabled
      if(applyAll){
        ["TIRES_TWO","TIRES_FOUR"].forEach(k=>{
          _snapshotTireRow(k);
          _copyTireFromTotal(k);
        });
      }else{
        ["TIRES_TWO","TIRES_FOUR"].forEach(k=>_restoreTireRow(k));
      }

      _setTireRowDisabled("TIRES_TWO", applyAll);
      _setTireRowDisabled("TIRES_FOUR", applyAll);

      const on = !!(document.getElementById("tr_ry_global")?.checked);
      _applyTiresRY(on);
      equalizeGoalQuadrants();
    };

    const ryNow = ()=>{
      const on = !!(document.getElementById("tr_ry_global")?.checked);
      setGoalRaw("__META_TIRES","ry", on ? "1" : "0");
      _applyTiresRY(on);
      equalizeGoalQuadrants();
    };

    // Direct listeners (if present)
    const yes = document.querySelector('input[name="tr_apply_all"][value="yes"]');
    const no  = document.querySelector('input[name="tr_apply_all"][value="no"]');
    if(yes) yes.addEventListener("change", applyNow);
    if(no)  no.addEventListener("change", applyNow);

    const ry  = document.getElementById("tr_ry_global");
    if(ry){
      // Default OFF unless explicitly enabled (important: treat "0" as off)
      if(String(getGoalRaw("__META_TIRES","ry"))!=="1") ry.checked = false;
      ry.addEventListener("change", ryNow);
    }

    // Delegated fallback (survives re-render / overlay click targets)
    try{
      if(window.__tiresDelegatedHandler){
        document.removeEventListener("change", window.__tiresDelegatedHandler, true);
      }
      window.__tiresDelegatedHandler = (e)=>{
        // Only act when Goals view is mounted
        if(!document.querySelector(".goalsQuads")) return;
        const t = e.target;
        if(!t) return;
        if(t.id==="tr_ry_global" || t.name==="tr_apply_all"){
          // Update both states; order matters (RY affects disable logic)
          ryNow();
          applyNow();
        }
      };
      document.addEventListener("change", window.__tiresDelegatedHandler, true);
    }catch(_e){}

    // Initial apply
    ryNow();
    applyNow();
  }

    _wireUniversalCategory("__META_MAINTENANCE", MAINT);
  _wireUniversalCategory("__META_FLUIDS", FLUIDS);

_wireBrakes();
  _wireTires();


// Keep all 4 quadrants equal height, and large enough to fit the tallest one (usually Brakes).
let _eqT = null;
function equalizeGoalQuadrants(){
  // Tighten quadrants dynamically (no forced equal-height).
  const quads = Array.from(document.querySelectorAll(".goalsQuads .goalQuad"));
  if(!quads.length) return;
  quads.forEach(q=>{
    q.style.height = "auto";
    q.style.minHeight = "";
    q.classList.remove("equalH");
  });
}
requestAnimationFrame(equalizeGoalQuadrants);
window.addEventListener("resize", ()=>{
  clearTimeout(_eqT);
  _eqT = setTimeout(equalizeGoalQuadrants, 80);
});

  const saveBtn = document.getElementById("saveGoalsAll");
  if(saveBtn){
    saveBtn.addEventListener("click", ()=>{
      // Save everything we rendered (including leftovers + brakes special keys)
      const catsToSave = Array.from(new Set([
        ...MAINT, ...FLUIDS, ...BRAKES, ...TIRES, ...leftovers
      ]));
      catsToSave.forEach(cat=>{
        const catEnc = encodeURIComponent(cat);
        const elReq = document.getElementById(`g_${catEnc}_req`);
        const elClose = document.getElementById(`g_${catEnc}_close`);
        if(elReq) setGoalRaw(cat,"req", inputToGoal(elReq.value));
        if(elClose) setGoalRaw(cat,"close", inputToGoal(elClose.value));
      })
      if(fApply && FLUIDS && FLUIDS.length){
        const u = FLUIDS[0];
        const uReq = getGoalRaw(u,"req");
        const uClose = getGoalRaw(u,"close");
        FLUIDS.slice(1).forEach(c=>{
          setGoalRaw(c,"req", uReq);
          setGoalRaw(c,"close", uClose);
        });
      }

;
      // --- Brakes goals (4 fields + toggles) ---
      const applyAllYes = !!(document.querySelector('input[name="br_apply_all"][value="yes"]')?.checked);
      setGoalRaw("__META_BRAKES","apply_all", applyAllYes ? 1 : 0);

            const ryOnGlobal = !!document.getElementById("br_ry_global")?.checked;
      setGoalRaw("__META_BRAKES","ry", ryOnGlobal ? 1 : 0);
const _saveBrakeKey = (key, mappedCat)=>{
        const keyEnc = encodeURIComponent(key);
        const ryOn = !!document.getElementById("br_ry_global")?.checked;

        const rReq   = document.getElementById(`b_${keyEnc}_req_red`);
        const rClose = document.getElementById(`b_${keyEnc}_close_red`);
        const yReq   = document.getElementById(`b_${keyEnc}_req_yellow`);
        const yClose = document.getElementById(`b_${keyEnc}_close_yellow`);

        const rReqV   = rReq ? inputToGoal(rReq.value) : null;
        const rCloseV = rClose ? inputToGoal(rClose.value) : null;

        setGoalRaw(key,"req",   rReqV);
        setGoalRaw(key,"close", rCloseV);
if(ryOn){
          setGoalRaw(key,"req_y",   yReq ? inputToGoal(yReq.value) : null);
          setGoalRaw(key,"close_y", yClose ? inputToGoal(yClose.value) : null);
        }

        // Mirror red goals back to dataset category names when available
        if(mappedCat){
          setGoalRaw(mappedCat,"req",   rReqV);
          setGoalRaw(mappedCat,"close", rCloseV);
        }

        return { rReqV, rCloseV };
      };

      const totalSaved = _saveBrakeKey("BRAKES_TOTAL", BRAKES_FOUND.total);
      const frontSaved = _saveBrakeKey("BRAKES_FRONT", BRAKES_FOUND.front);
      const rearSaved  = _saveBrakeKey("BRAKES_REAR",  BRAKES_FOUND.rear);

      // If "ONE GOAL FOR ALL RECS?" is enabled, use TOTAL BRAKES & ROTORS as universal for Front/Rear (and hide/disable their R/Y inputs).
      if(applyAllYes){
        const uReq = getGoalRaw("BRAKES_TOTAL","req");
        const uClose = getGoalRaw("BRAKES_TOTAL","close");
        const uReqY = getGoalRaw("BRAKES_TOTAL","req_y");
        const uCloseY = getGoalRaw("BRAKES_TOTAL","close_y");
        [
          ["BRAKES_FRONT", BRAKES_FOUND.front],
          ["BRAKES_REAR",  BRAKES_FOUND.rear]
        ].forEach(([k, mappedCat])=>{
          setGoalRaw(k,"req", uReq);
          setGoalRaw(k,"close", uClose);
          if(ryOnGlobal){
            setGoalRaw(k,"req_y", uReqY);
            setGoalRaw(k,"close_y", uCloseY);
          }
          if(mappedCat){
            setGoalRaw(mappedCat,"req", uReq);
            setGoalRaw(mappedCat,"close", uClose);
            if(ryOnGlobal){
              setGoalRaw(mappedCat,"req_y", uReqY);
              setGoalRaw(mappedCat,"close_y", uCloseY);
            }
          }
        });
      }



      // Apply-to-all: overwrite front/rear dataset-category goals with total goals
      if(applyAllYes){
        if(BRAKES_FOUND.front){
          setGoalRaw(BRAKES_FOUND.front,"req", totalSaved.rReqV);
          setGoalRaw(BRAKES_FOUND.front,"close", totalSaved.rCloseV);
        }
        if(BRAKES_FOUND.rear){
          setGoalRaw(BRAKES_FOUND.rear,"req", totalSaved.rReqV);
          setGoalRaw(BRAKES_FOUND.rear,"close", totalSaved.rCloseV);
        }
      }

      // --- Tires goals (global + optional Red/Yellow) ---
      const tiresApplyAll = !!(document.querySelector('input[name="tr_apply_all"][value="yes"]')?.checked);
      const tiresRY = !!(document.getElementById("tr_ry_global")?.checked);
      setGoalRaw("__META_TIRES","apply_all", tiresApplyAll ? "1" : "0");
      setGoalRaw("__META_TIRES","ry", tiresRY ? "1" : "0");

      function _saveTireKey(key, mappedCat){
        const k = encodeURIComponent(key);
        const rReq   = sanitizeNum(document.getElementById(`t_${k}_req_red`)?.value);
        const rClose = sanitizeNum(document.getElementById(`t_${k}_close_red`)?.value);
        const yReq   = sanitizeNum(document.getElementById(`t_${k}_req_yellow`)?.value);
        const yClose = sanitizeNum(document.getElementById(`t_${k}_close_yellow`)?.value);

        setGoalRaw(key, "req", rReq);
        setGoalRaw(key, "close", rClose);
        setGoalRaw(key, "req_y", yReq);
        setGoalRaw(key, "close_y", yClose);

        if(mappedCat){
          setGoalRaw(mappedCat, "req", rReq);
          setGoalRaw(mappedCat, "close", rClose);
          setGoalRaw(mappedCat, "req_y", yReq);
          setGoalRaw(mappedCat, "close_y", yClose);
        }
      }

      _saveTireKey("TIRES_TOTAL2", TIRES_FOUND.total);
      _saveTireKey("TIRES_TWO",    TIRES_FOUND.two);
      _saveTireKey("TIRES_FOUR",   TIRES_FOUND.four);

      // If using one universal tire goal, mirror TOTAL SETS OF 2 TIRES across TWO/Four (including dataset category names)
      if(tiresApplyAll){
        const kt = encodeURIComponent("TIRES_TOTAL2");
        const tot = {
          rReq:   sanitizeNum(document.getElementById(`t_${kt}_req_red`)?.value),
          rClose: sanitizeNum(document.getElementById(`t_${kt}_close_red`)?.value),
          yReq:   sanitizeNum(document.getElementById(`t_${kt}_req_yellow`)?.value),
          yClose: sanitizeNum(document.getElementById(`t_${kt}_close_yellow`)?.value),
        };
        const mirror = (key, mappedCat)=>{
          setGoalRaw(key,"req",tot.rReq);
          setGoalRaw(key,"close",tot.rClose);
          setGoalRaw(key,"req_y",tot.yReq);
          setGoalRaw(key,"close_y",tot.yClose);
          if(mappedCat){
            setGoalRaw(mappedCat,"req",tot.rReq);
            setGoalRaw(mappedCat,"close",tot.rClose);
            setGoalRaw(mappedCat,"req_y",tot.yReq);
            setGoalRaw(mappedCat,"close_y",tot.yClose);
          }
        };
        mirror("TIRES_TWO",  TIRES_FOUND.two);
        mirror("TIRES_FOUR", TIRES_FOUND.four);
      }

      // Persist
      if(typeof persistGoals==="function") persistGoals();

      const old = saveBtn.textContent;
      saveBtn.textContent = "Saved";
      saveBtn.disabled = true;
      setTimeout(()=>{
        saveBtn.textContent = old;
        saveBtn.disabled = false;
      }, 900);
    });
  }
}
/* -------------------- Services & Settings routing helpers -------------------- */


window.renderGoalsPage = renderGoalsPage;
