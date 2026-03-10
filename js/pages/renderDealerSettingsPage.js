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
//  GitHub Integration
// ─────────────────────────────────────────────────────────────
const GITHUB_LS_KEY = "githubSettings_v1";
const GITHUB_OWNER  = "coreysuter";
const GITHUB_REPO   = "ASR-PERFORMANCE-DASHBOARD";
const GITHUB_BRANCH = "main";
const GITHUB_PATH   = "config/services-config.json";

function _loadGitHubSettings(){
  try{ return JSON.parse(localStorage.getItem(GITHUB_LS_KEY) || "{}") || {}; }
  catch(e){ return {}; }
}
function _saveGitHubSettings(obj){
  try{ localStorage.setItem(GITHUB_LS_KEY, JSON.stringify(obj || {})); }
  catch(e){}
}

window.getGitHubToken = function(){
  return (_loadGitHubSettings().token || "").trim();
};

window.commitToGitHub = async function(content){
  const token = window.getGitHubToken();
  if(!token) return { ok:false, err:"No GitHub token configured." };
  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
  try{
    let sha = null;
    const getRes = await fetch(apiBase, {
      headers:{ Authorization:`token ${token}`, Accept:"application/vnd.github.v3+json" }
    });
    if(getRes.ok){ const d = await getRes.json(); sha = d.sha || null; }
    else if(getRes.status !== 404) return { ok:false, err:`GitHub read error: HTTP ${getRes.status}` };

    const b64  = btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));
    const body = { message:`Update services config — ${new Date().toISOString()}`, content:b64, branch:GITHUB_BRANCH };
    if(sha) body.sha = sha;

    const putRes = await fetch(apiBase, {
      method:"PUT",
      headers:{ Authorization:`token ${token}`, Accept:"application/vnd.github.v3+json", "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });
    if(putRes.ok) return { ok:true };
    const errData = await putRes.json().catch(()=>({}));
    return { ok:false, err: errData.message || `GitHub write error: HTTP ${putRes.status}` };
  } catch(e){
    return { ok:false, err: String(e.message || e) };
  }
};

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
//  My Account — available to every logged-in user
// ─────────────────────────────────────────────────────────────
function _renderMyAccount(container, session){
  const r = _roleConf(session.role);

  container.innerHTML = `
    <div class="svcSetSection" style="margin-top:20px">
      <div class="svcSetSectionHdr">
        <div class="svcSetSectionHdrName">My Account</div>
      </div>
      <div style="padding:14px">

        <!-- Profile row -->
        <div style="display:flex;align-items:center;gap:14px;padding:10px 12px;
          border-radius:12px;border:1px solid rgba(255,255,255,.08);
          background:rgba(0,0,0,.15);margin-bottom:18px">
          <div style="width:42px;height:42px;border-radius:12px;flex-shrink:0;
            background:${r.bg};border:1px solid ${r.color}44;
            display:flex;align-items:center;justify-content:center;
            font-size:18px;font-weight:900;color:${r.color}">
            ${_esc((session.name||"?")[0].toUpperCase())}
          </div>
          <div style="min-width:0;flex:1">
            <div style="font-weight:800;font-size:14px">${_esc(session.name||"—")}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap">
              <span class="sub" style="font-size:11px;margin:0">${_esc(session.email||"—")}</span>
              ${_roleBadge(session.role)}
              ${session.team ? `<span class="sub" style="font-size:11px;margin:0;opacity:.6">${_esc(session.team)}</span>` : ""}
            </div>
          </div>
        </div>

        <!-- Change password -->
        <div style="font-size:11px;font-weight:800;letter-spacing:.5px;
          text-transform:uppercase;color:rgba(234,240,255,.4);margin-bottom:10px">
          Change Password
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Current Password</div>
            <div style="position:relative">
              <input id="ma_curPw" class="svcSetMiles" type="password" maxlength="128"
                placeholder="Current password"
                style="width:100%;box-sizing:border-box;padding-right:48px">
              <button class="ma_pwShow" data-for="ma_curPw" type="button" style="
                position:absolute;right:8px;top:50%;transform:translateY(-50%);
                background:none;border:none;cursor:pointer;
                color:var(--muted,#94a3b8);font-size:10px;font-weight:700;
                padding:0;text-decoration:underline">Show</button>
            </div>
          </div>
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">New Password</div>
            <div style="position:relative">
              <input id="ma_newPw" class="svcSetMiles" type="password" maxlength="128"
                placeholder="New password (min 6)"
                style="width:100%;box-sizing:border-box;padding-right:48px">
              <button class="ma_pwShow" data-for="ma_newPw" type="button" style="
                position:absolute;right:8px;top:50%;transform:translateY(-50%);
                background:none;border:none;cursor:pointer;
                color:var(--muted,#94a3b8);font-size:10px;font-weight:700;
                padding:0;text-decoration:underline">Show</button>
            </div>
          </div>
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Confirm New Password</div>
            <input id="ma_confPw" class="svcSetMiles" type="password" maxlength="128"
              placeholder="Confirm new password"
              style="width:100%;box-sizing:border-box">
          </div>
        </div>

        <div id="ma_err" style="display:none;color:#f87171;font-size:12px;margin-bottom:10px;
          padding:7px 10px;background:rgba(248,113,113,.08);
          border-radius:6px;border:1px solid rgba(248,113,113,.2)"></div>
        <div id="ma_ok" style="display:none;color:#86efac;font-size:12px;margin-bottom:10px;
          padding:7px 10px;background:rgba(34,197,94,.08);
          border-radius:6px;border:1px solid rgba(34,197,94,.2)">
          ✓ Password updated successfully.
        </div>

        <div style="display:flex;justify-content:flex-end">
          <button id="ma_saveBtn" style="
            background:var(--accent,#4f8ef7);border:none;border-radius:8px;
            color:#fff;font-weight:800;font-size:12px;padding:7px 18px;
            cursor:pointer;letter-spacing:.2px">Update Password</button>
        </div>
      </div>
    </div>`;

  // Show/hide toggles
  container.querySelectorAll(".ma_pwShow").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const inp = container.querySelector("#"+btn.getAttribute("data-for")); if(!inp) return;
      const hidden = inp.type==="password";
      inp.type = hidden?"text":"password";
      btn.textContent = hidden?"Hide":"Show";
    });
  });

  // Clear messages on input
  ["ma_curPw","ma_newPw","ma_confPw"].forEach(id=>{
    const el = container.querySelector("#"+id);
    if(el) el.addEventListener("input", ()=>{
      container.querySelector("#ma_err").style.display="none";
      container.querySelector("#ma_ok").style.display="none";
    });
  });

  container.querySelector("#ma_saveBtn").addEventListener("click", ()=>{
    const curPw  = container.querySelector("#ma_curPw").value  || "";
    const newPw  = container.querySelector("#ma_newPw").value  || "";
    const confPw = container.querySelector("#ma_confPw").value || "";
    const errEl  = container.querySelector("#ma_err");
    const okEl   = container.querySelector("#ma_ok");
    const showErr = msg=>{ errEl.textContent=msg; errEl.style.display="block"; okEl.style.display="none"; };

    if(!curPw) { showErr("Please enter your current password."); return; }
    if(!newPw) { showErr("Please enter a new password."); return; }
    if(newPw.length < 6){ showErr("New password must be at least 6 characters."); return; }
    if(newPw !== confPw){ showErr("New passwords do not match."); return; }

    const users   = _loadUsers();
    const userIdx = users.findIndex(u => u.id === session.userId);
    if(userIdx < 0){ showErr("Your account could not be found. Please sign out and back in."); return; }
    if(users[userIdx].password !== curPw){ showErr("Current password is incorrect."); return; }

    users[userIdx].password = newPw;
    _saveUsers(users);

    container.querySelector("#ma_curPw").value  = "";
    container.querySelector("#ma_newPw").value  = "";
    container.querySelector("#ma_confPw").value = "";
    errEl.style.display = "none";
    okEl.style.display  = "block";
  });
}

// ─────────────────────────────────────────────────────────────
//  Users section — administrator only
// ─────────────────────────────────────────────────────────────
function _renderUsersSection(container, allTeams){
  const users = _loadUsers();
  const ROLE_ORDER = ["administrator","manager","advisor","technician"];
  const sorted = [...users].sort((a,b)=>{
    const ra=ROLE_ORDER.indexOf(a.role), rb=ROLE_ORDER.indexOf(b.role);
    if(ra!==rb) return (ra<0?99:ra)-(rb<0?99:rb);
    return (a.name||"").localeCompare(b.name||"");
  });

  const teamOptions = allTeams.map(t=>`<option value="${_esc(t)}">${_esc(t)}</option>`).join("");
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
        <button class="deleteUserBtn" data-uid="${_esc(u.id)}" style="
          background:none;border:1px solid rgba(248,113,113,.35);color:#f87171;
          border-radius:8px;padding:4px 11px;font-size:11px;cursor:pointer;font-weight:800">Del</button>
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
            <select id="uf_role" class="svcSetMiles" style="width:100%;box-sizing:border-box;cursor:pointer">
              <option value="">— select role —</option>
              ${roleOptions}
            </select>
          </div>
          <div>
            <div class="sub" style="font-size:11px;margin-bottom:4px">Team</div>
            <select id="uf_team" class="svcSetMiles" style="width:100%;box-sizing:border-box;cursor:pointer">
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
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;
        border-bottom:1px solid rgba(255,255,255,.08)">
        <div class="svcSetSectionHdrName" style="font-weight:800;font-size:18px">Users</div>
        <div class="sub" style="font-size:11px;margin:0">(${users.length})</div>
        <button id="addUserBtn" class="menuClose" style="
          margin-left:auto;width:auto;padding:5px 12px;font-size:12px;font-weight:800">
          + Add User
        </button>
      </div>
      <div style="padding:10px 14px 4px">
        <div class="notice" style="padding:0 0 10px 0;margin:0">
          Staff accounts for this dashboard. Each user's email address serves as their username.
          Passwords are stored locally in this browser only.
        </div>
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
    _renderUsersSection(container, allTeams);
    const rc = document.getElementById("staffRosterContainer");
    if(rc) _renderStaffRoster(rc);
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
      _renderUsersSection(container, allTeams);
      const rc = document.getElementById("staffRosterContainer");
      if(rc) _renderStaffRoster(rc);
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
//  Staff Roster — read-only, advisors + technicians
// ─────────────────────────────────────────────────────────────
function _renderStaffRoster(container){
  const users       = _loadUsers();
  const advisors    = users.filter(u=>u.role==="advisor");
  const technicians = users.filter(u=>u.role==="technician");
  const byTeamName  = (a,b)=>(a.team||"").localeCompare(b.team||"")||(a.name||"").localeCompare(b.name||"");
  advisors.sort(byTeamName); technicians.sort(byTeamName);

  if(!advisors.length && !technicians.length){
    container.innerHTML = `
      <div class="svcSetSection" style="margin-top:0">
        <div class="svcSetSectionHdr"><div class="svcSetSectionHdrName">Staff Roster</div></div>
        <div class="sub" style="padding:16px 14px;opacity:.45;text-align:center">No advisors or technicians added yet.</div>
      </div>`;
    return;
  }

  function buildCol(title, color, list){
    if(!list.length) return `
      <div style="flex:1;min-width:200px">
        <div style="font-size:13px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;
          color:${color};margin-bottom:8px">${_esc(title)}</div>
        <div class="sub" style="opacity:.4;font-size:12px">None added.</div>
      </div>`;
    const groups = {};
    list.forEach(u=>{ const k=u.team||"—"; if(!groups[k]) groups[k]=[]; groups[k].push(u); });
    const groupHtml = Object.entries(groups).map(([team,members])=>`
      <div style="margin-bottom:12px">
        <div style="font-size:10px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;
          color:rgba(234,240,255,.4);margin-bottom:6px;padding-left:2px">${_esc(team)}</div>
        ${members.map(u=>`
          <div style="padding:8px 10px;border-radius:10px;margin-bottom:4px;
            border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.15)">
            <div style="font-weight:800;font-size:13px">${_esc(u.name||"—")}</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:3px">
              <span class="sub" style="font-size:11px;margin:0">
                <span style="opacity:.5">Email</span>&ensp;<span style="color:#eaf0ff">${_esc(u.email||"—")}</span>
              </span>
              ${u.empNum?`<span class="sub" style="font-size:11px;margin:0">
                <span style="opacity:.5">Emp #</span>&ensp;<span style="color:#eaf0ff">${_esc(u.empNum)}</span>
              </span>`:""}
            </div>
          </div>`).join("")}
      </div>`).join("");
    return `
      <div style="flex:1;min-width:200px">
        <div style="font-size:13px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;
          color:${color};margin-bottom:10px">${_esc(title)}
          <span style="font-size:11px;opacity:.55;font-weight:700">(${list.length})</span></div>
        ${groupHtml}
      </div>`;
  }

  container.innerHTML = `
    <div class="svcSetSection" style="margin-top:0">
      <div class="svcSetSectionHdr">
        <div class="svcSetSectionHdrName">Staff Roster</div>
        <div class="sub" style="font-size:11px;margin:0">
          ${advisors.length+technicians.length} staff member${advisors.length+technicians.length!==1?"s":""}
        </div>
      </div>
      <div style="padding:14px;display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        ${buildCol("Advisors","#10b981",advisors)}
        <div style="width:1px;background:rgba(255,255,255,.08);align-self:stretch;flex-shrink:0"></div>
        ${buildCol("Technicians","#3b82f6",technicians)}
      </div>
    </div>`;
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
  const teamLabels  = s.teamLabels||{};

  const teamRowsHtml = teams.map(team=>`
    <div class="svcSetRow">
      <div class="svcSetLeft"><div class="svcSetName">${_esc(team)}</div></div>
      <div class="svcSetRight">
        <input class="dealerTeamInput svcSetMiles" data-team="${_esc(team)}"
          type="text" maxlength="40"
          placeholder="${_esc(team)}" value="${_esc(teamLabels[team]||"")}">
      </div>
    </div>`).join("");

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

      <div class="panel svcSetPanel" style="min-width:0;">
        <div class="phead">

          <div class="titleRow" style="align-items:center">
            <div>
              <div class="h2" style="font-size:33px;letter-spacing:.2px">DEALER SETTINGS</div>
              <div class="sub"><a href="#/settings" style="text-decoration:none">← Back to settings</a></div>
            </div>
            ${sessionBadge}
          </div>

          <!-- My Account — visible to all roles -->
          <div id="myAccountContainer"></div>

          ${canManageSettings ? `
          <!-- Identity -->
          <div class="svcSetSection" style="margin-top:20px">
            <div class="svcSetSectionHdr"><div class="svcSetSectionHdrName">Identity</div></div>
            <div style="padding:8px 14px 12px">
              <div class="notice" style="padding:0 0 8px 0;margin:0">Set a dealer name to display in dashboard headers.</div>
              <div class="svcSetRow">
                <div class="svcSetLeft"><div class="svcSetName">Dealer / Store Name</div></div>
                <div class="svcSetRight" style="flex:1;min-width:0">
                  <input id="dealerNameInput" class="svcSetMiles" type="text" maxlength="80"
                    placeholder="e.g. Metro Kia of Springfield"
                    value="${_esc(s.dealerName||"")}"
                    style="width:100%;min-width:180px;max-width:340px">
                </div>
              </div>
            </div>
          </div>

          ${teams.length ? `
          <!-- Team Labels -->
          <div class="svcSetSection" style="margin-top:20px">
            <div class="svcSetSectionHdr">
              <div class="svcSetSectionHdrName">Team Labels</div>
              <div class="svcSetSectionHdrMiles">Display Name</div>
            </div>
            <div style="padding:0 14px 4px">
              <div class="notice" style="padding:8px 0;margin:0">Override how team names appear. Leave blank to use the default.</div>
              <div class="svcSetRows" style="padding-left:0;padding-right:0">${teamRowsHtml}</div>
            </div>
          </div>` : ""}

          <!-- Display Options -->
          <div class="svcSetSection" style="margin-top:20px">
            <div class="svcSetSectionHdr"><div class="svcSetSectionHdrName">Display Options</div></div>
            <div style="padding:12px 14px">
              <div class="svcSetRow" style="align-items:center">
                <div class="svcSetLeft" style="flex:1">
                  <div class="svcSetName">Hide zero-RO technicians</div>
                  <div class="sub" style="margin-top:2px">Exclude techs with no repair orders from dashboards and team averages.</div>
                </div>
                <div class="svcSetRight">${_buildToggle("hideZeroRoToggle", s.hideZeroRoTechs)}</div>
              </div>
            </div>
          </div>

          <!-- Users (admin) + Roster side by side -->
          <div style="display:flex;gap:16px;align-items:flex-start;margin-top:20px">
            <div id="usersSectionContainer" style="flex:1.4;min-width:0">
              ${canManageUsers ? "" : accessDenied("Users")}
            </div>
            <div id="staffRosterContainer" style="flex:1;min-width:0"></div>
          </div>

          <!-- GitHub Integration -->
          <div class="svcSetSection" style="margin-top:20px">
            <div class="svcSetSectionHdr">
              <div class="svcSetSectionHdrName">GitHub Integration</div>
            </div>
            <div style="padding:12px 14px 16px">
              <div class="svcSetRow" style="align-items:center;gap:10px">
                <div class="svcSetLeft" style="flex:1;min-width:0">
                  <div class="sub" style="font-size:11px;margin-bottom:4px">Personal Access Token</div>
                  <div style="position:relative">
                    <input id="githubTokenInput" class="svcSetMiles" type="password" maxlength="120"
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      value="${_esc(_loadGitHubSettings().token||"")}"
                      style="width:100%;box-sizing:border-box;padding-right:52px;font-family:monospace;font-size:12px">
                    <button id="ghTokenShow" type="button" style="
                      position:absolute;right:8px;top:50%;transform:translateY(-50%);
                      background:none;border:none;cursor:pointer;
                      color:var(--muted,#94a3b8);font-size:10px;font-weight:700;
                      padding:0;text-decoration:underline">Show</button>
                  </div>
                </div>
                <div style="flex-shrink:0;padding-top:18px">
                  <button id="ghTestBtn" style="
                    background:rgba(79,142,247,.15);border:1px solid rgba(79,142,247,.35);
                    border-radius:8px;color:#4f8ef7;font-weight:800;font-size:12px;
                    padding:7px 16px;cursor:pointer;white-space:nowrap">
                    Test Connection
                  </button>
                </div>
              </div>
              <div id="ghTestStatus" style="display:none;margin-top:8px;font-size:12px;
                font-weight:700;padding:7px 10px;border-radius:6px"></div>
            </div>
          </div>

          <!-- Bottom controls -->
          <div style="display:flex;gap:10px;align-items:center;justify-content:flex-end;
            margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06)">
            <button id="dealerClearBtn" class="menuClose" style="width:auto;padding:8px 14px">
              Clear Dealer Settings
            </button>
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

  // ── My Account (always) ──────────────────────────────────
  if(session){
    const mac = app.querySelector("#myAccountContainer");
    if(mac) _renderMyAccount(mac, session);
  }

  // ── Users & Roster ───────────────────────────────────────
  if(canManageUsers){
    const uc = app.querySelector("#usersSectionContainer");
    if(uc) _renderUsersSection(uc, teams.length?teams:["EXPRESS","KIA"]);
  }
  const rc = app.querySelector("#staffRosterContainer");
  if(rc) _renderStaffRoster(rc);

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
    const n = document.getElementById("dealerNameInput"); if(n) cur.dealerName=n.value.trim();
    const tMap = cur.teamLabels||{};
    app.querySelectorAll(".dealerTeamInput").forEach(inp=>{
      const t=inp.getAttribute("data-team")||"", v=inp.value.trim();
      if(v) tMap[t]=v; else delete tMap[t];
    });
    cur.teamLabels = tMap;
    const tog = document.getElementById("hideZeroRoToggle"); if(tog) cur.hideZeroRoTechs=tog.checked;
    _saveDealerSettings(cur);
    flashSaved();
  }

  app.querySelectorAll("#dealerNameInput, .dealerTeamInput")
    .forEach(inp=>inp.addEventListener("input", persist));
  _wireToggle("hideZeroRoToggle", ()=>persist());

  // ── Clear settings ───────────────────────────────────────
  document.getElementById("dealerClearBtn")?.addEventListener("click", ()=>{
    if(!confirm("Clear dealer identity, team labels, and display options?\n\nUser accounts and GitHub settings will NOT be affected.")) return;
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

  // ── GitHub token ─────────────────────────────────────────
  const ghInp    = document.getElementById("githubTokenInput");
  const ghShow   = document.getElementById("ghTokenShow");
  const ghTest   = document.getElementById("ghTestBtn");
  const ghStatus = document.getElementById("ghTestStatus");

  function _ghSetStatus(type, msg){
    if(!ghStatus) return;
    const styles = {
      ok:   "color:#86efac;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2)",
      err:  "color:#f87171;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2)",
      warn: "color:#fbbf24;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2)"
    };
    ghStatus.style.cssText += `;display:block;${styles[type]||styles.warn}`;
    ghStatus.textContent = msg;
  }

  if(ghShow && ghInp){
    ghShow.addEventListener("click", ()=>{
      const hidden = ghInp.type === "password";
      ghInp.type = hidden ? "text" : "password";
      ghShow.textContent = hidden ? "Hide" : "Show";
    });
  }

  if(ghInp){
    ghInp.addEventListener("input", ()=>{
      const gh = _loadGitHubSettings();
      gh.token = ghInp.value.trim();
      _saveGitHubSettings(gh);
      flashSaved();
      if(ghStatus) ghStatus.style.display = "none";
    });
  }

  if(ghTest){
    ghTest.addEventListener("click", async ()=>{
      const token = (ghInp ? ghInp.value.trim() : window.getGitHubToken());
      if(!token){ _ghSetStatus("warn", "⚠ Enter a token first."); return; }
      ghTest.textContent = "Testing…";
      ghTest.disabled = true;
      try{
        const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
          headers:{ Authorization:`token ${token}`, Accept:"application/vnd.github.v3+json" }
        });
        if(res.ok)                _ghSetStatus("ok",   "✓ Connected — repo access confirmed.");
        else if(res.status===401) _ghSetStatus("err",  "✗ Invalid token.");
        else if(res.status===404) _ghSetStatus("err",  "✗ Repo not found — check token has repo scope.");
        else                      _ghSetStatus("err",  `✗ HTTP ${res.status}`);
      } catch(e){
        _ghSetStatus("err", `✗ Network error: ${e.message||e}`);
      }
      ghTest.textContent = "Test Connection";
      ghTest.disabled = false;
    });
  }
}

window.renderDealerSettingsPage = renderDealerSettingsPage;
