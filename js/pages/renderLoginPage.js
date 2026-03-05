// ─────────────────────────────────────────────────────────────
//  Session helpers  (key: "dashSession_v1")
//  Session object: { userId, name, email, role, team, loginTime }
// ─────────────────────────────────────────────────────────────
const SESSION_KEY = "dashSession_v1";

window.getSession = function(){
  try{ return JSON.parse(localStorage.getItem(SESSION_KEY)||"null"); }
  catch(e){ return null; }
};

window.setSession = function(user){
  try{
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      userId:    user.id    || "",
      name:      user.name  || "",
      email:     user.email || "",
      role:      user.role  || "",
      team:      user.team  || "",
      loginTime: Date.now()
    }));
  }catch(e){}
};

window.clearSession = function(){
  try{ localStorage.removeItem(SESSION_KEY); }catch(e){}
};

window.requireLogin = function(){
  if(!window.getSession()){
    window.renderLoginPage?.();
    return true;   // caller should abort rendering
  }
  return false;
};

// ─────────────────────────────────────────────────────────────
//  renderLoginPage
// ─────────────────────────────────────────────────────────────
function renderLoginPage(opts){
  opts = opts || {};
  const redirectHash = opts.redirect || "#/";

  // Hide the hamburger / side-menu while on the login screen
  const sideMenu = document.getElementById("sideMenu");
  const menuScrim= document.getElementById("menuScrim");
  const menuToggle=document.getElementById("menuToggle");
  if(sideMenu)   sideMenu.style.display  = "none";
  if(menuScrim)  menuScrim.style.display = "none";
  if(menuToggle) menuToggle.style.display= "none";

  // Restore them when we leave
  function _restoreNav(){
    if(sideMenu)   sideMenu.style.display  = "";
    if(menuScrim)  menuScrim.style.display = "";
    if(menuToggle) menuToggle.style.display= "";
  }

  // Pull dealer name for display
  const dealerName = (typeof window.getDealerName === "function")
    ? (window.getDealerName() || "ASR Performance Dashboard")
    : "ASR Performance Dashboard";

  const app = document.getElementById("app");

  app.style.display     = "flex";
  app.style.alignItems  = "center";
  app.style.justifyContent = "center";
  app.style.minHeight   = "80vh";
  app.style.marginTop   = "0";
  app.style.gap         = "0";

  app.innerHTML = `
    <div id="loginCard" style="
      width: min(420px, 96vw);
      background: linear-gradient(160deg, #131e3a 0%, #0d1526 100%);
      border: 1px solid rgba(200,45,45,.45);
      border-radius: 24px;
      padding: 40px 36px 36px;
      box-shadow:
        0 40px 100px rgba(0,0,0,.6),
        0 0 0 1px rgba(255,255,255,.06) inset,
        0 1px 0 rgba(255,255,255,.10) inset;
      animation: loginFadeUp .38s cubic-bezier(.22,.9,.36,1) both;
    ">

      <!-- Logo mark -->
      <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:32px">
        <div style="display:flex;align-items:center;gap:18px;margin-bottom:14px">
          <div style="position:relative;width:120px;height:48px">
            <svg viewBox="0 0 120 48" width="120" height="48" xmlns="http://www.w3.org/2000/svg">
              <polyline
                points="0,28 18,28 26,28 32,8 38,44 44,20 50,28 68,28 76,28 82,8 88,44 94,20 100,28 120,28"
                fill="none" stroke="#ef4444" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round"
                style="stroke-dasharray:320;stroke-dashoffset:320;
                  animation:spDraw 1.4s ease forwards,spGlow 2s 1.4s ease-in-out infinite"/>
            </svg>
          </div>
          <div style="display:flex;flex-direction:column;line-height:1">
            <div style="font-size:15px;font-weight:600;letter-spacing:4px;color:rgba(255,255,255,.55);text-transform:uppercase">Service</div>
            <div style="font-size:42px;font-weight:900;color:#fff;letter-spacing:-1px;line-height:1.0">Pulse</div>
          </div>
        </div>
        <div style="font-size:18px;font-weight:900;letter-spacing:.2px;color:#eaf0ff;line-height:1.1">
          ${_loginEsc(dealerName)}
        </div>
        <div style="margin-top:5px;font-size:12px;font-weight:700;letter-spacing:1.2px;
          text-transform:uppercase;color:rgba(234,240,255,.4)">
          Performance Dashboard
        </div>
      </div>

      <!-- Error banner -->
      <div id="loginErr" style="
        display:none;
        margin-bottom:16px;
        padding:10px 14px;
        border-radius:12px;
        background:rgba(248,113,113,.10);
        border:1px solid rgba(248,113,113,.28);
        color:#fca5a5;
        font-size:13px;
        font-weight:700;
        text-align:center;
        animation: loginShake .35s ease both;
      "></div>

      <!-- Email -->
      <div style="margin-bottom:14px">
        <label style="display:block;font-size:11px;font-weight:800;letter-spacing:.5px;
          text-transform:uppercase;color:rgba(234,240,255,.5);margin-bottom:7px">
          Email Address
        </label>
        <input id="loginEmail" type="email" autocomplete="username"
          placeholder="your@email.com"
          style="
            width:100%;box-sizing:border-box;
            padding:12px 14px;
            border-radius:12px;
            border:1px solid rgba(234,240,255,.13);
            background:rgba(0,0,0,.30);
            color:#eaf0ff;
            font-size:14px;
            font-family:inherit;
            outline:none;
            transition:border-color .18s;
          ">
      </div>

      <!-- Password -->
      <div style="margin-bottom:22px">
        <label style="display:block;font-size:11px;font-weight:800;letter-spacing:.5px;
          text-transform:uppercase;color:rgba(234,240,255,.5);margin-bottom:7px">
          Password
        </label>
        <div style="position:relative">
          <input id="loginPassword" type="password" autocomplete="current-password"
            placeholder="••••••••"
            style="
              width:100%;box-sizing:border-box;
              padding:12px 46px 12px 14px;
              border-radius:12px;
              border:1px solid rgba(234,240,255,.13);
              background:rgba(0,0,0,.30);
              color:#eaf0ff;
              font-size:14px;
              font-family:inherit;
              outline:none;
              transition:border-color .18s;
            ">
          <button id="loginPwToggle" type="button" style="
            position:absolute;right:13px;top:50%;transform:translateY(-50%);
            background:none;border:none;cursor:pointer;
            color:rgba(234,240,255,.38);font-size:11px;font-weight:800;
            padding:4px;text-decoration:underline;letter-spacing:.2px;
          ">Show</button>
        </div>
      </div>

      <!-- Submit button -->
      <button id="loginBtn" style="
        width:100%;
        padding:13px;
        border-radius:13px;
        border:none;
        background:linear-gradient(135deg,#2563eb,#1d4ed8);
        color:#fff;
        font-size:14px;
        font-weight:800;
        letter-spacing:.3px;
        cursor:pointer;
        font-family:inherit;
        transition:filter .15s, transform .12s;
        box-shadow:0 4px 18px rgba(37,99,235,.40);
        position:relative;
        overflow:hidden;
      ">
        <span id="loginBtnLabel">Sign In</span>
      </button>

    </div>

    <style>
      @keyframes loginFadeUp {
        from { opacity:0; transform:translateY(18px) scale(.97); }
        to   { opacity:1; transform:translateY(0)    scale(1);   }
      }
      @keyframes spDraw {
        to { stroke-dashoffset: 0; }
      }
      @keyframes spGlow {
        0%, 100% { filter: drop-shadow(0 0 3px #ef4444aa); }
        50%       { filter: drop-shadow(0 0 10px #ef4444ff); }
      }
      @keyframes loginShake {
        0%,100%{ transform:translateX(0); }
        20%    { transform:translateX(-6px); }
        40%    { transform:translateX(5px); }
        60%    { transform:translateX(-4px); }
        80%    { transform:translateX(3px); }
      }
      #loginEmail:focus, #loginPassword:focus {
        border-color: rgba(96,165,250,.65) !important;
        box-shadow: 0 0 0 3px rgba(96,165,250,.12);
      }
      #loginBtn:hover  { filter:brightness(1.12); transform:translateY(-1px); }
      #loginBtn:active { filter:brightness(.96);  transform:translateY(0); }
      #loginBtn:disabled { filter:saturate(.3) brightness(.8); cursor:default; transform:none; }
    </style>
  `;

  // ── Wire up interactions ─────────────────────────────────

  const emailEl  = document.getElementById("loginEmail");
  const pwEl     = document.getElementById("loginPassword");
  const pwToggle = document.getElementById("loginPwToggle");
  const btn      = document.getElementById("loginBtn");
  const errEl    = document.getElementById("loginErr");

  // Show / hide password
  pwToggle.addEventListener("click", () => {
    const hidden = pwEl.type === "password";
    pwEl.type = hidden ? "text" : "password";
    pwToggle.textContent = hidden ? "Hide" : "Show";
  });

  // Clear error on any input
  [emailEl, pwEl].forEach(el => el.addEventListener("input", () => {
    errEl.style.display = "none";
  }));

  // Enter key submits
  [emailEl, pwEl].forEach(el => el.addEventListener("keydown", e => {
    if(e.key === "Enter") _attemptLogin();
  }));

  btn.addEventListener("click", _attemptLogin);

  // Focus email on load
  setTimeout(() => emailEl.focus(), 80);

  // ── Login logic ──────────────────────────────────────────
  function _attemptLogin(){
    const email    = emailEl.value.trim().toLowerCase();
    const password = pwEl.value;

    if(!email || !password){
      _showErr("Please enter your email and password.");
      return;
    }

    // Set loading state
    btn.disabled = true;
    document.getElementById("loginBtnLabel").textContent = "Signing in…";

    // Small artificial delay so the UI feels responsive
    setTimeout(() => {
      const users = _loginGetUsers();
      const match = users.find(u => (u.email||"").toLowerCase() === email);

      if(!match){
        _showErr("No account found with that email address.");
        _resetBtn();
        return;
      }

      if(match.password !== password){
        _showErr("Incorrect password. Please try again.");
        pwEl.value = "";
        pwEl.focus();
        _resetBtn();
        return;
      }

      // ✅ Success
      window.setSession(match);
      _restoreNav();
      _resetAppLayout();

      location.hash = redirectHash;
      // Force re-render in case hash didn't change
      if(typeof window.renderMain === "function" && redirectHash === "#/"){
        window.renderMain();
        window.animateSvcGauges?.();
      } else {
        window.dispatchEvent(new Event("hashchange"));
      }

    }, 280);
  }

  function _showErr(msg){
    errEl.textContent = msg;
    errEl.style.display = "block";
    // re-trigger animation
    errEl.style.animation = "none";
    void errEl.offsetWidth;
    errEl.style.animation = "loginShake .35s ease both";
  }

  function _resetBtn(){
    btn.disabled = false;
    document.getElementById("loginBtnLabel").textContent = "Sign In";
  }

  function _resetAppLayout(){
    app.style.display      = "";
    app.style.alignItems   = "";
    app.style.justifyContent = "";
    app.style.minHeight    = "";
    app.style.marginTop    = "";
    app.style.gap          = "";
  }
}

// ── Private helpers ──────────────────────────────────────────
function _loginEsc(v){
  return String(v==null?"":v).replace(/[&<>"]/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function _loginGetUsers(){
  try{ return JSON.parse(localStorage.getItem("dealerUsers_v1")||"[]")||[]; }
  catch(e){ return []; }
}

// ─────────────────────────────────────────────────────────────
//  Expose globally
// ─────────────────────────────────────────────────────────────
window.renderLoginPage = renderLoginPage;
