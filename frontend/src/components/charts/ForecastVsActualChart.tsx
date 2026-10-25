import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PairedGenerationPoint } from '../../types/api';

interface ForecastVsActualChartProps {
  data: PairedGenerationPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const pt: PairedGenerationPoint = payload[0].payload;
    const act = pt.actual_generation_mw;
    const fc = pt.forecast_generation_mw;
    const err = pt.error_mw;

    return (
      <div className="rounded-lg border border-navy-600 bg-navy-950/95 p-3.5 shadow-2xl text-xs space-y-1.5 backdrop-blur font-mono z-50">
        <div className="font-bold text-slate-200 border-b border-navy-800 pb-1 flex justify-between gap-4 font-sans">
          <span>SP {pt.settlement_period} ({pt.start_time_local})</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded ${pt.is_valid_pair ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400'}`}>
            {pt.status}
          </span>
        </div>

        <div className="flex justify-between space-x-4">
          <span className="text-slate-400">Actual Outturn:</span>
          <span className="font-bold text-emerald-400">
            {act !== null && act !== undefined ? `${act.toLocaleString()} MW` : 'Missing'}
          </span>
        </div>

        <div className="flex justify-between space-x-4">
          <span className="text-slate-400">Selected Forecast:</span>
          <span className="font-bold text-cyan-400">
            {fc !== null && fc !== undefined ? `${fc.toLocaleString()} MW` : 'Missing'}
          </span>
        </div>

        {err !== null && err !== undefined && (
          <div className="flex justify-between space-x-4 pt-1 border-t border-navy-800">
            <span className="text-slate-400">Error (Fc - Act):</span>
            <span className={`font-bold ${err > 0 ? 'text-amber-400' : err < 0 ? 'text-blue-400' : 'text-slate-300'}`}>
              {err > 0 ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
            </span>
          </div>
        )}

        {pt.forecast_publish_time_local && (
          <div className="text-[10px] text-slate-500 pt-1 border-t border-navy-800/60 font-sans">
            Published: {pt.forecast_publish_time_local}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ForecastVsActualChart: React.FC<ForecastVsActualChartProps> = ({
  data,
  title = 'Wind Generation: Actual Outturn vs Selected Forecast',
  subtitle = 'Delivery intervals in 30-minute settlement periods (January 2026)',
  height = 360,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-6 flex items-center justify-center text-slate-500 italic" style={{ height }}>
        No generation data available for the selected parameters.
      </div>
    );
  }

  // Format tick labels for 30-min settlement periods
  const formattedData = data.map((d) => ({
    ...d,
    timeLabel: d.start_time_local.split(' ')[1] || `SP${d.settlement_period}`,
  }));

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-5 shadow-xl">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 tracking-wide">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded"></span>
            <span className="text-emerald-400 font-medium">Actual (FUELHH)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block rounded border-t border-dashed"></span>
            <span className="text-cyan-400 font-medium">Forecast (WINDFOR)</span>
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formattedData} margin={{ top: 10, right: 15, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              interval={3}
              tickLine={{ stroke: '#334155' }}
              label={{ value: 'Settlement Period Time (London GMT)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              label={{ value: 'Generation (MW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, offset: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ display: 'none' }} />
            <Line
              type="monotone"
              dataKey="actual_generation_mw"
              name="Actual Outturn (MW)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#022c22' }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecast_generation_mw"
              name="Selected Forecast (MW)"
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2, fill: '#06b6d4', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#06b6d4', stroke: '#083344' }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

