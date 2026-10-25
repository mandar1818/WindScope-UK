import React, { useState, useEffect } from 'react';
import { GenerationResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { DataTable } from '../components/tables/DataTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

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
      setError(err?.message || 'Failed to load observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate, selectedCutoff);
  }, [selectedDate, selectedCutoff]);

  return (
    <div className="space-y-6">
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

      {loading && <LoadingSpinner message="Querying half-hourly delivery records..." />}
      {error && <ErrorAlert title="Data Explorer Error" message={error} />}

      {!loading && data && (
        <DataTable
          points={data.points}
          title={`Delivery Observations for ${data.settlement_date} (${data.cutoff_info.name})`}
        />
      )}
    </div>
  );
};
