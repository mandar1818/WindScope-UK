import os
import json
import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Tuple, Optional, Dict, Any
import httpx

from app.core.config import settings
from app.core.logging import logger
from app.models.elexon import FuelHHRecord, WindforRecord
from app.services.demo_data_provider import generate_demonstration_dataset

UTC_TZ = timezone.utc


class ElexonClient:
    """
    Client for interacting with the official Elexon BMRS Insights Solution API.
    
    Adheres to:
    - https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream
    - https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream
    
    Features:
    - Retries with exponential backoff for transient network issues.
    - Local file caching to prevent redundant upstream API requests.
    - Explicit demonstration fallback mode if upstream is unreachable.
    """
    def __init__(self):
        self.base_url = settings.ELEXON_BASE_URL.rstrip("/")
        self.timeout = settings.ELEXON_TIMEOUT_SECONDS
        self.max_retries = settings.ELEXON_MAX_RETRIES
        self.cache_dir = Path(settings.CACHE_DIR)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.headers = {
            "User-Agent": "WindScopeUK-Analytics/1.0 (Day-Ahead Trading Utility)",
            "Accept": "application/json"
        }

    def _get_cache_path(self, cache_key: str) -> Path:
        safe_key = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in cache_key)
        return self.cache_dir / f"{safe_key}.json"

    def _load_cache(self, cache_key: str) -> Optional[List[Dict[str, Any]]]:
        cache_file = self._get_cache_path(cache_key)
        if cache_file.exists():
            try:
                # Check age if needed, or use historical immutability
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    logger.info(f"Loaded {len(data)} records from cache: {cache_file.name}")
                    return data
            except Exception as e:
                logger.warning(f"Failed to read cache file {cache_file}: {e}")
        return None

    def _save_cache(self, cache_key: str, data: List[Dict[str, Any]]) -> None:
        cache_file = self._get_cache_path(cache_key)
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f)
            logger.info(f"Saved {len(data)} records to cache: {cache_file.name}")
        except Exception as e:
            logger.warning(f"Failed to write cache file {cache_file}: {e}")

    async def _fetch_with_retries(self, url: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes GET request with exponential backoff retries."""
        last_exception = None
        
        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
                    logger.info(f"Requesting Elexon API (Attempt {attempt}/{self.max_retries}): {url} with params {params}")
                    resp = await client.get(url, params=params)
                    
                    if resp.status_code == 200:
                        payload = resp.json()
                        if isinstance(payload, list):
                            return payload
                        elif isinstance(payload, dict) and "data" in payload:
                            return payload["data"]
                        else:
                            return []
                    elif resp.status_code in (429, 500, 502, 503, 504):
                        logger.warning(f"Elexon API returned status {resp.status_code} on attempt {attempt}")
                        if attempt == self.max_retries:
                            resp.raise_for_status()
                    else:
                        resp.raise_for_status()
            except (httpx.RequestError, httpx.HTTPStatusError) as exc:
                last_exception = exc
                logger.warning(f"Elexon API attempt {attempt} failed: {exc}")
                if attempt < self.max_retries:
                    backoff = settings.ELEXON_RETRY_BACKOFF_FACTOR * (2 ** (attempt - 1))
                    await asyncio.sleep(backoff)
                else:
                    raise last_exception
                    
        raise last_exception or RuntimeError("Failed to fetch from Elexon API")

    async def fetch_fuelhh_actuals(
        self, 
        settlement_date_from: str, 
        settlement_date_to: str
    ) -> List[FuelHHRecord]:
        """
        Fetches actual wind generation outturn from Elexon BMRS FUELHH stream endpoint.
        Filters strictly to fuelType = WIND.
        """
        cache_key = f"fuelhh_{settlement_date_from}_{settlement_date_to}"
        cached_data = self._load_cache(cache_key)
        
        if cached_data is None:
            url = f"{self.base_url}/datasets/FUELHH/stream"
            params = {
                "settlementDateFrom": settlement_date_from,
                "settlementDateTo": settlement_date_to,
                "fuelType": "WIND"
            }
            raw_items = await self._fetch_with_retries(url, params)
            self._save_cache(cache_key, raw_items)
        else:
            raw_items = cached_data

        records: List[FuelHHRecord] = []
        for item in raw_items:
            try:
                # Filter fuelType if not already filtered
                if str(item.get("fuelType", "")).upper() == "WIND":
                    records.append(FuelHHRecord.model_validate(item))
            except Exception as e:
                logger.debug(f"Skipping malformed FUELHH record: {e}")
                
        return records

    async def fetch_windfor_forecasts(
        self, 
        publish_from: datetime, 
        publish_to: datetime
    ) -> List[WindforRecord]:
        """
        Fetches wind generation forecasts from Elexon BMRS WINDFOR stream endpoint.
        """
        from_str = publish_from.strftime("%Y-%m-%dT%H:%M:%SZ")
        to_str = publish_to.strftime("%Y-%m-%dT%H:%M:%SZ")
        cache_key = f"windfor_{from_str}_{to_str}"
        cached_data = self._load_cache(cache_key)
        
        if cached_data is None:
            url = f"{self.base_url}/datasets/WINDFOR/stream"
            params = {
                "publishDateTimeFrom": from_str,
                "publishDateTimeTo": to_str
            }
            raw_items = await self._fetch_with_retries(url, params)
            self._save_cache(cache_key, raw_items)
        else:
            raw_items = cached_data

        records: List[WindforRecord] = []
        for item in raw_items:
            try:
                records.append(WindforRecord.model_validate(item))
            except Exception as e:
                logger.debug(f"Skipping malformed WINDFOR record: {e}")
                
        return records

    async def fetch_data_for_date(
        self, 
        settlement_date: str,
        allow_demo_fallback: Optional[bool] = None
    ) -> Tuple[List[FuelHHRecord], List[WindforRecord], bool, Optional[str]]:
        """
        Retrieves actuals (FUELHH) and forecasts (WINDFOR) required to evaluate a settlement date.
        
        To evaluate delivery periods on date D:
        - Actuals: settlementDateFrom = D, settlementDateTo = D
        - Forecasts: published from D-2 00:00:00Z to D 23:59:59Z (covers Day-Ahead & Intraday publications)
        
        Returns:
            Tuple of (actuals, forecasts, is_demonstration_mode, notice_message)
        """
        fallback_enabled = allow_demo_fallback if allow_demo_fallback is not None else settings.ALLOW_DEMO_FALLBACK
        dt_target = datetime.strptime(settlement_date, "%Y-%m-%d").replace(tzinfo=UTC_TZ)
        pub_from = dt_target - timedelta(days=2)
        pub_to = dt_target + timedelta(days=1, hours=4)
        
        try:
            actuals_task = self.fetch_fuelhh_actuals(settlement_date, settlement_date)
            forecasts_task = self.fetch_windfor_forecasts(pub_from, pub_to)
            actuals, forecasts = await asyncio.gather(actuals_task, forecasts_task)
            
            logger.info(f"Retrieved {len(actuals)} FUELHH actuals and {len(forecasts)} WINDFOR forecasts for {settlement_date}")
            return actuals, forecasts, False, None
            
        except Exception as exc:
            logger.error(f"Elexon API live retrieval failed for {settlement_date}: {exc}")
            if fallback_enabled:
                logger.warning(f"Activating DEMONSTRATION MODE fallback for {settlement_date}")
                demo_actuals, demo_forecasts = generate_demonstration_dataset(settlement_date)
                notice = (
                    "DEMONSTRATION MODE: The live Elexon BMRS API could not be reached or returned an error. "
                    "Displaying synthetic benchmark observations for demonstration and UI testing only. "
                    "These records are NOT live Elexon observations."
                )
                return demo_actuals, demo_forecasts, True, notice
            else:
                raise exc

    async def check_api_health(self) -> bool:
        """Lightweight health check against Elexon API."""
        try:
            url = f"{self.base_url}/datasets/FUELHH/stream"
            params = {
                "settlementDateFrom": "2026-01-15",
                "settlementDateTo": "2026-01-15",
                "fuelType": "WIND"
            }
            async with httpx.AsyncClient(timeout=5.0, headers=self.headers) as client:
                resp = await client.get(url, params=params)
                return resp.status_code == 200
        except Exception:
            return False


elexon_client = ElexonClient()
