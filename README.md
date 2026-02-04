# Technician Dashboard (split build v2)

This repo separates the single-file build into independent files per page:

- Main dashboard: `js/pages/renderMain.js`
- Tech details: `js/pages/renderTech.js`
- Services pages: `js/pages/renderGroupPage.js`
- Goals: `js/pages/renderGoalsPage.js`

Shared/core:
- Everything shared (data, helpers, menu, gauges, etc): `js/core/base.js`
- Styles: `css/app.css`

## Run locally
```bash
python -m http.server 8000
```
