import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Clock,
  Calculator,
  AlertCircle,
  FileCode,
  CheckCircle2,
  Cpu,
  Layers,
  Scale,
  Zap,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 text-slate-200">
      {/* Page Title */}
      <div className="border-b border-navy-700/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-navy-800 border border-navy-700 text-accent-teal">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-wide font-sans">
              Technical Methodology &amp; Market Architecture Reference
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Authoritative engineering specification for WindScope UK — Wind Power Forecasting &amp; Day-Ahead Procurement Analytics
            </p>
          </div>
        </div>
      </div>

      {/* 1. Official Data Sources */}
      <section className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-sans">
          <FileCode className="w-5 h-5 text-accent-cyan" />
          1. Elexon BMRS Datasets &amp; Stream API Integration
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          WindScope UK ingests data exclusively from the official Elexon Balancing Mechanism Reporting Service (BMRS)
          Insights Solution REST API. The application integrates the two authoritative datasets mandated for Great Britain
          transmission-connected wind power evaluation:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <div className="font-bold text-emerald-400 font-sans flex items-center justify-between">
              <span>Actual Outturn: FUELHH</span>
              <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Metered</span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Half-hourly generation outturn by fuel type across Great Britain.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Endpoint: <code className="text-cyan-300">GET /datasets/FUELHH/stream</code></li>
              <li>Filter: <code className="text-cyan-300">fuelType = 'WIND'</code></li>
              <li>Delivery timestamp: <code className="text-cyan-300">startTime</code> (UTC ISO 8601)</li>
              <li>Actual generation: <code className="text-cyan-300">generation</code> (MW)</li>
              <li>Resolution: 30 minutes (Settlement Periods 1 to 48)</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <div className="font-bold text-cyan-400 font-sans flex items-center justify-between">
              <span>Forecast Generation: WINDFOR</span>
              <span className="text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">Forecast</span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              National wind generation forecasts submitted to and published by NESO.
            </p>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Endpoint: <code className="text-cyan-300">GET /datasets/WINDFOR/stream</code></li>
              <li>Delivery timestamp: <code className="text-cyan-300">startTime</code> (UTC ISO 8601)</li>
              <li>Publication timestamp: <code className="text-cyan-300">publishTime</code> (UTC ISO 8601)</li>
              <li>Forecast generation: <code className="text-cyan-300">generation</code> (MW)</li>
              <li>Cadence: Hourly forecast submissions mapped to half-hour settlement periods</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Point-in-Time Forecast Selection & Prevention of Look-Ahead Bias */}
      <section className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-sans">
          <ShieldCheck className="w-5 h-5 text-accent-teal" />
          2. Point-in-Time Forecast Selection &amp; Prevention of Look-Ahead Bias
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          A fundamental trap in electricity trading analytics is <em>look-ahead bias</em> — using a weather model forecast
          that was published after a commercial auction gate had already closed. WindScope UK strictly enforces point-in-time
          historical selection to replicate the exact information available to a trader at the moment of order placement:
        </p>

        <div className="rounded-lg bg-navy-950 p-4 border border-navy-800 text-xs font-mono space-y-2.5">
          <div className="font-bold text-accent-cyan font-sans uppercase tracking-wider text-[11px]">
            Execution Algorithm per 30-Minute Delivery Period (T):
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-sans">
            <li>
              <strong>Identify Target Horizon:</strong> Determine the delivery start time <code className="text-cyan-300 font-mono">startTime = T</code> and convert to London local calendar date <code className="text-cyan-300 font-mono">D</code>.
            </li>
            <li>
              <strong>Compute Decision Cutoff:</strong> Calculate the exact decision boundary threshold <code className="text-cyan-300 font-mono">Cutoff(T)</code> in UTC.
            </li>
            <li>
              <strong>Exclude Ineligible Forecasts:</strong> Discard any forecast record where <code className="text-rose-400 font-mono">publishTime &gt; Cutoff(T)</code>.
            </li>
            <li>
              <strong>Select Latest Eligible Publication:</strong> From all remaining eligible forecasts (<code className="text-emerald-400 font-mono">publishTime &le; Cutoff(T)</code>), select the record with the maximum <code className="text-cyan-300 font-mono">publishTime</code>.
            </li>
            <li>
              <strong>Audit Record:</strong> Retain the selected forecast's exact <code className="text-cyan-300 font-mono">publishTime</code> alongside delivery outturn for auditability.
            </li>
          </ol>
        </div>
      </section>

      {/* 3. Decision Cutoffs & Market Relevancy */}
      <section className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-sans">
          <Clock className="w-5 h-5 text-accent-cyan" />
          3. Decision Cutoffs &amp; GB Power Market Relevancy
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The pilot provides 5 configurable cutoff points corresponding to statutory Balancing and Settlement Code (BSC)
          and Power Exchange market deadlines:
        </p>

        <div className="space-y-3 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-accent-teal text-sm">Day-Ahead 11:00 GMT (Primary Benchmark)</strong>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                EPEX SPOT / Nord Pool Auction
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Order books close at 11:00 GMT on Day D-1 for the primary GB Day-Ahead Power Auction. Trading desks clear
              forward physical positions based on wind forecasts published prior to 11:00.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-slate-200 text-sm">Day-Ahead 12:00 GMT (Midday Cutoff)</strong>
              <span className="text-[10px] bg-navy-900 text-slate-300 px-2 py-0.5 rounded border border-navy-700">
                Secondary Auction
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              European Internal Energy Market (IEM) coupled auction clearing and midday commercial adjustments.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-slate-200 text-sm">Day-Ahead 17:00 GMT (Evening Schedule Freeze)</strong>
              <span className="text-[10px] bg-navy-900 text-slate-300 px-2 py-0.5 rounded border border-navy-700">
                Initial Physical Notification (IPN)
              </span>
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Deadline for submission of Initial Physical Notifications (IPNs) to NESO, freezing preliminary generator dispatch schedules.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-slate-200 text-sm">Gate Closure (-1h) &amp; Intraday (-2h)</strong>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
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
      <section className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-sans">
          <Calculator className="w-5 h-5 text-accent-teal" />
          4. Mathematical Accuracy Formulations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-cyan-400 font-sans uppercase">Mean Absolute Error (MAE)</span>
            <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
              MAE = (1 / N) * &sum; |Forecast_i - Actual_i|
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Measures the average magnitude of forecast errors in Megawatts (MW) without considering direction.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-emerald-400 font-sans uppercase">Root Mean Squared Error (RMSE)</span>
            <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
              RMSE = &radic; [ (1 / N) * &sum; (Forecast_i - Actual_i)&sup2; ]
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Heavily penalizes extreme forecast misses due to squaring. Critical for reserve sizing.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-accent-teal font-sans uppercase">Weighted Absolute Percentage Error (WAPE)</span>
            <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
              WAPE (%) = [ &sum; |Forecast_i - Actual_i| / &sum; |Actual_i| ] * 100
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Overcomes zero-denominator anomalies of MAPE during calm periods by weighting errors across total generation volume.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-amber-400 font-sans uppercase">Forecast Bias &amp; Directional Sign</span>
            <div className="bg-[#070d19] p-2 rounded text-slate-200 border border-navy-850">
              Bias = (1 / N) * &sum; (Forecast_i - Actual_i)
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Positive bias (+MW) = Overforecasting (Short risk); Negative bias (-MW) = Underforecasting (Long risk).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pilot Scope Boundaries & Regulatory Disclaimers */}
      <section className="rounded-lg border border-navy-700/80 bg-[#0c1427] p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 font-sans">
          <AlertCircle className="w-5 h-5 text-accent-amber" />
          5. Data Scope Boundaries &amp; Regulatory Disclaimers
        </h3>
        <div className="space-y-2 text-xs text-slate-300 font-sans leading-relaxed">
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
