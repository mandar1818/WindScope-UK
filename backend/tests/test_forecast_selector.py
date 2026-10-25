import pytest
from datetime import datetime, timezone

from app.models.cutoff import CutoffType
from app.models.elexon import FuelHHRecord, WindforRecord
from app.services.forecast_selector import (
    calculate_decision_cutoff_time,
    match_and_select_forecasts,
    build_forecast_history,
    classify_procurement_impact
)

UTC = timezone.utc


def test_cutoff_calculation():
    """Verify exact cutoff timestamp generation for different cutoff types."""
    delivery_utc = datetime(2026, 1, 15, 14, 0, 0, tzinfo=UTC)
    
    # Day-Ahead 11:00 London Time -> Day before at 11:00 UTC (Jan is GMT, UTC+0)
    cutoff_1100 = calculate_decision_cutoff_time(delivery_utc, CutoffType.DAY_AHEAD_1100)
    assert cutoff_1100 == datetime(2026, 1, 14, 11, 0, 0, tzinfo=UTC)
    
    # Day-Ahead 12:00 London Time
    cutoff_1200 = calculate_decision_cutoff_time(delivery_utc, CutoffType.DAY_AHEAD_1200)
    assert cutoff_1200 == datetime(2026, 1, 14, 12, 0, 0, tzinfo=UTC)
    
    # Day-Ahead 17:00 London Time
    cutoff_1700 = calculate_decision_cutoff_time(delivery_utc, CutoffType.DAY_AHEAD_1700)
    assert cutoff_1700 == datetime(2026, 1, 14, 17, 0, 0, tzinfo=UTC)
    
    # Gate Closure 1h (1 hour before delivery start)
    cutoff_gc1h = calculate_decision_cutoff_time(delivery_utc, CutoffType.GATE_CLOSURE_1H)
    assert cutoff_gc1h == datetime(2026, 1, 15, 13, 0, 0, tzinfo=UTC)
    
    # Gate Closure 2h (2 hours before delivery start)
    cutoff_gc2h = calculate_decision_cutoff_time(delivery_utc, CutoffType.GATE_CLOSURE_2H)
    assert cutoff_gc2h == datetime(2026, 1, 15, 12, 0, 0, tzinfo=UTC)


def test_forecast_selection_latest_eligible(sample_actual_record, sample_forecast_records):
    """
    Test that for Day-Ahead 11:00 cutoff:
    - Forecasts published at 06:00 and 10:30 are eligible.
    - The latest eligible forecast (10:30 at 14,500 MW) is selected.
    - Forecast published at 11:30 (after 11:00 cutoff) is strictly excluded (preventing look-ahead bias).
    """
    points = match_and_select_forecasts(
        [sample_actual_record],
        sample_forecast_records,
        cutoff_type=CutoffType.DAY_AHEAD_1100
    )
    
    assert len(points) == 1
    point = points[0]
    
    assert point.is_valid_pair is True
    assert point.status == "VALID"
    assert point.actual_generation_mw == 15000.0
    assert point.forecast_generation_mw == 14500.0
    assert point.forecast_publish_time == datetime(2026, 1, 14, 10, 30, 0, tzinfo=UTC)
    
    # Verify error sign convention: forecast - actual = 14500 - 15000 = -500 MW
    assert point.error_mw == -500.0
    assert point.abs_error_mw == 500.0
    assert point.procurement_impact == "UNDERFORECAST_LONG_RISK"


def test_forecast_selection_with_different_cutoffs(sample_actual_record, sample_forecast_records):
    """
    Verify cutoff sensitivity:
    - Day-Ahead 12:00 selects 11:30 publication (15,200 MW).
    - Day-Ahead 17:00 selects 16:00 publication (15,400 MW).
    - Gate Closure 1h selects 12:30 publication (14,900 MW, before 13:00 cutoff).
    """
    # 12:00 cutoff
    pts_1200 = match_and_select_forecasts([sample_actual_record], sample_forecast_records, CutoffType.DAY_AHEAD_1200)
    assert pts_1200[0].forecast_generation_mw == 15200.0
    assert pts_1200[0].forecast_publish_time == datetime(2026, 1, 14, 11, 30, 0, tzinfo=UTC)
    assert pts_1200[0].error_mw == 200.0
    assert pts_1200[0].procurement_impact == "OVERFORECAST_SHORT_RISK"
    
    # 17:00 cutoff
    pts_1700 = match_and_select_forecasts([sample_actual_record], sample_forecast_records, CutoffType.DAY_AHEAD_1700)
    assert pts_1700[0].forecast_generation_mw == 15400.0
    assert pts_1700[0].forecast_publish_time == datetime(2026, 1, 14, 16, 0, 0, tzinfo=UTC)
    
    # Gate Closure 1h
    pts_gc1h = match_and_select_forecasts([sample_actual_record], sample_forecast_records, CutoffType.GATE_CLOSURE_1H)
    assert pts_gc1h[0].forecast_generation_mw == 14900.0
    assert pts_gc1h[0].forecast_publish_time == datetime(2026, 1, 15, 12, 30, 0, tzinfo=UTC)


def test_missing_forecast_for_period(sample_actual_record):
    """If no forecast exists for the delivery period, status should be MISSING_FORECAST and error None."""
    points = match_and_select_forecasts([sample_actual_record], [], cutoff_type=CutoffType.DAY_AHEAD_1100)
    assert len(points) == 1
    p = points[0]
    assert p.is_valid_pair is False
    assert p.status == "MISSING_FORECAST"
    assert p.actual_generation_mw == 15000.0
    assert p.forecast_generation_mw is None
    assert p.error_mw is None


def test_missing_actual_for_period(sample_delivery_time, sample_forecast_records):
    """If actual is missing, status should be MISSING_ACTUAL and is_valid_pair False."""
    missing_act = FuelHHRecord(
        dataset="FUELHH",
        publishTime=sample_delivery_time,
        startTime=sample_delivery_time,
        settlementDate="2026-01-15",
        settlementPeriod=29,
        fuelType="WIND",
        generation=None  # Missing actual
    )
    points = match_and_select_forecasts([missing_act], sample_forecast_records, cutoff_type=CutoffType.DAY_AHEAD_1100)
    assert len(points) == 1
    p = points[0]
    assert p.is_valid_pair is False
    assert p.status == "MISSING_ACTUAL"
    assert p.actual_generation_mw is None
    assert p.forecast_generation_mw == 14500.0
    assert p.error_mw is None


def test_duplicate_forecast_records(sample_actual_record, sample_delivery_time):
    """Handles duplicate forecast publications stably."""
    dupes = [
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 14, 10, 0, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=14000.0
        ),
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 14, 10, 0, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=14200.0
        ),
    ]
    points = match_and_select_forecasts([sample_actual_record], dupes, cutoff_type=CutoffType.DAY_AHEAD_1100)
    assert len(points) == 1
    assert points[0].is_valid_pair is True
    assert points[0].forecast_generation_mw is not None


def test_forecast_waterfall_history(sample_delivery_time, sample_forecast_records):
    """Verifies that forecast history lists all versions and identifies selected vs latest."""
    sel_rec, lat_rec, publications = build_forecast_history(
        delivery_start_utc=sample_delivery_time,
        actual_generation_mw=15000.0,
        forecast_records=sample_forecast_records,
        cutoff_type=CutoffType.DAY_AHEAD_1100
    )
    
    assert len(publications) == 6
    # Selected is the 10:30 forecast
    assert sel_rec.generation == 14500.0
    # Latest is the 13:45 intraday forecast
    assert lat_rec.generation == 15100.0
    
    # Check flags in publication list
    selected_item = next(p for p in publications if p.is_selected)
    assert selected_item.forecast_generation_mw == 14500.0
    assert selected_item.is_eligible_under_cutoff is True
    
    ineligible_items = [p for p in publications if not p.is_eligible_under_cutoff]
    assert len(ineligible_items) == 4

