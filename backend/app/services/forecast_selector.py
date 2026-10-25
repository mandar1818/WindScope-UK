from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import List, Dict, Tuple, Optional, Any
import pandas as pd

from app.models.cutoff import CutoffType
from app.models.elexon import FuelHHRecord, WindforRecord
from app.models.generation import PairedGenerationPoint, ForecastPublication

LONDON_TZ = ZoneInfo("Europe/London")
UTC_TZ = timezone.utc


def parse_to_utc(dt_val: Any) -> datetime:
    """Safely converts various datetime inputs or ISO strings to UTC datetime."""
    if isinstance(dt_val, str):
        # Handle trailing Z or offsets
        dt_val = dt_val.replace("Z", "+00:00")
        dt = datetime.fromisoformat(dt_val)
    elif isinstance(dt_val, datetime):
        dt = dt_val
    else:
        dt = pd.to_datetime(dt_val).to_pydatetime()
    
    if dt.tzinfo is None:
        return dt.replace(tzinfo=UTC_TZ)
    return dt.astimezone(UTC_TZ)


def calculate_decision_cutoff_time(delivery_start_utc: datetime, cutoff_type: CutoffType) -> datetime:
    """
    Computes the exact UTC decision cutoff timestamp for a specific delivery period.
    
    Prevents look-ahead bias by establishing the definitive historical boundary:
    any forecast published after this timestamp is strictly excluded from point-in-time evaluation.
    
    Cutoff Rules:
    - DAY_AHEAD_1100: Day D-1 at 11:00 London local time (EPEX/Nord Pool GB auction deadline).
    - DAY_AHEAD_1200: Day D-1 at 12:00 London local time (Midday auction deadline).
    - DAY_AHEAD_1700: Day D-1 at 17:00 London local time (Physical notification freeze).
    - GATE_CLOSURE_1H: 1 hour prior to settlement period start (startTime - 60m).
    - GATE_CLOSURE_2H: 2 hours prior to settlement period start (startTime - 120m).
    """
    delivery_utc = parse_to_utc(delivery_start_utc)
    delivery_london = delivery_utc.astimezone(LONDON_TZ)
    
    if cutoff_type in (CutoffType.DAY_AHEAD_1100, CutoffType.DAY_AHEAD_1200, CutoffType.DAY_AHEAD_1700):
        # Find calendar delivery date in London local time
        delivery_date = delivery_london.date()
        day_before = delivery_date - timedelta(days=1)
        
        if cutoff_type == CutoffType.DAY_AHEAD_1100:
            target_hour = 11
        elif cutoff_type == CutoffType.DAY_AHEAD_1200:
            target_hour = 12
        else: # DAY_AHEAD_1700
            target_hour = 17
            
        cutoff_london = datetime(
            year=day_before.year,
            month=day_before.month,
            day=day_before.day,
            hour=target_hour,
            minute=0,
            second=0,
            microsecond=0,
            tzinfo=LONDON_TZ
        )
        return cutoff_london.astimezone(UTC_TZ)
        
    elif cutoff_type == CutoffType.GATE_CLOSURE_1H:
        return delivery_utc - timedelta(hours=1)
    elif cutoff_type == CutoffType.GATE_CLOSURE_2H:
        return delivery_utc - timedelta(hours=2)
    else:
        # Default fallback to Day-Ahead 11:00
        return calculate_decision_cutoff_time(delivery_start_utc, CutoffType.DAY_AHEAD_1100)


def format_local_timestamp(dt_utc: Optional[datetime]) -> str:
    """Formats a UTC datetime into an informative London local time string."""
    if dt_utc is None:
        return "N/A"
    dt = parse_to_utc(dt_utc).astimezone(LONDON_TZ)
    tz_abbrev = "BST" if dt.dst() else "GMT"
    return dt.strftime(f"%Y-%m-%d %H:%M {tz_abbrev}")


def classify_procurement_impact(error_mw: Optional[float], tolerance_mw: float = 25.0) -> Optional[str]:
    """
    Categorizes the physical market exposure caused by the forecast error.
    
    Sign Convention: Error = Forecast - Actual.
    - If Error > +25 MW: Overforecasting. The utility expected more wind than materialized.
      In day-ahead markets, the utility may have under-procured thermal/hedges or over-sold wind,
      creating a SHORT physical position in the Balancing Mechanism (exposed to System Buy Price).
    - If Error < -25 MW: Underforecasting. The utility expected less wind than materialized.
      The utility over-procured alternative power, creating a LONG physical position (exposed to System Sell Price).
    - Within tolerance: BALANCED.
    """
    if error_mw is None:
        return None
    if error_mw > tolerance_mw:
        return "OVERFORECAST_SHORT_RISK"
    elif error_mw < -tolerance_mw:
        return "UNDERFORECAST_LONG_RISK"
    else:
        return "BALANCED"


def match_and_select_forecasts(
    actuals: List[FuelHHRecord],
    forecasts: List[WindforRecord],
    cutoff_type: CutoffType = CutoffType.DAY_AHEAD_1100
) -> List[PairedGenerationPoint]:
    """
    Core point-in-time forecast selection engine.
    
    For each delivery period in actuals:
    1. Identifies all forecasts submitted for that delivery period (startTime == delivery_start).
    2. Calculates the exact decision cutoff threshold for that period.
    3. Excludes all forecasts published after the cutoff threshold (publishTime > cutoff_time).
    4. Selects the latest eligible forecast by publishTime.
    5. Calculates forecast error (forecast - actual) and exposure implications.
    6. Returns paired observations with full auditability (publication timestamp, cutoff timestamp).
    """
    # Group forecasts by delivery start timestamp (in UTC)
    forecast_map: Dict[datetime, List[WindforRecord]] = {}
    for fc in forecasts:
        st_utc = parse_to_utc(fc.startTime)
        if st_utc not in forecast_map:
            forecast_map[st_utc] = []
        forecast_map[st_utc].append(fc)

    # Sort actuals chronologically by delivery start
    sorted_actuals = sorted(actuals, key=lambda a: parse_to_utc(a.startTime))
    
    paired_points: List[PairedGenerationPoint] = []
    
    for act in sorted_actuals:
        delivery_utc = parse_to_utc(act.startTime)
        cutoff_time_utc = calculate_decision_cutoff_time(delivery_utc, cutoff_type)
        
        candidate_forecasts = forecast_map.get(delivery_utc, [])
        
        # 1. Apply cutoff: exclude any forecast published strictly after cutoff
        eligible_forecasts = [
            f for f in candidate_forecasts 
            if parse_to_utc(f.publishTime) <= cutoff_time_utc
        ]
        
        selected_forecast: Optional[WindforRecord] = None
        if eligible_forecasts:
            # 2. Select the latest eligible forecast using publishTime
            # In case of duplicate publishTimes, pick highest generation or stable sort
            selected_forecast = max(
                eligible_forecasts, 
                key=lambda f: (parse_to_utc(f.publishTime), f.generation)
            )
            
        act_mw = float(act.generation) if act.generation is not None else None
        fc_mw = float(selected_forecast.generation) if selected_forecast is not None else None
        
        is_valid = (act_mw is not None) and (fc_mw is not None)
        
        error_mw = (fc_mw - act_mw) if is_valid else None
        abs_error_mw = abs(error_mw) if error_mw is not None else None
        
        status = "VALID"
        if act_mw is None and fc_mw is None:
            status = "INCOMPLETE"
        elif act_mw is None:
            status = "MISSING_ACTUAL"
        elif fc_mw is None:
            status = "MISSING_FORECAST"
            
        impact = classify_procurement_impact(error_mw)
        
        fc_pub_utc = parse_to_utc(selected_forecast.publishTime) if selected_forecast else None
        
        point = PairedGenerationPoint(
            start_time=delivery_utc,
            start_time_local=format_local_timestamp(delivery_utc),
            settlement_date=act.settlementDate,
            settlement_period=act.settlementPeriod,
            actual_generation_mw=act_mw,
            forecast_generation_mw=fc_mw,
            forecast_publish_time=fc_pub_utc,
            forecast_publish_time_local=format_local_timestamp(fc_pub_utc) if fc_pub_utc else None,
            decision_cutoff_time=cutoff_time_utc,
            decision_cutoff_time_local=format_local_timestamp(cutoff_time_utc),
            error_mw=round(error_mw, 2) if error_mw is not None else None,
            abs_error_mw=round(abs_error_mw, 2) if abs_error_mw is not None else None,
            is_valid_pair=is_valid,
            status=status,
            procurement_impact=impact
        )
        paired_points.append(point)
        
    return paired_points


def build_forecast_history(
    delivery_start_utc: datetime,
    actual_generation_mw: Optional[float],
    forecast_records: List[WindforRecord],
    cutoff_type: CutoffType = CutoffType.DAY_AHEAD_1100
) -> Tuple[Optional[WindforRecord], Optional[WindforRecord], List[ForecastPublication]]:
    """
    Builds the historical forecast progression ('forecast waterfall') for a specific delivery period.
    
    Identifies:
    1. The selected point-in-time forecast under the chosen decision cutoff.
    2. The latest forecast published right before delivery (or latest available now).
    3. The complete chronological sequence of published forecasts with lead times.
    """
    delivery_utc = parse_to_utc(delivery_start_utc)
    cutoff_time_utc = calculate_decision_cutoff_time(delivery_utc, cutoff_type)
    
    # Filter for forecasts targeting this delivery period
    period_forecasts = [
        f for f in forecast_records 
        if parse_to_utc(f.startTime) == delivery_utc
    ]
    
    # Sort chronologically by publishTime
    period_forecasts.sort(key=lambda f: parse_to_utc(f.publishTime))
    
    eligible = [
        f for f in period_forecasts 
        if parse_to_utc(f.publishTime) <= cutoff_time_utc
    ]
    selected_record = max(eligible, key=lambda f: parse_to_utc(f.publishTime)) if eligible else None
    
    latest_record = period_forecasts[-1] if period_forecasts else None
    
    publications: List[ForecastPublication] = []
    for f in period_forecasts:
        pub_utc = parse_to_utc(f.publishTime)
        lead_hours = (delivery_utc - pub_utc).total_seconds() / 3600.0
        is_eligible = pub_utc <= cutoff_time_utc
        is_sel = (selected_record is not None) and (f == selected_record)
        
        publications.append(
            ForecastPublication(
                publish_time=pub_utc,
                publish_time_local=format_local_timestamp(pub_utc),
                forecast_generation_mw=round(float(f.generation), 2),
                is_eligible_under_cutoff=is_eligible,
                is_selected=is_sel,
                lead_time_hours=round(lead_hours, 2)
            )
        )
        
    return selected_record, latest_record, publications
