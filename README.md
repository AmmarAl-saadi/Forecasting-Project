# Ops Performance Dashboard — Jordan

Single-page dashboard for Jordan Delivery Operations metrics (Orders, UTR, Delivery Time, Fail Rate). Runs entirely in the browser — no build step, no backend, no account required.

## Quick start

Open `index.html` directly in any modern browser. The dashboard loads with embedded data (March–August) immediately.

To load a new month's data, click the upload zone and select your `.xlsx` workbook. The workbook must have sheets named **Orders**, **UTR**, **Delivery Time**, and **Fail Rate**, each with a `City` header row followed by month columns.

## Tabs

| Tab | What it shows |
|-----|---------------|
| Overview | KPI cards, supply status, orders by city |
| By City | Full metrics table + UTR/DT bar charts |
| Trends | Month-over-month line charts for all metrics |
| Fail Rate | Net fail rate + rider-fault breakdown |
| Supply | Target sliders, status logic legend, per-city status table |
| Riders | Active rider inference, riders needed, gap analysis |

## Supply status logic

| Status | Condition |
|--------|-----------|
| ✓ Optimal | UTR ≥ target **and** DT ≤ target |
| ⬇ Under Supply | UTR ≥ target **and** DT > target (busy riders, slow deliveries) |
| ⬆ Over Supply | UTR < target **and** DT ≤ target (excess riders, fast deliveries) |
| ◈ Mixed | UTR < target **and** DT > target |

## Rider calculation

```
Active Riders (inferred) = Monthly Orders ÷ (UTR × Days)
Riders Needed            = Monthly Orders ÷ (Target UTR × Days)
Gap                      = Riders Needed − Active Riders
```

UTR is treated as *average orders completed per active rider per day*. Adjust the **Days in Period** slider on the Riders tab to match your reporting window. When a specific month is selected the slider auto-populates from the calendar days in that month.

## Tech stack

- React 18 (CDN, no build step)
- Tailwind CSS (CDN)
- SheetJS / xlsx (CDN)
- All code inline in `index.html`
