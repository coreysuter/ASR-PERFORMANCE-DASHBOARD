function renderServicesHome(){
  // ---- Independent page-only CSS overrides ----
  (function ensureServicesDashOverrides(){
    const id = "servicesDashOverrides";
    let el = document.getElementById(id);
    if(!el){
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
      /* Scope everything to Services Dashboard only */
      .pageServicesDash .techHeaderPanel{margin-bottom:14px !important;}

      /* Header + diag wrapper (match Tech Details layout) */
      .pageServicesDash .svcdashHeaderWrap{display:grid;grid-template-columns:minmax(0,0.70fr) minmax(0,1.30fr);gap:14px;align-items:stretch;}
      @media(max-width:740px){ .pageServicesDash .svcdashHeaderWrap{grid-template-columns:1fr;} }

      .pageServicesDash .svcDashSections{display:grid;gap:12px;}
      .pageServicesDash details.svcDashSec{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:linear-gradient(180deg,var(--card),var(--card2));}
      .pageServicesDash details.svcDashSec > summary{list-style:none;cursor:pointer;}
      .pageServicesDash details.svcDashSec > summary::-webkit-details-marker{display:none;}

      .pageServicesDash .svcDashSecHead{padding:14px 14px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-end;justify-content:space-between;gap:12px;}
      .pageServicesDash .svcDashSecTitle{font-size:32px;font-weight:1400;letter-spacing:.8px;line-height:1.05;}
      .pageServicesDash .svcDashSecMeta{font-size:12px;color:var(--muted);font-weight:900;letter-spacing:.2px;white-space:nowrap}
      .pageServicesDash .svcDashBody{padding:12px 12px 14px;}

      /* Service cards grid (same vibe as tech details) */
      .pageServicesDash .svcCardsGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(450px,1fr));gap:14px;align-items:start;}
      @media (max-width: 980px){ .pageServicesDash .svcCardsGrid{grid-template-columns:1fr;} }

      /* =====================================================================
         ServicesHome diagSection: match Tech Details (renderTech) styling
         ===================================================================== */

      /* Prevent Bottom 3 lists from being clipped when the diag section is height-constrained */
      .pageServicesDash .techPickPanel.diagSection{display:flex;flex-direction:column;overflow:hidden}
      .pageServicesDash .techPickPanel.diagSection>.phead{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden}
      .pageServicesDash .techPickPanel.diagSection .pickRow{min-height:0}

      /* Diag pie chart labels/lines (same as app.css tech details) */
      .pageServicesDash .techPickPanel.diagSection .diagPieWrap{display:flex;align-items:center;justify-content:center;margin-top:10px}
      .pageServicesDash .techPickPanel.diagSection .diagPieSvg{width:142px;height:142px;display:block;overflow:visible}
      .pageServicesDash .techPickPanel.diagSection .diagPieTxt{fill:#fff;font-weight:700;font-size:20px}
      .pageServicesDash .techPickPanel.diagSection .diagPieLeader{stroke:rgba(255,255,255,9);stroke-width:1}
      .pageServicesDash .techPickPanel.diagSection .diagPieRing{stroke:rgba(255,255,255,85);stroke-width:1.2}

      /* Diag pie interactions (same as app.css tech details) */
      .pageServicesDash .techPickPanel.diagSection .diagPieWrap,
      .pageServicesDash .techPickPanel.diagSection .diagPieSvg{cursor:pointer;}
      .pageServicesDash .techPickPanel.diagSection .diagPieSlice{
        cursor:pointer;
        transition:filter 140ms ease, opacity 140ms ease, transform 140ms ease;
        opacity:.92;
        transform-origin:50% 50%;
      }
      .pageServicesDash .techPickPanel.diagSection .diagPieSlice:hover{
        opacity:1;
        filter:brightness(1.35) drop-shadow(0 6px 10px rgba(0,0,0,35));
        transform:scale(1.02);
      }

      /* One-line Top/Bottom list rows (same as app.css tech details) */
      .pageServicesDash .techPickPanel .pickList .techRow{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        flex-wrap:nowrap !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow > div:first-child{
        display:flex !important;
        align-items:center !important;
        gap:10px !important;
        min-width:0 !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow > div:first-child .mini{
        margin:0 !important;
        white-space:nowrap !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow a,
      .pageServicesDash .techPickPanel .pickList .techRow .tbJump,
      .pageServicesDash .techPickPanel .pickList .techRow .nm,
      .pageServicesDash .techPickPanel .pickList .techRow span,
      .pageServicesDash .techPickPanel .pickList .techRow button{
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
        max-width:100% !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow > .mini,
      .pageServicesDash .techPickPanel .pickList .techRow > div:last-child{white-space:nowrap !important;}

      /* Diag legend: only color the RED/YELLOW/GREEN words; everything else stays white */
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend{color:#fff}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendRest{color:#fff}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendName{font-weight:1000}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendRed{color:#ff4b4b}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendYellow{color:#ffbf2f}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendGreen{color:#1fcb6a}

      /* Header divider (used by this page) */
      .pageServicesDash .svcHdrDivider{height:1px;background:rgba(255,255,255,.12);margin:10px 0 12px}


      /* Service card header: keep right-side controls on one row (Dial -> Badge -> Focus Stat) */
      .pageServicesDash .catHeader{display:flex;align-items:center;justify-content:space-between;gap:14px;}
      .pageServicesDash .catHdrLeft{min-width:0;}
      .pageServicesDash .sdCatHdrRow{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex:0 0 auto;white-space:nowrap;flex-direction:row !important;}
      .pageServicesDash .sdCatHdrRow .svcGaugeWrap{order:1 !important;}
      .pageServicesDash .sdCatHdrRow .rankFocusBadge{order:2 !important;}
      @media (max-width: 540px){
        .pageServicesDash .catHeader{flex-direction:column;align-items:flex-start;}
        .pageServicesDash .sdCatHdrRow{justify-content:flex-start;white-space:normal;}
}

      /* Tech list inside service cards */
      .pageServicesDash .svcTechList{margin-top:10px;display:grid;gap:8px;}
      .pageServicesDash .svcTechRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);}
      .pageServicesDash .svcTechLeft{display:flex;align-items:center;gap:8px;min-width:0;}
      .pageServicesDash .svcTechLeft a{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;}
      .pageServicesDash .svcRankNum{color:rgba(255,255,255,.65);font-weight:1000;min-width:22px;text-align:right;}
      .pageServicesDash .svcTechMeta{color:rgba(255,255,255,.72);font-weight:900;white-space:nowrap;font-size:12px;}
      .pageServicesDash .svcTechMetaRow{display:block;}

      /* Status icons */
      /* Make warning triangles a touch smaller + lighter visual weight */
      .pageServicesDash .svcIcon{display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;vertical-align:middle;margin-left:6px;}
      .pageServicesDash .svcIcon svg{width:12px;height:12px;display:block}
      @media (max-width: 540px){
        .pageServicesDash .svcTechRow{flex-direction:column;align-items:flex-start;}
        .pageServicesDash .svcTechMeta{white-space:normal;}
        .pageServicesDash .svcTechLeft a{max-width:100%;}
      }

      /* Header filters sizing (local to this page) */
      .pageServicesDash .techHeaderPanel .pills .pill .v{font-size:26px !important;line-height:1.05 !important;}
      .pageServicesDash .techHeaderPanel .pills .pill .k{font-size:18px !important;line-height:1.05 !important;color:rgba(255,255,255,.55) !important;text-transform:none !important;}

      .pageServicesDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen{grid-template-columns:repeat(3, minmax(160px,1fr)) !important;}
      @media(max-width:920px){ .pageServicesDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen{grid-template-columns:1fr !important;} }

      /* Dropdown text colors: selected value white, dropdown list black */
      .pageServicesDash .techHeaderPanel select{color:#fff !important;}
      .pageServicesDash .techHeaderPanel select option{color:#000 !important;}
    `;
  })();

  // ---- Local state (kept independent of main dashboard state) ----
  if(typeof UI === 'undefined') window.UI = {};
  if(!UI.servicesDash) UI.servicesDash = { focus: 'asr', goalMetric: 'asr', team: 'all', open: {} };

  const st = UI.servicesDash;

  // Read querystring from hash (optional deep-link)
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      if(k==="focus") st.focus = decodeURIComponent(v||"asr") || "asr";
      if(k==="goal") st.goalMetric = (decodeURIComponent(v||"asr")==="sold") ? "sold" : "asr";
      if(k==="comparison") st.comparison = decodeURIComponent(v||"goal") || "goal";
    }
  }

  const focus = (st.focus === 'sold' || st.focus === 'goal') ? st.focus : 'asr';
  const goalMetric = (st.goalMetric === 'sold') ? 'sold' : 'asr';
  const comparison = (st.comparison === 'team' || st.comparison === 'store' || st.comparison === 'goal') ? st.comparison : 'goal';

  const techsAll = (typeof DATA !== 'undefined' && Array.isArray(DATA.techs))
    ? DATA.techs.filter(t=>t && (t.team === 'EXPRESS' || t.team === 'KIA'))
    : [];

  const techs = techsAll;

  // Determine the metric used for goal comparisons/ranking
  const rankMetric = (focus==='goal') ? goalMetric : (focus==='sold' ? 'sold' : 'asr');

  // Overall totals (team-scoped)
  const totalRos  = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const totalAsr  = techs.reduce((s,t)=>s+(Number(t.summary?.total?.asr)||0),0);
  const totalSold = techs.reduce((s,t)=>s+(Number(t.summary?.total?.sold)||0),0);
  const soldPerAsr = totalAsr ? (totalSold/totalAsr) : null;
  const asrPerRo  = totalRos ? (totalAsr/totalRos) : null;
  const soldPerRo = totalRos ? (totalSold/totalRos) : null;

  // For GOAL focus, compute store/team-level goal ratios (rough: total metric / total goal)
  function _storeGoalRatios(){
    // Sum goals across *existing* categories in DATA.sections
    const cats = [];
    (DATA.sections||[]).forEach(s=> (s.categories||[]).forEach(c=>{ if(c) cats.push(String(c)); }));
    const uniq = Array.from(new Set(cats));

    let gAsr = 0; // goal ASR/RO summed across cats (approx) using goal raw fractions (already per-RO for service)
    let gSold = 0; // goal sold/RO approx = sum(goalReq * goalClose)
    for(const cat of uniq){
      const gReq = Number(getGoal(cat,'req'));
      const gClose = Number(getGoal(cat,'close'));
      if(Number.isFinite(gReq)) gAsr += gReq;
      if(Number.isFinite(gReq) && Number.isFinite(gClose)) gSold += (gReq * gClose);
    }
    // Current team/store actuals across those same cats (sum req across cats per tech -> then average?)
    // Keep it simple: use the main totals above.
    // - asrPerRo is totalAsr/totalRos
    // - soldPerRo is totalSold/totalRos
    const asrPctOfGoal = (Number.isFinite(asrPerRo) && Number.isFinite(gAsr) && gAsr>0) ? (asrPerRo/gAsr) : null;
    const soldPctOfGoal = (Number.isFinite(soldPerRo) && Number.isFinite(gSold) && gSold>0) ? (soldPerRo/gSold) : null;
    return {gAsr, gSold, asrPctOfGoal, soldPctOfGoal};
  }

  const goalsAgg = _storeGoalRatios();

  // --- Local helper: stacked-label dial ---
  // Avoids relying on any undefined helpers (e.g., fmtDec) and keeps dial text stacked.
  // Uses the same .svcGauge markup pattern so animateSvcGauges()/initSvcGaugeHold() still work.
  function svcGaugeStack(pct, topLabel, bottomLabel){
    const p = Number.isFinite(pct) ? Math.max(0, pct) : 0;
    const ring = Math.round(Math.min(p, 1) * 100);

    let cls = "gRed";
    if(p >= 0.80) cls = "gGreen";
    else if(p >= 0.60) cls = "gYellow";

    const top = String(topLabel||"").trim();
    const bot = String(bottomLabel||"").trim();

    // Alternate view: +/- vs baseline (baseline is GOAL here)
    const delta = Math.round((p - 1) * 100);
    const absDelta = Math.abs(delta);
    const arrow = (delta >= 0) ? "▲" : "▼";
    const arrowColor = (delta >= 0) ? "#2ecc71" : "#f04545";

    const defaultHtml = `<span class="pctText pctDefault"><span class="pctTitle">${safe(top)}</span><span class="pctTitle">${safe(bot)}</span></span>`;
    const altHtml = `<span class="pctText pctAlt"><span class="pctMain">${absDelta}%</span><span class="pctArrow" style="color:${arrowColor}">${arrow}</span><span class="pctSub">GOAL</span></span>`;

    return `<span class="svcGauge ${cls}" data-p="${ring}">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle class="bg" cx="18" cy="18" r="15.91549430918954"></circle>
        <circle class="fg" cx="18" cy="18" r="15.91549430918954"></circle>
      </svg>
      ${defaultHtml}
      ${altHtml}
    </span>`;
  }

  // --- Build a global goal-rank map for services (denominator = total services on this page) ---
  const _allCatsSet = new Set();
  for(const t of techsAll){ for(const k of Object.keys(t.categories||{})) _allCatsSet.add(k); }

  const _allServiceNames = (Array.isArray(DATA.sections)?DATA.sections:[])
    .flatMap(s => (s?.categories||[]).map(String).filter(Boolean))
    .filter(c => _allCatsSet.has(c));
  const _uniqServices = Array.from(new Set(_allServiceNames));
  const _svcRankDen = _uniqServices.length || 1;
  const _svcGoalPct = new Map();
  for(const svcName of _uniqServices){
    // Build minimal aggregates
    let ros=0, asr=0, sold=0;
    for(const t of techsAll){
      const row = (t.categories||{})[svcName];
      if(!row) continue;
      ros  += Number(row.ros)||0;
      asr  += Number(row.asr)||0;
      sold += Number(row.sold)||0;
    }
    const reqTot = ros ? (asr/ros) : NaN;
    const closeTot = asr ? (sold/asr) : NaN;
    const gReq = Number(getGoal(svcName,'req'));
    const gClose = Number(getGoal(svcName,'close'));
    const pct = (rankMetric==='sold')
      ? ((Number.isFinite(closeTot) && Number.isFinite(gClose) && gClose>0) ? (closeTot/gClose) : NaN)
      : ((Number.isFinite(reqTot) && Number.isFinite(gReq) && gReq>0) ? (reqTot/gReq) : NaN);
    _svcGoalPct.set(svcName, pct);
  }

  const _ranked = _uniqServices
    .slice()
    .sort((a,b)=>{
      const av = _svcGoalPct.get(a);
      const bv = _svcGoalPct.get(b);
      const aN = Number.isFinite(av) ? av : -Infinity;
      const bN = Number.isFinite(bv) ? bv : -Infinity;
      if(aN===bN) return a.localeCompare(b);
      return aN < bN ? 1 : -1;
    });
  const _svcRankMap = new Map();
  _ranked.forEach((name, idx)=> _svcRankMap.set(name, idx+1));

  function goalRankBadge(serviceName){
    const rk = _svcRankMap.get(serviceName) || '—';
    const focusLbl = (rankMetric==='sold') ? 'SOLD' : 'ASR';
    return `
      <div class="rankFocusBadge sm" title="${safe(focusLbl)} goal rank">
        <div class="rfbFocus">${safe(focusLbl)}</div>
        <div class="rfbMain">${rk}</div>
        <div class="rfbOf"><span class="rfbOfWord">of</span><span class="rfbOfNum">${fmtInt(_svcRankDen)}</span></div>
      </div>
    `;
  }

  // Top-right block
  let topVal = asrPerRo;
  let topLbl = 'ASRs/RO';
  let subVal = soldPerRo;
  let subLbl = 'Sold/RO';
  if(focus === 'sold'){
    topVal = soldPerRo; topLbl = 'Sold/RO';
    subVal = asrPerRo;  subLbl = 'ASRs/RO';
  }
  if(focus === 'goal'){
    // show the selected goal metric % of goal big
    topVal = (goalMetric==='sold') ? goalsAgg.soldPctOfGoal : goalsAgg.asrPctOfGoal;
    topLbl = (goalMetric==='sold') ? 'Sold Goal%' : 'ASR Goal%';
    subVal = (goalMetric==='sold') ? soldPerRo : asrPerRo;
    subLbl = (goalMetric==='sold') ? 'Sold/RO' : 'ASRs/RO';
  }

  // Header panel (copied structure from Technician Dashboard)
  const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>

          <div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-start">
              <div class="h2 techH2Big">Services Dashboard</div>
              <div class="pills" style="margin-left:34px;display:flex;gap:12px;flex-wrap:wrap;white-space:normal;flex:1 1 auto">
                <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
                <div class="pill"><div class="k">ASRs</div><div class="v">${fmtInt(totalAsr)}</div></div>
                <div class="pill"><div class="k">Sold</div><div class="v">${fmtInt(totalSold)}</div></div>
                <div class="pill"><div class="k">Sold/ASR</div><div class="v">${soldPerAsr===null ? "—" : fmtPct(soldPerAsr)}</div></div>
              </div>
            </div>
            <div class="techTeamLine">Comparison: ${comparison.toUpperCase()} <span class="teamDot">•</span> ${focus.toUpperCase()}</div>
          </div>

          <div class="overallBlock">
            <div class="bigMain" style="font-size:38px;line-height:1.05;color:#fff;font-weight:1000">
              ${topVal===null ? "—" : (focus==='goal' ? fmtPct(topVal) : (focus==='sold' ? fmt1(topVal,2) : fmt1(topVal,1)))}
            </div>
            <div class="tag">${safe(topLbl)}</div>

            <div class="overallMetric" style="font-size:28px;line-height:1.05;color:#fff;font-weight:1000">
              ${subVal===null ? "—" : (focus==='sold' ? fmt1(subVal,1) : fmt1(subVal,2))}
            </div>
            <div class="tag">${safe(subLbl)}</div>
          </div>
        </div>

        <div class="svcHdrDivider"></div>
        <div class="mainFiltersBar">
          <div class="controls mainAlwaysOpen">
            <div>
              <label>Focus</label>
              <select data-svcdash="1" data-ctl="focus">
                <option value="asr" ${focus==='asr'?'selected':''}>ASR</option>
                <option value="sold" ${focus==='sold'?'selected':''}>SOLD</option>
                <option value="goal" ${focus==='goal'?'selected':''}>GOAL</option>
              </select>
            </div>

            ${focus==='goal' ? `
            <div>
              <label>Goal</label>
              <select data-svcdash="1" data-ctl="goal">
                <option value="asr" ${goalMetric==='asr'?'selected':''}>ASR</option>
                <option value="sold" ${goalMetric==='sold'?'selected':''}>SOLD</option>
              </select>
            </div>
            ` : `
            <div style="opacity:.45;filter:grayscale(1);pointer-events:none">
              <label>Goal</label>
              <select><option>—</option></select>
            </div>
            `}

            
            <div>
              <label>Comparison</label>
              <select data-svcdash="1" data-ctl="comparison">
                <option value="team" ${comparison==='team'?'selected':''}>Team</option>
                <option value="store" ${comparison==='store'?'selected':''}>Store</option>
                <option value="goal" ${comparison==='goal'?'selected':''}>Goal</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ---- Helpers for cards + tech list ----
  let storeAvgRos=0, storeAvgAsr=0, storeAvgSold=0;
  let teamBaseCounts=null;

  function iconKindFromPctOfBase(pctOfBase){
    if(pctOfBase===null || pctOfBase===undefined || !Number.isFinite(Number(pctOfBase))) return 'warn';
    const pct100 = Number(pctOfBase) * 100;
    const g = (typeof _gradeFromPct100 === 'function') ? _gradeFromPct100(pct100) : (pct100>=90?'A':pct100>=80?'B':pct100>=70?'C':pct100>=60?'D':'F');
    return (g==='A' || g==='B') ? 'good' : (g==='C' || g==='D') ? 'warn' : 'bad';
  }

  function iconSvg(kind){
    if(kind==='good') return `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="rgba(26,196,96,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><path d="M4.3 8.3 L7 11 L12 5.6" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if(kind==='bad') return `<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,3 14,13 2,13" fill="rgba(255,74,74,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><text x="8" y="11.6" text-anchor="middle" font-size="10.5" font-weight="600" fill="rgba(255,255,255,.95)">!</text></svg>`;
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,3 14,13 2,13" fill="rgba(255,197,66,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><text x="8" y="11.6" text-anchor="middle" font-size="10.5" font-weight="600" fill="rgba(255,255,255,.95)">!</text></svg>`;
  }

  function iconHtml(pctOfBase){
    return `<span class="svcIcon">${iconSvg(iconKindFromPctOfBase(pctOfBase))}</span>`;
  }
  function safeSvcIdLocal(cat){
    return "svc-" + String(cat||"").toLowerCase()
      .replace(/&/g,"and")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"");
  }
  function bandClassPct(pctOfBase){
    if(!Number.isFinite(pctOfBase)) return "";
    if(pctOfBase >= 0.80) return "bGreen";
    if(pctOfBase >= 0.60) return "bYellow";
    return "bRed";
  }
  function techMetricRowHtml(r, idx, mode, goalMetricLocal, goalPct){
    const rank = idx + 1;

    // Baselines depend on Comparison filter
    let baseRos=null, baseAsr=null, baseSold=null;

    if(comparison==='goal'){
      const gReq = Number(getGoal(r.serviceName || '', 'req'));
      const gClose = Number(getGoal(r.serviceName || '', 'close'));
      baseRos = storeAvgRos;
      baseAsr = (Number.isFinite(gReq) && gReq>0) ? (Number(r.ros||0) * gReq) : null;
      baseSold = (Number.isFinite(gReq) && gReq>0 && Number.isFinite(gClose) && gClose>0) ? (Number(r.ros||0) * gReq * gClose) : null;
    } else if(comparison==='team'){
      const tb = (teamBaseCounts && r.team && teamBaseCounts[r.team]) ? teamBaseCounts[r.team] : null;
      baseRos = Number.isFinite(Number(tb?.rosAvg)) && Number(tb.rosAvg)>0 ? Number(tb.rosAvg) : null;
      baseAsr = Number.isFinite(Number(tb?.asrAvg)) && Number(tb.asrAvg)>0 ? Number(tb.asrAvg) : null;
      baseSold = Number.isFinite(Number(tb?.soldAvg)) && Number(tb.soldAvg)>0 ? Number(tb.soldAvg) : null;
    } else { // store
      baseRos = storeAvgRos;
      baseAsr = storeAvgAsr;
      baseSold = storeAvgSold;
    }

    const rosPctBase  = (baseRos!==null && baseRos>0) ? (Number(r.ros||0)/baseRos) : null;
    const asrPctBase  = (baseAsr!==null && baseAsr>0) ? (Number(r.asr||0)/baseAsr) : null;
    const soldPctBase = (baseSold!==null && baseSold>0) ? (Number(r.sold||0)/baseSold) : null;

    return `
      <div class="svcTechRow">
        <div class="svcTechLeft">
          <span class="svcRankNum">${rank}.</span>
          <a href="#/tech/${encodeURIComponent(r.id)}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
        </div>
        <div class="svcTechMeta">
          <div class="svcTechMetaRow">ROs <b>${fmtInt(r.ros)}</b> • ASRs <b>${fmtInt(r.asr)}</b>${iconHtml(asrPctBase)} • Sold <b>${fmtInt(r.sold)}</b>${iconHtml(soldPctBase)}</div>
        </div>
      </div>
    `;
  }

  function buildServiceAgg(serviceName){
    let asr=0, sold=0, totalRos=0;
    const techRows = [];

    for(const t of techs){
      const c = (t.categories||{})[serviceName];
      const a = Number(c?.asr)||0;
      const so = Number(c?.sold)||0;
      const rosTech = Number(t.ros)||0;
      asr += a; sold += so; totalRos += rosTech;
      const req = rosTech ? (a/rosTech) : 0; // ASR/RO (ratio)
      const close = a ? (so/a) : 0; // Sold% (ratio)
      techRows.push({id:t.id, name:t.name, team:t.team, ros:rosTech, asr:a, sold:so, req, close, serviceName});
    }

    const reqTot = totalRos ? (asr/totalRos) : 0;
    const closeTot = asr ? (sold/asr) : 0;

    const nTech = techs.length || 1;
    const storeAvgRosL = totalRos / nTech;
    const storeAvgAsrL = asr / nTech;
    const storeAvgSoldL = sold / nTech;

    const teamTotals = {};
    const teamCounts = {};
    for(const r of techRows){
      const tk = r.team || 'UNKNOWN';
      if(!teamTotals[tk]) teamTotals[tk] = {ros:0, asr:0, sold:0};
      if(!teamCounts[tk]) teamCounts[tk] = 0;
      teamCounts[tk] += 1;
      teamTotals[tk].ros += Number(r.ros)||0;
      teamTotals[tk].asr += Number(r.asr)||0;
      teamTotals[tk].sold += Number(r.sold)||0;
    }
    const teamBaseCountsL = {};
    for(const k in teamTotals){
      const cnt = teamCounts[k] || 1;
      teamBaseCountsL[k] = {rosAvg: teamTotals[k].ros/cnt, asrAvg: teamTotals[k].asr/cnt, soldAvg: teamTotals[k].sold/cnt};
    }

    return {serviceName, totalRos, asr, sold, reqTot, closeTot, storeAvgRos: storeAvgRosL, storeAvgAsr: storeAvgAsrL, storeAvgSold: storeAvgSoldL, teamBaseCounts: teamBaseCountsL, techRows};
  }

  // Render one section panel (Maintenance/Fluids/Brakes/Tires/etc)
  function renderSection(sec){
    const secName = String(sec?.name||'').trim();
    if(!secName) return '';

    const openKey = secName.toLowerCase().replace(/[^a-z0-9]+/g,'_');
    const isOpen = !!st.open[openKey];

    // Only include services that exist in dataset (intersection with any tech categories)
    const allCatsSet = new Set();
    for(const t of techsAll){
      for(const k of Object.keys(t.categories||{})) allCatsSet.add(k);
    }
    const services = (sec.categories||[]).map(String).filter(Boolean).filter(c=>allCatsSet.has(c));

    const aggs = services.map(buildServiceAgg);

    // Section averages (used for dials when not GOAL focus)
    const avgReq = aggs.length ? aggs.reduce((s,x)=>s+x.reqTot,0)/aggs.length : 0;
    const avgClose = aggs.length ? aggs.reduce((s,x)=>s+x.closeTot,0)/aggs.length : 0;

    // Build cards
    const cardsHtml = aggs.map(s=>{
      // Dial basis
      const pctVsAvgReq   = (Number.isFinite(s.reqTot)   && Number.isFinite(avgReq)   && avgReq>0)   ? (s.reqTot/avgReq) : NaN;
      const pctVsAvgClose = (Number.isFinite(s.closeTot) && Number.isFinite(avgClose) && avgClose>0) ? (s.closeTot/avgClose) : NaN;

      const gReq = Number(getGoal(s.serviceName,'req'));
      const gClose = Number(getGoal(s.serviceName,'close'));
      const pctOfGoalReq = (Number.isFinite(s.reqTot) && Number.isFinite(gReq) && gReq>0) ? (s.reqTot/gReq) : NaN;
      const pctOfGoalClose = (Number.isFinite(s.closeTot) && Number.isFinite(gClose) && gClose>0) ? (s.closeTot/gClose) : NaN;

      // Always use Goal dial for all services (metric depends on Focus)
      const dialPct = (rankMetric==='sold') ? pctOfGoalClose : pctOfGoalReq;
      const dialLabel = (rankMetric==='sold') ? 'Sold Goal' : 'ASR Goal';

      const goalForThis = (rankMetric==='sold') ? gClose : gReq;
      const goalTxt = `Goal ${(!Number.isFinite(goalForThis) || goalForThis<=0)
        ? '—'
        : (rankMetric==='sold' ? fmtPct(goalForThis) : fmt1(goalForThis,2))
      }`;

      // Baselines for status icons
      storeAvgRos = s.storeAvgRos;
      storeAvgAsr = s.storeAvgAsr;
      storeAvgSold = s.storeAvgSold;
      teamBaseCounts = s.teamBaseCounts;

      // Tech list sorting
      const rows = s.techRows.slice().map(r=>{
        const gP = (focus==='goal')
          ? (goalMetric==='sold'
              ? ((Number.isFinite(r.close) && Number.isFinite(gClose) && gClose>0) ? (r.close/gClose) : null)
              : ((Number.isFinite(r.req) && Number.isFinite(gReq) && gReq>0) ? (r.req/gReq) : null)
            )
          : null;
        return {...r, goalPct: gP};
      });

      rows.sort((a,b)=>{
        const av = (focus==='goal') ? (a.goalPct ?? -Infinity) : (focus==='sold' ? a.close : a.req);
        const bv = (focus==='goal') ? (b.goalPct ?? -Infinity) : (focus==='sold' ? b.close : b.req);
        if(av===bv) return 0;
        return av < bv ? 1 : -1;
      });

      const techList = rows.map((r,i)=> techMetricRowHtml(r, i, focus, goalMetric, r.goalPct)).join('');

      return `
        <div class="catCard" id="${safe('sd-'+safeSvcIdLocal(s.serviceName).replace(/^svc-/,''))}">
          <div class="catHeader">
            <div class="catHdrLeft" style="min-width:0">
              <div class="catTitle">${safe(s.serviceName)}</div>
              <div class="muted" style="margin-top:2px">
                <div>${fmtInt(s.totalRos)} ROs • ${fmtInt(s.asr)} ASRs</div>
                <div>${fmtInt(s.sold)} Sold</div>
              </div>
            </div>

            <div class="sdCatHdrRow">
              <div class="svcGaugeWrap" style="--sz:72px">
                ${svcGaugeStack((Number.isFinite(dialPct)?dialPct:0), (rankMetric==='sold'?'SOLD':'ASR'), 'GOAL')}
              </div>
              ${goalRankBadge(s.serviceName)}
            </div>
          </div>

          <div class="subHdr">TECHNICIANS</div>
          <div class="svcTechList">${techList || `<div class="notice" style="padding:8px 2px">No technicians</div>`}</div>
        </div>
      `;
    }).join('');

    return `
      <details class="svcDashSec" ${isOpen?'open':''} data-sec="${safe(openKey)}">
        <summary>
          <div class="svcDashSecHead">
            <div class="svcDashSecTitle">${safe(secName)}</div>
            <div class="svcDashSecMeta">${fmtInt(services.length)} services</div>
          </div>
        </summary>
        <div class="svcDashBody">
          <div class="svcCardsGrid">${cardsHtml || `<div class="notice">No services found in this section.</div>`}</div>
        </div>
      </details>
    `;
  }

  const sections = Array.isArray(DATA.sections) ? DATA.sections : [];
  const sectionsHtml = sections.map(renderSection).join('');

  // ---- Diag panel (Services vs Goal + Tech top/bottom by avg goal performance across all services) ----
  function bandOfPct(pct){
    if(!Number.isFinite(pct)) return null;
    if(pct < 0.60) return 'red';
    if(pct < 0.80) return 'yellow';
    return 'green';
  }

  // Service goal bands (for the pies)
  const svcAggsAll = _uniqServices.map(buildServiceAgg);
  const svcBands = { asr:{red:[],yellow:[],green:[]}, sold:{red:[],yellow:[],green:[]} };
  for(const s of svcAggsAll){
    const gReq = Number(getGoal(s.serviceName,'req'));
    const gClose = Number(getGoal(s.serviceName,'close'));
    const pctReq = (Number.isFinite(s.reqTot) && Number.isFinite(gReq) && gReq>0) ? (s.reqTot/gReq) : NaN;
    const pctClose = (Number.isFinite(s.closeTot) && Number.isFinite(gClose) && gClose>0) ? (s.closeTot/gClose) : NaN;
    const bReq = bandOfPct(pctReq);
    const bClose = bandOfPct(pctClose);
    if(bReq) svcBands.asr[bReq].push({name:s.serviceName, pct:pctReq});
    if(bClose) svcBands.sold[bClose].push({name:s.serviceName, pct:pctClose});
  }

  function diagPieChartServices(mode){
    const red = svcBands[mode].red.length;
    const yellow = svcBands[mode].yellow.length;
    const green = svcBands[mode].green.length;
    const total = red + yellow + green;

    const cx = 80, cy = 80, rad = 70;
    const toRad = (deg)=> (deg*Math.PI/180);
    const at = (angDeg, r)=>({ x: cx + r*Math.cos(toRad(angDeg)), y: cy + r*Math.sin(toRad(angDeg)) });
    const arcPath = (a0, a1)=>{
      const p0 = at(a0, rad);
      const p1 = at(a1, rad);
      const large = (Math.abs(a1-a0) > 180) ? 1 : 0;
      return `M ${cx} ${cy} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${rad} ${rad} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
    };

    const parts = [
      {band:'red', n:red, fill:'#ff4b4b'},
      {band:'yellow', n:yellow, fill:'#ffbf2f'},
      {band:'green', n:green, fill:'#1fcb6a'},
    ].filter(p=>p.n>0);

    if(total<=0 || !parts.length){
      return `
        <div class="diagPieWrap" aria-label="${mode.toUpperCase()} service distribution (no data)">
          <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
            <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
            <text class="diagPieTxt" x="80" y="80" text-anchor="middle" dominant-baseline="middle">0</text>
          </svg>
        </div>`;
    }

    let ang = -90;
    const slices = [];
    for(const p of parts){
      const span = (p.n/total)*360;
      const a0 = ang;
      const a1 = ang + span;
      ang = a1;
      const mid = (a0+a1)/2;
      const tooSmall = span < 26;
      const inside = at(mid, rad*0.58);
      const outside = at(mid, rad*1.14);
      const leader0 = at(mid, rad*0.88);
      const leader1 = at(mid, rad*1.04);
      slices.push({
        ...p,
        span,
        path: arcPath(a0,a1),
        tooSmall,
        lx: (tooSmall?outside.x:inside.x),
        ly: (tooSmall?outside.y:inside.y),
        l0x: leader0.x, l0y: leader0.y,
        l1x: leader1.x, l1y: leader1.y
      });
    }

    return `
      <div class="diagPieWrap" aria-label="${mode.toUpperCase()} service distribution">
        <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
          <g>
            ${slices.map(s=>`
              <path class="diagPieSlice" data-mode="${mode}" data-band="${s.band}" d="${s.path}"
                fill="${s.fill}" stroke="rgba(255,255,255,.95)" stroke-width="1.6" stroke-linejoin="round" />
            `).join('')}
          </g>
          ${slices.map(s=> s.tooSmall ? `
            <line x1="${s.l0x.toFixed(2)}" y1="${s.l0y.toFixed(2)}" x2="${s.l1x.toFixed(2)}" y2="${s.l1y.toFixed(2)}" stroke="rgba(255,255,255,.95)" stroke-width="1.2" />
          ` : '').join('')}
          ${slices.map(s=>`<text class="diagPieTxt" x="${s.lx.toFixed(2)}" y="${s.ly.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${s.n}</text>`).join('')}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
        </svg>
      </div>`;
  }

  // Tech average % of goal across all services
  function techAvgPctOfGoal(mode){
    const out = [];
    for(const t of techsAll){
      let sum=0, n=0;
      for(const svcName of _uniqServices){
        const row = (t.categories||{})[svcName];
        if(!row) continue;
        const rosTech = Number(t.ros)||0;
        const asr = Number(row.asr)||0;
        const sold = Number(row.sold)||0;
        const req = (rosTech>0) ? (asr/rosTech) : NaN;
        const close = (asr>0) ? (sold/asr) : NaN;
        const gReq = Number(getGoal(svcName,'req'));
        const gClose = Number(getGoal(svcName,'close'));
        const pct = (mode==='sold')
          ? ((Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN)
          : ((Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN);
        if(Number.isFinite(pct)) { sum += pct; n++; }
      }
      out.push({id:t.id, name:t.name, pct: n ? (sum/n) : NaN});
    }
    return out;
  }

  function tbRowTech(item, idx, mode){
    const metricLbl = (mode==='sold') ? 'SOLD GOAL' : 'ASR GOAL';
    const val = Number.isFinite(item.pct) ? fmtPct(item.pct) : '—';
    return `
      <div class="techRow">
        <div class="techRowLeft">
          <span class="rankNum">${idx}.</span>
          <button type="button" class="tbJump" data-tech="${safe(item.id)}">${safe(item.name)}</button>
        </div>
        <div class="mini">${metricLbl} = ${val}</div>
      </div>`;
  }

  function tbMiniBox(title, rows, mode, kind){
    const html = rows.length ? rows.map((x,i)=>tbRowTech(x,i+1,mode)).join('') : `<div class="notice">No data</div>`;
    const icon = (kind==='down') ? `<span class="thumbIcon down" aria-hidden="true">&#128078;</span>` : `<span class="thumbIcon up" aria-hidden="true">&#128077;</span>`;
    return `
      <div class="pickBox">
        <div class="pickMiniHdr">${safe(title)} ${icon}</div>
        <div class="pickList">${html}</div>
      </div>`;
  }

  const techAsrGoal = techAvgPctOfGoal('asr').filter(x=>Number.isFinite(x.pct)).sort((a,b)=>b.pct-a.pct);
  const techSoldGoal = techAvgPctOfGoal('sold').filter(x=>Number.isFinite(x.pct)).sort((a,b)=>b.pct-a.pct);
  const topTechAsr = techAsrGoal.slice(0,3);
  const botTechAsr = techAsrGoal.slice(-3).reverse();
  const topTechSold = techSoldGoal.slice(0,3);
  const botTechSold = techSoldGoal.slice(-3).reverse();

  const diagPanel = `
    <div class="panel techPickPanel diagSection" style="height:100%;min-width:0;overflow:hidden">
      <div class="phead" style="border-bottom:none;padding:12px;display:grid;gap:14px">
        <!-- ASR row -->
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;align-self:flex-start;font-size:22px;line-height:1">ASR</div>
              ${diagPieChartServices('asr')}
            </div>
            <div>${tbMiniBox('Top 3 Technicians (Avg Goal)', topTechAsr, 'asr', 'up')}</div>
            <div>${tbMiniBox('Bottom 3 Technicians (Avg Goal)', botTechAsr, 'asr', 'down')}</div>
          </div>
        </div>

        <div class="diagDivider" style="height:1px;background:rgba(255,255,255,.12);margin:0 12px"></div>

        <!-- SOLD row -->
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;align-self:flex-start;font-size:22px;line-height:1">SOLD</div>
              ${diagPieChartServices('sold')}
            </div>
            <div>${tbMiniBox('Top 3 Technicians (Avg Goal)', topTechSold, 'sold', 'up')}</div>
            <div>${tbMiniBox('Bottom 3 Technicians (Avg Goal)', botTechSold, 'sold', 'down')}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const headerWrap = `<div class="svcdashHeaderWrap">${header}${diagPanel}</div>`;

  const app = document.getElementById('app');
  app.innerHTML = `<div class="pageServicesDash">${headerWrap}<div class="svcDashSections">${sectionsHtml}</div></div>`;

  // Wire events
  // Filters
  app.querySelectorAll('select[data-svcdash="1"]').forEach(sel=>{
    const ctl = sel.getAttribute('data-ctl');
    sel.addEventListener('change', ()=>{
      if(ctl==='focus') st.focus = sel.value;
      if(ctl==='goal') st.goalMetric = sel.value;
      if(ctl==='comparison') st.comparison = sel.value;
      renderServicesHome();
    });
  });

  // Persist open/closed sections
  app.querySelectorAll('details.svcDashSec').forEach(d=>{
    const key = d.getAttribute('data-sec');
    d.addEventListener('toggle', ()=>{ st.open[key] = d.open; });
  });

// Animate gauges (sets ring fill + enables hold interaction)
try{ animateSvcGauges(); }catch(e){}

// Also allow a simple click toggle for the alt view (quick feedback)
try{
  app.querySelectorAll('.svcGauge[data-p]').forEach(el=>{
    if(el.getAttribute('data-click')==='1') return;
    el.setAttribute('data-click','1');
    el.addEventListener('click', ()=>{
      el.classList.toggle('showAlt');
      clearTimeout(el._svcT);
      el._svcT = setTimeout(()=>{ try{ el.classList.remove('showAlt'); }catch(_e){} }, 1200);
    });
  });
}catch(e){}

  // ---- Diag interactions (pie -> list of services, tech rows -> tech page) ----
  function closeSvcDiagPopup(){
    const el = document.getElementById('svcDiagPopup');
    if(el) el.remove();
    document.removeEventListener('keydown', onSvcEsc, true);
  }
  function onSvcEsc(e){ if(e.key==='Escape') closeSvcDiagPopup(); }

  function openSvcDiagPopup(ev, mode, band, anchorEl){
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    closeSvcDiagPopup();
    const list = (svcBands[mode] && svcBands[mode][band]) ? svcBands[mode][band].slice() : [];
    list.sort((a,b)=> (a.pct||0) - (b.pct||0));
    const title = (mode==='sold') ? 'SOLD' : 'ASR';
    const pop = document.createElement('div');
    pop.id = 'svcDiagPopup';
    pop.className = 'diagPopup';

    // Match renderTech popup look (avoid CSS dependency)
    pop.style.position = 'fixed';
    pop.style.zIndex = '9999';
    pop.style.width = '520px';
    pop.style.maxWidth = 'calc(100vw - 24px)';
    pop.style.background = 'linear-gradient(180deg, rgba(22,28,44,.98), rgba(10,14,24,.98))';
    pop.style.border = '1px solid rgba(255,255,255,.10)';
    pop.style.borderRadius = '16px';
    pop.style.boxShadow = '0 22px 60px rgba(0,0,0,.55)';
    pop.style.overflow = 'hidden';
    pop.style.overflowX = 'hidden';
    pop.innerHTML = `
      <div class="diagPopHead" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08)">
        <div class="diagPopTitle" style="font-weight:1000;letter-spacing:.4px;display:flex;align-items:center;gap:10px">${title} • ${band.toUpperCase()} Services</div>
        <button class="diagPopClose" aria-label="Close" style="margin-left:auto;background:transparent;border:none;color:rgba(255,255,255,.75);font-size:22px;cursor:pointer;line-height:1">×</button>
      </div>
      <div class="diagPopList" style="padding:10px 12px;display:grid;gap:8px;max-height:420px;overflow:auto;overflow-x:hidden">
        ${list.length ? list.map((it,i)=>{
          const id = 'sd-'+safeSvcIdLocal(it.name).replace(/^svc-/, '');
          return `
            <button class="diagPopRowBtn" type="button" data-target="${id}" style="width:100%;text-align:left;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:8px 10px;color:inherit;display:flex;align-items:center;gap:6px;cursor:pointer">
              <span class="rankNum">${i+1}.</span>
              <span style="flex:0 1 340px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${safe(it.name)}</span>
              <span style="margin-left:6px;color:rgba(255,255,255,.75);font-weight:900;white-space:nowrap">${fmtPct(it.pct)}</span>
            </button>`;
        }).join('') : `<div class="notice" style="padding:8px 2px">No services</div>`}
      </div>
    `;
    document.body.appendChild(pop);

    const closeBtn = pop.querySelector('button[aria-label="Close"]');
    if(closeBtn) closeBtn.addEventListener('click', closeSvcDiagPopup);

    pop.addEventListener('click', (e)=>{
      const btn = e.target && e.target.closest ? e.target.closest('.diagPopRowBtn') : null;
      if(!btn) return;
      const tid = btn.getAttribute('data-target');
      if(tid){
        const el = document.getElementById(tid);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }
      closeSvcDiagPopup();
    }, true);

    const r = (anchorEl && anchorEl.getBoundingClientRect) ? anchorEl.getBoundingClientRect() : {left:20,top:20,right:20};
    const pr = pop.getBoundingClientRect();
    const pad = 10;
    let left = r.right + pad;
    let top = r.top - 6;
    const vw = window.innerWidth, vh = window.innerHeight;
    if(left + pr.width > vw - 8) left = r.left - pr.width - pad;
    if(top + pr.height > vh - 8) top = Math.max(8, vh - pr.height - 8);
    if(top < 8) top = 8;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    setTimeout(()=>{
      const onDoc = (e)=>{ if(!pop.contains(e.target)){ document.removeEventListener('mousedown', onDoc, true); closeSvcDiagPopup(); } };
      document.addEventListener('mousedown', onDoc, true);
    }, 0);
    document.addEventListener('keydown', onSvcEsc, true);
  }

  // Pie slice clicks -> popup
  try{
    app.querySelectorAll('.diagPieSlice').forEach(s=>{
      s.addEventListener('click', (e)=>{
        const mode = s.getAttribute('data-mode');
        const band = s.getAttribute('data-band');
        openSvcDiagPopup(e, mode, band, s);
      });
    });
  }catch(e){}

  // Tech clicks in diag -> tech page
  const diagRoot = app.querySelector('.svcDiagPanel');
  if(diagRoot){
    diagRoot.addEventListener('click', (e)=>{
      const b = e.target && e.target.closest ? e.target.closest('.tbJump[data-tech]') : null;
      if(!b) return;
      e.preventDefault();
      const id = b.getAttribute('data-tech');
      if(id) location.hash = `#/tech/${encodeURIComponent(id)}`;
    }, true);
  }

}

window.renderServicesHome = renderServicesHome;
