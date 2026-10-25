import React, { useState } from 'react';
import { PairedGenerationPoint } from '../../types/api';
import { Download, Search, Filter } from 'lucide-react';

interface DataTableProps {
  points: PairedGenerationPoint[];
  title?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  points,
  title = 'Half-Hourly Generation & Forecast Observations (30-Minute Resolution)'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'MISSING_FORECAST' | 'MISSING_ACTUAL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const filteredPoints = points.filter((p) => {
    const matchesSearch =
      p.settlement_date.includes(searchTerm) ||
      p.start_time_local.includes(searchTerm) ||
      String(p.settlement_period).includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPoints.length / pageSize) || 1;
  const paginatedPoints = filteredPoints.slice((page - 1) * pageSize, page * pageSize);

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
      'Status'
    ];

    const rows = filteredPoints.map((p) => [
      p.settlement_date,
      p.settlement_period,
      `"${p.start_time_local}"`,
      `"${p.start_time}"`,
      p.actual_generation_mw ?? '',
      p.forecast_generation_mw ?? '',
      `"${p.forecast_publish_time_local ?? ''}"`,
      `"${p.decision_cutoff_time_local}"`,
      p.error_mw ?? '',
      p.status
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
    <div className="rounded-xl border border-navy-700 bg-navy-900/90 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing matched FUELHH actual generation and WINDFOR point-in-time forecasts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search period or time..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="bg-navy-950 border border-navy-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-teal font-sans w-48"
            />
          </div>

          <div className="flex items-center space-x-1 bg-navy-950 border border-navy-700 rounded-md p-0.5">
            <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
            {(['ALL', 'VALID', 'MISSING_FORECAST'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2 py-1 text-[10px] font-mono rounded ${
                  statusFilter === st
                    ? 'bg-navy-800 text-accent-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-navy-800 hover:bg-navy-700 text-xs text-accent-teal font-medium border border-navy-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-navy-950/90 text-slate-400 border-b border-navy-800">
            <tr>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">SP</th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Delivery Time (GMT)</th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right text-emerald-400">Actual (MW)</th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right text-cyan-400">Forecast (MW)</th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-right">Error (MW)</th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Publication Timestamp</th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider">Cutoff Applied</th>
              <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60">
            {paginatedPoints.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 italic font-sans">
                  No matching observations found.
                </td>
              </tr>
            ) : (
              paginatedPoints.map((p, idx) => {
                const act = p.actual_generation_mw;
                const fc = p.forecast_generation_mw;
                const err = p.error_mw;

                return (
                  <tr key={`${p.settlement_date}-${p.settlement_period}-${idx}`} className="hover:bg-navy-800/40">
                    <td className="py-2 px-3 text-slate-300 font-bold">{p.settlement_period}</td>
                    <td className="py-2 px-3 text-slate-300 font-sans">{p.start_time_local}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">
                      {act !== null ? `${act.toLocaleString()} MW` : <span className="text-slate-600">Missing</span>}
                    </td>
                    <td className="py-2 px-3 text-right text-cyan-400 font-bold">
                      {fc !== null ? `${fc.toLocaleString()} MW` : <span className="text-slate-600">Missing</span>}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      {err !== null ? (
                        <span className={err > 0 ? 'text-amber-400' : err < 0 ? 'text-cyan-400' : 'text-slate-400'}>
                          {err > 0 ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {p.forecast_publish_time_local ?? <span className="text-slate-600">None</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{p.decision_cutoff_time_local}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'VALID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-3 bg-navy-950/80 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredPoints.length)} of {filteredPoints.length} observations
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed border border-navy-700"
            >
              Previous
            </button>
            <span className="px-2 font-bold text-slate-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed border border-navy-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
