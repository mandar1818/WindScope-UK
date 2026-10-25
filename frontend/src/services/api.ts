import {
  OverviewResponse,
  GenerationResponse,
  AccuracyResponse,
  ForecastHistoryResponse,
  DataStatusResponse,
  CutoffType
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.detail) {
        errMsg = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
      } else if (body.message) {
        errMsg = body.message;
      }
    } catch {
      // Non-json response
    }
    throw new ApiError(res.status, errMsg);
  }
  return res.json();
}

export const apiService = {
  async getOverview(
    settlementDate: string = '2026-01-15',
    cutoff: CutoffType = 'day_ahead_1100',
    demo?: boolean
  ): Promise<OverviewResponse> {
    const params = new URLSearchParams({
      settlement_date: settlementDate,
      cutoff: cutoff
    });
    if (demo !== undefined) {
      params.append('demo', String(demo));
    }
    const res = await fetch(`${API_BASE}/api/v1/overview?${params.toString()}`);
    return handleResponse<OverviewResponse>(res);
  },

  async getGeneration(
    settlementDate: string = '2026-01-15',
    cutoff: CutoffType = 'day_ahead_1100',
    demo?: boolean
  ): Promise<GenerationResponse> {
    const params = new URLSearchParams({
      settlement_date: settlementDate,
      cutoff: cutoff
    });
    if (demo !== undefined) {
      params.append('demo', String(demo));
    }
    const res = await fetch(`${API_BASE}/api/v1/generation?${params.toString()}`);
    return handleResponse<GenerationResponse>(res);
  },

  async getAccuracy(
    startDate: string = '2026-01-01',
    endDate: string = '2026-01-15',
    cutoff: CutoffType = 'day_ahead_1100',
    singleDate?: string,
    demo?: boolean
  ): Promise<AccuracyResponse> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      cutoff: cutoff
    });
    if (singleDate) {
      params.append('settlement_date', singleDate);
    }
    if (demo !== undefined) {
      params.append('demo', String(demo));
    }
    const res = await fetch(`${API_BASE}/api/v1/accuracy?${params.toString()}`);
    return handleResponse<AccuracyResponse>(res);
  },

  async getForecastHistory(
    deliveryTimeUtc: string,
    cutoff: CutoffType = 'day_ahead_1100',
    demo?: boolean
  ): Promise<ForecastHistoryResponse> {
    const params = new URLSearchParams({
      delivery_time: deliveryTimeUtc,
      cutoff: cutoff
    });
    if (demo !== undefined) {
      params.append('demo', String(demo));
    }
    const res = await fetch(`${API_BASE}/api/v1/forecast-history?${params.toString()}`);
    return handleResponse<ForecastHistoryResponse>(res);
  },

  async getDataStatus(): Promise<DataStatusResponse> {
    const res = await fetch(`${API_BASE}/api/v1/data-status`);
    return handleResponse<DataStatusResponse>(res);
  }
};
