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

      /* Metric badges next to tech name (ROs + ASRs/RO + Sold/ASR + Sold/RO) */
      .pageServicesDash .svcNameBadges{display:inline-flex;gap:8px;align-items:center;flex-wrap:nowrap;white-space:nowrap;margin-left:8px;}
      .pageServicesDash .gbox{
        display:inline-flex;flex-direction:column;align-items:center;justify-content:center;
        min-width:64px;height:34px;padding:4px 6px;border-radius:10px;
        border:1px solid rgba(255,255,255,.35);
        color:#fff;line-height:1;
      }
      .pageServicesDash .gbox .gNum{font-size:12px;font-weight:1200;line-height:1.05;}
      .pageServicesDash .gbox .gLbl{font-size:10px;font-weight:1000;line-height:1.05;opacity:.85;}
      .pageServicesDash .gbox.gbGreen{background:rgba(26, 196, 96, .55);}
      .pageServicesDash .gbox.gbYellow{background:rgba(255, 197, 66, .55);}
      .pageServicesDash .gbox.gbRed{background:rgba(255, 74, 74, .55);}
      .pageServicesDash .gbox.gbNone{background:rgba(255,255,255,.10);color:rgba(255,255,255,.85);}

      @media (max-width: 540px){
        .pageServicesDash .svcTechRow{flex-direction:column;align-items:flex-start;}
        .pageServicesDash .svcTechMeta{white-space:normal;}
        .pageServicesDash .svcTechLeft a{max-width:100%;}
        .pageServicesDash .svcNameBadges{flex-wrap:wrap;white-space:normal;margin-left:0;}
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
  if(!UI.servicesDash) UI.servicesDash = { focus: 'asr', goalMetric: 'asr', comparison: 'goal', open: {} };

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

    let gAsr = 0;
    let gSold = 0;
    for(const cat of uniq){
      const gReq = Number(getGoal(cat,'req'));
      const gClose = Number(getGoal(cat,'close'));
      if(Number.isFinite(gReq)) gAsr += gReq;
      if(Number.isFinite(gReq) && Number.isFinite(gClose)) gSold += (gReq * gClose);
    }

    const asrPctOfGoal = (Number.isFinite(asrPerRo) && Number.isFinite(gAsr) && gAsr>0) ? (asrPerRo/gAsr) : null;
    const soldPctOfGoal = (Number.isFinite(soldPerRo) && Number.isFinite(gSold) && gSold>0) ? (soldPerRo/gSold) : null;
    return {gAsr, gSold, asrPctOfGoal, soldPctOfGoal};
  }

  const goalsAgg = _storeGoalRatios();

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
              ${topVal===null ? "—" : (focus==='goal' ? fmtPct(topVal) : fmtDec(topVal,2))}
            </div>
            <div class="tag">${safe(topLbl)}</div>

            <div class="overallMetric" style="font-size:28px;line-height:1.05;color:#fff;font-weight:1000">
              ${subVal===null ? "—" : fmtDec(subVal,2)}
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
  function safeSvcIdLocal(cat){
    return "svc-" + String(cat||"").toLowerCase()
      .replace(/&/g,"and")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"");
  }

  function fmtDec(val, dec=2){
    const n = Number(val);
    if(!Number.isFinite(n)) return '—';
    const s = n.toFixed(dec);
    return s.replace(/^0(?=\.)/, '');
  }

  function gradeClassFromPctOfBase(pctOfBase){
    if(pctOfBase===null || pctOfBase===undefined || !Number.isFinite(Number(pctOfBase))) return 'gbNone';
    const pct100 = Number(pctOfBase) * 100;
    const g = (typeof _gradeFromPct100 === 'function') ? _gradeFromPct100(pct100) : (
      pct100>=90?'A':pct100>=80?'B':pct100>=70?'C':pct100>=60?'D':'F'
    );
    return (g==='A' || g==='B') ? 'gbGreen' : (g==='C' || g==='D') ? 'gbYellow' : (g==='F') ? 'gbRed' : 'gbNone';
  }

  function gbBoxHtml(valueText, labelText, pctOfBase){
    const cls = gradeClassFromPctOfBase(pctOfBase);
    return `<span class="gbox ${cls}"><span class="gNum">${safe(valueText)}</span><span class="gLbl">${safe(labelText)}</span></span>`;
  }

  function techMetricRowHtml(r, idx, ctx){
    const rank = idx + 1;

    // Metrics
    const asrRoVal = r.req;     // decimal ASRs/RO
    const soldAsrVal = r.close; // Sold/ASR ratio
    const soldRoVal = r.soldRo; // Sold/RO ratio

    const rosTxt = fmtInt(r.ros);
    const asrRoTxt = fmtDec(asrRoVal, 2);
    const soldAsrTxt = fmtPct(soldAsrVal);
    const soldRoTxt = fmtPct(soldRoVal);

    // Baselines depend on Comparison filter
    let baseReq=null, baseClose=null, baseSoldRo=null;

    if(comparison==='goal'){
      const gReq = Number(ctx?.gReq);
      const gClose = Number(ctx?.gClose);
      baseReq = (Number.isFinite(gReq) && gReq>0) ? gReq : null;
      baseClose = (Number.isFinite(gClose) && gClose>0) ? gClose : null;
      baseSoldRo = (baseReq!==null && baseClose!==null) ? (baseReq * baseClose) : null;
    } else if(comparison==='team'){
      const tb = (ctx?.teamBase && r.team && ctx.teamBase[r.team]) ? ctx.teamBase[r.team] : null;
      baseReq = Number.isFinite(Number(tb?.req)) && Number(tb.req)>0 ? Number(tb.req) : null;
      baseClose = Number.isFinite(Number(tb?.close)) && Number(tb.close)>0 ? Number(tb.close) : null;
      baseSoldRo = Number.isFinite(Number(tb?.soldRo)) && Number(tb.soldRo)>0 ? Number(tb.soldRo) : null;
    } else { // store
      const sb = ctx?.storeBase || {};
      baseReq = Number.isFinite(Number(sb.req)) && Number(sb.req)>0 ? Number(sb.req) : null;
      baseClose = Number.isFinite(Number(sb.close)) && Number(sb.close)>0 ? Number(sb.close) : null;
      baseSoldRo = Number.isFinite(Number(sb.soldRo)) && Number(sb.soldRo)>0 ? Number(sb.soldRo) : null;
    }

    const asrRoPctBase = (Number.isFinite(asrRoVal) && baseReq!==null) ? (asrRoVal/baseReq) : null;
    const soldAsrPctBase = (Number.isFinite(soldAsrVal) && baseClose!==null) ? (soldAsrVal/baseClose) : null;
    const soldRoPctBase = (Number.isFinite(soldRoVal) && baseSoldRo!==null) ? (soldRoVal/baseSoldRo) : null;

    return `
      <div class="svcTechRow">
        <div class="svcTechLeft">
          <span class="svcRankNum">${rank}.</span>
          <a href="#/tech/${encodeURIComponent(r.id)}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
          <span class="svcNameBadges">
            ${gbBoxHtml(rosTxt, 'ROs', null)}
            ${gbBoxHtml(asrRoTxt, 'ASRs/RO', asrRoPctBase)}
            ${gbBoxHtml(soldAsrTxt, 'Sold/ASR', soldAsrPctBase)}
            ${gbBoxHtml(soldRoTxt, 'Sold/RO', soldRoPctBase)}
          </span>
        </div>
        <div class="svcTechMeta"></div>
      </div>
    `;
  }

  function buildServiceAgg(serviceName){
    let asr=0, sold=0, totalRos=0;
    const techRows = [];
    const teamTotals = {};

    for(const t of techs){
      const c = (t.categories||{})[serviceName];
      const a = Number(c?.asr)||0;
      const so = Number(c?.sold)||0;
      const rosTech = Number(t.ros)||0;
      asr += a; sold += so; totalRos += rosTech;
      const tk = t.team || 'UNKNOWN';
      if(!teamTotals[tk]) teamTotals[tk] = {ros:0, asr:0, sold:0};
      teamTotals[tk].ros += rosTech;
      teamTotals[tk].asr += a;
      teamTotals[tk].sold += so;
      const req = rosTech ? (a/rosTech) : 0; // ASR/RO (ratio)
      const close = a ? (so/a) : 0; // Sold% (ratio)
      const soldRo = rosTech ? (so/rosTech) : 0;
      techRows.push({id:t.id, name:t.name, team:t.team, ros:rosTech, asr:a, sold:so, req, close, soldRo});
    }

    const reqTot = totalRos ? (asr/totalRos) : 0;
    const closeTot = asr ? (sold/asr) : 0;
    const soldRoTot = totalRos ? (sold/totalRos) : 0;

    const teamBase = {};
    for(const k in teamTotals){
      const tr = teamTotals[k].ros || 0;
      const ta = teamTotals[k].asr || 0;
      const ts = teamTotals[k].sold || 0;
      teamBase[k] = {
        req: tr ? (ta/tr) : 0,
        close: ta ? (ts/ta) : 0,
        soldRo: tr ? (ts/tr) : 0,
      };
    }

    return {serviceName, totalRos, asr, sold, reqTot, closeTot, soldRoTot, teamBase, techRows};
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

      const dialPct = (focus==='goal')
        ? (goalMetric==='sold' ? pctOfGoalClose : pctOfGoalReq)
        : (focus==='sold' ? pctVsAvgClose : pctVsAvgReq);

      const dialLabel = (focus==='goal') ? 'Goal%' : (focus==='sold' ? 'Sold%' : 'ASR%');

      const metricVal = (focus==='sold' || (focus==='goal' && goalMetric==='sold')) ? s.closeTot : s.reqTot;
      const metricTxt = (focus==='sold' || (focus==='goal' && goalMetric==='sold')) ? fmtPct(metricVal) : fmtDec(metricVal,2);

      const goalForThis = (focus==='goal') ? (goalMetric==='sold' ? gClose : gReq) : null;
      const goalTxt = (focus==='goal') ? `Goal ${goalForThis===null||!Number.isFinite(goalForThis) ? '—' : (goalMetric==='sold'?fmtPct(goalForThis):fmtDec(goalForThis,2))}` : '';

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

      const ctx = { gReq, gClose, storeBase: { req: s.reqTot, close: s.closeTot, soldRo: s.soldRoTot }, teamBase: s.teamBase };

      const techList = rows.map((r,i)=> techMetricRowHtml(r, i, ctx)).join('');

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
              <div class="catRank" style="font-weight:1200">${safe(metricTxt)}</div>
              ${focus==='goal' ? `<div class="byAsr" style="display:block">${safe(goalTxt)}</div>` : ''}
            </div>
          </div>

          <div class="subHdr">TECHNICIANS</div>
          <div class="svcTechList">${techList || `<div class="notice" style="padding:8px 2px">No technicians</div>`}</div>

          <div class="subHdr" style="margin-top:12px">ADVISORS</div>
          <div class="notice" style="padding:8px 2px">Advisor data coming soon…</div>
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
