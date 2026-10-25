from enum import Enum
from typing import List
from pydantic_settings import BaseSettings


class CutoffType(str, Enum):
    DAY_AHEAD_1100 = "day_ahead_1100"   # Day D-1 at 11:00 London time (Day-Ahead Power Exchange auction deadline)
    DAY_AHEAD_1200 = "day_ahead_1200"   # Day D-1 at 12:00 London time (Noon cutoff)
    DAY_AHEAD_1700 = "day_ahead_1700"   # Day D-1 at 17:00 London time (Physical Notification / evening freeze)
    GATE_CLOSURE_1H = "gate_closure_1h"  # Intraday Gate Closure: 1 hour before delivery start
    GATE_CLOSURE_2H = "gate_closure_2h"  # Intraday 2 hours before delivery start


class Settings(BaseSettings):
    PROJECT_NAME: str = "WindScope UK"
    API_V1_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    # Elexon BMRS Insights Solution API Configuration
    ELEXON_BASE_URL: str = "https://data.elexon.co.uk/bmrs/api/v1"
    ELEXON_TIMEOUT_SECONDS: float = 30.0
    ELEXON_MAX_RETRIES: int = 3
    ELEXON_RETRY_BACKOFF_FACTOR: float = 0.5

    # Evaluation scope constraints
    TARGET_YEAR: int = 2026
    TARGET_MONTH: int = 1
    DEFAULT_DATE: str = "2026-01-15"
    DEFAULT_CUTOFF: CutoffType = CutoffType.DAY_AHEAD_1100
    MARKET_TIMEZONE: str = "Europe/London"

    # Local Cache Configuration (in-memory & disk cache)
    CACHE_DIR: str = ".cache"
    CACHE_TTL_SECONDS: int = 3600  # 1 hour cache for historical API payloads

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "*"
    ]

    # Explicit Demo fallback mode if external API is unreachable
    ALLOW_DEMO_FALLBACK: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
