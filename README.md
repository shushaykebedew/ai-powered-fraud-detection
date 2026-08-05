# Sentinel — AI-Powered Fraud Detection Platform

A production-quality fraud detection system: an XGBoost model trained on
mobile-money transaction data, a FastAPI backend that serves real-time
risk scoring with SHAP explanations, and a Next.js dashboard for scoring
transactions, reviewing history, and monitoring model performance.

Built as a final-year AI project — designed to demonstrate a full
ML-to-production pipeline, not just a notebook.

---

## What's inside

```
fraud-detection-platform/
├── fraud_detection_v2.ipynb   ML training notebook — EDA, feature engineering,
│                               model comparison, SHAP, production export
├── backend/                   FastAPI service — auth, scoring API, history, stats
│   └── app/ml/models/v1/      exported model.joblib, scaler.joblib, metadata.json
└── frontend/                  Next.js dashboard — scoring UI, history, model metrics
```

Each of `backend/` and `frontend/` has its own README with full setup
details. This file is the map of how they fit together.

## How it works

```
                 ┌────────────────────────┐
                 │  fraud_detection_v2     │
                 │  .ipynb (training)      │
                 │                          │
                 │  PaySim-schema data      │
                 │  → feature engineering   │
                 │  → model comparison      │
                 │  → XGBoost + tuning      │
                 │  → SHAP explainability   │
                 └───────────┬──────────────┘
                             │ exports
                             ▼
              model.joblib · scaler.joblib · metadata.json
                             │
                             ▼
                 ┌────────────────────────┐        JWT auth
                 │  backend/ (FastAPI)      │◄──────────────────┐
                 │                          │                    │
                 │  /predict  → risk score  │        ┌───────────┴──────────┐
                 │  + SHAP factors          │◄───────┤  frontend/ (Next.js) │
                 │  /history  → past scores │  REST  │                       │
                 │  /stats    → dashboard   │────────►  dashboard · predict  │
                 │            data          │        │  history · model perf│
                 └────────────────────────┘        └───────────────────────┘
```

The notebook is the only place feature engineering and the model are
*defined*; the backend re-implements that exact transformation for
single-transaction inference (see `backend/app/services/ml_service.py`)
so the API has no runtime dependency on the notebook itself.

## Tech stack

| Layer | Stack |
|---|---|
| ML | Python, scikit-learn, XGBoost, LightGBM, SHAP, pandas |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, PostgreSQL/SQLite, JWT access + refresh tokens (python-jose + passlib), slowapi rate limiting |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form + Zod, Recharts |

## Features

- Real-time transaction scoring with a SHAP-based "why this score" explanation
- Batch scoring — upload a CSV, score up to 1,000 transactions at once
- JWT auth with access + refresh tokens
- Role-based access — the first registered user becomes admin automatically;
  admins get a platform-wide dashboard and can manage other users' roles/status
- Prediction history (filterable, paginated) and model-performance metrics
- Rate limiting on auth and scoring endpoints
- Alembic migrations for schema evolution

## Quick start

You need **Python 3.11+** and **Node.js 18+**.

**1. Backend** (in one terminal):
```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```
→ API docs at http://localhost:8000/api/docs

**2. Frontend** (in a second terminal):
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
→ App at http://localhost:3000

The **first account you register becomes an admin** automatically — use
it to see the admin dashboard at `/admin`, or register a second account
to see the regular analyst view.

**3. Try it**: register an account, go to **Score a transaction**, click
**"Suspicious example"**, run the check — you'll get a risk score with a
SHAP-based explanation of exactly which factors drove it.

Full details, environment variables, Docker/Postgres setup, and testing
instructions are in [`backend/README.md`](backend/README.md) and
[`frontend/README.md`](frontend/README.md).

## Model

- **Algorithm**: XGBoost, selected after comparing Logistic Regression,
  Random Forest, XGBoost, and LightGBM on PR-AUC and F1 (accuracy is
  misleading here — fraud is a fraction of a percent of transactions).
- **Features**: raw transaction fields plus engineered signals —
  balance-consistency errors, whether the origin account was fully
  drained, merchant-destination flag, log-scaled amount, time-of-day.
- **Threshold**: tuned on a validation set to maximize F1, not the
  default 0.5 cutoff.
- **Explainability**: every prediction returns its top SHAP-contributing
  features, not just a bare probability — this is what powers the "why
  was this flagged" panel in the UI.

Full methodology, charts, and metrics are in `fraud_detection_v2.ipynb`.

> **Note on the data**: the model currently shipped in
> `backend/app/ml/models/v1/` was trained on synthetic data generated to
> match the PaySim schema, because the real dataset CSV wasn't available
> at build time. The pipeline, features, and export process are all
> production-real — retrain on your actual dataset before relying on
> the scores for anything beyond a demo (see "Retraining" below).

## Retraining on real data

1. Place your PaySim (or PaySim-schema) CSV at `data/fraud_dataset.csv`
   relative to the notebook.
2. Re-run `fraud_detection_v2.ipynb` top to bottom.
3. Copy the newly exported `model.joblib`, `scaler.joblib`,
   `metadata.json` into `backend/app/ml/models/v1/` (or a new
   versioned folder + update `MODEL_DIR` in `backend/.env`).
4. Restart the backend — it loads whatever's in `MODEL_DIR` at startup.

## Known limitations / roadmap

- Refresh tokens are stateless JWTs — can't be revoked server-side
  before they expire (14 days by default); a production system would
  track them in the database to support logout-everywhere
- Rate limiting is in-memory/per-process — fine for one backend
  instance, needs Redis storage for a horizontally scaled deployment
- No automated end-to-end (Playwright/Cypress) browser tests — backend
  is covered by a pytest suite (7 tests, including refresh tokens, admin
  access control, and batch upload); frontend is verified via build + lint
- Single-stage scoring only — a production system would likely pair a
  cheap real-time rule layer with this model for deeper batch scoring

## License

Academic / portfolio project — add a license here if you plan to
publish this repo publicly.
