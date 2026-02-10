# IT Leadership Executive Overview — Dashboard

## File Structure

```
dashboard/
├── index.html              # HTML structure only (1,980 lines)
├── css/
│   └── styles.css          # All styles (2,460 lines)
└── js/
    ├── sheets-api.js       # Google Sheets OAuth2 + read/write (283 lines)
    ├── navigation.js       # Tab switching, keyboard nav (61 lines)
    ├── kanban.js           # Kanban board, drag-drop, responsibilities data (919 lines)
    ├── heatmap.js          # RACI matrix editing + persistence (190 lines)
    ├── bio-states.js       # Profile state toggle, title data, engagements (218 lines)
    ├── facility-calculator.js  # New facility cost calculator (92 lines)
    ├── budget-planner.js   # Budget data, market data, card-view sliders (926 lines)
    ├── budget-table.js     # Table-view sliders + dynamic budget overview (553 lines)
    └── modals.js           # Configure + Add Line Item modals (223 lines)
```

## How to Use

Open `index.html` in a browser. No build tools needed — all scripts load via standard `<script>` tags.

For Google Sheets integration, you'll need to serve from `localhost` or a domain registered in Google Cloud Console (OAuth2 won't work from `file://`).

## Script Load Order (matters!)

1. **sheets-api.js** — Google auth + sheet read/write primitives
2. **navigation.js** — Tab switching (standalone)
3. **kanban.js** — Responsibilities data + kanban board (uses sheets-api)
4. **heatmap.js** — RACI matrix (uses sheets-api)
5. **bio-states.js** — Profile toggle (uses kanban vars)
6. **facility-calculator.js** — Standalone calculator
7. **budget-planner.js** — Budget data + card view (uses sheets-api, defines shared vars)
8. **budget-table.js** — Table view + budget overview (uses budget-planner vars)
9. **modals.js** — Modal dialogs (uses budget-planner vars)

## Bug Fixes Applied During Split

### Fix 1: Proportional Slider Zone Calculations
**Before:** Zone thresholds used `(marketLow + marketMid) / 2`, creating compressed zones where 80%+ of slider range mapped to only 2-3 tags.

**After:** Zones use proportional percentage across the full range (`marketLow` to `maxRecommended`):
- 0–20% → RISK
- 20–40% → CAUTION  
- 40–65% → OPTIMAL (wider for stability)
- 65–85% → PREMIUM
- 85–100%+ → OVERSPEND

Row risk styling uses 0–10% for severe, 10–20% for critical.

All 10 instances of `lowMidThreshold` replaced across `getZone()`, `getRiskClass()`, `getRiskIndicator()`, `getImpactText()`, `renderTableView()`, `updateTableItem()`, and `updateTableSummary()`.

### Fix 2: Dynamic 2026 IT Budget Tab
The budget overview tab previously showed hard-coded values. Now `renderBudgetOverview()` in `budget-table.js` pulls live data from `subcategoryData` and `proposedSubBudgets` — the same source of truth as the Budget Planner.

### Fix 3: Auto-Render on Tab Switch
`renderBudgetOverview()` fires automatically when navigating to the budget tab, and once on page load after sheets data arrives (800ms delay).
