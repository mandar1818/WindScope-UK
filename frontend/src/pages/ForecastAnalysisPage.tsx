import React, { useState, useEffect } from 'react';
import { GenerationResponse, ForecastHistoryResponse, CutoffType } from '../types/api';
import { apiService } from '../services/api';
import { DateSelector } from '../components/common/DateSelector';
import { CutoffSelector } from '../components/common/CutoffSelector';
import { ForecastVsActualChart } from '../components/charts/ForecastVsActualChart';
import { ForecastHistoryChart } from '../components/charts/ForecastHistoryChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { Clock, History, CheckCircle2, XCircle, Star, Layers } from 'lucide-react';

export const ForecastAnalysisPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [selectedCutoff, setSelectedCutoff] = useState<CutoffType>('day_ahead_1100');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(24); // Noon SP 24
  
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
    return () => { isMounted = false; };
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
    return () => { isMounted = false; };
  }, [genData, selectedPeriod, selectedCutoff]);

  const activePoint = genData?.points.find((p) => p.settlement_period === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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

      {loadingGen && <LoadingSpinner message="Loading generation profile..." />}
      {error && <ErrorAlert title="API Error" message={error} />}

      {!loadingGen && genData && (
        <>
          {/* Main Forecast vs Actual Chart */}
          <ForecastVsActualChart
            data={genData.points}
            title={`Delivery Day ${genData.settlement_date}: 30-Minute Generation vs Selected Forecast`}
            subtitle="Click on any settlement period below to inspect the historical forecast evolution waterfall"
          />

          {/* Period Selector Strip */}
          <div className="rounded-xl border border-navy-700 bg-navy-900/90 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-accent-teal" />
                <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                  Select Settlement Period for Deep-Dive Historical Analysis
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Active: <strong className="text-accent-cyan">SP {selectedPeriod}</strong> ({activePoint?.start_time_local ?? 'N/A'})
              </span>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-24 gap-1">
              {genData.points.map((p) => {
                const isSelected = p.settlement_period === selectedPeriod;
                const err = p.error_mw;
                return (
                  <button
                    key={p.settlement_period}
                    onClick={() => setSelectedPeriod(p.settlement_period)}
                    className={`p-1 text-center rounded text-[11px] font-mono transition-all ${
                      isSelected
                        ? 'bg-accent-teal text-navy-950 font-bold ring-2 ring-cyan-400 scale-105 z-10'
                        : 'bg-navy-950 text-slate-300 hover:bg-navy-800 border border-navy-800'
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
                          ? 'text-cyan-400'
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

          {/* Forecast History Waterfall Deep-Dive Section */}
          <div className="rounded-xl border border-navy-700 bg-navy-900/90 p-5 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-navy-800 gap-2">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-accent-cyan" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 tracking-wide">
                    Settlement Period {selectedPeriod} Historical Forecast Updates
                  </h3>
                  <p className="text-xs text-slate-400">
                    Delivery Start: {historyData?.target_delivery_time_local || activePoint?.start_time_local}
                  </p>
                </div>
              </div>

              {/* Side-by-side snapshot */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="px-3 py-1 rounded bg-navy-950 border border-navy-800">
                  <span className="text-slate-400">Actual Outturn: </span>
                  <strong className="text-emerald-400">
                    {activePoint?.actual_generation_mw !== null ? `${activePoint?.actual_generation_mw?.toLocaleString()} MW` : 'N/A'}
                  </strong>
                </div>
                <div className="px-3 py-1 rounded bg-navy-950 border border-navy-800">
                  <span className="text-slate-400">Selected ({selectedCutoff}): </span>
                  <strong className="text-cyan-400">
                    {historyData?.selected_forecast_generation_mw !== null ? `${historyData?.selected_forecast_generation_mw?.toLocaleString()} MW` : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>

            {loadingHistory && <LoadingSpinner message="Ingesting multi-horizon forecast history..." />}

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

                {/* Publications Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-navy-950 text-slate-400 border-b border-navy-800">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold uppercase">Publication Time (London)</th>
                        <th className="py-2.5 px-3 font-semibold uppercase">Publication Time (UTC)</th>
                        <th className="py-2.5 px-3 font-semibold uppercase text-right text-cyan-400">Forecast (MW)</th>
                        <th className="py-2.5 px-3 font-semibold uppercase text-right">Lead Time</th>
                        <th className="py-2.5 px-3 font-semibold uppercase text-center">Cutoff Status</th>
                        <th className="py-2.5 px-3 font-semibold uppercase text-center">Selection Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800/60">
                      {historyData.forecast_publications.map((pub, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-navy-800/40 ${pub.is_selected ? 'bg-accent-teal/15 font-semibold' : ''}`}
                        >
                          <td className="py-2 px-3 text-slate-200">{pub.publish_time_local}</td>
                          <td className="py-2 px-3 text-slate-400">{pub.publish_time}</td>
                          <td className="py-2 px-3 text-right text-cyan-300 font-bold">
                            {pub.forecast_generation_mw.toLocaleString()} MW
                          </td>
                          <td className="py-2 px-3 text-right text-slate-300">{pub.lead_time_hours} hours</td>
                          <td className="py-2 px-3 text-center">
                            {pub.is_eligible_under_cutoff ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Eligible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
                                <XCircle className="w-3 h-3" /> Exceeded Cutoff
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {pub.is_selected ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-accent-cyan bg-cyan-950 px-2 py-0.5 rounded border border-cyan-700 font-bold">
                                <Star className="w-3 h-3 fill-accent-cyan text-accent-cyan" /> Selected Benchmark
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
