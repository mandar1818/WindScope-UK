import React from 'react';
import { ExposureSummary } from '../../types/api';
import { TrendingUp, TrendingDown, ShieldAlert, AlertCircle } from 'lucide-react';

interface ProcurementExposureWidgetProps {
  exposure: ExposureSummary;
}

export const ProcurementExposureWidget: React.FC<ProcurementExposureWidgetProps> = ({ exposure }) => {
  const isNetShort = exposure.dominant_risk_category === 'NET_SHORT_EXPOSURE';
  const isNetLong = exposure.dominant_risk_category === 'NET_LONG_EXPOSURE';

  return (
    <div className="rounded-xl border border-navy-700 bg-navy-900/90 p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-accent-amber" />
            <h3 className="text-sm font-bold text-slate-100 tracking-wide">
              Day-Ahead Procurement Exposure Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Illustrative balancing mechanism exposure derived from aggregate wind forecast deviations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isNetShort && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-950/80 text-accent-amber border border-amber-800/60 inline-flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" /> Net Short Position
            </span>
          )}
          {isNetLong && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-950/80 text-accent-cyan border border-cyan-800/60 inline-flex items-center gap-1 font-mono">
              <TrendingDown className="w-3.5 h-3.5" /> Net Long Position
            </span>
          )}
          {!isNetShort && !isNetLong && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-navy-800 text-slate-300 border border-navy-700 inline-flex items-center gap-1 font-mono">
              Relatively Balanced
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg bg-navy-950/80 p-3 border border-navy-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Overforecast Energy
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-amber-400">
              +{exposure.overforecast_energy_mwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">MWh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Max single period: +{exposure.max_single_period_overforecast_mw.toLocaleString()} MW
          </div>
        </div>

        <div className="rounded-lg bg-navy-950/80 p-3 border border-navy-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Underforecast Energy
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-cyan-400">
              -{exposure.underforecast_energy_mwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">MWh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Max single period: -{exposure.max_single_period_underforecast_mw.toLocaleString()} MW
          </div>
        </div>

        <div className="rounded-lg bg-navy-950/80 p-3 border border-navy-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Net Wind Energy Variance
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span
              className={`text-xl font-bold font-mono ${
                exposure.net_energy_variance_mwh > 0
                  ? 'text-amber-400'
                  : exposure.net_energy_variance_mwh < 0
                  ? 'text-cyan-400'
                  : 'text-slate-300'
              }`}
            >
              {exposure.net_energy_variance_mwh > 0 ? `+` : ''}
              {exposure.net_energy_variance_mwh.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">MWh</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Net day imbalance volume
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-navy-850 p-3.5 border border-navy-700/80">
        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Market Consequence & Balancing Mechanism Dynamics
        </h4>
        <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-sans">
          {exposure.risk_explanation}
        </p>
      </div>

      <div className="mt-3 flex items-start space-x-2 text-[11px] text-slate-400 italic">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <span>{exposure.disclaimer}</span>
      </div>
    </div>
  );
};
