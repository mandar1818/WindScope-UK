import React, { useState } from 'react';
import { PairedGenerationPoint } from '../../types/api';
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
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
    link.setAttribute('download', `windscope_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] shadow-xl overflow-hidden space-y-0">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-navy-900/50">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Matched FUELHH actual metered generation and WINDFOR point-in-time forecasts
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
              className="bg-navy-950 border border-navy-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-teal font-sans w-40 sm:w-48"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-navy-950 border border-navy-700 rounded-md p-0.5 text-xs font-mono">
            {(['ALL', 'VALID', 'MISSING_FORECAST'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  statusFilter === st
                    ? 'bg-accent-teal text-navy-950 font-bold'
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
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-navy-800 hover:bg-navy-700 text-xs font-medium text-slate-200 border border-navy-700 transition-colors font-sans"
            title="Download complete filtered dataset as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#070d19] text-slate-400 border-b border-navy-800">
            <tr>
              <th
                onClick={() => handleSort('settlement_period')}
                className="py-2.5 px-3 font-semibold uppercase text-[10px] cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>SP</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Delivery Time (London GMT)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Delivery (UTC)</th>
              <th
                onClick={() => handleSort('actual_generation_mw')}
                className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right text-emerald-400 cursor-pointer hover:text-emerald-300 transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Actual Outturn</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('forecast_generation_mw')}
                className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Forecast</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px]">Forecast Published (GMT)</th>
              <th
                onClick={() => handleSort('error_mw')}
                className="py-2.5 px-3 font-semibold uppercase text-[10px] text-right cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Error (Fc - Act)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold uppercase text-[10px] text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-850">
            {paginatedPoints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 italic font-sans text-xs">
                  No delivery periods match the selected query or filters.
                </td>
              </tr>
            ) : (
              paginatedPoints.map((p) => {
                const err = p.error_mw;
                return (
                  <tr key={p.settlement_period} className="hover:bg-navy-850/50 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-300">{p.settlement_period}</td>
                    <td className="py-2 px-3 text-slate-200 font-sans">{p.start_time_local}</td>
                    <td className="py-2 px-3 text-slate-400">{p.start_time}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">
                      {p.actual_generation_mw !== null ? `${p.actual_generation_mw.toLocaleString()} MW` : 'Missing'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-cyan-400">
                      {p.forecast_generation_mw !== null ? `${p.forecast_generation_mw.toLocaleString()} MW` : 'Missing'}
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-sans">
                      {p.forecast_publish_time_local ?? 'None Eligible'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      {err !== null ? (
                        <span className={err > 0 ? 'text-amber-400' : err < 0 ? 'text-cyan-300' : 'text-slate-400'}>
                          {err > 0 ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {p.is_valid_pair ? (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-sans">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-sans">
                          <AlertTriangle className="w-3 h-3" /> {p.status}
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
      <div className="p-3 border-t border-navy-800 bg-[#070d19] flex items-center justify-between text-xs font-mono text-slate-400">
        <div>
          Showing {paginatedPoints.length > 0 ? (page - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(page * pageSize, sortedPoints.length)} of {sortedPoints.length} settlement periods
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded bg-navy-900 border border-navy-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-slate-300">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1 rounded bg-navy-900 border border-navy-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-navy-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
