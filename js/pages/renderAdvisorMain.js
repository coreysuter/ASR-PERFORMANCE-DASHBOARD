// ═══════════════════════════════════════════════════════════════════════════════
// Advisor Dashboard – fully self-contained (no pageTechDash dependency)
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
    }
    .advHeaderInner{
      background:var(--panel-bg, linear-gradient(135deg,#1e2235 0%,#141722 100%));
      border:1px solid rgba(255,255,255,.08);
      border-radius:14px;
      padding:18px 22px 16px;
      color:#fff;
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
      background:var(--panel-bg, linear-gradient(135deg,#1e2235 0%,#141722 100%));
      border:1px solid rgba(255,255,255,.08);
      border-top-left-radius:14px;
      border-bottom-left-radius:14px;
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
      align-items:center;
      justify-content:space-between;
      flex-wrap:wrap;
      gap:12px;
      margin-bottom:10px;
    }
    .advTitle{
      font-size:22px;
      font-weight:900;
      letter-spacing:.3px;
      white-space:nowrap;
    }

    /* ── Header stats row ── */
    .advHeaderStats{
      display:flex;
      align-items:center;
      gap:12px;
      flex-wrap:wrap;
    }
    .advStatChip{
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:1px;
      padding:6px 14px;
      border-radius:10px;
      background:rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.08);
      min-width:64px;
    }
    .advStatChip .advStatVal{
      font-size:20px;
      font-weight:900;
      line-height:1.1;
      color:#fff;
    }
    .advStatChip .advStatLbl{
      font-size:11px;
      font-weight:600;
      line-height:1.1;
      color:rgba(255,255,255,.50);
      text-transform:uppercase;
      letter-spacing:.4px;
    }

    /* ── Big right-side stat ── */
    .advOverallBlock{
      text-align:right;
      flex:0 0 auto;
    }
    .advBigNum{
      font-size:38px;
      font-weight:1000;
      line-height:1.05;
      color:#fff;
    }
    .advBigTag{
      font-size:12px;
      font-weight:700;
      color:rgba(255,255,255,.50);
      text-transform:uppercase;
      letter-spacing:.5px;
    }
    .advSubNum{
      font-size:24px;
      font-weight:1000;
      line-height:1.1;
      color:rgba(255,255,255,.80);
      margin-top:4px;
    }
    .advSubTag{
      font-size:11px;
      font-weight:600;
      color:rgba(255,255,255,.40);
      text-transform:uppercase;
      letter-spacing:.4px;
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
      background:rgba(255,255,255,.08);
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
    }

    /* ── Advisor Row ── */
    .advRow{
      display:flex;
      align-items:center;
      gap:18px;
      padding:14px 16px;
      background:var(--panel-bg, linear-gradient(135deg,#1e2235 0%,#141722 100%));
      border:1px solid rgba(255,255,255,.08);
      border-radius:12px;
      color:#fff;
      transition:border-color .15s;
    }
    .advRow:hover{
      border-color:rgba(255,255,255,.18);
    }

    /* ── Left side: name + mini stats ── */
    .advRowLeft{
      flex:1 1 240px;
      max-width:260px;
      min-width:0;
      display:flex;
      flex-direction:column;
      gap:7px;
    }
    .advRowName{
      font-size:22px;
      font-weight:900;
      line-height:1.15;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
    }
    .advMiniStats{
      display:flex;
      flex-direction:column;
      gap:4px;
    }
    .advMiniRow{
      display:flex;
      align-items:center;
      gap:12px;
    }
    .advMini{
      display:flex;
      flex-direction:column;
      gap:0;
    }
    .advMiniLbl{
      font-size:10px;
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:.3px;
      color:rgba(255,255,255,.40);
      line-height:1.05;
    }
    .advMiniVal{
      font-size:15px;
      font-weight:800;
      line-height:1.1;
      color:rgba(255,255,255,.88);
    }
    .advMiniDot{
      font-size:8px;
      color:rgba(255,255,255,.22);
      user-select:none;
    }

    /* ── Right side: pills + rank badge ── */
    .advRowRight{
      flex:0 0 auto;
      display:flex;
      align-items:center;
      gap:14px;
    }

    /* ── Pill groups ── */
    .advPills{
      display:flex;
      align-items:center;
      gap:10px;
      flex-wrap:nowrap;
    }
    .advPillGroup{
      display:flex;
      gap:8px;
      flex-wrap:nowrap;
    }

    /* ── Individual Pill ── */
    .advPill{
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:1px;
      padding:7px 13px 6px;
      border-radius:10px;
      min-width:56px;
      text-align:center;
      position:relative;
      overflow:hidden;
      background:rgba(0,0,0,.35);
      box-shadow:inset 0 8px 22px rgba(0,0,0,.55);
      border:1px solid rgba(255,255,255,.06);
    }
    .advPill .advPillVal{
      font-size:16px;
      font-weight:900;
      line-height:1.1;
      color:#fff;
      position:relative;
      z-index:2;
    }
    .advPill .advPillLbl{
      font-size:10px;
      font-weight:700;
      line-height:1.1;
      color:rgba(255,255,255,.55);
      text-transform:uppercase;
      letter-spacing:.3px;
      position:relative;
      z-index:2;
    }

    /* ── Pill color states ── */
    .advPill.cG{
      background:radial-gradient(circle at 50% 55%, rgba(0,0,0,.28) 0 42%, rgba(60,255,140,.28) 70%, rgba(60,255,140,.50) 100%);
      box-shadow:inset 0 8px 22px rgba(0,0,0,.50), inset 0 0 0 1px rgba(120,255,180,.40), inset 0 0 14px rgba(60,255,140,.22);
    }
    .advPill.cY{
      background:radial-gradient(circle at 50% 55%, rgba(0,0,0,.26) 0 42%, rgba(255,245,120,.32) 70%, rgba(255,245,120,.55) 100%);
      box-shadow:inset 0 8px 22px rgba(0,0,0,.50), inset 0 0 0 1px rgba(255,255,160,.45), inset 0 0 14px rgba(255,235,90,.25);
    }
    .advPill.cR{
      background:radial-gradient(circle at 50% 55%, rgba(0,0,0,.28) 0 42%, rgba(255,55,55,.35) 70%, rgba(255,55,55,.60) 100%);
      box-shadow:inset 0 8px 22px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,90,90,.50), inset 0 0 14px rgba(255,70,70,.30);
    }

    /* ── Focus group highlight ── */
    .advPillGroup.focusGrp .advPill{
      padding:8px 15px 7px;
    }

    /* ── Rank badge ── */
    .advRankBadge{
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      width:62px;
      height:62px;
      border-radius:14px;
      background:rgba(255,255,255,.06);
      border:1px solid rgba(255,255,255,.10);
      flex:0 0 auto;
    }
    .advRankFocus{
      font-size:8px;
      font-weight:900;
      text-transform:uppercase;
      letter-spacing:.4px;
      color:rgba(255,255,255,.50);
      line-height:1;
    }
    .advRankNum{
      font-size:24px;
      font-weight:1000;
      line-height:1.1;
      color:#fff;
    }
    .advRankOf{
      font-size:10px;
      font-weight:700;
      color:rgba(255,255,255,.35);
      line-height:1;
    }
    .advRankOf span{
      font-weight:900;
    }

    /* ── Notice (empty state) ── */
    .advNotice{
      padding:24px;
      text-align:center;
      color:rgba(255,255,255,.50);
      font-size:14px;
    }

    /* ═══ RESPONSIVE ═══ */
    @media(max-width:900px){
      .advRow{
        flex-direction:column;
        align-items:stretch;
        gap:12px;
      }
      .advRowLeft{
        max-width:none;
      }
      .advRowRight{
        flex-wrap:wrap;
      }
      .advPills{
        flex-wrap:wrap;
      }
      .advTitleRow{
        flex-direction:column;
        align-items:flex-start;
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
  const goalReq   = (typeof getGoalRaw === "function") ? getGoalRaw("__META_GLOBAL","req")   : null;
  const goalClose = (typeof getGoalRaw === "function") ? getGoalRaw("__META_GLOBAL","close") : null;
  const asrGoalTarget  = (Number.isFinite(goalReq)  && goalReq>0)  ? goalReq  : av.asr_per_ro;
  const soldGoalTarget = (Number.isFinite(goalClose) && goalClose>0)? goalClose: av.sold_pct;
  const soldRoGoalTarget = (Number.isFinite(goalReq) && goalReq>0 && Number.isFinite(goalClose) && goalClose>0) ? (goalReq*goalClose) : null;

  const baseAsrGoalRatio  = (Number.isFinite(asrGoalTarget)  && asrGoalTarget>0  && Number.isFinite(av.asr_per_ro)) ? (av.asr_per_ro/asrGoalTarget)  : null;
  const baseSoldGoalRatio = (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 && Number.isFinite(av.sold_pct))   ? (av.sold_pct/soldGoalTarget)   : null;

  const inGoalMode = (compareMode === "goal");

  // ── Color class for pill ──
  function cClass(actual, baseline){
    if(!Number.isFinite(actual) || !Number.isFinite(baseline) || baseline<=0) return "";
    const r = actual / baseline;
    if(r >= 0.80) return " cG";
    if(r >= 0.60) return " cY";
    return " cR";
  }

  // ── Ranking (by Sold%) ──
  const scored = advisors.map(a => ({ a, v: soldPct(a) }));
  scored.sort((x,y) => (Number.isFinite(y.v)?y.v:-999) - (Number.isFinite(x.v)?x.v:-999));
  const rankMap = new Map();
  scored.forEach((item,i) => rankMap.set(item.a.id, { rank:i+1, total:scored.length }));

  // sorted list for display
  const sorted = scored.map(x => x.a);


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
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div class="advTitle">Advisor Dashboard</div>
            <div class="advHeaderStats">
              <div class="advStatChip"><span class="advStatVal">${fmtInt(avgOdo)}</span><span class="advStatLbl">Avg ODO</span></div>
              <div class="advStatChip"><span class="advStatVal">${fmtInt(totalRos)}</span><span class="advStatLbl">ROs</span></div>
              <div class="advStatChip"><span class="advStatVal">${fmtInt(totalAsr)}</span><span class="advStatLbl">ASRs</span></div>
              <div class="advStatChip"><span class="advStatVal">${fmtInt(totalSold)}</span><span class="advStatLbl">Sold</span></div>
              <div class="advStatChip"><span class="advStatVal">${overallSoldPerAsr===null ? "—" : fmtPct(overallSoldPerAsr)}</span><span class="advStatLbl">Sold/ASRs</span></div>
            </div>
          </div>

          <div class="advOverallBlock">
            <div class="advBigNum">${overallSoldPerRo===null ? "—" : fmt1(overallSoldPerRo,2)}</div>
            <div class="advBigTag">Sold/RO</div>
            <div class="advSubNum">${overallAsrPerRo===null ? "—" : fmt1(overallAsrPerRo,1)}</div>
            <div class="advSubTag">ASRs/RO</div>
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

      // goal ratios
      const asrGoalRatio  = (Number.isFinite(myAsrRo)  && Number.isFinite(asrGoalTarget)  && asrGoalTarget>0)  ? (myAsrRo/asrGoalTarget)   : null;
      const soldGoalRatio = (Number.isFinite(mySoldPct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (mySoldPct/soldGoalTarget) : null;
      const asrGoalTxt  = asrGoalRatio==null  ? "—" : fmtPct(asrGoalRatio);
      const soldGoalTxt = soldGoalRatio==null ? "—" : fmtPct(soldGoalRatio);

      // comparison bases
      const compAsrBase    = inGoalMode ? (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 ? asrGoalTarget : av.asr_per_ro)  : av.asr_per_ro;
      const compSoldAsr    = inGoalMode ? (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 ? soldGoalTarget : av.sold_asr) : av.sold_asr;
      const soldRoBase     = inGoalMode ? (Number.isFinite(soldRoGoalTarget) && soldRoGoalTarget>0 ? soldRoGoalTarget : av.sold_ro) : av.sold_ro;

      const clsAsrRo   = cClass(myAsrRo,   compAsrBase);
      const clsAsrGoal = cClass(asrGoalRatio, inGoalMode ? 1 : baseAsrGoalRatio);
      const clsSoldAsr = cClass(mySoldAsr,  compSoldAsr);
      const clsSoldRo  = cClass(mySoldRo,   soldRoBase);
      const clsSoldGoal= cClass(soldGoalRatio, inGoalMode ? 1 : baseSoldGoalRatio);

      const soldAsrDisplay = (Number.isFinite(Number(s2.sold)) && Number.isFinite(Number(s2.asr)) && Number(s2.asr)>0)
        ? fmtPct(Number(s2.sold)/Number(s2.asr)) : "—";
      const soldRoDisplay  = (Number.isFinite(Number(s2.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0)
        ? fmt1(Number(s2.sold)/Number(a.ros),2) : "—";

      return `
      <div class="advRow">
        <div class="advRowLeft">
          <div class="advRowName">${safe(a.name||a.id)}</div>
          <div class="advMiniStats">
            <div class="advMiniRow">
              <span class="advMini"><span class="advMiniLbl">Avg ODO</span><span class="advMiniVal">${fmtInt(a.odo)}</span></span>
              <span class="advMiniDot">•</span>
              <span class="advMini"><span class="advMiniLbl">ROs</span><span class="advMiniVal">${fmtInt(a.ros)}</span></span>
            </div>
            <div class="advMiniRow">
              <span class="advMini"><span class="advMiniLbl">ASRs</span><span class="advMiniVal">${fmtInt(s2.asr)}</span></span>
              <span class="advMiniDot">•</span>
              <span class="advMini"><span class="advMiniLbl">Sold</span><span class="advMiniVal">${fmtInt(s2.sold)}</span></span>
            </div>
          </div>
        </div>

        <div class="advRowRight">
          <div class="advPills">
            <div class="advPillGroup">
              <div class="advPill${clsAsrRo}"><span class="advPillVal">${fmt1(myAsrRo,1)}</span><span class="advPillLbl">ASRs/RO</span></div>
              <div class="advPill${clsAsrGoal}"><span class="advPillVal">${safe(asrGoalTxt)}</span><span class="advPillLbl">ASR Goal</span></div>
            </div>
            <div class="advPillGroup focusGrp">
              <div class="advPill${clsSoldAsr}"><span class="advPillVal">${soldAsrDisplay}</span><span class="advPillLbl">Sold/ASRs</span></div>
              <div class="advPill${clsSoldRo}"><span class="advPillVal">${soldRoDisplay}</span><span class="advPillLbl">Sold/RO</span></div>
              <div class="advPill${clsSoldGoal}"><span class="advPillVal">${safe(soldGoalTxt)}</span><span class="advPillLbl">Sold Goal</span></div>
            </div>
          </div>

          <div class="advRankBadge">
            <span class="advRankFocus">Sold%</span>
            <span class="advRankNum">${rk.rank ?? "—"}</span>
            <span class="advRankOf">of <span>${rk.total ?? "—"}</span></span>
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
