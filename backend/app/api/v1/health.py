from datetime import datetime, timezone
from fastapi import APIRouter
from app.services.elexon_client import elexon_client

router = APIRouter(tags=["Health"])


@router.get("/health")
async def get_health():
    """
    Health check endpoint verifying backend service operation and live Elexon API reachability.
    """
    elexon_live = await elexon_client.check_api_health()
    return {
        "status": "healthy",
        "service": "WindScope UK Backend API",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "elexon_api_connected": elexon_live,
        "evaluation_scope": "January 2026 Delivery Periods"
    }

