import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { PairedGenerationPoint } from '../../types/api';
import { AlertTriangle, TrendingUp, TrendingDown, Scale } from 'lucide-react';

interface ForecastErrorChartProps {
  data: PairedGenerationPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

const CustomErrorTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const pt: PairedGenerationPoint = payload[0].payload;
    const err = pt.error_mw;

    if (err === null || err === undefined) return null;

    const isOver = err > 0;
    const isUnder = err < 0;

    return (
      <div className="rounded-lg border border-navy-700 bg-navy-950/95 p-3.5 shadow-2xl text-xs space-y-2 backdrop-blur font-mono z-50 min-w-[220px]">
        <div className="font-bold text-slate-200 border-b border-navy-800 pb-1 font-sans flex items-center justify-between">
          <span>SP {pt.settlement_period} &bull; {pt.start_time_local.split(' ')[1] || pt.start_time_local}</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded ${
              isOver ? 'bg-amber-950 text-amber-300' : isUnder ? 'bg-cyan-950 text-cyan-300' : 'bg-navy-900 text-slate-400'
            }`}
          >
            {isOver ? 'OVER' : isUnder ? 'UNDER' : 'EXACT'}
          </span>
        </div>

        <div className="flex justify-between items-center space-x-4">
          <span className="text-slate-400">Forecast Error:</span>
          <span className={`font-bold ${isOver ? 'text-amber-400' : isUnder ? 'text-cyan-400' : 'text-slate-300'}`}>
            {isOver ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
          </span>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-navy-850">
          <span>Physical Energy (30m):</span>
          <span className="font-semibold text-slate-200 font-mono">
            {err > 0 ? `+` : ''}{(err * 0.5).toFixed(1)} MWh
          </span>
        </div>

        <div className="text-[11px] text-slate-300 pt-1 border-t border-navy-800 font-sans">
          {isOver && (
            <span className="text-amber-300 flex items-start gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Overforecast: Wind deficit leaves utility physically SHORT. SBP cash-out risk.</span>
            </span>
          )}
          {isUnder && (
            <span className="text-cyan-300 flex items-start gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Underforecast: Wind surplus leaves utility physically LONG. SSP spill liquidation.</span>
            </span>
          )}
          {!isOver && !isUnder && <span className="text-slate-400">Zero net variance.</span>}
        </div>
      </div>
    );
  }
  return null;
};

export const ForecastErrorChart: React.FC<ForecastErrorChartProps> = ({
  data,
  title = 'Forecast Interval Error (Forecast minus Actual)',
  subtitle = 'Positive values indicate overforecasting (MW); negative values indicate underforecasting (MW)',
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-8 flex items-center justify-center text-slate-500 italic font-mono text-xs"
        style={{ height }}
      >
        No error data available.
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    timeLabel: d.start_time_local.split(' ')[1]?.slice(0, 5) || `SP${d.settlement_period}`,
  }));

  // Count over vs under periods
  const validErrors = data.filter((d) => d.error_mw !== null).map((d) => d.error_mw as number);
  const overCount = validErrors.filter((e) => e > 0).length;
  const underCount = validErrors.filter((e) => e < 0).length;
  const meanBias = validErrors.length > 0 ? validErrors.reduce((a, b) => a + b, 0) / validErrors.length : 0;

  return (
    <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-5 shadow-xl space-y-3">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-navy-800 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">{subtitle}</p>
        </div>

        {/* Counts & Legend */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300">
            <span className="w-2 h-2 bg-amber-500 rounded-sm" />
            <span>Over: <strong>{overCount}</strong> SPs</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
            <span className="w-2 h-2 bg-cyan-500 rounded-sm" />
            <span>Under: <strong>{underCount}</strong> SPs</span>
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <BarChart data={formattedData} margin={{ top: 15, right: 15, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              interval={3}
              tickLine={{ stroke: '#334155' }}
              label={{
                value: 'Settlement Period Time (Europe/London GMT)',
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
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toLocaleString()}`}
              label={{
                value: 'Forecast Error (MW)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 10,
                offset: 5,
              }}
            />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} label={{ value: 'Zero Error Baseline', fill: '#64748b', fontSize: 9, position: 'top' }} />
            {meanBias !== 0 && (
              <ReferenceLine
                y={meanBias}
                stroke={meanBias > 0 ? '#f59e0b' : '#06b6d4'}
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `Day Mean Bias: ${meanBias > 0 ? '+' : ''}${meanBias.toFixed(0)} MW`,
                  fill: meanBias > 0 ? '#f59e0b' : '#06b6d4',
                  fontSize: 9,
                  position: 'right',
                }}
              />
            )}
            <Tooltip content={<CustomErrorTooltip />} />
            <Bar dataKey="error_mw" radius={[2, 2, 2, 2]}>
              {formattedData.map((entry, index) => {
                const val = entry.error_mw;
                const isPositive = val !== null && val > 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isPositive ? '#f59e0b' : '#06b6d4'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
