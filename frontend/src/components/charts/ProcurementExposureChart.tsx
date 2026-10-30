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
import { Zap, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface ProcurementExposureChartProps {
  exposure: ExposureSummary;
  generationPoints?: PairedGenerationPoint[];
  height?: number;
}

export const ProcurementExposureChart: React.FC<ProcurementExposureChartProps> = ({
  exposure,
  generationPoints,
  height = 260,
}) => {
  const [viewMode, setViewMode] = useState<'balance' | 'cumulative'>('balance');

  // Bar chart data for the 3 energy variance metrics
  const barData = [
    {
      category: 'Overforecast',
      mwh: exposure.overforecast_energy_mwh,
      displayMwh: `+${exposure.overforecast_energy_mwh.toLocaleString()} MWh`,
      color: '#f59e0b', // amber
      type: 'Positive Deviation (Expected > Actual)',
      imbalance: 'Short Risk (System Buy Price exposure)',
    },
    {
      category: 'Underforecast',
      mwh: -exposure.underforecast_energy_mwh,
      displayMwh: `-${exposure.underforecast_energy_mwh.toLocaleString()} MWh`,
      color: '#06b6d4', // cyan
      type: 'Negative Deviation (Actual > Expected)',
      imbalance: 'Long Risk (System Sell Price spill)',
    },
    {
      category: 'Net Variance',
      mwh: exposure.net_energy_variance_mwh,
      displayMwh: `${exposure.net_energy_variance_mwh > 0 ? '+' : ''}${exposure.net_energy_variance_mwh.toLocaleString()} MWh`,
      color: exposure.net_energy_variance_mwh >= 0 ? '#f97316' : '#22d3ee',
      type: 'Net Day Imbalance Volume',
      imbalance:
        exposure.net_energy_variance_mwh > 0
          ? 'Net Short Portfolio Exposure'
          : exposure.net_energy_variance_mwh < 0
          ? 'Net Long Portfolio Exposure'
          : 'Net Balanced Portfolio',
    },
  ];

  // Cumulative trajectory across 48 settlement periods (0.5 hours per SP)
  let cumulative = 0;
  const cumulativeData = (generationPoints || []).map((p) => {
    const errorMw = p.error_mw ?? 0;
    const intervalMwh = errorMw * 0.5; // 30-minute interval = 0.5 hours
    cumulative += intervalMwh;
    return {
      settlement_period: p.settlement_period,
      timeLabel: p.start_time_local.split(' ')[1] || `SP${p.settlement_period}`,
      intervalMwh: Math.round(intervalMwh * 10) / 10,
      cumulativeMwh: Math.round(cumulative * 10) / 10,
    };
  });

  return (
    <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-5 shadow-lg space-y-3">
      {/* Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-navy-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-accent-cyan" />
            <h4 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
              Procurement Exposure Energy Balance
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Aggregate wind forecast deviations converted to physical imbalance energy (MWh)
          </p>
        </div>

        {generationPoints && generationPoints.length > 0 && (
          <div className="flex items-center space-x-1 bg-navy-950 p-1 rounded-md border border-navy-800 font-mono text-xs">
            <button
              onClick={() => setViewMode('balance')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'balance'
                  ? 'bg-accent-teal text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Summary MWh
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewMode === 'cumulative'
                  ? 'bg-accent-teal text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cumulative Trajectory
            </button>
          </div>
        )}
      </div>

      {/* Main Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          {viewMode === 'balance' ? (
            <BarChart
              data={barData}
              margin={{ top: 15, right: 20, left: 15, bottom: 20 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toLocaleString()}`}
                label={{
                  value: 'Energy Imbalance (MWh)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#64748b',
                  fontSize: 10,
                  offset: 0,
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-navy-700 bg-navy-950/95 p-3 shadow-2xl text-xs space-y-1.5 font-mono backdrop-blur">
                        <div className="font-bold text-slate-200 border-b border-navy-800 pb-1 font-sans">
                          {d.category} Energy Volume
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-slate-400">Total Imbalance:</span>
                          <span className="font-bold text-slate-100">{d.displayMwh}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans">{d.type}</div>
                        <div className="text-[11px] text-accent-cyan font-sans border-t border-navy-800 pt-1">
                          {d.imbalance}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="mwh" radius={[4, 4, 4, 4]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart
              data={cumulativeData}
              margin={{ top: 15, right: 20, left: 15, bottom: 25 }}
            >
              <defs>
                <linearGradient id="cumShortGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cumLongGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                interval={5}
                tickLine={{ stroke: '#334155' }}
                label={{
                  value: 'Settlement Period Time (London GMT)',
                  position: 'insideBottom',
                  offset: -15,
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toLocaleString()}`}
                label={{
                  value: 'Cumulative MWh',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#64748b',
                  fontSize: 10,
                  offset: 0,
                }}
              />
              <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-navy-700 bg-navy-950/95 p-3 shadow-2xl text-xs space-y-1 font-mono backdrop-blur">
                        <div className="font-bold text-slate-200 border-b border-navy-800 pb-1 font-sans">
                          SP {pt.settlement_period} ({pt.timeLabel})
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-slate-400">Interval Energy:</span>
                          <span
                            className={`font-bold ${
                              pt.intervalMwh > 0
                                ? 'text-amber-400'
                                : pt.intervalMwh < 0
                                ? 'text-cyan-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {pt.intervalMwh > 0 ? `+` : ''}
                            {pt.intervalMwh.toLocaleString()} MWh
                          </span>
                        </div>
                        <div className="flex justify-between space-x-4 border-t border-navy-850 pt-1">
                          <span className="text-slate-400">Cumulative Imbalance:</span>
                          <span
                            className={`font-bold ${
                              pt.cumulativeMwh > 0
                                ? 'text-amber-400'
                                : pt.cumulativeMwh < 0
                                ? 'text-cyan-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {pt.cumulativeMwh > 0 ? `+` : ''}
                            {pt.cumulativeMwh.toLocaleString()} MWh
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativeMwh"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#cumLongGrad)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

