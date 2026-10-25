import math
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import List

from app.models.elexon import FuelHHRecord, WindforRecord

LONDON_TZ = ZoneInfo("Europe/London")
UTC_TZ = timezone.utc


def generate_demonstration_dataset(
    settlement_date: str = "2026-01-15"
) -> tuple[List[FuelHHRecord], List[WindforRecord]]:
    """
    Generates synthetic benchmark data for offline demonstration or testing purposes ONLY.
    
    CRITICAL COMPLIANCE NOTICE:
    This function is strictly labelled as DEMONSTRATION MODE.
    These values are synthetic and must never be presented as real Elexon observations.
    """
    dt_base = datetime.strptime(settlement_date, "%Y-%m-%d").replace(tzinfo=UTC_TZ)
    
    actuals: List[FuelHHRecord] = []
    forecasts: List[WindforRecord] = []
    
    # 48 settlement periods in a day
    for sp in range(1, 49):
        # Delivery period start time
        period_start = dt_base + timedelta(minutes=(sp - 1) * 30)
        
        # Synthetic base generation profile (winter wind pattern: ~12,000 to 18,000 MW with diurnal curve)
        hour = (sp - 1) / 2.0
        base_wind = 14500.0 + 3500.0 * math.sin((hour - 4) * math.pi / 12.0) + 800.0 * math.cos(hour * math.pi / 6.0)
        actual_gen = max(1500.0, base_wind)
        
        actual_record = FuelHHRecord(
            dataset="FUELHH",
            publishTime=period_start + timedelta(minutes=45),
            startTime=period_start,
            settlementDate=settlement_date,
            settlementPeriod=sp,
            fuelType="WIND",
            generation=round(actual_gen, 2)
        )
        actuals.append(actual_record)
        
        # Historical forecasts published at different horizons:
        # Horizon 1: Day D-1 at 06:00 (Early morning before auction)
        pub_d1_0600 = (dt_base - timedelta(days=1)).replace(hour=6, minute=0, second=0)
        fc_early = actual_gen * 1.08 + 200.0 * math.sin(sp / 4.0)
        forecasts.append(WindforRecord(
            dataset="WINDFOR",
            publishTime=pub_d1_0600,
            startTime=period_start,
            generation=round(fc_early, 2)
        ))
        
        # Horizon 2: Day D-1 at 10:30 (Eligible for Day-Ahead 11:00 cutoff)
        pub_d1_1030 = (dt_base - timedelta(days=1)).replace(hour=10, minute=30, second=0)
        fc_da_eligible = actual_gen * 1.04 + 150.0 * math.cos(sp / 3.0)
        forecasts.append(WindforRecord(
            dataset="WINDFOR",
            publishTime=pub_d1_1030,
            startTime=period_start,
            generation=round(fc_da_eligible, 2)
        ))
        
        # Horizon 3: Day D-1 at 16:30 (Eligible for 17:00 cutoff, ineligible for 11:00/12:00 cutoff)
        pub_d1_1630 = (dt_base - timedelta(days=1)).replace(hour=16, minute=30, second=0)
        fc_evening = actual_gen * 1.02 + 100.0 * math.sin(sp / 2.0)
        forecasts.append(WindforRecord(
            dataset="WINDFOR",
            publishTime=pub_d1_1630,
            startTime=period_start,
            generation=round(fc_evening, 2)
        ))
        
        # Horizon 4: Day-of Intraday 3 hours before delivery (Eligible for Gate Closure 1h/2h, ineligible for Day-Ahead)
        pub_id_3h = period_start - timedelta(hours=3)
        fc_intraday = actual_gen * 1.01 + 50.0 * math.cos(sp / 2.0)
        forecasts.append(WindforRecord(
            dataset="WINDFOR",
            publishTime=pub_id_3h,
            startTime=period_start,
            generation=round(fc_intraday, 2)
        ))
        
        # Horizon 5: 30 minutes before delivery (Published after 1h Gate Closure - strictly ineligible for all cutoffs!)
        pub_late = period_start - timedelta(minutes=30)
        fc_late = actual_gen * 1.002
        forecasts.append(WindforRecord(
            dataset="WINDFOR",
            publishTime=pub_late,
            startTime=period_start,
            generation=round(fc_late, 2)
        ))
        
    return actuals, forecasts
