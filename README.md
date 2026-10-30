# WindScope UK — Wind Power Forecasting & Day-Ahead Procurement Analytics Platform

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](#)
[![Live Application](https://img.shields.io/badge/Live_App-Vercel-success.svg)](https://windscope-uk.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend_API-Render-informational.svg)](https://windscope-uk-backend.onrender.com)

**WindScope UK** is an enterprise-grade energy trading analytics platform engineered for UK electricity utility commercial optimization and day-ahead power procurement desks. The system evaluates Great Britain national wind generation forecasts against outturn generation, enforces point-in-time forecast selection across statutory market deadlines to eliminate look-ahead bias, computes rigorous quantitative accuracy metrics (MAE, RMSE, WAPE, and signed Bias), models physical balancing exposure (MWh), and provides an interactive reviewer test harness.

- **Live Application:** [https://windscope-uk.vercel.app/](https://windscope-uk.vercel.app/)
- **Backend API Gateway:** [https://windscope-uk-backend.onrender.com](https://windscope-uk-backend.onrender.com)
- **GitHub Repository:** [https://github.com/mandar1818/WindScope_UK](https://github.com/mandar1818/WindScope_UK)

---

## 1. Project Introduction

Under the British Electricity Trading and Transmission Arrangements (BETTA) and the Balancing and Settlement Code (BSC), wind energy represents a dominant yet intermittent generation source. Day-ahead electricity traders, portfolio managers, and commercial hedging desks must contract physical power to match expected customer demand before power exchange order books close.

WindScope UK provides a real-time, audit-ready trading terminal that ingests official half-hourly metered wind generation (`FUELHH`) and forecast submissions (`WINDFOR`) directly from Elexon BMRS, reconstructing the exact point-in-time information state available to traders at critical decision deadlines.

---

## 2. Problem Statement

Commercial power traders cannot use forecasts published *after* market deadlines without introducing **look-ahead bias**, which artificially inflates perceived forecast accuracy and obscures true procurement risks.

Furthermore, naive metrics like MAPE fail during calm, low-wind periods due to zero-division anomalies. Desks require mathematically robust metrics (WAPE, RMSE, MAE, signed Bias) and need power errors (MW) translated into physical balancing energy variance (MWh) to assess exposure to Balancing Mechanism cash-out penalties.

---

## 3. Business Use Case

UK utilities balance portfolios across bilateral contracts, Day-Ahead Power Exchange auctions (EPEX SPOT and Nord Pool UK), and within-day intraday continuous markets.

### The Balancing Dilemma:
1. **Overforecasting Error (Forecast > Actual Generation):**
   - *Trading Consequence:* The trading desk expects high wind output and therefore under-procures thermal/interconnector generation or sells surplus energy forward.
   - *Physical Delivery:* Less wind materializes, leaving the utility's portfolio physically **SHORT**.
   - *Financial Settlement:* The shortfall must be cashed out in the Balancing Mechanism at the **System Buy Price (SBP)**, which escalates during tight system conditions.
2. **Underforecasting Error (Forecast < Actual Generation):**
   - *Trading Consequence:* The desk expects low wind output and over-procures thermal generation.
   - *Physical Delivery:* More wind is generated than forecasted, leaving the utility physically **LONG**.
   - *Financial Settlement:* The surplus spill power is liquidated at the **System Sell Price (SSP)**, which frequently collapses near zero or turns negative during windy, low-demand periods.

---

## 4. UI Architecture & Screenshots

The platform features a Bloomberg-style dark financial terminal interface with subtle blue/teal accents:

```
+---------------------------------------------------------------------------------------------------+
|  WINDSCOPE UK - FINANCIAL TRADING TERMINAL INTERFACE                                              |
+---------------------------------------------------------------------------------------------------+
| [Sidebar]                       | [TopNav Operational Header]                                     |
| - Logo & Branding               | - Active View Title & Breadcrumbs                               |
| - Overview Dashboard            | - GB Grid Status: Europe/London (GMT) Live Pulse                |
| - Forecast Analysis             | - January 2026 Scope Tag                                        |
| - Accuracy Analysis             | - Elexon BMRS Live / Demo Status Pill                           |
| - Procurement Exposure          | - Last Checked UTC Timestamp & Quick Refresh                    |
| - Data Explorer                 +-----------------------------------------------------------------+
| - Interactive Testing Lab [NEW] | [Active View Container]                                         |
| - Methodology & Reference       | - Reviewer Quick Actions (Start Testing / Start Exploring)      |
| - System Telemetry Modal        | - Executive Control Ribbon (Date & Decision Cutoff Selectors)   |
| - Collapse/Expand Toggle        | - 5 Primary KPI Cards (MAE, RMSE, WAPE, Bias, Valid Obs)         |
|                                 | - Composed Time-Series Profile (FUELHH Actuals vs WINDFOR)      |
|                                 | - Interval Error Bars (Short Risk vs Long Risk)                 |
|                                 | - Procurement Exposure MWh & Cumulative Trajectory              |
+---------------------------------+-----------------------------------------------------------------+
```

---

## 5. Key Features

- **Executive Overview Dashboard:** High-density command center displaying 5 primary KPI cards (MAE, RMSE, WAPE, Forecast Bias, and Valid Observations) with tabular typography, status pills, and directional indicators.
- **Point-in-Time Cutoff Engine:** Automatically enforces market deadlines, discarding future-published forecasts to guarantee 0% look-ahead contamination.
- **Forecast Evolution Waterfall:** 48-period interactive scrubber that plots historical weather forecast submissions converging toward gate closure against final outturn.
- **Dedicated Procurement Exposure Analytics:** Converts MW deviations into half-hourly MWh energy variance ($MW \times 0.5\,\text{h}$) and visualizes cumulative daily imbalance buildup.
- **Searchable Data Explorer:** Granular table with period search, status filtering (`VALID`, `MISSING_FORECAST`), multi-column sorting, pagination, and one-click CSV export.
- **Interactive Reviewer Testing Lab:** Built-in automated test harness enabling reviewers to independently execute 6 live validation suites against real backend data.
- **Data Integrity & Zero Mock Substitution:** Directly connected to live Elexon BMRS streaming APIs with transparent demonstration mode disclosures if external endpoints disconnect.

---

## 6. Technology Stack

### Backend:
- **Python 3.12.10:** High-performance runtime.
- **FastAPI 0.110.1:** Asynchronous ASGI framework with OpenAPI/Swagger documentation.
- **Uvicorn 0.29.0:** Production ASGI server.
- **Pandas 2.2.2 & NumPy 1.26.4:** Vectorized matrix transformations and metric calculations.
- **HTTPX 0.27.0:** Asynchronous HTTP client with connection pooling and retry backoff.
- **Pydantic 2.7.0 & Pydantic-Settings 2.2.1:** Strict data validation and environment configuration.
- **Pytest 8.1.1 & Pytest-Asyncio 0.23.6:** Automated test runner.

### Frontend:
- **React 18.3.1 & TypeScript 5.4.5:** Robust component architecture with strict typing.
- **Vite 5.3.1:** Fast development server and Rollup production builder.
- **Tailwind CSS 3.4.4:** Dark financial terminal theme with custom micro-borders and shadows.
- **Recharts 2.12.7:** High-performance charting (ComposedChart, AreaChart, BarChart, LineChart).
- **Lucide React 0.395.0:** Clean domain icons.
- **Vitest 1.6.1 & Testing Library:** Automated frontend unit and component testing.

---

## 7. Architecture & System Flow

```
                                  +-----------------------------------------+
                                  |         Elexon BMRS Insights API        |
                                  |  - FUELHH (Half-hourly Outturn)         |
                                  |  - WINDFOR (Wind Generation Forecast)   |
                                  +--------------------+--------------------+
                                                       |
                                                       | HTTP / JSON Streams
                                                       v
+-----------------------------+           +------------+--------------------+
|       React Frontend        |           |       FastAPI Backend           |
| (Vite + TypeScript + TW)    |  REST     | (Python 3.12 + Pandas + HTTPX)  |
| - Overview Dashboard        | <=======> | - ElexonClient (Retries, Cache) |
| - Forecast Waterfall        |  /api/v1  | - ForecastSelector (Cutoffs)    |
| - Accuracy Analysis         |           | - MetricsCalculator (WAPE/MAE)  |
| - Procurement Exposure      |           | - Local Response Disk Cache     |
| - Testing Lab (QA Suite)    |           | - Pydantic Request/Response DTO |
| - Data Explorer & CSV       |           +---------------------------------+
+-----------------------------+
```

---

## 8. Elexon Data Sources & Retrieval Methodology

The pilot integrates directly with the official Elexon BMRS Insights Solution streaming endpoints:

### 1. Actual Metered Generation (`FUELHH`)
- **API Endpoint:** `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream`
- **Query Parameters:** `settlementDateFrom={date}&settlementDateTo={date}&fuelType=WIND`
- **Delivery Period:** Identified by `startTime` (UTC ISO 8601).
- **Outturn Generation:** Ingested from `generation` (MW).
- **Resolution:** 30 minutes (Settlement Periods 1 to 48).

### 2. Wind Generation Forecast (`WINDFOR`)
- **API Endpoint:** `https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream`
- **Query Parameters:** `publishDateTimeFrom={UTC}&publishDateTimeTo={UTC}`
- **Delivery Period:** Identified by `startTime` (UTC ISO 8601).
- **Publication Timestamp:** Ingested from `publishTime` (UTC ISO 8601).
- **Forecast Generation:** Ingested from `generation` (MW).

### Evaluation Window:
- In strict adherence to assignment requirements, the platform evaluates delivery periods in **January 2026 (2026-01-01 to 2026-01-31)**.
- Queries for dates outside this window are systematically rejected with clear HTTP 400 responses.

---

## 9. Forecast Selection Methodology & Decision Cutoffs

To eliminate look-ahead bias and replicate what traders knew at order placement:

### Point-in-Time Selection Algorithm (per 30-min period $T$):
1. **Identify Target Horizon:** Determine delivery period $T$ (`startTime`).
2. **Compute Decision Cutoff:** Calculate exact market deadline threshold $\text{Cutoff}(T)$ in UTC.
3. **Exclude Ineligible Submissions:** Discard any forecast where $\text{publishTime} > \text{Cutoff}(T)$.
4. **Select Latest Eligible:** From eligible records ($\text{publishTime} \le \text{Cutoff}(T)$), select the record with the maximum `publishTime`.
5. **Pair with Outturn:** Compare selected forecast against corresponding `FUELHH` generation.

### Configurable Market Cutoffs:
- **`day_ahead_1100` (Default / Primary Benchmark):** 11:00 London local time on Day D-1. Deadline for primary GB Day-Ahead Power Auction on EPEX SPOT and Nord Pool.
- **`day_ahead_1200`:** 12:00 London local time on Day D-1 (Midday European coupled market).
- **`day_ahead_1700`:** 17:00 London local time on Day D-1 (Initial Physical Notification deadline to NESO).
- **`gate_closure_1h`:** Exactly 1 hour prior to settlement period start ($\text{startTime} - 60\,\text{min}$). Statutory BSC Gate Closure.
- **`gate_closure_2h`:** 2 hours prior to settlement period start ($\text{startTime} - 120\,\text{min}$).

---

## 10. Quantitative Metric Formulas

All metrics are evaluated strictly on complete matched forecast-actual pairs:

### 1. Forecast Error for interval $i$:
$$\text{Error}_i = \text{Forecast}_i - \text{Actual}_i \quad (\text{MW})$$

### 2. Mean Absolute Error (MAE):
$$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |\text{Forecast}_i - \text{Actual}_i| \quad (\text{MW})$$

### 3. Root Mean Squared Error (RMSE):
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (\text{Forecast}_i - \text{Actual}_i)^2} \quad (\text{MW})$$

### 4. Weighted Absolute Percentage Error (WAPE):
$$\text{WAPE} = \frac{\sum_{i=1}^N |\text{Forecast}_i - \text{Actual}_i|}{\sum_{i=1}^N |\text{Actual}_i|} \times 100 \quad (\%)$$
*Zero-Denominator Guard:* If total actual generation is zero, WAPE returns 0.0% (if error is 0) or `None` (if error > 0). The system never returns `NaN` or `Infinity`.

### 5. Forecast Bias & Sign Convention:
$$\text{Bias} = \frac{1}{N} \sum_{i=1}^N (\text{Forecast}_i - \text{Actual}_i) \quad (\text{MW})$$
- **Positive Bias (+MW):** **Overforecasting.** Expected wind exceeds outturn. Utility faces physical SHORT position.
- **Negative Bias (-MW):** **Underforecasting.** Actual wind exceeds forecast. Utility faces physical LONG position.

---

## 11. Procurement Exposure Methodology

For half-hourly settlement periods ($0.5\,\text{hours}$):

$$\text{Interval Energy Error (MWh)} = \text{Power Error (MW)} \times 0.5\,\text{h}$$

- **Total Overforecast Energy (MWh):** Sum of energy deficits across periods where $\text{Forecast} > \text{Actual}$. Represents physical power shortfall settled at the System Buy Price (SBP).
- **Total Underforecast Energy (MWh):** Sum of energy surpluses across periods where $\text{Forecast} < \text{Actual}$. Represents spill power liquidated at the System Sell Price (SSP).
- **Net Energy Variance (MWh):** Total net physical imbalance volume across the delivery day.

---

## 12. API Reference

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check & live Elexon connectivity probe | None |
| `GET` | `/api/v1/overview` | Full overview metrics, generation series, and exposure | `settlement_date`, `cutoff`, `demo` |
| `GET` | `/api/v1/generation` | 48 half-hour matched observations and errors | `settlement_date`, `cutoff`, `demo` |
| `GET` | `/api/v1/accuracy` | Multi-day aggregate accuracy & daily breakdown | `start_date`, `end_date`, `cutoff`, `demo` |
| `GET` | `/api/v1/forecast-history`| Multi-horizon forecast revisions (waterfall) | `delivery_time`, `cutoff`, `demo` |
| `GET` | `/api/v1/data-status` | Elexon stream status, cache stats, cutoff list | None |

Interactive OpenAPI/Swagger documentation is available at: `/docs`

---

## 13. Local Installation Instructions

### Prerequisites:
- Python 3.12+
- Node.js 20+ and npm 10+
- Git

### 1. Clone the repository:
```bash
git clone https://github.com/mandar1818/WindScope_UK.git
cd WindScope_UK
```

### 2. Backend Setup:
```bash
cd backend
python -m venv .venv

# Activate virtual environment:
# Linux/macOS:
source .venv/bin/activate
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API runs at: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)

### 3. Frontend Setup:
Open a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Application runs at: `http://localhost:5173`

---

## 14. Windows PowerShell Instructions

Run the following commands directly from the repository root:

```powershell
# Set Python path and run backend test suite
$env:PYTHONPATH='backend'
& backend\.venv\Scripts\pytest.exe backend\tests -v

# Run frontend test suite
cd frontend
npm run test

# Run frontend production build
npm run build
```

---

## 15. Docker Instructions

The repository includes multi-stage container definitions and a Compose orchestrator:

```bash
# Build and run containers in detached mode
docker-compose up -d --build

# View container logs
docker-compose logs -f

# Stop containers
docker-compose down
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 16. Automated Testing Instructions

### Run Backend Tests (Pytest):
```bash
cd backend
pytest tests -v
```
All 26 automated backend tests verify cutoff calculations, latest-eligible selection, MAE/RMSE/WAPE formulas, zero-denominator safety, Bias sign conventions, and January 2026 validation.

### Run Frontend Tests (Vitest):
```bash
cd frontend
npm run test
```
All 5 test suites (7 tests) verify component rendering, cutoff selection, error alerts, KPI card formatting, procurement exposure calculations, and Testing Lab scenarios.

---

## 17. Deployment Instructions

### Frontend (Vercel):
The repository contains both root `vercel.json` and `frontend/vercel.json` configured for Vite SPA routing with automatic API rewrites.
- Deployed at: [https://windscope-uk.vercel.app/](https://windscope-uk.vercel.app/)
- Environment Variable: `VITE_API_BASE_URL` = `https://windscope-uk-backend.onrender.com`

### Backend (Render):
The repository includes `render.yaml` for zero-touch Render Blueprint deployments.
- Deployed at: [https://windscope-uk-backend.onrender.com](https://windscope-uk-backend.onrender.com)
- Free-tier note: Web services spin down after 15 minutes of inactivity; initial cold start takes ~30–50s.

---

## 18. Environment Variable Configuration

Create `.env` in `backend/` or configure in deployment platform:

```ini
# Elexon BMRS API
ELEXON_BASE_URL=https://data.elexon.co.uk/bmrs/api/v1
ELEXON_TIMEOUT_SECONDS=30.0
ELEXON_MAX_RETRIES=3

# Scope & Cutoffs
TARGET_YEAR=2026
TARGET_MONTH=1
DEFAULT_DATE=2026-01-15
DEFAULT_CUTOFF=day_ahead_1100

# Cache & Operational Mode
CACHE_DIR=.cache
CACHE_TTL_SECONDS=3600
ALLOW_DEMO_FALLBACK=true
CORS_ORIGINS=https://windscope-uk.vercel.app,http://localhost:5173,http://localhost:3000,*
```

---

## 19. Known Scope Limitations

1. **January 2026 Boundary:** Scoped strictly to January 2026 delivery periods per assignment guidelines.
2. **Transmission-Connected Metering:** Datasets `FUELHH` and `WINDFOR` cover transmission-connected wind farms in Great Britain; embedded distribution-connected wind is not metered in these feeds.
3. **Illustrative Exposure:** Energy variance figures (MWh) model aggregate wind volume deviations across GB and do not represent a utility's final net customer portfolio imbalance.

---

## 20. AI Tool Usage Disclosure

In compliance with assignment requirements:  
AI tools, including **Google Antigravity** and **ChatGPT**, assisted with architectural design, software development, documentation, and test suite implementation of this application.

---

## 21. How an Independent Reviewer Can Test the Application

WindScope UK includes a dedicated **Interactive Testing Lab** accessible directly from the sidebar or overview header:

1. Open the application: [https://windscope-uk.vercel.app/](https://windscope-uk.vercel.app/)
2. Click **Start Testing (QA Lab)** or select **Interactive Testing Lab** in the sidebar.
3. Click **Run All 6 Tests** to execute the live verification suite:
   - **TEST 1 (Accuracy):** Verifies that MAE, RMSE, and WAPE are computed over complete pairs and satisfy mathematical laws ($\text{RMSE} \ge \text{MAE}$).
   - **TEST 2 (Overforecast):** Scans for positive deviations, verifies $\text{MWh} = \text{MW} \times 0.5$, and highlights peak short risk.
   - **TEST 3 (Underforecast):** Scans for negative deviations, verifies surplus energy conversion, and highlights peak long risk.
   - **TEST 4 (Cutoff Validation):** Audits historical submissions to prove that 0% of selected forecasts were published after the decision cutoff.
   - **TEST 5 (Missing Data):** Audits completeness accounting ($\text{Total} = \text{Valid} + \text{Excluded}$) and confirms $0.0\,\text{MW}$ is treated as valid generation.
   - **TEST 6 (Data Explorer):** Verifies search, column sorting, pagination, and validates a sample CSV export blob.
4. Expand any test card to inspect real-time calculation telemetry, formula audits, and live outcomes.
