from typing import Optional, List
from fastapi import APIRouter, Query
from datetime import datetime, timedelta

from app.core.config import settings
from app.models.cutoff import CutoffType
from app.models.responses import AccuracyResponse
from app.models.generation import PairedGenerationPoint
from app.services.elexon_client import elexon_client
from app.services.forecast_selector import match_and_select_forecasts
from app.services.metrics_calculator import calculate_accuracy_metrics, calculate_daily_breakdown
from app.api.v1.utils import validate_january_2026_date, get_cutoff_info

router = APIRouter(tags=["Accuracy"])

METRIC_EXPLANATIONS = {
    "MAE": "Mean Absolute Error (MW): Average magnitude of forecast deviations regardless of direction: (1/N) * Sum(|Forecast - Actual|).",
    "RMSE": "Root Mean Squared Error (MW): Square root of the mean squared errors: Sqrt((1/N) * Sum((Forecast - Actual)^2)). Penalizes large forecast misses heavily.",
    "WAPE": "Weighted Absolute Percentage Error (%): (Sum(|Forecast - Actual|) / Sum(Actual)) * 100. Measures overall portfolio volume error percentage without dividing by individual period zeroes.",
    "Forecast_Bias": "Forecast Bias (MW): Mean signed error: (1/N) * Sum(Forecast - Actual). SIGN CONVENTION: Positive indicates wind overforecasting (system was shorter than expected). Negative indicates wind underforecasting (system was longer than expected).",
    "Observation_Filter": "Missing actuals or missing forecasts are excluded from metric calculations. The number of valid observations and excluded periods is explicitly reported."
}


@router.get("/accuracy", response_model=AccuracyResponse)
async def get_accuracy(
    settlement_date: Optional[str] = Query(
        default=None,
        description="Optional single settlement date in January 2026 (YYYY-MM-DD)"
    ),
    start_date: str = Query(
        default="2026-01-01",
        description="Start date for range evaluation in January 2026 (YYYY-MM-DD)"
    ),
    end_date: str = Query(
        default="2026-01-15",
        description="End date for range evaluation in January 2026 (YYYY-MM-DD)"
    ),
    cutoff: CutoffType = Query(
        default=CutoffType.DAY_AHEAD_1100,
        description="Decision cutoff to apply"
    ),
    demo: Optional[bool] = Query(
        default=None,
        description="Force demonstration mode"
    )
):
    """
    Accuracy analysis endpoint.
    Computes MAE, RMSE, WAPE, and Bias over single days or multi-day evaluation windows in January 2026.
    Provides daily accuracy breakdowns and complete observation counts.
    """
    cutoff_info = get_cutoff_info(cutoff)
    
    if settlement_date:
        valid_dates = [validate_january_2026_date(settlement_date)]
    else:
        v_start = validate_january_2026_date(start_date)
        v_end = validate_january_2026_date(end_date)
        dt_start = datetime.strptime(v_start, "%Y-%m-%d")
        dt_end = datetime.strptime(v_end, "%Y-%m-%d")
        if dt_start > dt_end:
            dt_start, dt_end = dt_end, dt_start
            
        valid_dates = []
        curr = dt_start
        while curr <= dt_end:
            valid_dates.append(curr.strftime("%Y-%m-%d"))
            curr += timedelta(days=1)

    all_points: List[PairedGenerationPoint] = []
    is_any_demo = False
    notices: List[str] = []

    for d in valid_dates:
        actuals, forecasts, is_demo, notice = await elexon_client.fetch_data_for_date(
            d,
            allow_demo_fallback=(demo is True or settings.ALLOW_DEMO_FALLBACK)
        )
        if demo is True and not is_demo:
            from app.services.demo_data_provider import generate_demonstration_dataset
            actuals, forecasts = generate_demonstration_dataset(d)
            is_demo = True
            notice = "DEMONSTRATION MODE: Forced via demo query parameter."
            
        if is_demo:
            is_any_demo = True
            if notice and notice not in notices:
                notices.append(notice)
                
        paired = match_and_select_forecasts(actuals, forecasts, cutoff_type=cutoff)
        all_points.extend(paired)

    aggregate_metrics = calculate_accuracy_metrics(all_points, total_target_periods=len(all_points))
    daily_breakdown = calculate_daily_breakdown(all_points)

    return AccuracyResponse(
        evaluation_window=f"{valid_dates[0]} to {valid_dates[-1]}" if len(valid_dates) > 1 else valid_dates[0],
        selected_date=settlement_date,
        cutoff_type=cutoff,
        cutoff_info=cutoff_info,
        data_source="Elexon BMRS Insights API" if not is_any_demo else "Demonstration Benchmark Dataset",
        is_demonstration_mode=is_any_demo,
        demonstration_notice=" ".join(notices) if notices else None,
        aggregate_metrics=aggregate_metrics,
        daily_breakdown=daily_breakdown,
        metric_explanations=METRIC_EXPLANATIONS
    )

