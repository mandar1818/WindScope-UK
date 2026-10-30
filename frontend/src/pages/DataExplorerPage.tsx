import React, { useState, useEffect } from 'react';
import { GenerationResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { DataTable } from '../components/tables/DataTable';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { TableSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Database, Filter, Layers } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Control Header Ribbon */}
      <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-navy-800 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-accent-cyan border border-cyan-800">
                RAW DATA EXPLORER
              </span>
              <h2 className="text-base font-bold text-slate-100 tracking-wide font-sans">
                Half-Hourly Delivery Period Observations &amp; Export
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Inspect granular metered FUELHH actual generation paired with point-in-time selected WINDFOR forecasts
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-navy-950 border border-navy-800 text-slate-300">
              Query Date: <strong className="text-accent-teal">{selectedDate}</strong>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
