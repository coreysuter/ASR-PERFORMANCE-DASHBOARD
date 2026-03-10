// ─────────────────────────────────────────────────────────────
//  One-time seed: pre-populate dealer + admin account
// ─────────────────────────────────────────────────────────────
(function _seed(){
  try{
    const DKEY = "dealerSettings_v1";
    const UKEY = "dealerUsers_v1";

    // Only seed dealer name if not already set
    const ds = JSON.parse(localStorage.getItem(DKEY)||"{}") || {};
    if(!ds.dealerName){
      ds.dealerName = "Kalidy Kia";
      localStorage.setItem(DKEY, JSON.stringify(ds));
    }

    // Only seed users if none exist yet
    const users = JSON.parse(localStorage.getItem(UKEY)||"[]") || [];
    if(!users.length){
      users.push({
        id:       "u_seed_admin",
        name:     "Corey Suter",
        email:    "corey.suter@kalidykia.com",
        password: "Kalidy2026!",
        role:     "administrator",
        team:     ""
      });
      localStorage.setItem(UKEY, JSON.stringify(users));
    }
  }catch(e){}
})();

// ─────────────────────────────────────────────────────────────
//  Storage keys
// ─────────────────────────────────────────────────────────────
const DEALER_LS_KEY = "dealerSettings_v1";
const USERS_LS_KEY  = "dealerUsers_v1";

// ─────────────────────────────────────────────────────────────
//  Storage helpers
// ─────────────────────────────────────────────────────────────
function _loadDealerSettings(){
  try{ return JSON.parse(localStorage.getItem(DEALER_LS_KEY) || "{}") || {}; }
  catch(e){ return {}; }
}
function _saveDealerSettings(obj){
  try{ localStorage.setItem(DEALER_LS_KEY, JSON.stringify(obj || {})); }
  catch(e){}
}
function _loadUsers(){
  try{ return JSON.parse(localStorage.getItem(USERS_LS_KEY) || "[]") || []; }
  catch(e){ return []; }
}
function _saveUsers(arr){
  try{ localStorage.setItem(USERS_LS_KEY, JSON.stringify(arr || [])); }
  catch(e){}
}
function _genUserId(){
  return "u_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,7);
}

// ─────────────────────────────────────────────────────────────
//  Public helpers used by other pages
// ─────────────────────────────────────────────────────────────
window.getDealerName = function(){
  const s = _loadDealerSettings();
  return (typeof s.dealerName==="string" && s.dealerName.trim()) ? s.dealerName.trim() : "";
};
window.getTeamLabel = function(rawTeam){
  const key = String(rawTeam||"").trim().toUpperCase();
  const map  = (_loadDealerSettings().teamLabels)||{};
  return (typeof map[key]==="string" && map[key].trim()) ? map[key].trim() : rawTeam;
};
window.getHideZeroRoTechs = function(){
  return _loadDealerSettings().hideZeroRoTechs === true;
};
window.getColorSettings = function(){
  const s = _loadDealerSettings();
  const cs = s.colorSettings || {};
  const mode = cs.mode || "3";
  if(mode === "4"){
    return {
      mode: "4",
      green:  typeof cs.green  === "number" ? cs.green  : 85,
      yellow: typeof cs.yellow === "number" ? cs.yellow : 70,
      orange: typeof cs.orange === "number" ? cs.orange : 50,
    };
  }
  return {
    mode: "3",
    green:  typeof cs.green  === "number" ? cs.green  : 80,
    yellow: typeof cs.yellow === "number" ? cs.yellow : 50,
  };
};
window.getColorBand = function(ratio){
  const cs = window.getColorSettings();
  const v  = (parseFloat(ratio) || 0) * 100;
  if(cs.mode === "4"){
    if(v >= cs.green)  return "green";
    if(v >= cs.yellow) return "yellow";
    if(v >= cs.orange) return "orange";
    return "red";
  }
  if(v >= cs.green)  return "green";
  if(v >= cs.yellow) return "yellow";
  return "red";
};
window.getCompClass = function(ratio){
  if(!Number.isFinite(ratio)) return "";
  const band = window.getColorBand(ratio);
  if(band === "green")  return " compG";
  if(band === "yellow") return " compY";
  if(band === "orange") return " compO";
  return " compR";
};
window.getDialClass = function(ratio){
  const band = window.getColorBand(ratio);
  if(band === "green")  return "gGreen";
  if(band === "yellow") return "gYellow";
  if(band === "orange") return "gOrange";
  return "gRed";
};
window.getPieFill = function(band){
  if(band === "green")  return "#1fcb6a";
  if(band === "yellow") return "#ffbf2f";
  if(band === "orange") return "#f97316";
  return "#ff4b4b";
};
window.getPerformanceColor = function(pct){
  const cs = window.getColorSettings();
  const v  = parseFloat(pct) || 0;
  if(cs.mode === "4"){
    if(v >= cs.green)  return "#22c55e";
    if(v >= cs.yellow) return "#eab308";
    if(v >= cs.orange) return "#f97316";
    return "#ef4444";
  }
  if(v >= cs.green)  return "#22c55e";
  if(v >= cs.yellow) return "#eab308";
  return "#ef4444";
};
window.getUsers = function(){ return _loadUsers(); };
window.getUsersByRole = function(role){
  return _loadUsers().filter(u => u.role === String(role||"").toLowerCase());
};

// ─────────────────────────────────────────────────────────────
//  Shared helpers
// ─────────────────────────────────────────────────────────────
function _esc(v){
  return String(v==null?"":v).replace(/[&<>"]/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

const USER_ROLES = [
  { value:"technician",    label:"Technician",    color:"#3b82f6", bg:"rgba(59,130,246,.15)"  },
  { value:"advisor",       label:"Advisor",       color:"#10b981", bg:"rgba(16,185,129,.15)"  },
  { value:"manager",       label:"Manager",       color:"#f59e0b", bg:"rgba(245,158,11,.15)"  },
  { value:"administrator", label:"Administrator", color:"#a855f7", bg:"rgba(168,85,247,.15)"  },
];
function _roleConf(v){ return USER_ROLES.find(r=>r.value===v) || {label:v||"Unknown",color:"#888",bg:"rgba(136,136,136,.15)"}; }
function _roleBadge(v){
  const r = _roleConf(v);
  return `<span style="display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;
    font-weight:700;letter-spacing:.3px;text-transform:uppercase;
    color:${r.color};background:${r.bg};border:1px solid ${r.color}33">${_esc(r.label)}</span>`;
}

function _buildToggle(id, checked){
  const on = !!checked;
  return `<label style="position:relative;display:inline-flex;align-items:center;cursor:pointer;gap:8px">
    <input id="${_esc(id)}" type="checkbox" ${on?"checked":""} style="position:absolute;opacity:0;width:0;height:0">
    <span class="dlrTrack" data-tid="${_esc(id)}" style="display:inline-block;width:40px;height:22px;
      border-radius:11px;background:${on?"var(--accent,#4f8ef7)":"rgba(255,255,255,.18)"};
      transition:background .2s;position:relative;border:1px solid rgba(255,255,255,.12)">
      <span class="dlrThumb" style="position:absolute;top:2px;left:${on?"19px":"2px"};
        width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;
        box-shadow:0 1px 3px rgba(0,0,0,.35)"></span>
    </span>
    <span class="dlrToggleLabel sub" data-tid="${_esc(id)}" style="margin:0">${on?"On":"Off"}</span>
  </label>`;
}
function _wireToggle(id, onChange){
  const inp = document.getElementById(id); if(!inp) return;
  inp.addEventListener("change", ()=>{
    const on = inp.checked;
    document.querySelectorAll(`.dlrTrack[data-tid="${id}"]`).forEach(el=>{
      el.style.background = on?"var(--accent,#4f8ef7)":"rgba(255,255,255,.18)";
      const thumb = el.querySelector(".dlrThumb"); if(thumb) thumb.style.left = on?"19px":"2px";
    });
    document.querySelectorAll(`.dlrToggleLabel[data-tid="${id}"]`).forEach(el=>{ el.textContent = on?"On":"Off"; });
    if(onChange) onChange(on);
  });
}

// ─────────────────────────────────────────────────────────────
//  Teams section — administrator only
// ─────────────────────────────────────────────────────────────
function _renderTeamsSection(container){
  const ds          = _loadDealerSettings();
  const customTeams = Array.isArray(ds.customTeams) ? ds.customTeams : [];
  const techTeams   = customTeams.filter(t=>t.type==="technicians");
  const advTeams    = customTeams.filter(t=>t.type==="advisors");

  const renderGroup = (label, list) => list.length ? list.map(t=>`
    <div class="teamRow" data-tid="${_esc(t.id)}" style="
      display:flex;align-items:center;gap:8px;
      padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06)">
      <span style="font-size:13px;font-weight:700;flex:1">${_esc(t.name)}</span>
      <button class="deleteTeamBtn menuClose" data-tid="${_esc(t.id)}"
        style="width:auto;padding:4px 11px;font-size:11px;font-weight:800;
        background:none;border:1px solid rgba(248,113,113,.35);color:#f87171;
        border-radius:8px;cursor:pointer">Del</button>
    </div>`).join("") : `
    <div style="padding:8px 0 4px;opacity:.35;font-size:12px;font-style:italic">
      No ${label.toLowerCase()} teams yet.
    </div>`;

  container.innerHTML = `
    <div class="svcSetSection" style="min-width:420px">
      <div class="svcSetSectionHdr">
        <div class="svcSetSectionHdrName">Teams</div>
        <button id="addTeamBtn" class="menuClose" style="
          margin-left:auto;width:auto;padding:5px 12px;font-size:12px;font-weight:800">
          + Add
        </button>
      </div>
      <div style="padding:10px 14px 12px">

        <!-- Add Team Form -->
        <div id="teamFormWrap" style="display:none;margin-bottom:12px">
          <div style="background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.025));
            border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:16px 16px 18px">
            <div style="font-weight:800;font-size:11px;letter-spacing:.6px;
              text-transform:uppercase;color:var(--muted,#94a3b8);margin-bottom:14px">Add Team</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
              <div>
                <div class="sub" style="font-size:11px;margin-bottom:4px">Team Name <span style="color:#f87171">*</span></div>
                <input id="tf_name" class="svcSetMiles" type="text" maxlength="40"
                  placeholder="e.g. Express" style="width:100%;box-sizing:border-box">
              </div>
              <div>
                <div class="sub" style="font-size:11px;margin-bottom:4px">Type <span style="color:#f87171">*</span></div>
                <select id="tf_type" class="svcSetMiles"
                  style="width:100%;box-sizing:border-box;cursor:pointer;background:#000;color:#fff">
                  <option value="">— select type —</option>
                  <option value="technicians">Technicians</option>
                  <option value="advisors">Advisors</option>
                </select>
              </div>
            </div>
            <div id="teamFormErr" style="display:none;color:#f87171;font-size:12px;margin-bottom:12px;
              padding:7px 10px;background:rgba(248,113,113,.08);
              border-radius:6px;border:1px solid rgba(248,113,113,.2)"></div>
            <div style="display:flex;gap:8px;align-items:center;justify-content:flex-end">
              <button id="teamFormCancel" class="menuClose"
                style="width:auto;padding:6px 14px;font-size:12px">Cancel</button>
              <button id="teamFormSave" style="
                background:var(--accent,#4f8ef7);border:none;border-radius:8px;
                color:#fff;font-weight:800;font-size:12px;padding:7px 18px;
                cursor:pointer;letter-spacing:.2px">Save Team</button>
            </div>
          </div>
        </div>

        <!-- Technicians group -->
        <div style="margin-bottom:10px">
          <div style="font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;
            color:rgba(234,240,255,.4);padding:6px 0 4px;
            border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:2px">Technicians</div>
          <div id="techTeamList">${renderGroup("Technicians", techTeams)}</div>
        </div>

        <!-- Advisors group -->
        <div>
          <div style="font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;
            color:rgba(234,240,255,.4);padding:6px 0 4px;
            border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:2px">Advisors</div>
          <div id="advTeamList">${renderGroup("Advisors", advTeams)}</div>
        </div>

      </div>
    </div>`;

  // ── Wire Add Team button ──────────────────────────────────
  container.querySelector("#addTeamBtn").addEventListener("click", ()=>{
    const fw = container.querySelector("#teamFormWrap");
    if(!fw) return;
    const opening = fw.style.display==="none";
    fw.style.display = opening ? "block" : "none";
    if(opening){
      container.querySelector("#tf_name").value = "";
      container.querySelector("#tf_type").value = "";
      const e=container.querySelector("#teamFormErr"); if(e){e.style.display="none";e.textContent="";}
    }
  });

  container.querySelector("#teamFormCancel").addEventListener("click", ()=>{
    container.querySelector("#teamFormWrap").style.display = "none";
    const e=container.querySelector("#teamFormErr"); if(e){e.style.display="none";e.textContent="";}
  });

  container.querySelector("#teamFormSave").addEventListener("click", ()=>{
    const name  = container.querySelector("#tf_name").value.trim();
    const type  = container.querySelector("#tf_type").value;
    const errEl = container.querySelector("#teamFormErr");
    const showErr = m=>{ errEl.textContent=m; errEl.style.display="block"; };
    errEl.style.display = "none";

    if(!name){ showErr("Team name is required."); return; }
    if(!type){ showErr("Please select a type."); return; }

    const ds2 = _loadDealerSettings();
    const list = Array.isArray(ds2.customTeams) ? ds2.customTeams : [];
    if(list.find(t=>t.name.toLowerCase()===name.toLowerCase())){
      showErr("A team with that name already exists."); return;
    }
    list.push({ id:"team_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,6), name, type });
    ds2.customTeams = list;
    _saveDealerSettings(ds2);

    _renderTeamsSection(container);
    // Refresh users section so team dropdown updates
    const uc = document.getElementById("usersSectionContainer");
    if(uc) _renderUsersSection(uc);
  });

  // ── Wire Delete buttons ───────────────────────────────────
  container.querySelectorAll(".deleteTeamBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const tid = btn.getAttribute("data-tid");
      const ds2 = _loadDealerSettings();
      ds2.customTeams = (Array.isArray(ds2.customTeams)?ds2.customTeams:[]).filter(t=>t.id!==tid);
      _saveDealerSettings(ds2);
      _renderTeamsSection(container);
      const uc = document.getElementById("usersSectionContainer");
      if(uc) _renderUsersSection(uc);
    });
  });
}

// ─────────────────────────────────────────────────────────────
//  Users section — administrator only
// ─────────────────────────────────────────────────────────────
function _renderUsersSection(container){
  const users = _loadUsers();
  const ROLE_ORDER = ["administrator","manager","advisor","technician"];
  const sorted = [...users].sort((a,b)=>{
    const ra=ROLE_ORDER.indexOf(a.role), rb=ROLE_ORDER.indexOf(b.role);
    if(ra!==rb) return (ra<0?99:ra)-(rb<0?99:rb);
    return (a.name||"").localeCompare(b.name||"");
  });

  // Build team options from custom teams storage, grouped by type
  const customTeams = _loadDealerSettings().customTeams || [];
  const techTeams = customTeams.filter(t=>t.type==="technicians");
  const advTeams  = customTeams.filter(t=>t.type==="advisors");
  const teamOptions = [
    ...(techTeams.length ? [`<optgroup label="Technicians">`,...techTeams.map(t=>`<option value="${_esc(t.name)}">${_esc(t.name)}</option>`),`</optgroup>`] : []),
    ...(advTeams.length  ? [`<optgroup label="Advisors">`,...advTeams.map(t=>`<option value="${_esc(t.name)}">${_esc(t.name)}</option>`),`</optgroup>`] : [])
  ].join("");
  const roleOptions = USER_ROLES.map(r=>`<option value="${_esc(r.value)}">${_esc(r.label)}</option>`).join("");

  const rowsHtml = sorted.length ? sorted.map(u=>`
    <div class="userRow" data-uid="${_esc(u.id)}" style="
      display:grid;grid-template-columns:1fr auto;gap:8px;
      padding:11px 0;border-bottom:1px solid rgba(255,255,255,.06)">
      <div style="min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
          <span style="font-weight:800;font-size:13px">${_esc(u.name||"—")}</span>
          ${_roleBadge(u.role)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:14px">
          <span class="sub" style="font-size:11px">
            <span style="opacity:.5">Email</span>&ensp;<span style="color:#eaf0ff">${_esc(u.email||"—")}</span>
          </span>
          <span class="sub" style="font-size:11px">
            <span style="opacity:.5">Emp #</span>&ensp;<span style="color:#eaf0ff">${_esc(u.empNum||"—")}</span>
          </span>
          <span class="sub" style="font-size:11px">
            <span style="opacity:.5">Team</span>&ensp;<span style="color:#eaf0ff">${_esc(u.team||"—")}</span>
          </span>
          <span class="sub" style="font-size:11px;display:inline-flex;align-items:center;gap:4px">
            <span style="opacity:.5">Password</span>
            <span class="pwMask" data-uid="${_esc(u.id)}" style="
              color:#eaf0ff;letter-spacing:2px;font-family:monospace">••••••••</span>
            <button class="togglePwView" data-uid="${_esc(u.id)}" style="
              background:none;border:none;cursor:pointer;
              color:var(--muted,#94a3b8);font-size:10px;font-weight:700;
              padding:0;text-decoration:underline">Show</button>
          </span>
        </div>
      </div>
      <div style="display:flex;gap:6px;align-items:flex-start;padding-top:2px;flex-shrink:0">
        <button class="editUserBtn menuClose" data-uid="${_esc(u.id)}"
          style="width:auto;padding:4px 11px;font-size:11px">Edit</button>
        <button class="deleteUserBtn menuClose" data-uid="${_esc(u.id)}" style="
          width:auto;padding:4px 11px;font-size:11px;font-weight:800;
          background:none;border:1px solid rgba(248,113,113,.35);color:#f87171;border-radius:8px;cursor:pointer">Del</button>
      </div>
    </div>`).join("") : `
    <div class="sub" style="padding:18px 0;text-align:center;opacity:.45">
      No users yet — click <strong style="opacity:.9">+ Add User</strong> to get started.
    </div>`;

  const formHtml = `
    <div id="userFormWrap" style="display:none;margin-bottom:8px">
      <div style="background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.025));
        border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:16px 16px 18px">
        <div id="userFormTitle" style="font-weight:800;font-size:11px;letter-spacing:.6px;
          text-transform:uppercase;color:var(--muted,#94a3b8);margin-bottom:14px">Add User</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Full Name <span style="color:#f87171">*</span></div>
            <input id="uf_name" class="svcSetMiles" type="text" maxlength="80"
              placeholder="e.g. John Smith" style="width:100%;box-sizing:border-box">
          </div>
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">
              Email <span style="color:#f87171">*</span>
              <span style="opacity:.55"> — this is their username</span>
            </div>
            <input id="uf_email" class="svcSetMiles" type="email" maxlength="120"
              placeholder="e.g. john@dealership.com" style="width:100%;box-sizing:border-box">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Password <span style="color:#f87171">*</span></div>
            <div style="position:relative">
              <input id="uf_password" class="svcSetMiles" type="password" maxlength="128"
                placeholder="Set a password" autocomplete="new-password"
                style="width:100%;box-sizing:border-box;padding-right:52px">
              <button id="uf_pwToggle" type="button" style="
                position:absolute;right:8px;top:50%;transform:translateY(-50%);
                background:none;border:none;cursor:pointer;
                color:var(--muted,#94a3b8);font-size:11px;font-weight:700;
                padding:0;text-decoration:underline;white-space:nowrap">Show</button>
            </div>
          </div>
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Employee #</div>
            <input id="uf_empNum" class="svcSetMiles" type="text" maxlength="30"
              placeholder="e.g. 10042" style="width:100%;box-sizing:border-box">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Role <span style="color:#f87171">*</span></div>
            <select id="uf_role" class="svcSetMiles" style="width:100%;box-sizing:border-box;cursor:pointer;background:#000;color:#fff">
              <option value="">— select role —</option>
              ${roleOptions}
            </select>
          </div>
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Team</div>
            <select id="uf_team" class="svcSetMiles" style="width:100%;box-sizing:border-box;cursor:pointer;background:#000;color:#fff">
              <option value="">— no team —</option>
              ${teamOptions}
            </select>
          </div>
        </div>
        <div id="userFormErr" style="display:none;color:#f87171;font-size:12px;margin-bottom:12px;
          padding:7px 10px;background:rgba(248,113,113,.08);
          border-radius:6px;border:1px solid rgba(248,113,113,.2)"></div>
        <div style="display:flex;gap:8px;align-items:center;justify-content:flex-end">
          <button id="userFormCancel" class="menuClose" style="width:auto;padding:6px 14px;font-size:12px">Cancel</button>
          <button id="userFormSave" style="
            background:var(--accent,#4f8ef7);border:none;border-radius:8px;
            color:#fff;font-weight:800;font-size:12px;padding:7px 18px;
            cursor:pointer;letter-spacing:.2px">Save User</button>
        </div>
        <input type="hidden" id="uf_editId" value="">
      </div>
    </div>`;

  container.innerHTML = `
    <div class="svcSetSection" style="margin-top:0">
      <div class="svcSetSectionHdr">
        <div class="svcSetSectionHdrName">Users</div>
        <button id="addUserBtn" class="menuClose" style="
          margin-left:auto;width:auto;padding:5px 12px;font-size:12px;font-weight:800">
          + Add
        </button>
      </div>
      <div style="padding:10px 14px 4px">
        ${formHtml}
        <div id="userList">${rowsHtml}</div>
      </div>
    </div>`;

  const getFormWrap = ()=>container.querySelector("#userFormWrap");
  const getEditId   = ()=>(container.querySelector("#uf_editId")||{}).value||"";
  const clearErr    = ()=>{ const e=container.querySelector("#userFormErr"); if(e){e.style.display="none";e.textContent="";} };
  const showErr     = m=>{ const e=container.querySelector("#userFormErr"); if(e){e.style.display="block";e.textContent=m;} };

  function openForm(user){
    const fw=getFormWrap(); if(!fw) return;
    fw.style.display="block";
    container.querySelector("#uf_name").value     = user?(user.name   ||""):"";
    container.querySelector("#uf_email").value    = user?(user.email  ||""):"";
    container.querySelector("#uf_password").value = user?(user.password||""):"";
    container.querySelector("#uf_empNum").value   = user?(user.empNum ||""):"";
    container.querySelector("#uf_role").value     = user?(user.role   ||""):"";
    container.querySelector("#uf_team").value     = user?(user.team   ||""):"";
    container.querySelector("#uf_editId").value   = user?user.id:"";
    container.querySelector("#userFormTitle").textContent = user?"Edit User":"Add User";
    const pi=container.querySelector("#uf_password"), pt=container.querySelector("#uf_pwToggle");
    if(pi) pi.type="password"; if(pt) pt.textContent="Show";
    clearErr();
    container.querySelector("#uf_name").focus();
    fw.scrollIntoView({behavior:"smooth",block:"nearest"});
  }
  function closeForm(){ const fw=getFormWrap(); if(fw) fw.style.display="none"; clearErr(); }

  container.querySelector("#addUserBtn").addEventListener("click", ()=>openForm(null));
  container.querySelector("#userFormCancel").addEventListener("click", closeForm);

  const pwI=container.querySelector("#uf_password"), pwT=container.querySelector("#uf_pwToggle");
  if(pwT&&pwI) pwT.addEventListener("click",()=>{ const h=pwI.type==="password"; pwI.type=h?"text":"password"; pwT.textContent=h?"Hide":"Show"; });

  container.querySelector("#userFormSave").addEventListener("click", ()=>{
    const name     = container.querySelector("#uf_name").value.trim();
    const email    = container.querySelector("#uf_email").value.trim().toLowerCase();
    const password = container.querySelector("#uf_password").value;
    const empNum   = container.querySelector("#uf_empNum").value.trim();
    const role     = container.querySelector("#uf_role").value;
    const team     = container.querySelector("#uf_team").value;
    const editId   = getEditId();

    if(!name)    { showErr("Full name is required."); return; }
    if(!email)   { showErr("Email address is required."); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showErr("Please enter a valid email address."); return; }
    if(!password){ showErr("Password is required."); return; }
    if(password.length < 6){ showErr("Password must be at least 6 characters."); return; }
    if(!role)    { showErr("Please select a role."); return; }

    const users = _loadUsers();
    const dupe  = users.find(u=>u.email===email && u.id!==editId);
    if(dupe){ showErr("A user with that email address already exists."); return; }

    if(editId){
      const idx = users.findIndex(u=>u.id===editId);
      if(idx>-1) users[idx] = {...users[idx], name, email, password, empNum, role, team};
    } else {
      users.push({id:_genUserId(), name, email, password, empNum, role, team});
    }
    _saveUsers(users);
    closeForm();
    _renderUsersSection(container);
  });

  container.querySelectorAll(".editUserBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const user = _loadUsers().find(u=>u.id===btn.getAttribute("data-uid"));
      if(user) openForm(user);
    });
  });

  container.querySelectorAll(".deleteUserBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const uid  = btn.getAttribute("data-uid");
      const user = _loadUsers().find(u=>u.id===uid);
      if(!user) return;
      if(!confirm(`Delete "${user.name}" (${user.email})?\nThis cannot be undone.`)) return;
      _saveUsers(_loadUsers().filter(u=>u.id!==uid));
      _renderUsersSection(container);
    });
  });

  container.querySelectorAll(".togglePwView").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const uid  = btn.getAttribute("data-uid");
      const mask = container.querySelector(`.pwMask[data-uid="${uid}"]`);
      const user = _loadUsers().find(u=>u.id===uid);
      if(!user||!mask) return;
      if(btn.textContent==="Show"){ mask.textContent=user.password||"—"; mask.style.letterSpacing="normal"; btn.textContent="Hide"; }
      else { mask.textContent="••••••••"; mask.style.letterSpacing="2px"; btn.textContent="Show"; }
    });
  });
}


// ─────────────────────────────────────────────────────────────
//  Main page renderer
// ─────────────────────────────────────────────────────────────
function renderDealerSettingsPage(){

  // ── Auth gate ────────────────────────────────────────────
  if(window.requireLogin && window.requireLogin()) return;

  const session = window.getSession ? window.getSession() : null;
  const role    = (session && session.role) || "";
  const isAdmin          = role === "administrator";
  const canManageSettings = isAdmin || role === "manager";
  const canManageUsers    = isAdmin;

  const app = document.getElementById("app");

  const teams = (typeof DATA!=="undefined" && Array.isArray(DATA.teams))
    ? DATA.teams.map(t=>String(t||"").trim().toUpperCase()).filter(Boolean)
    : [];

  const meta        = (typeof DATA!=="undefined" && DATA.meta) ? DATA.meta : {};
  const sourceFile  = meta.file||"";
  const generatedOn = meta.generated_on||"";
  const s           = _loadDealerSettings();

  // ── Logged-in user badge ─────────────────────────────────
  const r = session ? _roleConf(session.role) : {color:"#888",bg:"rgba(136,136,136,.15)",label:""};
  const sessionBadge = session ? `
    <div style="display:flex;align-items:center;gap:8px;
      padding:7px 12px;border-radius:12px;
      background:${r.bg};border:1px solid ${r.color}33;flex-shrink:0">
      <div style="width:28px;height:28px;border-radius:8px;
        background:${r.color}22;border:1px solid ${r.color}44;
        display:flex;align-items:center;justify-content:center;
        font-size:13px;font-weight:900;color:${r.color}">
        ${_esc((session.name||"?")[0].toUpperCase())}
      </div>
      <div>
        <div style="font-size:12px;font-weight:800;white-space:nowrap">${_esc(session.name||"")}</div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;
          letter-spacing:.4px;color:${r.color}">${_esc(r.label||role)}</div>
      </div>
    </div>` : "";

  const accessDenied = title=>`
    <div class="svcSetSection" style="margin-top:20px">
      <div class="svcSetSectionHdr"><div class="svcSetSectionHdrName">${title}</div></div>
      <div style="padding:14px;display:flex;align-items:center;gap:10px;
        color:rgba(234,240,255,.35);font-size:13px">
        <span style="font-size:18px">🔒</span>
        <span>Requires <strong style="color:rgba(234,240,255,.55)">Administrator</strong> access.</span>
      </div>
    </div>`;

  app.innerHTML = `
    <div class="techNotchStage" style="position:relative;width:100%;overflow:visible;">

      <div class="panel techMenuFloat" style="
        position:absolute;left:-80px;top:4px;width:72px;height:72px;
        display:flex;align-items:center;justify-content:center;
        border-radius:14px;z-index:2;">
        <label for="menuToggle" class="hamburgerMini" aria-label="Menu" style="
          font-size:2.2em;line-height:1;display:flex;align-items:center;
          justify-content:center;cursor:pointer;
          color:inherit;user-select:none;">☰</label>
      </div>

      <div class="panel svcSetPanel" style="min-width:0;width:100%;">
        <div class="phead">

          <div class="titleRow" style="align-items:center">
            <div>
              <div class="h2" style="font-size:33px;letter-spacing:.2px">DEALER SETTINGS</div>
            </div>
            ${sessionBadge}
          </div>

          ${canManageSettings ? `
          <!-- Dealership -->
          <div class="svcSetSection" style="margin-top:20px;min-width:420px">
            <div class="svcSetSectionHdr"><div class="svcSetSectionHdrName">Dealership</div></div>
            <div style="padding:10px 14px 14px">
              <!-- Display row -->
              <div id="dealerNameDisplay" style="display:flex;align-items:center;gap:10px">
                <span id="dealerNameValue" style="font-size:15px;font-weight:700;flex:1">
                  ${_esc(s.dealerName||"") || `<span style="opacity:.35;font-style:italic">Not set</span>`}
                </span>
                <button id="dealerNameEditBtn" class="menuClose"
                  style="width:auto;padding:4px 11px;font-size:11px;font-weight:800;flex-shrink:0">
                  Edit
                </button>
              </div>
              <!-- Edit row (hidden by default) -->
              <div id="dealerNameEditRow" style="display:none;align-items:center;gap:8px">
                <input id="dealerNameInput" class="svcSetMiles" type="text" maxlength="80"
                  placeholder="e.g. Metro Kia of Springfield"
                  value="${_esc(s.dealerName||"")}"
                  style="flex:1;min-width:0;box-sizing:border-box">
                <button id="dealerNameSaveBtn" style="
                  background:var(--accent,#4f8ef7);border:none;border-radius:8px;
                  color:#fff;font-weight:800;font-size:11px;padding:5px 13px;
                  cursor:pointer;white-space:nowrap;flex-shrink:0">Save</button>
                <button id="dealerNameCancelBtn" class="menuClose"
                  style="width:auto;padding:4px 11px;font-size:11px;font-weight:800;flex-shrink:0">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Teams -->
          <div id="teamsSectionContainer" style="margin-top:20px"></div>

          <!-- Color Settings -->
          <div class="svcSetSection" style="margin-top:20px">
            <div class="svcSetSectionHdr"><div class="svcSetSectionHdrName">Color Settings</div></div>
            <div style="padding:12px 14px">
              <div class="notice" style="padding:0 0 12px 0;margin:0">
                Configure colors and thresholds for performance graphics.
              </div>
              <div style="display:flex;gap:10px;margin-bottom:18px">
                ${(()=>{
                  const cs = s.colorSettings||{};
                  const mode = cs.mode||"3";
                  return ["3","4"].map(m=>`
                    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;
                      padding:9px 16px;border-radius:12px;flex:1;
                      border:1px solid ${mode===m?"rgba(79,142,247,.5)":"rgba(255,255,255,.1)"};
                      background:${mode===m?"rgba(79,142,247,.1)":"rgba(255,255,255,.03)"};
                      transition:all .15s">
                      <input type="radio" name="colorMode" value="${m}"
                        ${mode===m?"checked":""}
                        style="accent-color:var(--accent,#4f8ef7);width:14px;height:14px;flex-shrink:0">
                      <div>
                        <div style="font-weight:800;font-size:13px">${m}-Color Mode</div>
                        <div class="sub" style="font-size:11px;margin:0">
                          ${m==="3"
                            ? '<span style="color:#22c55e">●</span> Green &nbsp;<span style="color:#eab308">●</span> Yellow &nbsp;<span style="color:#ef4444">●</span> Red'
                            : '<span style="color:#22c55e">●</span> Green &nbsp;<span style="color:#eab308">●</span> Yellow &nbsp;<span style="color:#f97316">●</span> Orange &nbsp;<span style="color:#ef4444">●</span> Red'}
                        </div>
                      </div>
                    </label>`).join("");
                })()}
              </div>
              <div id="colorThresholdInputs">
                ${(()=>{
                  const cs = s.colorSettings||{};
                  const mode = cs.mode||"3";
                  const green  = typeof cs.green==="number"  ? cs.green  : (mode==="4"?85:80);
                  const yellow = typeof cs.yellow==="number" ? cs.yellow : (mode==="4"?70:50);
                  const orange = typeof cs.orange==="number" ? cs.orange : 50;
                  const fieldHtml = (id,label,color,val,hint)=>`
                    <div>
                      <div class="sub" style="font-size:11px;margin-bottom:5px;display:flex;align-items:center;gap:6px">
                        <span style="color:${color};font-size:14px">●</span>
                        <span>${label}</span>
                        <span style="opacity:.45">— ${hint}</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:6px">
                        <input id="${id}" class="svcSetMiles colorThreshInp" type="number"
                          min="1" max="100" value="${val}"
                          style="width:72px;box-sizing:border-box;text-align:center">
                        <span class="sub" style="margin:0;font-size:12px">%</span>
                      </div>
                    </div>`;
                  const autoField = (label,color,hint)=>`
                    <div style="flex:1;min-width:120px">
                      <div class="sub" style="font-size:11px;margin-bottom:5px;display:flex;align-items:center;gap:6px">
                        <span style="color:${color};font-size:14px">●</span>
                        <span>${label}</span>
                        <span style="opacity:.45">— ${hint}</span>
                      </div>
                      <div style="padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.08);
                        background:rgba(0,0,0,.2);font-size:12px;color:rgba(234,240,255,.35);
                        width:72px;text-align:center">auto</div>
                    </div>`;
                  if(mode==="4") return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">
                    ${fieldHtml("clr_green","Green","#22c55e",green,"at or above = green")}
                    ${fieldHtml("clr_yellow","Yellow","#eab308",yellow,"at or above = yellow")}
                    ${fieldHtml("clr_orange","Orange","#f97316",orange,"at or above = orange")}
                    ${autoField("Red","#ef4444","below orange threshold")}
                  </div>`;
                  return `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">
                    ${fieldHtml("clr_green","Green","#22c55e",green,"at or above = green")}
                    ${fieldHtml("clr_yellow","Yellow","#eab308",yellow,"at or above = yellow")}
                    ${autoField("Red","#ef4444","below yellow threshold")}
                  </div>`;
                })()}
              </div>
              <div style="margin-top:16px">
                <div class="sub" style="font-size:11px;margin-bottom:6px;opacity:.55">Preview</div>
                <div id="colorPreviewBar" style="display:flex;border-radius:10px;overflow:hidden;height:22px;gap:1px"></div>
              </div>
            </div>
          </div>

          <!-- Users (admin) + Roster side by side -->
          <div style="margin-top:20px">
            <div id="usersSectionContainer" style="min-width:0">
              ${canManageUsers ? "" : accessDenied("Users")}
            </div>
          </div>

          <!-- Bottom controls -->
          <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;
            margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">
            <div id="dealerSavedMsg" class="sub" style="margin:0;opacity:.8;display:none">✓ Saved</div>
          </div>

          ` : `
          <!-- Insufficient role notice -->
          <div style="margin-top:20px;padding:16px;border-radius:14px;
            border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.12);
            color:rgba(234,240,255,.35);font-size:13px;display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🔒</span>
            <span>Full dealer settings require
              <strong style="color:rgba(234,240,255,.5)">Manager</strong> or
              <strong style="color:rgba(234,240,255,.5)">Administrator</strong> access.
            </span>
          </div>
          `}

          ${sourceFile ? `
          <div class="notice" style="margin-top:16px;padding:0;opacity:.35;font-size:11px">
            Source: ${_esc(sourceFile)}${generatedOn?" · Generated "+_esc(generatedOn):""}
          </div>` : ""}

        </div>
      </div>
    </div>`;



  // ── Teams ────────────────────────────────────────────────
  if(canManageUsers){
    const tc = app.querySelector("#teamsSectionContainer");
    if(tc) _renderTeamsSection(tc);
  }

  // ── Users & Roster ───────────────────────────────────────
  if(canManageUsers){
    const uc = app.querySelector("#usersSectionContainer");
    if(uc) _renderUsersSection(uc);
  }

  if(!canManageSettings) return;

  // ── Flash saved ──────────────────────────────────────────
  function flashSaved(){
    const el = document.getElementById("dealerSavedMsg"); if(!el) return;
    el.style.display="block"; el.textContent="✓ Saved";
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(()=>{ el.style.display="none"; }, 900);
  }

  // ── Persist settings ─────────────────────────────────────
  function persist(){
    const cur = _loadDealerSettings();

    // Color settings
    const modeEl = app.querySelector('input[name="colorMode"]:checked');
    const mode   = modeEl ? modeEl.value : "3";
    const cs     = { mode };
    const gEl = document.getElementById("clr_green"),  yEl = document.getElementById("clr_yellow"),
          oEl = document.getElementById("clr_orange");
    if(gEl) cs.green  = Math.min(100, Math.max(1, parseInt(gEl.value)||80));
    if(yEl) cs.yellow = Math.min(100, Math.max(1, parseInt(yEl.value)||50));
    if(oEl) cs.orange = Math.min(100, Math.max(1, parseInt(oEl.value)||50));
    cur.colorSettings = cs;

    _saveDealerSettings(cur);
    flashSaved();
    _updateColorPreview();
  }

  // ── Dealership Name edit/save/cancel ────────────────────
  const _dnEditBtn   = app.querySelector("#dealerNameEditBtn");
  const _dnSaveBtn   = app.querySelector("#dealerNameSaveBtn");
  const _dnCancelBtn = app.querySelector("#dealerNameCancelBtn");
  const _dnDisplay   = app.querySelector("#dealerNameDisplay");
  const _dnEditRow   = app.querySelector("#dealerNameEditRow");
  const _dnValue     = app.querySelector("#dealerNameValue");
  const _dnInput     = app.querySelector("#dealerNameInput");

  if(_dnEditBtn) _dnEditBtn.addEventListener("click", ()=>{
    _dnDisplay.style.display = "none";
    _dnEditRow.style.display = "flex";
    if(_dnInput){ _dnInput.value = _loadDealerSettings().dealerName||""; _dnInput.focus(); }
  });
  if(_dnCancelBtn) _dnCancelBtn.addEventListener("click", ()=>{
    _dnDisplay.style.display = "flex";
    _dnEditRow.style.display = "none";
  });
  if(_dnSaveBtn) _dnSaveBtn.addEventListener("click", ()=>{
    const val = _dnInput ? _dnInput.value.trim() : "";
    const cur = _loadDealerSettings();
    cur.dealerName = val;
    _saveDealerSettings(cur);
    if(_dnValue) _dnValue.innerHTML = val ? _esc(val) : `<span style="opacity:.35;font-style:italic">Not set</span>`;
    _dnDisplay.style.display = "flex";
    _dnEditRow.style.display = "none";
    flashSaved();
  });


  // ── Color mode radio buttons ──────────────────────────
  app.querySelectorAll('input[name="colorMode"]').forEach(radio=>{
    radio.addEventListener("change", ()=>{
      const mode = radio.value;
      const cur  = _loadDealerSettings();
      const cs   = cur.colorSettings||{};
      const green  = typeof cs.green==="number"  ? cs.green  : (mode==="4"?85:80);
      const yellow = typeof cs.yellow==="number" ? cs.yellow : (mode==="4"?70:50);
      const orange = typeof cs.orange==="number" ? cs.orange : 50;
      const fieldHtml = (id,label,color,val,hint)=>`
        <div>
          <div class="sub" style="font-size:11px;margin-bottom:5px;display:flex;align-items:center;gap:6px">
            <span style="color:${color};font-size:14px">●</span>
            <span>${label}</span>
            <span style="opacity:.45">— ${hint}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            <input id="${id}" class="svcSetMiles colorThreshInp" type="number"
              min="1" max="100" value="${val}"
              style="width:72px;box-sizing:border-box;text-align:center">
            <span class="sub" style="margin:0;font-size:12px">%</span>
          </div>
        </div>`;
      const autoField = (label,color,hint)=>`
        <div style="flex:1;min-width:120px">
          <div class="sub" style="font-size:11px;margin-bottom:5px;display:flex;align-items:center;gap:6px">
            <span style="color:${color};font-size:14px">●</span>
            <span>${label}</span>
            <span style="opacity:.45">— ${hint}</span>
          </div>
          <div style="padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.08);
            background:rgba(0,0,0,.2);font-size:12px;color:rgba(234,240,255,.35);
            width:72px;text-align:center">auto</div>
        </div>`;
      const wrap = document.getElementById("colorThresholdInputs");
      if(!wrap) return;
      if(mode==="4"){
        wrap.innerHTML = `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">
          ${fieldHtml("clr_green","Green","#22c55e",green,"at or above = green")}
          ${fieldHtml("clr_yellow","Yellow","#eab308",yellow,"at or above = yellow")}
          ${fieldHtml("clr_orange","Orange","#f97316",orange,"at or above = orange")}
          ${autoField("Red","#ef4444","below orange threshold")}
        </div>`;
      } else {
        wrap.innerHTML = `<div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">
          ${fieldHtml("clr_green","Green","#22c55e",green,"at or above = green")}
          ${fieldHtml("clr_yellow","Yellow","#eab308",yellow,"at or above = yellow")}
          ${autoField("Red","#ef4444","below yellow threshold")}
        </div>`;
      }
      wrap.querySelectorAll(".colorThreshInp").forEach(inp=>inp.addEventListener("input", persist));
      app.querySelectorAll('input[name="colorMode"]').forEach(r=>{
        const card = r.closest("label");
        if(!card) return;
        const active = r.value===mode;
        card.style.border     = active?"1px solid rgba(79,142,247,.5)":"1px solid rgba(255,255,255,.1)";
        card.style.background = active?"rgba(79,142,247,.1)":"rgba(255,255,255,.03)";
      });
      persist();
    });
  });

  // Wire threshold inputs
  app.querySelectorAll(".colorThreshInp").forEach(inp=>inp.addEventListener("input", persist));

  // ── Color preview bar ─────────────────────────────────
  function _updateColorPreview(){
    const bar = document.getElementById("colorPreviewBar"); if(!bar) return;
    const cs  = window.getColorSettings();
    let segs;
    if(cs.mode==="4"){
      segs = [
        {color:"#22c55e", width:100-cs.green,              label:`≥${cs.green}%`},
        {color:"#eab308", width:cs.green-cs.yellow,        label:`${cs.yellow}–${cs.green-1}%`},
        {color:"#f97316", width:cs.yellow-cs.orange,       label:`${cs.orange}–${cs.yellow-1}%`},
        {color:"#ef4444", width:cs.orange,                 label:`<${cs.orange}%`},
      ];
    } else {
      segs = [
        {color:"#22c55e", width:100-cs.green,              label:`≥${cs.green}%`},
        {color:"#eab308", width:cs.green-cs.yellow,        label:`${cs.yellow}–${cs.green-1}%`},
        {color:"#ef4444", width:cs.yellow,                 label:`<${cs.yellow}%`},
      ];
    }
    bar.innerHTML = segs.filter(s=>s.width>0).map(s=>`
      <div style="flex:${s.width};background:${s.color};display:flex;align-items:center;
        justify-content:center;font-size:10px;font-weight:700;color:#fff;
        text-shadow:0 1px 2px rgba(0,0,0,.5);white-space:nowrap;min-width:0;overflow:hidden">
        ${s.width>=8?s.label:""}
      </div>`).join("");
  }
  _updateColorPreview();

  // ── Clear settings ───────────────────────────────────────
  document.getElementById("dealerClearBtn")?.addEventListener("click", ()=>{
    if(!confirm("Clear dealer identity, team labels, display options, and color settings?\n\nUser accounts will NOT be affected.")) return;
    try{ localStorage.removeItem(DEALER_LS_KEY); }catch(e){}
    const n = document.getElementById("dealerNameInput"); if(n) n.value="";
    app.querySelectorAll(".dealerTeamInput").forEach(i=>i.value="");
    const tog = document.getElementById("hideZeroRoToggle");
    if(tog){
      tog.checked=false;
      document.querySelectorAll('.dlrTrack[data-tid="hideZeroRoToggle"]').forEach(el=>{
        el.style.background="rgba(255,255,255,.18)";
        const t=el.querySelector(".dlrThumb"); if(t) t.style.left="2px";
      });
      document.querySelectorAll('.dlrToggleLabel[data-tid="hideZeroRoToggle"]').forEach(el=>{ el.textContent="Off"; });
    }
    flashSaved();
  });
}

window.renderDealerSettingsPage = renderDealerSettingsPage;
