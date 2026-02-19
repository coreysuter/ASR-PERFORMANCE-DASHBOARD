function renderSettingsHome(){
  document.getElementById("app").innerHTML = `
    <div class="panel">
      <div class="phead">
        <div class="titleRow">
          <div>
            <div class="h2">SETTINGS</div>
            <div class="sub"><a href="#/" style="text-decoration:none">← Back to dashboard</a></div>
          </div>
        </div>
        <div class="list" style="margin-top:10px;display:grid;gap:10px">
          <a class="menuLink" href="#/servicesDash" style="display:block;border-radius:14px;background:linear-gradient(180deg,var(--card),var(--card2));border:1px solid rgba(255,255,255,.08);padding:12px 14px;text-decoration:none;color:inherit">
            <div style="font-weight:1000;letter-spacing:.2px">Services Dashboard</div>
            <div class="sub" style="margin-top:4px">Category panels + service tiles with Focus/Goal/Team filters.</div>
          </a>
          <a class="menuLink" href="#/settings/goals" style="display:block;border-radius:14px;background:linear-gradient(180deg,var(--card),var(--card2));border:1px solid rgba(255,255,255,.08);padding:12px 14px;text-decoration:none;color:inherit">
            <div style="font-weight:1000;letter-spacing:.2px">Goals</div>
            <div class="sub" style="margin-top:4px">Set goal thresholds used on technician + service pages.</div>
          </a>
        </div>
      </div>
    </div>
  `;
}

function router(){
  const h = location.hash || "#/";
  document.body.classList.toggle("route-tech", h.startsWith("#/tech/"));

  if(h.startsWith("#/ros/")){
    const rest = h.slice("#/ros/".length);
    const techId = decodeURIComponent(rest.split("?")[0] || "");
    const qs = h.includes("?") ? h.split("?")[1] : "";
    let q="";
    if(qs){
      for(const part of qs.split("&")){
        const [k,v]=part.split("=");
        if(k==="q") q=decodeURIComponent(v||"");
      }
    }
    renderROListForTech(techId, q);
    return;
  }
  if(h.startsWith("#/group/")){
    const rest = h.slice("#/group/".length);
    const key = decodeURIComponent(rest.split("?")[0] || "");
    try{
      renderGroupPage(key);
    }catch(err){
      console.error(err);
      const msg = (err && (err.stack||err.message||String(err))) || "Unknown error";
      document.getElementById("app").innerHTML = `<div class="panel"><div class="h2">Could not load category page</div><div class="sub">${safe(msg)}</div></div>`;
    }
    return;
  }
  if(h.startsWith("#/settings/goals")){
    renderGoalsPage();
    return;
  }
  if(h==="#/settings" || h.startsWith("#/settings?")){
    renderSettingsHome();
    return;
  }
  if(h==="#/servicesDash" || h.startsWith("#/servicesDash?") || h==="#/servicesDashboard" || h.startsWith("#/servicesDashboard?")){
    window.renderServicesDashboard?.();
    return;
  }
  if(h==="#/services" || h.startsWith("#/services?") || h==="#/servicesHome" || h.startsWith("#/servicesHome?")){
    // Services main page
    window.renderServicesHome?.();
    return;
  }
  if(h.startsWith("#/goals")){
    // Backward compatibility
    location.hash = "#/settings/goals";
    return;
  }
  if(h.startsWith("#/tech/")){
    const rest = h.slice("#/tech/".length);
    const id = decodeURIComponent(rest.split("?")[0] || "");
    // renderTech is attached on window (some builds don't expose it as a bare global)
    window.renderTech?.(id);
    return;
  }
  window.renderMain?.();
}



function normalizeRouteHrefs(){
  try{
    document.querySelectorAll('a[href]').forEach(a=>{
      const h = a.getAttribute('href')||"";
      const hashIdx = h.indexOf('#/');
      if(hashIdx>=0) a.setAttribute('href', h.slice(hashIdx));
    });
  }catch(e){}
}
function safeRouter(){
  try { router();
renderMenuTechLists(); normalizeRouteHrefs();
  }
  catch(e){
    const app = document.getElementById('app');
    if(app){
      app.innerHTML = '<div class="panel"><div class="phead"><div class="h2">Error</div><div class="sub">A script error occurred while rendering this view.</div></div>'
        + '<pre style="white-space:pre-wrap;padding:12px;color:var(--muted)">'+ safe((e&&e.stack)||String(e)) +'</pre></div>';
    } else {
      console.error(e);
      alert((e&&e.message)||String(e));
    }
  }
}

function goTech(id){
  // Navigate to a technician page reliably even if the hash doesn't change.
  const target = `#/tech/${encodeURIComponent(String(id))}`;
  if(location.hash !== target) location.hash = target;
  safeRouter();
  return false;
}









// Close menu on navigation
window.addEventListener("hashchange", ()=>{
  const t = document.getElementById("menuToggle");
  if(t) t.checked = false;
});


// delegateMenuLinks: make sure menu links navigate + close menu
document.addEventListener("click",(e)=>{
  const a = e.target.closest && e.target.closest("a.menuLink");
  if(!a) return;
  const href = a.getAttribute("href") || "";
  if(href.startsWith("#/")){
    e.preventDefault();
    if(location.hash === href){
      // if already on that hash, force re-render
      try{ router(); }catch(_e){}
    }else{
      location.hash = href;
      // some browsers delay hashchange while overlays are closing; force a render tick
      setTimeout(()=>{ try{ router(); }catch(_e){} }, 0);
    }
    const t = document.getElementById("menuToggle");
    if(t) t.checked = false;
  }
});

window.addEventListener('hashchange', safeRouter);
populateAsrMenuLinks();
initTechSearchModal();
try { safeRouter(); }
catch(e){
  document.getElementById('app').innerHTML = '<div class="panel"><div class="phead"><div class="h2">Dashboard error</div><div class="sub">Send a screenshot of this error.</div></div><div class="list"><pre style="white-space:pre-wrap;color:var(--muted)">'+safe(e.stack||String(e))+'</pre></div></div>';
}


window.renderSettingsHome = renderSettingsHome;
