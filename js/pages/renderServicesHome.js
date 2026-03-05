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
      .pageServicesDash details.svcDashSec > summary{list-style:none;cursor:pointer;}
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
      .pageServicesDash .svcSecFocusStats>div{display:flex;flex-direction:column;align-items:center;}
      .pageServicesDash .svcSecFocusStats .statValTop{font-size:32px;line-height:1;font-weight:1000;color:#fff;text-align:center;}
      .pageServicesDash .svcSecFocusStats .statValBot{font-size:22px;line-height:1;font-weight:1000;color:#fff;opacity:.92;text-align:center;}
      .pageServicesDash .svcSecFocusStats .statLbl{font-size:14px;line-height:1.05;font-weight:1000;color:rgba(255,255,255,.55);letter-spacing:.2px;text-transform:none;text-align:center;width:100%;}
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
      .pageServicesDash .sdCatHdrRow{display:flex;align-items:center;justify-content:flex-end;gap:22px;flex:0 0 auto;white-space:nowrap;flex-direction:row !important;}
      .pageServicesDash .sdCatHdrRow .svcGaugeWrap{order:1 !important;}
      .pageServicesDash .sdCatHdrRow .rankFocusBadge{order:2 !important;}

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
      /* Service cards: allow rows to expand/show full text (no ellipsis) */
      .pageServicesDash .catCard{min-width:0;max-width:none;width:100%;}
      .pageServicesDash .svcTechRow{align-items:flex-start;}
      .pageServicesDash .svcTechLeft{min-width:0;flex:1 1 auto;}
      .pageServicesDash .svcTechLeft a{max-width:none;white-space:normal;overflow:visible;text-overflow:clip;}
      .pageServicesDash .svcTechMeta{white-space:normal;}
      .pageServicesDash .svcTechMetaRow{white-space:normal;}

      .pageServicesDash .svcTechList{margin-top:10px;display:grid;gap:8px;}
      /* Tech name + meta typography in section header (requested) */
      .pageServicesDash .svcDashSecHead .svcTechLeft,
      .pageServicesDash .svcDashSecHead .svcTechLeft a{font-size:14px !important;font-weight:700 !important;}
      .pageServicesDash .svcDashSecHead .svcTechMetaRow{font-size:14px !important;font-weight:700 !important;}

      .pageServicesDash .svcTechRow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.18);}
      .pageServicesDash .svcTechLeft{display:flex;align-items:center;gap:8px;min-width:0;}
      .pageServicesDash .svcTechLeft a{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;}
      .pageServicesDash .svcRankNum{color:rgba(255,255,255,.65);font-weight:1000;min-width:22px;text-align:right;}
      .pageServicesDash .svcTechMeta{color:rgba(255,255,255,.72);font-weight:900;white-space:nowrap;font-size:12px;}
      .pageServicesDash .svcTechMetaRow{display:block;font-size:14px;font-weight:700;}

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
      .pageServicesDash .svcIcon-bad{width:24px;height:24px;}
      .pageServicesDash .svcIcon-good svg{width:18px;height:18px;display:block}
      .pageServicesDash .svcIcon-warn svg,
      .pageServicesDash .svcIcon-bad svg{width:24px;height:24px;display:block}
      /* Make the ! a bit smaller inside triangles */
      .pageServicesDash .svcIcon-warn text,
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
      .pageServicesDash .svcHdrGoalDials .svcGauge,
      .pageServicesDash .svcHdrGoalDials .svcGauge *{cursor:default !important;}

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



      .pageServicesDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen{display:grid !important;grid-template-columns:repeat(2, minmax(160px,1fr)) !important;}
      @media(max-width:920px){ .pageServicesDash .techHeaderPanel .mainFiltersBar .controls.mainAlwaysOpen{grid-template-columns:1fr !important;} }

      /* Dropdown text colors: selected value white, dropdown list black */
      .pageServicesDash .techHeaderPanel select{color:#fff !important;}
      .pageServicesDash .techHeaderPanel select option{color:#000 !important;}
      /* === sdCatHdrRow dial label positioning (service card header dials ONLY) === */
      .pageServicesDash .sdCatHdrRow{align-items:center !important;}
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

      /* === sdCatHdrRow micro-align (service card header ONLY) === */
      .pageServicesDash .sdCatHdrRow{align-items:flex-start !important;}
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
      /* Keep the (scaled) rank badge pinned to the top of the row */
      .pageServicesDash .sdCatHdrRow .rankFocusBadge{align-self:flex-start !important;margin-top:0 !important;}


    `;
  })();

  // ---- Local state (kept independent of main dashboard state) ----
  if(typeof UI === 'undefined') window.UI = {};
  if(!UI.servicesDash) UI.servicesDash = { focus: 'asr', goalMetric: 'asr', team: 'store', fluids: 'with', open: {} };

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
      if(k==="fluids") st.fluids = decodeURIComponent(v||"with") || "with";    }
  }

  const focus = (st.focus === 'sold') ? 'sold' : 'asr';
  const goalMetric = (st.goalMetric === 'sold') ? 'sold' : 'asr';
  const teamSel = (st.team === 'express' || st.team === 'kia' || st.team === 'store') ? st.team : 'store';
  const fluidsSel = (st.fluids === 'without' || st.fluids === 'only' || st.fluids === 'with') ? st.fluids : 'with';
  const comparison = 'goal';

  const pickView = (st.pickView === 'services') ? 'services' : 'tech';

  const teamLine = (teamSel === 'express') ? 'Express' : (teamSel === 'kia') ? 'Kia' : 'All Teams';
  const focusLine = (focus === 'sold') ? 'Sold Goal' : 'ASR Goal';

  const techsAll = (typeof DATA !== 'undefined' && Array.isArray(DATA.techs))
    ? DATA.techs.filter(t=>t && (t.team === 'EXPRESS' || t.team === 'KIA'))
    : [];

  // Apply Team filter (Express / Kia / All Teams) across the entire Services Dashboard page
  const techs = (teamSel === 'express')
    ? techsAll.filter(t=>t.team === 'EXPRESS')
    : (teamSel === 'kia')
      ? techsAll.filter(t=>t.team === 'KIA')
      : techsAll;
// Determine the metric used for goal comparisons/ranking
  const rankMetric = (focus==='sold') ? 'sold' : 'asr';

  // Overall totals (team-scoped)
  const totalRos  = techs.reduce((s,t)=>s+(Number(t.ros)||0),0);
  const totalAsr  = techs.reduce((s,t)=>s+(Number(t.summary?.total?.asr)||0),0);
  const totalSold = techs.reduce((s,t)=>s+(Number(t.summary?.total?.sold)||0),0);
  const soldPerAsr = totalAsr ? (totalSold/totalAsr) : null;
  const asrPerRo  = totalRos ? (totalAsr/totalRos) : null;
  const soldPerRo = totalRos ? (totalSold/totalRos) : null;

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
    if(p >= 0.80) cls = "gGreen";
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
  function headerGoalDial(pct){
    const p = Number(pct);
    const finite = Number.isFinite(p);
    const pClamped = finite ? Math.max(0, p) : 0;
    const ring = Math.round(Math.min(pClamped, 1) * 100);

    let cls = "gRed";
    if(pClamped >= 0.80) cls = "gGreen";
    else if(pClamped >= 0.60) cls = "gYellow";

    // percent above/below goal
    const delta = finite ? Math.round((pClamped - 1) * 100) : null;
    const absDelta = (delta===null) ? "—" : Math.abs(delta);
    const arrow = (delta===null) ? "" : (delta >= 0 ? "▲" : "▼");
    const arrowColor = (delta===null) ? "rgba(255,255,255,.55)" : (delta >= 0 ? "rgba(34,197,94,.98)" : "rgba(239,68,68,.98)");

    return `<span class="svcGauge ${cls}" data-p="${ring}">
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
function serviceGoalDial(pct, sz){
  const p = Number(pct);
  const finite = Number.isFinite(p);
  const pClamped = finite ? Math.max(0, p) : 0;
  const ring = Math.round(Math.min(pClamped, 1) * 100);

  let cls = "gRed";
  if(pClamped >= 0.80) cls = "gGreen";
  else if(pClamped >= 0.60) cls = "gYellow";

  const delta = finite ? Math.round((pClamped - 1) * 100) : null;
  const absDelta = (delta===null) ? "—" : Math.abs(delta);
  const arrow = (delta===null) ? "" : (delta >= 0 ? "▲" : "▼");
  const arrowColor = (delta===null) ? "rgba(255,255,255,.55)" : (delta >= 0 ? "rgba(34,197,94,.98)" : "rgba(239,68,68,.98)");

  const s = Number(sz);
  const size = Number.isFinite(s) && s>0 ? Math.round(s) : 72;

  /* IMPORTANT: the dial size MUST be applied to the svcGauge itself (not just the wrapper),
     because app.css defines a default --sz on .svcGauge. */
  return `<span class="svcGauge ${cls}" data-p="${ring}" style="--sz:${size}px;width:${size}px;height:${size}px">
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



  // --- Build a global goal-rank map for services (denominator = total services on this page) ---
  const _allCatsSet = new Set();
  for(const t of techs){ for(const k of Object.keys(t.categories||{})) _allCatsSet.add(k); }

  const _allServiceNames = (Array.isArray(DATA.sections)?DATA.sections:[])
    .flatMap(s => (s?.categories||[]).map(String).filter(Boolean))
    .filter(c => _allCatsSet.has(c));
  const _uniqServices = Array.from(new Set(_allServiceNames));
  const _svcRankDen = _uniqServices.length || 1;
  const _svcGoalPct = new Map();
  for(const svcName of _uniqServices){
    // Build minimal aggregates
    let ros=0, asr=0, sold=0;
    for(const t of techs){
      const row = (t.categories||{})[svcName];
      if(!row) continue;
      ros  += Number(row.ros)||0;
      asr  += Number(row.asr)||0;
      sold += Number(row.sold)||0;
    }
    const reqTot = ros ? (asr/ros) : NaN;
    const closeTot = asr ? (sold/asr) : NaN;
    const gReq = Number(getGoal(svcName,'req'));
    const gClose = Number(getGoal(svcName,'close'));
    const pct = (rankMetric==='sold')
      ? ((Number.isFinite(closeTot) && Number.isFinite(gClose) && gClose>0) ? (closeTot/gClose) : NaN)
      : ((Number.isFinite(reqTot) && Number.isFinite(gReq) && gReq>0) ? (reqTot/gReq) : NaN);
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
    const top = (rankMetric==='sold') ? 'Sold Goal' : 'ASR Goal';
    const total = fmtInt(_svcRankDen);
    return rankBadgeHtmlSvc(rk, total, top, true);
  }


  // Top-right block
  let topVal = asrPerRo;
  let topLbl = 'ASRs/RO';
  let subVal = soldPerRo;
  let subLbl = 'Sold/RO';
  if(focus === 'sold'){
    topVal = soldPerRo; topLbl = 'Sold/RO';
    subVal = asrPerRo;  subLbl = 'ASRs/RO';
  }

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
                <div class="techTeamLine" style="margin-top:6px">${safe(teamLine)} • ${safe(focusLine)}</div>
              </div>
              
              <div class="svcHdrPillsAndDials" style="margin-left:34px;display:flex;flex-direction:column;gap:10px;flex:1 1 auto;min-width:0">
                <div class="pillsMini">
                  <div class="pillMini"><div class="k">ROs</div><div class="v">${fmtInt(totalRos)}</div></div>
                  <div class="pillMini"><div class="k">ASRs</div><div class="v">${fmtInt(totalAsr)}</div></div>
                  <div class="pillMini sold"><div class="k">Sold</div><div class="v">${fmtInt(totalSold)}</div></div>
                  <div class="pillMini sold"><div class="k">Sold/ASR</div><div class="v">${soldPerAsr===null ? "—" : fmtPct(soldPerAsr)}</div></div>
                </div>

                <div class="svcHdrGoalDials">
                  <div class="svcGaugeCol">
                    <div class="svcGaugeWrap" style="--sz:85px">${headerGoalDial(goalsAgg.asrPctOfGoal)}</div>
                    <div class="svcGaugeLbl">ASR</div>
                  </div>
                  <div class="svcGaugeCol">
                    <div class="svcGaugeWrap" style="--sz:85px">${headerGoalDial(goalsAgg.soldPctOfGoal)}</div>
                    <div class="svcGaugeLbl">SOLD</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="overallBlock">
            <div class="bigMain" style="font-size:38px;line-height:1.05;color:#fff;font-weight:1000">
              ${topVal===null ? "—" : (focus==='goal' ? fmt1(topVal,2) : (focus==='sold' ? fmt1(topVal,2) : fmt1(topVal,1)))}
            </div>
            <div class="tag">${safe(topLbl)}</div>

            <div class="overallMetric" style="font-size:28px;line-height:1.05;color:#fff;font-weight:1000">
              ${subVal===null ? "—" : (focus==='sold' ? fmt1(subVal,1) : fmt1(subVal,2))}
            </div>
            <div class="tag">${safe(subLbl)}</div>
          </div>
        </div>

        <div class="svcHdrDivider"></div>
        <div class="mainFiltersBar">
                              <div class="controls mainAlwaysOpen">
                      <div>
                        <label>Team</label>
                        <select data-svcdash="1" data-ctl="team">
                          <option value="express" ${teamSel==='express'?'selected':''}>Express</option>
                          <option value="kia" ${teamSel==='kia'?'selected':''}>Kia</option>
                          <option value="store" ${teamSel==='store'?'selected':''}>All Teams</option>
                        </select>
                      </div>
          
                      <div>
                        <label>Fluids</label>
                        <select data-svcdash="1" data-ctl="fluids">
                          <option value="with" ${fluidsSel==='with'?'selected':''}>With Fluids (Total)</option>
                          <option value="without" ${fluidsSel==='without'?'selected':''}>Without Fluids</option>
                          <option value="only" ${fluidsSel==='only'?'selected':''}>Fluids Only</option>
                        </select>
                      </div>
          
                      <div>
                        <label>Focus</label>
                        <select data-svcdash="1" data-ctl="focus">
                          <option value="asr" ${focus==='asr'?'selected':''}>ASR Goal</option>
                          <option value="sold" ${focus==='sold'?'selected':''}>Sold Goal</option>
                        </select>
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
    const pct100 = Number(pctOfBase) * 100;
    const g = (typeof _gradeFromPct100 === 'function') ? _gradeFromPct100(pct100) : (pct100>=90?'A':pct100>=80?'B':pct100>=70?'C':pct100>=60?'D':'F');
    return (g==='A' || g==='B') ? 'good' : (g==='C' || g==='D') ? 'warn' : 'bad';
  }

  function iconSvg(kind){
    if(kind==='good') return `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="rgba(26,196,96,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><path d="M4.3 8.3 L7 11 L12 5.6" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if(kind==='bad') return `<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="8,3 14,13 2,13" fill="rgba(255,74,74,1)" stroke="rgba(255,255,255,.35)" stroke-width="1"/><text x="8" y="11.6" text-anchor="middle" font-size="7.9" font-weight="600" fill="rgba(255,255,255,.95)">!</text></svg>`;
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

    return `
      <div class="svcTechRow">
        <div class="svcTechLeft">
          <span class="svcRankNum">${rank}.</span>
          <a href="#/tech/${encodeURIComponent(r.id)}" onclick="return goTech(${JSON.stringify(r.id)})">${safe(r.name)}</a>
        </div>
        <div class="svcTechMeta">
          <div class="svcTechMetaRow">ROs <b>${fmtInt(r.ros)}</b> • ASRs <b>${fmtInt(r.asr)}</b>${iconHtml(asrPctBase)} • Sold <b>${fmtInt(r.sold)}</b>${iconHtml(soldPctBase)}</div>
        </div>
      </div>
    `;
  }

  function buildServiceAgg(serviceName){
    let asr=0, sold=0, totalRos=0;
    const techRows = [];

    for(const t of techs){
      const c = (t.categories||{})[serviceName];
      const a = Number(c?.asr)||0;
      const so = Number(c?.sold)||0;
      const rosTech = Number(t.ros)||0;
      asr += a; sold += so; totalRos += rosTech;
      const req = rosTech ? (a/rosTech) : 0; // ASR/RO (ratio)
      const close = a ? (so/a) : 0; // Sold% (ratio)
      techRows.push({id:t.id, name:t.name, team:t.team, ros:rosTech, asr:a, sold:so, req, close, serviceName});
    }

    const reqTot = totalRos ? (asr/totalRos) : 0;
    const closeTot = asr ? (sold/asr) : 0;

    const nTech = techs.length || 1;
    const storeAvgRosL = totalRos / nTech;
    const storeAvgAsrL = asr / nTech;
    const storeAvgSoldL = sold / nTech;

    const teamTotals = {};
    const teamCounts = {};
    for(const r of techRows){
      const tk = r.team || 'UNKNOWN';
      if(!teamTotals[tk]) teamTotals[tk] = {ros:0, asr:0, sold:0};
      if(!teamCounts[tk]) teamCounts[tk] = 0;
      teamCounts[tk] += 1;
      teamTotals[tk].ros += Number(r.ros)||0;
      teamTotals[tk].asr += Number(r.asr)||0;
      teamTotals[tk].sold += Number(r.sold)||0;
    }
    const teamBaseCountsL = {};
    for(const k in teamTotals){
      const cnt = teamCounts[k] || 1;
      teamBaseCountsL[k] = {rosAvg: teamTotals[k].ros/cnt, asrAvg: teamTotals[k].asr/cnt, soldAvg: teamTotals[k].sold/cnt};
    }

    return {serviceName, totalRos, asr, sold, reqTot, closeTot, storeAvgRos: storeAvgRosL, storeAvgAsr: storeAvgAsrL, storeAvgSold: storeAvgSoldL, teamBaseCounts: teamBaseCountsL, techRows};
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
      let ros=0, asr=0, sold=0;
      for(const t of techs){
        for(const cat of (sec.categories||[])){
          const row = (t.categories||{})[cat];
          if(!row) continue;
          ros += Number(row.ros)||0;
          asr += Number(row.asr)||0;
          sold += Number(row.sold)||0;
        }
      }

      const asrPerRo = ros ? (asr/ros) : NaN;
      const soldPct = asr ? (sold/asr) : NaN;
      const pctGoalAsr = (Number.isFinite(asrPerRo) && Number.isFinite(gReqSec) && gReqSec>0) ? (asrPerRo/gReqSec) : NaN;
      const pctGoalSold = (Number.isFinite(soldPct) && Number.isFinite(gCloseSec) && gCloseSec>0) ? (soldPct/gCloseSec) : NaN;
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
    const secRos  = aggs.reduce((s,x)=>s+(Number(x.totalRos)||0),0);
    const secAsr  = aggs.reduce((s,x)=>s+(Number(x.asr)||0),0);
    const secSold = aggs.reduce((s,x)=>s+(Number(x.sold)||0),0);
    const secAvgOdo = techs.length ? (techs.reduce((s,t)=>s+(Number(t.odo)||0),0) / techs.length) : 0;
    const secSoldPerRo = (Number.isFinite(secRos) && secRos>0) ? (secSold/secRos) : NaN;
    const secAsrPerRo = secRos ? (secAsr/secRos) : null;
    const secSoldPct = secAsr ? (secSold/secAsr) : null;

    // Focus stats: determined by Goal filter
    const secTopIsSold = (goalMetric==='sold');
    const secTopVal = secTopIsSold ? secSoldPct : secAsrPerRo;
    const secTopLbl = secTopIsSold ? 'Sold%' : 'ASRs/RO';
    const secBotVal = secTopIsSold ? secAsrPerRo : secSoldPct;
    const secBotLbl = secTopIsSold ? 'ASRs/RO' : 'Sold%';

    // Goal dials: compare section focus stats to THIS SECTION's goals (with safe fallbacks)
    const gReqSec = _getSectionGoal(sec,'req');
    const gCloseSec = _getSectionGoal(sec,'close');
    const secPctGoalAsr = (Number.isFinite(secAsrPerRo) && Number.isFinite(gReqSec) && gReqSec>0) ? (secAsrPerRo/gReqSec) : NaN;
    const secPctGoalSold = (Number.isFinite(secSoldPct) && Number.isFinite(gCloseSec) && gCloseSec>0) ? (secSoldPct/gCloseSec) : NaN;

    const secRank = _secRankInfo.map.get(secName) || '—';
    const secRankTop = (goalMetric==='sold') ? 'Sold Goal' : 'ASR Goal';

    // Section averages (used for dials when not GOAL focus)
    const avgReq = aggs.length ? aggs.reduce((s,x)=>s+x.reqTot,0)/aggs.length : 0;
    const avgClose = aggs.length ? aggs.reduce((s,x)=>s+x.closeTot,0)/aggs.length : 0;

    // Build cards
    const cardsHtml = aggs.map(s=>{
      // Dial basis
      const pctVsAvgReq   = (Number.isFinite(s.reqTot)   && Number.isFinite(avgReq)   && avgReq>0)   ? (s.reqTot/avgReq) : NaN;
      const pctVsAvgClose = (Number.isFinite(s.closeTot) && Number.isFinite(avgClose) && avgClose>0) ? (s.closeTot/avgClose) : NaN;

      const gReq = Number(getGoal(s.serviceName,'req'));
      const gClose = Number(getGoal(s.serviceName,'close'));
      const pctOfGoalReq = (Number.isFinite(s.reqTot) && Number.isFinite(gReq) && gReq>0) ? (s.reqTot/gReq) : NaN;
      const pctOfGoalClose = (Number.isFinite(s.closeTot) && Number.isFinite(gClose) && gClose>0) ? (s.closeTot/gClose) : NaN;

      // Always use Goal dial for all services (metric depends on Focus)
      const dialPct = (rankMetric==='sold') ? pctOfGoalClose : pctOfGoalReq;
      const dialLabel = (rankMetric==='sold') ? 'Sold Goal' : 'ASR Goal';

      const sdDialTitle = (rankMetric==='sold') ? 'Sold' : 'ASR';

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
              <div class="catTitle">${safe(s.serviceName)}</div>
              <div class="muted" style="margin-top:2px">
                <div>${fmtInt(s.totalRos)} ROs • ${fmtInt(s.asr)} ASRs</div>
                <div>${fmtInt(s.sold)} Sold</div>
              </div>
            </div>

            <div class="sdCatHdrRow">
              <div class="svcGaugeCol sdCatDialCol">
                <div class="svcGaugeWrap" style="--sz:${sdDialSz}px">
                  ${serviceGoalDial(Number.isFinite(dialPct)?dialPct:0, sdDialSz)}
                </div>
                <div class="svcGaugeLbl">${sdDialTitle}</div>
              </div>
              ${goalRankBadge(s.serviceName)}
            </div>
          </div>

          <div class="subHdr">TECHNICIANS</div>
          <div class="svcTechList">${techList || `<div class="notice" style="padding:8px 2px">No technicians</div>`}</div>
        </div>
      `;
    }).join('');

    return `
      <details class="svcDashSec" ${isOpen?'open':''} data-sec="${safe(openKey)}">
        <summary>
          <div class="svcDashSecHead">
            <div class="svcDashSecHeadLeft">
              <div class="svcDashSecTitleRow">
                <div class="secToggle" aria-hidden="true">${isOpen?'−':'+'}</div>
                <div class="svcDashSecTitle">${safe(secName)}</div>
              </div>
              <div class="svcDashSecPillsLeft pillsMini">
                <div class="pillMini"><div class="k">Avg ODO</div><div class="v">${fmtInt(secAvgOdo)}</div></div>
                <div class="pillMini"><div class="k">ROs</div><div class="v">${fmtInt(secRos)}</div></div>
                <div class="pillMini"><div class="k">ASRs</div><div class="v">${fmtInt(secAsr)}</div></div>
                <div class="pillMini sold"><div class="k">Sold</div><div class="v">${fmtInt(secSold)}</div></div>
                <div class="pillMini"><div class="k">Sold/RO</div><div class="v">${Number.isFinite(secSoldPerRo)?secSoldPerRo.toFixed(2):'—'}</div></div>
              </div>
            </div>

            <div class="svcDashSecHeadRight">
                            <div class="svcSecHeadDials">
                ${goalMetric==='sold'
                  ? `
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap mini">${serviceGoalDial(secPctGoalAsr, 74)}</div>
                      <div class="svcGaugeLbl">ASR</div>
                    </div>
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap focus">${serviceGoalDial(secPctGoalSold, 90)}</div>
                      <div class="svcGaugeLbl">Sold</div>
                    </div>
                  `
                  : `
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap mini">${serviceGoalDial(secPctGoalSold, 74)}</div>
                      <div class="svcGaugeLbl">Sold</div>
                    </div>
                    <div class="svcGaugeCol">
                      <div class="svcGaugeWrap focus">${serviceGoalDial(secPctGoalAsr, 90)}</div>
                      <div class="svcGaugeLbl">ASR</div>
                    </div>
                  `
                }
              </div>
              ${rankBadgeHtmlSvc(secRank, fmtInt(_secRankInfo.den), (goalMetric==='sold'?'Sold Goal':'ASR Goal'), false)}
              <div class="svcSecFocusStats">
                <div>
                  <div class="statValTop">${secTopVal===null ? "—" : (secTopLbl==="Sold%" ? fmtPct(secTopVal) : fmt1(secTopVal,2))}</div>
                  <div class="statLbl">${safe(secTopLbl)}</div>
                </div>
                <div>
                  <div class="statValBot">${secBotVal===null ? "—" : (secBotLbl==="Sold%" ? fmtPct(secBotVal) : fmt1(secBotVal,2))}</div>
                  <div class="statLbl">${safe(secBotLbl)}</div>
                </div>
              </div>
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
    if(pct < 0.60) return 'red';
    if(pct < 0.80) return 'yellow';
    return 'green';
  }

  // Service goal bands (for the pies)
  const svcAggsAll = _uniqServices.map(buildServiceAgg);
  const svcBands = { asr:{red:[],yellow:[],green:[]}, sold:{red:[],yellow:[],green:[]} };
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

  const topSvcAsr = svcRankAsr.rows.slice(0,3);
  const botSvcAsr = svcRankAsr.rows.slice(-3).reverse();

  const topSvcSold = svcRankSold.rows.slice(0,3);
  const botSvcSold = svcRankSold.rows.slice(-3).reverse();

  function tbRowSvc(item, idx, mode){
    const rk = (mode==='sold' ? svcRankSold.rankMap.get(item.name) : svcRankAsr.rankMap.get(item.name)) || '—';
    const targetId = 'sd-' + safeSvcIdLocal(item.name).replace(/^svc-/, '');
    return `
      <div class="techRow">
        <div class="techRowLeft">
          <span class="rankNum">${idx}.</span>
          <a class="tbJump" href="#${targetId}" onclick="event.preventDefault();(document.getElementById(${JSON.stringify(targetId)})||{}).scrollIntoView&&document.getElementById(${JSON.stringify(targetId)}).scrollIntoView({behavior:'smooth',block:'start'});return false;">${safe(item.name)}</a>
        </div>
        <div class="mini">Rank = ${rk}</div>
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
    const green = svcBands[mode].green.length;
    const total = red + yellow + green;

    const cx = 80, cy = 80, rad = 70;
    const toRad = (deg)=> (deg*Math.PI/180);
    const at = (angDeg, r)=>({ x: cx + r*Math.cos(toRad(angDeg)), y: cy + r*Math.sin(toRad(angDeg)) });
    const arcPath = (a0, a1)=>{
      const p0 = at(a0, rad);
      const p1 = at(a1, rad);
      const large = (Math.abs(a1-a0) > 180) ? 1 : 0;
      return `M ${cx} ${cy} L ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${rad} ${rad} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
    };

    const parts = [
      {band:'red', n:red, fill:'#ff4b4b'},
      {band:'yellow', n:yellow, fill:'#ffbf2f'},
      {band:'green', n:green, fill:'#1fcb6a'},
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
          ${slices.map(s=>`<text class="diagPieTxt" x="${s.lx.toFixed(2)}" y="${s.ly.toFixed(2)}" text-anchor="middle" dominant-baseline="middle">${s.n}</text>`).join('')}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="1.6" />
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
            <div class="pickToggleLbl"><span class="pickToggleWord pickWordTech">Technicians</span><span class="pickToggleSlash">/</span><span class="pickToggleWord pickWordSvc">Services</span></div>
            <label class="pickToggle" title="Toggle Technicians / Services">
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
            </div>
            <div>${pickView==='services' ? tbMiniBoxSvc('Top 3 Services ASR', topSvcAsr, 'asr', 'up') : tbMiniBox('Top 3 Technicians ASR', topTechAsr, 'asr', 'up')}</div>
            <div>${pickView==='services' ? tbMiniBoxSvc('Bottom 3 Services ASR', botSvcAsr, 'asr', 'down') : tbMiniBox('Bottom 3 Technicians ASR', botTechAsr, 'asr', 'down')}</div>
          </div>
        </div>

        <div class="diagDivider" style="height:1px;background:rgba(255,255,255,.12);margin:0 12px"></div>

        <!-- SOLD row -->
        <div class="diagBandRow" style="padding:12px">
          <div class="pickRow" style="display:grid;grid-template-columns:170px 1fr 1fr;gap:12px;align-items:stretch">
            <div class="diagLabelCol" style="display:flex;flex-direction:column;align-items:center">
              <div class="pickHdrLabel" style="margin:0;margin-top:-5px;align-self:flex-start;font-size:22px;line-height:1">SOLD</div>
              ${diagPieChartServices('sold')}
            </div>
            <div>${pickView==='services' ? tbMiniBoxSvc('Top 3 Services SOLD', topSvcSold, 'sold', 'up') : tbMiniBox('Top 3 Technicians SOLD', topTechSold, 'sold', 'up')}</div>
            <div>${pickView==='services' ? tbMiniBoxSvc('Bottom 3 Services SOLD', botSvcSold, 'sold', 'down') : tbMiniBox('Bottom 3 Technicians SOLD', botTechSold, 'sold', 'down')}</div>
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
  // Filters
  app.querySelectorAll('select[data-svcdash="1"]').forEach(sel=>{
    const ctl = sel.getAttribute('data-ctl');
    sel.addEventListener('change', ()=>{
      if(ctl==='focus') st.focus = sel.value;
if(ctl==='team') st.team = sel.value;
      if(ctl==='fluids') st.fluids = sel.value;
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
  function closeSvcDiagPopup(){
    const el = document.getElementById('svcDiagPopup');
    if(el) el.remove();
    document.removeEventListener('keydown', onSvcEsc, true);
  }
  function onSvcEsc(e){ if(e.key==='Escape') closeSvcDiagPopup(); }

  function openSvcDiagPopup(ev, mode, band, anchorEl){
    if(ev){ ev.preventDefault(); ev.stopPropagation(); }
    closeSvcDiagPopup();
    const list = (svcBands[mode] && svcBands[mode][band]) ? svcBands[mode][band].slice() : [];
    list.sort((a,b)=> (a.pct||0) - (b.pct||0));
    const title = (mode==='sold') ? 'SOLD' : 'ASR';
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
        <div class="diagPopTitle" style="font-weight:1000;letter-spacing:.4px;display:flex;align-items:center;gap:10px">${title} • ${band.toUpperCase()} Services</div>
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

    const r = (anchorEl && anchorEl.getBoundingClientRect) ? anchorEl.getBoundingClientRect() : {left:20,top:20,right:20};
    const pr = pop.getBoundingClientRect();
    const pad = 10;
    let left = r.right + pad;
    let top = r.top - 6;
    const vw = window.innerWidth, vh = window.innerHeight;
    if(left + pr.width > vw - 8) left = r.left - pr.width - pad;
    if(top + pr.height > vh - 8) top = Math.max(8, vh - pr.height - 8);
    if(top < 8) top = 8;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;

    setTimeout(()=>{
      const onDoc = (e)=>{ if(!pop.contains(e.target)){ document.removeEventListener('mousedown', onDoc, true); closeSvcDiagPopup(); } };
      document.addEventListener('mousedown', onDoc, true);
    }, 0);
    document.addEventListener('keydown', onSvcEsc, true);
  }

  // Pie slice clicks -> popup
  try{
    app.querySelectorAll('.diagPieSlice').forEach(s=>{
      s.addEventListener('click', (e)=>{
        const mode = s.getAttribute('data-mode');
        const band = s.getAttribute('data-band');
        openSvcDiagPopup(e, mode, band, s);
      });
    });
  }catch(e){}

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

}

window.renderServicesHome = renderServicesHome;
