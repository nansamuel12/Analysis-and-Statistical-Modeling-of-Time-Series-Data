# Brent Oil Analysis Backend API

The backend is built with Flask and serves processed Brent oil price data, geopolitical event correlations, and Bayesian change point model results.

## Base URL
`http://localhost:5000`

## Endpoints

### 1. `GET /api/prices`
Returns the historical price data along with calculated rolling volatility.
- **Fields**: `Date`, `Price`, `Returns`, `Volatility`
- **Format**: JSON list of records.

### 2. `GET /api/events`
Returns the list of geopolitical events used for correlation analysis.
- **Fields**: `date`, `title`, `type`, `notes`
- **Types**: `macro`, `policy`, `conflict`, `sanctions`

### 3. `GET /api/change_points`
Returns the results from the Bayesian change point model.
- **Fields**:
  - `cp_median_date`: Most probable date of the structural break.
  - `cp_hdi`: 94% Highest Density Interval (start and end dates).
  - `pct_change`: Percentage change in mean returns after the break.
  - `confidence`: Statistical confidence level.

### 4. `GET /api/metrics`
Aggregated market indicators for quick KPI display.
- **Fields**: `latest_price`, `avg_price`, `max_price`, `min_price`, `current_volatility`, `cp_summary`

### 5. `GET /api/correlations`
Detailed impact analysis for each geopolitical event.
- **Window**: 30 days before vs 30 days after the event.
- **Fields**:
  - `price_change_pct`: Shift in average price levels.
  - `vol_change_pct`: Shift in market volatility.
  - `avg_price_before` / `avg_price_after`: Price levels around the trigger.

## Setup & Running
1. Install dependencies: `pip install flask flask-cors pandas numpy`
2. Run server: `python app.py`
