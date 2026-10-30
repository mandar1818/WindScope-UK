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
    <div className="max-w-4xl mx-auto space-y-6 text-nature-text">
      {/* Page Title */}
      <div className="border-b border-nature-border pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-white border border-nature-border text-nature-forest shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-nature-text">
              Technical Methodology &amp; Market Architecture Reference
            </h2>
            <p className="text-xs text-nature-muted mt-0.5">
              Engineering specification for WindScope UK — Wind Power Forecasting &amp; Day-Ahead Procurement Analytics
            </p>
          </div>
        </div>
      </div>

      {/* 1. Official Data Sources */}
      <section className="rounded-lg border border-nature-border bg-white p-5 space-y-3.5 shadow-sm">
        <h3 className="text-sm font-semibold text-nature-text flex items-center gap-2">
          <FileCode className="w-4 h-4 text-nature-forest" />
          1. Elexon BMRS Datasets &amp; Stream API Integration
        </h3>
        <p className="text-xs text-nature-text leading-relaxed font-sans">
          WindScope UK ingests data exclusively from the official Elexon Balancing Mechanism Reporting Service (BMRS)
          Insights Solution REST API. The platform integrates the two authoritative datasets mandated for Great Britain
          transmission-connected wind power evaluation:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-2">
            <div className="font-semibold text-nature-actual font-sans flex items-center justify-between">
              <span>Actual Outturn: FUELHH</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-nature-border text-nature-muted">Metered</span>
            </div>
            <p className="text-nature-text font-sans text-[11px]">
              Half-hourly generation outturn by fuel type across Great Britain.
            </p>
            <ul className="text-[11px] text-nature-muted space-y-1 list-disc list-inside font-sans">
              <li>Endpoint: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">GET /datasets/FUELHH/stream</code></li>
              <li>Filter: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">fuelType = 'WIND'</code></li>
              <li>Delivery timestamp: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">startTime</code> (UTC ISO 8601)</li>
              <li>Actual generation: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">generation</code> (MW)</li>
              <li>Resolution: 30 minutes (Settlement Periods 1 to 48)</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-2">
            <div className="font-semibold text-nature-forecast font-sans flex items-center justify-between">
              <span>Forecast Generation: WINDFOR</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-nature-border text-nature-muted">Forecast</span>
            </div>
            <p className="text-nature-text font-sans text-[11px]">
              National wind generation forecasts submitted to and published by NESO.
            </p>
            <ul className="text-[11px] text-nature-muted space-y-1 list-disc list-inside font-sans">
              <li>Endpoint: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">GET /datasets/WINDFOR/stream</code></li>
              <li>Delivery timestamp: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">startTime</code> (UTC ISO 8601)</li>
              <li>Publication timestamp: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">publishTime</code> (UTC ISO 8601)</li>
              <li>Forecast generation: <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">generation</code> (MW)</li>
              <li>Cadence: Hourly forecast submissions mapped to half-hour settlement periods</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Point-in-Time Forecast Selection & Prevention of Look-Ahead Bias */}
      <section className="rounded-lg border border-nature-border bg-white p-5 space-y-3.5 shadow-sm">
        <h3 className="text-sm font-semibold text-nature-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-nature-forest" />
          2. Point-in-Time Forecast Selection &amp; Prevention of Look-Ahead Bias
        </h3>
        <p className="text-xs text-nature-text leading-relaxed font-sans">
          A fundamental trap in electricity trading analytics is <em>look-ahead bias</em> — using a weather model forecast
          that was published after a commercial auction gate had already closed. WindScope UK strictly enforces point-in-time
          historical selection to replicate the exact information available to a trader at the moment of order placement:
        </p>

        <div className="rounded-md bg-nature-bg p-3.5 border border-nature-border text-xs font-mono space-y-2">
          <div className="font-semibold text-nature-text font-sans text-[11px]">
            Execution Algorithm per 30-Minute Delivery Period (T):
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-nature-text font-sans">
            <li>
              <strong>Identify Target Horizon:</strong> Determine the delivery start time <code className="text-nature-forest font-mono bg-white px-1 py-0.5 rounded border border-nature-border">startTime = T</code> and convert to London local calendar date <code className="text-nature-forest font-mono bg-white px-1 py-0.5 rounded border border-nature-border">D</code>.
            </li>
            <li>
              <strong>Compute Decision Cutoff:</strong> Calculate the exact decision boundary threshold <code className="text-nature-forest font-mono bg-white px-1 py-0.5 rounded border border-nature-border">Cutoff(T)</code> in UTC.
            </li>
            <li>
              <strong>Exclude Ineligible Forecasts:</strong> Discard any forecast record where <code className="text-rose-600 font-mono bg-white px-1 py-0.5 rounded border border-nature-border">publishTime &gt; Cutoff(T)</code>.
            </li>
            <li>
              <strong>Select Latest Eligible Publication:</strong> From all remaining eligible forecasts (<code className="text-nature-actual font-mono bg-white px-1 py-0.5 rounded border border-nature-border">publishTime &le; Cutoff(T)</code>), select the record with the maximum <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">publishTime</code>.
            </li>
            <li>
              <strong>Audit Record:</strong> Retain the selected forecast's exact <code className="text-nature-text font-mono bg-white px-1 py-0.5 rounded border border-nature-border">publishTime</code> alongside delivery outturn for auditability.
            </li>
          </ol>
        </div>
      </section>

      {/* 3. Decision Cutoffs & Market Relevancy */}
      <section className="rounded-lg border border-nature-border bg-white p-5 space-y-3.5 shadow-sm">
        <h3 className="text-sm font-semibold text-nature-text flex items-center gap-2">
          <Clock className="w-4 h-4 text-nature-forest" />
          3. Decision Cutoffs &amp; GB Power Market Relevancy
        </h3>
        <p className="text-xs text-nature-text leading-relaxed font-sans">
          The system provides 5 configurable cutoff points corresponding to statutory Balancing and Settlement Code (BSC)
          and Power Exchange market deadlines:
        </p>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-nature-forest text-xs font-semibold">Day-Ahead 11:00 GMT (Primary Benchmark)</strong>
              <span className="text-[10px] bg-white text-nature-muted px-2 py-0.5 rounded border border-nature-border font-mono">
                EPEX SPOT / Nord Pool Auction
              </span>
            </div>
            <p className="text-nature-text font-sans text-[11px] leading-relaxed">
              Order books close at 11:00 GMT on Day D-1 for the primary GB Day-Ahead Power Auction. Trading desks clear
              forward physical positions based on wind forecasts published prior to 11:00.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-nature-text text-xs font-semibold">Day-Ahead 12:00 GMT (Midday Cutoff)</strong>
              <span className="text-[10px] bg-white text-nature-muted px-2 py-0.5 rounded border border-nature-border font-mono">
                Secondary Auction
              </span>
            </div>
            <p className="text-nature-text font-sans text-[11px] leading-relaxed">
              European Internal Energy Market (IEM) coupled auction clearing and midday commercial adjustments.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-nature-text text-xs font-semibold">Day-Ahead 17:00 GMT (Physical Notification)</strong>
              <span className="text-[10px] bg-white text-nature-muted px-2 py-0.5 rounded border border-nature-border font-mono">
                Initial Physical Notification (IPN)
              </span>
            </div>
            <p className="text-nature-text font-sans text-[11px] leading-relaxed">
              Deadline for submission of Initial Physical Notifications (IPNs) to NESO, freezing preliminary generator dispatch schedules.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1">
            <div className="flex items-center justify-between font-sans">
              <strong className="text-nature-text text-xs font-semibold">Gate Closure (-1h) &amp; Intraday (-2h)</strong>
              <span className="text-[10px] bg-white text-nature-muted px-2 py-0.5 rounded border border-nature-border font-mono">
                Statutory Balancing Mechanism
              </span>
            </div>
            <p className="text-nature-text font-sans text-[11px] leading-relaxed">
              Statutory BSC Gate Closure occurs exactly 1 hour prior to settlement period start (startTime - 60 minutes),
              after which no bilateral contract notifications can be registered.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Quantitative Metrics */}
      <section className="rounded-lg border border-nature-border bg-white p-5 space-y-3.5 shadow-sm">
        <h3 className="text-sm font-semibold text-nature-text flex items-center gap-2">
          <Calculator className="w-4 h-4 text-nature-forest" />
          4. Mathematical Accuracy Formulations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1.5">
            <span className="font-semibold text-nature-text font-sans text-[11px]">Mean Absolute Error (MAE)</span>
            <div className="bg-white p-2 rounded border border-nature-border text-nature-text font-mono font-medium">
              MAE = (1 / N) * &sum; |Forecast_i - Actual_i|
            </div>
            <p className="text-nature-muted font-sans text-[11px]">
              Measures the average magnitude of forecast errors in Megawatts (MW) without considering direction.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1.5">
            <span className="font-semibold text-nature-text font-sans text-[11px]">Root Mean Squared Error (RMSE)</span>
            <div className="bg-white p-2 rounded border border-nature-border text-nature-text font-mono font-medium">
              RMSE = &radic; [ (1 / N) * &sum; (Forecast_i - Actual_i)&sup2; ]
            </div>
            <p className="text-nature-muted font-sans text-[11px]">
              Heavily penalizes extreme forecast misses due to squaring. Critical for reserve sizing.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1.5">
            <span className="font-semibold text-nature-text font-sans text-[11px]">Weighted Absolute Percentage Error (WAPE)</span>
            <div className="bg-white p-2 rounded border border-nature-border text-nature-text font-mono font-medium">
              WAPE (%) = [ &sum; |Forecast_i - Actual_i| / &sum; |Actual_i| ] * 100
            </div>
            <p className="text-nature-muted font-sans text-[11px]">
              Overcomes zero-denominator anomalies of MAPE during calm periods by weighting errors across total generation volume.
            </p>
          </div>

          <div className="p-3.5 rounded-md bg-nature-bg border border-nature-border space-y-1.5">
            <span className="font-semibold text-nature-text font-sans text-[11px]">Forecast Bias &amp; Directional Sign</span>
            <div className="bg-white p-2 rounded border border-nature-border text-nature-text font-mono font-medium">
              Bias = (1 / N) * &sum; (Forecast_i - Actual_i)
            </div>
            <p className="text-nature-muted font-sans text-[11px]">
              Positive bias (+MW) = Overforecasting (Short risk); Negative bias (-MW) = Underforecasting (Long surplus).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pilot Scope Boundaries & Regulatory Disclaimers */}
      <section className="rounded-lg border border-nature-border bg-white p-5 space-y-3 shadow-sm">
        <h3 className="text-sm font-semibold text-nature-text flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-nature-risk" />
          5. Data Scope Boundaries &amp; Market Disclaimers
        </h3>
        <div className="space-y-2 text-xs text-nature-text font-sans leading-relaxed">
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
