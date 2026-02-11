function renderMain(){
  // Ensure tech-detail-only layout styles don't leak onto the dashboard
  try{ document.body.classList.remove('route-tech'); }catch(e){}
  const app=document.getElementById('app');
  app.innerHTML = `<div class="teamsGrid">${renderTeam("EXPRESS", state.EXPRESS)}${renderTeam("KIA", state.KIA)}</div>`;

  document.querySelectorAll('[data-ctl]').forEach(el=>{
    const team=el.getAttribute('data-team');
    const ctl=el.getAttribute('data-ctl');
    const st=state[team];
    const apply=()=>{
      if(ctl==="filter") st.filterKey=el.value;
      if(ctl==="sort") st.sortBy=el.value;
      if(ctl==="search") st.search=el.value;
      renderMain();
    };
    el.addEventListener('change', apply);
    el.addEventListener('input', apply);
  });
}

function buildTeamCategoryStats(team){
  const techs = byTeam(team);
  const stats = {}; // cat -> {avgReq, topReq, topTech, avgClose}
  const cats = new Set();
  for(const t of techs){
    for(const k of Object.keys(t.categories||{})) cats.add(k);
  }
  for(const cat of cats){
    const reqs=[], closes=[];
    let topReq=-1, topTech=null;
    for(const t of techs){
      const c=t.categories?.[cat];
      const req=Number(c?.req);
      if(Number.isFinite(req)){
        reqs.push(req);
        if(req>topReq){ topReq=req; topTech=t.name; }
      }
      const cl=Number(c?.close);
      if(Number.isFinite(cl)) closes.push(cl);
    }
    stats[cat]={
      avgReq: reqs.length ? reqs.reduce((a,b)=>a+b,0)/reqs.length : null,
      topReq: topReq>=0 ? topReq : null,
      topTech,
      avgClose: closes.length ? closes.reduce((a,b)=>a+b,0)/closes.length : null,
    };
  }
  return stats;
}

function bandClass(val, base){
    if(!(Number.isFinite(val) && Number.isFinite(base) && base>0)) return "";
    const pct = val/base;
    if(pct>=0.80) return "bGreen";
    if(pct>=0.60) return "bYellow";
    return "bRed";
  }function renderROListForTech(techId, query){
  const t = (DATA.techs||[]).find(x=>x.id===techId);
  const ros = (DATA.ros_by_tech||{})[techId] || [];
  const q = (query||"").toLowerCase().trim();

  const filtered = !q ? ros : ros.filter(r=>{
    const a = (r.sold_text||"").toLowerCase();
    const b = (r.unsold_text||"").toLowerCase();
    return a.includes(q) || b.includes(q);
  });

  const rows = filtered.map(r=>`
    <div class="techRow">
      <div class="rowGrid" style="grid-template-columns: 1.2fr 1fr 1fr 1fr;gap:10px">
        <div class="cell"><span class="lbl">RO#</span><span class="val">${safe(r.ro||"—")}</span></div>
        <div class="cell"><span class="lbl">RO Date</span><span class="val">${safe(r.ro_date||"—")}</span></div>
        <div class="cell"><span class="lbl">Miles</span><span class="val">${fmtInt(r.miles)}</span></div>
        <div class="cell"><span class="lbl">Hrs</span><span class="val">${fmt1(r.hrs,1)}</span></div>
      </div>
      <div style="margin-top:8px;color:var(--muted);font-size:12px;line-height:1.35">
        <div><b>Sold:</b> ${safe(r.sold_text||"")}</div>
        <div><b>Unsold:</b> ${safe(r.unsold_text||"")}</div>
      </div>
    </div>
  `).join("");

  document.getElementById('app').innerHTML = `
    <div class="panel">
      <div class="phead">
        <div class="titleRow">
          <div>
            <div class="h2">ROs • ${safe(t?.name||"Unknown")}</div>
            <div class="sub"><a href="#/tech/${encodeURIComponent(techId)}" style="text-decoration:none">← Back to technician</a></div>
          </div>
          <div style="text-align:right">
            <div class="big">${filtered.length.toLocaleString()}</div>
            <div class="tag">Matching ROs</div>
          </div>
        </div>
        <div class="sub" style="margin-top:10px">Filter term: <b>${safe(query||"(none)")}</b> (matches Sold/Unsold lines text)</div>
      </div>
      <div class="list">${rows || `<div class="notice">No ROs matched this category term.</div>`}</div>
    </div>
  `;
}


window.renderMain = renderMain;
