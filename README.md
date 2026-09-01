# Ops Performance Dashboard

A static, client-side-only dashboard for tracking order volume, rider utilization (UTR), delivery time (DT), and logistics cancellations by city and month.

## Features

- **File upload** — drag-and-drop or click to upload `.xlsx` / `.csv` files (supports multiple files, merged by city + month)
- **Auto column detection** — detects city, date, orders, UTR, DT, cancelled orders, and rider count by keyword matching
- **Headline metrics** — total orders, avg UTR, avg delivery time, logistics cancellations, active riders
- **Charts** — orders by month (bar), UTR & DT trend (dual-line), cancellations by city (horizontal bar)
- **Filters** — city and month filters applied to all metrics and charts
- **Rider planning calculator** — linear estimate that converts UTR/DT targets into rider headcount needs
- **Responsive** — works on desktop and mobile
- **Privacy** — all data stays in your browser; nothing is uploaded to any server

## Running Locally

No build step required. Just open `index.html` in a browser:

```bash
# Option 1 — double-click index.html (works in most browsers)
# Option 2 — serve with any static file server
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000` (or the file directly).

## Data Format

### Orders Report (.xlsx or .csv)

Columns (auto-detected by keyword):

| Column | Keywords detected |
|--------|-------------------|
| City   | city, market, location, region |
| Date/Month | date, month, period, year-month |
| Orders | orders, order count, volume |
| UTR    | utr, utilization |
| DT     | dt, delivery time |
| Cancelled | cancelled, logistics cancel |

### Riders Report (.xlsx or .csv)

| Column | Keywords detected |
|--------|-------------------|
| City   | city, market, location |
| Date/Month | date, month |
| Active Riders | riders, active riders, rider count |

## Tech Stack

- React 18 (via CDN)
- Tailwind CSS (via CDN)
- SheetJS / xlsx (via CDN) for Excel/CSV parsing
- Recharts (via CDN) for charting
- Zero build tools, zero npm dependencies

## License

MIT
