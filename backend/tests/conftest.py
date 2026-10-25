import pytest
from datetime import datetime, timezone
from typing import List

from app.models.elexon import FuelHHRecord, WindforRecord

UTC = timezone.utc


@pytest.fixture
def sample_delivery_time() -> datetime:
    return datetime(2026, 1, 15, 14, 0, 0, tzinfo=UTC)


@pytest.fixture
def sample_actual_record(sample_delivery_time) -> FuelHHRecord:
    return FuelHHRecord(
        dataset="FUELHH",
        publishTime=datetime(2026, 1, 15, 15, 0, 0, tzinfo=UTC),
        startTime=sample_delivery_time,
        settlementDate="2026-01-15",
        settlementPeriod=29,
        fuelType="WIND",
        generation=15000.0
    )


@pytest.fixture
def sample_forecast_records(sample_delivery_time) -> List[WindforRecord]:
    """
    Multiple historical forecasts published for the same delivery period:
    Target Delivery Time: 2026-01-15 14:00:00 UTC
    Cutoff for Day-Ahead 11:00 is 2026-01-14 11:00:00 UTC.
    
    1. Early forecast: Published 2026-01-14 06:00:00 UTC -> 14,000 MW (Eligible for Day-Ahead 11:00)
    2. Latest eligible for 11:00: Published 2026-01-14 10:30:00 UTC -> 14,500 MW (Eligible for Day-Ahead 11:00)
    3. Published after 11:00: Published 2026-01-14 11:30:00 UTC -> 15,200 MW (Ineligible for 11:00, eligible for 12:00)
    4. Published afternoon: Published 2026-01-14 16:00:00 UTC -> 15,400 MW (Eligible for 17:00)
    5. Intraday forecast: Published 2026-01-15 12:30:00 UTC -> 14,900 MW (Eligible for Gate Closure 1h)
    6. Post-Gate Closure: Published 2026-01-15 13:45:00 UTC -> 15,100 MW (Ineligible for Gate Closure 1h)
    """
    return [
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 14, 6, 0, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=14000.0
        ),
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 14, 10, 30, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=14500.0
        ),
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 14, 11, 30, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=15200.0
        ),
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 14, 16, 0, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=15400.0
        ),
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 15, 12, 30, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=14900.0
        ),
        WindforRecord(
            dataset="WINDFOR",
            publishTime=datetime(2026, 1, 15, 13, 45, 0, tzinfo=UTC),
            startTime=sample_delivery_time,
            generation=15100.0
        ),
    ]
