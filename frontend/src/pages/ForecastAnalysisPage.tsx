import React, { useState, useEffect } from 'react';
import { GenerationResponse, ForecastHistoryResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { ForecastVsActualChart } from '../components/charts/ForecastVsActualChart';
import { ForecastHistoryChart } from '../components/charts/ForecastHistoryChart';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { ChartSkeleton, TableSkeleton } from '../components/common/Skeleton';
import { Clock, History, Star, CheckCircle2, XCircle } from 'lucide-react';

export const ForecastAnalysisPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [selectedCutoff, setSelectedCutoff] = useState<CutoffType>('day_ahead_1100');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(24);

  const [genData, setGenData] = useState<GenerationResponse | null>(null);
  const [historyData, setHistoryData] = useState<ForecastHistoryResponse | null>(null);

  const [loadingGen, setLoadingGen] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load generation for the date
  useEffect(() => {
    let isMounted = true;
    const loadGeneration = async () => {
      setLoadingGen(true);
      setError(null);
      try {
        const res = await apiService.getGeneration(selectedDate, selectedCutoff);
        if (isMounted) {
          setGenData(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load generation data.');
        }
      } finally {
        if (isMounted) setLoadingGen(false);
      }
    };
    loadGeneration();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedCutoff]);

  // Load forecast history for the chosen settlement period
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      if (!genData || genData.points.length === 0) return;
      const targetPoint = genData.points.find((p) => p.settlement_period === selectedPeriod);
      if (!targetPoint) return;

      setLoadingHistory(true);
      try {
        const res = await apiService.getForecastHistory(
          targetPoint.start_time,
          selectedCutoff
        );
        if (isMounted) {
          setHistoryData(res);
        }
      } catch (err: any) {
        console.error('Failed to load forecast history:', err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [genData, selectedPeriod, selectedCutoff]);

  const activePoint = genData?.points.find((p) => p.settlement_period === selectedPeriod);

  return (
    <div className="space-y-4">
      {/* Control Header */}
      <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Forecast Selection &amp; Evolution Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect multi-horizon forecast revisions and evaluate point-in-time selection against statutory trading cutoffs
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
              Period: <strong className="text-slate-100">SP {selectedPeriod}</strong> ({activePoint?.start_time_local.split(' ')[1] || 'N/A'})
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          <DateSelector
            selectedDate={selectedDate}
            onChange={setSelectedDate}
            disabled={loadingGen}
          />
          <CutoffSelector
            selectedCutoff={selectedCutoff}
            onChange={setSelectedCutoff}
            disabled={loadingGen}
          />
        </div>
      </div>

      {loadingGen && (
        <div className="space-y-4">
          <ChartSkeleton height={340} />
          <ChartSkeleton height={260} />
        </div>
      )}

      {error && !loadingGen && <ErrorAlert title="API Error" message={error} />}

      {!loadingGen && genData && (
        <>
          {/* Main Forecast vs Actual Chart */}
          <ForecastVsActualChart
            data={genData.points}
            title={`Delivery Day ${genData.settlement_date}: Generation Profile vs Selected Forecast`}
            subtitle="Click on any settlement period below in the timeline to inspect its historical forecast submissions"
          />

          {/* Settlement Period Selector Timeline (1-48) */}
          <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <h3 className="text-xs font-medium text-slate-200">
                  Settlement Period Selector (48 Half-Hour Intervals)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Active: <strong className="text-sky-300">SP {selectedPeriod}</strong> ({activePoint?.start_time_local ?? 'N/A'})
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-24 gap-1">
              {genData.points.map((p) => {
                const isSelected = p.settlement_period === selectedPeriod;
                const err = p.error_mw;
                return (
                  <button
                    key={p.settlement_period}
                    onClick={() => setSelectedPeriod(p.settlement_period)}
                    className={`p-1 text-center rounded text-[11px] font-mono transition-colors ${
                      isSelected
                        ? 'bg-sky-900/80 text-sky-200 font-bold border border-sky-600'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                    title={`SP ${p.settlement_period} (${p.start_time_local.split(' ')[1]}): ${
                      p.actual_generation_mw !== null ? `${p.actual_generation_mw.toLocaleString()} MW` : 'Missing'
                    }`}
                  >
                    <div>{p.settlement_period}</div>
                    <div
                      className={`text-[9px] ${
                        err !== null && err > 0
                          ? 'text-amber-400'
                          : err !== null && err < 0
                          ? 'text-sky-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {p.start_time_local.split(' ')[1]?.slice(0, 5)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deep-Dive Waterfall Section */}
          <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-sky-400" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Settlement Period {selectedPeriod} Forecast Evolution Waterfall
                  </h3>
                  <p className="text-xs text-slate-400">
                    Delivery Interval: {historyData?.target_delivery_time_local || activePoint?.start_time_local}
                  </p>
                </div>
              </div>

              {/* Side-by-side snapshot */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Actual Outturn: </span>
                  <strong className="text-emerald-400 tabular-nums">
                    {activePoint?.actual_generation_mw !== null
                      ? `${activePoint?.actual_generation_mw?.toLocaleString()} MW`
                      : 'N/A'}
                  </strong>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Selected Benchmark: </span>
                  <strong className="text-sky-300 tabular-nums">
                    {historyData?.selected_forecast_generation_mw !== null
                      ? `${historyData?.selected_forecast_generation_mw?.toLocaleString()} MW`
                      : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {loadingHistory && <TableSkeleton rows={4} />}

            {!loadingHistory && historyData && (
              <>
                {/* Waterfall progression chart */}
                <ForecastHistoryChart
                  publications={historyData.forecast_publications}
                  actualGenerationMw={historyData.actual_generation_mw}
                  selectedGenerationMw={historyData.selected_forecast_generation_mw}
                  cutoffLocalTime={historyData.selected_cutoff_time_local}
                  deliveryTimeLocal={historyData.target_delivery_time_local}
                />

                {/* Detailed Publications Audit Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-sans">
                    <span className="font-medium text-slate-300">
                      All Registered WINDFOR Publications for this Settlement Period ({historyData.total_publications} Submissions)
                    </span>
                    <span className="font-mono text-[11px]">
                      Cutoff Enforced: {historyData.selected_cutoff_time_local}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded border border-slate-800 bg-slate-900/60">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#0a0f1d] text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2 px-3 font-medium text-[11px]">Publication Time (London)</th>
                          <th className="py-2 px-3 font-medium text-[11px]">Publication Time (UTC)</th>
                          <th className="py-2 px-3 font-medium text-[11px] text-right">Forecast (MW)</th>
                          <th className="py-2 px-3 font-medium text-[11px] text-right">Lead Time</th>
                          <th className="py-2 px-3 font-medium text-[11px] text-center">Cutoff Status</th>
                          <th className="py-2 px-3 font-medium text-[11px] text-center">Selected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {historyData.forecast_publications.map((pub, idx) => (
                          <tr
                            key={idx}
                            className={`transition-colors ${
                              pub.is_selected
                                ? 'bg-sky-950/40 font-medium'
                                : pub.is_eligible_under_cutoff
                                ? 'hover:bg-slate-850/50'
                                : 'opacity-40 hover:opacity-75'
                            }`}
                          >
                            <td className="py-2 px-3 text-slate-300">{pub.publish_time_local}</td>
                            <td className="py-2 px-3 text-slate-500">{pub.publish_time}</td>
                            <td className="py-2 px-3 text-right font-bold text-sky-400 tabular-nums">
                              {pub.forecast_generation_mw.toLocaleString()} MW
                            </td>
                            <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                              {pub.lead_time_hours}h
                            </td>
                            <td className="py-2 px-3 text-center">
                              {pub.is_eligible_under_cutoff ? (
                                <span className="inline-flex items-center text-emerald-400 text-[11px]">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Eligible
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-slate-500 text-[11px]">
                                  <XCircle className="w-3 h-3 mr-1" /> After Cutoff
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {pub.is_selected && (
                                <span className="inline-flex items-center text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800 text-[10px] font-bold">
                                  <Star className="w-2.5 h-2.5 mr-1 fill-sky-300" /> SELECTED
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
