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
      <div className="rounded-md border border-nature-border bg-white p-3 shadow-lg text-xs space-y-1.5 font-mono z-50 min-w-[210px]">
        <div className="font-semibold text-nature-text border-b border-nature-border pb-1 font-sans flex items-center justify-between">
          <span>SP {pt.settlement_period} &bull; {pt.start_time_local.split(' ')[1] || pt.start_time_local}</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded ${
              isOver
                ? 'bg-nature-risk-light text-nature-risk border border-nature-risk/40'
                : isUnder
                ? 'bg-nature-forest-light text-nature-forest border border-nature-forest/30'
                : 'bg-nature-bg text-nature-muted border border-nature-border'
            }`}
          >
            {isOver ? 'Short Risk' : isUnder ? 'Long Surplus' : 'Balanced'}
          </span>
        </div>

        <div className="flex justify-between items-center space-x-3">
          <span className="text-nature-muted">Deviation:</span>
          <span className={`font-bold tabular-nums ${isOver ? 'text-nature-risk' : isUnder ? 'text-nature-forecast' : 'text-nature-text'}`}>
            {isOver ? `+${err.toLocaleString()}` : err.toLocaleString()} MW
          </span>
        </div>

        <div className="flex justify-between items-center text-[11px] text-nature-muted pt-1 border-t border-nature-border">
          <span>Imbalance Energy (30m):</span>
          <span className="font-semibold text-nature-text tabular-nums">
            {err > 0 ? `+` : ''}{(err * 0.5).toFixed(1)} MWh
          </span>
        </div>

        <div className="text-[11px] text-nature-muted pt-1 border-t border-nature-border font-sans">
          {isOver && (
            <span className="text-nature-risk">
              Overforecast: Wind deficit requires replacement at System Buy Price (SBP).
            </span>
          )}
          {isUnder && (
            <span className="text-nature-forecast">
              Underforecast: Wind surplus spilled and settled at System Sell Price (SSP).
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
        className="rounded-lg border border-nature-border bg-white p-8 flex items-center justify-center text-nature-muted font-mono text-xs shadow-sm"
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
    <div className="rounded-lg border border-nature-border bg-white p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-nature-border gap-2">
        <div>
          <h3 className="text-sm font-semibold text-nature-text">{title}</h3>
          <p className="text-xs text-nature-muted mt-0.5">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-nature-risk inline-block" />
            <span className="text-nature-muted text-[11px] font-sans">Overforecast (Deficit)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-nature-forecast inline-block" />
            <span className="text-nature-muted text-[11px] font-sans">Underforecast (Surplus)</span>
          </span>
        </div>
      </div>

      {/* Recharts Graphic */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <BarChart data={formattedData} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
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
              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`}
              label={{
                value: 'Deviation (MW)',
                angle: -90,
                position: 'insideLeft',
                fill: '#748078',
                fontSize: 10,
                offset: 5,
              }}
            />
            <Tooltip content={<CustomErrorTooltip />} />
            <ReferenceLine y={0} stroke="#8FAE91" strokeWidth={1} />
            {validPoints.length > 0 && (
              <ReferenceLine
                y={meanError}
                stroke="#748078"
                strokeDasharray="3 3"
                label={{
                  value: `Mean Bias: ${meanError > 0 ? '+' : ''}${meanError.toFixed(0)} MW`,
                  position: 'right',
                  fill: '#748078',
                  fontSize: 10,
                  fontFamily: 'monospace',
                }}
              />
            )}
            <Bar dataKey="error_mw" isAnimationActive={false}>
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={(entry.error_mw ?? 0) >= 0 ? '#D49A42' : '#5689B5'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
