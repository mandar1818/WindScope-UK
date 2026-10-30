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
    <div className="rounded-lg border border-slate-800 bg-[#0e1526] overflow-hidden space-y-0">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-slate-900/60">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Matched FUELHH metered outturn and WINDFOR point-in-time submissions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search SP, time..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-700 rounded pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans w-36 sm:w-44"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-700 rounded p-0.5 text-xs font-mono">
            {(['ALL', 'VALID', 'MISSING_FORECAST'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'VALID' ? 'Valid' : 'Missing Fc'}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCsv}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-sans transition-colors"
            title="Download CSV file of displayed observations"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0a0f1d] text-slate-400 border-b border-slate-800">
            <tr>
              <th
                onClick={() => handleSort('settlement_period')}
                className="py-2.5 px-3 font-medium text-[11px] cursor-pointer hover:text-slate-200 select-none"
              >
                <div className="flex items-center space-x-1">
                  <span>SP</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-medium text-[11px]">Delivery Time (London)</th>
              <th className="py-2.5 px-3 font-medium text-[11px]">Delivery Time (UTC)</th>
              <th
                onClick={() => handleSort('actual_generation_mw')}
                className="py-2.5 px-3 font-medium text-[11px] text-right cursor-pointer hover:text-slate-200 select-none text-emerald-400"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Actual (MW)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('forecast_generation_mw')}
                className="py-2.5 px-3 font-medium text-[11px] text-right cursor-pointer hover:text-slate-200 select-none text-sky-400"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Forecast (MW)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th
                onClick={() => handleSort('error_mw')}
                className="py-2.5 px-3 font-medium text-[11px] text-right cursor-pointer hover:text-slate-200 select-none"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Error (MW)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-medium text-[11px]">Forecast Published</th>
              <th className="py-2.5 px-3 font-medium text-[11px] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {paginatedPoints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                  No matching settlement observations found.
                </td>
              </tr>
            ) : (
              paginatedPoints.map((p) => {
                const err = p.error_mw;
                return (
                  <tr key={p.settlement_period} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-300 tabular-nums">
                      {p.settlement_period}
                    </td>
                    <td className="py-2 px-3 text-slate-200 font-sans">
                      {p.start_time_local}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">
                      {p.start_time}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold tabular-nums">
                      {p.actual_generation_mw !== null ? `${p.actual_generation_mw.toLocaleString()} MW` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-sky-400 font-bold tabular-nums">
                      {p.forecast_generation_mw !== null ? `${p.forecast_generation_mw.toLocaleString()} MW` : '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">
                      {err !== null ? (
                        <span className={err > 0 ? 'text-amber-400' : err < 0 ? 'text-sky-300' : 'text-slate-400'}>
                          {err > 0 ? `+` : ''}{err.toLocaleString()} MW
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {p.forecast_publish_time_local || 'N/A'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {p.is_valid_pair ? (
                        <span className="inline-flex items-center text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> VALID
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-400 text-[11px]">
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
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/60">
        <div>
          Showing {paginatedPoints.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, sortedPoints.length)} of {sortedPoints.length} records
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
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
            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
