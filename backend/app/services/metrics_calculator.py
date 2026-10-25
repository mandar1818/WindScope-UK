import math
from typing import List, Dict, Optional, Tuple
import numpy as np
import pandas as pd

from app.models.generation import PairedGenerationPoint
from app.models.metrics import AccuracyMetrics, DailyAccuracyRecord


def calculate_accuracy_metrics(
    points: List[PairedGenerationPoint],
    total_target_periods: Optional[int] = None
) -> AccuracyMetrics:
    """
    Computes rigorous quantitative accuracy metrics on matched forecast-actual observations.
    
    Metrics:
    - MAE (Mean Absolute Error, MW): Mean of |forecast - actual|
    - RMSE (Root Mean Squared Error, MW): Sqrt of mean of (forecast - actual)^2
    - WAPE (Weighted Absolute Percentage Error, %): (Sum(|forecast - actual|) / Sum(|actual|)) * 100
    - Forecast Bias (MW): Mean of (forecast - actual). Positive = Overforecasting, Negative = Underforecasting
    
    Zero-Division Protection:
    - If total actual generation is 0 MW, WAPE is safely handled (0.0 if error is 0, None otherwise).
    - Never returns NaN or Infinity to API callers.
    
    Exclusions:
    - Missing actuals or missing forecasts are strictly excluded from calculation
      and accounted for in `excluded_observations`.
    """
    total_count = total_target_periods if total_target_periods is not None else len(points)
    
    # Filter to strictly valid pairs where both actual and forecast exist and are finite
    valid_points = [
        p for p in points 
        if p.is_valid_pair 
        and p.actual_generation_mw is not None 
        and p.forecast_generation_mw is not None
        and not math.isnan(p.actual_generation_mw)
        and not math.isnan(p.forecast_generation_mw)
    ]
    
    valid_count = len(valid_points)
    excluded_count = total_count - valid_count
    
    if valid_count == 0:
        return AccuracyMetrics(
            mae_mw=None,
            rmse_mw=None,
            wape_percent=None,
            bias_mw=None,
            mean_actual_mw=None,
            mean_forecast_mw=None,
            total_periods=total_count,
            valid_observations=0,
            excluded_observations=excluded_count,
            bias_direction="INSUFFICIENT_DATA",
            metric_calculation_notes="No valid matched forecast-actual observation pairs available for calculation."
        )
        
    actuals = np.array([p.actual_generation_mw for p in valid_points], dtype=np.float64)
    forecasts = np.array([p.forecast_generation_mw for p in valid_points], dtype=np.float64)
    
    # Sign convention: Error = Forecast - Actual
    errors = forecasts - actuals
    abs_errors = np.abs(errors)
    squared_errors = np.square(errors)
    
    mae = float(np.mean(abs_errors))
    rmse = float(np.sqrt(np.mean(squared_errors)))
    bias = float(np.mean(errors))
    
    mean_act = float(np.mean(actuals))
    mean_fc = float(np.mean(forecasts))
    
    # Safe WAPE calculation
    sum_abs_actual = float(np.sum(np.abs(actuals)))
    sum_abs_error = float(np.sum(abs_errors))
    
    if sum_abs_actual > 0.0:
        wape = float((sum_abs_error / sum_abs_actual) * 100.0)
        # Guard against float overflow/NaN
        if math.isnan(wape) or math.isinf(wape):
            wape = None
    else:
        # Sum of actual generation is zero
        if sum_abs_error == 0.0:
            wape = 0.0
        else:
            wape = None  # Undefined denominator with non-zero error, return None safely
            
    # Classify overall bias direction
    if bias > 25.0:
        bias_direction = "OVERFORECASTING"
    elif bias < -25.0:
        bias_direction = "UNDERFORECASTING"
    else:
        bias_direction = "UNBIASED"
        
    notes = (
        f"Calculated over {valid_count} valid 30-min settlement periods. "
        f"{excluded_count} periods excluded due to missing actuals or missing forecast. "
        "Error sign convention: Forecast - Actual (positive indicates wind overforecasting)."
    )
    
    return AccuracyMetrics(
        mae_mw=round(mae, 2) if mae is not None else None,
        rmse_mw=round(rmse, 2) if rmse is not None else None,
        wape_percent=round(wape, 2) if wape is not None else None,
        bias_mw=round(bias, 2) if bias is not None else None,
        mean_actual_mw=round(mean_act, 2) if mean_act is not None else None,
        mean_forecast_mw=round(mean_fc, 2) if mean_fc is not None else None,
        total_periods=total_count,
        valid_observations=valid_count,
        excluded_observations=excluded_count,
        bias_direction=bias_direction,
        metric_calculation_notes=notes
    )


def calculate_daily_breakdown(points: List[PairedGenerationPoint]) -> List[DailyAccuracyRecord]:
    """
    Computes daily accuracy metrics broken down by calendar settlement date.
    """
    # Group points by settlement date
    groups: Dict[str, List[PairedGenerationPoint]] = {}
    for p in points:
        date_key = p.settlement_date
        if date_key not in groups:
            groups[date_key] = []
        groups[date_key].append(p)
        
    daily_records: List[DailyAccuracyRecord] = []
    
    for date_str in sorted(groups.keys()):
        day_points = groups[date_str]
        metrics = calculate_accuracy_metrics(day_points, total_target_periods=len(day_points))
        
        daily_records.append(
            DailyAccuracyRecord(
                settlement_date=date_str,
                mae_mw=metrics.mae_mw,
                rmse_mw=metrics.rmse_mw,
                wape_percent=metrics.wape_percent,
                bias_mw=metrics.bias_mw,
                valid_observations=metrics.valid_observations,
                excluded_observations=metrics.excluded_observations,
                mean_actual_mw=metrics.mean_actual_mw,
                mean_forecast_mw=metrics.mean_forecast_mw
            )
        )
        
    return daily_records
