from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter

from app.core.config import settings
from app.models.responses import DataStatusResponse
from app.models.cutoff import AVAILABLE_CUTOFFS
from app.services.elexon_client import elexon_client

router = APIRouter(tags=["Data Status"])


@router.get("/data-status", response_model=DataStatusResponse)
async def get_data_status():
    """
    Returns system data status, cache contents, live Elexon connectivity,
    and metadata for available decision cutoffs.
    """
    cache_dir = Path(settings.CACHE_DIR)
    cached_files = list(cache_dir.glob("*.json")) if cache_dir.exists() else []
    
    elexon_online = await elexon_client.check_api_health()
    
    return DataStatusResponse(
        elexon_api_online=elexon_online,
        fuelhh_available=elexon_online,
        windfor_available=elexon_online,
        cached_dates_count=len(cached_files),
        evaluation_month="January 2026",
        is_demonstration_mode=not elexon_online,
        demonstration_notice=(
            "Live Elexon BMRS API is currently unreachable. Demonstration mode is active."
            if not elexon_online else None
        ),
        last_checked_utc=datetime.now(timezone.utc),
        available_cutoffs=AVAILABLE_CUTOFFS
    )

