import React from 'react';
import { ExposureSummary, PairedGenerationPoint } from '../../types/api';
import { ShieldAlert, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { ProcurementExposureChart } from '../charts/ProcurementExposureChart';

interface ProcurementExposureWidgetProps {
  exposure: ExposureSummary;
  generationPoints?: PairedGenerationPoint[];
}

export const ProcurementExposureWidget: React.FC<ProcurementExposureWidgetProps> = ({
  exposure,
  generationPoints,
}) => {
  const isNetShort = exposure.dominant_risk_category === 'NET_SHORT_EXPOSURE';
  const isNetLong = exposure.dominant_risk_category === 'NET_LONG_EXPOSURE';

  const formatMwh = (val: number, isUnderforecast = false) => {
    const formatted = val.toLocaleString(undefined, {
      minimumFractionDigits: val % 1 === 0 ? 0 : 1,
      maximumFractionDigits: 1,
    });
    if (isUnderforecast) {
      return `-${formatted}`;
    }
    return val > 0 ? `+${formatted}` : formatted;
  };

  return (
    <div className="rounded-lg border border-slate-800/90 bg-[#0e1526] p-4 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Day-Ahead Procurement Exposure Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Balancing mechanism volume exposure derived from aggregate wind forecast deviations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isNetShort && (
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 inline-flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Net Short Position
            </span>
          )}
          {isNetLong && (
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 inline-flex items-center gap-1.5 font-mono">
              <TrendingDown className="w-3.5 h-3.5 text-sky-400" /> Net Long Position
            </span>
          )}
          {!isNetShort && !isNetLong && (
            <span className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 text-slate-300 border border-slate-700 inline-flex items-center gap-1.5 font-mono">
              <Scale className="w-3.5 h-3.5 text-slate-400" /> Relatively Balanced
            </span>
          )}
        </div>
      </div>

      {/* Top 3 Core Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Overforecast Energy */}
        <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-300">
                Total Overforecast Energy
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80">
                SHORT RISK
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                {formatMwh(exposure.overforecast_energy_mwh)}
              </span>
              <span className="text-xs text-slate-400 font-mono">MWh</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between font-mono pt-2 border-t border-slate-800">
            <span>Peak single period:</span>
            <span className="font-semibold text-amber-300 tabular-nums">
              +{exposure.max_single_period_overforecast_mw.toLocaleString()} MW
            </span>
          </div>
        </div>

        {/* Total Underforecast Energy */}
        <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-300">
                Total Underforecast Energy
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80">
                LONG SURPLUS
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-sky-400">
                {formatMwh(exposure.underforecast_energy_mwh, true)}
              </span>
              <span className="text-xs text-slate-400 font-mono">MWh</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between font-mono pt-2 border-t border-slate-800">
            <span>Peak single period:</span>
            <span className="font-semibold text-sky-300 tabular-nums">
              -{exposure.max_single_period_underforecast_mw.toLocaleString()} MW
            </span>
          </div>
        </div>

        {/* Net Energy Variance */}
        <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-300">
                Net Energy Variance
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                NET IMBALANCE
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline space-x-1">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  exposure.net_energy_variance_mwh > 0
                    ? 'text-amber-400'
                    : exposure.net_energy_variance_mwh < 0
                    ? 'text-sky-400'
                    : 'text-slate-100'
                }`}
              >
                {formatMwh(exposure.net_energy_variance_mwh)}
              </span>
              <span className="text-xs text-slate-400 font-mono">MWh</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between font-mono pt-2 border-t border-slate-800">
            <span>Net position:</span>
            <span className="font-semibold text-slate-200">
              {exposure.net_energy_variance_mwh > 0
                ? 'Net Short (Deficit)'
                : exposure.net_energy_variance_mwh < 0
                ? 'Net Long (Surplus)'
                : 'Balanced'}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Chart Visualization */}
      <ProcurementExposureChart
        exposure={exposure}
        generationPoints={generationPoints}
      />

      {/* Compliance / Market Disclaimer */}
      <div className="text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800 leading-relaxed">
        <span className="text-slate-300 font-semibold font-sans">Market Rule Note:</span>{' '}
        {exposure.disclaimer ||
          'Illustrative wind forecast exposure only. Does not claim to know utility actual customer demand.'}
      </div>
    </div>
  );
};
