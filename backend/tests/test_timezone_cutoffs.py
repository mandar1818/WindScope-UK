import pytest
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from app.models.cutoff import CutoffType
from app.services.forecast_selector import (
    calculate_decision_cutoff_time,
    parse_to_utc,
    format_local_timestamp,
    LONDON_TZ,
    UTC_TZ
)


def test_parse_to_utc_formats():
    """Validates robust parsing of diverse timestamp strings to timezone-aware UTC datetimes."""
    # ISO string with Z
    dt1 = parse_to_utc("2026-01-15T12:00:00Z")
    assert dt1.tzinfo == UTC_TZ
    assert dt1.year == 2026 and dt1.month == 1 and dt1.day == 15 and dt1.hour == 12

    # ISO string with +00:00
    dt2 = parse_to_utc("2026-01-15T12:00:00+00:00")
    assert dt2 == dt1

    # Naive datetime is safely given UTC tzinfo
    naive = datetime(2026, 1, 15, 12, 0, 0)
    dt3 = parse_to_utc(naive)
    assert dt3.tzinfo == UTC_TZ
    assert dt3 == dt1


def test_london_timezone_format():
    """Verify Europe/London formatting correctly displays GMT during January."""
    dt_utc = datetime(2026, 1, 15, 12, 30, 0, tzinfo=UTC_TZ)
    formatted = format_local_timestamp(dt_utc)
    assert "2026-01-15 12:30 GMT" in formatted


def test_midnight_transition_cutoff():
    """
    Test delivery period just after midnight:
    Delivery at 2026-01-15 00:00:00 UTC (Settlement Period 1).
    Day-Ahead 11:00 cutoff should be 2026-01-14 11:00:00 UTC.
    """
    sp1_utc = datetime(2026, 1, 15, 0, 0, 0, tzinfo=UTC_TZ)
    cutoff = calculate_decision_cutoff_time(sp1_utc, CutoffType.DAY_AHEAD_1100)
    assert cutoff == datetime(2026, 1, 14, 11, 0, 0, tzinfo=UTC_TZ)


def test_end_of_day_transition_cutoff():
    """
    Test delivery period at 2026-01-15 23:30:00 UTC (Settlement Period 48).
    Day-Ahead 11:00 cutoff should still be 2026-01-14 11:00:00 UTC.
    """
    sp48_utc = datetime(2026, 1, 15, 23, 30, 0, tzinfo=UTC_TZ)
    cutoff = calculate_decision_cutoff_time(sp48_utc, CutoffType.DAY_AHEAD_1100)
    assert cutoff == datetime(2026, 1, 14, 11, 0, 0, tzinfo=UTC_TZ)

