import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, ReferenceArea, AreaChart, Area
} from 'recharts';
import { TrendingDown, Activity, Calendar, Info } from 'lucide-react';
import { format, parseISO, isWithinInterval, subDays, addDays } from 'date-fns';

const API_BASE = 'http://localhost:5000/api';

const App = () => {
  const [prices, setPrices] = useState([]);
  const [events, setEvents] = useState([]);
  const [cpSummary, setCpSummary] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, eRes, cRes] = await Promise.all([
          axios.get(`${API_BASE}/prices`),
          axios.get(`${API_BASE}/events`),
          axios.get(`${API_BASE}/change_points`)
        ]);
        setPrices(pRes.data);
        setEvents(eRes.data);
        setCpSummary(cRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  const latestPrice = prices.length > 0 ? prices[prices.length - 1].Price : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '10px' }}>
          <p className="metric-label">{label}</p>
          <p className="metric-value" style={{ fontSize: '1.2rem' }}>${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <header className="header">
        <div>
          <h1>Brent Oil Change Point Analysis</h1>
          <p className="metric-label">Bayesian Structural Break Dashboard</p>
        </div>
        <div className="controls">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Events</option>
            <option value="macro">Macro</option>
            <option value="policy">Policy</option>
            <option value="conflict">Conflict</option>
            <option value="sanctions">Sanctions</option>
          </select>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Metric Cards */}
        <div className="glass-panel metric-card">
          <div className="metric-label"><Activity size={14} /> Latest Price</div>
          <div className="metric-value">${latestPrice.toFixed(2)}</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-label"><Calendar size={14} /> Last Change Point</div>
          <div className="metric-value">{cpSummary?.cp_median_date || 'N/A'}</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-label"><TrendingDown size={14} /> Mean Shift Shift</div>
          <div className="metric-value" style={{ color: (cpSummary?.pct_change || 0) < 0 ? '#ef4444' : '#10b981' }}>
            {(cpSummary?.pct_change || 0).toFixed(2)}%
          </div>
        </div>

        {/* Main Chart */}
        <div className="glass-panel chart-container">
          <h3>Price Distribution & Structural Breaks</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={prices} onClick={(data) => console.log(data)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="Date" 
                stroke="#94a3b8" 
                tickFormatter={(str) => {
                  try { return format(parseISO(str), 'MMM yy'); } catch { return str; }
                }}
              />
              <YAxis domain={['auto', 'auto']} stroke="#94a3b8" />
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="Price" 
                stroke="#38bdf8" 
                dot={false} 
                strokeWidth={2}
              />

              {/* Detected Change Point */}
              {cpSummary?.cp_median_date && (
                <ReferenceLine 
                  x={cpSummary.cp_median_date} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Detected CP', fill: '#ef4444', position: 'top' }} 
                />
              )}
              {cpSummary?.cp_hdi && (
                <ReferenceArea 
                  x1={cpSummary.cp_hdi[0]} 
                  x2={cpSummary.cp_hdi[1]} 
                  fill="#ef4444" 
                  fillOpacity={0.1} 
                />
              )}

              {/* Event Markers */}
              {filteredEvents.map((ev, idx) => (
                <ReferenceLine
                  key={idx}
                  x={ev.date}
                  stroke="#fbbf24"
                  strokeOpacity={0.5}
                  label={{ value: ev.title, fill: '#fbbf24', fontSize: 10, angle: -90, position: 'insideBottomLeft' }}
                />
              ))}

              {/* Highlight window if event clicked */}
              {selectedEvent && (
                <ReferenceArea
                  x1={format(subDays(parseISO(selectedEvent.date), 14), 'yyyy-MM-dd')}
                  x2={format(addDays(parseISO(selectedEvent.date), 14), 'yyyy-MM-dd')}
                  fill="#38bdf8"
                  fillOpacity={0.2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event List/Details */}
        <div className="glass-panel" style={{ gridColumn: 'span 2' }}>
          <h3>Recent Events Correlation</h3>
          <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {filteredEvents.map((ev, idx) => (
              <div 
                key={idx}
                className="glass-panel"
                style={{ 
                  marginBottom: '0.5rem', 
                  padding: '10px', 
                  cursor: 'pointer',
                  border: selectedEvent?.title === ev.title ? '1px solid var(--accent)' : '1px solid transparent'
                }}
                onClick={() => setSelectedEvent(ev)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{ev.title}</strong>
                  <span className="metric-label">{ev.date}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '5px 0' }}>{ev.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CP Summary / Bayesian Stats */}
        <div className="glass-panel">
          <h3><Info size={16} /> Strategy Summary</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#cbd5e1' }}>
            {cpSummary?.confidence ? (
              <>
                Our Bayesian model indicates a <strong>{(cpSummary.confidence * 100).toFixed(1)}% probability</strong> and a 
                structural shift in daily returns occurred around <strong>{cpSummary.cp_median_date}</strong>. 
                The mean return shifted from {cpSummary.mu1_mean?.toFixed(5)} to {cpSummary.mu2_mean?.toFixed(5)}.
              </>
            ) : "Run the model to see statistical shift details."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
