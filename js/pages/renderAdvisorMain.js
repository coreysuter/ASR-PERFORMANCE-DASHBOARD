window.renderAdvisorMain = renderAdvisorMain; // hoisted - safe to assign before function body
// v2: uses Technician Dashboard styling; no panel wrapper; relies on index.html loading this file.
function renderAdvisorMain(){

  // Ensure the exact Technician Dashboard style overrides are present (same as renderMain).
  (function ensureTechDashOverrides(){
    const id = "techDashOverrides";
    let el = document.getElementById(id);
    if(!el){
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
      /* Scope EVERYTHING to main technician dashboard only */
      /* Add breathing room so the header panel never visually overlaps the two team panels */
      .pageTechDash .techHeaderPanel{
        margin-bottom:14px !important;
        position:relative !important;
        z-index:2 !important;
      }
      .pageTechDash .teamsGrid{position:relative !important; z-index:1 !important;}
  
      /* Advisor rows: subtle tint only, text stays white */
      .pageAdvisorDash .techRow .pill.compG::before,
      .pageAdvisorDash .techRow .pill.compY::before,
      .pageAdvisorDash .techRow .pill.compR::before { opacity: 0.55 !important; }
      .pageAdvisorDash .techRow .pill.compG::after,
      .pageAdvisorDash .techRow .pill.compY::after,
      .pageAdvisorDash .techRow .pill.compR::after { opacity: 0.55 !important; }
      .pageAdvisorDash .techRow .pill .v,
      .pageAdvisorDash .techRow .pill .v { color: #fff !important; }
      .pageAdvisorDash .techRow .pill .k { color: #fff !important; }

      .pageTechDash .techRow .techNameStats .tnLbl{
        font-size:11px !important;
        line-height:1.05 !important;
        color:var(--muted) !important;
        font-weight:900 !important;
        text-transform:uppercase !important;
        letter-spacing:.2px !important;
      }
      .pageTechDash .techRow .techNameStats .tnVal{
        font-size:15px !important;
        font-weight:1000 !important;
        line-height:1 !important;
      }
    `;
  })();
  


  const app = document.getElementById('app');
  if(!app) return;

  const advisors = (typeof DATA !== 'undefined' && Array.isArray(DATA.advisors))
    ? DATA.advisors.filter(a => a && String(a.id||"").toLowerCase() !== "total")
    : [];

  // Local, independent state
  if(typeof window.advisorDashState === 'undefined'){
    window.advisorDashState = { filterKey:"total", compare:"advisors" };
  }
  const st = window.advisorDashState;

  // Advisors always focus on Sold
  const focusIsGoal = false;
  const focusIsSold = true;
  const goalMetric = "sold";
  const compareMode = (String(st.compare||"advisors")==="goal") ? "goal" : "advisors";

  function _ss(a){
    return (a && a.summary && a.summary[st.filterKey]) ? a.summary[st.filterKey] : {};
  }
  function advisorAsrPerRo(a){
    const v = Number(_ss(a)?.asr_per_ro);
    return Number.isFinite(v) ? v : null;
  }
  function advisorSoldPct(a){
    const v = Number(_ss(a)?.sold_pct);
    return Number.isFinite(v) ? v : null;
  }
  function avgDerived(listIn, fn){
    let sum=0, n=0;
    for(const x of (listIn||[])){
      const v = fn(x);
      if(Number.isFinite(v)){ sum += v; n += 1; }
    }
    return n ? (sum/n) : null;
  }
  function advisorSoldPerRo(a){
    const ss = _ss(a);
    const ro = Number(a?.ros);
    const sold = Number(ss?.sold);
    return (Number.isFinite(ro) && ro>0 && Number.isFinite(sold)) ? (sold/ro) : null;
  }
  function advisorSoldPerAsr(a){
    const ss = _ss(a);
    const asr = Number(ss?.asr);
    const sold = Number(ss?.sold);
    return (Number.isFinite(asr) && asr>0 && Number.isFinite(sold)) ? (sold/asr) : null;
  }

  function listTotals(){
    const totalRos = advisors.reduce((s,a)=>s+(Number(a.ros)||0),0);
    const avgOdo = totalRos
      ? advisors.reduce((s,a)=>s+(Number(a.odo)||0)*(Number(a.ros)||0),0)/totalRos
      : 0;
    const totalAsr = advisors.reduce((s,a)=>s+(Number(a.summary?.total?.asr)||0),0);
    const totalSold = advisors.reduce((s,a)=>s+(Number(a.summary?.total?.sold)||0),0);

    const asrPerRo = totalRos ? (totalAsr/totalRos) : null;
    const soldPerRo = totalRos ? (totalSold/totalRos) : null;
    const soldPerAsr = totalAsr ? (totalSold/totalAsr) : null;

    return { totalRos, avgOdo, totalAsr, totalSold, asrPerRo, soldPerRo, soldPerAsr };
  }

  const T = listTotals();

  // Top-right status block shows the Focus stat on top (bigger/white), non-focus below (smaller/grey)
  const topStatVal = focusIsSold ? T.soldPerRo : T.asrPerRo;
  const topStatLbl = focusIsSold ? "Sold/RO" : "ASRs/RO";
  const subStatVal = focusIsSold ? T.asrPerRo : T.soldPerRo;
  const subStatLbl = focusIsSold ? "ASRs/RO" : "Sold/RO";

  const header = `
<!-- Notched header panel: fixed-height notch that only wraps the menu button -->
<div class="techNotchStage" style="position:relative; width:100%; overflow:visible;">
  <!-- Notch extension (matches Goals page configuration) -->
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
    z-index:2;
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

  <div class="panel techHeaderPanel" style="
    width:100%;
    min-width:0;
    border-top-left-radius:0px;
    border-left:none;
  ">
      <div class="phead">
        <style>
          /* Keep pills in the top row and prevent overlap with the title */
          .pageAdvisorDash .techHeaderPanel .techDashTopRow{flex-wrap:nowrap !important;}
          .pageAdvisorDash .techHeaderPanel .techH2Big{flex:0 0 auto !important;}
          .pageAdvisorDash .techHeaderPanel .pills{flex-wrap:nowrap !important;white-space:nowrap !important;flex:0 0 auto !important;}

          /* Header stat pills sizing - scoped to header panel only */
          .pageAdvisorDash .techHeaderPanel .pills .pill .v{font-size:22px !important;line-height:1.05 !important;}
          .pageAdvisorDash .techHeaderPanel .pills .pill .k{font-size:18px !important;line-height:1.05 !important;color:rgba(255,255,255,.55) !important;text-transform:none !important;}

          /* Make the header filters wider */
          .pageAdvisorDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen select{
            min-width:152px !important;
            max-width:237px !important;
          }

          /* Dropdown text colors: selected value white, dropdown list options black */
          .pageAdvisorDash .techHeaderPanel .mainFiltersBar select{color:#fff !important;}
          .pageAdvisorDash .techHeaderPanel .mainFiltersBar select option{color:#000 !important;}
        </style>

        <div class="titleRow techTitleRow">
          <div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;justify-content:flex-start">
              <div class="h2 techH2Big">Advisor Dashboard</div>

              <div class="pills" style="margin-left:34px;display:flex;gap:12px;flex-wrap:nowrap;white-space:nowrap;flex:0 0 auto">
                <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(T.avgOdo)}</div></div>
                <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(T.totalRos)}</div></div>
                <div class="pill"><div class="k">ASRs</div><div class="v">${fmtInt(T.totalAsr)}</div></div>
                <div class="pill"><div class="k">Sold</div><div class="v">${fmtInt(T.totalSold)}</div></div>
                <div class="pill"><div class="k">Sold/ASRs</div><div class="v">${T.soldPerAsr===null ? "—" : fmtPct(T.soldPerAsr)}</div></div>
              </div>
            </div>
          </div>

          <div class="overallBlock">
            <div class="bigMain" style="font-size:38px;line-height:1.05;color:#fff;font-weight:1000">
              ${topStatVal===null ? "—" : (focusIsSold ? fmt1(topStatVal,2) : fmt1(topStatVal,1))}
            </div>
            <div class="tag">${topStatLbl}</div>

            <div class="overallMetric" style="font-size:26px;line-height:1.05;color:#fff;font-weight:1000">
              ${subStatVal===null ? "—" : (focusIsSold ? fmt1(subStatVal,1) : fmt1(subStatVal,2))}
            </div>
            <div class="tag">${subStatLbl}</div>
          </div>
        </div>

        <div class="mainFiltersBar">
          <div class="controls mainAlwaysOpen">
            <div>
              <label>Filter</label>
              <select data-scope="advisor" data-ctl="filter">
                <option value="total" ${st.filterKey==="total"?"selected":""}>With Fluids (Total)</option>
                <option value="without_fluids" ${st.filterKey==="without_fluids"?"selected":""}>Without Fluids</option>
                <option value="fluids_only" ${st.filterKey==="fluids_only"?"selected":""}>Fluids Only</option>
              </select>
            </div>
            <div>
              <label>Comparison</label>
              <select data-scope="advisor" data-ctl="compare">
                <option value="advisors" ${compareMode==="advisors"?"selected":""}>Advisors</option>
                <option value="goal" ${compareMode==="goal"?"selected":""}>Goal</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`;

  if(!advisors.length){
    // Keep pageTechDash on the wrapper so advisor rows + pills inherit the exact
    // same typography + layout rules as the Technician Dashboard.
    app.innerHTML = `<div class="pageAdvisorDash pageTechDash" style="display:grid;gap:12px">${header}<div class="notice">No advisor data found (expected <b>DATA.advisors</b>).</div></div>`;
    return;
  }

  // Averages for baseline comparisons (Advisors)
  const av = {
    asr_per_ro_avg: avgDerived(advisors, advisorAsrPerRo),
    sold_pct_avg: avgDerived(advisors, advisorSoldPct),
    sold_ro_avg: avgDerived(advisors, advisorSoldPerRo),
    sold_asr_avg: avgDerived(advisors, advisorSoldPerAsr),
  };

  // Goals (same as tech dashboard)
  const asrGoalStored = getGoalRaw('__META_GLOBAL','req');
  const soldGoalStored = getGoalRaw('__META_GLOBAL','close');

  const asrGoalTarget = (Number.isFinite(asrGoalStored) && asrGoalStored>0) ? asrGoalStored : av.asr_per_ro_avg;
  const soldGoalTarget = (Number.isFinite(soldGoalStored) && soldGoalStored>0) ? soldGoalStored : av.sold_pct_avg;

  const baseAsrGoalRatio = (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 && Number.isFinite(av.asr_per_ro_avg)) ? (av.asr_per_ro_avg/asrGoalTarget) : null;
  const baseSoldGoalRatio = (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 && Number.isFinite(av.sold_pct_avg)) ? (av.sold_pct_avg/soldGoalTarget) : null;

  const goalReq = getGoalRaw('__META_GLOBAL','req');
  const goalClose = getGoalRaw('__META_GLOBAL','close');
  const soldRoGoalTarget = (Number.isFinite(goalReq) && goalReq>0 && Number.isFinite(goalClose) && goalClose>0) ? (goalReq * goalClose) : null;

  function compClass(actual, baseline){
    if(!Number.isFinite(actual) || !Number.isFinite(baseline) || baseline<=0) return "";
    const r = actual / baseline;
    if(r >= 0.80) return " compG";
    if(r >= 0.60) return " compY";
    return " compR";
  }

  // ranking follows the selected Focus (ASR/RO, Sold%, or Goal)
  const list = advisors.slice();

  const score = (a)=>{
    const asrpr = advisorAsrPerRo(a);
    const soldpct = advisorSoldPct(a);

    if(!focusIsGoal){
      return focusIsSold ? soldpct : asrpr;
    }
    if(goalMetric==="sold"){
      return (Number.isFinite(soldpct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (soldpct/soldGoalTarget) : null;
    }
    return (Number.isFinite(asrpr) && Number.isFinite(asrGoalTarget) && asrGoalTarget>0) ? (asrpr/asrGoalTarget) : null;
  };

  list.sort((a,b)=> (Number.isFinite(score(b))?score(b):-999) - (Number.isFinite(score(a))?score(a):-999));

  const ranked = list.slice().sort((a,b)=> (Number.isFinite(score(b))?score(b):-999) - (Number.isFinite(score(a))?score(a):-999));
  const rankIndex = new Map();
  ranked.forEach((a,i)=>rankIndex.set(a.id, {rank:i+1,total:ranked.length}));

  const rows = list.map(a=>{
    const s = _ss(a);
    const rk = rankIndex.get(a.id) || {rank:null,total:null};

    const asrpr = advisorAsrPerRo(a);
    const soldpct = advisorSoldPct(a);

    const asrGoalRatio = (Number.isFinite(asrpr) && Number.isFinite(asrGoalTarget) && asrGoalTarget>0) ? (asrpr/asrGoalTarget) : null;
    const soldGoalRatio = (Number.isFinite(soldpct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (soldpct/soldGoalTarget) : null;

    const asrGoalTxt = asrGoalRatio==null ? '—' : fmtPct(asrGoalRatio);
    const soldGoalTxt = soldGoalRatio==null ? '—' : fmtPct(soldGoalRatio);

    const soldRoVal = advisorSoldPerRo(a);
    const soldAsrRatio = advisorSoldPerAsr(a);

    const inGoalMode = compareMode === 'goal';

    const compAsrBase = inGoalMode
      ? (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 ? asrGoalTarget : (Number.isFinite(goalReq)&&goalReq>0 ? goalReq : av.asr_per_ro_avg))
      : av.asr_per_ro_avg;

    const compSoldAsrBase = inGoalMode
      ? (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 ? soldGoalTarget : (Number.isFinite(goalClose)&&goalClose>0 ? goalClose : av.sold_asr_avg))
      : av.sold_asr_avg;

    const clsAsrpr   = compClass(asrpr, compAsrBase);
    const clsAsrGoal = compClass(asrGoalRatio, inGoalMode ? 1 : baseAsrGoalRatio);

    const clsSoldAsr = compClass(soldAsrRatio, compSoldAsrBase);
    const soldRoBase = inGoalMode ? (Number.isFinite(soldRoGoalTarget) && soldRoGoalTarget>0 ? soldRoGoalTarget : av.sold_ro_avg) : av.sold_ro_avg;
    const clsSoldRo  = compClass(soldRoVal, soldRoBase);
    const clsSoldGoal= compClass(soldGoalRatio, inGoalMode ? 1 : baseSoldGoalRatio);

    return `
      <div class="techRow dashTechRow">
        <div class="dashLeft">
          <div class="val name">${safe(a.name||a.id)}</div>

          <div class="techNameStats">
            <div class="tnRow tnRow1">
              <span class="tnMini"><span class="tnLbl">Avg ODO</span><span class="tnVal">${fmtInt(a.odo)}</span></span>
              <span class="miniDot">•</span>
              <span class="tnMini"><span class="tnLbl">ROs</span><span class="tnVal">${fmtInt(a.ros)}</span></span>
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
            ${focusIsGoal ? `
              <div class="pillGroup pillGroupNonGoal">
                <div class="pill"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                <div class="pill"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(s.asr)) && Number(s.asr)>0) ? fmtPct(Number(s.sold)/Number(s.asr)) : "—"}</div></div>
                <div class="pill"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0) ? fmt1(Number(s.sold)/Number(a.ros),2) : "—"}</div></div>
              </div>
              <div class="pillGroup pillGroupGoal">
                ${goalMetric==='asr'
                  ? `
                    <div class="pill${goalMetric==='sold' ? ' goalFocusSel' : ''}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                    <div class="pill${goalMetric==='asr' ? ' goalFocusSel' : ''}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                  `
                  : `
                    <div class="pill${goalMetric==='asr' ? ' goalFocusSel' : ''}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                    <div class="pill${goalMetric==='sold' ? ' goalFocusSel' : ''}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                  `
                }
              </div>
            ` : (focusIsSold ? `
              <div class="pillGroup pillGroupA">
                <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                <div class="pill${clsAsrGoal}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
              </div>
              <div class="pillGroup pillGroupB focusGroup">
                <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(s.asr)) && Number(s.asr)>0) ? fmtPct(Number(s.sold)/Number(s.asr)) : "—"}</div></div>
                <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0) ? fmt1(Number(s.sold)/Number(a.ros),2) : "—"}</div></div>
                <div class="pill${clsSoldGoal}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
              </div>
            ` : `
              <div class="pillGroup pillGroupB">
                <div class="pill"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(s.asr)) && Number(s.asr)>0) ? fmtPct(Number(s.sold)/Number(s.asr)) : "—"}</div></div>
                <div class="pill"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(s.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0) ? fmt1(Number(s.sold)/Number(a.ros),2) : "—"}</div></div>
                <div class="pill"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
              </div>
              <div class="pillGroup pillGroupA focusGroup">
                <div class="pill"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                <div class="pill"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
              </div>
            `)}
          </div>

          <div class="techMetaRight">
            ${rankBadgeHtmlDash(
              rk.rank??"—",
              rk.total??"—",
              (focusIsGoal ? (goalMetric==="sold" ? "goal_sold" : "goal_asr") : (focusIsSold ? "sold" : "asr")),
              "sm"
            )}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Remove the extra panel behind the advisor list (per request) and reuse
  // the exact Technician Dashboard row + pill styling by sharing pageTechDash.
  app.innerHTML = `<div class="pageAdvisorDash pageTechDash" style="display:grid;gap:12px">${header}<div class="list">${rows || `<div class="notice">No advisors found.</div>`}</div></div>`;

  // Force the notch to match the header panel background exactly (prevents any shade mismatch)
  (function syncNotchBg(){
    const notch = document.querySelector('.pageAdvisorDash .techMenuNotch');
    const panel = document.querySelector('.pageAdvisorDash .techHeaderPanel');
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

  // Wire header controls
  document.querySelectorAll('.pageAdvisorDash [data-scope="advisor"][data-ctl]').forEach(el=>{
    const ctl = el.getAttribute('data-ctl');
    const apply = ()=>{
      if(ctl==="filter") st.filterKey = el.value;
      if(ctl==="compare") st.compare = el.value;
      renderAdvisorMain();
    };
    el.addEventListener('change', apply);
    el.addEventListener('input', apply);
  });
}

