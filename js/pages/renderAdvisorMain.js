// ═══════════════════════════════════════════════════════════════════════════════
// Advisor Dashboard – fully self-contained (no pageTechDash dependency)
// Pill / badge / row styling matches renderTech dashboard exactly.
// ═══════════════════════════════════════════════════════════════════════════════

function renderAdvisorMain(){

  // ── Inject scoped CSS (only once) ──────────────────────────────────────────
  (function injectAdvisorCSS(){
    if(document.getElementById("advisorDashCSS")) return;
    const s = document.createElement("style");
    s.id = "advisorDashCSS";
    s.textContent = `

    /* ═══ PAGE WRAPPER ═══ */
    .pageAdvisorDash{
      display:grid;
      gap:14px;
      font-family:inherit;
    }

    /* ═══ HEADER PANEL ═══ */
    .advHeader{
      position:relative;
      z-index:2;
      margin-bottom:32px;
    }
    .advHeaderInner{
      background:linear-gradient(180deg,var(--card),var(--card2));
      border:1px solid var(--border);
      border-radius:18px;
      padding:14px 14px 10px;
      color:#fff;
      overflow:hidden;
    }

    /* ── Notch (hamburger menu) ── */
    .advNotchStage{
      position:relative;
      width:100%;
      overflow:visible;
    }
    .advMenuNotch{
      position:absolute;
      left:-68px;
      top:0;
      width:68px;
      height:56px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:linear-gradient(180deg,var(--card),var(--card2));
      border:1px solid var(--border);
      border-top-left-radius:18px;
      border-bottom-left-radius:18px;
      border-right:none;
      z-index:2;
    }
    .advHamburger{
      font-size:1.5em;
      line-height:1;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:8px 10px;
      cursor:pointer;
      color:inherit;
      user-select:none;
    }

    /* ── Title row ── */
    .advTitleRow{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      flex-wrap:nowrap;
      gap:12px;
    }
    .advNameWrap{
      flex:1 1 auto;
      min-width:0;
    }
    .advDashTopRow{
      flex-wrap:nowrap !important;
    }
    .advTitle{
      flex:0 0 auto;
    }
    .advTitle{
      font-size:33px;
      font-weight:900;
      letter-spacing:.3px;
      white-space:nowrap;
    }

    /* ── Header stat chips (pillMini style, inline with title) ── */
    .advHeaderStats{
      display:flex;
      align-items:center;
      gap:8px;
      flex-wrap:nowrap;
      white-space:nowrap;
      flex:0 0 auto;
      margin-left:34px;
    }
    .pageAdvisorDash .advStatChip{
      display:inline-flex;
      gap:6px;
      align-items:baseline;
      padding:8px 12px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,.12);
      background:rgba(0,0,0,.18);
    }
    .pageAdvisorDash .advStatChip .advStatLbl{
      font-size:16px;
      color:var(--muted);
      font-weight:900;
      letter-spacing:.2px;
      text-transform:none !important;
    }
    .pageAdvisorDash .advStatChip .advStatVal{
      font-size:20px;
      font-weight:1000;
      line-height:1;
    }
    .pageAdvisorDash .advStatChip.sold{
      border-color:rgba(190,255,210,.22);
    }
    .pageAdvisorDash .advStatChip.sold .advStatVal{
      color:#fff;
    }

    /* ── Big right-side stats (matches techFocusStatsPinned) ── */
    .advOverallBlock{
      text-align:right;
      line-height:1;
      align-self:center;
      display:flex;
      flex-direction:column;
      align-items:flex-end;
      gap:10px;
      margin-right:4px;
    }
    .advFocusTop, .advFocusBot{ text-align:right; }
    .advBigNum{
      font-size:38px;
      font-weight:1000;
      letter-spacing:.2px;
      color:#fff;
    }
    .advBigTag{
      margin-top:4px;
      font-size:14px;
      font-weight:1000;
      letter-spacing:.3px;
      color:rgba(255,255,255,.70);
      text-transform:none;
    }
    .advSubNum{
      font-size:28px;
      font-weight:1000;
      letter-spacing:.2px;
      color:#fff;
    }
    .advSubTag{
      margin-top:4px;
      font-size:14px;
      font-weight:1000;
      letter-spacing:.3px;
      color:rgba(255,255,255,.70);
      text-transform:none;
    }

    /* ── Filters bar ── */
    .advFiltersBar{
      display:flex;
      align-items:center;
      gap:16px;
      margin-top:12px;
      flex-wrap:wrap;
    }
    .advFilterGroup{
      display:flex;
      flex-direction:column;
      gap:2px;
    }
    .advFilterGroup label{
      font-size:10px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:.5px;
      color:rgba(255,255,255,.45);
    }
    .advFilterGroup select{
      background:rgba(0,0,0,.85);
      border:1px solid rgba(255,255,255,.12);
      border-radius:6px;
      color:#fff;
      font-size:13px;
      font-weight:600;
      padding:5px 28px 5px 10px;
      min-width:152px;
      cursor:pointer;
      appearance:auto;
    }
    .advFilterGroup select option{
      color:#000;
      background:#fff;
    }

    /* ═══ ADVISOR LIST ═══ */
    .advList{
      display:grid;
      gap:10px;
      width:max-content;
    }

    /* ═══ ADVISOR ROW (matches dashTechRow flex layout from base.js) ═══ */
    .pageAdvisorDash .advRow{
      position:relative;
      display:flex;
      align-items:center;
      gap:18px;
      padding:12px 14px;
      padding-right:18px;
      min-height:auto;
      overflow:visible;
      background:linear-gradient(180deg,var(--card),var(--card2));
      border:1px solid var(--border);
      border-radius:14px;
      margin-bottom:0;
      color:#fff;
      transition:border-color .15s;
    }
    .pageAdvisorDash .advRow:hover{
      border-color:rgba(255,255,255,.18);
    }

    /* ── Left side: name + mini stats (matches dashLeft) ── */
    .pageAdvisorDash .advRow .dashLeft{
      flex:1 1 260px;
      max-width:260px;
      min-width:0;
      display:flex;
      flex-direction:column;
      gap:8px;
    }
    .pageAdvisorDash .advRow .dashLeft *{ min-width:0; }

    .pageAdvisorDash .advRow .val.name{
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      font-size:22px;
      font-weight:1000;
    }
    .pageAdvisorDash .advRow .val.name a{
      color:inherit;
      text-decoration:none;
    }

    /* Mini stats under name (matches techNameStats) */
    .pageAdvisorDash .advRow .techNameStats{
      display:flex;
      flex-direction:column;
      gap:6px;
      align-items:flex-start;
    }
    .pageAdvisorDash .advRow .techNameStats .tnRow{
      display:flex;
      flex-wrap:nowrap;
      align-items:baseline;
      gap:10px;
    }
    .pageAdvisorDash .advRow .techNameStats .tnRow2{ gap:14px; }
    .pageAdvisorDash .advRow .techNameStats .tnMini{
      display:inline-flex;
      align-items:baseline;
      gap:8px;
    }
    .pageAdvisorDash .advRow .techNameStats .tnLbl{
      font-size:11px;
      color:var(--muted);
      font-weight:900;
      letter-spacing:.2px;
      text-transform:none !important;
    }
    .pageAdvisorDash .advRow .techNameStats .tnVal{
      font-size:15px;
      font-weight:1000;
      line-height:1;
    }
    .pageAdvisorDash .advRow .techNameStats .miniDot{
      margin:0 6px;
      color:var(--muted);
      user-select:none;
    }

    /* ── Right side: pills + rank badge (matches dashRight) ── */
    .pageAdvisorDash .advRow .dashRight{
      flex:0 0 auto;
      display:flex;
      align-items:center;
      justify-content:flex-start;
      gap:12px;
      min-width:0;
    }

    /* ═══ PILLS (exact match of base.js .techRow .pill styles) ═══ */
    .pageAdvisorDash .advRow .pills{
      display:flex;
      flex-wrap:nowrap;
      justify-content:flex-start;
      gap:10px;
      padding:0;
      margin:0;
      transform:scale(0.9);
      transform-origin:left center;
      overflow:visible;
    }

    /* Pill grouping: thin grey outline around groups */
    .pageAdvisorDash .advRow .pillGroup{
      display:flex;
      align-items:center;
      gap:10px;
      padding:6px 8px;
      border:1px solid rgba(190,190,190,.35);
      border-radius:14px;
      overflow:visible;
    }

    /* Focus group: pills 10% larger */
    .pageAdvisorDash .advRow .pillGroup.focusGroup .pill{
      transform:scale(1.1);
      transform-origin:center;
    }

    /* Goal focus: selected goal pill 10% larger */
    .pageAdvisorDash .advRow .pill.goalFocusSel{
      transform:scale(1.1);
      transform-origin:center;
    }

    /* Square pills (dark, high contrast) */
    .pageAdvisorDash .advRow .pill{
      width:76px;
      height:76px;
      min-width:76px;
      padding:8px 8px;
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      border-radius:14px;
      gap:5px;
      position:relative;
      overflow:hidden;

      background:linear-gradient(180deg, rgba(255,255,255,.10), rgba(0,0,0,.72));
      border:1px solid rgba(255,255,255,.18);
      box-shadow:0 12px 30px rgba(0,0,0,.58) inset, 0 10px 24px rgba(0,0,0,.22);
    }

    /* Label on top */
    .pageAdvisorDash .advRow .pill .k{
      width:100%;
      text-align:center;
      margin:0;
      padding:0;
      font-weight:1000;
      letter-spacing:.22px;
      line-height:1.0;
      font-size:10px;
      opacity:.92;
      color:#fff;
      position:relative;
      z-index:2;
      text-transform:none !important;
    }

    /* Value below */
    .pageAdvisorDash .advRow .pill .v{
      width:100%;
      text-align:center;
      margin:0;
      font-weight:1000;
      line-height:1;
      font-size:16px;
      color:#fff;
      position:relative;
      z-index:2;
    }

    .pageAdvisorDash .advRow .pillGroup.focusGroup .pill .v{
      font-size:17px;
    }

    /* ── Pill color overlays (::before = radial gradient, ::after = inner ring) ── */
    .pageAdvisorDash .advRow .pill::before{
      content:"";
      position:absolute;
      inset:0;
      pointer-events:none;
      opacity:0;
      background:transparent;
    }
    .pageAdvisorDash .advRow .pill::after{
      content:"";
      position:absolute;
      inset:0;
      border-radius:inherit;
      pointer-events:none;
      opacity:0;
    }

    /* RED (bright) */
    .pageAdvisorDash .advRow .pill.compR::before{
      opacity:.78;
      background:
        radial-gradient(circle at 50% 55%,
          rgba(0,0,0,.30) 0 42%,
          rgba(255, 55, 55, .40) 70%,
          rgba(255, 55, 55, .65) 100%
        ),
        linear-gradient(180deg, rgba(255,55,55,.25), rgba(255,55,55,.10));
    }
    .pageAdvisorDash .advRow .pill.compR::after{
      opacity:1;
      box-shadow:
        inset 0 0 0 1px rgba(255, 90, 90, .55),
        inset 0 0 16px rgba(255, 70, 70, .35);
    }

    /* YELLOW (bright lemon) */
    .pageAdvisorDash .advRow .pill.compY::before{
      opacity:.72;
      background:
        radial-gradient(circle at 50% 55%,
          rgba(0,0,0,.28) 0 42%,
          rgba(255, 245, 120, .35) 70%,
          rgba(255, 245, 120, .60) 100%
        ),
        linear-gradient(180deg, rgba(255,245,120,.22), rgba(255,245,120,.10));
    }
    .pageAdvisorDash .advRow .pill.compY::after{
      opacity:1;
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 160, .50),
        inset 0 0 16px rgba(255, 235, 90, .30);
    }

    /* GREEN (bright) */
    .pageAdvisorDash .advRow .pill.compG::before{
      opacity:.68;
      background:
        radial-gradient(circle at 50% 55%,
          rgba(0,0,0,.30) 0 42%,
          rgba(60, 255, 140, .30) 70%,
          rgba(60, 255, 140, .55) 100%
        ),
        linear-gradient(180deg, rgba(60,255,140,.18), rgba(60,255,140,.08));
    }
    .pageAdvisorDash .advRow .pill.compG::after{
      opacity:1;
      box-shadow:
        inset 0 0 0 1px rgba(120, 255, 180, .45),
        inset 0 0 16px rgba(60, 255, 140, .28);
    }

    /* Force all pill text white */
    .pageAdvisorDash .advRow .pill,
    .pageAdvisorDash .advRow .pill *{
      color:#fff !important;
    }

    /* ── Rank badge: scale +15% in rows (matches pageTechDash .techRow) ── */
    /* rankFocusBadge base CSS lives in app.css (always loaded) */
    .pageAdvisorDash .advRow .techMetaRight .rankFocusBadge{
      transform:scale(1.15);
      transform-origin:center center;
    }

    /* ── Empty state ── */
    .advNotice{
      padding:24px;
      text-align:center;
      color:rgba(255,255,255,.50);
      font-size:14px;
    }

    /* ═══ RESPONSIVE ═══ */
    @media(max-width:900px){
      .pageAdvisorDash .advRow{
        flex-direction:column;
        align-items:stretch;
        gap:12px;
      }
      .pageAdvisorDash .advRow .dashLeft{
        max-width:none;
      }
      .pageAdvisorDash .advRow .dashRight{
        flex-wrap:wrap;
      }
      .pageAdvisorDash .advRow .pills{
        flex-wrap:wrap;
      }
      .advTitleRow{
        flex-direction:column;
        align-items:flex-start;
      }
      .advMenuNotch{ display:none; }
      .advHeaderInner{
        border-radius:18px !important;
        border-left:1px solid var(--border) !important;
      }
    }

    `;
    document.head.appendChild(s);
  })();


  // ── Data & State ───────────────────────────────────────────────────────────
  const app = document.getElementById("app");
  if(!app) return;

  const advisors = (typeof DATA !== "undefined" && Array.isArray(DATA.advisors))
    ? DATA.advisors.filter(a => a && String(a.id||"").toLowerCase() !== "total")
    : [];

  // Independent state (persists across re-renders within session)
  if(typeof window._advState === "undefined"){
    window._advState = { filterKey:"total", compare:"advisors" };
  }
  const st = window._advState;

  const compareMode = (String(st.compare||"advisors")==="goal") ? "goal" : "advisors";

  // ── Helper: get summary object for current filter ──
  function ss(a){ return (a && a.summary && a.summary[st.filterKey]) ? a.summary[st.filterKey] : {}; }

  // ── Derived metrics ──
  function asrPerRo(a){  const v = Number(ss(a)?.asr_per_ro); return Number.isFinite(v) ? v : null; }
  function soldPct(a){   const v = Number(ss(a)?.sold_pct);   return Number.isFinite(v) ? v : null; }
  function soldPerRo(a){
    const s2 = ss(a);
    const ro = Number(a?.ros);
    const sold = Number(s2?.sold);
    return (Number.isFinite(ro) && ro>0 && Number.isFinite(sold)) ? (sold/ro) : null;
  }
  function soldPerAsr(a){
    const s2 = ss(a);
    const asr = Number(s2?.asr);
    const sold = Number(s2?.sold);
    return (Number.isFinite(asr) && asr>0 && Number.isFinite(sold)) ? (sold/asr) : null;
  }

  function avgOf(list, fn){
    let sum=0, n=0;
    for(const x of (list||[])){ const v = fn(x); if(Number.isFinite(v)){ sum+=v; n++; } }
    return n ? (sum/n) : null;
  }

  // ── Totals for the header ──
  const totalRos  = advisors.reduce((s,a) => s + (Number(a.ros)||0), 0);
  const avgOdo    = totalRos ? advisors.reduce((s,a) => s + (Number(a.odo)||0)*(Number(a.ros)||0), 0)/totalRos : 0;
  const totalAsr  = advisors.reduce((s,a) => s + (Number(a.summary?.total?.asr)||0), 0);
  const totalSold = advisors.reduce((s,a) => s + (Number(a.summary?.total?.sold)||0), 0);
  const overallAsrPerRo  = totalRos ? (totalAsr/totalRos) : null;
  const overallSoldPerRo = totalRos ? (totalSold/totalRos) : null;
  const overallSoldPerAsr= totalAsr ? (totalSold/totalAsr) : null;

  // ── Averages for comparison ──
  const av = {
    asr_per_ro: avgOf(advisors, asrPerRo),
    sold_pct:   avgOf(advisors, soldPct),
    sold_ro:    avgOf(advisors, soldPerRo),
    sold_asr:   avgOf(advisors, soldPerAsr),
  };

  // ── Goals ──
  const _overallGoals = (typeof calcOverallGoals === "function") ? calcOverallGoals() : { asrPerRo:null, soldPerRo:null, soldPct:null };
  const asrGoalTarget  = (Number.isFinite(_overallGoals.asrPerRo) && _overallGoals.asrPerRo>0)  ? _overallGoals.asrPerRo  : av.asr_per_ro;
  const soldGoalTarget = (Number.isFinite(_overallGoals.soldPct) && _overallGoals.soldPct>0) ? _overallGoals.soldPct : av.sold_pct;
  const soldRoGoalTarget = (Number.isFinite(_overallGoals.soldPerRo) && _overallGoals.soldPerRo>0) ? _overallGoals.soldPerRo : null;

  const baseAsrGoalRatio  = (Number.isFinite(asrGoalTarget)  && asrGoalTarget>0  && Number.isFinite(av.asr_per_ro)) ? (av.asr_per_ro/asrGoalTarget)  : null;
  const baseSoldGoalRatio = (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 && Number.isFinite(av.sold_pct))   ? (av.sold_pct/soldGoalTarget)   : null;

  const inGoalMode = (compareMode === "goal");

  // ── Pill color class (matches compClass from base.js) ──
  function compClass(actual, baseline){
    if(!Number.isFinite(actual) || !Number.isFinite(baseline) || baseline<=0) return "";
    const r = actual / baseline;
    if(r >= 0.80) return " compG";
    if(r >= 0.60) return " compY";
    return " compR";
  }

  // ── Ranking (by Sold%) ──
  const scored = advisors.map(a => ({ a, v: soldPct(a) }));
  scored.sort((x,y) => (Number.isFinite(y.v)?y.v:-999) - (Number.isFinite(x.v)?x.v:-999));
  const rankMap = new Map();
  scored.forEach((item,i) => rankMap.set(item.a.id, { rank:i+1, total:scored.length }));

  // sorted list for display
  const sorted = scored.map(x => x.a);

  // ── Sold/ASRs header text ──
  const soldAsrHeaderTxt = (totalSold>0 && totalAsr>0)
    ? fmtPct(totalSold/totalAsr)
    : "—";


  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD HTML
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Header ──
  const headerHtml = `
  <div class="advHeader">
    <div class="advNotchStage">
      <div class="advMenuNotch">
        <label for="menuToggle" class="advHamburger" aria-label="Menu">☰</label>
      </div>

      <div class="advHeaderInner" style="border-top-left-radius:0;border-bottom-left-radius:0;border-left:none;">
        <!-- Title row -->
        <div class="advTitleRow">
          <div class="advNameWrap">
            <div class="advDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;justify-content:flex-start">
              <div class="advTitle">Advisor Dashboard</div>
              <div class="advHeaderStats">
                <div class="advStatChip"><span class="advStatLbl">Avg Odo</span><span class="advStatVal">${fmtInt(avgOdo)}</span></div>
                <div class="advStatChip"><span class="advStatLbl">ROs</span><span class="advStatVal">${fmtInt(totalRos)}</span></div>
                <div class="advStatChip"><span class="advStatLbl">ASRs</span><span class="advStatVal">${fmtInt(totalAsr)}</span></div>
                <div class="advStatChip sold"><span class="advStatLbl">Sold/ASRs</span><span class="advStatVal">${soldAsrHeaderTxt}</span></div>
              </div>
            </div>
          </div>

          <div class="advOverallBlock">
            <div class="advFocusTop">
              <div class="advBigNum">${overallSoldPerRo===null ? "—" : fmt1(overallSoldPerRo,2)}</div>
              <div class="advBigTag">Sold/RO</div>
            </div>
            <div class="advFocusBot">
              <div class="advSubNum">${overallAsrPerRo===null ? "—" : fmt1(overallAsrPerRo,1)}</div>
              <div class="advSubTag">ASRs/RO</div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="advFiltersBar">
          <div class="advFilterGroup">
            <label>Filter</label>
            <select data-adv-ctl="filter">
              <option value="total"${st.filterKey==="total"?" selected":""}>With Fluids (Total)</option>
              <option value="without_fluids"${st.filterKey==="without_fluids"?" selected":""}>Without Fluids</option>
              <option value="fluids_only"${st.filterKey==="fluids_only"?" selected":""}>Fluids Only</option>
            </select>
          </div>
          <div class="advFilterGroup">
            <label>Comparison</label>
            <select data-adv-ctl="compare">
              <option value="advisors"${compareMode==="advisors"?" selected":""}>Advisors</option>
              <option value="goal"${compareMode==="goal"?" selected":""}>Goal</option>
            </select>
          </div>
        </div>

      </div>
    <svg viewBox="0 0 120 48" width="113" height="45" style="position:absolute;bottom:-19px;right:18px;overflow:visible;pointer-events:none;z-index:5;" aria-hidden="true"><rect x="0" y="27" width="120" height="3" fill="#0f1730"/><polyline points="0,28 18,28 26,28 32,8 38,44 44,20 50,28 68,28 76,28 82,8 88,44 94,20 100,28 120,28" fill="none" stroke="rgba(200,45,45,.45)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 3px rgba(200,40,40,.22));"/></svg>
    </div>
  </div>`;

  // ── Advisor rows ──
  let rowsHtml = "";
  if(!sorted.length){
    rowsHtml = `<div class="advNotice">No advisor data found (expected <b>DATA.advisors</b>).</div>`;
  } else {
    rowsHtml = sorted.map(a => {
      const s2 = ss(a);
      const rk = rankMap.get(a.id) || { rank:"—", total:"—" };

      const myAsrRo   = asrPerRo(a);
      const mySoldPct = soldPct(a);
      const mySoldRo  = soldPerRo(a);
      const mySoldAsr = soldPerAsr(a);

      // Goal ratios
      const asrGoalRatio  = (Number.isFinite(myAsrRo)  && Number.isFinite(asrGoalTarget)  && asrGoalTarget>0)  ? (myAsrRo/asrGoalTarget)   : null;
      const soldGoalRatio = (Number.isFinite(mySoldPct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (mySoldPct/soldGoalTarget) : null;
      const asrGoalTxt  = asrGoalRatio==null  ? "—" : fmtPct(asrGoalRatio);
      const soldGoalTxt = soldGoalRatio==null ? "—" : fmtPct(soldGoalRatio);

      // Sold/RO and Sold/ASRs computed values
      const soldRoVal = (Number.isFinite(Number(s2.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0)
        ? (Number(s2.sold)/Number(a.ros)) : null;
      const soldAsrRatio = (Number.isFinite(Number(s2.sold)) && Number.isFinite(Number(s2.asr)) && Number(s2.asr)>0)
        ? (Number(s2.sold)/Number(s2.asr)) : null;

      // Comparison bases
      const compAsrBase    = inGoalMode
        ? (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 ? asrGoalTarget : av.asr_per_ro)
        : av.asr_per_ro;
      const compSoldAsrBase = inGoalMode
        ? (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 ? soldGoalTarget : av.sold_asr)
        : av.sold_asr;
      const soldRoBase     = inGoalMode
        ? (Number.isFinite(soldRoGoalTarget) && soldRoGoalTarget>0 ? soldRoGoalTarget : av.sold_ro)
        : av.sold_ro;

      // Pill color classes
      const clsAsrpr   = compClass(myAsrRo,     compAsrBase);
      const clsAsrGoal = compClass(asrGoalRatio, inGoalMode ? 1 : baseAsrGoalRatio);
      const clsSoldAsr = compClass(soldAsrRatio, compSoldAsrBase);
      const clsSoldRo  = compClass(soldRoVal,    soldRoBase);
      const clsSoldGoal= compClass(soldGoalRatio,inGoalMode ? 1 : baseSoldGoalRatio);

      // Display values
      const soldAsrDisplay = soldAsrRatio !== null ? fmtPct(soldAsrRatio) : "—";
      const soldRoDisplay  = soldRoVal !== null ? fmt1(soldRoVal, 2) : "—";

      // Rank badge (uses global rankBadgeHtmlDash from base.js)
      const badgeHtml = (typeof rankBadgeHtmlDash === "function")
        ? rankBadgeHtmlDash(rk.rank ?? "—", rk.total ?? "—", "sold", "sm")
        : `<div class="rankFocusBadge sm">
             <div class="rfbFocus" style="font-weight:1000">SOLD%</div>
             <div class="rfbMain" style="font-weight:1000">${rk.rank ?? "—"}</div>
             <div class="rfbOf" style="font-weight:1000"><span class="rfbOfWord" style="font-weight:1000">of</span><span class="rfbOfNum" style="font-weight:1000">${rk.total ?? "—"}</span></div>
           </div>`;

      return `
      <div class="advRow">
        <div class="dashLeft">
          <div class="val name"><a href="#/advisor/${encodeURIComponent(a.id)}" style="text-decoration:none;color:inherit" onclick="return typeof goAdvisor==='function' && goAdvisor(${JSON.stringify(a.id).replace(/"/g,'&quot;')})">${safe(a.name||a.id)}</a></div>
          <div class="techNameStats">
            <div class="tnRow tnRow1">
              <span class="tnMini"><span class="tnLbl">Avg ODO</span><span class="tnVal">${fmtInt(a.odo)}</span></span>
              <span class="miniDot">•</span>
              <span class="tnMini"><span class="tnLbl">ROs</span><span class="tnVal">${fmtInt(a.ros)}</span></span>
            </div>
            <div class="tnRow tnRow2">
              <span class="tnMini"><span class="tnLbl">ASRs</span><span class="tnVal">${fmtInt(s2.asr)}</span></span>
              <span class="miniDot">•</span>
              <span class="tnMini"><span class="tnLbl">Sold</span><span class="tnVal">${fmtInt(s2.sold)}</span></span>
            </div>
          </div>
        </div>

        <div class="dashRight">
          <div class="pills">
            <div class="pillGroup">
              <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(myAsrRo,1)}</div></div>
              <div class="pill${clsAsrGoal}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
            </div>
            <div class="pillGroup focusGroup">
              <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${soldAsrDisplay}</div></div>
              <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${soldRoDisplay}</div></div>
              <div class="pill${clsSoldGoal}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
            </div>
          </div>

          <div class="techMetaRight">
            ${badgeHtml}
          </div>
        </div>
      </div>`;
    }).join("");
  }

  // ── Render ──
  app.innerHTML = `<div class="pageAdvisorDash">${headerHtml}<div class="advList">${rowsHtml}</div></div>`;

  // ── Sync notch background with header panel ──
  requestAnimationFrame(() => {
    const notch = document.querySelector(".advMenuNotch");
    const panel = document.querySelector(".advHeaderInner");
    if(notch && panel){
      const cs = getComputedStyle(panel);
      notch.style.backgroundColor = cs.backgroundColor;
      notch.style.backgroundImage = cs.backgroundImage;
    }
  });

  // ── Wire up filters ──
  document.querySelectorAll("[data-adv-ctl]").forEach(el => {
    const ctl = el.getAttribute("data-adv-ctl");
    const handler = () => {
      if(ctl==="filter")  st.filterKey = el.value;
      if(ctl==="compare") st.compare   = el.value;
      renderAdvisorMain();
    };
    el.addEventListener("change", handler);
  });
}

window.renderAdvisorMain = renderAdvisorMain;
