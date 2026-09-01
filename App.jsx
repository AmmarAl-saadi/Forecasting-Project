const { useState, useEffect, useMemo, useCallback, useRef } = React;
const {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart, Cell
} = Recharts;

const COLORS = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4'];

/* ── File Upload ─────────────────────────────────────────── */
function FileUpload({ onFilesParsed, detectedMapping, onMappingChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef(null);

  const handle = useCallback(async (fileList) => {
    if (!fileList.length) return;
    setFiles(Array.from(fileList).map(f => f.name));
    const rows = await parseFiles(fileList);
    const mapping = await getDetectedMapping(fileList);
    onMappingChange(mapping);
    onFilesParsed(rows);
  }, [onFilesParsed, onMappingChange]);

  const onDrop = (e) => { e.preventDefault(); setDragActive(false); handle(e.dataTransfer.files); };
  const onDrag = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);

  return (
    <div
      className={`drop-zone ${dragActive ? 'active' : ''}`}
      onDrop={onDrop}
      onDragOver={onDrag}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handle(e.target.files)}
      />
      <svg className="mx-auto h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p className="text-sm text-gray-600 font-medium">Drop Excel/CSV files here or click to browse</p>
      <p className="text-xs text-gray-400 mt-1">Supports multiple files — will be merged by city + month</p>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1 justify-center">
          {files.map((f, i) => <span key={i} className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full">{f}</span>)}
        </div>
      )}
    </div>
  );
}

/* ── Mapping Override ────────────────────────────────────── */
function MappingPanel({ mapping, onMappingChange }) {
  if (!mapping || !mapping.length) return null;
  const fields = ['—', 'city', 'date', 'orders', 'utr', 'dt', 'cancelled', 'riders'];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Detected Column Mapping</h3>
      {mapping.map((m, idx) => (
        <div key={idx} className="mb-2">
          <p className="text-xs text-gray-500 mb-1">{m.file} — {m.sheet}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(m.mapping).map(([col, field]) => (
              <div key={col} className="flex flex-col">
                <span className="text-xs text-gray-400 truncate" title={col}>{col}</span>
                <select
                  className="text-xs border rounded px-1 py-0.5"
                  value={field}
                  onChange={() => {}}
                  disabled
                >
                  {fields.map((f) => <option key={f} value={f}>{f === '—' ? 'ignored' : f}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-2">Auto-detected by keyword matching. Re-upload with renamed columns if mapping is incorrect.</p>
    </div>
  );
}

/* ── Metric Cards ────────────────────────────────────────── */
function MetricCards({ metrics }) {
  const cards = [
    { label: 'Total Orders', value: metrics.totalOrders.toLocaleString(), color: 'text-brand-600' },
    { label: 'Avg UTR', value: `${metrics.avgUtr.toFixed(1)}%`, color: 'text-emerald-600' },
    { label: 'Avg Delivery Time', value: `${metrics.avgDt.toFixed(1)} min`, color: 'text-amber-600' },
    { label: 'Logistics Cancellations', value: metrics.totalCancelled.toLocaleString(), color: 'text-rose-600' },
    { label: 'Active Riders', value: Math.round(metrics.activeRiders).toLocaleString(), color: 'text-blue-600' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="metric-card">
          <span className="metric-label">{c.label}</span>
          <span className={`metric-value ${c.color}`}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Charts ──────────────────────────────────────────────── */
function OrdersBarChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="section-title">Orders by Month</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendLineChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="section-title">UTR & Delivery Time Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="utr" tick={{ fontSize: 12 }} domain={[0, 100]} />
          <YAxis yAxisId="dt" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="utr" type="monotone" dataKey="utr" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} name="UTR %" />
          <Line yAxisId="dt" type="monotone" dataKey="dt" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} name="Delivery Time (min)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function CancelChart({ data }) {
  return (
    <div className="chart-card">
      <h3 className="section-title">Logistics Cancellations by City</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="city" tick={{ fontSize: 12 }} width={80} />
          <Tooltip />
          <Bar dataKey="cancelled" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Filters ─────────────────────────────────────────────── */
function Filters({ cities, months, city, month, onCityChange, onMonthChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">City</label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
        >
          <option value="__all__">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Month</label>
        <select
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          <option value="__all__">All Months</option>
          {months.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ── Rider Calculator ────────────────────────────────────── */
function RiderCalculator({ metrics }) {
  const [currentUtr, setCurrentUtr] = useState('');
  const [targetUtr, setTargetUtr] = useState('');
  const [currentDt, setCurrentDt] = useState('');
  const [targetDt, setTargetDt] = useState('');
  const [currentRiders, setCurrentRiders] = useState('');

  useEffect(() => {
    if (metrics.avgUtr && !currentUtr) setCurrentUtr(metrics.avgUtr.toFixed(1));
    if (metrics.avgDt && !currentDt) setCurrentDt(metrics.avgDt.toFixed(1));
    if (metrics.activeRiders && !currentRiders) setCurrentRiders(Math.round(metrics.activeRiders));
  }, [metrics]);

  const cu = parseFloat(currentUtr) || 0;
  const tu = parseFloat(targetUtr) || 0;
  const cr = parseFloat(currentRiders) || 0;

  const ridersNeeded = tu > 0 && cu > 0 ? cr * (cu / tu) : 0;
  const additionalRiders = ridersNeeded - cr;
  const expectedDt = cu > 0 && tu > 0 ? (parseFloat(currentDt) || 0) * (tu / cu) : 0;
  const showResults = tu > 0 && cu > 0 && cr > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="section-title">Rider Planning Calculator</h3>
      <p className="text-xs text-gray-400 mb-4">Linear estimate — not a guarantee. Adjust inputs to explore scenarios.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Current UTR (%)', value: currentUtr, onChange: setCurrentUtr },
          { label: 'Target UTR (%)', value: targetUtr, onChange: setTargetUtr },
          { label: 'Current DT (min)', value: currentDt, onChange: setCurrentDt },
          { label: 'Target DT (min)', value: targetDt, onChange: setTargetDt, disabled: true, hint: 'auto-calculated' },
          { label: 'Current Riders', value: currentRiders, onChange: setCurrentRiders },
        ].map(({ label, value, onChange, disabled, hint }) => (
          <div key={label} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">{label}</label>
            <input
              type="number"
              className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder={hint || ''}
            />
          </div>
        ))}
      </div>
      {showResults && (
        <div className="grid grid-cols-3 gap-3">
          <div className="result-card">
            <span className="value">{Math.ceil(ridersNeeded)}</span>
            <span className="label">Riders Needed</span>
          </div>
          <div className="result-card">
            <span className={`value ${additionalRiders > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {additionalRiders > 0 ? '+' : ''}{Math.ceil(additionalRiders)}
            </span>
            <span className="label">Additional Riders</span>
          </div>
          <div className="result-card">
            <span className="value">{expectedDt.toFixed(1)}</span>
            <span className="label">Expected DT (min)</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main App ────────────────────────────────────────────── */
function App() {
  const [rawRows, setRawRows] = useState([]);
  const [detectedMapping, setDetectedMapping] = useState([]);
  const [city, setCity] = useState('__all__');
  const [month, setMonth] = useState('__all__');

  const aggregated = useMemo(() => aggregateData(rawRows), [rawRows]);
  const cities = useMemo(() => getUniqueCities(aggregated), [aggregated]);
  const months = useMemo(() => getUniqueMonths(aggregated), [aggregated]);

  const filtered = useMemo(() => filterData(aggregated, city, month), [aggregated, city, month]);
  const metrics = useMemo(() => computeMetrics(filtered), [filtered]);
  const byMonth = useMemo(() => aggregateByMonth(filtered), [filtered]);
  const byCityCancelled = useMemo(() => aggregateByCityCancelled(filtered), [filtered]);

  useEffect(() => { setCity('__all__'); setMonth('__all__'); }, [rawRows]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Ops Performance Dashboard</h1>
          <span className="text-xs text-gray-400">v1.0 — client-side only</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Upload */}
        <FileUpload
          onFilesParsed={setRawRows}
          detectedMapping={detectedMapping}
          onMappingChange={setDetectedMapping}
        />

        <MappingPanel mapping={detectedMapping} />

        {rawRows.length > 0 && (
          <>
            {/* Filters */}
            <Filters
              cities={cities}
              months={months}
              city={city}
              month={month}
              onCityChange={setCity}
              onMonthChange={setMonth}
            />

            {/* Metrics */}
            <MetricCards metrics={metrics} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OrdersBarChart data={byMonth} />
              <TrendLineChart data={byMonth} />
            </div>
            <CancelChart data={byCityCancelled} />

            {/* Calculator */}
            <RiderCalculator metrics={metrics} />

            {/* v2 Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 border-dashed">
              <h3 className="section-title text-gray-400">Looker / BI Integration (v2)</h3>
              <p className="text-sm text-gray-400">
                This section is reserved for a future direct connection to Looker or another BI data source.
                Configuration options will be added once the data-source details are available.
              </p>
              <pre className="mt-2 text-xs bg-gray-50 rounded p-3 text-gray-400 overflow-x-auto">
{`// v2 config placeholder
const BI_CONFIG = {
  provider: null,    // e.g. "looker", "metabase"
  endpoint: null,    // API base URL
  apiKey: null,      // service account key
  dataset: null,     // default dataset/table
};`}
              </pre>
            </div>
          </>
        )}

        {rawRows.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <svg className="mx-auto h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No data loaded</p>
            <p className="text-sm mt-1">Upload an Excel or CSV file to get started</p>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200 bg-white mt-8">
        Ops Performance Dashboard — all data stays in your browser session only
      </footer>
    </div>
  );
}
