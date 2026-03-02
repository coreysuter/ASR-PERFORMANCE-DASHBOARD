function renderAdvisorMain(){

  // Dashboard-only style overrides (scoped)
  (function ensureAdvisorDashOverrides(){
    const id = "advisorDashOverrides";
    let el = document.getElementById(id);
    if(!el){
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
      /* Scope EVERYTHING to advisor dashboard only */
      .pageAdvisorDash .techHeaderPanel{margin-bottom:14px !important; position:relative !important; z-index:2 !important;}
      .pageAdvisorDash .teamsGrid{position:relative !important; z-index:1 !important;}
      .pageAdvisorDash .techRow .techNameStats .tnLbl{font-size:11px !important; line-height:1.05 !important; text-transform:none !important; letter-spacing:.2px !important;}
      .pageAdvisorDash .techRow .techNameStats .tnVal{font-size:15px !important; line-height:1.05 !important;}
    `;
  })();

  const app = document.getElementById('app');

  // ---- Data source (must be produced from the "ADVISOR CATEGORY REPORT" tab in the base file) ----
  // Expected shape mirrors DATA.techs:
  // DATA.advisors = [{ id, name, team: "EXPRESS"|"KIA", ros, odo, summary:{ total/without_fluids/fluids_only }, categories:{...}}]
  const advisors = (typeof DATA !== 'undefined' && Array.isArray(DATA.advisors))
    ? DATA.advisors.filter(a=>a && (a.team === "EXPRESS" || a.team === "KIA"))
    : [];

  // Local, independent state
  if(typeof window.advisorState === 'undefined'){
    window.advisorState = {
      EXPRESS: { filterKey:"total", sortBy:"asr_per_ro", goalMetric:"asr", compare:"team" },
      KIA:     { filterKey:"total", sortBy:"asr_per_ro", goalMetric:"asr", compare:"team" },
    };
  }
  const state = window.advisorState;

  // Keep Express/Kia in sync (matches technician dashboard behavior)
  if(state && state.EXPRESS && state.KIA){
    state.KIA.filterKey = state.EXPRESS.filterKey;
    state.KIA.sortBy = state.EXPRESS.sortBy;
    if(state.EXPRESS.goalMetric !== undefined) state.KIA.goalMetric = state.EXPRESS.goalMetric;
    if(state.EXPRESS.compare !== undefined) state.KIA.compare = state.EXPRESS.compare;
  }

  const totalRos = advisors.reduce((s,a)=>s+(Number(a.ros)||0),0);
  const avgOdo = totalRos
    ? advisors.reduce((s,a)=>s+(Number(a.odo)||0)*(Number(a.ros)||0),0)/totalRos
    : 0;
  const totalAsr = advisors.reduce((s,a)=>s+(Number(a.summary?.total?.asr)||0),0);
  const totalSold = advisors.reduce((s,a)=>s+(Number(a.summary?.total?.sold)||0),0);
  const asrPerRo = totalRos ? (totalAsr/totalRos) : null;
  const soldPerRo = totalRos ? (totalSold/totalRos) : null;
  const soldPerAsr = totalAsr ? (totalSold/totalAsr) : null;

  const st = state?.EXPRESS || {filterKey:"total", sortBy:"asr_per_ro", goalMetric:"asr", compare:"team"};
  const focusIsGoal = st.sortBy === "goal";
  const goalMetric = (st.goalMetric === "sold") ? "sold" : "asr";
  if(focusIsGoal){
    state.EXPRESS.compare = "goal";
    state.KIA.compare = "goal";
  }
  const compareMode = focusIsGoal ? "goal" : ((st.compare === "store") ? "store" : (st.compare === "goal" ? "goal" : "team"));

  const focusIsSold = st.sortBy === "sold_pct";
  const topStatVal = focusIsSold ? soldPerRo : asrPerRo;
  const topStatLbl = focusIsSold ? "Sold/RO" : "ASRs/RO";
  const subStatVal = focusIsSold ? asrPerRo : soldPerRo;
  const subStatLbl = focusIsSold ? "ASRs/RO" : "Sold/RO";

  const header = `
  <div class="techNotchStage" style="position:relative; width:100%; overflow:visible;">
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

    <div class="panel techHeaderPanel" style="width:100%;min-width:0;border-top-left-radius:0px;border-left:none;">
      <div class="phead">
        <style>
          .pageAdvisorDash .techHeaderPanel .techDashTopRow{flex-wrap:nowrap !important;}
          .pageAdvisorDash .techHeaderPanel .techH2Big{flex:0 0 auto !important;}
          .pageAdvisorDash .techHeaderPanel .pills{flex-wrap:nowrap !important;white-space:nowrap !important;flex:0 0 auto !important;}
          .pageAdvisorDash .techHeaderPanel .pills .pill .v{font-size:22px !important;line-height:1.05 !important;}
          .pageAdvisorDash .techHeaderPanel .pills .pill .k{font-size:18px !important;line-height:1.05 !important;color:rgba(255,255,255,.55) !important;text-transform:none !important;}
          .pageAdvisorDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen select{min-width:152px !important;max-width:237px !important;}
          .pageAdvisorDash .techHeaderPanel .mainFiltersBar select{color:#fff !important;}
          .pageAdvisorDash .techHeaderPanel .mainFiltersBar select option{color:#000 !important;}
        </style>

        <div class="titleRow techTitleRow">
          <div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:center;gap:12px;flex-wrap:nowrap;justify-content:flex-start">
              <div class="h2 techH2Big">Advisor Dashboard</div>
              <div class="pills" style="margin-left:34px;display:flex;gap:12px;flex-wrap:nowrap;white-space:nowrap;flex:0 0 auto">
                <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(avgOdo)}</div></div>
                <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
                <div class="pill"><div class="k">ASRs</div><div class="v">${fmtInt(totalAsr)}</div></div>
                <div class="pill"><div class="k">Sold</div><div class="v">${fmtInt(totalSold)}</div></div>
                <div class="pill"><div class="k">Sold/ASRs</div><div class="v">${soldPerAsr===null ? "—" : fmtPct(soldPerAsr)}</div></div>
              </div>
            </div>
            <div class="techTeamLine">EXPRESS <span class="teamDot">•</span> KIA</div>
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
              <label>Focus</label>
              <select data-scope="advisor" data-ctl="sort">
                <option value="asr_per_ro" ${st.sortBy==="asr_per_ro"?"selected":""}>ASR/RO</option>
                <option value="sold_pct" ${st.sortBy==="sold_pct"?"selected":""}>Sold</option>
                <option value="goal" ${st.sortBy==="goal"?"selected":""}>Goal</option>
              </select>
            </div>
            ${focusIsGoal ? `
              <div>
                <label>Goal</label>
                <select data-scope="advisor" data-ctl="goal">
                  <option value="asr" ${goalMetric==="asr"?"selected":""}>ASR</option>
                  <option value="sold" ${goalMetric==="sold"?"selected":""}>Sold</option>
                </select>
              </div>
              <div>
                <label>Comparison</label>
                <select data-scope="advisor" data-ctl="compare" disabled style="opacity:.55;filter:grayscale(1);cursor:not-allowed">
                  <option value="team">Team</option>
                  <option value="store">Store</option>
                  <option value="goal" selected>Goal</option>
                </select>
              </div>
            ` : `
              <div>
                <label>Comparison</label>
                <select data-scope="advisor" data-ctl="compare">
                  <option value="team" ${compareMode==="team"?"selected":""}>Team</option>
                  <option value="store" ${compareMode==="store"?"selected":""}>Store</option>
                  <option value="goal" ${compareMode==="goal"?"selected":""}>Goal</option>
                </select>
              </div>
            `}
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

  if(!advisors.length){
    app.innerHTML = `<div class="pageAdvisorDash">${header}
      <div class="panel"><div class="phead"><div class="h2">No advisor data found</div>
        <div class="sub">Expected <b>DATA.advisors</b> generated from the <b>ADVISOR CATEGORY REPORT</b> tab in the base file.</div>
      </div></div>
    </div>`;
    return;
  }

  // ---- Helpers (advisor equivalents) ----
  function byAdvisorTeam(team){
    return advisors.filter(a => (a.team||"") === team);
  }
  function advisorAsrPerRo(a, filterKey){
    const v = Number(a?.summary?.[filterKey]?.asr_per_ro);
    return Number.isFinite(v) ? v : null;
  }
  function advisorSoldPct(a, filterKey){
    const v = Number(a?.summary?.[filterKey]?.sold_pct);
    return Number.isFinite(v) ? v : null;
  }

  function mean(arr){
    let s=0,n=0;
    for(const v of (arr||[])){
      const x = Number(v);
      if(Number.isFinite(x)){ s+=x; n++; }
    }
    return n? (s/n) : null;
  }

  function teamAsrPerRo(teamList, filterKey){
    let asr=0, ros=0;
    for(const a of (teamList||[])){
      const r=Number(a.ros);
      const aa=Number(a?.summary?.[filterKey]?.asr);
      if(Number.isFinite(r) && r>0) ros+=r;
      if(Number.isFinite(aa)) asr+=aa;
    }
    return ros>0 ? (asr/ros) : null;
  }
  function teamSoldPerRo(teamList, filterKey){
    let sold=0, ros=0;
    for(const a of (teamList||[])){
      const r=Number(a.ros);
      const s=Number(a?.summary?.[filterKey]?.sold);
      if(Number.isFinite(r) && r>0) ros+=r;
      if(Number.isFinite(s)) sold+=s;
    }
    return ros>0 ? (sold/ros) : null;
  }
  function teamAverages(teamList, filterKey){
    return {
      ros_avg: mean(teamList.map(a=>a.ros)),
      odo_avg: mean(teamList.map(a=>a.odo)),
      asr_total_avg: mean(teamList.map(a=>a.summary?.[filterKey]?.asr)),
      asr_per_ro_avg: teamAsrPerRo(teamList, filterKey),
      sold_pct_avg: mean(teamList.map(a=>advisorSoldPct(a, filterKey))),
      sold_per_ro_avg: teamSoldPerRo(teamList, filterKey),
      sold_avg: mean(teamList.map(a=>a.summary?.[filterKey]?.sold)),
    };
  }
  function compClass(actual, baseline){
    if(!Number.isFinite(actual) || !Number.isFinite(baseline) || baseline<=0) return "";
    const r = actual / baseline;
    if(r >= 0.80) return " compG";
    if(r >= 0.60) return " compY";
    return " compR";
  }

  function renderAdvisorTeam(team, stLocal){
    const listTeam = byAdvisorTeam(team);
    const av = teamAverages(listTeam, stLocal.filterKey);

    const gm = (stLocal && stLocal.goalMetric) ? String(stLocal.goalMetric) : 'asr';
    const focusGoal = (stLocal && stLocal.sortBy) ? String(stLocal.sortBy) === "goal" : false;

    const asrGoalStored = getGoalRaw('__META_GLOBAL','req');
    const soldGoalStored = getGoalRaw('__META_GLOBAL','close');
    const asrGoalTarget = (Number.isFinite(asrGoalStored) && asrGoalStored>0) ? asrGoalStored : (Number.isFinite(av.asr_per_ro_avg) ? av.asr_per_ro_avg : null);
    const soldGoalTarget = (Number.isFinite(soldGoalStored) && soldGoalStored>0) ? soldGoalStored : (Number.isFinite(av.sold_pct_avg) ? av.sold_pct_avg : null);

    const cm = (stLocal && stLocal.compare) ? String(stLocal.compare).toLowerCase() : 'team';
    const storeAv = teamAverages(advisors, stLocal.filterKey);
    const baseAsrpr = (cm === 'store') ? storeAv.asr_per_ro_avg : av.asr_per_ro_avg;
    const baseSoldPct = (cm === 'store') ? storeAv.sold_pct_avg : av.sold_pct_avg;
    const baseAsrGoalRatio = (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 && Number.isFinite(baseAsrpr)) ? (baseAsrpr/asrGoalTarget) : null;
    const baseSoldGoalRatio = (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 && Number.isFinite(baseSoldPct)) ? (baseSoldPct/soldGoalTarget) : null;

    const groupList = (cm === 'store') ? advisors : listTeam;
    const baseSoldRo = (function(){
      let sum=0,n=0;
      for(const x of groupList){
        const ss = (x.summary && x.summary[stLocal.filterKey]) ? x.summary[stLocal.filterKey] : {};
        const ro = Number(x.ros);
        const sold = Number(ss.sold);
        if(Number.isFinite(ro) && ro>0 && Number.isFinite(sold)) { sum += (sold/ro); n++; }
      }
      return n? (sum/n) : null;
    })();
    const baseSoldAsr = (function(){
      let sum=0,n=0;
      for(const x of groupList){
        const ss = (x.summary && x.summary[stLocal.filterKey]) ? x.summary[stLocal.filterKey] : {};
        const sold = Number(ss.sold);
        const asr = Number(ss.asr);
        if(Number.isFinite(asr) && asr>0 && Number.isFinite(sold)) { sum += (sold/asr); n++; }
      }
      return n? (sum/n) : null;
    })();

    const goalReq = getGoalRaw('__META_GLOBAL','req');
    const goalClose = getGoalRaw('__META_GLOBAL','close');
    const soldRoGoalTarget = (Number.isFinite(goalReq) && goalReq>0 && Number.isFinite(goalClose) && goalClose>0) ? (goalReq * goalClose) : null;

    const list = listTeam.slice();
    const score = (a)=>{
      const asrpr = advisorAsrPerRo(a, stLocal.filterKey);
      const soldpct = advisorSoldPct(a, stLocal.filterKey);
      if(!focusGoal){
        return (stLocal.sortBy === 'sold_pct') ? soldpct : asrpr;
      }
      if(gm === 'sold'){
        return (Number.isFinite(soldpct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (soldpct/soldGoalTarget) : null;
      }
      return (Number.isFinite(asrpr) && Number.isFinite(asrGoalTarget) && asrGoalTarget>0) ? (asrpr/asrGoalTarget) : null;
    };
    list.sort((a,b)=> (Number.isFinite(score(b))?score(b):-999) - (Number.isFinite(score(a))?score(a):-999));

    const ranked = list.slice();
    const rankIndex = new Map();
    ranked.forEach((a,i)=>rankIndex.set(a.id, {rank:i+1,total:ranked.length}));

    const rows = list.map(a=>{
      const ss = (a.summary && a.summary[stLocal.filterKey]) ? a.summary[stLocal.filterKey] : {};
      const rk = rankIndex.get(a.id) || {rank:null,total:null};
      const asrpr = advisorAsrPerRo(a, stLocal.filterKey);
      const soldpct = advisorSoldPct(a, stLocal.filterKey);

      const asrGoalRatio = (Number.isFinite(asrpr) && Number.isFinite(asrGoalTarget) && asrGoalTarget>0) ? (asrpr/asrGoalTarget) : null;
      const soldGoalRatio = (Number.isFinite(soldpct) && Number.isFinite(soldGoalTarget) && soldGoalTarget>0) ? (soldpct/soldGoalTarget) : null;

      const asrGoalTxt = asrGoalRatio==null ? '—' : fmtPct(asrGoalRatio);
      const soldGoalTxt = soldGoalRatio==null ? '—' : fmtPct(soldGoalRatio);

      const soldRoVal = (Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0) ? (Number(ss.sold)/Number(a.ros)) : null;
      const soldAsrRatio = (Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(ss.asr)) && Number(ss.asr)>0) ? (Number(ss.sold)/Number(ss.asr)) : null;

      const inGoalMode = cm === 'goal';
      const compAsrBase = (cm==='goal')
        ? (Number.isFinite(asrGoalTarget) && asrGoalTarget>0 ? asrGoalTarget : (Number.isFinite(goalReq)&&goalReq>0 ? goalReq : baseAsrpr))
        : baseAsrpr;
      const compSoldAsrBase = (cm==='goal')
        ? (Number.isFinite(soldGoalTarget) && soldGoalTarget>0 ? soldGoalTarget : (Number.isFinite(goalClose)&&goalClose>0 ? goalClose : baseSoldAsr))
        : baseSoldAsr;

      const clsAsrpr   = compClass(asrpr, compAsrBase);
      const clsAsrGoal = compClass(asrGoalRatio, inGoalMode ? 1 : baseAsrGoalRatio);
      const clsSoldAsr = compClass(soldAsrRatio, compSoldAsrBase);
      const soldRoBase = inGoalMode ? (Number.isFinite(soldRoGoalTarget) && soldRoGoalTarget>0 ? soldRoGoalTarget : baseSoldRo) : baseSoldRo;
      const clsSoldRo  = compClass(soldRoVal, soldRoBase);
      const clsSoldGoal= compClass(soldGoalRatio, inGoalMode ? 1 : baseSoldGoalRatio);

      const focusSold = stLocal.sortBy === 'sold_pct';

      return `
        <div class="techRow dashTechRow">
          <div class="dashLeft">
            <div class="val name" style="font-size:22px">${safe(a.name||a.id)}</div>
            <div class="techNameStats">
              <div class="tnRow tnRow1">
                <span class="tnMini"><span class="tnLbl">Avg ODO</span><span class="tnVal">${fmtInt(a.odo)}</span></span>
                <span class="miniDot">•</span>
                <span class="tnMini"><span class="tnLbl">ROs</span><span class="tnVal">${fmtInt(a.ros)}</span></span>
              </div>
              <div class="tnRow tnRow2">
                <span class="tnMini"><span class="tnLbl">ASRs</span><span class="tnVal">${fmtInt(ss.asr)}</span></span>
                <span class="miniDot">•</span>
                <span class="tnMini"><span class="tnLbl">Sold</span><span class="tnVal">${fmtInt(ss.sold)}</span></span>
              </div>
            </div>
          </div>

          <div class="dashRight">
            <div class="pills">
              ${focusGoal ? `
                <div class="pillGroup pillGroupNonGoal">
                  <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                  <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(ss.asr)) && Number(ss.asr)>0) ? fmtPct(Number(ss.sold)/Number(ss.asr)) : "—"}</div></div>
                  <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0) ? fmt1(Number(ss.sold)/Number(a.ros),2) : "—"}</div></div>
                </div>
                <div class="pillGroup pillGroupGoal">
                  ${gm==='asr'
                    ? `
                      <div class="pill${clsSoldGoal}${gm==='sold' ? ' goalFocusSel' : ''}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                      <div class="pill${clsAsrGoal}${gm==='asr' ? ' goalFocusSel' : ''}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                    `
                    : `
                      <div class="pill${clsAsrGoal}${gm==='asr' ? ' goalFocusSel' : ''}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                      <div class="pill${clsSoldGoal}${gm==='sold' ? ' goalFocusSel' : ''}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                    `
                  }
                </div>
              ` : (focusSold ? `
                <div class="pillGroup pillGroupA">
                  <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                  <div class="pill${clsAsrGoal}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                </div>
                <div class="pillGroup pillGroupB focusGroup">
                  <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(ss.asr)) && Number(ss.asr)>0) ? fmtPct(Number(ss.sold)/Number(ss.asr)) : "—"}</div></div>
                  <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0) ? fmt1(Number(ss.sold)/Number(a.ros),2) : "—"}</div></div>
                  <div class="pill${clsSoldGoal}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                </div>
              ` : `
                <div class="pillGroup pillGroupB">
                  <div class="pill${clsSoldAsr}"><div class="k">Sold/ASRs</div><div class="v">${(Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(ss.asr)) && Number(ss.asr)>0) ? fmtPct(Number(ss.sold)/Number(ss.asr)) : "—"}</div></div>
                  <div class="pill${clsSoldRo}"><div class="k">Sold/RO</div><div class="v">${(Number.isFinite(Number(ss.sold)) && Number.isFinite(Number(a.ros)) && Number(a.ros)>0) ? fmt1(Number(ss.sold)/Number(a.ros),2) : "—"}</div></div>
                  <div class="pill${clsSoldGoal}"><div class="k">Sold Goal</div><div class="v">${safe(soldGoalTxt)}</div></div>
                </div>
                <div class="pillGroup pillGroupA focusGroup">
                  <div class="pill${clsAsrpr}"><div class="k">ASRs/RO</div><div class="v">${fmt1(asrpr,1)}</div></div>
                  <div class="pill${clsAsrGoal}"><div class="k">ASR Goal</div><div class="v">${safe(asrGoalTxt)}</div></div>
                </div>
              `)}
            </div>
            <div class="techMetaRight">
              ${rankBadgeHtmlDash(rk.rank??"—", rk.total??"—", (focusGoal ? (gm==="sold" ? "goal_sold" : "goal_asr") : (stLocal.sortBy==="sold_pct" ? "sold" : "asr")), "sm")}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const filterLabel = stLocal.filterKey==="without_fluids" ? "Without Fluids" : (stLocal.filterKey==="fluids_only" ? "Fluids Only" : "With Fluids (Total)");
    const appliedParts = [filterLabel, (stLocal.sortBy==="goal" ? (gm==="sold" ? "Goal: Sold" : "Goal: ASR") : (stLocal.sortBy==="sold_pct" ? "Focus: Sold" : "Focus: ASR/RO")), `Comparison: ${String(cm||'team').toUpperCase()}`];

    return `
      <div class="panel">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div class="teamTitle">${safe(team)}</div>
              <div class="sub">${appliedParts.join(' • ')}</div>
            </div>
            <div style="text-align:right">
              <div class="big">${fmt1(teamAsrPerRo(listTeam, stLocal.filterKey),1)}</div>
              <div class="tag">ASRs/RO</div>
            </div>
          </div>
        </div>
        <div class="list">${rows || '<div class="notice">No advisors found.</div>'}</div>
      </div>
    `;
  }

  app.innerHTML = `<div class="pageAdvisorDash">${header}<div class="teamsGrid">${renderAdvisorTeam("EXPRESS", state.EXPRESS)}${renderAdvisorTeam("KIA", state.KIA)}</div></div>`;

  // Wire controls
  document.querySelectorAll('.pageAdvisorDash [data-ctl]').forEach(el=>{
    const ctl = el.getAttribute('data-ctl');
    const scope = el.getAttribute('data-scope');
    if(scope !== 'advisor') return;
    const apply = ()=>{
      if(ctl==="filter"){ state.EXPRESS.filterKey=el.value; state.KIA.filterKey=el.value; }
      if(ctl==="sort"){ state.EXPRESS.sortBy=el.value; state.KIA.sortBy=el.value; }
      if(ctl==="goal"){ state.EXPRESS.goalMetric=el.value; state.KIA.goalMetric=el.value; }
      if(ctl==="compare"){ state.EXPRESS.compare=el.value; state.KIA.compare=el.value; }
      renderAdvisorMain();
    };
    el.addEventListener('change', apply);
    el.addEventListener('input', apply);
  });

  // Match notch background to panel
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
}

window.renderAdvisorMain = renderAdvisorMain;
