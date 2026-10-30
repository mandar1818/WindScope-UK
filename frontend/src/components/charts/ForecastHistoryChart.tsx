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
import { History, Star, ShieldCheck } from 'lucide-react';

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
      <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-8 text-center text-slate-500 italic font-mono text-xs">
        No forecast update history recorded for this specific settlement period.
      </div>
    );
  }

  // Format publication points for timeline progression
  const chartData = publications.map((p) => ({
    ...p,
    timeLabel: p.publish_time_local.split(' ')[1]?.slice(0, 5) || p.publish_time_local,
    actualMw: actualGenerationMw,
  }));

  return (
    <div className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-5 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-navy-800 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
            Forecast Evolution Progression (Waterfall)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Chronological forecast revisions approaching delivery at {deliveryTimeLocal}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-cyan-300">Published Forecasts</span>
          </span>
          {actualGenerationMw !== null && (
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" />
              <span className="text-emerald-400">Final Actual Outturn</span>
            </span>
          )}
          {selectedGenerationMw !== null && (
            <span className="flex items-center space-x-1.5">
              <Star className="w-3 h-3 text-cyan-300 fill-cyan-400" />
              <span className="text-cyan-200">Selected Benchmark</span>
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              label={{
                value: 'Publication Timestamp (London GMT)',
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
                    <div className="rounded-lg border border-navy-700 bg-navy-950/95 p-3.5 shadow-2xl text-xs space-y-1.5 font-mono backdrop-blur">
                      <div className="font-bold text-slate-200 border-b border-navy-800 pb-1 font-sans flex items-center justify-between">
                        <span>Published: {item.publish_time_local}</span>
                        {item.is_selected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-slate-400">Forecast Generation:</span>
                        <span className="font-bold text-cyan-400">{item.forecast_generation_mw.toLocaleString()} MW</span>
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-slate-400">Lead Time to Delivery:</span>
                        <span className="text-slate-200">{item.lead_time_hours} hours</span>
                      </div>
                      <div className="flex justify-between space-x-4 border-t border-navy-850 pt-1">
                        <span className="text-slate-400">Cutoff Eligibility:</span>
                        <span className={item.is_eligible_under_cutoff ? 'text-emerald-400' : 'text-rose-400'}>
                          {item.is_eligible_under_cutoff ? 'Eligible' : 'Exceeded Cutoff'}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Actual Outturn Reference Line */}
            {actualGenerationMw !== null && (
              <ReferenceLine
                y={actualGenerationMw}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Actual Outturn: ${actualGenerationMw.toLocaleString()} MW`,
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
              stroke="#06b6d4"
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.is_selected) {
                  return (
                    <circle
                      key={`dot-${payload.publish_time}`}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="#22d3ee"
                      stroke="#083344"
                      strokeWidth={2}
                    />
                  );
                }
                return (
                  <circle
                    key={`dot-${payload.publish_time}`}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={payload.is_eligible_under_cutoff ? '#06b6d4' : '#64748b'}
                  />
                );
              }}
              activeDot={{ r: 6, fill: '#22d3ee' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
