from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Query, HTTPException

from app.core.config import settings
from app.models.cutoff import CutoffType
from app.models.responses import ForecastHistoryResponse
from app.services.elexon_client import elexon_client
from app.services.forecast_selector import (
    parse_to_utc,
    calculate_decision_cutoff_time,
    build_forecast_history,
    format_local_timestamp,
    LONDON_TZ
)
from app.api.v1.utils import validate_january_2026_date

router = APIRouter(tags=["Forecast History"])


@router.get("/forecast-history", response_model=ForecastHistoryResponse)
async def get_forecast_history(
    delivery_time: str = Query(
        default="2026-01-15T12:00:00Z",
        description="Target 30-min settlement period delivery timestamp (ISO 8601 UTC)"
    ),
    cutoff: CutoffType = Query(
        default=CutoffType.DAY_AHEAD_1100,
        description="Decision cutoff to apply for historical evaluation"
    ),
    demo: Optional[bool] = Query(
        default=None,
        description="Force demonstration mode"
    )
):
    """
    Historical Forecast Progression ('Forecast Waterfall') endpoint.
    
    For a selected 30-minute delivery period:
    - Lists all wind generation forecasts published at different times for that delivery period.
    - Clearly distinguishes the point-in-time forecast available at the decision cutoff
      from forecasts published later or available now.
    - Displays actual outturn generation for side-by-side comparison.
    """
    try:
        delivery_utc = parse_to_utc(delivery_time)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid delivery_time '{delivery_time}'. Expected ISO 8601 UTC string (e.g. 2026-01-15T12:00:00Z)."
        )
        
    delivery_london = delivery_utc.astimezone(LONDON_TZ)
    settlement_date = delivery_london.strftime("%Y-%m-%d")
    validate_january_2026_date(settlement_date)
    
    # Calculate settlement period number (1 to 48/50)
    # Each settlement period is 30 minutes from 00:00 local time
    minutes_from_midnight = delivery_london.hour * 60 + delivery_london.minute
    settlement_period = (minutes_from_midnight // 30) + 1
    
    actuals, forecasts, is_demo, notice = await elexon_client.fetch_data_for_date(
        settlement_date,
        allow_demo_fallback=(demo is True or settings.ALLOW_DEMO_FALLBACK)
    )
    
    if demo is True and not is_demo:
        from app.services.demo_data_provider import generate_demonstration_dataset
        actuals, forecasts = generate_demonstration_dataset(settlement_date)
        is_demo = True

    # Find actual outturn for this period
    actual_record = next(
        (a for a in actuals if parse_to_utc(a.startTime) == delivery_utc),
        None
    )
    actual_mw = float(actual_record.generation) if actual_record and actual_record.generation is not None else None
    
    selected_rec, latest_rec, publications = build_forecast_history(
        delivery_start_utc=delivery_utc,
        actual_generation_mw=actual_mw,
        forecast_records=forecasts,
        cutoff_type=cutoff
    )
    
    cutoff_time_utc = calculate_decision_cutoff_time(delivery_utc, cutoff)
    
    sel_pub_utc = parse_to_utc(selected_rec.publishTime) if selected_rec else None
    lat_pub_utc = parse_to_utc(latest_rec.publishTime) if latest_rec else None
    
    return ForecastHistoryResponse(
        target_delivery_time_utc=delivery_utc,
        target_delivery_time_local=format_local_timestamp(delivery_utc),
        settlement_date=settlement_date,
        settlement_period=settlement_period,
        actual_generation_mw=actual_mw,
        selected_cutoff=cutoff,
        selected_cutoff_time=cutoff_time_utc,
        selected_cutoff_time_local=format_local_timestamp(cutoff_time_utc),
        selected_forecast_generation_mw=float(selected_rec.generation) if selected_rec else None,
        selected_forecast_publish_time=sel_pub_utc,
        selected_forecast_publish_time_local=format_local_timestamp(sel_pub_utc) if sel_pub_utc else None,
        latest_forecast_generation_mw=float(latest_rec.generation) if latest_rec else None,
        latest_forecast_publish_time=lat_pub_utc,
        latest_forecast_publish_time_local=format_local_timestamp(lat_pub_utc) if lat_pub_utc else None,
        forecast_publications=publications,
        total_publications=len(publications),
        is_demonstration_mode=is_demo
    )
