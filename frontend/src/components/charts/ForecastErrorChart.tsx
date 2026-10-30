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
      <div className="rounded border border-slate-700 bg-[#0c1322]/95 p-3 shadow-xl text-xs space-y-1.5 backdrop-blur font-mono z-50 min-w-[210px]">
        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 font-sans flex items-center justify-between">
          <span>SP {pt.settlement_period} &bull; {pt.start_time_local.split(' ')[1] || pt.start_time_local}</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded ${
              isOver ? 'bg-amber-950/80 text-amber-300' : isUnder ? 'bg-sky-950/80 text-sky-300' : 'bg-slate-900 text-slate-400'
            }`}
          >
            {isOver ? 'Short Risk' : isUnder ? 'Long Surplus' : 'Balanced'}
          </span>
        </div>

        <div className="flex justify-between items-center space-x-3">
          <span className="text-slate-400">Deviation:</span>
          <span className={`font-bold tabular-nums ${isOver ? 'text-amber-400' : isUnder ? 'text-sky-400' : 'text-slate-300'}`}>
            {isOver ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
          </span>
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span>Imbalance Energy (30m):</span>
          <span className="font-semibold text-slate-200 tabular-nums">
            {err > 0 ? `+` : ''}{(err * 0.5).toFixed(1)} MWh
          </span>
        </div>

        <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 font-sans">
          {isOver && (
            <span className="text-amber-300/90">
              Overforecast: Generation deficit requires market purchases at System Buy Price (SBP).
            </span>
          )}
          {isUnder && (
            <span className="text-sky-300/90">
              Underforecast: Generation surplus liquidated at System Sell Price (SSP).
            </span>
          )}
          {!isOver && !isUnder && <span>Zero net deviation.</span>}
        </div>
      </div>
    );
  }
  return null;
};

export const ForecastErrorChart: React.FC<ForecastErrorChartProps> = ({
  data,
  title = 'Half-Hourly Forecast Deviation (Forecast minus Actual)',
  subtitle = 'Positive values = overforecast (short risk); negative values = underforecast (long surplus)',
  height = 220,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-slate-800 bg-[#0e1526] p-8 flex items-center justify-center text-slate-500 font-mono text-xs"
        style={{ height }}
      >
        No error data available.
      </div>
    );
  }

  const validPoints = data.filter((d) => d.error_mw !== null && d.error_mw !== undefined);
  const formattedData = validPoints.map((d) => ({
    ...d,
    timeLabel: d.start_time_local.split(' ')[1]?.slice(0, 5) || `SP${d.settlement_period}`,
  }));

  const meanError =
    validPoints.length > 0
      ? validPoints.reduce((sum, d) => sum + (d.error_mw ?? 0), 0) / validPoints.length
      : 0;

  return (
    <div className="rounded-lg border border-slate-800/90 bg-[#0e1526] p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
            <span className="text-slate-300">Overforecast (Deficit)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
            <span className="text-slate-300">Underforecast (Surplus)</span>
          </span>
        </div>
      </div>

      {/* Recharts Graphic */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <BarChart data={formattedData} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
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
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
              label={{
                value: 'Deviation (MW)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 10,
                offset: 5,
              }}
            />
            <Tooltip content={<CustomErrorTooltip />} />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
            {validPoints.length > 0 && (
              <ReferenceLine
                y={meanError}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{
                  value: `Mean Bias: ${meanError > 0 ? '+' : ''}${meanError.toFixed(0)} MW`,
                  position: 'right',
                  fill: '#94a3b8',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            )}
            <Bar dataKey="error_mw" isAnimationActive={false}>
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={(entry.error_mw ?? 0) >= 0 ? '#f59e0b' : '#38bdf8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
