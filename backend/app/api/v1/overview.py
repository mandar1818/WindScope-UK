from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Query, HTTPException

from app.core.config import settings
from app.models.cutoff import CutoffType
from app.models.responses import OverviewResponse, SourceStatus
from app.services.elexon_client import elexon_client
from app.services.forecast_selector import match_and_select_forecasts
from app.services.metrics_calculator import calculate_accuracy_metrics
from app.api.v1.utils import validate_january_2026_date, get_cutoff_info

router = APIRouter(tags=["Overview"])


@router.get("/overview", response_model=OverviewResponse)
async def get_overview(
    settlement_date: str = Query(
        default="2026-01-15",
        description="Target settlement date in January 2026 (YYYY-MM-DD)"
    ),
    cutoff: CutoffType = Query(
        default=CutoffType.DAY_AHEAD_1100,
        description="Decision cutoff to apply for forecast eligibility"
    ),
    demo: Optional[bool] = Query(
        default=None,
        description="Force demonstration mode for testing/evaluation"
    )
):
    """
    Overview dashboard endpoint.
    Returns matched actual and forecast generation, key accuracy metrics,
    procurement exposure calculations, and Elexon data source status.
    """
    valid_date = validate_january_2026_date(settlement_date)
    cutoff_info = get_cutoff_info(cutoff)
    
    # Fetch data
    actuals, forecasts, is_demo, notice = await elexon_client.fetch_data_for_date(
        valid_date,
        allow_demo_fallback=(demo is True or settings.ALLOW_DEMO_FALLBACK)
    )
    
    if demo is True and not is_demo:
        # User explicitly requested demo mode
        from app.services.demo_data_provider import generate_demonstration_dataset
        actuals, forecasts = generate_demonstration_dataset(valid_date)
        is_demo = True
        notice = "DEMONSTRATION MODE: Forced via demo query parameter for demonstration and verification."

    # Match forecasts to actuals using point-in-time cutoff
    paired_points = match_and_select_forecasts(actuals, forecasts, cutoff_type=cutoff)
    
    # Calculate accuracy metrics
    metrics = calculate_accuracy_metrics(paired_points, total_target_periods=len(paired_points))
    
    # Calculate procurement exposure indicators (half-hour resolution = MW * 0.5 h = MWh)
    valid_pairs = [p for p in paired_points if p.is_valid_pair and p.error_mw is not None]
    
    overforecast_mwh = 0.0
    underforecast_mwh = 0.0
    net_error_mwh = 0.0
    max_over_mw = 0.0
    max_under_mw = 0.0
    
    for p in valid_pairs:
        err = p.error_mw
        energy_mwh = abs(err) * 0.5
        net_error_mwh += err * 0.5
        
        if err > 0:
            overforecast_mwh += energy_mwh
            if err > max_over_mw:
                max_over_mw = err
        elif err < 0:
            underforecast_mwh += energy_mwh
            if abs(err) > max_under_mw:
                max_under_mw = abs(err)
                
    if net_error_mwh > 50.0:
        dominant_risk = "NET_SHORT_EXPOSURE"
        risk_explanation = (
            f"Net day-ahead overforecast of {round(net_error_mwh, 1)} MWh across the day. "
            "Utility procurement based on this forecast would have left the portfolio short of power, "
            "requiring intraday purchases or cash-out at System Buy Price (SBP)."
        )
    elif net_error_mwh < -50.0:
        dominant_risk = "NET_LONG_EXPOSURE"
        risk_explanation = (
            f"Net day-ahead underforecast of {round(abs(net_error_mwh), 1)} MWh across the day. "
            "Utility procurement based on this forecast would have resulted in surplus contracted power, "
            "requiring selling into the Balancing Mechanism or cash-out at System Sell Price (SSP)."
        )
    else:
        dominant_risk = "RELATIVELY_BALANCED"
        risk_explanation = "Net energy variance is within normal operational balancing tolerances (±50 MWh)."
        
    exposure_summary = {
        "overforecast_energy_mwh": round(overforecast_mwh, 1),
        "underforecast_energy_mwh": round(underforecast_mwh, 1),
        "net_energy_variance_mwh": round(net_error_mwh, 1),
        "max_single_period_overforecast_mw": round(max_over_mw, 1),
        "max_single_period_underforecast_mw": round(max_under_mw, 1),
        "dominant_risk_category": dominant_risk,
        "risk_explanation": risk_explanation,
        "disclaimer": (
            "Illustrative wind forecast exposure only. WindScope UK does not claim to know the utility's "
            "actual residual demand, customer load shape, or physical generation fleet."
        )
    }
    
    source_status = SourceStatus(
        elexon_api_online=not is_demo,
        fuelhh_available=len(actuals) > 0,
        windfor_available=len(forecasts) > 0,
        is_demonstration_mode=is_demo,
        demonstration_notice=notice,
        data_source_description="Elexon BMRS Insights Solution API (Datasets FUELHH & WINDFOR)" if not is_demo else "Synthetic Demonstration Mode",
        last_updated_utc=datetime.now(timezone.utc)
    )
    
    return OverviewResponse(
        evaluation_window="January 2026",
        selected_date=valid_date,
        cutoff_type=cutoff,
        cutoff_info=cutoff_info,
        data_source="Elexon BMRS Insights API" if not is_demo else "Demonstration Benchmark Dataset",
        is_demonstration_mode=is_demo,
        demonstration_notice=notice,
        date_metrics=metrics,
        generation_series=paired_points,
        exposure_summary=exposure_summary,
        source_status=source_status
    )
