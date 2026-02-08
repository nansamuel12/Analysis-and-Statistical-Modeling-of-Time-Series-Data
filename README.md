# Brent Oil Price Change Point Analysis

This project identifies and quantifies structural breaks in historical Brent crude oil prices using Bayesian Change-Point modeling (PyMC). It correlates detected shifts with significant geopolitical and macroeconomic events to provide actionable market context.

## 📂 Project Structure
- `data/`: Raw price data (`brent_daily.csv`) and curated event logs (`events.csv`).
- `notebooks/`: 
  - `01_EDA.ipynb`: Stationary tests, volatility analysis, and price transformations.
  - `02_change_point_pymc.ipynb`: Bayesian modeling, event ranking, and results export.
- `backend/`: Flask API and model results storage.
- `frontend/`: React dashboard (Vite + Recharts) with interactive shift-event mapping.
- `docs/`: Methodological framework and strategic documentation.
- `report/`: Professional summaries and interim findings.

## 📖 Methodology & Strategy
- [Data Analysis Workflow](./docs/WORKFLOW.md): Step-by-step modeling process.
- [Historical Events Summary](./docs/EVENTS_SUMMARY.md): Key price drivers and historical context.
- [Assumptions & Limitations](./docs/ASSUMPTIONS_LIMITATIONS.md): Model constraints and the correlation vs. causality caveat.
- [Stakeholder Communication Plan](./docs/COMMUNICATION_PLAN.md): How results are tailored for investors and policymakers.

---

## 🚀 Setup and Run Instructions

### 1. Model Analysis (Backend & Data)
First, set up the Python environment and run the analysis to generate results.

```bash
# Configuration
pip install -r requirements.txt

# Run Analysis
# Open Jupyter and execute all cells in:
# notebooks/01_EDA.ipynb
# notebooks/02_change_point_pymc.ipynb
```
*Note: Successful execution of the notebooks generates the `backend/results/change_point_summary.json` consumed by the dashboard.*

### 2. Backend API
The Flask server provides the data bridge for the frontend.

```bash
cd backend
python app.py
```
*The API will be available at `http://localhost:5000`.*

### 3. Frontend Dashboard
Start the interactive visualization suite.

```bash
cd frontend
npm install
npm run dev
```
*Access the dashboard at `http://localhost:5173`.*

---

## 🛠️ Tech Stack
- **Analysis**: Python (PyMC, ArviZ, Pandas, Statsmodels)
- **Backend**: Flask, CORS
- **Frontend**: React (Vite), Recharts, Lucide-React
- **Aesthetics**: Custom Glassmorphism CSS System
