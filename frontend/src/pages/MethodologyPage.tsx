import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Clock,
  Calculator,
  AlertCircle,
  FileCode,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-200">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-sky-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Technical Methodology &amp; Market Architecture Reference
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Engineering specification for WindScope UK — Wind Power Forecasting &amp; Day-Ahead Procurement Analytics
            </p>
          </div>
        </div>
      </div>

      {/* 1. Official Data Sources */}
      <section className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-sky-400" />
          1. Elexon BMRS Datasets &amp; Stream API Integration
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          WindScope UK ingests data exclusively from the official Elexon Balancing Mechanism Reporting Service (BMRS)
          Insights Solution REST API. The platform integrates the two authoritative datasets mandated for Great Britain
          transmission-connected wind power evaluation:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-semibold text-emerald-400 font-sans flex items-center justify-between">
              <span>Actual Outturn: FUELHH</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 text-slate-300">Metered</span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Half-hourly generation outturn by fuel type across Great Britain.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Endpoint: <code className="text-slate-200">GET /datasets/FUELHH/stream</code></li>
              <li>Filter: <code className="text-slate-200">fuelType = 'WIND'</code></li>
              <li>Delivery timestamp: <code className="text-slate-200">startTime</code> (UTC ISO 8601)</li>
              <li>Actual generation: <code className="text-slate-200">generation</code> (MW)</li>
              <li>Resolution: 30 minutes (Settlement Periods 1 to 48)</li>
            </ul>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-2">
            <div className="font-semibold text-sky-400 font-sans flex items-center justify-between">
              <span>Forecast Generation: WINDFOR</span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700 text-slate-300">Forecast</span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              National wind generation forecasts submitted to and published by NESO.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Endpoint: <code className="text-slate-200">GET /datasets/WINDFOR/stream</code></li>
              <li>Delivery timestamp: <code className="text-slate-200">startTime</code> (UTC ISO 8601)</li>
              <li>Publication timestamp: <code className="text-slate-200">publishTime</code> (UTC ISO 8601)</li>
              <li>Forecast generation: <code className="text-slate-200">generation</code> (MW)</li>
              <li>Cadence: Hourly forecast submissions mapped to half-hour settlement periods</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Point-in-Time Forecast Selection & Prevention of Look-Ahead Bias */}
      <section className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          2. Point-in-Time Forecast Selection &amp; Prevention of Look-Ahead Bias
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          A fundamental trap in electricity trading analytics is <em>look-ahead bias</em> — using a weather model forecast
          that was published after a commercial auction gate had already closed. WindScope UK strictly enforces point-in-time
          historical selection to replicate the exact information available to a trader at the moment of order placement:
        </p>

        <div className="rounded bg-slate-900 p-3 border border-slate-800 text-xs font-mono space-y-2">
          <div className="font-semibold text-slate-200 font-sans text-[11px]">
            Execution Algorithm per 30-Minute Delivery Period (T):
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 font-sans">
            <li>
              <strong>Identify Target Horizon:</strong> Determine the delivery start time <code className="text-slate-200 font-mono">startTime = T</code> and convert to London local calendar date <code className="text-slate-200 font-mono">D</code>.
            </li>
            <li>
              <strong>Compute Decision Cutoff:</strong> Calculate the exact decision boundary threshold <code className="text-slate-200 font-mono">Cutoff(T)</code> in UTC.
            </li>
            <li>
              <strong>Exclude Ineligible Forecasts:</strong> Discard any forecast record where <code className="text-rose-400 font-mono">publishTime &gt; Cutoff(T)</code>.
            </li>
            <li>
              <strong>Select Latest Eligible Publication:</strong> From all remaining eligible forecasts (<code className="text-emerald-400 font-mono">publishTime &le; Cutoff(T)</code>), select the record with the maximum <code className="text-slate-200 font-mono">publishTime</code>.
            </li>
            <li>
              <strong>Audit Record:</strong> Retain the selected forecast's exact <code className="text-slate-200 font-mono">publishTime</code> alongside delivery outturn for auditability.
            </li>
          </ol>
        </div>
      </section>

      {/* 3. Decision Cutoffs & Market Relevancy */}
      <section className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          3. Decision Cutoffs &amp; GB Power Market Relevancy
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The system provides 5 configurable cutoff points corresponding to statutory Balancing and Settlement Code (BSC)
          and Power Exchange market deadlines:
        </p>

        <div className="space-y-2.5 text-xs font-mono">
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-sky-300 text-xs">Day-Ahead 11:00 GMT (Primary Benchmark)</strong>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                EPEX SPOT / Nord Pool Auction
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Order books close at 11:00 GMT on Day D-1 for the primary GB Day-Ahead Power Auction. Trading desks clear
              forward physical positions based on wind forecasts published prior to 11:00.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-slate-200 text-xs">Day-Ahead 12:00 GMT (Midday Cutoff)</strong>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Secondary Auction
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              European Internal Energy Market (IEM) coupled auction clearing and midday commercial adjustments.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-slate-200 text-xs">Day-Ahead 17:00 GMT (Physical Notification)</strong>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Initial Physical Notification (IPN)
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Deadline for submission of Initial Physical Notifications (IPNs) to NESO, freezing preliminary generator dispatch schedules.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-slate-200 text-xs">Gate Closure (-1h) &amp; Intraday (-2h)</strong>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Statutory Balancing Mechanism
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Statutory BSC Gate Closure occurs exactly 1 hour prior to settlement period start (startTime - 60 minutes),
              after which no bilateral contract notifications can be registered.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Quantitative Metrics */}
      <section className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-400" />
          4. Mathematical Accuracy Formulations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 font-sans text-[11px]">Mean Absolute Error (MAE)</span>
            <div className="bg-[#0a0f1d] p-2 rounded text-slate-200 border border-slate-800">
              MAE = (1 / N) * &sum; |Forecast_i - Actual_i|
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Measures the average magnitude of forecast errors in Megawatts (MW) without considering direction.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 font-sans text-[11px]">Root Mean Squared Error (RMSE)</span>
            <div className="bg-[#0a0f1d] p-2 rounded text-slate-200 border border-slate-800">
              RMSE = &radic; [ (1 / N) * &sum; (Forecast_i - Actual_i)&sup2; ]
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Heavily penalizes extreme forecast misses due to squaring. Critical for reserve sizing.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 font-sans text-[11px]">Weighted Absolute Percentage Error (WAPE)</span>
            <div className="bg-[#0a0f1d] p-2 rounded text-slate-200 border border-slate-800">
              WAPE (%) = [ &sum; |Forecast_i - Actual_i| / &sum; |Actual_i| ] * 100
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Overcomes zero-denominator anomalies of MAPE during calm periods by weighting errors across total generation volume.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-slate-200 font-sans text-[11px]">Forecast Bias &amp; Directional Sign</span>
            <div className="bg-[#0a0f1d] p-2 rounded text-slate-200 border border-slate-800">
              Bias = (1 / N) * &sum; (Forecast_i - Actual_i)
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Positive bias (+MW) = Overforecasting (Short risk); Negative bias (-MW) = Underforecasting (Long surplus).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pilot Scope Boundaries & Regulatory Disclaimers */}
      <section className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-2.5">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          5. Data Scope Boundaries &amp; Market Disclaimers
        </h3>
        <div className="space-y-1.5 text-xs text-slate-300 font-sans leading-relaxed">
          <p>
            <strong>1. Delivery Period Scope:</strong> In strict compliance with engineering assignment guidelines, this
            system is scoped to delivery periods in <strong>January 2026 (2026-01-01 to 2026-01-31)</strong>. Dates outside this
            window are systematically rejected.
          </p>
          <p>
            <strong>2. Transmission Fleet Metering:</strong> Datasets FUELHH and WINDFOR cover operational transmission-connected
            wind generation in Great Britain. Embedded distribution-connected wind is not directly metered in these feeds.
          </p>
          <p>
            <strong>3. Illustrative Imbalance Exposure:</strong> The energy variance indicators (MWh) calculate aggregate wind
            forecast volume deviations across GB. They illustrate physical imbalance exposure and do not constitute actual utility
            portfolio imbalance settlement charges, which depend on final contractual bilateral notifications and System Price cash-out.
          </p>
          <p>
            <strong>4. Authoritative Data Integrity:</strong> When live Elexon BMRS streaming APIs are reachable, real metered
            and forecast records are processed without synthesis. If external connectivity is lost, demonstration mode is explicitly
            flagged and disclosed.
          </p>
        </div>
      </section>
    </div>
  );
};
