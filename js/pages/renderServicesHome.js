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
      if(k==="team") st.team = decodeURIComponent(v||"all") || "all";
      if(k==="focus") st.focus = decodeURIComponent(v||"asr") || "asr";
      if(k==="goal") st.goalMetric = (decodeURIComponent(v||"asr")==="sold") ? "sold" : "asr";
    }
  }

  const focus = (st.focus === 'sold' || st.focus === 'goal') ? st.focus : 'asr';
  const goalMetric = (st.goalMetric === 'sold') ? 'sold' : 'asr';
  const teamKey = (st.team === 'express' || st.team === 'kia') ? st.team : 'all';

  const techsAll = (typeof DATA !== 'undefined' && Array.isArray(DATA.techs))
    ? DATA.techs.filter(t=>t && (t.team === 'EXPRESS' || t.team === 'KIA'))
    : [];

  const techs = teamKey === 'all'
    ? techsAll
    : techsAll.filter(t => String(t.team||'').toLowerCase() === teamKey);

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
            <div class="techTeamLine">${teamKey.toUpperCase().replace('ALL','ALL TEAMS')} <span class="teamDot">•</span> ${focus.toUpperCase()}</div>
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
              <label>Team</label>
              <select data-svcdash="1" data-ctl="team">
                <option value="all" ${teamKey==='all'?'selected':''}>All Teams</option>
                <option value="express" ${teamKey==='express'?'selected':''}>Express</option>
                <option value="kia" ${teamKey==='kia'?'selected':''}>Kia</option>
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
  function bandClassPct(pctOfBase){
    if(!Number.isFinite(pctOfBase)) return "";
    if(pctOfBase >= 0.80) return "bGreen";
    if(pctOfBase >= 0.60) return "bYellow";
    return "bRed";
  }

  function techMetricRowHtml(r, idx, mode, goalMetricLocal, goalPct){
    const rank = idx + 1;

    const metricLabel = (mode==='sold' || (mode==='goal' && goalMetricLocal==='sold')) ? 'SOLD' : 'ASR';
    const metricCount = (metricLabel==='SOLD') ? r.sold : r.asr;

    const pctText = (metricLabel==='SOLD') ? fmtPct(r.close) : fmtPctPlain(r.req);

    const goalTxt = (mode==='goal')
      ? ` <span style="opacity:.9">(${goalPct===null? '—' : (Math.round(goalPct*100)+'%')} OF GOAL)</span>`
      : '';

    return `
      <div class="svcTechRow">
        <div class="svcTechLeft">
          <span class="svcRankNum">${rank}.</span>
          <a href="#/tech/${encodeURIComponent(r.id)}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
        </div>
        <div class="svcTechMeta">
          ROs ${fmtInt(r.ros)} • ${metricLabel} ${fmtInt(metricCount)} • <b>${safe(pctText)}</b>${goalTxt}
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
      techRows.push({id:t.id, name:t.name, ros:rosTech, asr:a, sold:so, req, close});
    }

    const reqTot = totalRos ? (asr/totalRos) : 0;
    const closeTot = asr ? (sold/asr) : 0;

    return {serviceName, totalRos, asr, sold, reqTot, closeTot, techRows};
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

      const metricPct = (focus==='sold' || (focus==='goal' && goalMetric==='sold')) ? s.closeTot : s.reqTot;
      const metricTxt = (focus==='sold' || (focus==='goal' && goalMetric==='sold')) ? fmtPct(metricPct) : fmtPctPlain(metricPct);

      const goalForThis = (focus==='goal') ? (goalMetric==='sold' ? gClose : gReq) : null;
      const goalTxt = (focus==='goal') ? `Goal ${goalForThis===null||!Number.isFinite(goalForThis) ? '—' : (goalMetric==='sold'?fmtPct(goalForThis):fmtPctPlain(goalForThis))}` : '';

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
              <div class="catRank" style="font-weight:1200">${safe(metricTxt)}</div>
              ${focus==='goal' ? `<div class="byAsr" style="display:block">${safe(goalTxt)}</div>` : ''}
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

  
  // ---- DIAG PANEL (match renderTech techPickPanel.diagSection sizing/layout) ----
  // Services vs Goal (pie) + Technicians Top/Bottom 3 (avg % of goal across all services)
  const __SECTIONS = Array.isArray(DATA.sections) ? DATA.sections : [];
  const __ALL_TECHS = techs; // already scoped by page filters
  const __CAT_SET = new Set();
  for(const t of __ALL_TECHS){
    for(const k of Object.keys(t.categories||{})) __CAT_SET.add(k);
  }
  const __SERVICES = Array.from(new Set(__SECTIONS.flatMap(s => (s?.categories||[]).map(String).filter(Boolean))))
    .filter(svc => __CAT_SET.has(svc));

  function _bandOf(pct){
    if(!Number.isFinite(pct)) return null;
    if(pct < 0.60) return "red";
    if(pct < 0.80) return "yellow";
    return "green";
  }

  function _serviceTotals(serviceName){
    let ros=0, asr=0, sold=0;
    for(const t of __ALL_TECHS){
      const c = (t.categories||{})[serviceName];
      if(!c) continue;
      const r = Number(t.ros)||0;
      const a = Number(c.asr)||0;
      const s = Number(c.sold)||0;
      ros += r; asr += a; sold += s;
    }
    const req = ros>0 ? (asr/ros) : NaN;      // ASR/RO ratio
    const close = asr>0 ? (sold/asr) : NaN;   // Sold/ASR ratio
    const gReq = Number(getGoal(serviceName,'req'));
    const gClose = Number(getGoal(serviceName,'close'));
    const reqPct = (Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN;
    const closePct = (Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN;
    return {ros, asr, sold, req, close, reqPct, closePct};
  }

  function _countServiceBands(mode){
    let red=0,yellow=0,green=0;
    for(const svc of __SERVICES){
      const tot = _serviceTotals(svc);
      const pct = (mode==="sold") ? tot.closePct : tot.reqPct;
      const b = _bandOf(pct);
      if(b==="red") red++;
      else if(b==="yellow") yellow++;
      else if(b==="green") green++;
    }
    return {red,yellow,green};
  }

  // Big clickable pie chart (copied structure from renderTech, sized via CSS)
  function diagPieChart(counts, mode){
    const red = Math.max(0, Number(counts?.red)||0);
    const yellow = Math.max(0, Number(counts?.yellow)||0);
    const green = Math.max(0, Number(counts?.green)||0);
    const total = red + yellow + green;

    const cx = 80, cy = 80, rad = 70;
    const toRad = (deg)=> (deg*Math.PI/180);
    const at = (angDeg, r)=>({ x: cx + r*Math.cos(toRad(angDeg)), y: cy + r*Math.sin(toRad(angDeg)) });
    const arcPath = (a0,a1)=>{
      const p0=at(a0,rad), p1=at(a1,rad);
      const large = (Math.abs(a1-a0) > 180) ? 1 : 0;
      return `M ${cx} ${cy} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${rad} ${rad} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
    };

    const parts = [
      {band:"red", n:red, fill:"#ff4b4b"},
      {band:"yellow", n:yellow, fill:"#ffbf2f"},
      {band:"green", n:green, fill:"#1fcb6a"},
    ].filter(p=>p.n>0);

    if(total<=0 || !parts.length){
      return `
        <div class="diagPieWrap" aria-label="${mode.toUpperCase()} distribution (no data)">
          <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
            <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
            <text class="diagPieTxt" x="80" y="80" text-anchor="middle" dominant-baseline="middle">0</text>
          </svg>
        </div>
      `;
    }

    let ang=-90;
    const slices=[];
    for(const p of parts){
      const span=(p.n/total)*360;
      const a0=ang, a1=ang+span; ang=a1;
      const mid=(a0+a1)/2;
      const tooSmall = span < 26;
      const inside = at(mid, rad*0.58);
      const outside = at(mid, rad*1.14);
      const leader0 = at(mid, rad*0.88);
      const leader1 = at(mid, rad*1.04);
      slices.push({
        ...p, span, mid,
        path: arcPath(a0,a1),
        tooSmall,
        lx: (tooSmall?outside.x:inside.x),
        ly: (tooSmall?outside.y:inside.y),
        l0x: leader0.x, l0y: leader0.y,
        l1x: leader1.x, l1y: leader1.y
      });
    }

    return `
      <div class="diagPieWrap" aria-label="${mode.toUpperCase()} distribution">
        <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
          ${slices.map(s=>`
            <path class="diagPieSlice" d="${s.path}" fill="${s.fill}" data-mode="${mode}" data-band="${s.band}" />
          `).join('')}
          ${slices.map(s=> s.tooSmall ? `
            <line class="diagPieLeader" x1="${s.l0x.toFixed(2)}" y1="${s.l0y.toFixed(2)}" x2="${s.l1x.toFixed(2)}" y2="${s.l1y.toFixed(2)}" />
          ` : '').join('')}
          ${slices.map(s=>`
            <text class="diagPieTxt" x="${s.lx.toFixed(2)}" y="${s.ly.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${s.n}</text>
          `).join('')}
          <circle class="diagPieRing" cx="80" cy="80" r="70" fill="none" />
        </svg>
      </div>
    `;
  }

  function _techAvgPctOfGoal(t, mode){
    let sum=0, n=0;
    const ros = Number(t.ros)||0;
    for(const svc of __SERVICES){
      const c = (t.categories||{})[svc];
      if(!c) continue;
      const a = Number(c.asr)||0;
      const s = Number(c.sold)||0;
      const req = ros>0 ? (a/ros) : NaN;
      const close = a>0 ? (s/a) : NaN;
      const gReq = Number(getGoal(svc,'req'));
      const gClose = Number(getGoal(svc,'close'));
      const pct = (mode==="sold")
        ? ((Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN)
        : ((Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN);
      if(Number.isFinite(pct)){ sum += pct; n++; }
    }
    return n ? (sum/n) : NaN;
  }

  function _topBottomTechs(mode){
    const rows = __ALL_TECHS.map(t=>({
      id:t.id, name:t.name,
      v:_techAvgPctOfGoal(t, mode)
    }));
    rows.sort((a,b)=>{
      const av = Number.isFinite(a.v) ? a.v : -Infinity;
      const bv = Number.isFinite(b.v) ? b.v : -Infinity;
      if(av===bv) return String(a.name||"").localeCompare(String(b.name||""));
      return bv-av;
    });
    const top = rows.slice(0,3);
    const bot = rows.slice().reverse().filter(r=>Number.isFinite(r.v)).slice(0,3).reverse();
    return {top, bot};
  }

  function tbMiniBox(title, rows, mode){
    const lbl = (mode==="sold") ? "SOLD" : "ASR";
    const inner = (rows && rows.length) ? rows.map((r, i)=>`
      <div class="techRow">
        <div class="techRowLeft">
          <span class="rankNum">${i+1}.</span>
          <a class="tbJump" href="#/tech/${encodeURIComponent(String(r.id))}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
          <span class="mini">${lbl} ${Number.isFinite(r.v) ? fmtPct(r.v) : "—"}</span>
        </div>
      </div>
    `).join("") : `<div class="notice">No technicians</div>`;
    return `
      <div class="pickBox">
        <div class="pickMiniHdr">${safe(title)}</div>
        <div class="pickList">${inner}</div>
      </div>
    `;
  }

  const bandCounts_asr = _countServiceBands("asr");
  const bandCounts_sold = _countServiceBands("sold");
  const tb_asr = _topBottomTechs("asr");
  const tb_sold = _topBottomTechs("sold");

  const diagPanel = `
    <div class="panel techPickPanel diagSection" style="height:100%;min-width:0;overflow:hidden">
      <div class="phead">
        <!-- ASR row -->
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;align-self:flex-start;font-size:22px;line-height:1">ASR</div>
              ${diagPieChart(bandCounts_asr, "asr")}
            </div>
            <div>${tbMiniBox("Top 3 Techs (Avg % of Goal)", tb_asr.top, "asr")}</div>
            <div>${tbMiniBox("Bottom 3 Techs (Avg % of Goal)", tb_asr.bot, "asr")}</div>
          </div>
        </div>
        <div class="diagDivider" style="height:1px;background:rgba(255,255,255,12);margin:0 12px"></div>

        <!-- SOLD row -->
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;align-self:flex-start;font-size:22px;line-height:1">SOLD</div>
              ${diagPieChart(bandCounts_sold, "sold")}
            </div>
            <div>${tbMiniBox("Top 3 Techs (Avg % of Goal)", tb_sold.top, "sold")}</div>
            <div>${tbMiniBox("Bottom 3 Techs (Avg % of Goal)", tb_sold.bot, "sold")}</div>
          </div>
        </div>
      </div>
    </div>
  `;


  const sections = Array.isArray(DATA.sections) ? DATA.sections : [];
  const sectionsHtml = sections.map(renderSection).join('');

  const app = document.getElementById('app');
  app.innerHTML = `<div class="pageServicesDash"><div class="techHeaderWrap">${header}${diagPanel}</div><div class="svcDashSections">${sectionsHtml}</div></div>`;

  // Wire events
  // Filters
  app.querySelectorAll('select[data-svcdash="1"]').forEach(sel=>{
    const ctl = sel.getAttribute('data-ctl');
    sel.addEventListener('change', ()=>{
      if(ctl==='focus') st.focus = sel.value;
      if(ctl==='goal') st.goalMetric = sel.value;
      if(ctl==='team') st.team = sel.value;
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
