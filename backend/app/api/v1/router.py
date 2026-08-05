from fastapi import APIRouter

from app.api.v1 import admin, auth, predictions, stats

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(predictions.router)
api_router.include_router(stats.router)
api_router.include_router(admin.router)
