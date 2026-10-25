from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FuelHHRecord(BaseModel):
    """Elexon BMRS FUELHH record representing half-hourly generation outturn by fuel type."""
    dataset: str = "FUELHH"
    publishTime: datetime
    startTime: datetime
    settlementDate: str
    settlementPeriod: int
    fuelType: str
    generation: Optional[float] = None

    class Config:
        populate_by_name = True


class WindforRecord(BaseModel):
    """Elexon BMRS WINDFOR record representing wind generation forecast."""
    dataset: str = "WINDFOR"
    publishTime: datetime
    startTime: datetime
    generation: Optional[float] = None

    class Config:
        populate_by_name = True
