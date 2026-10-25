from datetime import datetime, timezone
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import logger
from app.api.v1.router import api_v1_router
from app.api.v1.health import router as health_router

app = FastAPI(
    title="WindScope UK — Wind Power Forecasting & Day-Ahead Procurement Analytics",
    description=(
        "Engineering analytics platform for UK electricity utility trading desks. "
        "Evaluates national wind generation forecasts from Elexon BMRS datasets FUELHH & WINDFOR, "
        "with point-in-time forecast selection, configurable gate closure cutoffs, "
        "WAPE/MAE/RMSE/Bias accuracy metrics, and day-ahead procurement exposure insights."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)
# Also include /health directly at root for Docker/K8s probes
app.include_router(health_router)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "WindScope UK API",
        "version": "1.0.0",
        "status": "operational",
        "documentation": "/docs",
        "evaluation_scope": "January 2026",
        "api_v1": settings.API_V1_PREFIX,
        "timestamp_utc": datetime.now(timezone.utc).isoformat()
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred while processing your request.",
            "path": request.url.path
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

