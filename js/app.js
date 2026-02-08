function parseHash(){
  const h = (location.hash || "#/").replace(/^#/, "");
  const [path, qs] = h.split("?");
  const parts = path.split("/").filter(Boolean);
  const query = {};
  if(qs){
    for(const kv of qs.split("&")){
      const [k,v] = kv.split("=");
      if(k) query[decodeURIComponent(k)] = decodeURIComponent(v||"");
    }
  }
  return { parts, query };
}

function route(){
  const { parts, query } = parseHash();
  try{
    if(parts.length===0){ window.renderMain?.(); window.animateSvcGauges?.(); return; }
    if(parts[0]==="tech" && parts[1]){ window.renderTech?.(parts[1]); window.animateSvcGauges?.(); return; }
    if(parts[0]==="services" && !parts[1]){ window.renderServicesHome?.(); return; }
    if(parts[0]==="services" && parts[1]){ window.renderGroupPage?.(parts[1]); window.animateSvcGauges?.(); return; }
    if(parts[0]==="settings" && parts[1]==="goals"){ window.renderGoalsPage?.(); return; }
    if(parts[0]==="settings"){ window.renderSettingsHome?.(); return; }
    if(parts[0]==="servicesHome"){ window.renderServicesHome?.(); return; }
    window.renderMain?.(); window.animateSvcGauges?.();
  }catch(e){
    const app = document.getElementById("app");
    if(app) app.innerHTML = `<div class="panel"><div class="phead"><div class="h2">Render error</div><div class="sub">${String(e)}</div></div></div>`;
    console.error(e);
  }
}
window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);
