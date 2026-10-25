from enum import Enum
from pydantic import BaseModel, Field


class CutoffType(str, Enum):
    DAY_AHEAD_1100 = "day_ahead_1100"   # Day D-1 at 11:00 London local time (EPEX/Nord Pool GB auction order book closure)
    DAY_AHEAD_1200 = "day_ahead_1200"   # Day D-1 at 12:00 London local time (Noon cutoff)
    DAY_AHEAD_1700 = "day_ahead_1700"   # Day D-1 at 17:00 London local time (Evening schedule freeze / PN submission)
    GATE_CLOSURE_1H = "gate_closure_1h"  # Intraday Gate Closure: exactly 1 hour prior to settlement period start
    GATE_CLOSURE_2H = "gate_closure_2h"  # Intraday 2 hours prior to settlement period start


class CutoffDescription(BaseModel):
    id: CutoffType
    name: str
    description: str
    market_relevance: str


AVAILABLE_CUTOFFS = [
    CutoffDescription(
        id=CutoffType.DAY_AHEAD_1100,
        name="Day-Ahead 11:00 London Time (Auction Closure)",
        description="Forecasts published before 11:00 GMT on the calendar day prior to delivery (D-1).",
        market_relevance="The standard gate closure for Great Britain Day-Ahead Power Exchange auctions (EPEX SPOT and Nord Pool). Crucial for primary day-ahead procurement decisions."
    ),
    CutoffDescription(
        id=CutoffType.DAY_AHEAD_1200,
        name="Day-Ahead 12:00 London Time (Noon Cutoff)",
        description="Forecasts published before 12:00 GMT on the day prior to delivery (D-1).",
        market_relevance="Used for secondary auction clearing and midday hedging adjustments."
    ),
    CutoffDescription(
        id=CutoffType.DAY_AHEAD_1700,
        name="Day-Ahead 17:00 London Time (Evening Freeze)",
        description="Forecasts published before 17:00 GMT on the day prior to delivery (D-1).",
        market_relevance="Pre-Physical Notification (PN) horizon freeze; sets final day-ahead thermal dispatch commitments."
    ),
    CutoffDescription(
        id=CutoffType.GATE_CLOSURE_1H,
        name="Intraday Gate Closure (1 Hour Ahead)",
        description="Forecasts published at least 60 minutes before the start of each individual settlement period.",
        market_relevance="The statutory BSC Gate Closure in GB, after which bilateral contract notifications cannot be submitted."
    ),
    CutoffDescription(
        id=CutoffType.GATE_CLOSURE_2H,
        name="Intraday 2 Hours Ahead",
        description="Forecasts published at least 120 minutes before each individual settlement period.",
        market_relevance="Intraday continuous trading benchmark window for balancing and battery/storage dispatch."
    ),
]
