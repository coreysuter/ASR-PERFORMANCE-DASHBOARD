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

      /* Top area: 50/50 header + category rows */
      .pageServicesDash .svcDashTopGrid{display:grid;grid-template-columns: 1fr 1fr;gap:14px;align-items:start;}
      @media(max-width:1100px){ .pageServicesDash .svcDashTopGrid{grid-template-columns:1fr;}}

      /* Header panel sits in the left grid cell (effectively 50% width on desktop) */
      .pageServicesDash .svcDashTopGrid .techHeaderPanel{margin-bottom:0 !important;}

      /* Category rows panel */
      .pageServicesDash .svcDashCatsPanel{padding:0 !important;}
      .pageServicesDash .svcDashCatsPanel .phead{padding:14px !important;}
      .pageServicesDash .svcDashCatsPanel .list{padding:12px 12px 14px !important;}
      .pageServicesDash .svcDashCatsPanel .h2{font-size:18px !important;letter-spacing:.4px;}
      .pageServicesDash .svcDashCatsPanel .sub{margin-top:2px;}
      .pageServicesDash .svcDashCatsPanel .dashTechRow{padding:10px 12px !important;}
      .pageServicesDash .svcDashCatsPanel .dashTechRow .dashLeft .val.name{font-size:22px !important;}
      .pageServicesDash .svcDashCatsPanel .dashTechRow .techNameStats .tnLbl{font-size:11px !important;line-height:1.05 !important;}
      .pageServicesDash .svcDashCatsPanel .dashTechRow .techNameStats .tnVal{font-size:15px !important;line-height:1.05 !important;}

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

  // ---- Category rows next to header (mimic techRows from Technician Dashboard) ----
  const dashSections = (DATA.sections||[]).filter(s=>s && s.name && Array.isArray(s.categories));

  function compClass(actual, baseline){
    if(!Number.isFinite(actual) || !Number.isFinite(baseline) || baseline<=0) return "";
    const r = actual / baseline;
    if(r >= 0.80) return " compG";
    if(r >= 0.60) return " compY";
    return " compR";
  }

  function sectionKey(name){
    return String(name||"").toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }

  function sumGoalsForSection(sec){
    const cats = (sec.categories||[]).map(x=>String(x||"").trim()).filter(Boolean);
    let reqSum = 0;
    let soldRoSum = 0;
    for(const c of cats){
      const gReq = Number(getGoal(c,'req'));
      const gClose = Number(getGoal(c,'close'));
      if(Number.isFinite(gReq) && gReq>0){
        reqSum += gReq;
        if(Number.isFinite(gClose) && gClose>=0) soldRoSum += (gReq * gClose);
      }
    }
    const closeAvg = (Number.isFinite(reqSum) && reqSum>0) ? (soldRoSum/reqSum) : null;
    return {reqSum: reqSum||0, soldRoSum: soldRoSum||0, closeAvg};
  }

  function sectionActuals(sec){
    const cats = new Set((sec.categories||[]).map(x=>String(x||"").trim()).filter(Boolean));
    let asr=0, sold=0;
    for(const t of techs){
      const tc = t.categories || {};
      for(const cat of cats){
        const c = tc[cat];
        if(!c) continue;
        asr += (Number(c.asr)||0);
        sold += (Number(c.sold)||0);
      }
    }
    const ros = totalRos;
    const asrpr = (Number.isFinite(ros) && ros>0) ? (asr/ros) : null;
    const soldro = (Number.isFinite(ros) && ros>0) ? (sold/ros) : null;
    const soldpct = (Number.isFinite(asr) && asr>0) ? (sold/asr) : null;
    const soldasr = soldpct;
    return {ros, asr, sold, asrpr, soldro, soldpct, soldasr};
  }

  const secStats = dashSections.map(sec=>{
    const g = sumGoalsForSection(sec);
    const a = sectionActuals(sec);
    const asrGoalRatio = (Number.isFinite(a.asrpr) && Number.isFinite(g.reqSum) && g.reqSum>0) ? (a.asrpr/g.reqSum) : null;
    const soldGoalRatio = (Number.isFinite(a.soldpct) && Number.isFinite(g.closeAvg) && g.closeAvg>0) ? (a.soldpct/g.closeAvg) : null;
    return {sec, g, a, asrGoalRatio, soldGoalRatio};
  });

  function scoreForBadge(item){
    // Badge ALWAYS shows goal progress; metric depends on Focus selection
    if(focus==='goal') return (goalMetric==='sold') ? item.soldGoalRatio : item.asrGoalRatio;
    if(focus==='sold') return item.soldGoalRatio;
    return item.asrGoalRatio;
  }

  const rankedSecs = secStats.slice().sort((x,y)=>{
    const a = scoreForBadge(x);
    const b = scoreForBadge(y);
    return (Number.isFinite(b)?b:-999) - (Number.isFinite(a)?a:-999);
  });
  const secRank = new Map();
  rankedSecs.forEach((it,i)=>secRank.set(it.sec.name, {rank:i+1,total:rankedSecs.length}));

  function categoryRowHtml(it){
    const {sec, g, a, asrGoalRatio, soldGoalRatio} = it;
    const rk = secRank.get(sec.name) || {rank:null,total:null};

    // Shade pills using GOAL as the comparison baseline (no Comparison filter on this page)
    const asrGoalTarget = (Number.isFinite(g.reqSum) && g.reqSum>0) ? g.reqSum : null;
    const soldGoalTarget = (Number.isFinite(g.closeAvg) && g.closeAvg>0) ? g.closeAvg : null;
    const soldRoGoalTarget = (Number.isFinite(g.soldRoSum) && g.soldRoSum>0) ? g.soldRoSum : null;

    const clsAsrpr    = compClass(a.asrpr, asrGoalTarget);
    const clsSoldAsr  = compClass(a.soldasr, soldGoalTarget);
    const clsSoldRo   = compClass(a.soldro, soldRoGoalTarget);
    const clsAsrGoal  = compClass(asrGoalRatio, 1);
    const clsSoldGoal = compClass(soldGoalRatio, 1);

    const badgeType = (focus==='goal')
      ? (goalMetric==='sold' ? 'goal_sold' : 'goal_asr')
      : (focus==='sold' ? 'goal_sold' : 'goal_asr');

    const secK = sectionKey(sec.name);

    return `
      <div class="techRow dashTechRow" data-sec="${safe(secK)}" role="button" tabindex="0" style="cursor:pointer">
        <div class="dashLeft">
          <div class="val name" style="font-size:22px">
            <span>${safe(sec.name)}</span>
          </div>

          <div class="techNameStats">
            <div class="tnRow tnRow1">
              <span class="tnMini"><span class="tnLbl">Services</span><span class="tnVal">${fmtInt((sec.categories||[]).length)}</span></span>
              <span class="miniDot">•</span>
              <span class="tnMini"><span class="tnLbl">Techs</span><span class="tnVal">${fmtInt(techs.length)}</span></span>
            </div>
            <div class="tnRow tnRow2">
              <span class="tnMini"><span class="tnLbl">ASRs</span><span class="tnVal">${fmtInt(a.asr)}</span></span>
              <span class="miniDot">•</span>
              <span class="tnMini"><span class="tnLbl">Sold</span><span class="tnVal">${fmtInt(a.sold)}</span></span>
            </div>
          </div>
        </div>

        <div class="dashRight">
          <div class="pills">
            ${focus==='goal' ? `
              <div class="pillGroup pillGroupNonGoal">
                <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${a.asrpr==null?"—":fmt1(a.asrpr,1)}</div></div>
                <div class="pill${clsSoldAsr}"><div class="k">SOLD/ASR</div><div class="v">${a.soldasr==null?"—":fmtPct(a.soldasr)}</div></div>
                <div class="pill${clsSoldRo}"><div class="k">SOLD/RO</div><div class="v">${a.soldro==null?"—":fmt1(a.soldro,2)}</div></div>
              </div>
              <div class="pillGroup pillGroupGoal">
                <div class="pill${clsAsrGoal}${goalMetric==='asr' ? ' goalFocusSel' : ''}"><div class="k">ASR GOAL</div><div class="v">${asrGoalRatio==null?"—":fmtPct(asrGoalRatio)}</div></div>
                <div class="pill${clsSoldGoal}${goalMetric==='sold' ? ' goalFocusSel' : ''}"><div class="k">SOLD GOAL</div><div class="v">${soldGoalRatio==null?"—":fmtPct(soldGoalRatio)}</div></div>
              </div>
            ` : (focus==='sold' ? `
              <div class="pillGroup pillGroupA">
                <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${a.asrpr==null?"—":fmt1(a.asrpr,1)}</div></div>
                <div class="pill${clsAsrGoal}"><div class="k">ASR GOAL</div><div class="v">${asrGoalRatio==null?"—":fmtPct(asrGoalRatio)}</div></div>
              </div>
              <div class="pillGroup pillGroupB focusGroup">
                <div class="pill${clsSoldAsr}"><div class="k">SOLD/ASR</div><div class="v">${a.soldasr==null?"—":fmtPct(a.soldasr)}</div></div>
                <div class="pill${clsSoldRo}"><div class="k">SOLD/RO</div><div class="v">${a.soldro==null?"—":fmt1(a.soldro,2)}</div></div>
                <div class="pill${clsSoldGoal}"><div class="k">SOLD GOAL</div><div class="v">${soldGoalRatio==null?"—":fmtPct(soldGoalRatio)}</div></div>
              </div>
            ` : `
              <div class="pillGroup pillGroupB">
                <div class="pill${clsSoldAsr}"><div class="k">SOLD/ASR</div><div class="v">${a.soldasr==null?"—":fmtPct(a.soldasr)}</div></div>
                <div class="pill${clsSoldRo}"><div class="k">SOLD/RO</div><div class="v">${a.soldro==null?"—":fmt1(a.soldro,2)}</div></div>
                <div class="pill${clsSoldGoal}"><div class="k">SOLD GOAL</div><div class="v">${soldGoalRatio==null?"—":fmtPct(soldGoalRatio)}</div></div>
              </div>
              <div class="pillGroup pillGroupA focusGroup">
                <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${a.asrpr==null?"—":fmt1(a.asrpr,1)}</div></div>
                <div class="pill${clsAsrGoal}"><div class="k">ASR GOAL</div><div class="v">${asrGoalRatio==null?"—":fmtPct(asrGoalRatio)}</div></div>
              </div>
            `)}
          </div>

          <div class="techMetaRight">
            ${rankBadgeHtmlDash(rk.rank??"—", rk.total??"—", badgeType, "sm")}
          </div>
        </div>
      </div>
    `;
  }

  const categoryRowsHtml = secStats.map(categoryRowHtml).join('');
  const catsPanel = `
    <div class="panel svcDashCatsPanel">
      <div class="phead">
        <div>
          <div class="h2">Categories</div>
          <div class="sub">Pills shaded vs Goal • Badge shows Goal rank</div>
        </div>
      </div>
      <div class="list">${categoryRowsHtml || `<div class="notice">No categories found.</div>`}</div>
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

    const openKey = sectionKey(secName);
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
  app.innerHTML = `<div class="pageServicesDash">
    <div class="svcDashTopGrid">${header}${catsPanel}</div>
    <div class="svcDashSections" style="margin-top:14px">${sectionsHtml}</div>
  </div>`;

  // Category row interactions: click jumps to and expands the matching section below
  function openSectionByKey(secKey){
    const det = app.querySelector(`details.svcDashSec[data-sec="${secKey}"]`);
    if(!det) return;
    det.open = true;
    det.scrollIntoView({behavior:'smooth', block:'start'});
  }
  app.querySelectorAll('.svcDashCatsPanel .dashTechRow[data-sec]').forEach(row=>{
    const k = row.getAttribute('data-sec');
    row.addEventListener('click', ()=>openSectionByKey(k));
    row.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openSectionByKey(k); } });
  });

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
