function renderServicesHome(){
  // ---- Independent page-only CSS overrides ----
  (function ensureServicesDashOverrides(){
    const id = "servicesDashOverrides";
    let el = document.getElementById(id);
    if(!el){
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = `
      /* Scope everything to Services Dashboard only */
      .pageServicesDash .techHeaderPanel{margin-bottom:0 !important;}
      /* Services Dashboard header title size */
      .pageServicesDash .techH2Big{font-size:34px !important;}

      /* Header + diag wrapper (match Tech Details layout) */
      .pageServicesDash .svcdashHeaderWrap{margin-bottom:14px;display:grid;grid-template-columns:minmax(0,0.70fr) minmax(0,1.30fr);gap:14px;align-items:stretch;}
      .pageServicesDash .svcDashSections{display:grid;gap:20px;}
      .pageServicesDash details.svcDashSec{border:1px solid rgba(200,45,45,.45);border-radius:18px;overflow:hidden;background:linear-gradient(180deg,var(--card),var(--card2));box-shadow:0 0 14px rgba(200,40,40,.22),0 0 4px rgba(200,40,40,.14);}
      .pageServicesDash details.svcDashSec > summary{list-style:none;cursor:default;}
      .pageServicesDash .svcDashSecTitleRow .secToggle,.pageServicesDash .svcDashSecTitle{cursor:pointer;}
      .pageServicesDash details.svcDashSec > summary::-webkit-details-marker{display:none;}

      .pageServicesDash .svcDashSecHead{padding:14px 14px 12px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;gap:18px;}
      /* Section head layout (left pills + right dials/badge/stats like renderTech) */
      .pageServicesDash .svcDashSecHeadLeft{display:flex;flex-direction:column;gap:8px;min-width:0;flex:1 1 auto;}
      .pageServicesDash .svcDashSecHeadRight{display:flex;flex-direction:row;gap:22px;align-items:center;justify-content:flex-end;white-space:nowrap;min-width:0;flex:0 0 auto;}
      .pageServicesDash .svcDashSecHeadRightTop{display:flex;align-items:center;gap:22px;justify-content:flex-end;white-space:nowrap;}
      .pageServicesDash .svcSecHeadDials{display:flex;align-items:center;gap:22px;}
      /* Dial columns (label directly under dial) — scoped to section heads + service card headers only */
      .pageServicesDash .svcSecHeadDials .svcGaugeCol,
      .pageServicesDash .sdCatHdrRow .svcGaugeCol{
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:flex-start;
      }
      .pageServicesDash .svcSecHeadDials .svcGaugeLbl,
      .pageServicesDash .sdCatHdrRow .svcGaugeLbl{
        margin-top:6px;
        text-align:center;
        font-size:11px;
        font-weight:1000;
        color:rgba(255,255,255,.70);
        letter-spacing:.2px;
        text-transform:none;
      }

      .pageServicesDash .svcSecHeadDials .svcGaugeWrap{display:flex;align-items:center;justify-content:center;}
      /* Focus + mini dial sizing matches renderTech section header vibe */
      .pageServicesDash .svcSecHeadDials .svcGaugeWrap.focus{width:77px;height:77px;flex:0 0 auto;}
      .pageServicesDash .svcSecHeadDials .svcGaugeWrap.mini{width:63px;height:63px;flex:0 0 auto;opacity:.98;}
      .pageServicesDash .svcSecHeadDials .svcGaugeWrap.focus .svcGauge{--sz:77px !important;width:77px !important;height:77px !important;}
      .pageServicesDash .svcSecHeadDials .svcGaugeWrap.mini .svcGauge{--sz:63px !important;width:63px !important;height:63px !important;}
      /* Rank badge: use the full-size badge (matches renderTech category header badge) */
      .pageServicesDash .svcDashSecHeadRightTop .rankFocusBadge{transform:none;align-self:center;}
      /* Sold stats stack */
      .pageServicesDash .svcSecFocusStats{display:flex;flex-direction:column;gap:10px;align-items:flex-end;}
      .pageServicesDash .svcSecFocusStats>div{display:flex;flex-direction:column;align-items:flex-end;}
      .pageServicesDash .svcSecFocusStats .statValTop{font-size:32px;line-height:1;font-weight:1000;color:#fff;text-align:right;}
      .pageServicesDash .svcSecFocusStats .statValBot{font-size:22px;line-height:1;font-weight:1000;color:#fff;opacity:.92;text-align:right;}
      .pageServicesDash .svcSecFocusStats .statLbl{font-size:14px;line-height:1.05;font-weight:1000;color:rgba(255,255,255,.55);letter-spacing:.2px;text-transform:none;text-align:right;width:100%;}
      .pageServicesDash .svcSecFocusStats>div:last-child .statLbl{font-size:11px;}
      /* Pills under category name (far-left) */
      .pageServicesDash .svcDashSecPillsLeft{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-start;}

      .pageServicesDash .svcDashSecTitle{font-size:33px;font-weight:900;letter-spacing:.2px;line-height:1.05;}
      .pageServicesDash .svcDashSecTitleRow{display:flex;align-items:center;gap:10px;}
      /* Indent pills so they start under the title (not under the +/-) */
      .pageServicesDash .svcDashSecPillsLeft{padding-left:32px;}

      .pageServicesDash .svcDashSecMeta{font-size:12px;color:var(--muted);font-weight:900;letter-spacing:.2px;white-space:nowrap}
      .pageServicesDash .svcDashBody{padding:12px 12px 14px;}

      /* Service cards grid (same vibe as tech details) */
      .pageServicesDash .svcCardsGrid{display:grid;grid-template-columns:repeat(3,minmax(462px,1fr));gap:14px;align-items:start;}
      @media (max-width: 1200px){ .pageServicesDash .svcCardsGrid{grid-template-columns:repeat(2,minmax(420px,1fr));} }
      @media (max-width: 820px){ .pageServicesDash .svcCardsGrid{grid-template-columns:1fr;} }

      /* =====================================================================
         ServicesHome diagSection: match Tech Details (renderTech) styling
         ===================================================================== */

      /* Prevent Bottom 3 lists from being clipped when the diag section is height-constrained */
      .pageServicesDash .techPickPanel.diagSection{display:flex;flex-direction:column;overflow:visible}
      .pageServicesDash .techPickPanel.diagSection>.phead{flex:1;min-height:0;overflow:visible}
      .pageServicesDash .techPickPanel.diagSection .pickRow{min-height:0}

      /* Diag pie chart labels/lines (same as app.css tech details) */
      .pageServicesDash .techPickPanel.diagSection .diagPieWrap{display:flex;align-items:center;justify-content:center;margin-top:10px}
      .pageServicesDash .techPickPanel.diagSection .diagPieSvg{width:142px;height:142px;display:block;overflow:visible}
      .pageServicesDash .techPickPanel.diagSection .diagPieTxt{fill:#fff;font-weight:700;font-size:20px}
      .pageServicesDash .techPickPanel.diagSection .diagPieLeader{stroke:rgba(255,255,255,9);stroke-width:1}
      .pageServicesDash .techPickPanel.diagSection .diagPieRing{stroke:rgba(255,255,255,85);stroke-width:1.2}

      /* Diag pie interactions (same as app.css tech details) */
      .pageServicesDash .techPickPanel.diagSection .diagPieWrap,
      .pageServicesDash .techPickPanel.diagSection .diagPieSvg{cursor:pointer;}
      .pageServicesDash .techPickPanel.diagSection .diagPieSlice{
        cursor:pointer;
        transition:filter 140ms ease, opacity 140ms ease, transform 140ms ease;
        opacity:.92;
        transform-origin:50% 50%;
      }
      .pageServicesDash .techPickPanel.diagSection .diagPieSlice:hover{
        opacity:1;
        filter:brightness(1.35) drop-shadow(0 6px 10px rgba(0,0,0,35));
        transform:scale(1.02);
      }

      /* One-line Top/Bottom list rows (same as app.css tech details) */
      .pageServicesDash .techPickPanel .pickList .techRow{
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        flex-wrap:nowrap !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow > div:first-child{
        display:flex !important;
        align-items:center !important;
        gap:10px !important;
        min-width:0 !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow > div:first-child .mini{
        margin:0 !important;
        white-space:nowrap !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow a,
      .pageServicesDash .techPickPanel .pickList .techRow .tbJump,
      .pageServicesDash .techPickPanel .pickList .techRow .nm,
      .pageServicesDash .techPickPanel .pickList .techRow span,
      .pageServicesDash .techPickPanel .pickList .techRow button{
        white-space:nowrap !important;
        overflow:hidden !important;
        text-overflow:ellipsis !important;
        max-width:100% !important;
      }
      .pageServicesDash .techPickPanel .pickList .techRow > .mini,
      .pageServicesDash .techPickPanel .pickList .techRow > div:last-child{white-space:nowrap !important;}

      /* =========================================================
         ServicesHome diagSection tech rows — match renderTech
         ========================================================= */
      .pageServicesDash .techPickPanel.diagSection .pickList{display:grid;gap:6px}
      .pageServicesDash .techPickPanel.diagSection .techRow{
        font-size:14px !important;
        font-weight:700 !important;
        line-height:1.2 !important;
        padding:6px 8px !important;
      }
      .pageServicesDash .techPickPanel.diagSection .techRow .rankNum,
      .pageServicesDash .techPickPanel.diagSection .techRow .mini,
      .pageServicesDash .techPickPanel.diagSection .techRow a.tbJump{
        font-size:14px !important;
        font-weight:700 !important;
      }
      .pageServicesDash .techPickPanel.diagSection a.tbJump{
        background:transparent !important;
        border:none !important;
        box-shadow:none !important;
        padding:0 !important;
        margin:0 !important;
        color:inherit !important;
        text-decoration:underline !important;
        cursor:pointer !important;
        display:inline-block;
        max-width:100%;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      /* Diag legend: only color the RED/YELLOW/GREEN words; everything else stays white */
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend{color:#fff}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendRest{color:#fff}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendName{font-weight:1000}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendRed{color:#ff4b4b}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendYellow{color:#ffbf2f}
      .pageServicesDash .techPickPanel.diagSection .diagBandLegend .legendGreen{color:#1fcb6a}

      /* Header divider (used by this page): move it closer to the filters */
      .pageServicesDash .svcHdrDivider{height:1px;background:rgba(255,255,255,.12);margin:0}
      /* Put divider exactly midway between dials and filters */
      .pageServicesDash .svcHdrGoalDials{margin-bottom:12px !important;}
      .pageServicesDash .techHeaderPanel .mainFiltersBar{padding-top:12px !important;}
      /* Header panel: keep divider above filters, remove line below filters, push filters to bottom */
      .pageServicesDash .techHeaderPanel>.phead{display:flex;flex-direction:column;height:100%;border-bottom:none !important;}
      .pageServicesDash .techHeaderPanel .mainFiltersBar{margin-top:auto;display:flex;flex-direction:column;align-items:flex-start;gap:8px;}



      /* Service card header: keep right-side controls on one row (Dial -> Badge -> Focus Stat) */
      .pageServicesDash .catHeader .muted{color:var(--muted) !important;}
      .pageServicesDash .catHeader{display:flex;align-items:center;justify-content:space-between;gap:14px;}
      .pageServicesDash .catHdrLeft{min-width:0;}
      .pageServicesDash .sdCatHdrRow{display:flex;align-items:flex-start;justify-content:flex-end;gap:18px;flex:0 0 auto;white-space:nowrap;flex-direction:row !important;}
      .pageServicesDash .sdCatHdrRow .sdCatDialCol{order:1 !important;}
      .pageServicesDash .sdCatHdrRow .rankFocusBadge{order:2 !important;}
      .pageServicesDash .sdCatHdrRow .sdCatFocusStats{order:3 !important;}

      /* sdCatHdrRow rank badge: +15% size and adjust # position for double-digits */
      .pageServicesDash .sdCatHdrRow .rankFocusBadge.sm{
        transform:scale(1.15);
        transform-origin: top right;
      }
      /* Move the hash up/left so it hugs the top-left of the number (esp. 2 digits) */
      .pageServicesDash .sdCatHdrRow .rankFocusBadge.sm .rfbMain::before{
        left: calc(50% - (var(--w) * 0.27));
        transform: translate(-50%,-58%);
      }

      .pageServicesDash .sdCatHdrRow .pctText{display:flex;align-items:center;justify-content:center;}
      @media (max-width: 540px){
        .pageServicesDash .catHeader{flex-direction:column;align-items:flex-start;}
        .pageServicesDash .sdCatHdrRow{justify-content:flex-start;white-space:normal;}
}

      /* Tech list inside service cards */
      /* Service cards: fixed layout — name truncates, stats stay on one line */
      .pageServicesDash .catCard{min-width:0;max-width:none;width:100%;}

      .pageServicesDash .svcTechList{margin-top:10px;display:grid;gap:8px;}
      /* Tech name + meta typography in section header (requested) */
      .pageServicesDash .svcDashSecHead .svcTechLeft,
      .pageServicesDash .svcDashSecHead .svcTechLeft a{font-size:14px !important;font-weight:700 !important;}
      .pageServicesDash .svcDashSecHead .svcTechMetaRow{font-size:14px !important;font-weight:700 !important;}

      .pageServicesDash .svcTechRow{display:flex;flex-wrap:nowrap;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);}
      .pageServicesDash .svcTechLeft{display:flex;align-items:center;gap:8px;min-width:0;flex:1 1 0;}
      .pageServicesDash .svcTechLeft a{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;}
      .pageServicesDash .svcRankNum{color:rgba(255,255,255,.65);font-weight:1000;min-width:22px;text-align:right;flex-shrink:0;}
      .pageServicesDash .svcTechMeta{color:rgba(255,255,255,.72);font-weight:900;white-space:nowrap;font-size:12px;flex-shrink:0;}
      .pageServicesDash .svcTechMetaRow{display:inline-flex;align-items:center;gap:3px;font-size:14px;font-weight:700;white-space:nowrap;flex-wrap:nowrap;}
      .pageServicesDash .svcMetaDot{color:rgba(255,255,255,.35);margin:0 2px;}


      /* TechPickPanel toggle + thumbs (scoped) */
      .pageServicesDash .techPickPanel.diagSection .pickToggleRow{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:6px 2px -4px}
      .pageServicesDash .techPickPanel.diagSection .pickToggleLbl{font-size:16px;font-weight:1000;color:rgba(255,255,255,.80);letter-spacing:.2px;white-space:nowrap}

      /* Pick toggle emphasis: do NOT change toggle color; instead emphasize active word */
      .pageServicesDash .techPickPanel.diagSection .pickToggleLbl{display:flex;align-items:center;}
      .pageServicesDash .techPickPanel.diagSection .pickToggleWord{
        display:inline-block;
        transition:transform 140ms ease, opacity 140ms ease;
        opacity:.65;
        transform:scale(1);
        transform-origin:center center;
        padding:0 2px; /* small buffer so scaled text doesn't crowd the slash */
      }
      .pageServicesDash .techPickPanel.diagSection .pickToggleSlash{
        display:inline-block;
        margin:0 12px;           /* extra breathing room on both sides */
        min-width:12px;          /* keeps a consistent center gap */
        text-align:center;
        opacity:.55;
      }
      /* Emphasize the active word via scale + a tiny nudge away from the slash */
      .pageServicesDash .techPickPanel.diagSection .pickToggleState-tech .pickWordTech{
        opacity:1 !important;
        transform:scale(1.15) translateX(-2px);
      }
      .pageServicesDash .techPickPanel.diagSection .pickToggleState-services .pickWordSvc{
        opacity:1 !important;
        transform:scale(1.15) translateX(2px);
      }
      .pageServicesDash .techPickPanel.diagSection .pickToggleState-tech .pickWordSvc,
      .pageServicesDash .techPickPanel.diagSection .pickToggleState-services .pickWordTech{
        opacity:.55 !important;
      }
      /* Keep the toggle track color the same in both states */
      .pageServicesDash .techPickPanel.diagSection .pickToggle input:checked + .slider{
        background:rgba(255,255,255,.18) !important;
      }
      .pageServicesDash .techPickPanel.diagSection .pickToggleRight{display:flex;align-items:center;gap:10px;justify-content:flex-end;}
      .pageServicesDash .techPickPanel.diagSection .pickToggle{position:relative;width:46px;height:24px;flex:0 0 auto}
      .pageServicesDash .techPickPanel.diagSection .pickToggle input{opacity:0;width:0;height:0}
      .pageServicesDash .techPickPanel.diagSection .pickToggle .slider{position:absolute;inset:0;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.12);cursor:pointer;transition:background 140ms ease}
      .pageServicesDash .techPickPanel.diagSection .pickToggle .slider:before{content:"";position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:999px;background:rgba(255,255,255,.92);transition:transform 140ms ease}
      .pageServicesDash .techPickPanel.diagSection .pickToggle input:checked + .slider{background:rgba(31,203,106,.28)}
      .pageServicesDash .techPickPanel.diagSection .pickToggle input:checked + .slider:before{transform:translateX(22px)}

      .pageServicesDash .techPickPanel.diagSection .thumbIcon{font-size:28px;line-height:1;display:inline-flex;align-items:center;justify-content:center;margin-left:6px}
      .pageServicesDash .techPickPanel.diagSection .thumbIcon.up{color:#1fcb6a}
      .pageServicesDash .techPickPanel.diagSection .thumbIcon.down{color:#ff4b4b}

      /* Mini headers (Top/Bottom 3) */
      .pageServicesDash .techPickPanel.diagSection .pickMiniHdr{font-size:14px !important;line-height:1.1 !important;}

      /* Status icons */
      .pageServicesDash .svcIcon{
        display:inline-flex;align-items:center;justify-content:center;
        vertical-align:middle;margin-left:6px;
      }
      /* Base sizes: triangles 2x, green circle +50% */
      .pageServicesDash .svcIcon-good{width:18px;height:18px;}
      .pageServicesDash .svcIcon-warn,
      .pageServicesDash .svcIcon-orange,
      .pageServicesDash .svcIcon-bad{width:24px;height:24px;}
      .pageServicesDash .svcIcon-good svg{width:18px;height:18px;display:block}
      .pageServicesDash .svcIcon-warn svg,
      .pageServicesDash .svcIcon-orange svg,
      .pageServicesDash .svcIcon-bad svg{width:24px;height:24px;display:block}
      /* Make the ! a bit smaller inside triangles */
      .pageServicesDash .svcIcon-warn text,
      .pageServicesDash .svcIcon-orange text,
      .pageServicesDash .svcIcon-bad text{font-size:7.9px !important;}
      @media (max-width: 540px){
        .pageServicesDash .svcTechRow{flex-direction:column;align-items:flex-start;}
        .pageServicesDash .svcTechMeta{white-space:normal;}
        .pageServicesDash .svcTechLeft a{max-width:100%;}
      }
      /* Header filters sizing (local to this page) */
      /* Header filters: 13px */

      /* Header note under filters (2-line italic, far-left) */
      .pageServicesDash .techHeaderPanel .svcHdrNote{
  margin-top:0;
  font-size:13px;
  color:rgba(255,255,255,.70);
  line-height:1.15;
  text-align:left;
}
.pageServicesDash .techHeaderPanel .svcHdrNote .svcHdrNoteL1,
.pageServicesDash .techHeaderPanel .svcHdrNote .svcHdrNoteL2{white-space:nowrap;}
.pageServicesDash .techHeaderPanel .svcHdrNote em{font-style:italic;}

      
      /* Header stat tags under numbers */
      .pageServicesDash .techHeaderPanel .tag{font-size:14px !important;}
.pageServicesDash .techHeaderPanel .mainFiltersBar,
      .pageServicesDash .techHeaderPanel .mainFiltersBar label,
      .pageServicesDash .techHeaderPanel .mainFiltersBar select{font-size:13px !important;}

      /* Header pills: use mini pills */
      .pageServicesDash .techHeaderPanel .pillsMini{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:0;}
      .pageServicesDash .techHeaderPanel .pillMini{padding:8px 12px !important;}

      .pageServicesDash .techHeaderPanel .pillMini .k{font-size:16px !important;text-transform:none !important;}
      .pageServicesDash .techHeaderPanel .pillMini .v{font-size:20px !important;line-height:1.05 !important;}
      .pageServicesDash .techHeaderPanel .pillMini.sold .v{color:#fff !important;}

      /* Section header pills: label 15px muted grey, value 18px white, padding 7px 10px */
      .pageServicesDash .svcDashSecHead .pillMini{padding:7px 10px !important;}
      .pageServicesDash .svcDashSecHead .pillMini .k{font-size:15px !important;color:var(--muted) !important;font-weight:1000;text-transform:none !important;}
      .pageServicesDash .svcDashSecHead .pillMini .v{font-size:18px !important;color:#fff !important;font-weight:1000;line-height:1.05 !important;}


      /* Header goal dials (match Tech Details focus dial sizing/typography) */
      .pageServicesDash .svcHdrGoalDials{display:flex;gap:22px;align-items:flex-start;margin-top:10px;}

      .pageServicesDash .svcHdrGoalDials .svcGaugeWrap{--sz:85px;width:var(--sz);height:var(--sz);flex:0 0 var(--sz);}
      .pageServicesDash .svcHdrGoalDials .svcGauge{--sz:85px !important;width:var(--sz) !important;height:var(--sz) !important;}
      .pageServicesDash .svcHdrGoalDials .svcGaugeWrap,
      .pageServicesDash .svcHdrGoalDials .svcGauge{cursor:pointer !important;}
      .pageServicesDash .svcHdrGoalDials .svcGauge *{pointer-events:none;}

      .pageServicesDash .svcHdrGoalDials .svcGaugeLbl{margin-top:6px;text-align:center;font-size:11px;font-weight:1000;color:rgba(255,255,255,.70);letter-spacing:.2px;}
      .pageServicesDash .svcHdrGoalDials .pctStack2{display:flex;flex-direction:column;gap:1px;align-items:center;justify-content:center;}
      .pageServicesDash .svcHdrGoalDials .pctArrow{font-weight:1200;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35));}
      .pageServicesDash .svcHdrGoalDials .pctSub{font-size:12px;opacity:.85;font-style:normal;font-weight:900;letter-spacing:.3px;line-height:1;}
      /* Header goal dial text sizing */
      .pageServicesDash .svcHdrGoalDials .pctMain{font-size:18px;font-weight:1000;line-height:1;}
      .pageServicesDash .svcHdrGoalDials .pctArrow{font-size:18px;line-height:1;}
      /* Service card header (sdCatHdrRow) dial is 2px smaller than header */
      .pageServicesDash .sdCatHdrRow .pctMain{font-size:16px;font-weight:1000;line-height:1;}
      .pageServicesDash .sdCatHdrRow .pctArrow{font-size:16px;line-height:1;}
      .pageServicesDash .sdCatHdrRow .pctSub{font-size:10px;font-weight:900;letter-spacing:.3px;line-height:1;}
      .pageServicesDash .sdCatHdrRow .pctStack2{display:flex;flex-direction:column;gap:1px;align-items:center;justify-content:center;}



      .pageServicesDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen{display:flex !important;flex-direction:column !important;gap:8px !important;width:100% !important;}
      .pageServicesDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen .filterRow{display:grid !important;grid-template-columns:repeat(3, minmax(110px,1fr)) !important;gap:8px !important;width:100% !important;}
      @media(max-width:560px){
        .pageServicesDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen .filterRow{grid-template-columns:1fr !important;}
      }

      /* View mode buttons */
      .pageServicesDash .svcViewModeBtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;width:100%;}
      .pageServicesDash .svcViewModeBtn{
        flex:1 1 auto;padding:7px 12px;border-radius:10px;
        border:2px solid rgba(200,45,45,.4);
        background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);
        font-size:13px;font-weight:800;letter-spacing:.2px;
        cursor:pointer;transition:background 110ms,color 110ms,border-color 110ms,box-shadow 110ms;
        text-align:center;white-space:nowrap;
      }
      .pageServicesDash .svcViewModeBtn:hover{background:rgba(200,45,45,.18);color:#fff;border-color:rgba(200,45,45,.75);}
      .pageServicesDash .svcViewModeBtn.active{
        background:rgba(200,45,45,.32);color:#fff;
        border-color:rgba(200,45,45,.9);
        box-shadow:0 0 10px rgba(200,40,40,.32);
      }
      .pageServicesDash select:disabled{opacity:.35 !important;cursor:not-allowed !important;}

      /* Dropdown text colors: selected value white, dropdown list black */
      .pageServicesDash .techHeaderPanel select{color:#fff !important;}
      .pageServicesDash .techHeaderPanel select option{color:#000 !important;}
      /* === sdCatHdrRow dial label positioning (service card header dials ONLY) === */
      .pageServicesDash .sdCatHdrRow .svcGaugeCol{
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:flex-start;
      }
      .pageServicesDash .sdCatHdrRow .svcGaugeWrap{order:1;}
      .pageServicesDash .sdCatHdrRow .svcGaugeLbl{
        order:2;
        margin-top:6px;
        text-align:center;
        width:100%;
        transform:none;
      }
      /* Lock the dial column to the dial size so the label centers perfectly */
      .pageServicesDash .sdCatHdrRow .sdCatDialCol{width:80px !important;}
      .pageServicesDash .sdCatHdrRow .sdCatDialCol .svcGaugeWrap{width:80px !important;height:80px !important;}
      .pageServicesDash .sdCatHdrRow .sdCatDialCol .svcGaugeLbl{
        width:80px !important;
        padding-left:0 !important;
        padding-right:0 !important;
        margin-left:0 !important;
        margin-right:0 !important;
        left:auto !important;
        right:auto !important;
      }
      /* Keep the rank badge and focus stats pinned to the top of the row */
      .pageServicesDash .sdCatHdrRow .rankFocusBadge{align-self:flex-start !important;margin-top:0 !important;}
      .pageServicesDash .sdCatHdrRow .sdCatFocusStats{align-self:flex-start !important;}

      /* ===== Info icon button ===== */
      .pageServicesDash .svcInfoIconBtn{
        background:transparent;border:none;padding:0;margin:0 0 0 7px;
        color:rgba(255,255,255,.48);cursor:pointer;
        display:inline-flex;align-items:center;justify-content:center;
        vertical-align:middle;line-height:1;flex-shrink:0;
        transition:color 120ms ease;
      }
      .pageServicesDash .svcInfoIconBtn:hover{color:rgba(255,255,255,.9);}
      /* catTitle row: keep icon vertically centered with title */
      .pageServicesDash .catTitleRow{display:flex;align-items:center;flex-wrap:nowrap;}
      .pageServicesDash .svcDashSecTitleRow .svcInfoIconBtn{margin-left:9px;}

      /* ===== Clickable * stats ===== */
      .pageServicesDash .svcStatStar{cursor:pointer;}
      .pageServicesDash .svcStatStar:hover .statValTop,
      .pageServicesDash .svcStatStar:hover .statValBot,
      .pageServicesDash .svcStatStar:hover .sdCatStatTop,
      .pageServicesDash .svcStatStar:hover .sdCatStatMid{
        filter:brightness(1.5);color:#fff !important;opacity:1 !important;
      }
      .pageServicesDash .svcStatStar:hover .statLbl,
      .pageServicesDash .svcStatStar:hover .sdCatStatLbl{
        filter:brightness(1.4);color:rgba(255,255,255,.9) !important;opacity:1 !important;
      }
      .pageServicesDash .pillMini.svcStatStar:hover .k,
      .pageServicesDash .pillMini.svcStatStar:hover .v{
        filter:brightness(1.5);color:#fff !important;opacity:1 !important;
      }
      .pageServicesDash .svcStarInline{ display:inline; }
      .pageServicesDash .svcStatStar.svcStarInline:hover{
        filter:brightness(1.5);color:#fff !important;opacity:1 !important;
      }
      .pageServicesDash .pillMini.svcStatStar .k,
      .pageServicesDash .pillMini.svcStatStar .v,
      .pageServicesDash .svcStatStar .statValTop,
      .pageServicesDash .svcStatStar .statValBot,
      .pageServicesDash .svcStatStar .sdCatStatTop,
      .pageServicesDash .svcStatStar .sdCatStatMid,
      .pageServicesDash .svcStatStar .statLbl,
      .pageServicesDash .svcStatStar .sdCatStatLbl,
      .pageServicesDash .svcStarInline{ transition:filter 120ms,color 120ms,opacity 120ms; }

      /* ===== Info popup ===== */
      .svcInfoPopup{
        position:fixed;z-index:9995;
        width:360px;max-width:calc(100vw - 20px);
        background:linear-gradient(160deg,rgba(24,30,50,.99),rgba(10,14,26,.99));
        border:1px solid rgba(255,255,255,.13);
        border-radius:14px;
        box-shadow:0 20px 56px rgba(0,0,0,.60),0 0 0 1px rgba(255,255,255,.04);
        padding:14px 16px 16px;
        font-size:13px;font-weight:700;line-height:1.65;color:rgba(255,255,255,.86);
      }
      .svcInfoPopup .svcInfoPopHdr{
        display:flex;align-items:center;justify-content:space-between;
        margin-bottom:9px;
      }
      .svcInfoPopup .svcInfoPopTitle{
        font-size:12px;font-weight:900;letter-spacing:.1px;text-transform:none;
        color:rgba(255,255,255,.70);line-height:1.45;
      }
      .svcInfoPopup .svcInfoPopClose{
        background:transparent;border:none;color:rgba(255,255,255,.5);
        font-size:20px;cursor:pointer;line-height:1;padding:0 2px;
        transition:color 100ms;
      }
      .svcInfoPopup .svcInfoPopClose:hover{color:#fff;}
      .svcInfoPopup .svcInfoPopBody{font-size:13px;font-weight:700;line-height:1.65;color:rgba(255,255,255,.86);}

      /* Math stack two-column layout inside info popup */
      .svcInfoPopCols{display:flex;gap:0;align-items:stretch;}
      .svcInfoMathCol{flex:1 1 0;display:flex;flex-direction:column;gap:5px;padding:4px 14px 4px 0;}
      .svcInfoMathCol:last-child{padding:4px 0 4px 14px;}
      .svcInfoColDivider{width:1px;background:rgba(255,255,255,.14);flex-shrink:0;}
      .svcInfoMathRow{display:flex;align-items:baseline;gap:7px;}
      .svcInfoNum{font-size:13px;font-weight:1000;color:#fff;white-space:nowrap;min-width:52px;text-align:right;font-variant-numeric:tabular-nums;}
      .svcInfoNumLbl{font-size:11px;font-weight:700;color:rgba(255,255,255,.55);white-space:nowrap;}
      .svcInfoMathLine{height:1px;background:rgba(255,255,255,.25);margin:3px 0;}
      .svcInfoMathResult .svcInfoNum{color:#fff;font-size:14px;}
      .svcInfoMathResult .svcInfoNumLbl{color:rgba(255,255,255,.8);font-size:11px;font-weight:900;}

      /* ===== Focus stats in catCard header (Technicians mode) ===== */
      .pageServicesDash .sdCatFocusStats{
        display:flex;flex-direction:column;gap:8px;align-items:flex-end;
        align-self:flex-start;
      }
      .pageServicesDash .sdCatFocusStats>div{display:flex;flex-direction:column;align-items:flex-end;}
      .pageServicesDash .sdCatFocusStats .sdCatStatTop{
        font-size:26px;line-height:1;font-weight:1000;color:#fff;text-align:right;
      }
      .pageServicesDash .sdCatFocusStats .sdCatStatMid{
        font-size:18px;line-height:1;font-weight:1000;color:#fff;opacity:.92;text-align:right;
      }
      .pageServicesDash .sdCatFocusStats .sdCatStatBot{
        font-size:15px;line-height:1;font-weight:1000;color:#fff;opacity:.85;text-align:right;
      }
      .pageServicesDash .sdCatFocusStats .sdCatStatLbl{
        font-size:11px;line-height:1.1;font-weight:1000;
        color:rgba(255,255,255,.52);letter-spacing:.2px;text-align:right;margin-top:2px;
      }

    `;
  })();

  // ---- Local state (kept independent of main dashboard state) ----
  if(typeof UI === 'undefined') window.UI = {};
  if(!UI.servicesDash) UI.servicesDash = { focus: 'asr', goalMetric: 'asr', team: 'store', fluids: 'with', open: {}, soldFocus: 'asrs', preMpi: 'excluded', viewMode: 'techs', _lastViewMode: '' };

  const st = UI.servicesDash;

  // Read querystring from hash (optional deep-link)
  const hash = location.hash || "";
  const qs = hash.includes("?") ? hash.split("?")[1] : "";
  if(qs){
    for(const part of qs.split("&")){
      const [k,v]=part.split("=");
      if(k==="focus") st.focus = decodeURIComponent(v||"asr") || "asr";
      if(k==="goal") st.goalMetric = (decodeURIComponent(v||"asr")==="sold") ? "sold" : "asr";
      if(k==="team") st.team = decodeURIComponent(v||"store") || "store";
      if(k==="fluids") st.fluids = decodeURIComponent(v||"with") || "with";
      if(k==="soldFocus") st.soldFocus = decodeURIComponent(v||"asrs") || "asrs";
      if(k==="preMpi") st.preMpi = (decodeURIComponent(v||"included")==="excluded") ? "excluded" : "included";
      if(k==="viewMode"){ const vm=decodeURIComponent(v||"techs"); st.viewMode=(vm==='advisors')?'advisors':'techs'; }
    }
  }

  // Apply per-mode defaults only when viewMode first changes
  const viewMode = (st.viewMode==='advisors') ? 'advisors' : 'techs';
  if(viewMode !== st._lastViewMode){
    st._lastViewMode = viewMode;
    if(viewMode === 'advisors'){
      st.preMpi = 'included'; st.focus = 'sold'; st.goalMetric = 'sold'; st.soldFocus = 'asrs';
    } else {
      st.preMpi = 'excluded'; st.focus = 'asr'; st.goalMetric = 'asr'; st.soldFocus = 'asrs';
    }
  }

  const focus      = (st.focus === 'sold') ? 'sold' : 'asr';
  const goalMetric = (st.goalMetric === 'sold') ? 'sold' : 'asr';
  const teamSel    = (st.team === 'express' || st.team === 'kia') ? st.team : 'store';
  const fluidsSel  = (st.fluids === 'without' || st.fluids === 'only' || st.fluids === 'with') ? st.fluids : 'with';
  const soldFocus  = (st.soldFocus === 'ro') ? 'ro' : 'asrs';
  // preMpi: techs always locked to excluded; advisors user-controlled (defaults included)
  const preMpi     = (viewMode === 'techs') ? 'excluded' : ((st.preMpi === 'excluded') ? 'excluded' : 'included');
  const _preMpiApplies = (viewMode !== 'advisors');
  const comparison = 'goal';

  const pickView = (st.pickView === 'services') ? 'services' : 'tech';

  const focusLine = (focus === 'sold') ? 'Sold Goal' : 'ASR Goal';

  // Techs live in DATA.techs (EXPRESS/KIA), advisors in DATA.advisors (separate array)
  // Both lists are filtered to only include users whose role matches in dealer settings.
  const _rawTechsAll = (typeof DATA !== 'undefined' && Array.isArray(DATA.techs))
    ? DATA.techs.filter(t => t && (t.team==='EXPRESS' || t.team==='KIA')
        && (typeof window.isListedTech !== 'function' || window.isListedTech(t.name)))
    : [];
  const _rawAdvisors = (typeof DATA !== 'undefined' && Array.isArray(DATA.advisors))
    ? DATA.advisors.filter(a => a
        && (typeof window.isListedAdvisor !== 'function' || window.isListedAdvisor(a.name)))
    : [];

  // Apply team filter (techs only)
  const _rawTechs = (teamSel === 'express') ? _rawTechsAll.filter(t=>t.team==='EXPRESS')
                  : (teamSel === 'kia')     ? _rawTechsAll.filter(t=>t.team==='KIA')
                  :                           _rawTechsAll;

  // Normalize advisor categories: map sold_total or sold → sold so all downstream logic is unified.
  // When Pre-MPI Included: use sold_total (tech-closed + advisor pre-MPI) — fixes Fluids/Brakes/Tires.
  // When Pre-MPI Excluded:  use sold only (tech-closed portion).
  const _normAdvisors = _rawAdvisors.map(a => {
    const normCats = {};
    for(const [k,v] of Object.entries(a.categories||{})){
      const soldVal = (preMpi === 'included')
        ? (Number(v.sold_total) || (Number(v.sold)||0) + (Number(v.advisor_sold)||0))
        : (Number(v.sold)||0);
      normCats[k] = {...v, sold: soldVal};
    }
    return {...a, _isAdvisor: true, categories: normCats};
  });

  const _techsUnfiltered = (viewMode === 'advisors') ? _normAdvisors : _rawTechs;

  // ── Date-range filter ────────────────────────────────────────────────────────
  // Read the global date range set by the date picker in index.html.
  // All RO-level counts (ros, asr, sold, per-category) are recomputed from
  // ro_rows so the entire dashboard reflects the selected date window.
  const _dr      = window.globalDateRange || {};
  const _drStart = _dr.start || null;  // "YYYY-MM-DD" or null (no lower bound)
  const _drEnd   = _dr.end   || null;  // "YYYY-MM-DD" or null (no upper bound)

  function _roInRange(ro) {
    if (!_drStart && !_drEnd) return true;
    const d = ro.dms_close;
    if (!d) return false;
    if (_drStart && d < _drStart) return false;
    if (_drEnd   && d > _drEnd)   return false;
    return true;
  }

  // Fluid / non-fluid category lists (mirrors build_data.py NON_FLUID_PRIMARY / FLUID_CATS)
  const _fluidCats = new Set(Array.isArray(DATA.fluid_categories) ? DATA.fluid_categories : []);
  const _allDataCats = (Array.isArray(DATA.sections) ? DATA.sections : [])
    .flatMap(s => (s?.categories || []).map(String).filter(Boolean));
  const _nonFluidCats = _allDataCats.filter(c => !_fluidCats.has(c));

  function _filteredEntity(entity) {
    const filtered = (entity.ro_rows || []).filter(_roInRange);
    const n = filtered.length;

    // Recount asr/sold per category from filtered ro_rows
    const catAsr  = {};
    const catSold = {};
    for (const row of filtered) {
      for (const c of (row.asr_cats  || [])) catAsr[c]  = (catAsr[c]  || 0) + 1;
      for (const c of (row.sold_cats || [])) catSold[c] = (catSold[c] || 0) + 1;
    }

    // Rebuild categories preserving all original fields, updating asr/sold counts
    const newCats = {};
    for (const [k, orig] of Object.entries(entity.categories || {})) {
      const a = catAsr[k]  || 0;
      const s = catSold[k] || 0;
      const entry = {
        ...orig,
        asr:  a,
        req:  n ? a / n : 0,
        sold: s,
        close: a ? s / a : null,
      };
      // Advisors: advisor_sold is from DMS (no ro_rows to date-filter it), keep original
      if (orig.advisor_sold !== undefined) {
        const adv_s = Number(orig.advisor_sold) || 0;
        entry.sold_total = s + adv_s;
        entry.sold_ro    = n ? (s + adv_s) / n : 0;
      }
      newCats[k] = entry;
    }

    // Rebuild summary buckets
    function _bkt(catList) {
      const a = catList.reduce((sum, c) => sum + (catAsr[c]  || 0), 0);
      const s = catList.reduce((sum, c) => sum + (catSold[c] || 0), 0);
      const b = { asr: a, asr_per_ro: n ? a / n : 0, sold: s, sold_pct: a ? s / a : null };
      const origBkt = entity.summary?.total; // use total as proxy for advisor_sold sums
      if (origBkt?.advisor_sold !== undefined) {
        const adv_s = catList.reduce((sum, c) => sum + (Number((entity.categories || {})[c]?.advisor_sold) || 0), 0);
        b.advisor_sold = adv_s;
        b.sold_total   = s + adv_s;
        b.sold_ro      = n ? (s + adv_s) / n : 0;
      }
      return b;
    }

    const newSummary = {
      without_fluids: _bkt(_nonFluidCats),
      fluids_only:    _bkt(Array.from(_fluidCats)),
      total:          _bkt([..._nonFluidCats, ...Array.from(_fluidCats)]),
    };

    return { ...entity, ros: n, summary: newSummary, categories: newCats };
  }

  const techs = _techsUnfiltered.map(_filteredEntity);
  // ── End date-range filter ────────────────────────────────────────────────────

  const personLabelSingular = (viewMode==='advisors') ? 'Advisor' : 'Technician';
  const personLabelPlural   = (viewMode==='advisors') ? 'Advisors' : 'Technicians';
// Determine the metric used for goal comparisons/ranking
  const rankMetric = (focus==='sold') ? 'sold' : 'asr';

  // Overall totals (team-scoped)
  const totalRos     = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const totalAsr     = techs.reduce((s,t)=>s+(Number(t.summary?.total?.asr)||0),0);
  const totalSoldAsr = techs.reduce((s,t)=>s+(Number(t.summary?.total?.sold)||0),0); // ASR-sold only, never changes

  // --- Pre-MPI sold helpers (use filtered _rawAdvisors so unlisted advisors are excluded) ---
  function preMpiSoldForService(serviceName){
    let total = 0;
    for(const a of _rawAdvisors){
      const cat = (a.categories||{})[serviceName];
      total += Number(cat?.advisor_sold)||0;
    }
    return total;
  }
  const totalPreMpiSold = (()=>{
    let total = 0;
    for(const a of _rawAdvisors){
      for(const cat of Object.values(a.categories||{})){
        total += Number(cat?.advisor_sold)||0;
      }
    }
    return total;
  })();

  // Pre-MPI sold ADDS to Sold/RO when included (sold before MPI by advisors, no ASR attached to techs).
  // In advisor mode, advisor_sold IS already their metric — don't double-count it.
  const totalSoldForRo = (_preMpiApplies && preMpi === 'included') ? (totalSoldAsr + totalPreMpiSold) : totalSoldAsr;
  const totalSold    = totalSoldForRo; // used for display pills (shows what's in Sold/RO)
  const soldPerAsr   = totalAsr ? (totalSoldAsr / totalAsr) : null;  // NEVER changes with filter
  const asrPerRo     = totalRos ? (totalAsr / totalRos) : null;
  const soldPerRo    = totalRos ? (totalSoldForRo / totalRos) : null; // changes with filter

  // For GOAL focus, compute store/team-level goal ratios (rough: total metric / total goal)
  function _storeGoalRatios(){
    // Sum goals across *existing* categories in DATA.sections
    const cats = [];
    (DATA.sections||[]).forEach(s=> (s.categories||[]).forEach(c=>{ if(c) cats.push(String(c)); }));
    const uniq = Array.from(new Set(cats));

    let gAsr = 0; // goal ASR/RO summed across cats (approx) using goal raw fractions (already per-RO for service)
    let gSold = 0; // goal sold/RO approx = sum(goalReq * goalClose)
    for(const cat of uniq){
      const gReq = Number(getGoal(cat,'req'));
      const gClose = Number(getGoal(cat,'close'));
      if(Number.isFinite(gReq)) gAsr += gReq;
      if(Number.isFinite(gReq) && Number.isFinite(gClose)) gSold += (gReq * gClose);
    }
    // Current team/store actuals across those same cats (sum req across cats per tech -> then average?)
    // Keep it simple: use the main totals above.
    // - asrPerRo is totalAsr/totalRos
    // - soldPerRo is totalSold/totalRos
    const asrPctOfGoal = (Number.isFinite(asrPerRo) && Number.isFinite(gAsr) && gAsr>0) ? (asrPerRo/gAsr) : null;
    const soldPctOfGoal = (Number.isFinite(soldPerRo) && Number.isFinite(gSold) && gSold>0) ? (soldPerRo/gSold) : null;
    return {gAsr, gSold, asrPctOfGoal, soldPctOfGoal};
  }

  const goalsAgg = _storeGoalRatios();

  // --- Local helper: stacked-label dial ---
  // Avoids relying on any undefined helpers (e.g., fmtDec) and keeps dial text stacked.
  // Uses the same .svcGauge markup pattern so animateSvcGauges()/initSvcGaugeHold() still work.
  function svcGaugeStack(pct, topLabel, bottomLabel){
    const p = Number.isFinite(pct) ? Math.max(0, pct) : 0;
    const ring = Math.round(Math.min(p, 1) * 100);

    let cls = "gRed";
    if(window.getDialClass){ cls = window.getDialClass(p); }
    else if(p >= 0.80) cls = "gGreen";
    else if(p >= 0.60) cls = "gYellow";

    const top = String(topLabel||"").trim();
    const bot = String(bottomLabel||"").trim();

    // Alternate view: +/- vs baseline (baseline is GOAL here)
    const delta = Math.round((p - 1) * 100);
    const absDelta = Math.abs(delta);
    const arrow = (delta >= 0) ? "▲" : "▼";
    const arrowColor = (delta >= 0) ? "#2ecc71" : "#f04545";

    const defaultHtml = `<span class="pctText pctDefault"><span class="pctTitle">${safe(top)}</span><span class="pctTitle">${safe(bot)}</span></span>`;
    const altHtml = `<span class="pctText pctAlt"><span class="pctMain">${absDelta}%</span><span class="pctArrow" style="color:${arrowColor}">${arrow}</span><span class="pctSub">Goal</span></span>`;

    return `<span class="svcGauge ${cls}" data-p="${ring}">
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle class="bg" cx="18" cy="18" r="15.91549430918954"></circle>
        <circle class="fg" cx="18" cy="18" r="15.91549430918954"></circle>
      </svg>
      ${defaultHtml}
      ${altHtml}
    </span>`;
  }


  // --- Header: goal focus dials (match Tech Details focus dial: % + arrow + GOAL stacked) ---
  function headerGoalDial(pct, popupData){
    const p = Number(pct);
    const finite = Number.isFinite(p);
    const pClamped = finite ? Math.max(0, p) : 0;
    const ring = Math.round(Math.min(pClamped, 1) * 100);

    let cls = "gRed";
    if(window.getDialClass){ cls = window.getDialClass(pClamped); }
    else if(pClamped >= 0.80) cls = "gGreen";
    else if(pClamped >= 0.60) cls = "gYellow";

    // percent above/below goal
    const delta = finite ? Math.round((pClamped - 1) * 100) : null;
    const absDelta = (delta===null) ? "—" : Math.abs(delta);
    const arrow = (delta===null) ? "" : (delta >= 0 ? "▲" : "▼");
    const arrowColor = (delta===null) ? "rgba(255,255,255,.55)" : (delta >= 0 ? "rgba(34,197,94,.98)" : "rgba(239,68,68,.98)");

    const popAttr = popupData ? ` data-gauge-popup="${safe(JSON.stringify(popupData)).replace(/'/g,'&#39;')}"` : '';

    return `<span class="svcGauge ${cls}" data-p="${ring}"${popAttr}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle class="bg" cx="18" cy="18" r="15.91549430918954"></circle>
        <circle class="fg" cx="18" cy="18" r="15.91549430918954"></circle>
      </svg>
      <span class="pctText">
        <span class="pctStack2">
          <span class="pctMain">${absDelta}%</span>
          <span class="pctArrow" style="color:${arrowColor}">${arrow}</span>
          <span class="pctSub">Goal</span>
        </span>
      </span>
    </span>`;
  }

// --- Service tile goal dial (same stacked % / arrow / Goal format as svcHdrGoalDials) ---
function serviceGoalDial(pct, sz, popupData){
  const p = Number(pct);
  const finite = Number.isFinite(p);
  const pClamped = finite ? Math.max(0, p) : 0;
  const ring = Math.round(Math.min(pClamped, 1) * 100);

  let cls = "gRed";
  if(window.getDialClass){ cls = window.getDialClass(pClamped); }
  else if(pClamped >= 0.80) cls = "gGreen";
  else if(pClamped >= 0.60) cls = "gYellow";

  const delta = finite ? Math.round((pClamped - 1) * 100) : null;
  const absDelta = (delta===null) ? "—" : Math.abs(delta);
  const arrow = (delta===null) ? "" : (delta >= 0 ? "▲" : "▼");
  const arrowColor = (delta===null) ? "rgba(255,255,255,.55)" : (delta >= 0 ? "rgba(34,197,94,.98)" : "rgba(239,68,68,.98)");

  const s = Number(sz);
  const size = Number.isFinite(s) && s>0 ? Math.round(s) : 72;

  const popAttr = popupData ? ` data-gauge-popup="${safe(JSON.stringify(popupData)).replace(/'/g,'&#39;')}"` : '';

  /* IMPORTANT: the dial size MUST be applied to the svcGauge itself (not just the wrapper),
     because app.css defines a default --sz on .svcGauge. */
  return `<span class="svcGauge ${cls}" data-p="${ring}" style="--sz:${size}px;width:${size}px;height:${size}px"${popAttr}>
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <circle class="bg" cx="18" cy="18" r="15.91549430918954"></circle>
      <circle class="fg" cx="18" cy="18" r="15.91549430918954"></circle>
    </svg>
    <span class="pctText">
      <span class="pctStack2">
        <span class="pctMain">${absDelta}%</span>
        <span class="pctArrow" style="color:${arrowColor}">${arrow}</span>
        <span class="pctSub">Goal</span>
      </span>
    </span>
  </span>`;
}



  // --- Popup data builder for Services Dashboard dials ---
function _svcDialPopup(pct, goalVal, actualVal, goalLbl, actualLbl, actualIsDecimal){
  const p = Number.isFinite(Number(pct)) ? Number(pct) : 0;
  const band = window.getColorBand ? window.getColorBand(p) : (p>=0.80?'green':p>=0.60?'yellow':'red');
  const pctAtt = Number.isFinite(p) ? Math.round(p*100)+'%' : '—';
  const _fPct = v => Number.isFinite(Number(v)) ? (Number(v)*100).toFixed(1)+'%' : '—';
  const _fDec = v => Number.isFinite(Number(v)) ? Number(v).toFixed(2) : '—';
  const _fAuto = v => { const n=Number(v); return Number.isFinite(n) ? (n<2 ? (n*100).toFixed(1)+'%' : n.toFixed(2)) : '—'; };
  return {
    rows:[
      { label: goalLbl   || 'Goal',   value: _fAuto(goalVal)                          },
      { label: actualLbl || 'Actual', value: actualIsDecimal ? _fDec(actualVal) : _fAuto(actualVal) }
    ],
    iconBand: band,
    pctAttained: pctAtt
  };
}
  const _allCatsSet = new Set();
  for(const t of techs){ for(const k of Object.keys(t.categories||{})) _allCatsSet.add(k); }

  const _allServiceNames = (Array.isArray(DATA.sections)?DATA.sections:[])
    .flatMap(s => (s?.categories||[]).map(String).filter(Boolean))
    .filter(c => _allCatsSet.has(c));
  const _uniqServices = Array.from(new Set(_allServiceNames));
  const _svcRankDen = _uniqServices.length || 1;
  const _svcGoalPct = new Map();
  for(const svcName of _uniqServices){
    let ros=0, asr=0, soldAsr=0;
    for(const t of techs){
      const row = (t.categories||{})[svcName];
      if(!row) continue;
      ros     += Number(row.ros)||0;
      asr     += Number(row.asr)||0;
      soldAsr += Number(row.sold)||0;
    }
    // Sold/ASR (closeTot) never changes with pre-MPI filter
    // Sold/RO uses soldForRo only when rankMetric==='sold' and soldFocus==='ro'
    const preMpiSvc = preMpiSoldForService(svcName);
    const soldForRo = (_preMpiApplies && preMpi === 'included') ? (soldAsr + preMpiSvc) : soldAsr;
    const reqTot   = ros ? (asr / ros) : NaN;
    const closeTot = asr ? (soldAsr / asr) : NaN;       // Sold/ASR — never changes
    const soldPerRoSvc = ros ? (soldForRo / ros) : NaN; // Sold/RO — changes with filter
    const gReq   = Number(getGoal(svcName,'req'));
    const gClose = Number(getGoal(svcName,'close'));
    let pct;
    if(rankMetric === 'sold'){
      if(soldFocus === 'ro'){
        // Rank by Sold/RO vs goal (goal close is used as proxy; adapt: soldPerRo vs gReq*gClose)
        const gSoldRo = (Number.isFinite(gReq) && Number.isFinite(gClose)) ? (gReq * gClose) : NaN;
        pct = (Number.isFinite(soldPerRoSvc) && Number.isFinite(gSoldRo) && gSoldRo>0) ? (soldPerRoSvc/gSoldRo) : NaN;
      } else {
        pct = (Number.isFinite(closeTot) && Number.isFinite(gClose) && gClose>0) ? (closeTot/gClose) : NaN;
      }
    } else {
      pct = (Number.isFinite(reqTot) && Number.isFinite(gReq) && gReq>0) ? (reqTot/gReq) : NaN;
    }
    _svcGoalPct.set(svcName, pct);
  }

  const _ranked = _uniqServices
    .slice()
    .sort((a,b)=>{
      const av = _svcGoalPct.get(a);
      const bv = _svcGoalPct.get(b);
      const aN = Number.isFinite(av) ? av : -Infinity;
      const bN = Number.isFinite(bv) ? bv : -Infinity;
      if(aN===bN) return a.localeCompare(b);
      return aN < bN ? 1 : -1;
    });
  const _svcRankMap = new Map();
  _ranked.forEach((name, idx)=> _svcRankMap.set(name, idx+1));

  // Match renderTech's in-card (sm) rank badge markup/typography exactly.
  // Keep local to Services Dashboard so it won't affect other pages.
  function rankBadgeHtmlSvc(rank, total, top, small){
    const r = (rank===null || rank===undefined || rank==="") ? "—" : rank;
    const t = (total===null || total===undefined || total==="") ? "—" : total;
    const cls = small ? "rankFocusBadge sm" : "rankFocusBadge";
    return `
      <div class="${cls}">
        <div class="rfbFocus">${safe(top)}</div>
        <div class="rfbMain">${r}</div>
        <div class="rfbOf"><span class="rfbOfWord">of</span><span class="rfbOfNum">${t}</span></div>
      </div>
    `;
  }

  function goalRankBadge(serviceName){
    const rk = _svcRankMap.get(serviceName) || '—';
    const top = (rankMetric==='sold')
      ? (soldFocus==='ro' ? 'Sold/RO' : 'Sold/ASRs')
      : 'ASR';
    const total = fmtInt(_svcRankDen);
    return rankBadgeHtmlSvc(rk, total, top, true);
  }

  // ---- Info icon helper (Technicians mode only) ----
  function infoIconBtn(name, d){
    if(viewMode !== 'techs') return '';
    const payload = JSON.stringify(d || {}).replace(/"/g,'&quot;');
    return `<button class="svcInfoIconBtn" type="button" data-svcinfo="${payload}" data-svcname="${safe(name)}" aria-label="Formula info"><svg viewBox="0 0 20 20" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block"><circle cx="10" cy="10" r="8.5" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="10" cy="6.2" r="1" fill="currentColor"/></svg></button>`;
  }


  // Top-right block
  let topVal = asrPerRo;
  let topLbl = 'ASRs/RO';
  let subVal = (soldFocus === 'asrs') ? soldPerAsr : soldPerRo;
  let subLbl = (soldFocus === 'asrs') ? 'Sold/ASR' : 'Sold/RO';
  // When ASR Goal + Sold/ASR focus: top=ASRs/RO, sub=Sold/ASR, Sold/RO becomes a pill
  // When ASR Goal + Sold/RO focus: top=ASRs/RO, sub=Sold/RO
  if(focus === 'sold'){
    if(soldFocus === 'ro'){
      topVal = soldPerRo; topLbl = 'Sold/RO';
      subVal = asrPerRo;  subLbl = 'ASRs/RO';
    } else {
      topVal = soldPerAsr; topLbl = 'Sold/ASR';
      subVal = asrPerRo;   subLbl = 'ASRs/RO';
    }
  }
  // Show Sold/RO as extra pill only when ASR goal + Sold/ASR focus (since sub is Sold/ASR, Sold/RO is demoted)
  const showSoldRoPill = (focus === 'asr' && soldFocus === 'asrs') || viewMode === 'advisors';

  // Header panel (copied structure from Technician Dashboard)
  const header = `

    <!-- Floating menu button sits to the left of the header -->
<div class="techNotchStage" style="position:relative; width:100%; overflow:visible;">
  <div class="panel techMenuFloat" style="
    position:absolute;
    left:-80px;
    top:4px;
    width:72px;
    height:72px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:14px;
    z-index:2;
  ">
    <label for="menuToggle" class="hamburgerMini" aria-label="Menu" style="
      font-size:2.2em;
      line-height:1;
      display:flex;
      align-items:center;
      justify-content:center;
      cursor:pointer;
      color:inherit;
      user-select:none;
    ">☰</label>
  </div>

  <div class="panel techHeaderPanel" style="height:100%;min-width:0;">
      <div class="phead">
        <div class="titleRow techTitleRow">
<div class="techNameWrap">
            <div class="techDashTopRow" style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;justify-content:flex-start">
              <div style="display:flex;flex-direction:column;align-items:flex-start;min-width:0">
                <div class="h2 techH2Big">Services Dashboard</div>
                <div class="svcViewModeBtns">
                  <button class="svcViewModeBtn${viewMode==='advisors'?' active':''}" data-svcdash="1" data-ctl="viewMode" data-val="advisors">Advisors</button>
                  <button class="svcViewModeBtn${viewMode==='techs'?' active':''}" data-svcdash="1" data-ctl="viewMode" data-val="techs">Technicians</button>
                </div>
              </div>
              
              <div class="svcHdrPillsAndDials" style="display:flex;flex-direction:column;gap:10px;flex:1 1 auto;min-width:0">
                <div class="pillsMini">
                  <div class="pillMini"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
                  <div class="pillMini"><div class="k">ASRs</div><div class="v">${fmtInt(totalAsr)}</div></div>
                  <div class="pillMini sold"><div class="k">ASRs Sold</div><div class="v">${fmtInt(totalSoldAsr)}</div></div>
                  <div class="pillMini"><div class="k">Sold Pre-MPI</div><div class="v">${fmtInt(totalPreMpiSold)}</div></div>
                  <div class="pillMini sold"><div class="k">Sold/ASR</div><div class="v">${soldPerAsr===null ? "—" : fmtPct(soldPerAsr)}</div></div>
                  ${showSoldRoPill ? `<div class="pillMini"><div class="k">Sold/RO</div><div class="v">${soldPerRo===null ? "—" : fmt1(soldPerRo,2)}</div></div>` : ''}
                </div>

                <div class="svcHdrGoalDials">
                  <div class="svcGaugeCol">
                    <div class="svcGaugeWrap" style="--sz:85px">${headerGoalDial(goalsAgg.asrPctOfGoal, _svcDialPopup(goalsAgg.asrPctOfGoal, goalsAgg.gAsr, asrPerRo, 'ASR/RO Goal', 'Actual ASR/RO', true))}</div>
                    <div class="svcGaugeLbl">ASR</div>
                  </div>
                  <div class="svcGaugeCol">
                    <div class="svcGaugeWrap" style="--sz:85px">${headerGoalDial(goalsAgg.soldPctOfGoal, _svcDialPopup(goalsAgg.soldPctOfGoal, goalsAgg.gSold, soldPerRo, 'Sold/RO Goal', 'Actual Sold/RO'))}</div>
                    <div class="svcGaugeLbl">${soldFocus==='ro' ? 'Sold/RO' : 'Sold/ASRs'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="overallBlock">
            <div class="bigMain" style="font-size:38px;line-height:1.05;color:#fff;font-weight:1000">
              ${topVal===null || topVal===undefined ? "—" : (topLbl==='Sold/ASR' ? fmtPct(topVal) : fmt1(topVal,2))}
            </div>
            <div class="tag">${safe(topLbl)}</div>

            <div class="overallMetric" style="font-size:28px;line-height:1.05;color:#fff;font-weight:1000">
              ${subVal===null || subVal===undefined ? "—" : (subLbl==='Sold/ASR' ? fmtPct(subVal) : fmt1(subVal,2))}
            </div>
            <div class="tag">${safe(subLbl)}</div>
          </div>
        </div>

        <div class="svcHdrDivider"></div>
        <div class="mainFiltersBar">
          <div class="controls mainAlwaysOpen">
            <div class="filterRow row1">
              ${viewMode === 'techs' ? `
              <div>
                <label>Team</label>
                <select data-svcdash="1" data-ctl="team">
                  <option value="store" ${teamSel==='store'?'selected':''}>All Teams</option>
                  <option value="express" ${teamSel==='express'?'selected':''}>Express</option>
                  <option value="kia" ${teamSel==='kia'?'selected':''}>Kia</option>
                </select>
              </div>` : `<div>
                <label>Pre-MPI Sales</label>
                <select data-svcdash="1" data-ctl="preMpi">
                  <option value="included" ${preMpi==='included'?'selected':''}>Included</option>
                  <option value="excluded" ${preMpi==='excluded'?'selected':''}>Excluded</option>
                </select>
              </div>`}
              <div>
                <label>Focus</label>
                <select data-svcdash="1" data-ctl="focus">
                  <option value="asr" ${focus==='asr'?'selected':''}>ASR Goal</option>
                  <option value="sold" ${focus==='sold'?'selected':''}>Sold Goal</option>
                </select>
              </div>
              ${viewMode === 'advisors' ? `<div>
                <label>Sold Focus</label>
                <select data-svcdash="1" data-ctl="soldFocus">
                  <option value="asrs" ${soldFocus==='asrs'?'selected':''}>Sold/ASRs</option>
                  <option value="ro" ${soldFocus==='ro'?'selected':''}>Sold/RO</option>
                </select>
              </div>` : ''}
            </div>
          </div>
        <div class="svcHdrNote"><em><span class="svcHdrNoteL1">All metrics in the Services Dashboard are evaluated</span><br><span class="svcHdrNoteL2">by comparison to ASR or Sold Goals.</span></em></div>
      </div>
      </div>
    </div>
  </div>
  `;
// ---- Helpers for cards + tech list ----
  let storeAvgRos=0, storeAvgAsr=0, storeAvgSold=0;
  let teamBaseCounts=null;

  function iconKindFromPctOfBase(pctOfBase){
    if(pctOfBase===null || pctOfBase===undefined || !Number.isFinite(Number(pctOfBase))) return 'warn';
    if(window.getColorBand){
      const band = window.getColorBand(Number(pctOfBase));
      if(band==="green")  return 'good';
      if(band==="yellow") return 'warn';
      if(band==="orange") return 'orange';
      return 'bad';
    }
    const pct100 = Number(pctOfBase) * 100;
    const g = (typeof _gradeFromPct100 === 'function') ? _gradeFromPct100(pct100) : (pct100>=90?'A':pct100>=80?'B':pct100>=70?'C':pct100>=60?'D':'F');
    return (g==='A' || g==='B') ? 'good' : (g==='C' || g==='D') ? 'warn' : 'bad';
  }

  function iconSvg(kind){
    if(kind==='good') return `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="rgba(26,196,96,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><path d="M4.3 8.3 L7 11 L12 5.6" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if(kind==='bad') return `<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,3 14,13 2,13" fill="rgba(255,74,74,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><text x="8" y="11.6" text-anchor="middle" font-size="7.9" font-weight="600" fill="rgba(255,255,255,.95)">!</text></svg>`;
    if(kind==='orange') return `<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,3 14,13 2,13" fill="rgba(249,115,22,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><text x="8" y="11.6" text-anchor="middle" font-size="7.9" font-weight="600" fill="rgba(255,255,255,.95)">!</text></svg>`;
    return `<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,3 14,13 2,13" fill="rgba(255,197,66,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><text x="8" y="11.6" text-anchor="middle" font-size="7.9" font-weight="600" fill="rgba(255,255,255,.95)">!</text></svg>`;
  }

  function iconHtml(pctOfBase){
    const k = iconKindFromPctOfBase(pctOfBase);
    return `<span class="svcIcon svcIcon-${k}">${iconSvg(k)}</span>`;
  }
  function safeSvcIdLocal(cat){
    return "svc-" + String(cat||"").toLowerCase()
      .replace(/&/g,"and")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-+|-+$/g,"");
  }
  function bandClassPct(pctOfBase){
    if(!Number.isFinite(pctOfBase)) return "";
    if(window.getColorBand){
      const band = window.getColorBand(pctOfBase);
      if(band==="green")  return "bGreen";
      if(band==="yellow") return "bYellow";
      if(band==="orange") return "bOrange";
      return "bRed";
    }
    if(pctOfBase >= 0.80) return "bGreen";
    if(pctOfBase >= 0.60) return "bYellow";
    return "bRed";
  }
  function techMetricRowHtml(r, idx, mode, goalMetricLocal, goalPct){
    const rank = idx + 1;

    // Baselines depend on Comparison filter
    let baseRos=null, baseAsr=null, baseSold=null;

    if(comparison==='goal'){
      const gReq = Number(getGoal(r.serviceName || '', 'req'));
      const gClose = Number(getGoal(r.serviceName || '', 'close'));
      baseRos = storeAvgRos;
      baseAsr = (Number.isFinite(gReq) && gReq>0) ? (Number(r.ros||0) * gReq) : null;
      baseSold = (Number.isFinite(gReq) && gReq>0 && Number.isFinite(gClose) && gClose>0) ? (Number(r.ros||0) * gReq * gClose) : null;
    } else if(comparison==='team'){
      const tb = (teamBaseCounts && r.team && teamBaseCounts[r.team]) ? teamBaseCounts[r.team] : null;
      baseRos = Number.isFinite(Number(tb?.rosAvg)) && Number(tb.rosAvg)>0 ? Number(tb.rosAvg) : null;
      baseAsr = Number.isFinite(Number(tb?.asrAvg)) && Number(tb.asrAvg)>0 ? Number(tb.asrAvg) : null;
      baseSold = Number.isFinite(Number(tb?.soldAvg)) && Number(tb.soldAvg)>0 ? Number(tb.soldAvg) : null;
    } else { // store
      baseRos = storeAvgRos;
      baseAsr = storeAvgAsr;
      baseSold = storeAvgSold;
    }

    const rosPctBase  = (baseRos!==null && baseRos>0) ? (Number(r.ros||0)/baseRos) : null;
    const asrPctBase  = (baseAsr!==null && baseAsr>0) ? (Number(r.asr||0)/baseAsr) : null;
    const soldPctBase = (baseSold!==null && baseSold>0) ? (Number(r.sold||0)/baseSold) : null;

    // Sold metric display: Sold/ASRs = close rate %, Sold/RO = sold÷ros
    const soldMetricLbl = (soldFocus === 'ro') ? 'Sold/RO' : 'Sold/ASR';
    const soldMetricVal = (soldFocus === 'ro')
      ? (r.ros ? fmt1(r.sold / r.ros, 2) : '—')
      : (r.asr ? fmtPct(r.sold / r.asr) : '—');

    return `
      <div class="svcTechRow">
        <div class="svcTechLeft">
          <span class="svcRankNum">${rank}.</span>
          <a href="#/tech/${encodeURIComponent(r.id)}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
        </div>
        <div class="svcTechMeta">
          <div class="svcTechMetaRow"><span>ROs <b>${fmtInt(r.ros)}</b></span><span class="svcMetaDot">•</span><span>ASRs <b>${fmtInt(r.asr)}</b>${iconHtml(asrPctBase)}</span><span class="svcMetaDot">•</span><span>${soldMetricLbl} <b>${soldMetricVal}</b>${iconHtml(soldPctBase)}</span></div>
        </div>
      </div>
    `;
  }

  function buildServiceAgg(serviceName){
    let asr=0, soldAsr=0, totalRos=0;
    const techRows = [];

    for(const t of techs){
      const c = (t.categories||{})[serviceName];
      const a  = Number(c?.asr)||0;
      const so = Number(c?.sold)||0;
      const rosTech = Number(t.ros)||0;
      asr += a; soldAsr += so; totalRos += rosTech;
      const req   = rosTech ? (a/rosTech) : 0;  // ASR/RO
      // For advisors with no ASRs (Fluids/Brakes/Tires), fall back to Sold/RO
      const close = (a > 0) ? (so/a) : (t._isAdvisor && rosTech > 0 ? so/rosTech : 0);
      techRows.push({id:t.id, name:t.name, team:t.team, ros:rosTech, asr:a, sold:so, req, close, serviceName});
    }

    // Pre-MPI adds to Sold/RO in techs/both mode; in advisor mode advisor_sold is already the metric
    const preMpiSvc  = preMpiSoldForService(serviceName);
    const soldForRo  = (_preMpiApplies && preMpi === 'included') ? (soldAsr + preMpiSvc) : soldAsr;

    const reqTot   = totalRos ? (asr / totalRos) : 0;
    // For advisor mode with no ASRs (Fluids/Brakes/Tires), use Sold/RO as close metric
    const isAdvMode = techs.length > 0 && techs[0]._isAdvisor;
    const closeTot = asr ? (soldAsr / asr) : (isAdvMode && totalRos > 0 ? soldForRo / totalRos : 0);
    const soldPerRoSvc = totalRos ? (soldForRo / totalRos) : 0;

    const nTech = techs.length || 1;
    const storeAvgRosL  = totalRos / nTech;
    const storeAvgAsrL  = asr / nTech;
    const storeAvgSoldL = soldForRo / nTech;

    const teamTotals = {};
    const teamCounts = {};
    for(const r of techRows){
      const tk = r.team || 'UNKNOWN';
      if(!teamTotals[tk]) teamTotals[tk] = {ros:0, asr:0, sold:0};
      if(!teamCounts[tk]) teamCounts[tk] = 0;
      teamCounts[tk] += 1;
      teamTotals[tk].ros  += Number(r.ros)||0;
      teamTotals[tk].asr  += Number(r.asr)||0;
      teamTotals[tk].sold += Number(r.sold)||0;
    }
    const teamBaseCountsL = {};
    for(const k in teamTotals){
      const cnt = teamCounts[k] || 1;
      teamBaseCountsL[k] = {rosAvg: teamTotals[k].ros/cnt, asrAvg: teamTotals[k].asr/cnt, soldAvg: teamTotals[k].sold/cnt};
    }

    // `sold` on the returned object = soldForRo (what goes into Sold/RO pill display)
    return {serviceName, totalRos, asr, sold: soldForRo, soldAsr, preMpiSvc, reqTot, closeTot, soldPerRoSvc,
            storeAvgRos: storeAvgRosL, storeAvgAsr: storeAvgAsrL, storeAvgSold: storeAvgSoldL,
            teamBaseCounts: teamBaseCountsL, techRows};
  }

  
  // --- Section goal helpers (Services Dashboard only) ---
  function _secMetaKeyFromName(secName){
    const nm = String(secName||"").trim().toUpperCase();
    if(!nm) return "";
    // Example: "Maintenance" -> "__META_MAINTENANCE"
    return "__META_" + nm.replace(/[^A-Z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  }
  function _avgGoalForCats(cats, metric){
    let sum = 0, n = 0;
    for(const c of (cats||[])){
      const v = Number(getGoal(String(c), metric));
      if(Number.isFinite(v) && v>0){ sum += v; n++; }
    }
    return n ? (sum/n) : NaN;
  }
  function _getSectionGoal(sec, metric){
    const key = _secMetaKeyFromName(sec?.name);
    // 1) Prefer explicit section meta goal, if it exists.
    const metaVal = Number(getGoal(key, metric));
    if(Number.isFinite(metaVal) && metaVal>0) return metaVal;

    // 2) Fall back to overall computed goals if available.
    if(typeof calcOverallGoals === "function"){
      const og = calcOverallGoals();
      if(metric === "req" && Number.isFinite(og.asrPerRo) && og.asrPerRo > 0) return og.asrPerRo;
      if(metric === "close" && Number.isFinite(og.soldPct) && og.soldPct > 0) return og.soldPct;
    }

    // 3) Final fallback: average of service goals in this section.
    return _avgGoalForCats(sec?.categories, metric);
  }

// Section ranking (Maintenance / Fluids / etc.) by the selected Goal filter.
  // Uses Team + Fluids scope.
  const _secRankInfo = (()=>{
    const secs = Array.isArray(DATA.sections) ? DATA.sections : [];
    const rows = [];

    for(const sec of secs){
      const nm = String(sec?.name||'').trim();
      if(!nm) continue;
      const low = nm.toLowerCase();
      if(fluidsSel==='only' && low!=='fluids') continue;
      if(fluidsSel==='without' && low==='fluids') continue;

      const gReqSec = _getSectionGoal(sec,'req');
      const gCloseSec = _getSectionGoal(sec,'close');

      // Aggregate across all categories in this section for the filtered tech set
      let ros=0, asr=0, soldAsr=0;
      for(const t of techs){
        for(const cat of (sec.categories||[])){
          const row = (t.categories||{})[cat];
          if(!row) continue;
          ros     += Number(row.ros)||0;
          asr     += Number(row.asr)||0;
          soldAsr += Number(row.sold)||0;
        }
      }
      // Pre-MPI adds to Sold/RO; Sold/ASR always uses ASR-sold only
      let soldForRo = soldAsr;
      for(const cat of (sec.categories||[])){
        if(_preMpiApplies && preMpi === 'included') soldForRo += preMpiSoldForService(String(cat));
      }

      const asrPerRo  = ros ? (asr/ros) : NaN;
      const soldPct   = asr ? (soldAsr/asr) : NaN;          // Sold/ASR — never changes
      const svcSoldPerRo = ros ? (soldForRo/ros) : NaN;     // Sold/RO — changes with filter
      const pctGoalAsr  = (Number.isFinite(asrPerRo)  && Number.isFinite(gReqSec)   && gReqSec>0)   ? (asrPerRo/gReqSec)   : NaN;
      const pctGoalSold = (Number.isFinite(soldPct)   && Number.isFinite(gCloseSec) && gCloseSec>0) ? (soldPct/gCloseSec)  : NaN;
      const pct = (goalMetric==='sold') ? pctGoalSold : pctGoalAsr;
      rows.push({name:nm, pct});
    }

    const den = rows.length || 1;
    rows.sort((a,b)=>{
      const av = Number.isFinite(a.pct) ? a.pct : -Infinity;
      const bv = Number.isFinite(b.pct) ? b.pct : -Infinity;
      if(av===bv) return a.name.localeCompare(b.name);
      return av < bv ? 1 : -1;
    });
    const map = new Map();
    rows.forEach((r,i)=> map.set(String(r.name), i+1));
    return {map, den};
  })();

  // Render one section panel (Maintenance/Fluids/Brakes/Tires/etc)
  function renderSection(sec){
    const secName = String(sec?.name||'').trim();
    if(!secName) return '';

    // Fluids filter controls which sections participate in rendering/calcs
    const secLower = secName.toLowerCase();
    if(fluidsSel==='only' && secLower!=='fluids') return '';
    if(fluidsSel==='without' && secLower==='fluids') return '';

    const openKey = secName.toLowerCase().replace(/[^a-z0-9]+/g,'_');
    const isOpen = !!st.open[openKey];

    // Only include services that exist in dataset (intersection with any tech categories)
    const allCatsSet = new Set();
    for(const t of techs){
      for(const k of Object.keys(t.categories||{})) allCatsSet.add(k);
    }
    const services = (sec.categories||[]).map(String).filter(Boolean).filter(c=>allCatsSet.has(c));

    const aggs = services.map(buildServiceAgg);

    // Section-level totals and focus stats (team + fluids scoped)
    // FIX: secRos must NOT sum x.totalRos across services — every service already holds the full
    // RO pool as its denominator, so summing them multiplies the count by the number of services
    // in the section (e.g. 676 ROs × 7 services = 4,698). Use the shared totalRos instead.
    const secRos     = totalRos;
    const secAsr     = aggs.reduce((s,x)=>s+(Number(x.asr)||0),0);
    const secSoldAsr = aggs.reduce((s,x)=>s+(Number(x.soldAsr)||0),0); // ASR-sold only, never changes
    const secSoldForRo = aggs.reduce((s,x)=>s+(Number(x.sold)||0),0); // includes pre-MPI when included
    const secAvgOdo  = techs.length ? (techs.reduce((s,t)=>s+(Number(t.odo)||0),0) / techs.length) : 0;
    const secSoldPerRo = (secRos>0) ? (secSoldForRo/secRos) : NaN;  // changes with filter
    const secAsrPerRo  = secRos ? (secAsr/secRos) : null;
    const secSoldPct   = secAsr ? (secSoldAsr/secAsr) : null;        // Sold/ASR — never changes

    // Focus stats: determined by Goal filter + Sold Focus sub-filter
    const secTopIsSold = (goalMetric==='sold');
    // Sold/ASR vs Sold/RO depending on soldFocus
    const secSoldFocusVal = (soldFocus==='ro') ? secSoldPerRo : secSoldPct;
    const secSoldFocusLbl = (soldFocus==='ro') ? 'Sold/RO' : 'Sold/ASR';
    const secTopVal = secTopIsSold ? secSoldFocusVal : secAsrPerRo;
    const secTopLbl = secTopIsSold ? secSoldFocusLbl : 'ASRs/RO';
    const secBotVal = secTopIsSold ? secAsrPerRo : secSoldFocusVal;
    const secBotLbl = secTopIsSold ? 'ASRs/RO' : secSoldFocusLbl;

    // Goal dials: compare section focus stats to THIS SECTION's goals (with safe fallbacks)
    const gReqSec = _getSectionGoal(sec,'req');
    const gCloseSec = _getSectionGoal(sec,'close');
    const secPctGoalAsr  = (Number.isFinite(secAsrPerRo) && Number.isFinite(gReqSec) && gReqSec>0) ? (secAsrPerRo/gReqSec) : NaN;
    // Sold/ASR dial always uses ASR-sold (closePct) — never changes with preMpi filter
    const secPctGoalSoldAsr = (Number.isFinite(secSoldPct) && Number.isFinite(gCloseSec) && gCloseSec>0) ? (secSoldPct/gCloseSec) : NaN;
    // Sold/RO dial uses soldPerRo — changes with preMpi filter
    const gSoldRoSec = (Number.isFinite(gReqSec) && Number.isFinite(gCloseSec)) ? (gReqSec * gCloseSec) : NaN;
    const secPctGoalSoldRo = (Number.isFinite(secSoldPerRo) && Number.isFinite(gSoldRoSec) && gSoldRoSec>0) ? (secSoldPerRo/gSoldRoSec) : NaN;
    const secPctGoalSold = (soldFocus==='ro') ? secPctGoalSoldRo : secPctGoalSoldAsr;

    const secRank = _secRankInfo.map.get(secName) || '—';
    const secRankTop = (goalMetric==='sold')
      ? (soldFocus==='ro' ? 'Sold/RO' : 'Sold/ASRs')
      : 'ASR';

    // Section averages (used for dials when not GOAL focus)
    const avgReq = aggs.length ? aggs.reduce((s,x)=>s+x.reqTot,0)/aggs.length : 0;
    const avgClose = aggs.length ? aggs.reduce((s,x)=>s+x.closeTot,0)/aggs.length : 0;

    // Build cards
    const cardsHtml = aggs.map(s=>{
      // Dial basis
      const pctVsAvgReq   = (Number.isFinite(s.reqTot)   && Number.isFinite(avgReq)   && avgReq>0)   ? (s.reqTot/avgReq) : NaN;
      const pctVsAvgClose = (Number.isFinite(s.closeTot) && Number.isFinite(avgClose) && avgClose>0) ? (s.closeTot/avgClose) : NaN;

      const gReq   = Number(getGoal(s.serviceName,'req'));
      const gClose = Number(getGoal(s.serviceName,'close'));
      const pctOfGoalReq   = (Number.isFinite(s.reqTot)   && Number.isFinite(gReq)   && gReq>0)   ? (s.reqTot/gReq)     : NaN;
      const pctOfGoalClose = (Number.isFinite(s.closeTot) && Number.isFinite(gClose) && gClose>0) ? (s.closeTot/gClose) : NaN; // Sold/ASR, never changes
      const gSoldRo = (Number.isFinite(gReq) && Number.isFinite(gClose)) ? (gReq * gClose) : NaN;
      const pctOfGoalSoldRo = (Number.isFinite(s.soldPerRoSvc) && Number.isFinite(gSoldRo) && gSoldRo>0) ? (s.soldPerRoSvc/gSoldRo) : NaN;

      // Dial: Sold/RO focus → pctOfGoalSoldRo (changes with filter); Sold/ASR focus → pctOfGoalClose (never changes); ASR focus → pctOfGoalReq
      const dialPct = (rankMetric==='sold')
        ? (soldFocus==='ro' ? pctOfGoalSoldRo : pctOfGoalClose)
        : pctOfGoalReq;
      const sdDialTitle = (rankMetric==='sold')
        ? (soldFocus==='ro' ? 'Sold/RO' : 'Sold/ASRs')
        : 'ASR';

            const sdDialSz = 80; // increased by 25% from 64px

      const goalForThis = (rankMetric==='sold') ? gClose : gReq;
      const goalTxt = `Goal ${(!Number.isFinite(goalForThis) || goalForThis<=0)
        ? '—'
        : (rankMetric==='sold' ? fmtPct(goalForThis) : fmt1(goalForThis,2))
      }`;

      // Baselines for status icons
      storeAvgRos = s.storeAvgRos;
      storeAvgAsr = s.storeAvgAsr;
      storeAvgSold = s.storeAvgSold;
      teamBaseCounts = s.teamBaseCounts;

      // Tech list sorting
      const rows = s.techRows.slice().map(r=>{
        const gP = (focus==='goal')
          ? (goalMetric==='sold'
              ? ((Number.isFinite(r.close) && Number.isFinite(gClose) && gClose>0) ? (r.close/gClose) : null)
              : ((Number.isFinite(r.req) && Number.isFinite(gReq) && gReq>0) ? (r.req/gReq) : null)
            )
          : null;
        return {...r, goalPct: gP};
      });

      rows.sort((a,b)=>{
        const av = (focus==='goal') ? (a.goalPct ?? -Infinity) : (focus==='sold' ? a.close : a.req);
        const bv = (focus==='goal') ? (b.goalPct ?? -Infinity) : (focus==='sold' ? b.close : b.req);
        if(av===bv) return 0;
        return av < bv ? 1 : -1;
      });

      const techList = rows.map((r,i)=> techMetricRowHtml(r, i, focus, goalMetric, r.goalPct)).join('');

      return `
        <div class="catCard" id="${safe('sd-'+safeSvcIdLocal(s.serviceName).replace(/^svc-/,''))}">
          <div class="catHeader">
            <div class="catHdrLeft" style="min-width:0">
              <div class="catTitleRow"><div class="catTitle">${safe(s.serviceName)}</div>${infoIconBtn(s.serviceName, {totalRos: s.totalRos, preMpi: s.preMpiSvc, soldAsr: s.soldAsr})}</div>
              <div class="muted" style="margin-top:2px">
                <div>${viewMode==='techs' ? (()=>{ const _ar=Math.max(0,s.totalRos-s.preMpiSvc); const _sd=JSON.stringify({type:'ros',name:s.serviceName,totalRos:s.totalRos,preMpi:s.preMpiSvc,soldAsr:s.soldAsr,asr:s.asr}).replace(/"/g,'&quot;'); return `<span class="svcStatStar svcStarInline" data-svcstat="${_sd}">${fmtInt(_ar)} ROs*</span>`; })() : `${fmtInt(s.totalRos)} ROs`} • ${fmtInt(s.asr)} ASRs</div>
                <div>${fmtInt(s.soldAsr)} ASRs Sold</div>
                <div>Pre-MPI Sold: ${fmtInt(s.preMpiSvc)}</div>
              </div>
            </div>

            <div class="sdCatHdrRow">
              <div class="svcGaugeCol sdCatDialCol">
                <div class="svcGaugeWrap" style="--sz:${sdDialSz}px">
                  ${serviceGoalDial(Number.isFinite(dialPct)?dialPct:0, sdDialSz, (()=>{
                    if(rankMetric==='sold'){
                      const goalVal = soldFocus==='ro' ? (Number.isFinite(gReq)&&Number.isFinite(gClose)?gReq*gClose:NaN) : gClose;
                      const actVal  = soldFocus==='ro' ? s.soldPerRoSvc : s.closeTot;
                      return _svcDialPopup(dialPct, goalVal, actVal, soldFocus==='ro'?'Sold/RO Goal':'Sold/ASR Goal', soldFocus==='ro'?'Actual Sold/RO':'Actual Sold/ASR');
                    }
                    return _svcDialPopup(dialPct, gReq, s.reqTot, 'ASR/RO Goal', 'Actual ASR/RO', true);
                  })())}
                </div>
                <div class="svcGaugeLbl">${sdDialTitle}</div>
              </div>
              ${goalRankBadge(s.serviceName)}
              ${viewMode==='techs' ? (()=>{
                const adjRos = Math.max(0, s.totalRos - s.preMpiSvc);
                const cardAsrPerRo = (adjRos > 0 && Number.isFinite(s.asr/adjRos)) ? fmtPct(s.asr/adjRos) : '—';
                const cardSoldAsr  = (s.asr > 0 && Number.isFinite(s.soldAsr/s.asr)) ? fmtPct(s.soldAsr/s.asr) : '—';
                const topVal = goalMetric==='sold' ? cardSoldAsr  : cardAsrPerRo;
                const topLbl = goalMetric==='sold' ? 'Sold/ASR'      : 'ASRs/RO*';
                const topStar = goalMetric !== 'sold';
                const midVal = goalMetric==='sold' ? cardAsrPerRo : cardSoldAsr;
                const midLbl = goalMetric==='sold' ? 'ASRs/RO*'  : 'Sold/ASR';
                const midStar = goalMetric === 'sold';
                const _sdAsrRo = JSON.stringify({type:'asrro',name:s.serviceName,totalRos:s.totalRos,preMpi:s.preMpiSvc,soldAsr:s.soldAsr,asr:s.asr}).replace(/"/g,'&quot;');
                return `<div class="sdCatFocusStats">
                  <div${topStar ? ` class="svcStatStar" data-svcstat="${_sdAsrRo}"` : ''}><div class="sdCatStatTop">${topVal}</div><div class="sdCatStatLbl">${topLbl}</div></div>
                  <div${midStar ? ` class="svcStatStar" data-svcstat="${_sdAsrRo}"` : ''}><div class="sdCatStatMid">${midVal}</div><div class="sdCatStatLbl">${midLbl}</div></div>
                </div>`;
              })() : (()=>{
                // Advisor focus stats: driven by Sold Focus filter (Sold/ASRs vs Sold/RO)
                // s.closeTot   = Sold/ASRs rate — already reflects preMpi normalization via _normAdvisors
                // s.soldPerRoSvc = Sold/RO      — already reflects preMpi via buildServiceAgg soldForRo
                const cardSoldAsr = Number.isFinite(s.closeTot)    ? fmtPct(s.closeTot)       : '—';
                const cardSoldRo  = Number.isFinite(s.soldPerRoSvc) ? fmt1(s.soldPerRoSvc, 2) : '—';
                // Primary stat follows Sold Focus filter; secondary is the other
                const topVal = soldFocus==='ro' ? cardSoldRo  : cardSoldAsr;
                const topLbl = soldFocus==='ro' ? 'Sold/RO'   : 'Sold/ASRs';
                const midVal = soldFocus==='ro' ? cardSoldAsr : cardSoldRo;
                const midLbl = soldFocus==='ro' ? 'Sold/ASRs' : 'Sold/RO';
                return `<div class="sdCatFocusStats">
                  <div><div class="sdCatStatTop">${topVal}</div><div class="sdCatStatLbl">${topLbl}</div></div>
                  <div><div class="sdCatStatMid">${midVal}</div><div class="sdCatStatLbl">${midLbl}</div></div>
                </div>`;
              })()}
            </div>
          </div>

          <div class="subHdr">${personLabelPlural.toUpperCase()}</div>
          <div class="svcTechList">${techList || `<div class="notice" style="padding:8px 2px">No ${personLabelPlural.toLowerCase()}</div>`}</div>
        </div>
      `;
    }).join('');

    const secPreMpiSold = services.reduce((s,svcName)=>s+preMpiSoldForService(svcName), 0);

    return `
      <details class="svcDashSec" ${isOpen?'open':''} data-sec="${safe(openKey)}">
        <summary>
          <div class="svcDashSecHead">
            <div class="svcDashSecHeadLeft">
              <div class="svcDashSecTitleRow">
                <div class="secToggle" aria-hidden="true">${isOpen?'−':'+'}</div>
                <div class="svcDashSecTitle">${safe(secName)}</div>
                ${infoIconBtn(secName, {totalRos: secRos, preMpi: secPreMpiSold, soldAsr: secSoldAsr})}
              </div>
              <div class="svcDashSecPillsLeft pillsMini">
                <div class="pillMini"><div class="k">Avg ODO</div><div class="v">${fmtInt(secAvgOdo)}</div></div>
                ${viewMode==='techs' ? (()=>{
                  const _adjR = Math.max(0, secRos - secPreMpiSold);
                  const _sd = JSON.stringify({type:'ros',name:secName,totalRos:secRos,preMpi:secPreMpiSold,soldAsr:secSoldAsr,asr:secAsr}).replace(/"/g,'&quot;');
                  const _sd2 = JSON.stringify({type:'soldro',name:secName,totalRos:secRos,preMpi:secPreMpiSold,soldAsr:secSoldAsr,asr:secAsr}).replace(/"/g,'&quot;');
                  const _soldRoVal = _adjR > 0 ? (secSoldAsr/_adjR).toFixed(2) : '—';
                  return `<div class="pillMini svcStatStar" data-svcstat="${_sd}"><div class="k">ROs*</div><div class="v">${fmtInt(_adjR)}</div></div>`;
                })() : `<div class="pillMini"><div class="k">ROs</div><div class="v">${fmtInt(secRos)}</div></div>`}
                <div class="pillMini"><div class="k">ASRs</div><div class="v">${fmtInt(secAsr)}</div></div>
                <div class="pillMini sold"><div class="k">ASRs Sold</div><div class="v">${fmtInt(secSoldAsr)}</div></div>
                <div class="pillMini"><div class="k">Sold Pre-MPI</div><div class="v">${fmtInt(secPreMpiSold)}</div></div>
                ${viewMode==='techs' ? (()=>{
                  const _adjR = Math.max(0, secRos - secPreMpiSold);
                  const _sd2 = JSON.stringify({type:'soldro',name:secName,totalRos:secRos,preMpi:secPreMpiSold,soldAsr:secSoldAsr,asr:secAsr}).replace(/"/g,'&quot;');
                  const _soldRoVal = _adjR > 0 ? (secSoldAsr/_adjR).toFixed(2) : '—';
                  return `<div class="pillMini svcStatStar" data-svcstat="${_sd2}"><div class="k">Sold/ROs*</div><div class="v">${_soldRoVal}</div></div>`;
                })() : `<div class="pillMini"><div class="k">Sold/RO</div><div class="v">${Number.isFinite(secSoldPerRo)?secSoldPerRo.toFixed(2):'—'}</div></div>`}
              </div>
            </div>

            <div class="svcDashSecHeadRight">
                            <div class="svcSecHeadDials">
                ${goalMetric==='sold'
                  ? `
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap mini">${serviceGoalDial(secPctGoalAsr, 74, _svcDialPopup(secPctGoalAsr, gReqSec, secAsrPerRo, 'ASR/RO Goal', 'Actual ASR/RO', true))}</div>
                      <div class="svcGaugeLbl">ASR</div>
                    </div>
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap focus">${serviceGoalDial(secPctGoalSold, 90, _svcDialPopup(secPctGoalSold, soldFocus==='ro'?(Number.isFinite(gReqSec)&&Number.isFinite(gCloseSec)?gReqSec*gCloseSec:NaN):gCloseSec, soldFocus==='ro'?secSoldPerRo:secSoldPct, soldFocus==='ro'?'Sold/RO Goal':'Sold/ASR Goal', soldFocus==='ro'?'Actual Sold/RO':'Actual Sold/ASR'))}</div>
                      <div class="svcGaugeLbl">${soldFocus==='ro' ? 'Sold/RO' : 'Sold/ASRs'}</div>
                    </div>
                  `
                  : `
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap mini">${serviceGoalDial(secPctGoalSold, 74, _svcDialPopup(secPctGoalSold, soldFocus==='ro'?(Number.isFinite(gReqSec)&&Number.isFinite(gCloseSec)?gReqSec*gCloseSec:NaN):gCloseSec, soldFocus==='ro'?secSoldPerRo:secSoldPct, soldFocus==='ro'?'Sold/RO Goal':'Sold/ASR Goal', soldFocus==='ro'?'Actual Sold/RO':'Actual Sold/ASR'))}</div>
                      <div class="svcGaugeLbl">${soldFocus==='ro' ? 'Sold/RO' : 'Sold/ASRs'}</div>
                    </div>
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap focus">${serviceGoalDial(secPctGoalAsr, 90, _svcDialPopup(secPctGoalAsr, gReqSec, secAsrPerRo, 'ASR/RO Goal', 'Actual ASR/RO', true))}</div>
                      <div class="svcGaugeLbl">ASR</div>
                    </div>
                  `
                }
              </div>
              ${rankBadgeHtmlSvc(secRank, fmtInt(_secRankInfo.den), secRankTop, false)}
              ${viewMode==='techs' ? (()=>{
                const adjSecRos = Math.max(0, secRos - secPreMpiSold);
                const secAsrPerRoTech = (adjSecRos > 0 && Number.isFinite(secAsr/adjSecRos)) ? fmt1(secAsr/adjSecRos, 2) : '—';
                const secSoldAsrPct   = (secAsr > 0 && Number.isFinite(secSoldAsr/secAsr)) ? fmtPct(secSoldAsr/secAsr) : '—';
                const topVal  = goalMetric==='sold' ? secSoldAsrPct  : secAsrPerRoTech;
                const topLbl  = goalMetric==='sold' ? 'Sold/ASR'        : 'ASRs/RO*';
                const topType = goalMetric==='sold' ? '' : 'asrro';
                const midVal  = goalMetric==='sold' ? secAsrPerRoTech : secSoldAsrPct;
                const midLbl  = goalMetric==='sold' ? 'ASRs/RO*'   : 'Sold/ASR';
                const midType = goalMetric==='sold' ? 'asrro' : '';
                const _sd = JSON.stringify({name:secName,totalRos:secRos,preMpi:secPreMpiSold,soldAsr:secSoldAsr,asr:secAsr}).replace(/"/g,'&quot;');
                const topAttr = topType ? `class="svcStatStar" data-svcstat="${_sd.replace(/"/, `"type":"${topType}",`)}"` : '';
                const midAttr = midType ? `class="svcStatStar" data-svcstat="${_sd.replace(/"/, `"type":"${midType}",`)}"` : '';
                const _sdAsrRo = JSON.stringify({type:'asrro',name:secName,totalRos:secRos,preMpi:secPreMpiSold,soldAsr:secSoldAsr,asr:secAsr}).replace(/"/g,'&quot;');
                const topStar = topType==='asrro';
                const midStar = midType==='asrro';
                return `<div class="svcSecFocusStats">
                  <div${topStar ? ` class="svcStatStar" data-svcstat="${_sdAsrRo}"` : ''}><div class="statValTop">${topVal}</div><div class="statLbl">${topLbl}</div></div>
                  <div${midStar ? ` class="svcStatStar" data-svcstat="${_sdAsrRo}"` : ''}><div class="statValBot">${midVal}</div><div class="statLbl">${midLbl}</div></div>
                </div>`;
              })() : `<div class="svcSecFocusStats">
                <div>
                  <div class="statValTop">${secTopVal===null || !Number.isFinite(secTopVal) ? "—" : (secTopLbl==="Sold/ASR" ? fmtPct(secTopVal) : fmt1(secTopVal,2))}</div>
                  <div class="statLbl">${safe(secTopLbl)}</div>
                </div>
                <div>
                  <div class="statValBot">${secBotVal===null || !Number.isFinite(secBotVal) ? "—" : (secBotLbl==="Sold/ASR" ? fmtPct(secBotVal) : fmt1(secBotVal,2))}</div>
                  <div class="statLbl">${safe(secBotLbl)}</div>
                </div>
              </div>`}
            </div>
          </div>
        </summary>
        <div class="svcDashBody">
          <div class="svcCardsGrid">${cardsHtml || `<div class="notice">No services found in this section.</div>`}</div>
        </div>
      </details>
    `;
  }

  const sections = Array.isArray(DATA.sections) ? DATA.sections : [];
  const sectionsHtml = sections.map(renderSection).join('');

  // ---- Diag panel (Services vs Goal + Tech top/bottom by avg goal performance across all services) ----
  function bandOfPct(pct){
    if(!Number.isFinite(pct)) return null;
    if(window.getColorBand) return window.getColorBand(pct);
    if(pct < 0.60) return 'red';
    if(pct < 0.80) return 'yellow';
    return 'green';
  }

  // Service goal bands (for the pies)
  const svcAggsAll = _uniqServices.map(buildServiceAgg);
  const svcBands = { asr:{red:[],yellow:[],orange:[],green:[]}, sold:{red:[],yellow:[],orange:[],green:[]} };
  for(const s of svcAggsAll){
    const gReq = Number(getGoal(s.serviceName,'req'));
    const gClose = Number(getGoal(s.serviceName,'close'));
    const pctReq = (Number.isFinite(s.reqTot) && Number.isFinite(gReq) && gReq>0) ? (s.reqTot/gReq) : NaN;
    const pctClose = (Number.isFinite(s.closeTot) && Number.isFinite(gClose) && gClose>0) ? (s.closeTot/gClose) : NaN;
    const bReq = bandOfPct(pctReq);
    const bClose = bandOfPct(pctClose);
    if(bReq) svcBands.asr[bReq].push({name:s.serviceName, pct:pctReq});
    if(bClose) svcBands.sold[bClose].push({name:s.serviceName, pct:pctClose});
  }

  // ---- Top/Bottom 3 Services lists (by % of goal) ----
  function buildSvcRank(mode){
    const rows = svcAggsAll.map(s=>{
      const gReq = Number(getGoal(s.serviceName,'req'));
      const gClose = Number(getGoal(s.serviceName,'close'));
      const pct = (mode==='sold')
        ? ((Number.isFinite(s.closeTot) && Number.isFinite(gClose) && gClose>0) ? (s.closeTot/gClose) : NaN)
        : ((Number.isFinite(s.reqTot) && Number.isFinite(gReq) && gReq>0) ? (s.reqTot/gReq) : NaN);
      return {name:s.serviceName, pct};
    }).filter(r=>Number.isFinite(r.pct));

    rows.sort((a,b)=> (b.pct-a.pct) || a.name.localeCompare(b.name));
    const rankMap = new Map();
    rows.forEach((r,i)=> rankMap.set(r.name, i+1));
    return {rows, rankMap};
  }
  const svcRankAsr = buildSvcRank('asr');
  const svcRankSold = buildSvcRank('sold');

  // For Sold/RO focus: rank by absolute soldPerRo
  function buildSvcRankRo(){
    const rows = svcAggsAll.map(s=>{
      const val = (s.totalRos>0) ? (s.sold/s.totalRos) : NaN;
      return {name:s.serviceName, pct:val};
    }).filter(r=>Number.isFinite(r.pct));
    rows.sort((a,b)=> (b.pct-a.pct) || a.name.localeCompare(b.name));
    const rankMap = new Map();
    rows.forEach((r,i)=> rankMap.set(r.name, i+1));
    return {rows, rankMap};
  }
  const svcRankRo = buildSvcRankRo();

  // Active sold ranking based on soldFocus
  const activeSoldRank = (soldFocus==='ro') ? svcRankRo : svcRankSold;

  const topSvcAsr = svcRankAsr.rows.slice(0,3);
  const botSvcAsr = svcRankAsr.rows.slice(-3).reverse();

  const topSvcSold = activeSoldRank.rows.slice(0,3);
  const botSvcSold = activeSoldRank.rows.slice(-3).reverse();

  const soldFocusLabel = (soldFocus==='ro') ? 'Sold/RO' : 'Sold/ASRs';

  function tbRowSvc(item, idx, mode){
    const targetId = 'sd-' + safeSvcIdLocal(item.name).replace(/^svc-/, '');
    const agg = svcAggsAll.find(s=>s.serviceName===item.name);
    const asrPerRoVal  = (agg && agg.totalRos) ? (agg.asr / agg.totalRos) : null;
    const soldPctVal   = (agg && agg.asr)      ? (agg.soldAsr / agg.asr)  : null; // Sold/ASR — always ASR-sold
    const soldPerRoVal = (agg && agg.totalRos) ? (agg.sold / agg.totalRos) : null; // Sold/RO — includes pre-MPI when included

    let statStr;
    if(mode === 'asr'){
      const v = (asrPerRoVal!==null && Number.isFinite(asrPerRoVal)) ? asrPerRoVal.toFixed(2) : '—';
      statStr = `ASRs/RO: ${v}`;
    } else {
      const focusVal = (soldFocus==='ro') ? soldPerRoVal : soldPctVal;
      const focusLbl = (soldFocus==='ro') ? 'Sold/RO' : 'Sold/ASR';
      const focusFmt = (focusVal!==null && Number.isFinite(focusVal))
        ? (soldFocus==='ro' ? focusVal.toFixed(2) : fmtPct(focusVal))
        : '—';
      statStr = `${focusLbl}: ${focusFmt}`;
    }

    return `
      <div class="techRow">
        <div class="techRowLeft">
          <span class="rankNum">${idx}.</span>
          <a class="tbJump" href="#${targetId}" onclick="event.preventDefault();(document.getElementById(${JSON.stringify(targetId)})||{}).scrollIntoView&&document.getElementById(${JSON.stringify(targetId)}).scrollIntoView({behavior:'smooth',block:'start'});return false;">${safe(item.name)}</a>
        </div>
        <div class="mini">${statStr}</div>
      </div>`;
  }

  
  function thumbSvg(kind){
    // Use SVG (not emoji) so CSS color applies consistently
    const isDown = kind==='down';
    // Simple thumb icon path (generic)
    const path = isDown
      ? "M10 6H6c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h4V6zm1 0v8l2 4c.3.7 1.1 1 1.8.7.5-.2.8-.7.7-1.2L15 14h3.5c.8 0 1.5-.7 1.5-1.5 0-.1 0-.2-.1-.3l-1.3-4.6c-.2-.6-.8-1.1-1.5-1.1H11z"
      : "M10 14H6c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h4v8zm1 0V6l2-4c.3-.7 1.1-1 1.8-.7.5.2.8.7.7 1.2L15 6h3.5c.8 0 1.5.7 1.5 1.5 0 .1 0 .2-.1.3l-1.3 4.6c-.2.6-.8 1.1-1.5 1.1H11z";
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="width:28px;height:28px;display:block"><path d="${path}" fill="currentColor"/></svg>`;
  }
function tbMiniBoxSvc(title, rows, mode, kind){
    const html = rows.length ? rows.map((x,i)=>tbRowSvc(x,i+1,mode)).join('') : `<div class="notice">No data</div>`;
    const icon = (kind==='down') ? `<span class="thumbIcon down" aria-hidden="true">${thumbSvg('down')}</span>` : `<span class="thumbIcon up" aria-hidden="true">${thumbSvg('up')}</span>`;
    return `
      <div class="pickBox">
        <div class="pickMiniHdr">${safe(title)} ${icon}</div>
        <div class="pickList">${html}</div>
      </div>`;
  }


  function diagPieChartServices(mode){
    const red = svcBands[mode].red.length;
    const yellow = svcBands[mode].yellow.length;
    const orange = (svcBands[mode].orange||[]).length;
    const green = svcBands[mode].green.length;
    const total = red + yellow + orange + green;

    const cx = 80, cy = 80, rad = 70;
    const toRad = (deg)=> (deg*Math.PI/180);
    const at = (angDeg, r)=>({ x: cx + r*Math.cos(toRad(angDeg)), y: cy + r*Math.sin(toRad(angDeg)) });
    const arcPath = (a0, a1)=>{
      const p0 = at(a0, rad);
      const p1 = at(a1, rad);
      const large = (Math.abs(a1-a0) > 180) ? 1 : 0;
      return `M ${cx} ${cy} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${rad} ${rad} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
    };

    const _pf = window.getPieFill || function(b){ return b==="green"?"#1fcb6a":b==="yellow"?"#ffbf2f":b==="orange"?"#f97316":"#ff4b4b"; };
    const parts = [
      {band:'red',    n:red,    fill:_pf('red')},
      {band:'yellow', n:yellow, fill:_pf('yellow')},
      {band:'orange', n:orange, fill:_pf('orange')},
      {band:'green',  n:green,  fill:_pf('green')},
    ].filter(p=>p.n>0);

    if(total<=0 || !parts.length){
      return `
        <div class="diagPieWrap" aria-label="${mode.toUpperCase()} service distribution (no data)">
          <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
            <circle cx="80" cy="80" r="70" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
            <text class="diagPieTxt" x="80" y="80" text-anchor="middle" dominant-baseline="middle">0</text>
          </svg>
        </div>`;
    }

    let ang = -90;
    const slices = [];
    for(const p of parts){
      const span = (p.n/total)*360;
      const a0 = ang;
      const a1 = ang + span;
      ang = a1;
      const mid = (a0+a1)/2;
      const tooSmall = span < 26;
      const inside = at(mid, rad*0.58);
      const outside = at(mid, rad*1.14);
      const leader0 = at(mid, rad*0.88);
      const leader1 = at(mid, rad*1.04);
      slices.push({
        ...p,
        span,
        path: arcPath(a0,a1),
        tooSmall,
        lx: (tooSmall?outside.x:inside.x),
        ly: (tooSmall?outside.y:inside.y),
        l0x: leader0.x, l0y: leader0.y,
        l1x: leader1.x, l1y: leader1.y
      });
    }

    // When only one slice exists, it spans 360° — SVG arcs with identical start/end points
    // don't render. In that case, use a filled circle instead.
    const singleSlice = slices.length === 1;

    return `
      <div class="diagPieWrap" aria-label="${mode.toUpperCase()} service distribution">
        <svg class="diagPieSvg" viewBox="0 0 160 160" role="img" aria-hidden="true">
          <g>
            ${singleSlice
              ? `<circle class="diagPieSlice" data-mode="${mode}" data-band="${slices[0].band}"
                   cx="80" cy="80" r="70" fill="${slices[0].fill}"
                   stroke="rgba(255,255,255,.95)" stroke-width="1.6" />`
              : slices.map(s=>`
              <path class="diagPieSlice" data-mode="${mode}" data-band="${s.band}" d="${s.path}"
                fill="${s.fill}" stroke="rgba(255,255,255,.95)" stroke-width="1.6" stroke-linejoin="round" />
            `).join('')}
          </g>
          ${slices.map(s=> s.tooSmall ? `
            <line x1="${s.l0x.toFixed(2)}" y1="${s.l0y.toFixed(2)}" x2="${s.l1x.toFixed(2)}" y2="${s.l1y.toFixed(2)}" stroke="rgba(255,255,255,.95)" stroke-width="1.2" />
          ` : '').join('')}
          ${slices.map(s=>`<text class="diagPieTxt" x="${s.lx.toFixed(2)}" y="${s.ly.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" style="pointer-events:none">${s.n}</text>`).join('')}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="1.6" style="pointer-events:none" />
        </svg>
      </div>`;
  }

  // Tech average % of goal across all services
  function techAvgPctOfGoal(mode){
    const out = [];
    for(const t of techs){
      let sum=0, n=0;
      for(const svcName of _uniqServices){
        const row = (t.categories||{})[svcName];
        if(!row) continue;
        const rosTech = Number(t.ros)||0;
        const asr = Number(row.asr)||0;
        const sold = Number(row.sold)||0;
        const req = (rosTech>0) ? (asr/rosTech) : NaN;
        const close = (asr>0) ? (sold/asr) : NaN;
        const gReq = Number(getGoal(svcName,'req'));
        const gClose = Number(getGoal(svcName,'close'));
        const pct = (mode==='sold')
          ? ((Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN)
          : ((Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN);
        if(Number.isFinite(pct)) { sum += pct; n++; }
      }
      out.push({id:t.id, name:t.name, pct: n ? (sum/n) : NaN});
    }
    return out;
  }


  // Tech average POSITION across all services (1 = best) based on % of goal for each service.
  function techAvgPosition(mode){
    const sums = new Map(); // id -> {sum,count}
    for(const svcName of _uniqServices){
      const gReq = Number(getGoal(svcName,'req'));
      const gClose = Number(getGoal(svcName,'close'));
      const scored = [];
      for(const t of techs){
        const row = (t.categories||{})[svcName];
        if(!row) continue;
        const rosTech = Number(t.ros)||0;
        const asr = Number(row.asr)||0;
        const sold = Number(row.sold)||0;
        const req = (rosTech>0) ? (asr/rosTech) : NaN;
        const close = (asr>0) ? (sold/asr) : NaN;
        const pct = (mode==='sold')
          ? ((Number.isFinite(close) && Number.isFinite(gClose) && gClose>0) ? (close/gClose) : NaN)
          : ((Number.isFinite(req) && Number.isFinite(gReq) && gReq>0) ? (req/gReq) : NaN);
        if(Number.isFinite(pct)) scored.push({id:String(t.id), pct});
      }
      if(!scored.length) continue;
      scored.sort((a,b)=> (b.pct - a.pct) || a.id.localeCompare(b.id));
      scored.forEach((s,i)=>{
        const cur = sums.get(s.id) || {sum:0,count:0};
        cur.sum += (i+1);
        cur.count += 1;
        sums.set(s.id, cur);
      });
    }
    return techs.map(t=>{
      const cur = sums.get(String(t.id));
      const avgPos = (cur && cur.count) ? (cur.sum/cur.count) : NaN;
      return {id:t.id, name:t.name, avgPos};
    });
  }

  function tbRowTech(item, idx, mode){
    const metricLbl = (mode==='sold') ? 'Avg Sold Position' : 'Avg ASR Position';
    const val = Number.isFinite(item.avgPos) ? item.avgPos.toFixed(1) : '—';
    return `
      <div class="techRow">
        <div class="techRowLeft">
          <span class="rankNum">${idx}.</span>
          <a class="tbJump" href="#/tech/${encodeURIComponent(item.id)}" onclick="return goTech(${JSON.stringify(item.id)})">${safe(item.name)}</a>
        </div>
        <div class="mini">${metricLbl} = ${val}</div>
      </div>`;
  }


  function tbMiniBox(title, rows, mode, kind){
    const html = rows.length ? rows.map((x,i)=>tbRowTech(x,i+1,mode)).join('') : `<div class="notice">No data</div>`;
    const icon = (kind==='down') ? `<span class="thumbIcon down" aria-hidden="true">${thumbSvg('down')}</span>` : `<span class="thumbIcon up" aria-hidden="true">${thumbSvg('up')}</span>`;
    return `
      <div class="pickBox">
        <div class="pickMiniHdr">${safe(title)} ${icon}</div>
        <div class="pickList">${html}</div>
      </div>`;
  }

  const techAsrPos = techAvgPosition('asr').filter(x=>Number.isFinite(x.avgPos)).sort((a,b)=>a.avgPos-b.avgPos);
  const techSoldPos = techAvgPosition('sold').filter(x=>Number.isFinite(x.avgPos)).sort((a,b)=>a.avgPos-b.avgPos);

  const topTechAsr = techAsrPos.slice(0,3);
  const botTechAsr = techAsrPos.slice(-3).reverse();

  const topTechSold = techSoldPos.slice(0,3);
  const botTechSold = techSoldPos.slice(-3).reverse();

  const diagPanel = `
        <div style="position:relative;overflow:visible;height:100%;">
        <div class="panel techPickPanel diagSection" style="height:100%;min-width:0;overflow:hidden">
      <div class="phead" style="border-bottom:none;padding:12px;display:grid;gap:14px">
        <div class="pickToggleRow">
          <div class="pickHdrLabel asrTop" style="margin:0;margin-top:-5px;font-size:22px;line-height:1">ASR</div>
          <div class="pickToggleRight">
            <div class="pickToggleLbl"><span class="pickToggleWord pickWordTech">${personLabelPlural}</span><span class="pickToggleSlash">/</span><span class="pickToggleWord pickWordSvc">Services</span></div>
            <label class="pickToggle" title="Toggle ${personLabelPlural} / Services">
              <input type="checkbox" data-ctl="pickview" ${pickView==='services'?'checked':''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <!-- ASR row -->
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              ${diagPieChartServices('asr')}
              <div style="font-size:11px;font-style:italic;opacity:.75;margin-top:4px;text-align:center">(Services)</div>
            </div>
            <div>${pickView==='services' ? tbMiniBoxSvc('Top 3 Services ASR', topSvcAsr, 'asr', 'up') : tbMiniBox(`Top 3 ${personLabelPlural} ASR`, topTechAsr, 'asr', 'up')}</div>
            <div>${pickView==='services' ? tbMiniBoxSvc('Bottom 3 Services ASR', botSvcAsr, 'asr', 'down') : tbMiniBox(`Bottom 3 ${personLabelPlural} ASR`, botTechAsr, 'asr', 'down')}</div>
          </div>
        </div>

        <div class="diagDivider" style="height:1px;background:rgba(255,255,255,.12);margin:0 12px"></div>

        <!-- SOLD row -->
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;margin-top:-5px;align-self:flex-start;font-size:22px;line-height:1">SOLD</div>
              ${diagPieChartServices('sold')}
              <div style="font-size:11px;font-style:italic;opacity:.75;margin-top:4px;text-align:center">(Services)</div>
            </div>
            <div>${pickView==='services' ? tbMiniBoxSvc(`Top 3 Services ${soldFocusLabel}`, topSvcSold, soldFocus, 'up') : tbMiniBox(`Top 3 ${personLabelPlural} SOLD`, topTechSold, 'sold', 'up')}</div>
            <div>${pickView==='services' ? tbMiniBoxSvc(`Bottom 3 Services ${soldFocusLabel}`, botSvcSold, soldFocus, 'down') : tbMiniBox(`Bottom 3 ${personLabelPlural} SOLD`, botTechSold, 'sold', 'down')}</div>
          </div>
        </div>
      </div>
    </div>
    <svg viewBox="0 0 120 48" width="113" height="45" style="position:absolute;bottom:-19px;right:18px;overflow:visible;pointer-events:none;z-index:5;" aria-hidden="true"><rect x="0" y="27" width="120" height="3" fill="#0f1730"/><polyline points="0,28 18,28 26,28 32,8 38,44 44,20 50,28 68,28 76,28 82,8 88,44 94,20 100,28 120,28" fill="none" stroke="rgba(200,45,45,.45)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 3px rgba(200,40,40,.22));"/></svg>
    </div>
  `;

  const headerWrap = `<div class="svcdashHeaderWrap" style="margin-bottom:32px;display:grid;grid-template-columns:minmax(0,0.70fr) minmax(0,1.30fr);gap:14px;align-items:stretch">${header}${diagPanel}</div>`;

  const app = document.getElementById('app');
  app.innerHTML = `<div class="pageServicesDash">${headerWrap}<div class="svcDashSections">${sectionsHtml}</div></div>`;

// Force the notch to match the header panel background exactly (prevents any shade mismatch)
(function syncNotchBg(){
  const notch = document.querySelector('.pageServicesDash .techNotchStage .techMenuNotch');
  const panel = document.querySelector('.pageServicesDash .techNotchStage .techHeaderPanel');
  if(!notch || !panel) return;

  const apply = ()=>{
    const cs = getComputedStyle(panel);
    notch.style.backgroundColor = cs.backgroundColor;
    notch.style.backgroundImage = cs.backgroundImage;
    notch.style.backgroundRepeat = cs.backgroundRepeat;
    notch.style.backgroundPosition = cs.backgroundPosition;
    notch.style.backgroundSize = cs.backgroundSize;
    notch.style.backgroundAttachment = cs.backgroundAttachment;
    notch.style.borderColor = cs.borderTopColor;
  };

  requestAnimationFrame(()=>{ apply(); requestAnimationFrame(apply); });
})();

  // Wire events
  // View mode buttons
  app.querySelectorAll('button[data-svcdash="1"][data-ctl="viewMode"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      st.viewMode = btn.getAttribute('data-val');
      renderServicesHome();
    });
  });

  // Filter dropdowns
  app.querySelectorAll('select[data-svcdash="1"]').forEach(sel=>{
    const ctl = sel.getAttribute('data-ctl');
    sel.addEventListener('change', ()=>{
      if(ctl==='focus'){ st.focus = sel.value; st.goalMetric = sel.value; }
      if(ctl==='team') st.team = sel.value;
      if(ctl==='fluids') st.fluids = sel.value;
      if(ctl==='soldFocus') st.soldFocus = sel.value;
      if(ctl==='preMpi') st.preMpi = sel.value;
      renderServicesHome();
    });
  });


  // Pick view toggle (Technicians / Services)
  function _syncPickToggleLabel(){
    const row = app.querySelector('.pageServicesDash .techPickPanel.diagSection .pickToggleRight');
    if(!row) return;
    row.classList.remove('pickToggleState-tech','pickToggleState-services');
    row.classList.add((st.pickView === 'services') ? 'pickToggleState-services' : 'pickToggleState-tech');
  }

  const pickChk = app.querySelector('.techPickPanel.diagSection input[data-ctl="pickview"]');
  if(pickChk){
    pickChk.addEventListener('change', ()=>{
      st.pickView = pickChk.checked ? 'services' : 'tech';
      _syncPickToggleLabel();
      renderServicesHome();
    });
  }
  _syncPickToggleLabel();

  // ---- Info icon popup (Technicians mode) ----
  (function setupInfoPopup(){
    function closeInfoPopup(){
      const el = document.getElementById('svcInfoPopupEl');
      if(el) el.remove();
      document.removeEventListener('keydown', _onEsc, true);
    }
    function _onEsc(e){ if(e.key==='Escape') closeInfoPopup(); }

    function _positionPop(pop, anchorEl, estW, estH){
      const rect = anchorEl.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      let left = rect.right + 10;
      let top  = rect.top - 6;
      if(left + estW > vw - 8) left = Math.max(8, rect.left - estW - 10);
      if(top + estH > vh - 8) top = Math.max(8, vh - estH - 8);
      if(top < 8) top = 8;
      pop.style.left = `${left}px`;
      pop.style.top  = `${top}px`;
    }

    function _attachClose(pop){
      const cb = pop.querySelector('.svcInfoPopClose');
      if(cb) cb.addEventListener('click', closeInfoPopup);
      document.addEventListener('keydown', _onEsc, true);
      setTimeout(()=>{
        const onDoc = ev => {
          if(!pop.isConnected){ document.removeEventListener('mousedown', onDoc, true); return; }
          if(!pop.contains(ev.target)){ closeInfoPopup(); document.removeEventListener('mousedown', onDoc, true); }
        };
        document.addEventListener('mousedown', onDoc, true);
      }, 0);
    }

    function _makePop(innerHtml, wStyle){
      const pop = document.createElement('div');
      pop.id = 'svcInfoPopupEl';
      pop.className = 'svcInfoPopup';
      pop.style.cssText = wStyle || 'width:max-content;max-width:calc(100vw - 24px);';
      pop.innerHTML = innerHtml;
      document.body.appendChild(pop);
      return pop;
    }

    const fmt = n => (typeof fmtInt === 'function') ? fmtInt(n) : String(Math.round(n));

    function _mathRow(num, lbl){ return `<div class="svcInfoMathRow"><span class="svcInfoNum">${num}</span><span class="svcInfoNumLbl">${lbl}</span></div>`; }
    function _mathLine(){ return `<div class="svcInfoMathLine"></div>`; }
    function _mathResult(num, lbl){ return `<div class="svcInfoMathRow svcInfoMathResult"><span class="svcInfoNum">${num}</span><span class="svcInfoNumLbl">${lbl}</span></div>`; }

    function _singleColPop(title, rows){
      return `
        <div class="svcInfoPopHdr">
          <span class="svcInfoPopTitle" style="white-space:nowrap">${title}</span>
          <button class="svcInfoPopClose" aria-label="Close" type="button">×</button>
        </div>
        <div style="padding:14px 18px 16px;display:flex;flex-direction:column;gap:7px;">
          ${rows}
        </div>`;
    }

    // Info icon → plain text
    app.addEventListener('click', function(e){
      const btn = e.target && e.target.closest ? e.target.closest('.svcInfoIconBtn[data-svcinfo]') : null;
      if(!btn) return;
      e.stopPropagation();
      closeInfoPopup();
      const pop = _makePop(`
        <div class="svcInfoPopHdr" style="padding:12px 14px 10px;">
          <span class="svcInfoPopTitle" style="white-space:normal;line-height:1.5;">ROs for Technicians exclude any with Pre-MPI Sales for selected Service or Category. Click any stats with * for details.</span>
          <button class="svcInfoPopClose" aria-label="Close" type="button">×</button>
        </div>`, 'width:360px;max-width:calc(100vw - 24px);');
      _positionPop(pop, btn, 360, 80);
      _attachClose(pop);
    }, true);

    // Stat clicks → typed math stack
    app.addEventListener('click', function(e){
      const el = e.target && e.target.closest ? e.target.closest('.svcStatStar[data-svcstat]') : null;
      if(!el) return;
      e.stopPropagation();
      closeInfoPopup();

      let d = {};
      try{ d = JSON.parse(el.getAttribute('data-svcstat') || '{}'); }catch(_){}
      const name     = d.name    || '';
      const totalRos = Number(d.totalRos) || 0;
      const preMpi   = Number(d.preMpi)   || 0;
      const soldAsr  = Number(d.soldAsr)  || 0;
      const asr      = Number(d.asr)      || 0;
      const adjRos   = Math.max(0, totalRos - preMpi);
      const type     = d.type || 'ros';

      let html = '';
      if(type === 'ros'){
        const title = `Technician ${name} ROs`;
        html = _singleColPop(title,
          _mathRow(fmt(totalRos), 'Total ROs') +
          _mathRow(`− ${fmt(preMpi)}`, 'Sold Pre-MPI') +
          _mathLine() +
          _mathResult(fmt(adjRos), `Technician ${name} ROs`)
        );
      } else if(type === 'asrro'){
        const title = `Technician ${name} ASRs/RO`;
        const result = adjRos > 0 ? (asr/adjRos).toFixed(2) : '—';
        html = _singleColPop(title,
          _mathRow(fmt(asr), 'ASRs') +
          _mathRow(`÷ ${fmt(adjRos)}`, `Technician ${name} ROs`) +
          _mathLine() +
          _mathResult(result, `Technician ${name} ASRs/RO`)
        );
      } else if(type === 'soldro'){
        const title = `Sold/Technician ${name} ROs`;
        const result = adjRos > 0 ? (soldAsr/adjRos).toFixed(2) : '—';
        html = _singleColPop(title,
          _mathRow(fmt(soldAsr), 'ASRs Sold') +
          _mathRow(`÷ ${fmt(adjRos)}`, `Technician ${name} ROs`) +
          _mathLine() +
          _mathResult(result, `Sold/Technician ${name} ROs`)
        );
      }

      const pop = _makePop(html, 'width:max-content;max-width:calc(100vw - 24px);');
      _positionPop(pop, el, 320, 180);
      _attachClose(pop);
    }, true);
  })();

  // Persist open/closed sections
  app.querySelectorAll('details.svcDashSec').forEach(d=>{
    const key = d.getAttribute('data-sec');
    const _sync = ()=>{
      st.open[key] = d.open;
      const btn = d.querySelector('.secToggle');
      if(btn) btn.textContent = d.open ? '−' : '+';
    };
    d.addEventListener('toggle', _sync);
    _sync();

    // Only allow toggling when clicking the title text or the +/- icon
    const summary = d.querySelector('summary');
    if(summary){
      summary.addEventListener('click', (e)=>{
        const hit = e.target && e.target.closest ? e.target.closest('.secToggle, .svcDashSecTitle') : null;
        const infoHit = e.target && e.target.closest ? e.target.closest('.svcInfoIconBtn') : null;
        if(infoHit){ e.preventDefault(); return; } // info icon handles its own popup
        if(!hit){ e.preventDefault(); }
      }, true);
    }
  });

// Animate gauges (sets ring fill + enables hold interaction)
try{ animateSvcGauges(); }catch(e){}

// Also allow a simple click toggle for the alt view (quick feedback)
try{
  app.querySelectorAll('.svcGauge[data-p]').forEach(el=>{
    if(el.getAttribute('data-click')==='1') return;
    el.setAttribute('data-click','1');
    el.addEventListener('click', ()=>{
      el.classList.toggle('showAlt');
      clearTimeout(el._svcT);
      el._svcT = setTimeout(()=>{ try{ el.classList.remove('showAlt'); }catch(_e){} }, 1200);
    });
  });
}catch(e){}

  // ---- Diag interactions (pie -> list of services, tech rows -> tech page) ----
  // Use a module-level token so stale listeners from previous renders self-cancel.
  if(!window._svcDiagPopToken) window._svcDiagPopToken = 0;

  function closeSvcDiagPopup(){
    const el = document.getElementById('svcDiagPopup');
    if(el) el.remove();
    document.removeEventListener('keydown', onSvcEsc, true);
  }
  function onSvcEsc(e){ if(e.key==='Escape') closeSvcDiagPopup(); }

  window._openSvcDiagPopup = function openSvcDiagPopup(ev, mode, band, anchorEl){
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    closeSvcDiagPopup();
    const list = (svcBands[mode] && svcBands[mode][band]) ? svcBands[mode][band].slice() : [];
    list.sort((a,b)=> (a.pct||0) - (b.pct||0));
    const title = (mode==='sold') ? 'SOLD' : 'ASR';
    const uid = `svc-${mode}-${band}`;
    const isGreen  = band==='green';
    const isYellow = band==='yellow';
    const isOrange = band==='orange';
    const isRed    = band==='red';
    const popFill   = isGreen ? '#1fcb6a' : isYellow ? '#ffbf2f' : isOrange ? '#f97316' : '#ff4b4b';
    const popFillHi = isGreen ? '#7CFFB0' : isYellow ? '#ffd978' : isOrange ? '#fdba74' : '#ff8b8b';
    const bandIcon = isGreen
      ? `<svg viewBox="0 0 64 64" aria-hidden="true" style="width:34px;height:34px;display:block;filter:drop-shadow(0 10px 18px rgba(0,0,0,.35))">
          <defs>
            <radialGradient id="popChkHi-${uid}" cx="35%" cy="25%" r="70%"><stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="60%" stop-color="rgba(255,255,255,.10)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
            <linearGradient id="popChkGrad-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${popFillHi}"/><stop offset="100%" stop-color="${popFill}"/></linearGradient>
          </defs>
          <circle cx="32" cy="32" r="28" fill="url(#popChkGrad-${uid})"/><circle cx="32" cy="32" r="28" fill="url(#popChkHi-${uid})"/>
          <path d="M19 33.5l7.2 7.2L46 21.9" fill="none" stroke="#fff" stroke-width="7.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      : `<svg viewBox="0 0 100 87" aria-hidden="true" style="width:34px;height:auto;display:block;filter:drop-shadow(0 10px 18px rgba(0,0,0,.35))">
          <defs>
            <linearGradient id="popTriGrad-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${popFillHi}"/><stop offset="100%" stop-color="${popFill}"/></linearGradient>
            <radialGradient id="popTriHi-${uid}" cx="35%" cy="20%" r="75%"><stop offset="0%" stop-color="rgba(255,255,255,.55)"/><stop offset="55%" stop-color="rgba(255,255,255,.10)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <path d="M50 0 C53 0 55 2 56.5 4.5 L99 85 C101 88 99 91 95 91 L5 91 C1 91 -1 88 1 85 L43.5 4.5 C45 2 47 0 50 0Z" fill="url(#popTriGrad-${uid})"/>
          <path d="M50 6 C52 6 54 7.2 55.2 9.6 L92 80 C94 83 92.2 86 88.4 86 L11.6 86 C7.8 86 6 83 8 80 L44.8 9.6 C46 7.2 48 6 50 6Z" fill="url(#popTriHi-${uid})"/>
          <rect x="46" y="20" width="8" height="34" rx="3" fill="rgba(0,0,0,.78)"/>
          <circle cx="50" cy="66" r="5" fill="rgba(0,0,0,.78)"/>
        </svg>`;
    const pop = document.createElement('div');
    pop.id = 'svcDiagPopup';
    pop.className = 'diagPopup';

    // Match renderTech popup look (avoid CSS dependency)
    pop.style.position = 'fixed';
    pop.style.zIndex = '9999';
    pop.style.width = '520px';
    pop.style.maxWidth = 'calc(100vw - 24px)';
    pop.style.background = 'linear-gradient(180deg, rgba(22,28,44,.98), rgba(10,14,24,.98))';
    pop.style.border = '1px solid rgba(255,255,255,.10)';
    pop.style.borderRadius = '16px';
    pop.style.boxShadow = '0 22px 60px rgba(0,0,0,.55)';
    pop.style.overflow = 'hidden';
    pop.style.overflowX = 'hidden';
    pop.innerHTML = `
      <div class="diagPopHead" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08)">
        <div class="diagPopTitle" style="font-weight:1000;letter-spacing:.4px;display:flex;align-items:center;gap:10px">${title}${bandIcon}</div>
        <button class="diagPopClose" aria-label="Close" style="margin-left:auto;background:transparent;border:none;color:rgba(255,255,255,.75);font-size:22px;cursor:pointer;line-height:1">×</button>
      </div>
      <div class="diagPopList" style="padding:10px 12px;display:grid;gap:8px;max-height:420px;overflow:auto;overflow-x:hidden">
        ${list.length ? list.map((it,i)=>{
          const id = 'sd-'+safeSvcIdLocal(it.name).replace(/^svc-/, '');
          return `
            <button class="diagPopRowBtn" type="button" data-target="${id}" style="width:100%;text-align:left;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:8px 10px;color:inherit;display:flex;align-items:center;gap:6px;cursor:pointer">
              <span class="rankNum">${i+1}.</span>
              <span style="flex:0 1 340px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${safe(it.name)}</span>
              <span style="margin-left:6px;color:rgba(255,255,255,.75);font-weight:900;white-space:nowrap">${fmtPct(it.pct)}</span>
            </button>`;
        }).join('') : `<div class="notice" style="padding:8px 2px">No services</div>`}
      </div>
    `;
    document.body.appendChild(pop);

    const closeBtn = pop.querySelector('button[aria-label="Close"]');
    if(closeBtn) closeBtn.addEventListener('click', closeSvcDiagPopup);

    pop.addEventListener('click', (e)=>{
      const btn = e.target && e.target.closest ? e.target.closest('.diagPopRowBtn') : null;
      if(!btn) return;
      const tid = btn.getAttribute('data-target');
      if(tid){
        const el = document.getElementById(tid);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }
      closeSvcDiagPopup();
    }, true);

    // Position using mouse event coords (reliable across all browsers/SVG scenarios)
    const clientX = (ev && ev.clientX) ? ev.clientX : (window.innerWidth / 2);
    const clientY = (ev && ev.clientY) ? ev.clientY : (window.innerHeight / 2);
    const vw = window.innerWidth, vh = window.innerHeight;
    const popW = 520, popH = 400; // estimated height before layout
    let left = clientX + 14;
    let top  = clientY - 20;
    if(left + popW > vw - 8) left = clientX - popW - 14;
    if(left < 8) left = 8;
    if(top + popH > vh - 8) top = Math.max(8, vh - popH - 8);
    if(top < 8) top = 8;
    pop.style.left = `${left}px`;
    pop.style.top  = `${top}px`;

    // Issue token so stale mousedown listeners from previous renders self-cancel
    const myToken = ++window._svcDiagPopToken;
    setTimeout(()=>{
      const onDoc = (e)=>{
        // Stale listener (from a previous render) — self-remove without closing current popup
        if(window._svcDiagPopToken !== myToken){ document.removeEventListener('mousedown', onDoc, true); return; }
        // Also self-clean if our pop was removed externally (re-render)
        if(!pop.isConnected){ document.removeEventListener('mousedown', onDoc, true); return; }
        if(!pop.contains(e.target)){ document.removeEventListener('mousedown', onDoc, true); closeSvcDiagPopup(); }
      };
      document.addEventListener('mousedown', onDoc, true);
    }, 0);
    document.addEventListener('keydown', onSvcEsc, true);
  }

  // Pie slice clicks -> popup.
  // Use document-level capture (same as renderTech.js) — this is the only pattern that
  // reliably intercepts SVG clicks before other handlers can swallow them.
  if(!window._svcPieDelegateAttached){
    window._svcPieDelegateAttached = true;
    document.addEventListener('click', function _svcPieDelegate(e){
      const slice = e.target && e.target.closest ? e.target.closest('.diagPieSlice') : null;
      if(!slice) return;
      if(slice.getAttribute('data-tech')) return; // renderTech.js owns slices with data-tech
      e.stopPropagation();
      const mode = slice.getAttribute('data-mode');
      const band = slice.getAttribute('data-band');
      if(window._openSvcDiagPopup) window._openSvcDiagPopup(e, mode, band, slice);
    }, true);
  }

  // Tech clicks in diag -> tech page
  const diagRoot = app.querySelector('.svcDiagPanel');
  if(diagRoot){
    diagRoot.addEventListener('click', (e)=>{
      const b = e.target && e.target.closest ? e.target.closest('.tbJump[data-tech]') : null;
      if(!b) return;
      e.preventDefault();
      const id = b.getAttribute('data-tech');
      if(id) location.hash = `#/tech/${encodeURIComponent(id)}`;
    }, true);
  }

  // Re-render when the global date picker changes
  window.addEventListener('globalDateChange', function _svcHomeDateHandler() {
    window.removeEventListener('globalDateChange', _svcHomeDateHandler);
    if (typeof window.renderServicesHome === 'function') window.renderServicesHome();
  });

}

window.renderServicesHome = renderServicesHome;
