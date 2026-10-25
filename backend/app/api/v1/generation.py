from typing import Optional
from fastapi import APIRouter, Query

from app.core.config import settings
from app.models.cutoff import CutoffType
from app.models.responses import GenerationResponse
from app.services.elexon_client import elexon_client
from app.services.forecast_selector import match_and_select_forecasts
from app.services.metrics_calculator import calculate_accuracy_metrics
from app.api.v1.utils import validate_january_2026_date, get_cutoff_info

router = APIRouter(tags=["Generation"])


@router.get("/generation", response_model=GenerationResponse)
async def get_generation(
    settlement_date: str = Query(
        default="2026-01-15",
        description="Settlement date in January 2026 (YYYY-MM-DD)"
    ),
    cutoff: CutoffType = Query(
        default=CutoffType.DAY_AHEAD_1100,
        description="Decision cutoff type"
    ),
    demo: Optional[bool] = Query(
        default=None,
        description="Force demonstration mode"
    )
):
    """
    Retrieves half-hourly matched generation observations for a specific settlement date in January 2026.
    Includes actual generation (FUELHH WIND), selected forecast (WINDFOR), errors, and metadata.
    """
    valid_date = validate_january_2026_date(settlement_date)
    cutoff_info = get_cutoff_info(cutoff)
    
    actuals, forecasts, is_demo, notice = await elexon_client.fetch_data_for_date(
        valid_date,
        allow_demo_fallback=(demo is True or settings.ALLOW_DEMO_FALLBACK)
    )
    
    if demo is True and not is_demo:
        from app.services.demo_data_provider import generate_demonstration_dataset
        actuals, forecasts = generate_demonstration_dataset(valid_date)
        is_demo = True
        notice = "DEMONSTRATION MODE: Forced via demo query parameter."

    paired_points = match_and_select_forecasts(actuals, forecasts, cutoff_type=cutoff)
    metrics = calculate_accuracy_metrics(paired_points, total_target_periods=len(paired_points))
    
    return GenerationResponse(
        settlement_date=valid_date,
        cutoff_type=cutoff,
        cutoff_info=cutoff_info,
        data_source="Elexon BMRS Insights API" if not is_demo else "Demonstration Benchmark Dataset",
        is_demonstration_mode=is_demo,
        demonstration_notice=notice,
        metrics=metrics,
        points=paired_points,
        total_points=len(paired_points)
    )

