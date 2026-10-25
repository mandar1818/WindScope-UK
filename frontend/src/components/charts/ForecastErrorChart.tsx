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
      <div className="rounded-lg border border-navy-600 bg-navy-950/95 p-3.5 shadow-2xl text-xs space-y-1.5 backdrop-blur font-mono z-50">
        <div className="font-bold text-slate-200 border-b border-navy-800 pb-1 font-sans">
          SP {pt.settlement_period} ({pt.start_time_local})
        </div>

        <div className="flex justify-between space-x-4">
          <span className="text-slate-400">Forecast Error:</span>
          <span className={`font-bold ${isOver ? 'text-amber-400' : isUnder ? 'text-cyan-400' : 'text-slate-300'}`}>
            {isOver ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
          </span>
        </div>

        <div className="text-[11px] text-slate-300 pt-1 border-t border-navy-800 font-sans">
          {isOver && (
            <span className="text-amber-300">
              ⚠️ Overforecast: Expected more wind than generated. System short risk.
            </span>
          )}
          {isUnder && (
            <span className="text-cyan-300">
              ℹ️ Underforecast: Generated more wind than expected. System long risk.
            </span>
          )}
          {!isOver && !isUnder && <span className="text-slate-400">Perfect balance.</span>}
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
      <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-6 flex items-center justify-center text-slate-500 italic" style={{ height }}>
        No error data available.
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    timeLabel: d.start_time_local.split(' ')[1] || `SP${d.settlement_period}`,
  }));

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-5 shadow-xl">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 tracking-wide">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 inline-block rounded-sm"></span>
            <span className="text-amber-400 font-medium">Overforecast (+MW)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-cyan-500 inline-block rounded-sm"></span>
            <span className="text-cyan-400 font-medium">Underforecast (-MW)</span>
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 15, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
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
              label={{ value: 'Error (MW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, offset: 12 }}
            />
            <Tooltip content={<CustomErrorTooltip />} />
            <ReferenceLine y={0} stroke="#475569" strokeWidth={1.5} />
            <Bar dataKey="error_mw" name="Forecast Error (MW)" maxBarSize={16}>
              {formattedData.map((entry, index) => {
                const err = entry.error_mw || 0;
                const fill = err > 0 ? '#f59e0b' : '#06b6d4';
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

