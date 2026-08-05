# Fraud Detection API (Backend)

Production FastAPI backend for the AI fraud detection platform. Serves
real-time fraud risk scoring from the XGBoost model trained in
`fraud_detection_v2.ipynb`, with JWT auth (access + refresh tokens),
rate limiting, batch scoring, admin user management, prediction history,
and dashboard analytics.

## Stack

FastAPI · Pydantic v2 · SQLAlchemy 2 · PostgreSQL (SQLite for local dev) ·
Alembic migrations · JWT auth (python-jose + passlib/bcrypt) · slowapi
rate limiting · XGBoost + SHAP for scoring and explainability.

## Project layout

```
app/
  core/        settings, JWT/password utils, rate limiter, logging
  db/          SQLAlchemy engine/session, table init
  models/      ORM models (User, Prediction)
  schemas/     Pydantic request/response models
  api/v1/      route handlers (auth, predictions, stats, admin)
  services/    ml_service (model loading + inference + SHAP),
               auth_service
  ml/models/v1/  exported model.joblib, scaler.joblib, metadata.json
alembic/       schema migrations
tests/         pytest suite — auth, refresh tokens, admin access
               control, batch upload, prediction flow (all passing)
```

## Run locally (SQLite, zero setup)

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # defaults already work for local dev
alembic upgrade head          # creates tables via migrations
uvicorn app.main:app --reload
```

(The app also auto-creates tables at startup via `create_all()` as a
zero-config fallback, so it'll run even if you skip the migration step —
but for anything beyond local dev, use Alembic so schema changes are
tracked.)

API docs: http://localhost:8000/api/docs
Health check: http://localhost:8000/api/health

## Run with Docker (Postgres)

```bash
docker compose up --build
```

This starts Postgres + the API together, wired via `DATABASE_URL` in
`docker-compose.yml`. Change `JWT_SECRET_KEY` before deploying anywhere
real — generate one with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Run tests

```bash
pip install pytest httpx
pytest tests/ -v
```

## Key endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | — | Create account, returns access + refresh token (first user ever registered becomes admin) |
| POST | `/api/v1/auth/login` | — | OAuth2 password flow, returns access + refresh token |
| POST | `/api/v1/auth/refresh` | — | Exchange a refresh token for a new token pair |
| GET | `/api/v1/auth/me` | ✓ | Current user |
| POST | `/api/v1/predictions/predict` | ✓ | Score a transaction, returns risk score + SHAP factors |
| POST | `/api/v1/predictions/batch` | ✓ | Upload a CSV, score every row (max 1000 rows/upload) |
| GET | `/api/v1/predictions/history` | ✓ | Paginated prediction history |
| GET | `/api/v1/predictions/{id}` | ✓ | Single prediction detail |
| GET | `/api/v1/stats/model-performance` | — | Offline model metrics from training |
| GET | `/api/v1/stats/summary` | ✓ | Per-user prediction analytics for the dashboard |
| GET | `/api/v1/admin/users` | admin | List all users |
| PATCH | `/api/v1/admin/users/{id}` | admin | Update a user's role or active status |
| GET | `/api/v1/admin/stats` | admin | Platform-wide totals |

**Auth model:** the first account ever registered is automatically made
`admin`; everyone after that registers as `analyst`. Promote further
admins via `PATCH /api/v1/admin/users/{id}`.

**Rate limits:** register 5/min, login 10/min, refresh 20/min, predict
60/min, batch upload 5/min — per client IP, in-memory (resets on
restart; swap slowapi's storage backend for Redis if you need limits
that survive restarts or multiple backend instances).

**Batch CSV format:** header row must include `step, type, amount,
name_orig, oldbalance_org, newbalance_orig, name_dest, oldbalance_dest,
newbalance_dest`. Each row is validated and scored independently — a bad
row is reported with an error, it doesn't fail the whole batch.

## Retraining / updating the model

Re-run `fraud_detection_v2.ipynb` (ideally against the real PaySim CSV,
not the synthetic fallback it currently uses) and copy the resulting
`model.joblib`, `scaler.joblib`, `metadata.json` into `app/ml/models/v1/`
(or a new `v2/` folder + update `MODEL_DIR` in `.env`). The API reloads
whatever's in `MODEL_DIR` at startup — no code changes needed as long as
the feature schema stays compatible with `ml_service.py`'s
`_engineer_features()`.

**Important:** the model currently in `app/ml/models/v1/` was trained on
synthetic data (see the notebook's caveat) purely to prove the pipeline
works end-to-end. Retrain on real data before using this for anything
beyond a demo.

## Schema migrations

```bash
# after changing a model in app/models/
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

## Known limitations / next steps

- Refresh tokens are stateless JWTs — they can't be revoked server-side
  before they expire (14 days by default). A production system would
  track them in the database (or a denylist) to support logout-everywhere.
- Rate limiting is in-memory and per-process — fine for one backend
  instance, not for a horizontally scaled deployment (use Redis storage
  for that).
- No end-to-end (Playwright/Cypress) tests — pytest covers the API layer.
