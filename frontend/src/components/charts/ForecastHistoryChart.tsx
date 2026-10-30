import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ForecastPublication } from '../../types/api';
import { Star } from 'lucide-react';

interface ForecastHistoryChartProps {
  publications: ForecastPublication[];
  actualGenerationMw: number | null;
  selectedGenerationMw: number | null;
  cutoffLocalTime: string;
  deliveryTimeLocal: string;
}

export const ForecastHistoryChart: React.FC<ForecastHistoryChartProps> = ({
  publications,
  actualGenerationMw,
  selectedGenerationMw,
  cutoffLocalTime,
  deliveryTimeLocal,
}) => {
  if (!publications || publications.length === 0) {
    return (
      <div className="rounded-lg border border-nature-border bg-white p-8 text-center text-nature-muted font-mono text-xs shadow-sm">
        No forecast update history recorded for this specific settlement period.
      </div>
    );
  }

  const chartData = publications.map((p) => ({
    ...p,
    timeLabel: p.publish_time_local.split(' ')[1]?.slice(0, 5) || p.publish_time_local,
    actualMw: actualGenerationMw,
  }));

  return (
    <div className="rounded-lg border border-nature-border bg-white p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-nature-border gap-2">
        <div>
          <h3 className="text-sm font-semibold text-nature-text">
            Forecast Evolution Waterfall
          </h3>
          <p className="text-xs text-nature-muted mt-0.5">
            Chronological forecast revisions leading up to delivery at {deliveryTimeLocal}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-nature-forecast" />
            <span className="text-nature-muted text-[11px] font-sans">Published Forecasts</span>
          </span>
          {actualGenerationMw !== null && (
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-0.5 bg-nature-actual inline-block rounded" />
              <span className="text-nature-actual text-[11px] font-sans">Actual Outturn</span>
            </span>
          )}
          {selectedGenerationMw !== null && (
            <span className="flex items-center space-x-1.5">
              <Star className="w-3 h-3 text-nature-forest fill-nature-forest" />
              <span className="text-nature-forest text-[11px] font-sans font-medium">Selected Benchmark</span>
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#E1E8DF" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#748078"
              tick={{ fill: '#748078', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#E1E8DF' }}
            />
            <YAxis
              stroke="#748078"
              tick={{ fill: '#748078', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#E1E8DF' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              label={{
                value: 'Forecast (MW)',
                angle: -90,
                position: 'insideLeft',
                fill: '#748078',
                fontSize: 10,
                offset: 5,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: ForecastPublication = payload[0].payload;
                  return (
                    <div className="rounded-md border border-nature-border bg-white p-2.5 shadow-lg text-xs space-y-1.5 font-mono">
                      <div className="font-semibold text-nature-text border-b border-nature-border pb-1 font-sans flex items-center justify-between">
                        <span>Published: {item.publish_time_local}</span>
                        {item.is_selected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-nature-forest-light text-nature-forest border border-nature-forest/40 font-mono font-semibold">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-nature-muted">Forecast:</span>
                        <span className="font-bold text-nature-forecast tabular-nums">
                          {item.forecast_generation_mw.toLocaleString()} MW
                        </span>
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-nature-muted">Lead Time:</span>
                        <span className="text-nature-text tabular-nums">{item.lead_time_hours}h</span>
                      </div>
                      <div className="flex justify-between space-x-4 border-t border-nature-border pt-1">
                        <span className="text-nature-muted">Status:</span>
                        <span className={item.is_eligible_under_cutoff ? 'text-nature-actual' : 'text-nature-muted'}>
                          {item.is_eligible_under_cutoff ? 'Eligible (< Cutoff)' : 'After Cutoff (Excluded)'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {actualGenerationMw !== null && (
              <ReferenceLine
                y={actualGenerationMw}
                stroke="#26966B"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `Actual: ${actualGenerationMw.toLocaleString()} MW`,
                  fill: '#26966B',
                  fontSize: 10,
                  position: 'right',
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="forecast_generation_mw"
              name="Forecast Updates (MW)"
              stroke="#5689B5"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.is_selected) {
                  return (
                    <circle
                      key={`dot-${payload.publish_time}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#245B45"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                }
                return (
                  <circle
                    key={`dot-${payload.publish_time}`}
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill={payload.is_eligible_under_cutoff ? '#5689B5' : '#9EAAA2'}
                  />
                );
              }}
              activeDot={{ r: 5, fill: '#245B45' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
