from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.overview import router as overview_router
from app.api.v1.generation import router as generation_router
from app.api.v1.accuracy import router as accuracy_router
from app.api.v1.forecast_history import router as forecast_history_router
from app.api.v1.data_status import router as data_status_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(overview_router)
api_v1_router.include_router(generation_router)
api_v1_router.include_router(accuracy_router)
api_v1_router.include_router(forecast_history_router)
api_v1_router.include_router(data_status_router)
