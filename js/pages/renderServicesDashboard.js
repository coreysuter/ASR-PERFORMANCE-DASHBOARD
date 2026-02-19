function renderServicesDashboard(){
  const app = document.getElementById('app');
  if(!app) return;

  // ---- local UI state (scoped to this page only) ----
  window.UI = window.UI || {};
  UI.servicesDash = UI.servicesDash || { focus:"asr", goalMetric:"asr", team:"all", openSection:null };
  const st = UI.servicesDash;

  // Normalize
  const focus = (st.focus === 'sold' || st.focus === 'goal') ? st.focus : 'asr';
  const goalMetric = (st.goalMetric === 'sold') ? 'sold' : 'asr';
  const teamKey = (st.team === 'express' || st.team === 'kia') ? st.team : 'all';

  // Data
  const techsAll = (typeof DATA !== 'undefined' && Array.isArray(DATA.techs))
    ? DATA.techs.filter(t=>t && (t.team === 'EXPRESS' || t.team === 'KIA'))
    : [];

  const techs = teamKey === 'all'
    ? techsAll
    : techsAll.filter(t => String(t.team||'').toLowerCase() === teamKey);

  const sections = Array.isArray(DATA?.sections) ? DATA.sections : [];
  function slugify(s){
    return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  }

  // Default open section (first one)
  if(!st.openSection){
    st.openSection = sections.length ? slugify(sections[0]?.name) : null;
  }

  // Helpers
  function sumBy(arr, fn){
    let s=0;
    for(const x of (arr||[])) s += (Number(fn(x))||0);
    return s;
  }

  const totalRos = sumBy(techs, t=>t.ros);
  const avgOdo = totalRos
    ? techs.reduce((s,t)=>s + (Number(t.odo)||0)*(Number(t.ros)||0), 0) / totalRos
    : 0;

  // --- CSS: fully scoped to this page ---
  (function ensureSvcDashCSS(){
    const id = 'svcDashCSS';
    let el = document.getElementById(id);
    if(!el){ el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
    el.textContent = `
      .pageServicesDash .techHeaderPanel{margin-bottom:14px;}
      .pageServicesDash .mainFiltersBar .controls{grid-template-columns:repeat(3, minmax(170px, 1fr));}
      .pageServicesDash .mainFiltersBar .controls label{text-transform:uppercase;}
      @media(max-width:980px){
        .pageServicesDash .mainFiltersBar .controls{grid-template-columns:1fr;}
      }

      .pageServicesDash .svcDashGrid{
        display:grid;
        grid-template-columns: minmax(240px, 25%) 1fr;
        gap:14px;
        align-items:start;
      }
      @media(max-width:980px){
        .pageServicesDash .svcDashGrid{grid-template-columns:1fr;}
      }

      .pageServicesDash .svcLeftCol{display:grid;gap:10px;}

      .pageServicesDash .svcSection{
        border:1px solid var(--border);
        border-radius:16px;
        background:rgba(0,0,0,.12);
        overflow:hidden;
      }
      .pageServicesDash .svcSection summary{
        list-style:none;
        cursor:pointer;
      }
      .pageServicesDash .svcSection summary::-webkit-details-marker{display:none;}
      .pageServicesDash .svcSecHead{
        padding:10px 10px;
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }
      .pageServicesDash .svcSecTitle{font-size:22px;font-weight:1200;letter-spacing:.2px;line-height:1.05;}
      .pageServicesDash .svcSecMeta{margin-top:5px;font-size:12px;color:var(--muted);font-weight:900;letter-spacing:.2px;text-transform:uppercase;}
      .pageServicesDash .svcChevron{margin-left:auto;color:rgba(255,255,255,.7);font-weight:1100;}

      .pageServicesDash .svcTechList{border-top:1px solid rgba(255,255,255,.10); padding:10px; display:grid; gap:8px;}
      .pageServicesDash .svcTechRow{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        padding:8px 10px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:14px;
        background:rgba(0,0,0,.18);
      }
      .pageServicesDash .svcTechRow .left{display:flex;align-items:center;gap:8px;min-width:0;}
      .pageServicesDash .svcTechRow .rankNum{color:rgba(255,255,255,.7);font-weight:1000;min-width:1.4em;text-align:right;}
      .pageServicesDash .svcTechRow a{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .pageServicesDash .svcTechRow .right{white-space:nowrap;color:rgba(255,255,255,.75);font-size:12px;font-weight:900;}

      .pageServicesDash .svcRightCol{min-width:0;}
      .pageServicesDash .svcCardsGrid{display:grid;grid-template-columns:repeat(auto-fit, minmax(360px, 1fr));gap:12px;align-items:start;}
      @media(max-width:760px){
        .pageServicesDash .svcCardsGrid{grid-template-columns:1fr;}
      }

      .pageServicesDash .svcEmpty{
        border:1px dashed rgba(255,255,255,.18);
        border-radius:16px;
        padding:18px;
        color:rgba(255,255,255,.75);
        background:rgba(0,0,0,.10);
      }
    `;
  })();

  // ---- Metrics for a section ----
  function sectionAgg(section){
    const cats = Array.isArray(section?.categories) ? section.categories : [];
    const rows = [];
    for(const t of techs){
      let asr=0, sold=0;
      for(const cName of cats){
        const c = (t.categories||{})[cName];
        asr += (Number(c?.asr)||0);
        sold += (Number(c?.sold)||0);
      }
      const ros = Number(t.ros)||0;
      const req = ros ? (asr/ros) : 0;      // ASR/RO (ratio)
      const close = asr ? (sold/asr) : 0;   // Sold% (ratio)
      rows.push({ id:t.id, name:t.name, ros, asr, sold, req, close });
    }
    const sAsr = sumBy(rows, r=>r.asr);
    const sSold = sumBy(rows, r=>r.sold);
    const sReq = totalRos ? (sAsr/totalRos) : 0;
    const sClose = sAsr ? (sSold/sAsr) : 0;
    return { rows, sAsr, sSold, sReq, sClose };
  }

  // ---- How to display & sort tech rows for a section based on focus ----
  function focusMeta(){
    if(focus === 'sold'){
      return { labelLine: 'SOLD', statKey: 'sold', pctKey: 'close', pctFmt: (v)=>fmtPct(v), pctLabel: 'Sold%' };
    }
    if(focus === 'goal'){
      // For GOAL, the list uses ASR or SOLD based on goalMetric
      if(goalMetric === 'sold'){
        return { labelLine:'GOAL • SOLD', statKey:'sold', pctKey:'close', pctFmt:(v)=>fmtPct(v), pctLabel:'Sold%' };
      }
      return { labelLine:'GOAL • ASR', statKey:'asr', pctKey:'req', pctFmt:(v)=>fmtPctPlain(v), pctLabel:'ASR/RO%' };
    }
    // default ASR
    return { labelLine:'ASR', statKey:'asr', pctKey:'req', pctFmt:(v)=>fmtPctPlain(v), pctLabel:'ASR/RO%' };
  }

  function goalOf(metricKey, cat){
    // Goals are stored as "percent" numbers in inputs (e.g., 12.5), convert to decimal ratio.
    const g = Number(getGoal(cat, metricKey));
    if(!Number.isFinite(g)) return NaN;
    return g/100;
  }

  // ---- Build service aggregates for the open section ----
  function serviceAggForCat(catName){
    let asr=0, sold=0;
    for(const t of techs){
      const c = (t.categories||{})[catName];
      asr += (Number(c?.asr)||0);
      sold += (Number(c?.sold)||0);
    }
    const reqTot = totalRos ? (asr/totalRos) : 0;
    const closeTot = asr ? (sold/asr) : 0;
    return { catName, asr, sold, totalRos, reqTot, closeTot };
  }

  function gaugeFor(catName, reqTot, closeTot){
    // Gauge shows "% of goal" for the active focus
    const gReq = goalOf('req', catName);
    const gClose = goalOf('close', catName);

    let pct = NaN;
    let lbl = '';
    if(focus === 'sold'){
      pct = (Number.isFinite(gClose) && gClose>0) ? (closeTot/gClose) : NaN;
      lbl = 'Sold%';
    }else if(focus === 'goal'){
      if(goalMetric === 'sold'){
        pct = (Number.isFinite(gClose) && gClose>0) ? (closeTot/gClose) : NaN;
        lbl = 'Goal';
      }else{
        pct = (Number.isFinite(gReq) && gReq>0) ? (reqTot/gReq) : NaN;
        lbl = 'Goal';
      }
    }else{
      pct = (Number.isFinite(gReq) && gReq>0) ? (reqTot/gReq) : NaN;
      lbl = 'ASR%';
    }
    return Number.isFinite(pct) ? svcGauge(pct, lbl) : '';
  }

  // ---- Build left category panels (accordion) + right cards ----
  const openKey = st.openSection;

  function sectionPanelHtml(sec){
    const key = slugify(sec?.name);
    const isOpen = key === openKey;
    const agg = sectionAgg(sec);
    const fm = focusMeta();

    const sorted = agg.rows.slice().sort((a,b)=>{
      // Sort primarily by pct (req/close), then by the selected stat
      const pa = Number(a[fm.pctKey])||0;
      const pb = Number(b[fm.pctKey])||0;
      if(pb !== pa) return pb - pa;
      const sa = Number(a[fm.statKey])||0;
      const sb = Number(b[fm.statKey])||0;
      return sb - sa;
    });

    const techRows = sorted.map((r, idx)=>{
      const rank = idx + 1;
      const statVal = (fm.statKey === 'sold') ? r.sold : r.asr;
      const pctVal = (fm.pctKey === 'close') ? r.close : r.req;

      let goalNote = '';
      if(focus === 'goal'){
        // Compute % of goal for the pct metric
        let g = NaN;
        if(goalMetric === 'sold'){
          // Sold% goal uses any one of the section's categories? We compute section-level goal as average of goals across cats.
          // (best-effort; keeps the label consistent)
          const cats = Array.isArray(sec?.categories) ? sec.categories : [];
          const gList = cats.map(c=>goalOf('close', c)).filter(x=>Number.isFinite(x) && x>0);
          g = gList.length ? (gList.reduce((a,b)=>a+b,0)/gList.length) : NaN;
        }else{
          const cats = Array.isArray(sec?.categories) ? sec.categories : [];
          const gList = cats.map(c=>goalOf('req', c)).filter(x=>Number.isFinite(x) && x>0);
          g = gList.length ? (gList.reduce((a,b)=>a+b,0)/gList.length) : NaN;
        }
        const pctOfGoal = (Number.isFinite(g) && g>0) ? (pctVal/g) : NaN;
        goalNote = Number.isFinite(pctOfGoal) ? ` <span style="opacity:.8">(${Math.round(pctOfGoal*100)}% OF GOAL)</span>` : '';
      }

      const pctStr = fm.pctFmt(pctVal);
      return `
        <div class="svcTechRow">
          <div class="left">
            <span class="rankNum">${rank}.</span>
            <a href="#/tech/${encodeURIComponent(String(r.id))}">${safe(r.name||'') || '—'}</a>
          </div>
          <div class="right">
            ROs ${fmtInt(r.ros)} • ${fm.statKey==='sold'?'Sold':'ASR'} ${fmtInt(statVal)} • <b>${pctStr}</b>${goalNote}
          </div>
        </div>
      `;
    }).join('');

    const metaLine = `ROs ${fmtInt(totalRos)} • ASR ${fmtInt(agg.sAsr)} • Sold ${fmtInt(agg.sSold)}`;

    // details element acts like accordion; we control open via JS so it remains deterministic
    return `
      <details class="svcSection" ${isOpen?'open':''} data-sec="${safe(key)}">
        <summary onclick="return window.__svcDashToggle && window.__svcDashToggle('${safe(key)}')">
          <div class="svcSecHead">
            <div style="min-width:0">
              <div class="svcSecTitle">${safe(String(sec?.name||'Category'))}</div>
              <div class="svcSecMeta">${safe(metaLine)}</div>
            </div>
            <div class="svcChevron">${isOpen ? '▾' : '▸'}</div>
          </div>
        </summary>
        <div class="svcTechList">
          ${techRows || `<div class="notice">No technicians</div>`}
        </div>
      </details>
    `;
  }

  let rightHtml = '';
  const openSection = sections.find(s => slugify(s?.name) === openKey);
  if(openSection && Array.isArray(openSection.categories)){
    const cards = openSection.categories.map(catName=>{
      const a = serviceAggForCat(catName);
      const dial = gaugeFor(a.catName, a.reqTot, a.closeTot);
      const metricText = (focus === 'sold')
        ? `<div class="mbKicker">SOLD%</div><div class="mbStat">${fmtPct(a.closeTot)}</div>`
        : `<div class="mbKicker">ASR/RO%</div><div class="mbStat">${fmtPctPlain(a.reqTot)}</div>`;

      const goalReq = goalOf('req', a.catName);
      const goalClose = goalOf('close', a.catName);
      const goalText = (focus === 'sold')
        ? (Number.isFinite(goalClose) ? fmtPct(goalClose) : '—')
        : (Number.isFinite(goalReq) ? fmtPctPlain(goalReq) : '—');

      return `
        <div class="catCard" id="svc-${safe(String(a.catName).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''))}">
          <div class="catHeader">
            <div class="svcGaugeWrap" style="--sz:72px">${dial}</div>
            <div style="min-width:0">
              <div class="catTitle">${safe(a.catName)}</div>
              <div class="muted svcMetaLine" style="margin-top:2px">${fmtInt(a.asr)} ASR • ${fmtInt(a.sold)} Sold • ${fmtInt(a.totalRos)} ROs</div>
            </div>
          </div>
          <div class="benchWrap" style="margin-top:10px">
            <div class="metricBlock" style="display:flex;align-items:center;justify-content:space-between;gap:12px">
              <div>${metricText}</div>
              <div style="text-align:right">
                <div class="mbLbl" style="font-size:12px;color:rgba(255,255,255,.65);font-weight:900;letter-spacing:.2px;text-transform:uppercase">Goal</div>
                <div class="mbNum" style="font-size:18px;font-weight:1100">${safe(goalText)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    rightHtml = `
      <div class="svcCardsGrid">${cards || ''}</div>
    `;
  } else {
    rightHtml = `<div class="svcEmpty">Expand a category on the left to view its services.</div>`;
  }

  // ---- Header (similar structure to Technician Dashboard) ----
  const focusLine = (focus === 'sold') ? 'SOLD' : (focus === 'goal' ? 'GOAL' : 'ASR');
  const teamLine = (teamKey === 'all') ? 'ALL TEAMS' : teamKey.toUpperCase();

  const header = `
    <div class="panel techHeaderPanel">
      <div class="phead">
        <div class="titleRow techTitleRow">
          <div class="techTitleLeft">
            <label for="menuToggle" class="hamburgerMini" aria-label="Menu">☰</label>
          </div>
          <div class="techNameWrap">
            <div class="h2 techH2Big">Services Dashboard</div>
            <div class="techTeamLine">${safe(teamLine)} • ${safe(focusLine)}${focus==='goal' ? (' • ' + safe(goalMetric.toUpperCase())) : ''}</div>
          </div>
          <div class="overallBlock">
            <div class="bigMain" style="font-size:38px;line-height:1.05;color:#fff;font-weight:1000">${fmtInt(totalRos)}</div>
            <div class="tag">Total ROs</div>
            <div class="overallMetric" style="font-size:28px;line-height:1.05;color:#fff;font-weight:1000">${fmtInt(avgOdo)}</div>
            <div class="tag">Avg ODO</div>
          </div>
        </div>

        <div class="mainFiltersBar">
          <div class="controls mainAlwaysOpen" style="grid-template-columns:repeat(3, minmax(170px, 1fr));">
            <div>
              <label>Focus</label>
              <select id="svcDashFocus">
                <option value="asr" ${focus==='asr'?'selected':''}>ASR</option>
                <option value="sold" ${focus==='sold'?'selected':''}>Sold</option>
                <option value="goal" ${focus==='goal'?'selected':''}>Goal</option>
              </select>
            </div>

            ${focus==='goal' ? `
            <div>
              <label>Goal</label>
              <select id="svcDashGoal">
                <option value="asr" ${goalMetric==='asr'?'selected':''}>ASR</option>
                <option value="sold" ${goalMetric==='sold'?'selected':''}>Sold</option>
              </select>
            </div>
            ` : `
            <div style="opacity:.0; pointer-events:none">
              <label>Goal</label>
              <select><option>—</option></select>
            </div>
            `}

            <div>
              <label>Team</label>
              <select id="svcDashTeam">
                <option value="all" ${teamKey==='all'?'selected':''}>All Teams</option>
                <option value="express" ${teamKey==='express'?'selected':''}>Express</option>
                <option value="kia" ${teamKey==='kia'?'selected':''}>Kia</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const leftPanels = sections.map(sectionPanelHtml).join('');

  app.innerHTML = `
    <div class="pageServicesDash">
      ${header}
      <div class="svcDashGrid">
        <div class="svcLeftCol">${leftPanels || ''}</div>
        <div class="svcRightCol">${rightHtml}</div>
      </div>
    </div>
  `;

  // ---- Wiring ----
  window.__svcDashToggle = function(key){
    UI.servicesDash.openSection = (UI.servicesDash.openSection === key) ? null : key;
    renderServicesDashboard();
    return false;
  };

  const focusSel = document.getElementById('svcDashFocus');
  const teamSel = document.getElementById('svcDashTeam');
  const goalSel = document.getElementById('svcDashGoal');

  if(focusSel){
    focusSel.addEventListener('change', ()=>{
      UI.servicesDash.focus = focusSel.value;
      // If leaving goal mode, keep goalMetric remembered; if entering goal, render will show it.
      renderServicesDashboard();
    });
  }
  if(teamSel){
    teamSel.addEventListener('change', ()=>{
      UI.servicesDash.team = teamSel.value;
      renderServicesDashboard();
    });
  }
  if(goalSel){
    goalSel.addEventListener('change', ()=>{
      UI.servicesDash.goalMetric = goalSel.value;
      renderServicesDashboard();
    });
  }
}

// expose for router
window.renderServicesDashboard = renderServicesDashboard;
