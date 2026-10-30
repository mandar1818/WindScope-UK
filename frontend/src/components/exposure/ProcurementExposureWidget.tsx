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
    <div className="rounded-lg border border-nature-border bg-white p-4 space-y-4 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-nature-border gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-nature-risk" />
            <h3 className="text-sm font-semibold text-nature-text">
              Day-Ahead Procurement Exposure Analysis
            </h3>
          </div>
          <p className="text-xs text-nature-muted mt-0.5">
            Balancing mechanism volume exposure derived from aggregate wind forecast deviations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isNetShort && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-nature-risk-light text-nature-risk border border-nature-risk/40 inline-flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-nature-risk" /> Net Short Position
            </span>
          )}
          {isNetLong && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-nature-forest-light text-nature-forest border border-nature-forest/40 inline-flex items-center gap-1.5 font-mono">
              <TrendingDown className="w-3.5 h-3.5 text-nature-forest" /> Net Long Position
            </span>
          )}
          {!isNetShort && !isNetLong && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-nature-bg text-nature-muted border border-nature-border inline-flex items-center gap-1.5 font-mono">
              <Scale className="w-3.5 h-3.5 text-nature-muted" /> Relatively Balanced
            </span>
          )}
        </div>
      </div>

      {/* Top 3 Core Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Overforecast Energy */}
        <div className="rounded-lg bg-nature-bg p-3 border border-nature-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-nature-muted">
              <span className="text-xs font-medium text-nature-text/80">
                Total Overforecast Energy
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-nature-risk-light text-nature-risk border border-nature-risk/40">
                SHORT RISK
              </span>
            </div>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-nature-risk">
                {formatMwh(exposure.overforecast_energy_mwh)}
              </span>
              <span className="text-xs text-nature-muted font-mono font-medium">MWh</span>
            </div>
          </div>
          <div className="text-[11px] text-nature-muted mt-2 flex items-center justify-between font-mono pt-2 border-t border-nature-border">
            <span>Peak single period:</span>
            <span className="font-semibold text-nature-risk tabular-nums">
              +{exposure.max_single_period_overforecast_mw.toLocaleString()} MW
            </span>
          </div>
        </div>

        {/* Total Underforecast Energy */}
        <div className="rounded-lg bg-nature-bg p-3 border border-nature-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-nature-muted">
              <span className="text-xs font-medium text-nature-text/80">
                Total Underforecast Energy
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-nature-forest-light text-nature-forest border border-nature-forest/30">
                LONG SURPLUS
              </span>
            </div>
            <div className="mt-1 flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-nature-forecast">
                {formatMwh(exposure.underforecast_energy_mwh, true)}
              </span>
              <span className="text-xs text-nature-muted font-mono font-medium">MWh</span>
            </div>
          </div>
          <div className="text-[11px] text-nature-muted mt-2 flex items-center justify-between font-mono pt-2 border-t border-nature-border">
            <span>Peak single period:</span>
            <span className="font-semibold text-nature-forecast tabular-nums">
              -{exposure.max_single_period_underforecast_mw.toLocaleString()} MW
            </span>
          </div>
        </div>

        {/* Net Energy Variance */}
        <div className="rounded-lg bg-nature-bg p-3 border border-nature-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-nature-muted">
              <span className="text-xs font-medium text-nature-text/80">
                Net Energy Variance
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-nature-text border border-nature-border">
                NET IMBALANCE
              </span>
            </div>
            <div className="mt-1 flex items-baseline space-x-1">
              <span
                className={`text-2xl font-bold font-mono tabular-nums ${
                  exposure.net_energy_variance_mwh > 0
                    ? 'text-nature-risk'
                    : exposure.net_energy_variance_mwh < 0
                    ? 'text-nature-forecast'
                    : 'text-nature-text'
                }`}
              >
                {formatMwh(exposure.net_energy_variance_mwh)}
              </span>
              <span className="text-xs text-nature-muted font-mono font-medium">MWh</span>
            </div>
          </div>
          <div className="text-[11px] text-nature-muted mt-2 flex items-center justify-between font-mono pt-2 border-t border-nature-border">
            <span>Net position:</span>
            <span className="font-semibold text-nature-text">
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
      <div className="text-[11px] text-nature-muted font-mono bg-nature-bg p-2.5 rounded-md border border-nature-border leading-relaxed">
        <span className="text-nature-text font-semibold font-sans">Market Rule Note:</span>{' '}
        {exposure.disclaimer ||
          'Illustrative wind forecast exposure only. Does not claim to know utility actual customer demand.'}
      </div>
    </div>
  );
};
