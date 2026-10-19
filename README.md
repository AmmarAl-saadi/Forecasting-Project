# Ops Performance Dashboard — Jordan

Single-page dashboard for Jordan Delivery Operations metrics (Orders, UTR, Delivery Time, Riders). Runs entirely in the browser — no build step, no backend, no account required.

## Quick start

Open `index.html` directly in any modern browser. The dashboard loads with embedded data (Ajloun, Irbid, Jerash, Mafraq — Jan 2025 to Oct 2026; Oct is in progress and auto-flagged as partial) immediately.

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
| Overview | KPI cards (UTR, DT, recommended riders) — plus the year-over-year section: **Completed Orders YoY** card — same-calendar-months totals per year (e.g. Jan–Sep 2026 vs Jan–Sep 2025) with per-month **growth % chips** (Jan +21.0% …; click a chip to compare that month YoY, or pick it in the Month filter and the card zooms to that month) + year-over-year line charts — every metric drawn as two lines per calendar month: **2025 (brown `#411517`) vs 2026 (orange `#FF5900`)** (city breakdown lives in the By City tab) |
| By City | Full metrics table + UTR/DT bar charts |
| Fail Rate | Net fail rate + breakdown (only shown when the file contains fail-rate data) |
| Rider Plan | Target sliders, status legend, per-city rider plan table |
| Hourly | **Hourly rider coverage** — has its own **Upload hourly file** slot (separate from the Data Source zone; monthly dashboard keeps its data; also auto-loads when an hourly file is dropped on Data Source). One sheet per city, rows = hours, columns like Dimension 1 / Orders Completed / DT / UTR. City cards (rider-h/day now → needed, short/over, peak short hours), a tab-wide **city filter** (All cities → drives cards, bars, callout, table, and the downloaded report), 24-hour on-shift vs needed bars, DT-binding hours callout, per-city hourly detail table (For UTR / For DT / Needed / Gap / Status), editable **days in month**, and a **Download report** button that exports the same view as a standalone branded HTML file. **Date range (From/To):** always editable — when the hourly workbook contains dates (a Date column or date values in Dimension 2, 3+ distinct dates) the range drives the aggregation and auto-derives the days divisor; with undated files the range is a label (shown on the tab and report title) and the manual days input stays active. **Recommended shifts:** each city's day split into shifts whose length is adjustable via **Min/Max h** inputs (2–12h, default 4–6h; cuts nudged to low-demand hours; contiguous runs split separately), one headcount per shift = peak need inside it, with Orders / On shift / Needed / Gap / Status; shows the small cities (Jerash, Ajloun, Mafraq) in All-cities view and any single selected city (incl. Irbid); included in the downloaded report. Model: riders_on = orders÷UTR÷days; needUTR = riders×UTR/target; needDT = riders×DT/target; recommended = ceil(mean) |
| Next Month | YoY-anchored forecast of next month's orders & riders needed (MoM × Seasonal equation available as a toggle) |

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
Recommended    = average of the two (rounded up)   ← balances both constraints
Additional     = Recommended − current riders
```

- Averaging (instead of taking the max) tracks your actual hiring plans: against the Irbid Jan–Aug 2026 hiring targets it lands within 54 riders of plan, while `max()` over-recommends ~5×.

- Set **Target UTR** and **Target DT** sliders (or the inputs in the filter bar) and every city recalculates instantly.
- With no month selected, each city snapshots its **latest complete month**.
- **Partial months** (total orders < 30% of the previous month, e.g. an in-progress month) are automatically excluded from totals and trends. Select the month explicitly in the Month filter to inspect it.

## Next-month forecast (Next Month tab)

Two models, switchable from the Forecast Basis card:

**YoY growth (default — backtest winner):**

```
Next Month Orders = Same Month Last Year × median(YoY growth per city)
```

- **Anchor month** — the same calendar month one year before the forecast month (forecast Oct 2026 → Oct 2025 actuals).
- **YoY growth** — per city, the median of that city's year-over-year monthly ratios (robust to spikes; partial months excluded). The auto value shown is the total-level median of the same ratios; typing a value overrides all cities at once.
- Backtested one month ahead over 2026-01…08 with no peeking: **MAPE 9.8%** on totals vs **13.1%** for MoM × Seasonal (Irbid: 9.5% vs 13.0%).
- Below one year of history it falls back to the original equation — the equation header and inputs switch automatically, with a banner explaining why.

**MoM × Seasonal (the original equation):**

```
Next Month Orders = Last Complete Month × MoM Rate × Seasonal Index (per city; MoM basis: last 6 months by default, or all history)
```

- **MoM Rate** — a **MoM basis** toggle chooses the window:
  - **Last 6 months** (default) — per city, the mean of its **last 6** month-over-month ratios. Follows recent momentum, so growing cities (new vendor launches) aren't dragged down by their old baseline. Falls back to all history, then totals, when a city lacks 6 months.
  - **All history** — per city, the mean of all its month-over-month ratios (partial months excluded).
  - Typing a value in the MoM Rate box overrides all cities; reset returns to auto.
- **Seasonal Index** — in *Last 6 months* mode a six-month window contains no copy of the forecast month, so it uses the **market** seasonal index (forecast-month average ÷ average month). *All history* mode uses each city's own index (totals-based default if a city lacks history). Typing a value overrides all cities.
- **Override %** (forecast table) — type a growth % on any city's row to pin **that city only** to exactly that growth vs last month (e.g. `10` → +10%); applies under either model, and the ✕ clears it back to auto. Placeholders in the box show the auto growth it would otherwise use.
- **Forecast month** — the month after the latest data month (e.g. data ends 2026-09 → October 2026), with its real day count.

Riders needed next month scales the Rider Plan formula by forecast growth (this keeps it consistent with how UTR is reported in your file — it does **not** assume UTR = orders ÷ (riders × days)):

```
growth            = forecast orders ÷ last month orders
Riders for UTR    = current riders × (current UTR ÷ target UTR) × growth × (days_last ÷ days_fc)
Riders for DT     = current riders × (current DT  ÷ target DT ) × growth × (days_last ÷ days_fc)
Recommended       = average of the two (rounded up)
```

The *Status if unchanged* column shows where each city lands next month at the current headcount.

## Tech stack

- React 18 (CDN, no build step)
- Tailwind CSS (CDN)
- SheetJS / xlsx (CDN)
- All code inline in `index.html`
- Charting: inline SVG (no charting library)
