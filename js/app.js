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

// Remove legacy static header that was used before the new in-app page headers.
// Old layout showed a top "Technician Performance Dashboard" title + duplicate menu button.
function removeLegacyTopHeader(){
  try{
    // Find the legacy title element.
    const titleEl = Array.from(document.querySelectorAll('h1, .h1, .title, .appTitle, .pageTitle'))
      .find(el => String(el.textContent||"").trim() === "Technician Performance Dashboard");
    if(!titleEl) return;

    // Prefer removing an obvious wrapper/header row.
    const wrapper = titleEl.closest('header') || titleEl.closest('.titleRow') || titleEl.parentElement;
    if(wrapper){
      // Remove any legacy "Generated:" line inside the same wrapper.
      Array.from(wrapper.querySelectorAll('*')).forEach(n=>{
        const txt = String(n.textContent||"").trim();
        if(/^Generated:\s*/i.test(txt)) n.remove();
      });

      // Remove any hamburger button inside the legacy wrapper.
      const hb = wrapper.querySelector('.hamburger');
      if(hb) hb.remove();

      // Finally remove the title itself (or wrapper if it's clearly just the legacy header).
      // If wrapper contains #app, do not remove wrapper.
      if(wrapper.querySelector('#app')){
        titleEl.remove();
      }else{
        wrapper.remove();
      }
    }else{
      titleEl.remove();
    }
  }catch(e){}
}

function route(){
  const { parts, query } = parseHash();
  try{
    removeLegacyTopHeader();
    if(parts.length===0){ window.renderMain?.(); window.animateSvcGauges?.(); return; }
    if(parts[0]==="tech" && parts[1]){ window.renderTech?.(parts[1]); window.animateSvcGauges?.(); return; }
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
