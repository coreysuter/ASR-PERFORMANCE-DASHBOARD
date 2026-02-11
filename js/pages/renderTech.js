function renderTech(techId){
  const t = (DATA.techs||[]).find(x=>x.id===techId);
  if(!t){
    document.getElementById('app').innerHTML = `<div class="panel"><div class="phead"><div class="h2">Technician not found</div><div class="sub"><a href="#/">Back</a></div></div></div>`;
    return;
  }

  const team = t.team;

  const logoSrc = (document.querySelector(".brandLogo")||{}).src || "";

  let filterKey = "total";
  let compareBasis = "team";
  let focus = "asr"; // asr | sold
const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      if(k==="filter") filterKey = decodeURIComponent(v||"") || "total";
      if(k==="compare"){
        const vv = decodeURIComponent(v||"") || "team";
        compareBasis = (vv==="store") ? "store" : "team";
      }
      if(k==="focus"){
        const vv = decodeURIComponent(v||"") || "asr";
        focus = (vv==="sold"||vv==="goal"||vv==="asr") ? vv : "asr";
      }
    }
  }
  function filterLabel(k){ return k==="without_fluids"?"Without Fluids":(k==="fluids_only"?"Fluids Only":"With Fluids (Total)"); }

  const s = t.summary?.[filterKey] || {};

  function allTechs(){ return (DATA.techs||[]).filter(x=>x.team==="EXPRESS" || x.team==="KIA"); }
  function categoryUniverse(){
    const cats=new Set();
    for(const x of (DATA.techs||[])){
      for(const k of Object.keys(x.categories||{})) cats.add(k);
    }
    return Array.from(cats);
  }
  const CAT_LIST = categoryUniverse();

  function buildBench(scopeTechs){
    const bench={};
    for(const cat of CAT_LIST){
      const reqs=[], closes=[];
      let topReq=-1, topName="—", topClose=null;
      for(const x of scopeTechs){
        const c=x.categories?.[cat];
        const req=Number(c?.req);     // treat as ASR/RO
        const close=Number(c?.close); // treat as Sold%
        if(Number.isFinite(req)) reqs.push(req);
        if(Number.isFinite(close)) closes.push(close);
        if(Number.isFinite(req) && req>topReq){
          topReq=req; topName=x.name||"—";
          topClose=Number.isFinite(close)?close:null;
        }
      }
      bench[cat]={
        avgReq: reqs.length? reqs.reduce((a,b)=>a+b,0)/reqs.length : null,
        avgClose: closes.length? closes.reduce((a,b)=>a+b,0)/closes.length : null,
        topReq: topReq>=0? topReq : null,
        topClose, topName
      };
    }
    return bench;
  }

  const TEAM_TECHS = byTeam(team);
  const STORE_TECHS = allTechs();
  const TEAM_B = buildBench(TEAM_TECHS);
  const STORE_B = buildBench(STORE_TECHS);

  // Benchmarks helpers (tech detail)
  // TEAM_B / STORE_B are computed above from the current comparison team and full store tech list.
  function getTeamBenchmarks(cat, _team){
    try{ return (TEAM_B && TEAM_B[cat]) ? TEAM_B[cat] : {}; }catch(e){ return {}; }
  }
  function getStoreBenchmarks(cat){
    try{ return (STORE_B && STORE_B[cat]) ? STORE_B[cat] : {}; }catch(e){ return {}; }
  }


  function bandClass(val, base){
    if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) return "";
    const pct = val/base;
    if(pct>=0.80) return "bGreen";
    if(pct>=0.60) return "bYellow";
    return "bRed";
  }

  function rankFor(cat){
    const CMP_TECHS = (compareBasis==="team") ? TEAM_TECHS : STORE_TECHS;
    const vals = CMP_TECHS
      .map(x=>{
        const c = x.categories?.[cat] || {};
        let v = NaN;
        if(focus==="sold"){
          v = Number(c.close);
        }else if(focus==="goal"){
          const req = Number(c.req ?? NaN);
          const close = Number(c.close ?? NaN);
          const gReq = Number(getGoal(cat,"req"));
          const gClose = Number(getGoal(cat,"close"));
          const parts = [];
          if(Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) parts.push(req/gReq);
          if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) parts.push(close/gClose);
          v = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
        }else{
          v = Number(c.req);
        }
        return {id:x.id, v};
      })
      .filter(o=>Number.isFinite(o.v))
      .sort((a,b)=>b.v-a.v);

    const meC = t.categories?.[cat] || {};
    let me = NaN;
    if(focus==="sold"){
      me = Number(meC.close);
    }else if(focus==="goal"){
      const req = Number(meC.req);
      const close = Number(meC.close);
      const gReq = Number(getGoal(cat,"req"));
      const gClose = Number(getGoal(cat,"close"));
      const parts = [];
      if(Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) parts.push(req/gReq);
      if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) parts.push(close/gClose);
      me = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
    }else{
      me = Number(meC.req);
    }

    if(!Number.isFinite(me) || !vals.length) return null;
    const idx = vals.findIndex(o=>o.id===t.id);
    return {rank: idx>=0?idx+1:null, total: vals.length};
  }
const tfOpen = !!UI.techFilters[techId];
  const appliedParts = [
    `${filterLabel(filterKey)}`,
    (compareBasis==="team" ? `Compare: ${team}` : "Compare: Store"),
    (focus==="sold" ? "Focus: Sold" : (focus==="goal" ? "Focus: Goal" : "Focus: ASR/RO"))
  ];
  const appliedTextHtml = renderFiltersText(appliedParts);


  const filters = `
    <div class="iconBar" style="margin-top:0">
      <button class="iconBtn" onclick="toggleTechFilters('${safe(techId)}')" aria-label="Filters" title="Filters">${ICON_FILTER}</button>
      <div class="appliedInline">${appliedTextHtml}</div>
    </div>
    <div class="ctlPanel ${tfOpen?"open":""}">
      <div class="controls" style="margin-top:10px">
        <div>
          <label>Summary Filter</label>
          <select id="techFilter">
            <option value="total" ${filterKey==="total"?"selected":""}>With Fluids (Total)</option>
            <option value="without_fluids" ${filterKey==="without_fluids"?"selected":""}>Without Fluids</option>
            <option value="fluids_only" ${filterKey==="fluids_only"?"selected":""}>Fluids Only</option>
          </select>
        </div>
        <div>
          <label>Comparison</label>
          <select id="compareBasis">
            <option value="team" ${compareBasis==="team"?"selected":""}>Team</option>
            <option value="store" ${compareBasis==="store"?"selected":""}>Store</option>
          </select>
        </div>
        <div>
          <label>Focus</label>
          <select id="techFocus">
            <option value="asr" ${focus==="asr"?"selected":""}>ASR/RO</option>
            <option value="sold" ${focus==="sold"?"selected":""}>Sold%</option>
            <option value="goal" ${focus==="goal"?"selected":""}>Goal</option>
          </select>
        </div>
      </div>
    </div>
  `;

  const scopeTechs = (compareBasis==="team") ? byTeam(team) : allTechs();
  function techGoalScore(x){
    let sum=0, n=0;
    for(const cat of CAT_LIST){
      const c = x.categories?.[cat];
      if(!c) continue;
      const req = Number(c.req ?? NaN);
      const close = Number(c.close ?? NaN);
      const gReq = Number(getGoal(cat,"req"));
      const gClose = Number(getGoal(cat,"close"));
      if(Number.isFinite(req) && Number.isFinite(gReq) && gReq>0){ sum += (req/gReq); n++; }
      if(Number.isFinite(close) && Number.isFinite(gClose) && gClose>0){ sum += (close/gClose); n++; }
    }
    return n ? (sum/n) : null; // ratio (1.0 = 100% of goal)
  }
  const metricForRank = (x)=> {
    if(focus==="sold") return Number(techSoldPct(x, filterKey));
    if(focus==="goal") return Number(techGoalScore(x));
    return Number(techAsrPerRo(x, filterKey));
  };
  const ordered = scopeTechs.slice().sort((a,b)=>{
    const nb = metricForRank(b);
    const na = metricForRank(a);
    return (Number.isFinite(nb)?nb:-999) - (Number.isFinite(na)?na:-999);
  });

  const myV = metricForRank(t);
  const idx = Number.isFinite(myV) ? ordered.findIndex(o=>o.id===t.id) : -1;
  const overall = ordered.length ? {rank: (idx>=0?idx+1:null), total: ordered.length} : {rank:null,total:null};
  const focusLbl = focus==="sold" ? "SOLD%" : (focus==="goal" ? "GOAL%" : "ASR/RO");
  const focusVal = focus==="sold" ? fmtPct(techSoldPct(t, filterKey)) : (focus==="goal" ? fmtPct(techGoalScore(t)) : fmt1(techAsrPerRo(t, filterKey),1));

  
const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>
          <div class="techNameWrap">
            <div class="h2 techH2Big">${safe(t.name)}</div>
            <div class="techTeamLine">${safe(team)}</div>
          </div>
          <div class="overallBlock">
            <div class="big">${overall.rank ?? "—"}/${overall.total ?? "—"}</div>
            <div class="tag">${focus==="sold" ? "Overall Sold Rank" : "Overall ASR Rank"}</div>
            <div class="overallMetric">${focusVal}</div>
            <div class="tag">${focus==="sold" ? "Sold%" : "Total ASR/RO"}</div>
          </div>
        </div>
        <div class="pills">
          <div class="pill"><div class="k">ROs</div><div class="v">${fmtInt(t.ros)}</div></div>
          <div class="pill"><div class="k">Avg ODO</div><div class="v">${fmtInt(t.odo)}</div></div>
          <div class="pill"><div class="k">Avg ASR/RO</div><div class="v">${fmt1(techAsrPerRo(t, filterKey),1)}</div></div>
          <div class="pill"><div class="k">Sold %</div><div class="v">${fmtPct(techSoldPct(t, filterKey))}</div></div>
        </div>
        ${filters}
      </div>
    </div>
  `;

  function fmtDelta(val){ return val===null || val===undefined || !Number.isFinite(Number(val)) ? "—" : (Number(val)*100).toFixed(1); }

  function renderCategoryRectSafe(cat, compareBasis){
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const asrCount = Number(c.asr ?? 0);
    const soldCount = Number(c.sold ?? 0);
    const req = Number(c.req ?? NaN);
    const close = Number(c.close ?? NaN);
    const ro = Number(c.ro ?? 0);

        const techRos = Number(t.ros ?? 0);
const tb = getTeamBenchmarks(cat, team) || {};
    const sb = getStoreBenchmarks(cat) || {};
    const basis = (compareBasis==="store") ? sb : tb;

    const goalReq = Number(getGoal(cat,"req"));
    const goalClose = Number(getGoal(cat,"close"));

    const cmpReq = Number(basis.avgReq);
    const cmpClose = Number(basis.avgClose);

    const pctGoalReq = (Number.isFinite(req) && Number.isFinite(goalReq) && goalReq>0) ? (req/goalReq) : NaN;
    const pctGoalClose = (Number.isFinite(close) && Number.isFinite(goalClose) && goalClose>0) ? (close/goalClose) : NaN;

    const pctCmpReq = (Number.isFinite(req) && Number.isFinite(cmpReq) && cmpReq>0) ? (req/cmpReq) : NaN;
    const pctCmpClose = (Number.isFinite(close) && Number.isFinite(cmpClose) && cmpClose>0) ? (close/cmpClose) : NaN;

    function bandClass(pct){
      if(!Number.isFinite(pct)) return "bandNeutral";
      if(pct >= 0.80) return "bandGood";
      if(pct >= 0.60) return "bandWarn";
      return "bandBad";
    }

    // Header gauge follows Focus:
    let hdrPct = pctCmpReq;
    if(focus==="sold") hdrPct = pctCmpClose;
    if(focus==="goal"){
      const parts = [];
      if(Number.isFinite(pctGoalReq)) parts.push(pctGoalReq);
      if(Number.isFinite(pctGoalClose)) parts.push(pctGoalClose);
      hdrPct = parts.length ? (parts.reduce((a,b)=>a+b,0)/parts.length) : NaN;
    }
    const gaugeHtml = Number.isFinite(hdrPct) ? `<div class="svcGaugeWrap" style="--sz:72px">${svcGauge(hdrPct, (focus==="sold"?"Sold%":(focus==="goal"?"Goal%":"ASR%")))}</div>
` : `<div class="svcGaugeWrap" style="--sz:72px"></div>`;

    const rk = rankFor(cat);

    const showFocusTag = (focus==="sold") ? "SOLD%" : (focus==="goal" ? "GOAL%" : "ASR/RO");

    const compareLabel = (compareBasis==="store") ? "Store Avg" : "Team Avg";

    const asrBlock = `
      <div class="metricBlock">
        <div class="mbLeft">
          <div class="mbKicker">ASR/RO%</div>
          <div class="mbStat ${bandClass(pctCmpReq)}">${fmtPct(req)}</div>
        </div>
        <div class="mbRight">
          ${(focus==="goal") ? `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalReq)? svcGauge(pctGoalReq):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpReq)? svcGauge(pctCmpReq):""}</div>
          </div>
          ` : `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpReq)? svcGauge(pctCmpReq):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalReq)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalReq)? svcGauge(pctGoalReq):""}</div>
          </div>
          `}
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Top Performer</div>
              <div class="mbSub">(${safe((basis.topName)||"—")})</div>
              <div class="mbNum">${fmtPct(basis.topReq)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

const soldBlock = `
      <div class="metricBlock">
        <div class="mbLeft">
          <div class="mbKicker">Sold%</div>
          <div class="mbStat ${bandClass(pctCmpClose)}">${fmtPct(close)}</div>
        </div>
        <div class="mbRight">
          ${(focus==="goal") ? `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalClose)? svcGauge(pctGoalClose):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpClose)? svcGauge(pctCmpClose):""}</div>
          </div>
          ` : `
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">${compareLabel}</div>
              <div class="mbNum">${fmtPct(cmpClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctCmpClose)? svcGauge(pctCmpClose):""}</div>
          </div>
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Goal</div>
              <div class="mbNum">${fmtPct(goalClose)}</div>
            </div>
            <div class="mbGauge" style="--sz:56px">${Number.isFinite(pctGoalClose)? svcGauge(pctGoalClose):""}</div>
          </div>
          `}
          <div class="mbRow">
            <div class="mbItem">
              <div class="mbLbl">Top Performer</div>
              <div class="mbSub">(${safe((basis.topCloseName)||basis.topName||"—")})</div>
              <div class="mbNum">${fmtPct(basis.topClose)}</div>
            </div>
          </div>
        </div>
      </div>
    `;

return `
      <div class="catCard" id="svc-${cat}">
        <div class="catHeader">
          <div class="svcGaugeWrap" style="--sz:72px">${Number.isFinite(hdrPct)? svcGauge(hdrPct, (focus==="sold"?"Sold%":(focus==="goal"?"Goal%":"ASR%"))) : ""}</div>
<div>
            <div class="catTitle">${safe(catLabel(cat))}</div>
            <div class="muted svcMetaLine" style="margin-top:2px">
              ${fmt1(asrCount,0)} ASR · ${fmt1(soldCount,0)} Sold · ${fmt1(techRos,0)} ROs
            </div>
          </div>
          <div class="catRank">
            <div class="rankNum">${rk && rk.rank ? rk.rank : "—"}${rk && rk.total ? `<span class="rankDen">/${rk.total}</span>`:""}</div>
            <div class="rankLbl">${focus==="sold"?"SOLD%":(focus==="goal"?"GOAL%":"ASR%")}</div>
          </div>
        </div>

        <div class="metricStack">
          ${asrBlock}
          ${soldBlock}
        </div>

        <div class="catFooter">
          <a class="linkPill" href="#/raw?tech=${encodeURIComponent(t.id)}&cat=${encodeURIComponent(cat)}">ROs</a>
        </div>
      </div>
    `;
  }
  function sectionStatsForTech(sec){
    const cats = sec.categories || [];
    const reqs = cats.map(cat=>Number(t.categories?.[cat]?.req)).filter(n=>Number.isFinite(n));
    const closes = cats.map(cat=>Number(t.categories?.[cat]?.close)).filter(n=>Number.isFinite(n));
    return {
      avgReq: reqs.length ? reqs.reduce((a,b)=>a+b,0)/reqs.length : null,
      avgClose: closes.length ? closes.reduce((a,b)=>a+b,0)/closes.length : null
    };
  }

  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const secStats = sectionStatsForTech(sec);
    const cats = (sec.categories||[]);
    // Benchmarks for section-level dials (avg across categories)
    const benchReqs = cats.map(cat=>{
      const b = (compareBasis==="store") ? getStoreBenchmarks(cat) : getTeamBenchmarks(cat, team);
      return Number(b && b.avgReq);
    }).filter(n=>Number.isFinite(n) && n>0);
    const benchCloses = cats.map(cat=>{
      const b = (compareBasis==="store") ? getStoreBenchmarks(cat) : getTeamBenchmarks(cat, team);
      return Number(b && b.avgClose);
    }).filter(n=>Number.isFinite(n) && n>0);

    const benchReq = benchReqs.length ? mean(benchReqs) : NaN;
    const benchClose = benchCloses.length ? mean(benchCloses) : NaN;

    // Goals for section-level dials (avg across categories)
    const goalReqs = cats.map(cat=>Number(getGoal(cat,"req"))).filter(n=>Number.isFinite(n) && n>0);
    const goalCloses = cats.map(cat=>Number(getGoal(cat,"close"))).filter(n=>Number.isFinite(n) && n>0);
    const goalReq = goalReqs.length ? mean(goalReqs) : NaN;
    const goalClose = goalCloses.length ? mean(goalCloses) : NaN;

    const asrVal = Number(secStats.avgReq);
    const soldVal = Number(secStats.avgClose);

    const pctAsr = (Number.isFinite(asrVal) && Number.isFinite(benchReq) && benchReq>0) ? (asrVal/benchReq) : NaN;
    const pctSold = (Number.isFinite(soldVal) && Number.isFinite(benchClose) && benchClose>0) ? (soldVal/benchClose) : NaN;

    const pctGoalAsr = (Number.isFinite(asrVal) && Number.isFinite(goalReq) && goalReq>0) ? (asrVal/goalReq) : NaN;
    const pctGoalSold = (Number.isFinite(soldVal) && Number.isFinite(goalClose) && goalClose>0) ? (soldVal/goalClose) : NaN;
    const pctGoal = [pctGoalAsr,pctGoalSold].filter(n=>Number.isFinite(n)).length
      ? mean([pctGoalAsr,pctGoalSold].filter(n=>Number.isFinite(n)))
      : NaN;

    const focusPct = (focus==="sold") ? pctSold : (focus==="goal" ? pctGoal : pctAsr);
    const focusLbl = (focus==="sold") ? "Sold" : (focus==="goal" ? "Goal" : "ASR");

    const dialASR = Number.isFinite(pctAsr) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctAsr,"ASR")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialSold = Number.isFinite(pctSold) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctSold,"Sold")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialGoal = Number.isFinite(pctGoal) ? `<div class="svcGaugeWrap" style="--sz:44px">${svcGauge(pctGoal,"Goal")}</div>` : `<div class="svcGaugeWrap" style="--sz:44px"></div>`;
    const dialFocus = Number.isFinite(focusPct) ? `<div class="svcGaugeWrap" style="--sz:112px">${svcGauge(focusPct,focusLbl)}</div>` : `<div class="svcGaugeWrap" style="--sz:112px"></div>`;

    const __cats = Array.from(new Set((sec.categories||[]).filter(Boolean)));
    const rows = __cats.map(cat=>renderCategoryRectSafe(cat, compareBasis)).join("");
return `
      <div class="panel">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div class="h2 techH2">${safe(sec.name)}</div>
                <div class="secMiniDials">${dialASR}${dialSold}${dialGoal}</div>
              </div>
              <div class="sub">${appliedParts.join(" • ")}</div>
            </div>
            <div class="secHdrRight"><div class="secFocusDial">${dialFocus}</div><div class="secHdrStats" style="text-align:right">
                <div class="big">${fmtPct(secStats.avgReq)}</div>
                <div class="tag">ASR%</div>
                <div style="margin-top:6px;text-align:right;color:var(--muted);font-weight:900;font-size:13px">Sold%: <b style="color:var(--text)">${fmtPct(secStats.avgClose)}</b></div></div>
            </div>
          </div>
        </div>
        <div class="list">${rows ? `<div class="categoryGrid">${rows}</div>` : `<div class="notice">No categories found in this section.</div>`}</div>
      </div>
    `;
  }).join("");

  
  // === Top/Bottom 3 panel (ASR% and Sold%) ===
  const allCatsTB = Array.from(new Set((DATA.sections||[]).flatMap(s => (s.categories||[])).filter(Boolean)));
  const svcRowsTB = allCatsTB.map(cat=>{
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const req = Number(c.req);
    const close = Number(c.close);
    const label = (typeof catLabel==="function") ? catLabel(cat) : String(cat);
    return { cat, label, req, close };
  });

  const byReqTB = svcRowsTB.filter(x=>Number.isFinite(x.req)).sort((a,b)=>b.req-a.req);
  const byCloseTB = svcRowsTB.filter(x=>Number.isFinite(x.close)).sort((a,b)=>b.close-a.close);

  const topReqTB = byReqTB.slice(0,3);
  const botReqTB = byReqTB.slice(-3).reverse();
  const topCloseTB = byCloseTB.slice(0,3);
  const botCloseTB = byCloseTB.slice(-3).reverse();

  // Safe jump helper (never throws on null)
  window.jumpToService = function(cat){
    const id = `svc-${cat}`;
    const el = document.getElementById(id);
    if(!el){ console.warn("jumpToService: not found", id); return false; }
    const sec = el.closest(".sectionFrame") || el.closest(".panel") || null;
    if(sec && sec.classList && sec.classList.contains("secCollapsed")) sec.classList.remove("secCollapsed");
    el.scrollIntoView({behavior:"smooth", block:"start"});
    if(el.classList){
      el.classList.add("flashPick");
      setTimeout(()=>{ const el2=document.getElementById(id); if(el2 && el2.classList) el2.classList.remove("flashPick"); }, 900);
    }
    return false;
  };

  // === Triangle icons + popup support (replaces thumbs) ===
function warningTriSvg(opts){
  const { color="yellow", size=16, count=null, idSuffix="" } = (opts||{});
  const isRed = (color==="red");
  const fillA = isRed ? "#ff8b8b" : "#ffd978";
  const fillB = isRed ? "#d61f2a" : "#f2a21a";
  const gradId = `triGrad-${idSuffix}`;
  const hiId = `triHi-${idSuffix}`;
  const vbW = 100, vbH = 87;

  const countText = (count!==null && count!==undefined)
    ? `<text x="86" y="82" fill="#fff" font-weight="1000" font-size="22" text-anchor="end">${fmtInt(count)}</text>`
    : "";

  return `
    <svg viewBox="0 0 ${vbW} ${vbH}" width="${size}" height="${Math.round(size*0.87)}" aria-hidden="true" focusable="false" class="triSvg">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${fillA}"></stop>
          <stop offset="100%" stop-color="${fillB}"></stop>
        </linearGradient>
        <radialGradient id="${hiId}" cx="35%" cy="20%" r="75%">
          <stop offset="0%" stop-color="rgba(255,255,255,.55)"></stop>
          <stop offset="55%" stop-color="rgba(255,255,255,.10)"></stop>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"></stop>
        </radialGradient>
      </defs>

      <!-- Rounded emoji-ish triangle -->
      <path d="
        M50 0
        C53 0 55 2 57 5
        L100 87
        C102 91 99 94 95 94
        L5 94
        C1 94 -2 91 0 87
        L43 5
        C45 2 47 0 50 0Z"
        fill="url(#${gradId})"></path>

      <!-- Highlight sheen -->
      <path d="
        M50 6
        C52 6 54 7 55 10
        L92 80
        C94 83 92 86 88 86
        L12 86
        C8 86 6 83 8 80
        L45 10
        C46 7 48 6 50 6Z"
        fill="url(#${hiId})"></path>

      <!-- Exclamation -->
      <rect x="46" y="20" width="8" height="34" rx="3" fill="rgba(0,0,0,.78)"></rect>
      <circle cx="50" cy="66" r="5" fill="rgba(0,0,0,.78)"></circle>

      ${countText}
    </svg>
  `;
}

// Expose the rows for popup rendering (one tech at a time)
window.__triPopupData = window.__triPopupData || {};
window.__triPopupData[t.id] = {
  asr: { top: byReqTB.slice(), bottom: byReqTB.slice().reverse() },
  sold:{ top: byCloseTB.slice(), bottom: byCloseTB.slice().reverse() }
};

function tbRow(item, idx, mode){
  const metric = mode==="sold" ? item.close : item.req;
  const metricLbl = mode==="sold" ? "Sold%" : "ASR%";
  return `
    <div class="techRow pickRowFrame">
      <div class="techRowLeft">
        <span class="rankNum">${idx}.</span>
        <a href="javascript:void(0)" onclick="return window.jumpToService && window.jumpToService(${JSON.stringify(item.cat)})">${safe(item.label)}</a>
      </div>
      <div class="mini">${metricLbl} ${fmtPct(metric)}</div>
    </div>
  `;
}

function tbBlock(titleTop, titleBot, topArr, botArr, mode){
  const topHtml = topArr.length ? topArr.map((x,i)=>tbRow(x,i+1,mode)).join("") : `<div class="notice">No data</div>`;
  const botHtml = botArr.length ? botArr.map((x,i)=>tbRow(x,i+1,mode)).join("") : `<div class="notice">No data</div>`;

  const idBase = `${t.id}-${mode}`;
  const topBtn = `
    <button class="triPopBtn" type="button" data-tech="${t.id}" data-mode="${mode}" data-kind="top" aria-label="Open ${mode} top list"
      style="background:transparent;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center">
      ${warningTriSvg({color:"yellow", size:22, count: topArr.length, idSuffix: `${idBase}-top`})}
    </button>`;
  const botBtn = `
    <button class="triPopBtn" type="button" data-tech="${t.id}" data-mode="${mode}" data-kind="bottom" aria-label="Open ${mode} bottom list"
      style="background:transparent;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center">
      ${warningTriSvg({color:"red", size:22, count: botArr.length, idSuffix: `${idBase}-bot`})}
    </button>`;

  return `
    <div class="pickBox">
      <div class="pickMiniHdr pickMiniHdrTop">${safe(titleTop)} <span class="triIconWrap">${topBtn}</span></div>
      <div class="pickList">${topHtml}</div>
      <div class="pickMiniHdr pickMiniHdrBot" style="margin-top:10px">${safe(titleBot)} <span class="triIconWrap">${botBtn}</span></div>
      <div class="pickList">${botHtml}</div>
    </div>
  `;
}

function ensureTriPopupHandlers(){
  if(window.__triPopupHandlersBound) return;
  window.__triPopupHandlersBound = true;

  function closeTriPopup(){
    const el = document.getElementById("triListPopup");
    if(el) el.remove();
    document.removeEventListener("keydown", onEsc, true);
  }
  function onEsc(e){ if(e.key==="Escape") closeTriPopup(); }

  function openTriPopup(ev, btn){
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    closeTriPopup();

    const techId = btn.getAttribute("data-tech");
    const mode = btn.getAttribute("data-mode");
    const kind = btn.getAttribute("data-kind");

    const data = (window.__triPopupData||{})[techId];
    const arr = data && data[mode] && data[mode][kind] ? data[mode][kind] : [];
    const title = (mode==="sold") ? "SOLD" : "ASR";
    const band = (kind==="bottom") ? "red" : "yellow";

    const icon = warningTriSvg({color: band, size: 30, count: null, idSuffix: `pop-${techId}-${mode}-${kind}-${Date.now()}`});

    const rows = arr.length ? arr.map((it, i)=>{
      const metric = (mode==="sold") ? it.close : it.req;
      const metricLbl = (mode==="sold") ? "Sold%" : "ASR%";
      return `
        <button class="triPopRowBtn" type="button" data-cat="${encodeURIComponent(String(it.cat||\"\")).replace(/%/g, \"%25\")}"
          style="width:100%;text-align:left;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:8px 10px;color:inherit;display:flex;align-items:center;gap:10px;cursor:pointer">
          <span class="rankNum">${i+1}.</span>
          <span class="tbName" style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${safe(it.label)}</span>
          <span class="tbVal" style="margin-left:auto;color:rgba(255,255,255,.75);font-weight:900;white-space:nowrap">${metricLbl} ${fmtPct(metric)}</span>
        </button>
      `;
    }).join("") : `<div class="notice" style="padding:8px 2px">No services</div>`;

    const pop = document.createElement("div");
    pop.id = "triListPopup";
    pop.className = "triPopup";
    pop.innerHTML = `
      <div class="triPopHead">
        <div class="triPopTitle">${title} ${icon}</div>
        <button class="triPopClose" type="button" aria-label="Close">×</button>
      </div>
      <div class="triPopList">${rows}</div>
    `;
    document.body.appendChild(pop);

    // Position next to the icon/button
    const r = btn.getBoundingClientRect();
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

    // close button
    pop.querySelector(".triPopClose")?.addEventListener("click", closeTriPopup);

    // Row clicks -> jump and close
    pop.addEventListener("click", (e)=>{
      const row = e.target && e.target.closest ? e.target.closest(".triPopRowBtn") : null;
      if(!row) return;
      const catEnc = row.getAttribute("data-cat");
      const cat = catEnc ? decodeURIComponent(catEnc) : "";
      if(cat && window.jumpToService) window.jumpToService(cat);
      closeTriPopup();
    }, true);

    // click outside to close
    setTimeout(()=>{
      const onDoc = (e)=>{
        if(!pop.contains(e.target)) { document.removeEventListener("mousedown", onDoc, true); closeTriPopup(); }
      };
      document.addEventListener("mousedown", onDoc, true);
    }, 0);

    document.addEventListener("keydown", onEsc, true);
  }

  document.addEventListener("click", (e)=>{
    const btn = e.target && e.target.closest ? e.target.closest(".triPopBtn") : null;
    if(!btn) return;
    openTriPopup(e, btn);
  }, true);
}

ensureTriPopupHandlers();

  const top3Panel = `
    <div class="panel techPickPanel">
      <div class="phead" style="border-bottom:none;padding:12px">
        <div class="pickHdrRow">
          <div class="pickHdrLabel">ASR</div>
          <div class="pickHdrLabel">SOLD</div>
        </div>
        <div class="pickGrid2">
          ${tbBlock("Top 3 Most Recommended","Bottom 3 Least Recommended", topReqTB, botReqTB, "asr")}
          ${tbBlock("Top 3 Most Sold","Bottom 3 Least Sold", topCloseTB, botCloseTB, "sold")}
        </div>
      </div>
    </div>
  `;

  const headerWrap = `<div class="techHeaderWrap">${header}${top3Panel}</div>`;

  document.getElementById('app').innerHTML = `${headerWrap}${sectionsHtml}`;
  animateSvcGauges();
  initSectionToggles();

  const sel = document.getElementById('techFilter');
  if(sel){
    sel.addEventListener('change', ()=>{
      const v = sel.value || "total";
      const c = encodeURIComponent(compareBasis||"team");
      const fo = encodeURIComponent(focus||"asr");
      location.hash = `#/tech/${encodeURIComponent(t.id)}?filter=${encodeURIComponent(v)}&compare=${c}&focus=${fo}`;
    });
  }

  const compSel = document.getElementById('compareBasis');
  if(compSel){
    compSel.addEventListener('change', ()=>{
      const f = encodeURIComponent(filterKey);
      const c = encodeURIComponent(compSel.value||"team");
      const fo = encodeURIComponent(focus||"asr");
      location.hash = `#/tech/${encodeURIComponent(techId)}?filter=${f}&compare=${c}&focus=${fo}`;
    });
  }

  const focusSel = document.getElementById('techFocus');
  if(focusSel){
    focusSel.addEventListener('change', ()=>{
      const f = encodeURIComponent(filterKey);
      const c = encodeURIComponent(compareBasis||'team');
      const fo = encodeURIComponent(focusSel.value||'asr');
      location.hash = `#/tech/${encodeURIComponent(techId)}?filter=${f}&compare=${c}&focus=${fo}`;
    });
  }
}



// ===== Group pages (Maintenance / Fluids / Brakes & Tires) =====
const GROUPS = (() => {
  const obj = {};
  for (const sec of (DATA.sections || [])) {
    const key = String(sec.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    if (!key) continue;
    obj[key] = {
      label: String(sec.name || "").toUpperCase(),
      services: Array.isArray(sec.categories) ? sec.categories.slice() : []
    };
  }
  return obj;
})();

// Populate hamburger menu "ASR Categories" from DATA.sections (so it always includes every category).


window.renderTech = renderTech;
