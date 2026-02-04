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
  const m = hash.match(/\?([^#]+)/);
  if(m){
    const qs = new URLSearchParams(m[1]);
    const f = qs.get("f");
    const c = qs.get("c");
    const fo = qs.get("focus");
    if(f) filterKey = f;
    if(c) compareBasis = c;
    if(fo) focus = fo;
  }

  function mean(arr){
    const a = (arr||[]).filter(n=>Number.isFinite(n));
    return a.length ? a.reduce((x,y)=>x+y,0)/a.length : NaN;
  }

  function teamStatsFor(cat, teamName){
    const list = (DATA.techs||[]).filter(x=>x.team===teamName);
    const vals = list.map(x=>{
      const c = (x.categories && x.categories[cat]) ? x.categories[cat] : {};
      return Number(c.req);
    });
    const closes = list.map(x=>{
      const c = (x.categories && x.categories[cat]) ? x.categories[cat] : {};
      return Number(c.close);
    });
    return {
      avgReq: vals.filter(n=>Number.isFinite(n)).length ? mean(vals) : null,
      avgClose: closes.filter(n=>Number.isFinite(n)).length ? mean(closes) : null
    };
  }

  function storeStatsFor(cat){
    const list = (DATA.techs||[]);
    const vals = list.map(x=>{
      const c = (x.categories && x.categories[cat]) ? x.categories[cat] : {};
      return Number(c.req);
    });
    const closes = list.map(x=>{
      const c = (x.categories && x.categories[cat]) ? x.categories[cat] : {};
      return Number(c.close);
    });
    return {
      avgReq: vals.filter(n=>Number.isFinite(n)).length ? mean(vals) : null,
      avgClose: closes.filter(n=>Number.isFinite(n)).length ? mean(closes) : null
    };
  }

  function getTeamBenchmarks(cat, teamName){
    if(!cat) return null;
    const key = `${cat}__${teamName}`;
    const cache = (window.__benchCache ||= {});
    if(cache[key]) return cache[key];
    const v = teamStatsFor(cat, teamName);
    cache[key] = v;
    return v;
  }
  function getStoreBenchmarks(cat){
    if(!cat) return null;
    const key = `${cat}__STORE`;
    const cache = (window.__benchCache ||= {});
    if(cache[key]) return cache[key];
    const v = storeStatsFor(cat);
    cache[key] = v;
    return v;
  }

  function getGoal(cat, field){
    const g = (DATA.goals && DATA.goals[cat]) ? DATA.goals[cat] : {};
    const v = Number(g[field]);
    return Number.isFinite(v) ? v : NaN;
  }

  function techAsrPerRo(tech, fKey){
    if(!tech) return NaN;
    if(fKey==="total"){
      const asr = Number(tech.asr ?? 0);
      const ros = Number(tech.ros ?? 0);
      return ros>0 ? (asr/ros) : NaN;
    }
    // fallback
    return NaN;
  }

  function techSoldPct(tech, fKey){
    if(!tech) return NaN;
    if(fKey==="total"){
      const s = Number(tech.sold ?? 0);
      const a = Number(tech.asr ?? 0);
      return a>0 ? (s/a) : NaN;
    }
    return NaN;
  }

  // overall rank (kept from your build behavior)
  function overallRank(tech, mode){
    const arr = (DATA.techs||[]).filter(x=>x.team===tech.team);
    const list = arr.map(x=>{
      const val = (mode==="sold") ? techSoldPct(x,"total") : techAsrPerRo(x,"total");
      return { id:x.id, val };
    }).filter(x=>Number.isFinite(x.val))
      .sort((a,b)=>b.val-a.val);

    const idx = list.findIndex(x=>x.id===tech.id);
    return { rank: idx>=0 ? (idx+1) : null, total: list.length };
  }

  const overall = overallRank(t, focus==="sold" ? "sold" : "asr");
  const focusVal = (focus==="sold") ? fmtPct(techSoldPct(t, filterKey)) : fmt1(techAsrPerRo(t, filterKey),1);

  const appliedParts = [
    `Compare: ${(compareBasis==="store") ? "Store" : "Team"}`,
    `Focus: ${(focus==="sold") ? "Sold" : "ASR"}`
  ];

  const filters = `
    <div class="filtersRow">
      <div class="filterGroup">
        <label class="k">Compare</label>
        <select id="compareBasis">
          <option value="team" ${compareBasis==="team"?"selected":""}>Team</option>
          <option value="store" ${compareBasis==="store"?"selected":""}>Store</option>
        </select>
      </div>
      <div class="filterGroup">
        <label class="k">Focus</label>
        <select id="focusMode">
          <option value="asr" ${focus==="asr"?"selected":""}>ASR</option>
          <option value="sold" ${focus==="sold"?"selected":""}>Sold</option>
        </select>
      </div>
    </div>
  `;

  // --- Top / Bottom services (uses the same numbers shown in the tiles below) ---
  const allCats = Array.from(new Set((DATA.sections||[]).flatMap(s => (s.categories||[])).filter(Boolean)));

  const svcRows = allCats.map(cat=>{
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const req = Number(c.req);
    const close = Number(c.close);
    const ro = Number(c.ro ?? 0);
    const asr = Number(c.asr ?? 0);
    const sold = Number(c.sold ?? 0);
    return { cat, label: (typeof catLabel==="function" ? catLabel(cat) : String(cat)), req, close, ro, asr, sold };
  });

  const byReq = svcRows.filter(x=>Number.isFinite(x.req)).sort((a,b)=>b.req-a.req);
  const byClose = svcRows.filter(x=>Number.isFinite(x.close)).sort((a,b)=>b.close-a.close);

  const topReq = byReq.slice(0,3);
  const botReq = byReq.slice(-3).reverse();

  const topClose = byClose.slice(0,3);
  const botClose = byClose.slice(-3).reverse();

  // global jump helper for inline onclicks
  window.jumpToService = function(cat){
    const el = document.getElementById(`svc-${cat}`);
    if(!el) return false;
    el.scrollIntoView({ behavior:"smooth", block:"start" });
    el.classList.add("flashPick");
    setTimeout(()=>el.classList.remove("flashPick"), 900);
    return false;
  };

  function pickRowHtml(item, rank, mode){
    const metric = mode==="sold" ? item.close : item.req;
    const metricLbl = mode==="sold" ? "Sold%" : "ASR%";
    return `
      <div class="techRow pickRow">
        <div class="rowGrid pickGrid" style="grid-template-columns: 34px 1fr 78px;gap:10px">
          <div class="k" style="text-align:center;font-weight:1000;color:var(--muted)">${rank}</div>
          <div class="name">
            <a href="javascript:void(0)" onclick="return (window.jumpToService && window.jumpToService(${JSON.stringify(item.cat)}))">${safe(item.label)}</a>
          </div>
          <div style="text-align:right">
            <div class="val" style="font-size:13px">${fmtPct(metric)}</div>
            <div class="k" style="font-size:11px">${metricLbl}</div>
          </div>
        </div>
      </div>
    `;
  }

  function picksBlockHtml(mode){
    const top = mode==="sold" ? topClose : topReq;
    const bot = mode==="sold" ? botClose : botReq;

    const topHtml = top.length ? top.map((x,i)=>pickRowHtml(x,i+1,mode)).join("") : `<div class="notice" style="margin:8px 0">No data.</div>`;
    const botHtml = bot.length ? bot.map((x,i)=>pickRowHtml(x,i+1,mode)).join("") : `<div class="notice" style="margin:8px 0">No data.</div>`;

    return `
      <div class="pickCol">
        <div class="pickMiniHdr">Top 3 Most ${mode==="sold" ? "Sold" : "Recommended"}</div>
        <div class="pickList">${topHtml}</div>
        <div class="pickMiniHdr" style="margin-top:10px">Bottom 3 Least ${mode==="sold" ? "Sold" : "Recommended"}</div>
        <div class="pickList">${botHtml}</div>
      </div>
    `;
  }

  const top3Panel = `
    <div class="panel techPickPanel">
      <div class="phead" style="padding:12px">
        <div class="pickHdrRow">
          <div class="pickHdrLabel">ASR</div>
          <div class="pickHdrLabel">SOLD</div>
        </div>
        <div class="pickGrid2">
          <div class="pickBox">${picksBlockHtml("asr")}</div>
          <div class="pickBox">${picksBlockHtml("sold")}</div>
        </div>
      </div>
    </div>
  `;

  const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">

        <div class="techHeaderTopGrid">
          <div class="panel techNameHeaderBox">
            <div class="phead" style="padding:12px">
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
            </div>
          </div>

          ${top3Panel}
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

  function renderCategoryRectSafe(cat, compareBasis){
    const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
    const asrCount = Number(c.asr ?? 0);
    const soldCount = Number(c.sold ?? 0);
    const req = Number(c.req ?? NaN);
    const close = Number(c.close ?? NaN);
    const ro = Number(c.ro ?? 0);

    const tb = getTeamBenchmarks(cat, team) || {};
    const sb = getStoreBenchmarks(cat) || {};
    const basis = (compareBasis==="store") ? sb : tb;

    const goalReq = Number(getGoal(cat,"req"));
    const goalClose = Number(getGoal(cat,"close"));

    const cmpReq = Number(basis.avgReq);
    const cmpClose = Number(basis.avgClose);

    const pctCmpReq = (Number.isFinite(req) && Number.isFinite(cmpReq) && cmpReq>0) ? (req/cmpReq) : NaN;
    const pctCmpClose = (Number.isFinite(close) && Number.isFinite(cmpClose) && cmpClose>0) ? (close/cmpClose) : NaN;

    let hdrPct = pctCmpReq;
    if(focus==="sold") hdrPct = pctCmpClose;

    const gaugeHtml = Number.isFinite(hdrPct) ? `<div class="svcGaugeWrap" style="--sz:72px">${svcGauge(hdrPct, focus==="sold" ? "SOLD" : "ASR")}</div>` : `<div class="svcGaugeWrap" style="--sz:72px"></div>`;

    return `
      <div class="catCard" id="svc-${cat}">
        <div class="catHeader">
          <div class="svcGaugeWrap" style="--sz:72px">${gaugeHtml}</div>
          <div class="catTitle">
            <div class="name">${safe((typeof catLabel==="function"?catLabel(cat):cat))}</div>
            <div class="meta">${fmtInt(ro)} ROs • ${fmtInt(asrCount)} ASR • ${fmtInt(soldCount)} Sold</div>
          </div>
          <div class="catRank">
            <div class="val">${fmtPct(req)}</div>
            <div class="k">ASR%</div>
            <div class="val" style="margin-top:6px">${fmtPct(close)}</div>
            <div class="k">Sold%</div>
          </div>
        </div>
      </div>
    `;
  }

  function sectionStatsForTech(sec){
    const cats = (sec.categories||[]);
    const reqs = cats.map(cat=>{
      const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
      return Number(c.req);
    }).filter(n=>Number.isFinite(n));
    const closes = cats.map(cat=>{
      const c = (t.categories && t.categories[cat]) ? t.categories[cat] : {};
      return Number(c.close);
    }).filter(n=>Number.isFinite(n));
    return {
      avgReq: reqs.length ? mean(reqs) : NaN,
      avgClose: closes.length ? mean(closes) : NaN
    };
  }

  const sectionsHtml = (DATA.sections||[]).map(sec=>{
    const secStats = sectionStatsForTech(sec);
    const __cats = Array.from(new Set((sec.categories||[]).filter(Boolean)));
    const rows = __cats.map(cat=>renderCategoryRectSafe(cat, compareBasis)).join("");

    return `
      <div class="panel">
        <div class="phead">
          <div class="titleRow">
            <div>
              <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div class="h2 techH2">${safe(sec.name)}</div>
              </div>
              <div class="sub">${appliedParts.join(" • ")}</div>
            </div>
            <div class="secHdrRight">
              <div class="secHdrStats" style="text-align:right">
                <div class="big">${fmtPct(secStats.avgReq)}</div>
                <div class="tag">ASR%</div>
                <div style="margin-top:6px;text-align:right;color:var(--muted);font-weight:900;font-size:13px">Sold%: <b style="color:var(--text)">${fmtPct(secStats.avgClose)}</b></div>
              </div>
            </div>
          </div>
        </div>
        <div class="list">${rows ? `<div class="categoryGrid">${rows}</div>` : `<div class="notice">No categories found in this section.</div>`}</div>
      </div>
    `;
  }).join("");

  document.getElementById('app').innerHTML = `${header}${sectionsHtml}`;
  animateSvcGauges();

  const cmpSel = document.getElementById('compareBasis');
  const focSel = document.getElementById('focusMode');

  function updateHash(){
    const c = encodeURIComponent(compareBasis||"team");
    const fo = encodeURIComponent(focus||"asr");
    location.hash = `#/tech/${encodeURIComponent(t.id)}?c=${c}&focus=${fo}`;
  }

  if(cmpSel){
    cmpSel.addEventListener('change', ()=>{
      compareBasis = cmpSel.value || "team";
      updateHash();
    });
  }
  if(focSel){
    focSel.addEventListener('change', ()=>{
      focus = focSel.value || "asr";
      updateHash();
    });
  }
}

// ✅ Make sure the router can call it
window.renderTech = renderTech;
