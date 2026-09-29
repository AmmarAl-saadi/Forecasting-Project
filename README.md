# Ops Performance Dashboard — Jordan

Single-page dashboard for Jordan Delivery Operations metrics (Orders, UTR, Delivery Time, Riders). Runs entirely in the browser — no build step, no backend, no account required.

## Quick start

Open `index.html` directly in any modern browser. The dashboard loads with embedded data (Ajloun, Irbid, Jerash, Mafraq — Jan 2025 to Sep 2026) immediately.

To load new data, click the upload zone and select your `.xlsx` workbook. All processing is client-side.

## Data formats supported

**Format A — long format (one row per city + month):**

| City City Name | ... Order Month | Orders UTR | ... Successful Orders | ... Delivery Time | ... Total Riders |
|---|---|---|---|---|---|

Columns are auto-matched by keyword (`city`, `month`, `utr`, `successful/order`, `delivery time`, `rider/headcount`). Month cells may be Excel date serials (e.g. `46266`), real dates, or strings like `2026-09`.

**Format B — wide format (one table per metric):** sheets such as **Orders**, **UTR**, **Delivery Time**, each with a `City` header row followed by month columns.

## Tabs

| Tab | What it shows |
|-----|---------------|
| Overview | KPI cards (orders, UTR, DT, recommended riders), supply status, orders by city |
| By City | Full metrics table + UTR/DT bar charts |
| Trends | Month-over-month line charts for all metrics |
| Fail Rate | Net fail rate + breakdown (only shown when the file contains fail-rate data) |
| Rider Plan | Target sliders, status legend, per-city rider plan table |

## Supply status logic

| Status | Condition |
|--------|-----------|
| ✓ Optimal | UTR ≥ target **and** DT ≤ target |
| ⬇ Under Supply | UTR ≥ target **and** DT > target (busy riders, slow deliveries) |
| ⬆ Over Supply | UTR < target **and** DT ≤ target (excess riders, fast deliveries) |
| ◈ Mixed | UTR < target **and** DT > target |

## Rider calculation (Rider Plan tab)

Uses the actual `Total Riders` column from the workbook, per city:

```
Riders for UTR = current riders × (current UTR ÷ target UTR)
Riders for DT  = current riders × (current DT ÷ target DT)
Recommended    = max(Riders for UTR, Riders for DT)   ← binding constraint wins
Additional     = Recommended − current riders
```

- Set **Target UTR** and **Target DT** sliders (or the inputs in the filter bar) and every city recalculates instantly.
- With no month selected, each city snapshots its **latest complete month**.
- **Partial months** (total orders < 30% of the previous month, e.g. an in-progress month) are automatically excluded from totals and trends. Select the month explicitly in the Month filter to inspect it.

## Tech stack

- React 18 (CDN, no build step)
- Tailwind CSS (CDN)
- SheetJS / xlsx (CDN)
- All code inline in `index.html`
- Charting: inline SVG (no charting library)
