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

      .pageServicesDash .svcDashSections{display:grid;gap:12px;}
      .pageServicesDash details.svcDashSec{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:linear-gradient(180deg,var(--card),var(--card2));}
      .pageServicesDash details.svcDashSec > summary{list-style:none;cursor:pointer;}
      .pageServicesDash details.svcDashSec > summary::-webkit-details-marker{display:none;}

      .pageServicesDash .svcDashSecHead{padding:14px 14px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-end;justify-content:space-between;gap:12px;}
      .pageServicesDash .svcDashSecTitle{font-size:32px;font-weight:1400;letter-spacing:.8px;line-height:1.05;}
      .pageServicesDash .svcDashSecMeta{font-size:12px;color:var(--muted);font-weight:900;letter-spacing:.2px;white-space:nowrap}
      .pageServicesDash .svcDashBody{padding:12px 12px 14px;}

      /* Service cards grid (same vibe as tech details) */
      .pageServicesDash .svcCardsGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:14px;align-items:start;}
      @media (max-width: 980px){ .pageServicesDash .svcCardsGrid{grid-template-columns:1fr;} }

      /* Tech list inside service cards */
      .pageServicesDash .svcTechList{margin-top:10px;display:grid;gap:8px;}
      .pageServicesDash .svcTechRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);}
      .pageServicesDash .svcTechLeft{display:flex;align-items:center;gap:8px;min-width:0;}
      .pageServicesDash .svcTechLeft a{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;}
      .pageServicesDash .svcRankNum{color:rgba(255,255,255,.65);font-weight:1000;min-width:22px;text-align:right;}
      .pageServicesDash .svcTechMeta{color:rgba(255,255,255,.72);font-weight:900;white-space:nowrap;font-size:12px;}

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
            <div class="techDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;justify-content:flex-start">
              <div class="h2 techH2Big">Services Dashboard</div>
              <div class="pills" style="margin-left:34px;display:flex;gap:12px;flex-wrap:nowrap;white-space:nowrap;flex:0 0 auto">
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
          ROs <b>${fmtInt(r.ros)}</b> • ASRs <b>${fmtInt(r.asr)}</b>${iconHtml(asrPctBase)} • Sold <b>${fmtInt(r.sold)}</b>${iconHtml(soldPctBase)}
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
      const dialLabel = 'Goal%';

      const metricVal = (rankMetric==='sold') ? s.closeTot : s.reqTot;
      const metricTxt = (rankMetric==='sold') ? fmtPct(metricVal) : fmt1(metricVal,2);

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
            <div class="svcGaugeWrap" style="--sz:72px">
              ${Number.isFinite(dialPct) ? svcGauge(dialPct, dialLabel) : ''}
            </div>
            <div style="min-width:0">
              <div class="catTitle">${safe(s.serviceName)}</div>
              <div class="muted" style="margin-top:2px">
                ${fmtInt(s.asr)} ASR • ${fmtInt(s.sold)} Sold • ${fmtInt(s.totalRos)} ROs
              </div>
            </div>
            <div class="catHdrRight" style="text-align:right">
              ${goalRankBadge(s.serviceName)}
              <div class="catRank" style="font-weight:1200;margin-top:8px">${safe(metricTxt)}</div>
              <div class="byAsr" style="display:block">${safe(goalTxt)}</div>
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

  const app = document.getElementById('app');
  app.innerHTML = `<div class="pageServicesDash">${header}<div class="svcDashSections">${sectionsHtml}</div></div>`;

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
}

window.renderServicesHome = renderServicesHome;
