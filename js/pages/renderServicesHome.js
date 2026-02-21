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

      /* Category squares */
      .pageServicesDash .svcDashSections{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));align-items:start;}
      @media (max-width: 780px){ .pageServicesDash .svcDashSections{grid-template-columns:1fr;} }

      .pageServicesDash .svcCatTile{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:linear-gradient(180deg,var(--card),var(--card2));aspect-ratio:1/1;min-height:360px;display:flex;flex-direction:column;}
      @media (max-width: 780px){ .pageServicesDash .svcCatTile{aspect-ratio:auto;min-height:320px;} }

      .pageServicesDash .svcCatTileHead{padding:14px 14px 10px;border-bottom:1px solid var(--border);display:flex;align-items:flex-end;justify-content:space-between;gap:12px;}
      .pageServicesDash .svcCatTileTitle{font-size:28px;font-weight:1400;letter-spacing:.6px;line-height:1.05;}
      .pageServicesDash .svcCatTileMeta{font-size:12px;color:var(--muted);font-weight:900;letter-spacing:.2px;white-space:nowrap}
      .pageServicesDash .svcCatTileBody{padding:12px 12px 14px;display:flex;flex-direction:column;gap:10px;min-height:0;}
      .pageServicesDash .svcCatTileScroll{min-height:0;overflow:auto;padding-right:2px;}

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
  if(!UI.servicesDash) UI.servicesDash = { focus: 'asr', goalMetric: 'asr', team: 'all' };

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

  // Grade logic (comparison baseline = Goal)
  function gradeFromPct(p){
    if(!Number.isFinite(p)) return null;
    if(p >= 1.00) return 'A';
    if(p >= 0.90) return 'B';
    if(p >= 0.75) return 'C';
    if(p >= 0.60) return 'D';
    return 'F';
  }

  function gradeBadgeSvg(grade){
    if(!grade) return '';
    const stroke = 'rgba(255,255,255,.35)';
    const green = '#19c37d';
    const yellow = '#f4c542';
    const red = '#ff4d4d';

    // A/B => green circle
    if(grade==='A' || grade==='B'){
      return `<span class="gBadge" title="Grade ${grade}">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="6" fill="${green}" stroke="${stroke}" stroke-width="1" />
        </svg>
      </span>`;
    }

    // C/D => yellow triangle, F => red triangle
    const fill = (grade==='F') ? red : yellow;
    return `<span class="gBadge" title="Grade ${grade}">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1 L13 13 H1 Z" fill="${fill}" stroke="${stroke}" stroke-width="1" />
      </svg>
    </span>`;
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

  // Render categories as square tiles, each with a team-filtered tech list (sorted by focus)
  function buildSectionAgg(sec){
    const allCatsSet = new Set();
    for(const t of techsAll){
      for(const k of Object.keys(t.categories||{})) allCatsSet.add(k);
    }
    const services = (sec.categories||[]).map(String).filter(Boolean).filter(c=>allCatsSet.has(c));

    // category-level goals (sum-of-services goal per RO)
    let gReq = 0;
    let gSoldPerRo = 0;
    for(const svc of services){
      const gr = Number(getGoal(svc,'req'));
      const gc = Number(getGoal(svc,'close'));
      if(Number.isFinite(gr)) gReq += gr;
      if(Number.isFinite(gr) && Number.isFinite(gc)) gSoldPerRo += (gr * gc);
    }
    const gClose = (Number.isFinite(gReq) && gReq>0) ? (gSoldPerRo/gReq) : NaN; // Sold/ASR goal proxy

    const techRows = [];
    let totAsr=0, totSold=0;
    for(const t of techs){
      let asr=0, sold=0;
      for(const svc of services){
        const c = (t.categories||{})[svc];
        asr += Number(c?.asr)||0;
        sold += Number(c?.sold)||0;
      }
      const rosTech = Number(t.ros)||0;
      const req = rosTech ? (asr/rosTech) : 0; // ASR/RO
      const close = asr ? (sold/asr) : 0;      // Sold/ASR
      const soldRo = rosTech ? (sold/rosTech) : 0; // Sold/RO

      // Percent-of-goal for grade badges (comparison baseline = Goal)
      const pctAsrGoal = (Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN;
      const pctCloseGoal = (Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN;
      const pctSoldRoGoal = (Number.isFinite(gSoldPerRo) && gSoldPerRo>0) ? (soldRo/gSoldPerRo) : NaN;

      const gAsr = gradeFromPct(pctAsrGoal);
      const gCloseG = gradeFromPct(pctCloseGoal);
      const gSoldRoG = gradeFromPct(pctSoldRoGoal);

      const goalPct = (focus==='goal')
        ? (goalMetric==='sold'
            ? ((Number.isFinite(gSoldPerRo) && gSoldPerRo>0) ? (soldRo/gSoldPerRo) : null)
            : ((Number.isFinite(gReq) && gReq>0) ? (req/gReq) : null)
          )
        : null;

      techRows.push({
        id:t.id, name:t.name,
        ros:rosTech,
        asr, sold,
        req, close, soldRo,
        goalPct,
        pctAsrGoal, pctCloseGoal, pctSoldRoGoal,
        gAsr, gClose: gCloseG, gSoldRo: gSoldRoG
      });
      totAsr += asr; totSold += sold;
    }

    techRows.sort((a,b)=>{
      const av = (focus==='goal') ? (a.goalPct ?? -Infinity) : (focus==='sold' ? a.close : a.req);
      const bv = (focus==='goal') ? (b.goalPct ?? -Infinity) : (focus==='sold' ? b.close : b.req);
      if(av===bv) return 0;
      return av < bv ? 1 : -1;
    });

    // category-level dial (goal% when focus=goal, otherwise the metric itself)
    const reqTot = totalRos ? (totAsr/totalRos) : 0;
    const closeTot = totAsr ? (totSold/totAsr) : 0;
    const pctOfGoalReq = (Number.isFinite(reqTot) && Number.isFinite(gReq) && gReq>0) ? (reqTot/gReq) : NaN;
    const pctOfGoalClose = (Number.isFinite(gSoldPerRo) && gSoldPerRo>0 && totalRos>0) ? ((totSold/totalRos)/gSoldPerRo) : NaN;

    const dialPct = (focus==='goal')
      ? (goalMetric==='sold' ? pctOfGoalClose : pctOfGoalReq)
      : (focus==='sold' ? closeTot : reqTot);
    const dialLabel = (focus==='goal') ? 'Goal%' : (focus==='sold' ? 'Sold%' : 'ASR%');

    return {services, dialPct, dialLabel, techRows};
  }

  function renderCategoryTile(sec){
    const secName = String(sec?.name||'').trim();
    if(!secName) return '';

    const agg = buildSectionAgg(sec);
    const techList = agg.techRows.map((r,i)=>{
      const rank = i + 1;
      return `
        <div class="svcTechRow">
          <div class="svcTechLeft">
            <span class="svcRankNum">${rank}.</span>
            <a href="#/tech/${encodeURIComponent(r.id)}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
          </div>
          <div class="svcTechMeta">
            ROs ${fmtInt(r.ros)}
            • ASRs ${fmtInt(r.asr)} ${gradeBadgeSvg(r.gAsr)}
            • Sold/ASR <b>${fmtPct(r.close)}</b> ${gradeBadgeSvg(r.gClose)}
            • Sold/RO <b>${fmt1(r.soldRo,2)}</b> ${gradeBadgeSvg(r.gSoldRo)}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="svcCatTile" id="${safe('cat-'+safeSvcIdLocal(secName))}">
        <div class="svcCatTileHead">
          <div>
            <div class="svcCatTileTitle">${safe(secName)}</div>
            <div class="svcCatTileMeta">${fmtInt(agg.services.length)} services</div>
          </div>
          <div class="svcGaugeWrap" style="--sz:68px">
            ${Number.isFinite(agg.dialPct) ? svcGauge(agg.dialPct, agg.dialLabel) : ''}
          </div>
        </div>

        <div class="svcCatTileBody">
          <div class="svcCatTileScroll">
            <div class="subHdr" style="margin:0">TECHNICIANS</div>
            <div class="svcTechList" style="margin-top:8px">${techList || `<div class="notice" style="padding:8px 2px">No technicians</div>`}</div>

            <div style="margin-top:12px">
              <div class="subHdr" style="margin:0">ADVISORS</div>
              <div class="notice" style="margin-top:8px;padding:10px 12px;border-radius:12px;border:1px dashed rgba(255,255,255,.18);background:rgba(0,0,0,.10)">
                Advisor data coming soon.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const sections = Array.isArray(DATA.sections) ? DATA.sections : [];
  const sectionsTechHtml = sections.map(renderCategoryTile).join('');

  const app = document.getElementById('app');
  app.innerHTML = `<div class="pageServicesDash">${header}
  <div class="svcDashOneCol">
    <div class="panel svcDashCol"><div class="phead"><div class="h2">CATEGORIES</div></div><div class="svcDashSections">${sectionsTechHtml}</div></div>
  </div>
</div>`;

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

  // No accordion state needed for category tiles.
}

window.renderServicesHome = renderServicesHome;
