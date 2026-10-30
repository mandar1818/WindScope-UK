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
      color: '#D49A42', // warm amber
      imbalance: 'Short Risk (System Buy Price purchases)',
    },
    {
      category: 'Underforecast (Long)',
      mwh: -exposure.underforecast_energy_mwh,
      displayMwh: `-${exposure.underforecast_energy_mwh.toLocaleString()} MWh`,
      color: '#5689B5', // muted sky
      imbalance: 'Long Risk (System Sell Price spill)',
    },
    {
      category: 'Net Day Imbalance',
      mwh: exposure.net_energy_variance_mwh,
      displayMwh: `${exposure.net_energy_variance_mwh > 0 ? '+' : ''}${exposure.net_energy_variance_mwh.toLocaleString()} MWh`,
      color: exposure.net_energy_variance_mwh > 0 ? '#D49A42' : exposure.net_energy_variance_mwh < 0 ? '#5689B5' : '#245B45',
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
    <div className="rounded-lg border border-nature-border bg-nature-bg p-3.5 space-y-3">
      {/* View Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-nature-border">
        <span className="text-xs font-medium text-nature-text">
          {viewMode === 'balance'
            ? 'Energy Imbalance Volume Categories'
            : '48 Settlement Period Cumulative Imbalance Trajectory'}
        </span>

        {generationPoints && generationPoints.length > 0 && (
          <div className="flex items-center space-x-1 bg-white p-0.5 rounded-md border border-nature-border font-mono text-xs shadow-sm">
            <button
              onClick={() => setViewMode('balance')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                viewMode === 'balance'
                  ? 'bg-nature-forest text-white font-medium'
                  : 'text-nature-muted hover:text-nature-text'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                viewMode === 'cumulative'
                  ? 'bg-nature-forest text-white font-medium'
                  : 'text-nature-muted hover:text-nature-text'
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
              <CartesianGrid strokeDasharray="2 2" stroke="#E1E8DF" vertical={false} />
              <XAxis
                dataKey="category"
                stroke="#748078"
                tick={{ fill: '#748078', fontSize: 11 }}
                tickLine={{ stroke: '#E1E8DF' }}
              />
              <YAxis
                stroke="#748078"
                tick={{ fill: '#748078', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#E1E8DF' }}
                tickFormatter={(v) => `${v.toLocaleString()} MWh`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-md border border-nature-border bg-white p-2.5 shadow-lg text-xs font-mono space-y-1">
                        <div className="font-semibold text-nature-text font-sans">{d.category}</div>
                        <div className="text-sm font-bold text-nature-text tabular-nums">{d.displayMwh}</div>
                        <div className="text-[11px] text-nature-muted">{d.imbalance}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#8FAE91" strokeWidth={1} />
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
              <CartesianGrid strokeDasharray="2 2" stroke="#E1E8DF" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="#748078"
                tick={{ fill: '#748078', fontSize: 10, fontFamily: 'monospace' }}
                interval={3}
                tickLine={{ stroke: '#E1E8DF' }}
              />
              <YAxis
                stroke="#748078"
                tick={{ fill: '#748078', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#E1E8DF' }}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${v} MWh`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-md border border-nature-border bg-white p-2.5 shadow-lg text-xs font-mono space-y-1">
                        <div className="font-semibold text-nature-text font-sans">
                          SP {d.settlement_period} &bull; {d.timeLabel}
                        </div>
                        <div className="text-nature-muted">
                          Period Imbalance: <span className="font-bold text-nature-text tabular-nums">{d.intervalMwh} MWh</span>
                        </div>
                        <div className="text-nature-forecast border-t border-nature-border pt-1">
                          Cumulative Imbalance: <span className="font-bold tabular-nums">{d.cumulativeMwh} MWh</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#8FAE91" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="cumulativeMwh"
                stroke="#5689B5"
                strokeWidth={2}
                fill="#5689B5"
                fillOpacity={0.12}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
