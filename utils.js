const COLUMN_KEYWORDS = {
  city: ['city', 'market', 'location', 'region'],
  date: ['date', 'month', 'period', 'time', 'year-month', 'yearmonth'],
  orders: ['orders', 'order count', 'num orders', 'number of orders', 'order volume', 'total orders', 'volume'],
  utr: ['utr', 'utilization', 'utilization rate'],
  dt: ['dt', 'delivery time', 'delivery minutes', 'delivery time (min)', 'avg delivery', 'average delivery'],
  cancelled: ['cancelled', 'canceled', 'cancellations', 'logistics cancel', 'logistics cancels', 'cancelled orders', 'cancel'],
  riders: ['riders', 'active riders', 'rider count', 'active rider count', 'riders count', 'headcount'],
};

function detectColumn(header) {
  const h = header.toLowerCase().trim();
  for (const [field, keywords] of Object.entries(COLUMN_KEYWORDS)) {
    for (const kw of keywords) {
      if (h === kw || h.includes(kw)) return field;
    }
  }
  return null;
}

function parseFiles(fileList) {
  return new Promise((resolve, reject) => {
    const allRows = [];
    let filesProcessed = 0;
    if (fileList.length === 0) { resolve([]); return; }

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            if (json.length === 0) return;

            const headers = Object.keys(json[0]);
            const mapping = {};
            headers.forEach((h) => {
              const detected = detectColumn(h);
              if (detected) mapping[h] = detected;
            });

            json.forEach((row) => {
              const parsed = {};
              Object.entries(row).forEach(([key, val]) => {
                const field = mapping[key];
                if (field) parsed[field] = val;
              });
              if (Object.keys(parsed).length > 0) allRows.push({ _raw: parsed, _file: file.name });
            });
          });
        } catch (err) {
          console.error('Parse error:', file.name, err);
        }
        filesProcessed++;
        if (filesProcessed === fileList.length) resolve(allRows);
      };
      reader.onerror = () => { filesProcessed++; if (filesProcessed === fileList.length) resolve(allRows); };
      reader.readAsArrayBuffer(file);
    });
  });
}

function getDetectedMapping(fileList) {
  return new Promise((resolve) => {
    const mappings = [];
    let filesProcessed = 0;
    if (fileList.length === 0) { resolve([]); return; }

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true, sheetRows: 1 });
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const headers = Object.keys(XLSX.utils.sheet_to_json(sheet, { defval: '' })[0] || {});
            const mapping = {};
            headers.forEach((h) => {
              const detected = detectColumn(h);
              mapping[h] = detected || '—';
            });
            mappings.push({ file: file.name, sheet: sheetName, mapping });
          });
        } catch (err) { console.error(err); }
        filesProcessed++;
        if (filesProcessed === fileList.length) resolve(mappings);
      };
      reader.readAsArrayBuffer(file);
    });
  });
}

function normalizeMonth(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return `${val.getFullYear()}-${String(val.getMonth() + 1).padStart(2, '0')}`;
  }
  const s = String(val).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  const m = s.match(/(\d{4})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}`;
  return s;
}

function aggregateData(rows) {
  const normalized = rows.map((r) => {
    const d = r._raw || r;
    return {
      city: String(d.city || '').trim(),
      month: normalizeMonth(d.date || d.month),
      orders: parseFloat(d.orders) || 0,
      utr: parseFloat(d.utr) || 0,
      dt: parseFloat(d.dt) || 0,
      cancelled: parseFloat(d.cancelled) || 0,
      riders: parseFloat(d.riders) || 0,
    };
  });

  const byKey = {};
  normalized.forEach((r) => {
    const key = `${r.city}|||${r.month}`;
    if (!byKey[key]) byKey[key] = { city: r.city, month: r.month, orders: 0, utrSum: 0, utrCount: 0, dtSum: 0, dtCount: 0, cancelled: 0, riders: 0, riderCount: 0 };
    const g = byKey[key];
    g.orders += r.orders;
    g.cancelled += r.cancelled;
    if (r.utr) { g.utrSum += r.utr; g.utrCount++; }
    if (r.dt) { g.dtSum += r.dt; g.dtCount++; }
    if (r.riders) { g.riders += r.riders; g.riderCount++; }
  });

  return Object.values(byKey).map((g) => ({
    city: g.city,
    month: g.month,
    orders: g.orders,
    utr: g.utrCount ? g.utrSum / g.utrCount : 0,
    dt: g.dtCount ? g.dtSum / g.dtCount : 0,
    cancelled: g.cancelled,
    riders: g.riderCount ? g.riders / g.riderCount : 0,
  }));
}

function filterData(data, city, month) {
  return data.filter((r) => {
    if (city && city !== '__all__' && r.city !== city) return false;
    if (month && month !== '__all__' && r.month !== month) return false;
    return true;
  });
}

function computeMetrics(filtered) {
  if (!filtered.length) return { totalOrders: 0, avgUtr: 0, avgDt: 0, totalCancelled: 0, activeRiders: 0 };
  const totalOrders = filtered.reduce((s, r) => s + r.orders, 0);
  const totalCancelled = filtered.reduce((s, r) => s + r.cancelled, 0);
  const utrValues = filtered.filter((r) => r.utr > 0);
  const dtValues = filtered.filter((r) => r.dt > 0);
  const riderValues = filtered.filter((r) => r.riders > 0);
  return {
    totalOrders,
    avgUtr: utrValues.length ? utrValues.reduce((s, r) => s + r.utr, 0) / utrValues.length : 0,
    avgDt: dtValues.length ? dtValues.reduce((s, r) => s + r.dt, 0) / dtValues.length : 0,
    totalCancelled,
    activeRiders: riderValues.length ? riderValues.reduce((s, r) => s + r.riders, 0) / riderValues.length : 0,
  };
}

function aggregateByMonth(filtered) {
  const byMonth = {};
  filtered.forEach((r) => {
    if (!byMonth[r.month]) byMonth[r.month] = { month: r.month, orders: 0, utrSum: 0, utrCount: 0, dtSum: 0, dtCount: 0 };
    const m = byMonth[r.month];
    m.orders += r.orders;
    if (r.utr) { m.utrSum += r.utr; m.utrCount++; }
    if (r.dt) { m.dtSum += r.dt; m.dtCount++; }
  });
  return Object.values(byMonth)
    .map((m) => ({ month: m.month, orders: m.orders, utr: m.utrCount ? m.utrSum / m.utrCount : 0, dt: m.dtCount ? m.dtSum / m.dtCount : 0 }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function aggregateByCityCancelled(filtered) {
  const byCity = {};
  filtered.forEach((r) => {
    if (!byCity[r.city]) byCity[r.city] = { city: r.city, cancelled: 0 };
    byCity[r.city].cancelled += r.cancelled;
  });
  return Object.values(byCity)
    .filter((c) => c.cancelled > 0)
    .sort((a, b) => b.cancelled - a.cancelled);
}

function getUniqueCities(data) { return [...new Set(data.map((r) => r.city).filter(Boolean))].sort(); }
function getUniqueMonths(data) { return [...new Set(data.map((r) => r.month).filter(Boolean))].sort(); }
