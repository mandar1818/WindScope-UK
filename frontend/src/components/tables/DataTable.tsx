import React, { useState } from 'react';
import { PairedGenerationPoint } from '../../types/api';
import {
  Download,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DataTableProps {
  points: PairedGenerationPoint[];
  title?: string;
}

type SortField = 'settlement_period' | 'actual_generation_mw' | 'forecast_generation_mw' | 'error_mw';
type SortOrder = 'asc' | 'desc';

export const DataTable: React.FC<DataTableProps> = ({
  points,
  title = 'Half-Hourly Generation & Forecast Observations (30-Minute Resolution)',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'MISSING_FORECAST' | 'MISSING_ACTUAL'>('ALL');
  const [sortField, setSortField] = useState<SortField>('settlement_period');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredPoints = points.filter((p) => {
    const matchesSearch =
      p.settlement_date.includes(searchTerm) ||
      p.start_time_local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.settlement_period).includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedPoints = [...filteredPoints].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal === null || aVal === undefined) aVal = -999999;
    if (bVal === null || bVal === undefined) bVal = -999999;
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedPoints.length / pageSize) || 1;
  const paginatedPoints = sortedPoints.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const headers = [
      'Settlement Date',
      'Settlement Period',
      'Delivery Time (London)',
      'Delivery Time (UTC)',
      'Actual Wind Generation (MW)',
      'Selected Forecast (MW)',
      'Forecast Publish Time (London)',
      'Decision Cutoff Applied (London)',
      'Forecast Error (MW)',
      'Status',
    ];

    const rows = sortedPoints.map((p) => [
      p.settlement_date,
      p.settlement_period,
      `"${p.start_time_local}"`,
      `"${p.start_time}"`,
      p.actual_generation_mw ?? '',
      p.forecast_generation_mw ?? '',
      `"${p.forecast_publish_time_local ?? ''}"`,
      `"${p.decision_cutoff_time_local}"`,
      p.error_mw ?? '',
      p.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `windscope_observations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-lg border border-nature-border bg-white overflow-hidden space-y-0 shadow-sm">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-nature-border flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-nature-bg">
        <div>
          <h3 className="text-sm font-semibold text-nature-text">{title}</h3>
          <p className="text-xs text-nature-muted mt-0.5">
            Matched FUELHH metered outturn and WINDFOR point-in-time submissions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-nature-muted" />
            <input
              type="text"
              placeholder="Search SP, time..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-nature-border rounded-md pl-8 pr-2.5 py-1 text-xs text-nature-text placeholder-nature-muted focus:outline-none focus:border-nature-forest font-sans w-36 sm:w-44 shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-white border border-nature-border rounded-md p-0.5 text-xs font-mono shadow-xs">
            {(['ALL', 'VALID', 'MISSING_FORECAST'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  statusFilter === st
                    ? 'bg-nature-forest text-white font-medium shadow-xs'
                    : 'text-nature-muted hover:text-nature-text'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'VALID' ? 'Valid' : 'Missing Fc'}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCsv}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-nature-forest hover:bg-nature-forest-hover text-white text-xs font-sans transition-colors shadow-sm"
            title="Download CSV file of displayed observations"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-nature-bg text-nature-muted border-b border-nature-border">
            <tr>
              <th
                onClick={() => handleSort('settlement_period')}
                className="py-2.5 px-3 font-medium text-[11px] cursor-pointer hover:text-nature-text select-none"
              >
                <div className="flex items-center space-x-1">
                  <span>SP</span>
                  <ArrowUpDown className="w-3 h-3 text-nature-muted" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-medium text-[11px]">Delivery Time (London)</th>
              <th className="py-2.5 px-3 font-medium text-[11px]">Delivery Time (UTC)</th>
              <th
                onClick={() => handleSort('actual_generation_mw')}
                className="py-2.5 px-3 font-medium text-[11px] text-right cursor-pointer hover:text-nature-text select-none text-nature-actual"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Actual (MW)</span>
                  <ArrowUpDown className="w-3 h-3 text-nature-muted" />
                </div>
              </th>
              <th
                onClick={() => handleSort('forecast_generation_mw')}
                className="py-2.5 px-3 font-medium text-[11px] text-right cursor-pointer hover:text-nature-text select-none text-nature-forecast"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Forecast (MW)</span>
                  <ArrowUpDown className="w-3 h-3 text-nature-muted" />
                </div>
              </th>
              <th
                onClick={() => handleSort('error_mw')}
                className="py-2.5 px-3 font-medium text-[11px] text-right cursor-pointer hover:text-nature-text select-none"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Error (MW)</span>
                  <ArrowUpDown className="w-3 h-3 text-nature-muted" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-medium text-[11px]">Forecast Published</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nature-border">
            {paginatedPoints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-nature-muted italic">
                  No matching settlement observations found.
                </td>
              </tr>
            ) : (
              paginatedPoints.map((p) => {
                const err = p.error_mw;
                return (
                  <tr key={p.settlement_period} className="hover:bg-nature-bg/60 transition-colors">
                    <td className="py-2 px-3 font-bold text-nature-text tabular-nums">
                      {p.settlement_period}
                    </td>
                    <td className="py-2 px-3 text-nature-text font-sans">
                      {p.start_time_local}
                    </td>
                    <td className="py-2 px-3 text-nature-muted text-[11px]">
                      {p.start_time}
                    </td>
                    <td className="py-2 px-3 text-right text-nature-actual font-bold tabular-nums">
                      {p.actual_generation_mw !== null ? `${p.actual_generation_mw.toLocaleString()} MW` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-nature-forecast font-bold tabular-nums">
                      {p.forecast_generation_mw !== null ? `${p.forecast_generation_mw.toLocaleString()} MW` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">
                      {err !== null ? (
                        <span className={err > 0 ? 'text-nature-risk' : err < 0 ? 'text-nature-forecast' : 'text-nature-muted'}>
                          {err > 0 ? `+` : ''}{err.toLocaleString()} MW
                        </span>
                      ) : (
                        <span className="text-nature-muted/60">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-nature-muted text-[11px]">
                      {p.forecast_publish_time_local || 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {p.is_valid_pair ? (
                        <span className="inline-flex items-center text-nature-actual text-[11px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> VALID
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-nature-risk text-[11px]">
                          <AlertTriangle className="w-3 h-3 mr-1" /> {p.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-nature-border flex items-center justify-between text-xs text-nature-muted font-mono bg-nature-bg">
        <div>
          Showing {paginatedPoints.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, sortedPoints.length)} of {sortedPoints.length} records
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-1 rounded-md bg-white text-nature-text hover:bg-nature-bg disabled:opacity-30 disabled:cursor-not-allowed border border-nature-border shadow-xs"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-1 rounded-md bg-white text-nature-text hover:bg-nature-bg disabled:opacity-30 disabled:cursor-not-allowed border border-nature-border shadow-xs"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
