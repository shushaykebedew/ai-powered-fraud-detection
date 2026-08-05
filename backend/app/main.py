from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.core.logging import logger, setup_logging
from app.db.init_db import init_db
from app.services.ml_service import get_ml_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()
    get_ml_service()  # load model once at startup, not on first request
    logger.info("%s started (%s)", settings.APP_NAME, settings.ENVIRONMENT)
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Production API for the AI-powered fraud detection platform. "
        "Serves real-time fraud risk scoring backed by an XGBoost model, "
        "with SHAP-based explanations, prediction history, and dashboard analytics."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": exc.errors()},
    )


@app.get("/api/health", tags=["Health"])
def health_check():
    ml = get_ml_service()
    return {
        "status": "ok",
        "model_version": ml.metadata.get("model_version"),
    }


app.include_router(api_router, prefix=settings.API_V1_PREFIX)
