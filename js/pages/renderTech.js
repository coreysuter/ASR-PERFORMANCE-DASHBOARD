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
    const v = Number(g
