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
| Next Month | MoM × Seasonal Index forecast of orders, riders needed next month |

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

## Next-month forecast (Next Month tab)

```
Next Month Orders = Last Complete Month × MoM Rate × Seasonal Index
```

- **MoM Rate** — mean of the historical month-over-month ratios (aggregate orders, partial months excluded). Editable; reset returns to auto.
- **Seasonal Index** — historical average of the forecast calendar month ÷ overall monthly average. Editable.
- **Forecast month** — the month after the latest data month (e.g. data ends 2026-09 → October 2026), with its real day count.

Riders needed next month scales the Rider Plan formula by forecast growth (this keeps it consistent with how UTR is reported in your file — it does **not** assume UTR = orders ÷ (riders × days)):

```
growth            = MoM Rate × Seasonal Index
Riders for UTR    = current riders × (current UTR ÷ target UTR) × growth × (days_last ÷ days_fc)
Riders for DT     = current riders × (current DT  ÷ target DT ) × growth × (days_last ÷ days_fc)
Recommended       = max(Riders for UTR, Riders for DT)
```

The *Status if unchanged* column shows where each city lands next month at the current headcount.

## Tech stack

- React 18 (CDN, no build step)
- Tailwind CSS (CDN)
- SheetJS / xlsx (CDN)
- All code inline in `index.html`
- Charting: inline SVG (no charting library)
