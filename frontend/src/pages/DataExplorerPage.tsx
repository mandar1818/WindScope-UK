import React, { useState, useEffect } from 'react';
import { GenerationResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { DataTable } from '../components/tables/DataTable';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const DataExplorerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [selectedCutoff, setSelectedCutoff] = useState<CutoffType>('day_ahead_1100');
  const [data, setData] = useState<GenerationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (date: string, cutoff: CutoffType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getGeneration(date, cutoff);
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load observations from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate, selectedCutoff);
  }, [selectedDate, selectedCutoff]);

  return (
    <div className="space-y-4">
      {/* Control Header Ribbon */}
      <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Half-Hourly Settlement Observations &amp; Raw Data Export
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect granular metered FUELHH actual generation paired with point-in-time selected WINDFOR forecasts
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Delivery Date: <strong className="text-slate-100">{selectedDate}</strong>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <DateSelector
            selectedDate={selectedDate}
            onChange={setSelectedDate}
            disabled={loading}
          />
          <CutoffSelector
            selectedCutoff={selectedCutoff}
            onChange={setSelectedCutoff}
            disabled={loading}
          />
        </div>
      </div>

      {loading && <TableSkeleton rows={12} />}

      {error && !loading && (
        <ErrorAlert
          title="Data Explorer Error"
          message={error}
          onRetry={() => loadData(selectedDate, selectedCutoff)}
        />
      )}

      {!loading && !error && data && data.points.length === 0 && (
        <EmptyState
          title="No Delivery Observations Found"
          message={`No settlement records found for ${selectedDate} under cutoff ${data.cutoff_info.name}.`}
          actionLabel="Reload Observations"
          onAction={() => loadData(selectedDate, selectedCutoff)}
        />
      )}

      {!loading && !error && data && data.points.length > 0 && (
        <DataTable
          points={data.points}
          title={`Delivery Observations for ${data.settlement_date} (${data.cutoff_info.name})`}
        />
      )}
    </div>
  );
};
