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
} from 'recharts';
import { PairedGenerationPoint } from '../../types/api';
import { BarChart2 } from 'lucide-react';

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
      <div className="rounded-md border border-nature-border bg-white p-3 shadow-lg text-xs space-y-1.5 font-mono z-50 min-w-[220px]">
        {/* Settlement Period & Time Header */}
        <div className="font-semibold text-nature-text border-b border-nature-border pb-1 flex items-center justify-between font-sans">
          <span>SP {pt.settlement_period} &bull; {pt.start_time_local.split(' ')[1] || pt.start_time_local}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              pt.is_valid_pair
                ? 'bg-nature-forest-light text-nature-forest border border-nature-forest/30'
                : 'bg-nature-risk-light text-nature-risk border border-nature-risk/40'
            }`}
          >
            {pt.status}
          </span>
        </div>

        {/* Actual Outturn */}
        <div className="flex justify-between items-center space-x-3">
          <span className="text-nature-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-nature-actual" /> Actual (FUELHH):
          </span>
          <span className="font-bold text-nature-actual tabular-nums">
            {act !== null && act !== undefined ? `${act.toLocaleString()} MW` : 'Missing'}
          </span>
        </div>

        {/* Selected Forecast */}
        <div className="flex justify-between items-center space-x-3">
          <span className="text-nature-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-nature-forecast" /> Forecast (WINDFOR):
          </span>
          <span className="font-bold text-nature-forecast tabular-nums">
            {fc !== null && fc !== undefined ? `${fc.toLocaleString()} MW` : 'Missing'}
          </span>
        </div>

        {/* Error / Variance */}
        {err !== null && err !== undefined && (
          <div className="flex justify-between items-center space-x-3 pt-1 border-t border-nature-border">
            <span className="text-nature-muted font-sans">Deviation:</span>
            <div className="text-right">
              <span
                className={`font-bold tabular-nums ${
                  err > 0 ? 'text-nature-risk' : err < 0 ? 'text-nature-forecast' : 'text-nature-text'
                }`}
              >
                {err > 0 ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
              </span>
              {percentErr && (
                <span className="text-[10px] text-nature-muted ml-1">
                  ({err > 0 ? '+' : ''}{percentErr}%)
                </span>
              )}
            </div>
          </div>
        )}

        {pt.forecast_publish_time_local && (
          <div className="text-[10px] text-nature-muted pt-1 border-t border-nature-border font-sans flex justify-between">
            <span>Published:</span>
            <span className="font-mono text-nature-text">
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
  title = 'Wind Generation: Actual Outturn vs Day-Ahead Forecast',
  subtitle = '30-minute settlement periods across delivery day (Europe/London GMT)',
  height = 340,
}) => {
  const [showDifferenceBar, setShowDifferenceBar] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-nature-border bg-white p-8 flex items-center justify-center text-nature-muted font-mono text-xs shadow-sm"
        style={{ height }}
      >
        No generation data available for the selected parameters.
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    timeLabel: d.start_time_local.split(' ')[1]?.slice(0, 5) || `SP${d.settlement_period}`,
    positiveDelta: d.error_mw !== null && d.error_mw > 0 ? d.error_mw : 0,
    negativeDelta: d.error_mw !== null && d.error_mw < 0 ? Math.abs(d.error_mw) : 0,
  }));

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
    <div className="rounded-lg border border-nature-border bg-white p-4 space-y-3 shadow-sm">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-nature-border gap-2">
        <div>
          <h3 className="text-sm font-semibold text-nature-text">{title}</h3>
          <p className="text-xs text-nature-muted mt-0.5">{subtitle}</p>
        </div>

        {/* Legend & Display Toggle */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-3 bg-nature-bg px-2.5 py-1 rounded-md border border-nature-border">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-nature-actual inline-block" />
              <span className="text-nature-text text-[11px] font-sans">Actual Outturn</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-1 bg-nature-forecast inline-block rounded-full" />
              <span className="text-nature-text text-[11px] font-sans">Forecast</span>
            </span>
          </div>

          <button
            onClick={() => setShowDifferenceBar(!showDifferenceBar)}
            className={`px-2.5 py-1 rounded-md border text-[11px] font-sans flex items-center gap-1 transition-colors ${
              showDifferenceBar
                ? 'bg-nature-forest-light text-nature-forest border-nature-forest/40 font-medium'
                : 'bg-nature-bg text-nature-muted hover:text-nature-text border border-nature-border'
            }`}
            title="Toggle error bars overlay"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Delta Overlay</span>
          </button>
        </div>
      </div>

      {/* Summary Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-nature-bg p-2 rounded-md border border-nature-border">
        <div className="flex justify-between items-center pr-2 border-r border-nature-border">
          <span className="text-nature-muted">Peak Actual:</span>
          <span className="font-semibold text-nature-actual tabular-nums">
            {peakActual.val ? `${peakActual.val.toLocaleString()} MW (SP${peakActual.sp})` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2 border-r border-nature-border">
          <span className="text-nature-muted">Peak Forecast:</span>
          <span className="font-semibold text-nature-forecast tabular-nums">
            {peakForecast.val ? `${peakForecast.val.toLocaleString()} MW (SP${peakForecast.sp})` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center px-2 border-r border-nature-border">
          <span className="text-nature-muted">Periods:</span>
          <span className="font-semibold text-nature-text tabular-nums">{validPoints.length} / 48</span>
        </div>
        <div className="flex justify-between items-center pl-2">
          <span className="text-nature-muted">Resolution:</span>
          <span className="font-semibold text-nature-text">30 min</span>
        </div>
      </div>

      {/* Recharts Graphic */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <ComposedChart data={formattedData} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="naturalActualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#26966B" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#26966B" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              label={{
                value: 'Generation (MW)',
                angle: -90,
                position: 'insideLeft',
                fill: '#748078',
                fontSize: 10,
                offset: 5,
              }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Actual Outturn Area */}
            <Area
              type="monotone"
              dataKey="actual_generation_mw"
              name="Actual Outturn (FUELHH)"
              stroke="#26966B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#naturalActualGrad)"
              isAnimationActive={false}
            />

            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="forecast_generation_mw"
              name="Forecast (WINDFOR)"
              stroke="#5689B5"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />

            {/* Optional Delta Bars */}
            {showDifferenceBar && (
              <Bar
                dataKey="positiveDelta"
                name="Overforecast (MW)"
                fill="#D49A42"
                opacity={0.65}
                barSize={6}
                isAnimationActive={false}
              />
            )}
            {showDifferenceBar && (
              <Bar
                dataKey="negativeDelta"
                name="Underforecast (MW)"
                fill="#5689B5"
                opacity={0.65}
                barSize={6}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
