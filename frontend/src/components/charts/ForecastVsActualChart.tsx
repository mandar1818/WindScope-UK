import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { PairedGenerationPoint } from '../../types/api';
import { TrendingUp, TrendingDown, Layers, BarChart2, Eye } from 'lucide-react';

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

    const percentErr =
      act !== null && act !== undefined && act > 0 && err !== null && err !== undefined
        ? ((err / act) * 100).toFixed(1)
        : null;

    return (
      <div className="rounded-lg border border-navy-700 bg-navy-950/95 p-3.5 shadow-2xl text-xs space-y-2 backdrop-blur font-mono z-50 min-w-[240px]">
        {/* Settlement Period & Time Header */}
        <div className="font-bold text-slate-200 border-b border-navy-800 pb-1.5 flex items-center justify-between font-sans">
          <span>SP {pt.settlement_period} &bull; {pt.start_time_local.split(' ')[1] || pt.start_time_local}</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
              pt.is_valid_pair
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {pt.status}
          </span>
        </div>

        {/* Actual Outturn */}
        <div className="flex justify-between items-center space-x-3">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Actual Outturn (FUELHH):
          </span>
          <span className="font-bold text-emerald-400">
            {act !== null && act !== undefined ? `${act.toLocaleString()} MW` : 'Missing'}
          </span>
        </div>

        {/* Selected Forecast */}
        <div className="flex justify-between items-center space-x-3">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Selected Forecast (WINDFOR):
          </span>
          <span className="font-bold text-cyan-400">
            {fc !== null && fc !== undefined ? `${fc.toLocaleString()} MW` : 'Missing'}
          </span>
        </div>

        {/* Error / Variance */}
        {err !== null && err !== undefined && (
          <div className="flex justify-between items-center space-x-3 pt-1.5 border-t border-navy-800">
            <span className="text-slate-400 font-sans">Deviation (Fc - Act):</span>
            <div className="text-right">
              <span
                className={`font-bold ${
                  err > 0 ? 'text-amber-400' : err < 0 ? 'text-cyan-300' : 'text-slate-300'
                }`}
              >
                {err > 0 ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
              </span>
              {percentErr && (
                <span className="text-[10px] text-slate-500 ml-1">
                  ({err > 0 ? '+' : ''}{percentErr}%)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        {pt.forecast_publish_time_local && (
          <div className="text-[10px] text-slate-400 pt-1 border-t border-navy-800/80 font-sans flex justify-between">
            <span>Forecast Pub:</span>
            <span className="font-mono text-slate-300">
              {pt.forecast_publish_time_local.split(' ')[1] || pt.forecast_publish_time_local}
            </span>
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
  const [showDifferenceBar, setShowDifferenceBar] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-8 flex items-center justify-center text-slate-500 italic font-mono text-xs"
        style={{ height }}
      >
        No generation data available for the selected parameters.
      </div>
    );
  }

  // Format tick labels for 30-min settlement periods
  const formattedData = data.map((d) => ({
    ...d,
    timeLabel: d.start_time_local.split(' ')[1]?.slice(0, 5) || `SP${d.settlement_period}`,
    // Separate positive and negative delta for visual gap representation
    positiveDelta: d.error_mw !== null && d.error_mw > 0 ? d.error_mw : 0,
    negativeDelta: d.error_mw !== null && d.error_mw < 0 ? Math.abs(d.error_mw) : 0,
  }));

  // Calculate range summary stats
  const validPoints = data.filter((d) => d.actual_generation_mw !== null && d.forecast_generation_mw !== null);
  const peakActual = validPoints.reduce(
    (max, p) => ((p.actual_generation_mw ?? 0) > (max.val ?? 0) ? { val: p.actual_generation_mw, sp: p.settlement_period } : max),
    { val: 0, sp: 0 }
  );
  const peakForecast = validPoints.reduce(
    (max, p) => ((p.forecast_generation_mw ?? 0) > (max.val ?? 0) ? { val: p.forecast_generation_mw, sp: p.settlement_period } : max),
    { val: 0, sp: 0 }
  );

  return (
    <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-5 shadow-xl space-y-4">
      {/* Chart Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-navy-800 gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">{subtitle}</p>
        </div>

        {/* Legend & Display Toggle */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center space-x-3 bg-navy-950 px-2.5 py-1 rounded-md border border-navy-800">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-1 bg-emerald-400 inline-block rounded-full" />
              <span className="text-emerald-300 font-semibold">Actual (FUELHH)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-1 bg-cyan-400 inline-block rounded-full border-t border-dashed" />
              <span className="text-cyan-300 font-semibold">Forecast (WINDFOR)</span>
            </span>
          </div>

          <button
            onClick={() => setShowDifferenceBar(!showDifferenceBar)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-sans flex items-center gap-1 transition-colors ${
              showDifferenceBar
                ? 'bg-accent-teal/20 text-accent-cyan border-accent-teal/50 font-semibold'
                : 'bg-navy-950 text-slate-400 hover:text-slate-200 border-navy-800'
            }`}
            title="Toggle settlement period deviation bars overlay"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Delta Overlay</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-navy-950/60 p-2.5 rounded-md border border-navy-850">
        <div className="flex justify-between items-center pr-2 border-r border-navy-850/80">
          <span className="text-slate-400">Peak Outturn:</span>
          <span className="font-bold text-emerald-400">
            {peakActual.val ? `${peakActual.val.toLocaleString()} MW (SP${peakActual.sp})` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2 border-r border-navy-850/80">
          <span className="text-slate-400">Peak Forecast:</span>
          <span className="font-bold text-cyan-400">
            {peakForecast.val ? `${peakForecast.val.toLocaleString()} MW (SP${peakForecast.sp})` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2 border-r border-navy-850/80">
          <span className="text-slate-400">Evaluated SPs:</span>
          <span className="font-bold text-slate-200">{validPoints.length} / 48</span>
        </div>
        <div className="flex justify-between items-center pl-2">
          <span className="text-slate-400">Resolution:</span>
          <span className="font-bold text-accent-teal">30 Minutes</span>
        </div>
      </div>

      {/* Recharts Composed Graphic */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <ComposedChart data={formattedData} margin={{ top: 15, right: 15, left: 10, bottom: 25 }}>
            <defs>
              <linearGradient id="actualFillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              label={{
                value: 'Wind Generation (MW)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 10,
                offset: 5,
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ display: 'none' }} />

            {/* Optional Delta Overlay Bar */}
            {showDifferenceBar && (
              <Bar
                dataKey="error_mw"
                name="Deviation (MW)"
                fill="#f59e0b"
                opacity={0.3}
                barSize={6}
              />
            )}

            {/* Actual Outturn Area & Line */}
            <Area
              type="monotone"
              dataKey="actual_generation_mw"
              fill="url(#actualFillGrad)"
              stroke="none"
              connectNulls={false}
            />
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

            {/* Selected Forecast Line */}
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
