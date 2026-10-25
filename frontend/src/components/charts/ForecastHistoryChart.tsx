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
      <div className="rounded-xl border border-navy-700 bg-navy-900/60 p-6 text-center text-slate-500 italic">
        No forecast update history recorded for this specific settlement period.
      </div>
    );
  }

  // Format publication points for timeline progression
  const chartData = publications.map((p) => ({
    ...p,
    timeLabel: p.publish_time_local.split(' ')[1] || p.publish_time_local,
    actualMw: actualGenerationMw,
  }));

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900/80 p-5 shadow-xl">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200 tracking-wide">
            Forecast Evolution Progression (Waterfall)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological forecast revisions approaching delivery at {deliveryTimeLocal}
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-300">Published Forecasts</span>
          </span>
          {actualGenerationMw !== null && (
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
              <span className="text-emerald-400">Final Actual Outturn</span>
            </span>
          )}
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" vertical={false} />
            <XAxis
              dataKey="publish_time_local"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              label={{ value: 'Publication Timestamp (London GMT)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#334155' }}
              label={{ value: 'Forecast (MW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, offset: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item: ForecastPublication = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-navy-600 bg-navy-950/95 p-3 shadow-2xl text-xs space-y-1 font-mono">
                      <div className="font-bold text-slate-200 border-b border-navy-800 pb-1">
                        Published: {item.publish_time_local}
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-slate-400">Forecast Generation:</span>
                        <span className="font-bold text-cyan-400">{item.forecast_generation_mw.toLocaleString()} MW</span>
                      </div>
                      <div className="flex justify-between space-x-4">
                        <span className="text-slate-400">Lead Time to Delivery:</span>
                        <span className="text-slate-200">{item.lead_time_hours} hours</span>
                      </div>
                      <div className="flex justify-between space-x-4 pt-1 border-t border-navy-800">
                        <span className="text-slate-400">Cutoff Eligibility:</span>
                        <span className={item.is_eligible_under_cutoff ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                          {item.is_eligible_under_cutoff ? 'Eligible' : 'Exceeded Cutoff'}
                        </span>
                      </div>
                      {item.is_selected && (
                        <div className="text-accent-teal font-bold pt-0.5">
                          ⭐ Selected Point-in-Time Benchmark
                        </div>
                      )}
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
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Actual Outturn: ${actualGenerationMw.toLocaleString()} MW`,
                  position: 'top',
                  fill: '#10b981',
                  fontSize: 11,
                  fontFamily: 'monospace',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="forecast_generation_mw"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isSelected = payload.is_selected;
                const isEligible = payload.is_eligible_under_cutoff;
                return (
                  <circle
                    key={`dot-${props.index}`}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : 4}
                    fill={isSelected ? '#06b6d4' : isEligible ? '#0284c7' : '#64748b'}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                );
              }}
              activeDot={{ r: 7, fill: '#38bdf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-navy-800/80 pt-2 font-mono">
        <div>
          Cutoff threshold applied: <span className="text-slate-200">{cutoffLocalTime}</span>
        </div>
        <div>
          {selectedGenerationMw !== null ? (
            <span>
              Selected Benchmark Forecast: <strong className="text-accent-cyan">{selectedGenerationMw.toLocaleString()} MW</strong>
            </span>
          ) : (
            <span className="text-amber-400">No eligible forecast prior to cutoff</span>
          )}
        </div>
      </div>
    </div>
  );
};
