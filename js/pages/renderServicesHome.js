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

      /* Grade badge (color-coded by grade; content is metric number + title) */
      .pageServicesDash .gb{
        display:inline-flex;
        align-items:baseline;
        gap:6px;
        margin-left:6px;
        padding:3px 8px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.22);
        background:rgba(0,0,0,.22);
        font-weight:1100;
        font-size:12px;
        line-height:1;
        letter-spacing:.2px;
        vertical-align:baseline;
        /* faint white outline on the text */
        -webkit-text-stroke: .45px rgba(255,255,255,.30);
        text-shadow: 0 0 1px rgba(255,255,255,.20), 0 8px 16px rgba(0,0,0,.35);
      }
      .pageServicesDash .gb .gbNum{font-weight:1200;}
      .pageServicesDash .gb .gbTit{font-weight:1100;opacity:.92;}
      .pageServicesDash .gb.gbGreen{color:#1fcb6a;}
      .pageServicesDash .gb.gbYellow{color:#ffbf2f;}
      .pageServicesDash .gb.gbRed{color:#ff4b4b;}
      .pageServicesDash .gb.gbNone{color:rgba(255,255,255,.55); -webkit-text-stroke:0; text-shadow:none;}
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
    

/* --- Services header + diag section sizing (match Tech Details behavior) --- */
.pageServicesDash .svcHeaderWrap{display:grid;grid-template-columns:minmax(0,0.70fr) minmax(0,1.30fr);gap:14px;align-items:stretch}
.pageServicesDash .svcHeaderLeft{display:flex;flex-direction:column;min-height:0}
.pageServicesDash .svcHeaderLeft .phead{display:flex;flex-direction:column;min-height:0}
.pageServicesDash .svcHeaderLeft .svcTopArea{flex:0 0 auto}
.pageServicesDash .svcHeaderLeft .svcFiltersArea{flex:0 0 auto}
.pageServicesDash .svcHeaderLeft .svcHeaderDivider{height:1px;background:rgba(255,255,255,.12);margin:10px 12px 0}

/* Diag section (same pattern as Tech Details "diag section") */
.pageServicesDash .techPickPanel.diagSection{display:flex;flex-direction:column;overflow:hidden}
.pageServicesDash .techPickPanel.diagSection>.phead{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden}
.pageServicesDash .techPickPanel.diagSection .pickRow{min-height:0}

/* ensure header pills wrap instead of overlapping */
.pageServicesDash .techDashTopRow{flex-wrap:wrap !important}
.pageServicesDash .techDashTopRow .pills{flex-wrap:wrap !important;white-space:normal !important;margin-left:0 !important}

/* lock catHeader right-side order (Dial -> Badge -> ...) if present */
.pageServicesDash .svcCatHeadRight{display:flex;align-items:center;gap:12px;flex-wrap:nowrap}
.pageServicesDash .svcCatHeadRight .svcGauge{order:1}
.pageServicesDash .svcCatHeadRight .goalRankBadge{order:2}
.pageServicesDash .svcCatHeadRight .svcFocusStat{order:3}
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
  const headerLeft = `
  <div class="panel techHeaderPanel svcHeaderLeft">
    <div class="phead">
      <div class="svcTopArea">
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>

          <div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:flex-start;gap:12px;justify-content:flex-start">
              <div class="h2 techH2Big">Services Dashboard</div>
              <div class="pills" style="display:flex;gap:12px;flex:1 1 auto">
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
      </div>

      <div class="svcHeaderDivider"></div>

      <div class="svcFiltersArea">
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
            </div>` : ``}

            <div>
              <label>Comparison</label>
              <select data-svcdash="1" data-ctl="comparison" ${focus==='goal'?'disabled':''}>
                <option value="team" ${comparison==='team'?'selected':''}>Team</option>
                <option value="store" ${comparison==='store'?'selected':''}>Store</option>
                <option value="goal" ${comparison==='goal'?'selected':''}>Goal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
`;

const top3Panel = (function buildServicesDiag(){
  // Build per-service pct-of-goal bands for ASR and SOLD using totals
  const services = [];
  for(const sec of sections){
    for(const it of (sec.items||[])){
      const nm = String(it?.name||'').trim();
      if(!nm) continue;
      services.push(nm);
    }
  }
  const uniqServices = Array.from(new Set(services));
  const svcRows = uniqServices.map(nm=>{
    const a = buildServiceAgg(nm);
    const gReq = Number(getGoal(nm,'req'));
    const gClose = Number(getGoal(nm,'close'));
    const pctReq = (Number.isFinite(a.reqTot) && Number.isFinite(gReq) && gReq>0) ? (a.reqTot/gReq) : NaN;
    const pctClose = (Number.isFinite(a.closeTot) && Number.isFinite(gClose) && gClose>0) ? (a.closeTot/gClose) : NaN;
    return {name:nm, pctReq, pctClose};
  });

  function band(p){
    if(!Number.isFinite(p)) return 'na';
    if(p>=0.80) return 'g';
    if(p>=0.60) return 'y';
    return 'r';
  }

  const asrCounts = {g:0,y:0,r:0};
  const soldCounts = {g:0,y:0,r:0};
  for(const r of svcRows){
    const b1=band(r.pctReq); if(b1!=='na') asrCounts[b1]+=1;
    const b2=band(r.pctClose); if(b2!=='na') soldCounts[b2]+=1;
  }

  // Tech avg % of goal across all services
  const techScores = (techs||[]).map(t=>{
    const rosTech = Number(t.ros)||0;
    let sumAsr=0, cntAsr=0, sumSold=0, cntSold=0;
    for(const svc of uniqServices){
      const c=(t.categories||{})[svc];
      const asr=Number(c?.asr)||0;
      const sold=Number(c?.sold)||0;
      const req = rosTech ? (asr/rosTech) : NaN;
      const close = asr ? (sold/asr) : NaN;
      const gReq = Number(getGoal(svc,'req'));
      const gClose = Number(getGoal(svc,'close'));
      const pReq = (Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN;
      const pClose = (Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN;
      if(Number.isFinite(pReq)){ sumAsr += pReq; cntAsr++; }
      if(Number.isFinite(pClose)){ sumSold += pClose; cntSold++; }
    }
    return {
      id:t.id, name:t.name, team:t.team,
      asrAvg: cntAsr? (sumAsr/cntAsr): NaN,
      soldAvg: cntSold? (sumSold/cntSold): NaN
    };
  });

  const topAsr = [...techScores].filter(r=>Number.isFinite(r.asrAvg)).sort((a,b)=>b.asrAvg-a.asrAvg).slice(0,3);
  const botAsr = [...techScores].filter(r=>Number.isFinite(r.asrAvg)).sort((a,b)=>a.asrAvg-b.asrAvg).slice(0,3);
  const topSold = [...techScores].filter(r=>Number.isFinite(r.soldAvg)).sort((a,b)=>b.soldAvg-a.soldAvg).slice(0,3);
  const botSold = [...techScores].filter(r=>Number.isFinite(r.soldAvg)).sort((a,b)=>a.soldAvg-b.soldAvg).slice(0,3);

  function pieSvg(counts, label){
    const total = (counts.g+counts.y+counts.r) || 1;
    const vals = [counts.g, counts.y, counts.r];
    const classes = ['bGreen','bYellow','bRed'];
    let acc=0;
    const cx=50, cy=50, r=42;
    function arc(a0,a1){
      const x0=cx + r*Math.cos(a0), y0=cy + r*Math.sin(a0);
      const x1=cx + r*Math.cos(a1), y1=cy + r*Math.sin(a1);
      const large = (a1-a0) > Math.PI ? 1:0;
      return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    }
    const paths = vals.map((v,i)=>{
      const a0 = (acc/total)*Math.PI*2 - Math.PI/2;
      acc += v;
      const a1 = (acc/total)*Math.PI*2 - Math.PI/2;
      return `<path class="${classes[i]}" d="${arc(a0,a1)}"></path>`;
    }).join('');
    return `
      <div class="pieWrap" style="display:flex;align-items:center;gap:10px">
        <svg viewBox="0 0 100 100" width="92" height="92" style="cursor:pointer" class="svcDiagPie" data-diag="${label}">
          ${paths}
          <circle cx="50" cy="50" r="26" fill="rgba(9,14,26,.95)"></circle>
          <text x="50" y="46" text-anchor="middle" font-size="14" fill="#fff" font-weight="1000">${label}</text>
          <text x="50" y="64" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.75)">Goal</text>
        </svg>
        <div class="diagBandLegend" style="font-size:12px;line-height:1.2">
          <div><span class="legendName" style="color:var(--green)">GREEN</span> <span class="legendRest">≥80%</span></div>
          <div><span class="legendName" style="color:var(--yellow)">YELLOW</span> <span class="legendRest">60–79%</span></div>
          <div><span class="legendName" style="color:var(--red)">RED</span> <span class="legendRest">&lt;60%</span></div>
        </div>
      </div>
    `;
  }

  function listBox(title, rows, key){
    const items = rows.map(r=>`<div class="pickRow" style="display:flex;justify-content:space-between;gap:10px;align-items:center">
      <a href="#/tech/${r.id}" style="color:#fff;text-decoration:none">${safe(r.name)}</a>
      <div style="color:rgba(255,255,255,.85);font-weight:900">${fmtPct(key==='asr'? r.asrAvg : r.soldAvg)}</div>
    </div>`).join('');
    return `<div class="pickBox" style="border:1px solid rgba(255,255,255,.10);border-radius:14px;background:linear-gradient(180deg,var(--card),var(--card2));padding:10px 10px">
      <div style="font-weight:1000;color:#fff;margin-bottom:8px">${safe(title)}</div>
      <div style="display:grid;gap:6px">${items || `<div class="sub" style="color:rgba(255,255,255,.65)">No data</div>`}</div>
    </div>`;
  }

  return `
    <div class="panel techPickPanel diagSection" style="height:100%;min-width:0;overflow:hidden">
      <div class="phead" style="border-bottom:none;padding:12px;display:grid;gap:14px">
        <div class="diagRow" style="display:grid;grid-template-columns:200px 1fr 1fr;gap:12px;align-items:start">
          <div>${pieSvg(asrCounts, "ASR")}</div>
          <div>${listBox("Top 3 vs Goal", topAsr, 'asr')}</div>
          <div>${listBox("Bottom 3 vs Goal", botAsr, 'asr')}</div>
        </div>
        <div class="diagDivider" style="height:1px;background:rgba(255,255,255,.12);margin:0 12px"></div>
        <div class="diagRow" style="display:grid;grid-template-columns:200px 1fr 1fr;gap:12px;align-items:start">
          <div>${pieSvg(soldCounts, "SOLD")}</div>
          <div>${listBox("Top 3 vs Goal", topSold, 'sold')}</div>
          <div>${listBox("Bottom 3 vs Goal", botSold, 'sold')}</div>
        </div>
      </div>
    </div>
  `;
})();

const headerWrap = `<div class="svcHeaderWrap">${headerLeft}${top3Panel}</div>`;


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

  function gradeClassFromPctOfGoal(pctOfGoal){
    // pctOfGoal is a ratio (1.0 = 100% of goal)
    if(pctOfGoal===null || pctOfGoal===undefined || !Number.isFinite(Number(pctOfGoal))) return 'gbNone';
    const pct100 = Number(pctOfGoal) * 100;
    const g = (typeof _gradeFromPct100 === 'function') ? _gradeFromPct100(pct100) : (
      pct100>=90?'A':pct100>=80?'B':pct100>=70?'C':pct100>=60?'D':'F'
    );
    return (g==='A' || g==='B') ? 'gbGreen' : (g==='C' || g==='D') ? 'gbYellow' : (g==='F') ? 'gbRed' : 'gbNone';
  }

  function gbHtml(pctOfGoal, numTxt, titleTxt){
    const cls = gradeClassFromPctOfGoal(pctOfGoal);
    return `<span class="gb ${cls}"><span class="gbNum">${safe(numTxt)}</span><span class="gbTit">${safe(titleTxt)}</span></span>`;
  }

  function techMetricRowHtml(r, idx, mode, goalMetricLocal, goalPct){
    const rank = idx + 1;

    // Metrics for list:
    // - ROs
    // - ASRs/RO (rate) + grade badge (vs goal req)
    // - Sold/ASR (close rate) + grade badge (vs goal close)
    // NOTE: Sold/RO removed per instruction.
    const asrRoPctTxt = fmtPct(r.req);
    const soldAsrPctTxt = fmtPct(r.close);

    // Goal comparisons (always vs GOAL on this page)
    const gReq = Number(getGoal(r.serviceName || r._serviceName || '', 'req'));
    const gClose = Number(getGoal(r.serviceName || r._serviceName || '', 'close'));
    const asrPctOfGoal = (Number.isFinite(r.req) && Number.isFinite(gReq) && gReq>0) ? (r.req/gReq) : null;
    const soldPctOfGoal = (Number.isFinite(r.close) && Number.isFinite(gClose) && gClose>0) ? (r.close/gClose) : null;

    // If mode is GOAL, also show % of goal next to the primary % (same as previous behavior)
    const goalTxt = (mode==='goal')
      ? ` <span style="opacity:.9">(${goalPct===null? '—' : (Math.round(goalPct*100)+'%')} OF GOAL)</span>`
      : '';

    const asrBadge = gbHtml(asrPctOfGoal, asrRoPctTxt, 'ASRs/RO') + ((mode==='goal' && goalMetricLocal!=='sold') ? goalTxt : '');
    const soldBadge = gbHtml(soldPctOfGoal, soldAsrPctTxt, 'Sold/ASR') + ((mode==='goal' && goalMetricLocal==='sold') ? goalTxt : '');

    return `
      <div class="svcTechRow">
        <div class="svcTechLeft">
          <span class="svcRankNum">${rank}.</span>
          <a href="#/tech/${encodeURIComponent(r.id)}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
        </div>
        <div class="svcTechMeta">
          ROs ${fmtInt(r.ros)} • ${asrBadge} • ${soldBadge}
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
      techRows.push({id:t.id, name:t.name, ros:rosTech, asr:a, sold:so, req, close, serviceName});
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

  const sections = Array.isArray(DATA.sections) ? DATA.sections : [];
  const sectionsHtml = sections.map(renderSection).join('');

  const app = document.getElementById('app');
  app.innerHTML = `<div class="pageServicesDash">${headerWrap}<div class="svcDashSections">${sectionsHtml}</div></div>`;

  // Wire events
  // Filters
  app.querySelectorAll('select[data-svcdash="1"]').forEach(sel=>{
    const ctl = sel.getAttribute('data-ctl');
    sel.addEventListener('change', ()=>{
            if(ctl==='focus') { st.focus = sel.value; if(sel.value==='goal') st.comparison = 'goal'; }

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

function fmtDec(x, d=2, dropLeadingZero=true){
  const n = Number(x);
  if(!Number.isFinite(n)) return "—";
  let out = n.toFixed(d);
  if(dropLeadingZero) out = out.replace(/^0(?=\.)/,'');
  // trim trailing zeros but keep at least 1 decimal if any
  out = out.replace(/(\.\d*?[1-9])0+$/,'$1').replace(/\.0+$/,'');
  return out;
}
  if(focus==='goal') comparison = 'goal';
