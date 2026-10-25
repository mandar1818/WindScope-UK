import pytest
from datetime import datetime, timezone
import math

from app.models.generation import PairedGenerationPoint
from app.services.metrics_calculator import calculate_accuracy_metrics, calculate_daily_breakdown

UTC = timezone.utc


def create_point(
    actual: float | None, 
    forecast: float | None, 
    date: str = "2026-01-15", 
    sp: int = 1
) -> PairedGenerationPoint:
    dt = datetime(2026, 1, 15, (sp - 1) // 2, ((sp - 1) % 2) * 30, tzinfo=UTC)
    is_valid = (actual is not None) and (forecast is not None)
    err = (forecast - actual) if is_valid else None
    abs_err = abs(err) if err is not None else None
    
    return PairedGenerationPoint(
        start_time=dt,
        start_time_local=f"{date} {dt.strftime('%H:%M')} GMT",
        settlement_date=date,
        settlement_period=sp,
        actual_generation_mw=actual,
        forecast_generation_mw=forecast,
        forecast_publish_time=dt,
        forecast_publish_time_local=f"{date} {dt.strftime('%H:%M')} GMT",
        decision_cutoff_time=dt,
        decision_cutoff_time_local=f"{date} {dt.strftime('%H:%M')} GMT",
        error_mw=err,
        abs_error_mw=abs_err,
        is_valid_pair=is_valid,
        status="VALID" if is_valid else "INCOMPLETE"
    )


def test_standard_metrics_calculation():
    """
    Test standard accuracy calculations:
    Observation 1: Actual = 1000, Forecast = 1100 -> Error = +100, |Error| = 100, Error^2 = 10,000
    Observation 2: Actual = 2000, Forecast = 1800 -> Error = -200, |Error| = 200, Error^2 = 40,000
    
    MAE = (100 + 200) / 2 = 150.0 MW
    RMSE = sqrt((10000 + 40000) / 2) = sqrt(25000) = 158.11 MW
    WAPE = (300 / 3000) * 100 = 10.0 %
    Bias = (+100 - 200) / 2 = -50.0 MW (Underforecasting overall)
    """
    points = [
        create_point(1000.0, 1100.0, sp=1),
        create_point(2000.0, 1800.0, sp=2),
    ]
    metrics = calculate_accuracy_metrics(points)
    
    assert metrics.valid_observations == 2
    assert metrics.excluded_observations == 0
    assert metrics.mae_mw == 150.0
    assert metrics.rmse_mw == 158.11
    assert metrics.wape_percent == 10.0
    assert metrics.bias_mw == -50.0
    assert metrics.bias_direction == "UNDERFORECASTING"


def test_bias_sign_convention_overforecasting():
    """
    Sign convention check:
    When forecasts consistently exceed actuals, error is positive and bias is positive (OVERFORECASTING).
    """
    points = [
        create_point(5000.0, 5200.0, sp=1),  # +200
        create_point(6000.0, 6300.0, sp=2),  # +300
    ]
    metrics = calculate_accuracy_metrics(points)
    assert metrics.bias_mw == 250.0
    assert metrics.bias_direction == "OVERFORECASTING"


def test_wape_zero_denominator_safe():
    """
    Safe Zero Denominator Handling:
    If sum of actual generation is 0:
    - If forecast is also 0, error is 0 -> WAPE is safely 0.0.
    - If forecast is non-zero, WAPE returns None without crashing or returning NaN/Inf.
    """
    # Case A: Actuals = 0, Forecasts = 0
    zero_points = [
        create_point(0.0, 0.0, sp=1),
        create_point(0.0, 0.0, sp=2),
    ]
    m_zero = calculate_accuracy_metrics(zero_points)
    assert m_zero.wape_percent == 0.0
    assert not math.isnan(m_zero.wape_percent)
    
    # Case B: Actuals = 0, Forecasts = 50.0 (non-zero error, zero denominator)
    div_zero_points = [
        create_point(0.0, 50.0, sp=1),
    ]
    m_div = calculate_accuracy_metrics(div_zero_points)
    assert m_div.wape_percent is None  # Handled safely, never NaN or Inf


def test_missing_and_excluded_observations():
    """Ensures missing observations are correctly excluded from metric calculations."""
    points = [
        create_point(1000.0, 1100.0, sp=1),  # Valid: err = +100
        create_point(None, 1200.0, sp=2),    # Missing actual
        create_point(2000.0, None, sp=3),    # Missing forecast
        create_point(None, None, sp=4),      # Incomplete
    ]
    metrics = calculate_accuracy_metrics(points, total_target_periods=4)
    
    assert metrics.total_periods == 4
    assert metrics.valid_observations == 1
    assert metrics.excluded_observations == 3
    assert metrics.mae_mw == 100.0
    assert metrics.rmse_mw == 100.0
    assert metrics.wape_percent == 10.0


def test_empty_dataset():
    """Empty datasets must return None for metrics, never fail."""
    metrics = calculate_accuracy_metrics([])
    assert metrics.valid_observations == 0
    assert metrics.mae_mw is None
    assert metrics.rmse_mw is None
    assert metrics.wape_percent is None
    assert metrics.bias_mw is None
    assert metrics.bias_direction == "INSUFFICIENT_DATA"


def test_daily_accuracy_breakdown():
    """Daily breakdown groups by settlement_date correctly."""
    points = [
        create_point(1000.0, 1100.0, date="2026-01-14", sp=1),
        create_point(2000.0, 2000.0, date="2026-01-14", sp=2),
        create_point(5000.0, 4800.0, date="2026-01-15", sp=1),
    ]
    breakdown = calculate_daily_breakdown(points)
    assert len(breakdown) == 2
    
    # Jan 14
    assert breakdown[0].settlement_date == "2026-01-14"
    assert breakdown[0].valid_observations == 2
    assert breakdown[0].mae_mw == 50.0
    assert breakdown[0].bias_mw == 50.0
    
    # Jan 15
    assert breakdown[1].settlement_date == "2026-01-15"
    assert breakdown[1].valid_observations == 1
    assert breakdown[1].mae_mw == 200.0
    assert breakdown[1].bias_mw == -200.0
