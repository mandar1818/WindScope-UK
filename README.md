# WindScope UK — Wind Power Forecasting & Day-Ahead Procurement Analytics

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](#)

A production-grade trading analytics pilot engineered for UK electricity utility trading and commercial optimization desks. **WindScope UK** evaluates national wind generation forecasts against outturn generation across Great Britain, enforces rigorous point-in-time forecast selection to eliminate look-ahead bias, computes standard industry accuracy metrics (MAE, RMSE, WAPE, signed Bias), and provides decision support for day-ahead power procurement and Balancing Mechanism exposure.

---

## 1. Product Overview

In the Great Britain electricity market (BETTA / BSC), wind power represents a dominant yet intermittent generation source. Day-ahead electricity traders and procurement managers must contract power to balance expected customer demand against renewable generation before power exchange order books close.

**WindScope UK** provides an end-to-end analytical platform that:
- Ingests official half-hourly metered wind outturn and historical forecast submissions directly from the Elexon BMRS Insights Solution API.
- Implements point-in-time forecast selection to reconstruct the exact forecast information state available to traders at critical market decision deadlines.
- Computes mathematically rigorous error metrics (MAE, RMSE, WAPE, and signed Bias) over configurable evaluation horizons.
- Visualizes forecast evolution waterfalls across multiple submission horizons approaching delivery.
- Quantifies physical balancing exposure (imbalance energy variance in MWh) and explains the operational and financial consequences of wind overforecasting vs. underforecasting.

---

## 2. Business Problem & Market Context

UK electricity utilities participate in bilateral forward contracts, Day-Ahead Power Exchange auctions (EPEX SPOT and Nord Pool UK), and within-day intraday continuous trading.

### The Balancing Dilemma:
1. **Overforecasting Error (Forecast > Actual Generation):**
   - *Trading Impact:* The trading desk expects substantial wind production and therefore under-procures thermal/interconnector power or sells surplus energy forward.
   - *Delivery Impact:* The wind fails to materialize, leaving the utility's portfolio physically **SHORT**.
   - *Financial Settlement:* The deficit must be settled in the Balancing Mechanism at the **System Buy Price (SBP)**, which escalates during tight system conditions.
2. **Underforecasting Error (Forecast < Actual Generation):**
   - *Trading Impact:* The utility expects low wind production and procures expensive alternative power or runs thermal assets to cover demand.
   - *Delivery Impact:* More wind is generated than forecasted, leaving the utility physically **LONG**.
   - *Financial Settlement:* The surplus spill power is settled at the **System Sell Price (SSP)**, which can drop to zero or negative prices during windy low-load periods.

WindScope UK arms trading teams with historical evaluation data to quantify forecast uncertainty and calibrate day-ahead procurement hedges.

---

## 3. Key Features

- **Point-in-Time Forecast Selection Engine:** Dynamically pairs each 30-minute delivery period with the latest forecast published strictly on or before a chosen market deadline.
- **Configurable Decision Cutoffs:** Supports Day-Ahead 11:00 London Time (EPEX/Nord Pool auction deadline), Day-Ahead 12:00 (midday cutoff), Day-Ahead 17:00 (physical notification freeze), and Intraday Gate Closure (1h and 2h ahead).
- **Forecast Evolution Waterfall:** For any half-hour period, inspects every historical forecast revision submitted by weather models, comparing lead times against final actual outturn.
- **Robust Quantitative Metrics:** Evaluates MAE, RMSE, WAPE (with zero-denominator protection), and Bias across individual days or the entire evaluation window.
- **Procurement Exposure Indicators:** Translates MW interval errors into net imbalance energy (MWh) and categorizes dominant portfolio balancing exposure.
- **Data Explorer & CSV Export:** Tabular view of all delivery intervals with search, status filtering (Valid, Missing Forecast, Missing Actual), and one-click CSV export.
- **Transparent Source Auditability:** Displays publication timestamps, cutoff thresholds, Elexon connectivity status, and explicit demonstration mode notices if external services are unreachable.

---

## 4. Architecture & System Design

The system employs a decoupled client-server architecture with containerized deployment:

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
| - Accuracy Breakdown        |           | - MetricsCalculator (WAPE/MAE)  |
| - Data Explorer & CSV       |           | - Local Response Disk Cache     |
+-----------------------------+           +---------------------------------+
```

---

## 5. Technology Stack

### Backend:
- **Python 3.12.10:** Modern high-performance runtime.
- **FastAPI 0.110.1:** Asynchronous API framework with automatic OpenAPI documentation.
- **Uvicorn 0.29.0:** ASGI production server.
- **Pandas 2.2.2 & NumPy 1.26.4:** Vectorized data manipulation, matrix operations, and metric calculations.
- **HTTPX 0.27.0:** Async HTTP client with connection pooling and retry capabilities.
- **Pydantic 2.7.0 & Pydantic-Settings 2.2.1:** Strict data validation and environment configuration.
- **Pytest 8.1.1 & Pytest-Asyncio 0.23.6:** Automated unit, integration, and timezone test suites.

### Frontend:
- **React 18.3.1 & TypeScript 5.4.5:** Robust component architecture with compile-time type safety.
- **Vite 5.3.1:** High-speed development bundler and optimized Rollup production builds.
- **Tailwind CSS 3.4.4:** Professional trading terminal dark slate/navy theme with accessible contrast.
- **Recharts 2.12.7:** High-performance charting for time-series generation, bar errors, and waterfall histories.
- **Lucide React 0.395.0:** Clean domain icons.
- **Vitest 1.6.1 & Testing Library:** Automated frontend component test runner.

### Infrastructure & Deployment:
- **Docker & Docker Compose:** Containerized orchestration with multi-stage builds and health checks.
- **Nginx (Alpine):** High-performance static web server and reverse proxy.
- **Vercel:** Frontend deployment compatibility.

---

## 6. Repository Structure

```
WindScopeUK/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI application entrypoint & middleware
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic Settings & environment variables
│   │   │   └── logging.py              # Structured logging without secrets
│   │   ├── models/
│   │   │   ├── cutoff.py               # CutoffType enum & market descriptions
│   │   │   ├── elexon.py               # FUELHH and WINDFOR raw schemas
│   │   │   ├── generation.py           # PairedGenerationPoint & ForecastPublication
│   │   │   ├── metrics.py              # AccuracyMetrics & DailyAccuracyRecord
│   │   │   └── responses.py            # OverviewResponse, GenerationResponse, etc.
│   │   ├── services/
│   │   │   ├── elexon_client.py        # Stream fetching, retries, caching
│   │   │   ├── forecast_selector.py    # Point-in-time selection, lookahead protection
│   │   │   ├── metrics_calculator.py   # Vectorized MAE, RMSE, WAPE, Bias calculation
│   │   │   └── demo_data_provider.py   # Explicitly labelled demonstration fallback
│   │   └── api/
│   │       └── v1/
│   │           ├── router.py           # Aggregate v1 router
│   │           ├── health.py           # GET /health
│   │           ├── overview.py         # GET /api/v1/overview
│   │           ├── generation.py       # GET /api/v1/generation
│   │           ├── accuracy.py         # GET /api/v1/accuracy
│   │           ├── forecast_history.py # GET /api/v1/forecast-history
│   │           ├── data_status.py      # GET /api/v1/data-status
│   │           └── utils.py            # January 2026 date validator
│   ├── tests/
│   │   ├── conftest.py                 # Test fixtures (actuals, forecast horizons)
│   │   ├── test_forecast_selector.py   # Cutoff selection, latest eligible, exclusions
│   │   ├── test_metrics_calculator.py  # MAE, RMSE, WAPE zero-division, bias sign
│   │   ├── test_timezone_cutoffs.py    # London time, UTC conversion, transitions
│   │   └── test_api_routes.py          # Route validation, Jan 2026 filter, demo mode
│   ├── Dockerfile                      # Backend container configuration
│   ├── requirements.txt                # Pinned dependencies
│   └── pytest.ini                      # Test runner configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                 # MetricCard, CutoffSelector, DateSelector, Badge
│   │   │   ├── charts/                 # ForecastVsActualChart, ForecastErrorChart, Waterfall
│   │   │   ├── tables/                 # DataTable, DailyAccuracyTable
│   │   │   ├── exposure/               # ProcurementExposureWidget
│   │   │   └── layout/                 # Header, Navigation, Footer
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx        # Overview KPIs, charts, exposure
│   │   │   ├── ForecastAnalysisPage.tsx# Deep-dive period selector & waterfall
│   │   │   ├── AccuracyAnalysisPage.tsx# Multi-day aggregate accuracy breakdown
│   │   │   ├── DataExplorerPage.tsx    # Raw tabular explorer with CSV export
│   │   │   └── MethodologyPage.tsx     # Technical documentation & formulas
│   │   ├── services/
│   │   │   └── api.ts                  # Typed client for backend REST API
│   │   ├── types/
│   │   │   └── api.ts                  # TypeScript interfaces matching backend models
│   │   ├── test/                       # Vitest component tests
│   │   ├── App.tsx                     # Top-level state & layout
│   │   ├── main.tsx                    # React DOM root
│   │   └── index.css                   # Tailwind styles & dark scrollbar
│   ├── Dockerfile                      # Multi-stage frontend container (Node + Nginx)
│   ├── nginx.conf                      # Nginx SPA config & API reverse proxy
│   ├── package.json                    # Dependencies & scripts
│   ├── tailwind.config.js              # Professional navy/slate theme tokens
│   ├── tsconfig.json                   # TypeScript configuration
│   └── vite.config.ts                  # Vite build and proxy config
│
├── docker-compose.yml                  # Complete stack orchestration
├── .dockerignore                       # Container ignore rules
├── .gitignore                          # Git ignore rules
├── vercel.json                         # Vercel deployment configuration
└── README.md                           # Product documentation
```

---

## 7. Elexon Data Sources & Retrieval Methodology

The pilot integrates directly with the official Elexon BMRS Insights Solution streaming endpoints:

### 1. Actual Metered Generation (`FUELHH`)
- **API Endpoint:** `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream`
- **Query Parameters:** `settlementDateFrom={date}&settlementDateTo={date}&fuelType=WIND`
- **Delivery Period:** Identified by `startTime` (UTC ISO 8601).
- **Outturn Generation:** Ingested from `generation` (MW).
- **Settlement Periods:** Half-hourly intervals 1 to 48 (or 50 on clock-change days).

### 2. Wind Generation Forecast (`WINDFOR`)
- **API Endpoint:** `https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream`
- **Query Parameters:** `publishDateTimeFrom={UTC}&publishDateTimeTo={UTC}`
- **Delivery Period:** Identified by `startTime` (UTC ISO 8601).
- **Publication Timestamp:** Ingested from `publishTime` (UTC ISO 8601).
- **Forecast Generation:** Ingested from `generation` (MW).

### Evaluation Scope:
- In strict adherence to assignment requirements, the pilot evaluates delivery periods in **January 2026** (2026-01-01 to 2026-01-31).
- Queries for dates outside this window are rejected with clear HTTP 400 responses.

---

## 8. Forecast-Selection Methodology & Decision Cutoffs

To reconstruct the exact state of knowledge available to a power trader, WindScope UK executes point-in-time forecast selection:

### Point-in-Time Selection Rules:
For every 30-minute delivery period:
1. Identify all forecast submissions targeting that period (`startTime == delivery_time`).
2. Calculate the configured decision cutoff timestamp in UTC.
3. Exclude any forecast published after the cutoff (`publishTime > cutoff_time`), preventing look-ahead bias.
4. Select the latest eligible forecast by maximum `publishTime`.
5. Compare the selected forecast against the corresponding `FUELHH` metered generation.

### Configurable Market Cutoffs:
- **`day_ahead_1100` (Default / Primary Market Benchmark):**
  - *Cutoff:* 11:00 London local time on Day D-1 (the day prior to delivery).
  - *Market Process:* Deadline for GB Day-Ahead Power Exchange order book closures on EPEX SPOT and Nord Pool. Primary cutoff for commercial power procurement.
- **`day_ahead_1200`:**
  - *Cutoff:* 12:00 London local time on Day D-1.
  - *Market Process:* Secondary auction gate closure and midday hedging adjustments.
- **`day_ahead_1700`:**
  - *Cutoff:* 17:00 London local time on Day D-1.
  - *Market Process:* Evening schedule freeze and Initial Physical Notification (IPN) submissions to National Energy System Operator (NESO).
- **`gate_closure_1h`:**
  - *Cutoff:* Exactly 1 hour prior to settlement period start (`startTime - 60 minutes`).
  - *Market Process:* Statutory Balancing and Settlement Code (BSC) Gate Closure, after which bilateral contract notifications cannot be submitted.
- **`gate_closure_2h`:**
  - *Cutoff:* 2 hours prior to settlement period start (`startTime - 120 minutes`).
  - *Market Process:* Benchmark window for intraday continuous trading and battery/storage dispatch.

---

## 9. Quantitative Accuracy Metrics

All metrics are calculated on matched forecast-actual pairs:

### 1. Forecast Error for each interval:
$$\text{Error}_i = \text{Forecast}_i - \text{Actual}_i \quad (\text{MW})$$

### 2. Mean Absolute Error (MAE):
$$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |\text{Forecast}_i - \text{Actual}_i| \quad (\text{MW})$$

### 3. Root Mean Squared Error (RMSE):
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^N (\text{Forecast}_i - \text{Actual}_i)^2} \quad (\text{MW})$$

### 4. Weighted Absolute Percentage Error (WAPE):
$$\text{WAPE} = \frac{\sum_{i=1}^N |\text{Forecast}_i - \text{Actual}_i|}{\sum_{i=1}^N |\text{Actual}_i|} \times 100 \quad (\%)$$
- **Zero-Denominator Guard:** If total actual wind generation across evaluated periods is zero, WAPE is safely handled (0.0 if total error is zero, `None` if error is non-zero). The system **never** returns `NaN` or `Infinity`.

### 5. Forecast Bias & Sign Convention:
$$\text{Bias} = \frac{1}{N} \sum_{i=1}^N (\text{Forecast}_i - \text{Actual}_i) \quad (\text{MW})$$
- **Positive Bias (+MW):** **Overforecasting.** Forecast exceeded actuals. The utility expected more wind than was generated.
- **Negative Bias (-MW):** **Underforecasting.** Forecast fell short of actuals. More wind was generated than expected.

### Observation Accounting:
Periods with missing metered actuals or missing eligible forecasts are strictly excluded from accuracy metric sums and explicitly reported in `excluded_observations`.

---

## 10. Timezone Conventions

- **Market Standard:** All British electricity settlement periods are scheduled in **UK Local Time (`Europe/London`)**.
- **January Handling:** In January, UK local time is Greenwich Mean Time (GMT / UTC+0).
- **Implementation:** The backend parses all timestamps into timezone-aware datetimes with UTC storage, converts to `Europe/London` to compute calendar settlement day boundaries, and formats user-facing labels as `YYYY-MM-DD HH:MM GMT`.

---

## 11. Data Limitations & Pilot Scope Boundaries

To maintain strict regulatory and technical integrity:
1. **Transmission-Connected Metering Only:** Elexon `FUELHH` and `WINDFOR` monitor transmission-connected and operational BM-metered wind farms across Great Britain. Embedded distribution-connected wind is not directly metered in these datasets.
2. **Wind Fleet Forecast Only:** The datasets contain wind power forecasts and outturn only. WindScope UK **does not** fabricate customer electricity demand curves, thermal power plants, or battery dispatch.
3. **Illustrative Exposure Indicator:** Energy variance figures (MWh) illustrate aggregate wind forecast volume exposure. They do not claim to calculate the utility's final net customer portfolio imbalance.
4. **No Silent Synthetic Fallbacks:** If the live Elexon API is unreachable, the system displays a clear error or an explicitly labelled demonstration mode banner. Synthetic data is never presented as real observations.

---

## 12. Local Installation Instructions

### Prerequisites:
- Python 3.12+
- Node.js 20+ and npm 10+
- Git

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/WindScopeUK.git
cd WindScopeUK
```

### 2. Backend Setup:
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1
# Or on Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be available at: `http://localhost:8000`  
Interactive OpenAPI documentation: `http://localhost:8000/docs`

### 3. Frontend Setup:
Open a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will be available at: `http://localhost:5173`

---

## 13. Environment Variable Configuration

Create a `.env` file in `backend/` or configure environment variables in Docker:

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

# Cache & Mode
CACHE_DIR=.cache
CACHE_TTL_SECONDS=3600
ALLOW_DEMO_FALLBACK=true
DEBUG=false
```

Frontend environment variables (optional, in `frontend/.env`):
```ini
# Base URL for API requests (empty string uses Vite dev proxy or Nginx reverse proxy)
VITE_API_BASE_URL=
```

---

## 14. Docker Startup Instructions

The complete application can be built and launched with a single Docker Compose command:

```bash
# Build and start all services in detached mode
docker-compose up -d --build

# Inspect running containers
docker-compose ps

# View live container logs
docker-compose logs -f
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **Health Check:** `http://localhost:8000/health`

To stop the containers:
```bash
docker-compose down
```

---

## 15. Automated Test Commands

### Run Backend Unit & Integration Tests:
```bash
# Run pytest from backend directory (or with PYTHONPATH set)
cd backend
pytest tests -v
```
All 26 automated backend tests verify:
- Point-in-time cutoff calculation across all decision cutoffs.
- Discarding future-published forecasts (preventing look-ahead bias).
- Selecting the latest eligible forecast when multiple revisions exist.
- Multiple forecasts for the same period.
- Missing forecasts, missing actuals, and duplicate records.
- MAE, RMSE, and WAPE calculations.
- Safe zero-denominator handling for WAPE.
- Bias sign convention (+MW overforecast, -MW underforecast).
- Timestamp parsing and Europe/London timezone handling.
- January 2026 date validation.
- Mocked external API errors and demonstration mode fallback.

### Run Frontend Component Tests:
```bash
cd frontend
npm run test
```
All Vitest frontend tests verify:
- Metric card formatting and sign conventions.
- Decision cutoff selector interactions and callbacks.
- Error alerts and retry callbacks.
- Procurement exposure widget rendering.

---

## 16. API Endpoints Reference

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check and live Elexon connectivity probe | None |
| `GET` | `/api/v1/overview` | Overview dashboard metrics, series, and exposure | `settlement_date`, `cutoff`, `demo` |
| `GET` | `/api/v1/generation` | 48 half-hour matched observations and errors | `settlement_date`, `cutoff`, `demo` |
| `GET` | `/api/v1/accuracy` | Multi-day or single-day accuracy metrics & daily breakdown | `start_date`, `end_date`, `cutoff`, `demo` |
| `GET` | `/api/v1/forecast-history` | Multi-horizon forecast updates (waterfall) for one period | `delivery_time`, `cutoff`, `demo` |
| `GET` | `/api/v1/data-status` | Elexon API status, cached dates, available cutoffs | None |

---

## 17. Deployment Instructions

### Frontend Deployment (Vercel):
The repository includes a root `vercel.json` and a standard Vite build configuration.
1. Connect the GitHub repository to [Vercel](https://vercel.com/).
2. Set the root directory or framework preset to `Vite`.
3. Set the build command: `cd frontend && npm install && npm run build`
4. Set the output directory: `frontend/dist`
5. Configure the environment variable `VITE_API_BASE_URL` to point to your hosted backend URL.

### Backend Deployment (Python Host / Container):
The FastAPI backend can be deployed on AWS ECS, Render, Fly.io, Google Cloud Run, or any Linux VPS:
```bash
# Example deployment with Gunicorn/Uvicorn on a Linux host
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
Ensure outgoing HTTPS connections to `https://data.elexon.co.uk` are allowed through firewalls.

### Public Application URL:
*(Placeholder until production hosting deployment is completed)*  
- Frontend: `https://windscope-uk.vercel.app` *(Pending Deployment)*
- Backend API: `https://api.windscope-uk.internal` *(Pending Deployment)*

---

## 18. AI-Tool Usage Disclosure

In compliance with assignment requirements:  
AI tools, including **Google Antigravity** and **ChatGPT**, assisted with the architectural design, software development, documentation, and test suite implementation of this application.
