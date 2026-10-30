import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { ExposureSummary, PairedGenerationPoint } from '../../types/api';

interface ProcurementExposureChartProps {
  exposure: ExposureSummary;
  generationPoints?: PairedGenerationPoint[];
  height?: number;
}

export const ProcurementExposureChart: React.FC<ProcurementExposureChartProps> = ({
  exposure,
  generationPoints,
  height = 240,
}) => {
  const [viewMode, setViewMode] = useState<'balance' | 'cumulative'>('balance');

  const barData = [
    {
      category: 'Overforecast (Short)',
      mwh: exposure.overforecast_energy_mwh,
      displayMwh: `+${exposure.overforecast_energy_mwh.toLocaleString()} MWh`,
      color: '#f59e0b',
      imbalance: 'Short Risk (System Buy Price purchases)',
    },
    {
      category: 'Underforecast (Long)',
      mwh: -exposure.underforecast_energy_mwh,
      displayMwh: `-${exposure.underforecast_energy_mwh.toLocaleString()} MWh`,
      color: '#38bdf8',
      imbalance: 'Long Risk (System Sell Price spill)',
    },
    {
      category: 'Net Day Imbalance',
      mwh: exposure.net_energy_variance_mwh,
      displayMwh: `${exposure.net_energy_variance_mwh > 0 ? '+' : ''}${exposure.net_energy_variance_mwh.toLocaleString()} MWh`,
      color: exposure.net_energy_variance_mwh >= 0 ? '#f97316' : '#0284c7',
      imbalance:
        exposure.net_energy_variance_mwh > 0
          ? 'Net Short Exposure'
          : exposure.net_energy_variance_mwh < 0
          ? 'Net Long Exposure'
          : 'Net Balanced Portfolio',
    },
  ];

  let cumulative = 0;
  const cumulativeData = (generationPoints || []).map((p) => {
    const errorMw = p.error_mw ?? 0;
    const intervalMwh = errorMw * 0.5;
    cumulative += intervalMwh;
    return {
      settlement_period: p.settlement_period,
      timeLabel: p.start_time_local.split(' ')[1]?.slice(0, 5) || `SP${p.settlement_period}`,
      intervalMwh: Math.round(intervalMwh * 10) / 10,
      cumulativeMwh: Math.round(cumulative * 10) / 10,
    };
  });

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
      {/* View Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="text-xs font-medium text-slate-300">
          {viewMode === 'balance'
            ? 'Energy Imbalance Volume Categories'
            : '48 Settlement Period Cumulative Imbalance Trajectory'}
        </span>

        {generationPoints && generationPoints.length > 0 && (
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setViewMode('balance')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                viewMode === 'balance'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                viewMode === 'cumulative'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trajectory
            </button>
          </div>
        )}
      </div>

      {/* Chart container */}
      <div style={{ width: '100%', height }}>
        {viewMode === 'balance' ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <BarChart data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(v) => `${v.toLocaleString()} MWh`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded border border-slate-700 bg-[#0c1322] p-2.5 shadow-xl text-xs font-mono space-y-1">
                        <div className="font-semibold text-slate-200 font-sans">{d.category}</div>
                        <div className="text-sm font-bold text-slate-100">{d.displayMwh}</div>
                        <div className="text-[11px] text-slate-400">{d.imbalance}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
              <Bar dataKey="mwh" barSize={36} isAnimationActive={false}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
            <AreaChart data={cumulativeData} margin={{ top: 10, right: 15, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                interval={3}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${v} MWh`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded border border-slate-700 bg-[#0c1322] p-2.5 shadow-xl text-xs font-mono space-y-1">
                        <div className="font-semibold text-slate-200 font-sans">
                          SP {d.settlement_period} &bull; {d.timeLabel}
                        </div>
                        <div className="text-slate-300">
                          Period Imbalance: <span className="font-bold">{d.intervalMwh} MWh</span>
                        </div>
                        <div className="text-sky-400 border-t border-slate-800 pt-1">
                          Cumulative Imbalance: <span className="font-bold">{d.cumulativeMwh} MWh</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="cumulativeMwh"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="#38bdf8"
                fillOpacity={0.1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
