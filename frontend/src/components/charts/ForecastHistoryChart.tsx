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
      <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-8 text-center text-slate-500 font-mono text-xs">
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
    <div className="rounded-lg border border-slate-800/90 bg-[#0e1526] p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Forecast Evolution Waterfall
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological forecast revisions leading up to delivery at {deliveryTimeLocal}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-slate-300">Published Forecasts</span>
          </span>
          {actualGenerationMw !== null && (
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-400 inline-block rounded" />
              <span className="text-emerald-400">Actual Outturn</span>
            </span>
          )}
          {selectedGenerationMw !== null && (
            <span className="flex items-center space-x-1.5">
              <Star className="w-3 h-3 text-sky-400 fill-sky-400" />
              <span className="text-sky-300">Selected Benchmark</span>
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              label={{
                value: 'Forecast (MW)',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 10,
                offset: 5,
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: ForecastPublication = payload[0].payload;
                  return (
                    <div className="rounded border border-slate-700 bg-[#0c1322] p-2.5 shadow-xl text-xs space-y-1.5 font-mono">
                      <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 font-sans flex items-center justify-between">
                        <span>Published: {item.publish_time_local}</span>
                        {item.is_selected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-slate-400">Forecast:</span>
                        <span className="font-bold text-sky-400 tabular-nums">
                          {item.forecast_generation_mw.toLocaleString()} MW
                        </span>
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-slate-400">Lead Time:</span>
                        <span className="text-slate-200 tabular-nums">{item.lead_time_hours}h</span>
                      </div>
                      <div className="flex justify-between space-x-4 border-t border-slate-800 pt-1">
                        <span className="text-slate-400">Status:</span>
                        <span className={item.is_eligible_under_cutoff ? 'text-emerald-400' : 'text-slate-500'}>
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
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `Actual: ${actualGenerationMw.toLocaleString()} MW`,
                  fill: '#10b981',
                  fontSize: 10,
                  position: 'right',
                }}
              />
            )}

            <Line
              type="monotone"
              dataKey="forecast_generation_mw"
              name="Forecast Updates (MW)"
              stroke="#38bdf8"
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
                      fill="#38bdf8"
                      stroke="#0f172a"
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
                    fill={payload.is_eligible_under_cutoff ? '#38bdf8' : '#64748b'}
                  />
                );
              }}
              activeDot={{ r: 5, fill: '#38bdf8' }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
