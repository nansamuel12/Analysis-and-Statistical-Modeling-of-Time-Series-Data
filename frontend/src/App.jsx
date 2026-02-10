import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, AreaChart, Area,
  ComposedChart, Bar
} from 'recharts';
import {
  TrendingDown, Activity, Calendar, Info,
  ShieldAlert, BarChart3, Filter, RefreshCcw,
  ArrowUpRight, ArrowDownRight, Maximize2
} from 'lucide-react';
import { format, parseISO, isWithinInterval, subDays, addDays, startOfYear, endOfYear } from 'date-fns';

const API_BASE = 'http://localhost:5000/api';

const App = () => {
  const [prices, setPrices] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [correlations, setCorrelations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '1987-05-20', end: '2022-12-31' });
  const [chartType, setChartType] = useState('price'); // 'price', 'vol'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, eRes, mRes, cRes] = await Promise.all([
          axios.get(`${API_BASE}/prices`),
          axios.get(`${API_BASE}/events`),
          axios.get(`${API_BASE}/metrics`),
          axios.get(`${API_BASE}/correlations`)
        ]);
        setPrices(pRes.data);
        setAllEvents(eRes.data);
        setMetrics(mRes.data);
        setCorrelations(cRes.data);

        // Set initial date range to last 5 years
        if (pRes.data.length > 0) {
          const lastDate = parseISO(pRes.data[pRes.data.length - 1].Date);
          const startDate = subDays(lastDate, 365 * 10); // 10 years
          setDateRange({
            start: format(startDate, 'yyyy-MM-dd'),
            end: format(lastDate, 'yyyy-MM-dd')
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const d = p.Date;
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [prices, dateRange]);

  const filteredEvents = useMemo(() => {
    let evs = allEvents.filter(e => e.date >= dateRange.start && e.date <= dateRange.end);
    if (filterType !== 'all') {
      evs = evs.filter(e => e.type === filterType);
    }
    return evs;
  }, [allEvents, filterType, dateRange]);

  const currentEventStats = useMemo(() => {
    if (!selectedEvent) return null;
    return correlations.find(c => c.title === selectedEvent.title);
  }, [selectedEvent, correlations]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel tooltip-content">
          <p className="metric-label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="metric-value-sm" style={{ color: p.color }}>
              {p.name}: {p.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <RefreshCcw className="spin" size={48} />
        <p>Analyzing Structural Breaks...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-section">
          <div className="logo-badge"><Activity /></div>
          <div>
            <h1>Brent Oil Analysis Dashboard</h1>
            <p className="subtitle">Explorative Analysis of Structural Breaks & Geopolitical Events</p>
          </div>
        </div>

        <div className="controls">
          <div className="control-group">
            <span className="label"><Filter size={14} /> Category</span>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Factors</option>
              <option value="macro">Macroeconomic</option>
              <option value="policy">Policy Change</option>
              <option value="conflict">Regional Conflict</option>
              <option value="sanctions">Economic Sanctions</option>
            </select>
          </div>

          <div className="control-group">
            <span className="label"><Calendar size={14} /> Timeframe</span>
            <div className="date-inputs">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* KPI Row */}
        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="metric-label">Current Market Price</span>
            <Activity size={18} className="text-secondary" />
          </div>
          <div className="kpi-value">${metrics?.latest_price?.toFixed(2)}</div>
          <div className="kpi-footer">
            <span className="text-secondary">Range: ${metrics?.min_price?.toFixed(0)} - ${metrics?.max_price?.toFixed(0)}</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="metric-label">Detected Change Point</span>
            <ShieldAlert size={18} style={{ color: '#ef4444' }} />
          </div>
          <div className="kpi-value" style={{ fontSize: '1.5rem' }}>{metrics?.cp_summary?.cp_median_date || 'N/A'}</div>
          <div className="kpi-footer">
            <span style={{ color: '#ef4444' }}>Confidence: {(metrics?.cp_summary?.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="metric-label">Annualized Volatility</span>
            <BarChart3 size={18} style={{ color: '#8b5cf6' }} />
          </div>
          <div className="kpi-value">{(metrics?.current_volatility * 100).toFixed(1)}%</div>
          <div className="kpi-footer">
            <span className="text-secondary">30-day Rolling Average</span>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-header">
            <span className="metric-label">Mean Returns Shift</span>
            <TrendingDown size={18} style={{ color: (metrics?.cp_summary?.pct_change || 0) < 0 ? '#ef4444' : '#10b981' }} />
          </div>
          <div className="kpi-value" style={{ color: (metrics?.cp_summary?.pct_change || 0) < 0 ? '#ef4444' : '#10b981' }}>
            {(metrics?.cp_summary?.pct_change || 0).toFixed(2)}%
          </div>
          <div className="kpi-footer">
            <span className="text-secondary">Bayesian Posterior Mean</span>
          </div>
        </div>

        {/* Chart Section */}
        <div className="glass-panel chart-section full-width">
          <div className="chart-header">
            <h3>Historical Trends & Correlation Mapping</h3>
            <div className="tabs">
              <button className={chartType === 'price' ? 'active' : ''} onClick={() => setChartType('price')}>Price (USD)</button>
              <button className={chartType === 'vol' ? 'active' : ''} onClick={() => setChartType('vol')}>Volatility</button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'price' ? (
                <AreaChart data={filteredPrices}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="Date"
                    stroke="#94a3b8"
                    minTickGap={50}
                    tickFormatter={(str) => format(parseISO(str), 'MMM yy')}
                  />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Price"
                    stroke="var(--accent)"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />

                  {/* Event Markers */}
                  {filteredEvents.map((ev, idx) => (
                    <ReferenceLine
                      key={idx}
                      x={ev.date}
                      stroke="#fbbf24"
                      strokeOpacity={0.4}
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Highlight Selected Event */}
                  {selectedEvent && (
                    <ReferenceArea
                      x1={format(subDays(parseISO(selectedEvent.date), 15), 'yyyy-MM-dd')}
                      x2={format(addDays(parseISO(selectedEvent.date), 15), 'yyyy-MM-dd')}
                      fill="var(--accent)"
                      fillOpacity={0.15}
                    />
                  )}

                  {/* Change Point */}
                  {metrics?.cp_summary?.cp_median_date &&
                    metrics?.cp_summary.cp_median_date >= dateRange.start &&
                    metrics?.cp_summary.cp_median_date <= dateRange.end && (
                      <ReferenceLine
                        x={metrics.cp_summary.cp_median_date}
                        stroke="#ef4444"
                        strokeWidth={2}
                        label={{ value: 'STRUCTURAL BREAK', fill: '#ef4444', position: 'top', fontSize: 10, fontWeight: 'bold' }}
                      />
                    )}
                </AreaChart>
              ) : (
                <LineChart data={filteredPrices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="Date"
                    stroke="#94a3b8"
                    minTickGap={50}
                    tickFormatter={(str) => format(parseISO(str), 'MMM yy')}
                  />
                  <YAxis domain={[0, 'auto']} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="Volatility"
                    stroke="#8b5cf6"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section: Details & List */}
        <div className="glass-panel event-details">
          <h3><Info size={16} /> Impact Analysis</h3>
          {selectedEvent ? (
            <div className="event-focus">
              <div className="focus-header">
                <h4>{selectedEvent.title}</h4>
                <div className={`badge ${selectedEvent.type}`}>{selectedEvent.type}</div>
              </div>
              <p className="focus-notes">{selectedEvent.notes}</p>

              {currentEventStats && (
                <div className="impact-metrics">
                  <div className="impact-item">
                    <span className="label">Price Reaction</span>
                    <span className={currentEventStats.price_change_pct >= 0 ? 'value-up' : 'value-down'}>
                      {currentEventStats.price_change_pct >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {Math.abs(currentEventStats.price_change_pct)}%
                    </span>
                  </div>
                  <div className="impact-item">
                    <span className="label">Volatility Shift</span>
                    <span className={currentEventStats.vol_change_pct >= 0 ? 'value-up' : 'value-down'}>
                      {currentEventStats.vol_change_pct >= 0 ? '+' : ''}{currentEventStats.vol_change_pct}%
                    </span>
                  </div>
                  <div className="impact-item">
                    <span className="label">Avg Price After</span>
                    <span className="value-neutral">${currentEventStats.avg_price_after}</span>
                  </div>
                </div>
              )}

              <button className="clear-btn" onClick={() => setSelectedEvent(null)}>Close Details</button>
            </div>
          ) : (
            <div className="empty-state">
              <Maximize2 size={32} opacity={0.2} />
              <p>Select an event from the list or markers on the chart to see impact analysis.</p>
            </div>
          )}
        </div>

        <div className="glass-panel event-list">
          <div className="list-header">
            <h3>Correlation Log</h3>
            <span className="count">{filteredEvents.length} items</span>
          </div>
          <div className="list-content">
            {filteredEvents.length > 0 ? filteredEvents.map((ev, idx) => (
              <div
                key={idx}
                className={`event-item ${selectedEvent?.title === ev.title ? 'active' : ''}`}
                onClick={() => setSelectedEvent(ev)}
              >
                <div className="item-main">
                  <span className="item-date">{format(parseISO(ev.date), 'MMM d, yyyy')}</span>
                  <span className="item-title">{ev.title}</span>
                </div>
                <div className="item-meta">
                  <span className={`tag ${ev.type}`}>{ev.type}</span>
                </div>
              </div>
            )) : (
              <p className="no-data">No events in this timeframe/filter.</p>
            )}
          </div>
        </div>

      </main>

      <footer className="footer">
        <p>Built for Brent Oil Price Modeling & Strategy Analysis | Model: Bayesian Change Point (PyMC3)</p>
      </footer>
    </div>
  );
};

export default App;
