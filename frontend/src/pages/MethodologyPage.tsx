import React from 'react';
import { BookOpen, ShieldCheck, Clock, Calculator, AlertCircle, FileCode, CheckCircle2 } from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 text-slate-200">
      {/* Page Title */}
      <div className="border-b border-navy-700 pb-4">
        <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-accent-teal" />
          Technical Methodology & Market Architecture Reference
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete engineering specification for WindScope UK — Wind Power Forecasting & Day-Ahead Procurement Analytics
        </p>
      </div>

      {/* 1. Official Data Sources */}
      <section className="rounded-xl border border-navy-700 bg-navy-900/90 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-accent-cyan" />
          1. Elexon BMRS Datasets & Stream API Integration
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          WindScope UK ingests data exclusively from the official Elexon Balancing Mechanism Reporting Service (BMRS)
          Insights Solution REST API. The pilot integrates the two authoritative datasets mandated for UK wind power evaluation:
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
              <li>Delivery timestamp: <code className="text-cyan-300">startTime</code></li>
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
              <li>Delivery timestamp: <code className="text-cyan-300">startTime</code></li>
              <li>Publication timestamp: <code className="text-cyan-300">publishTime</code></li>
              <li>Forecast generation: <code className="text-cyan-300">generation</code> (MW)</li>
              <li>Multiple forecasts published per period as weather models update</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 2. Point-in-Time Forecast Selection */}
      <section className="rounded-xl border border-navy-700 bg-navy-900/90 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-teal" />
          2. Point-in-Time Forecast Selection & Prevention of Look-Ahead Bias
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          A fundamental pitfall in electricity trading analytics is <em>look-ahead bias</em> — using a forecast that was
          published after a commercial trading decision had already been executed. WindScope UK enforces a strict
          point-in-time selection methodology:
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
              <strong>Exclude Ineligible Forecasts:</strong> Discard any forecast record where <code className="text-red-400 font-mono">publishTime &gt; Cutoff(T)</code>.
            </li>
            <li>
              <strong>Select Latest Eligible Publication:</strong> From all remaining eligible forecasts (<code className="text-emerald-400 font-mono">publishTime &le; Cutoff(T)</code>), select the record with the maximum <code className="text-cyan-300 font-mono">publishTime</code>.
            </li>
            <li>
              <strong>Audit Record:</strong> Retain the selected forecast's exact <code className="text-cyan-300 font-mono">publishTime</code> alongside delivery outturn for verification.
            </li>
          </ol>
        </div>
      </section>

      {/* 3. Decision Cutoffs & Market Deadlines */}
      <section className="rounded-xl border border-navy-700 bg-navy-900/90 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-amber" />
          3. Decision Cutoffs & Great Britain Electricity Market Processes
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          In the British Electricity Trading and Transmission Arrangements (BETTA / Balancing and Settlement Code),
          utilities commit physical and financial positions across distinct market horizons:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="font-bold text-accent-cyan flex justify-between">
              <span>Day-Ahead 11:00 London Time (EPEX SPOT & Nord Pool GB Auction Deadline)</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">Primary Pilot Benchmark</span>
            </div>
            <p className="text-slate-300 mt-1">
              Order books for the primary GB Day-Ahead Power Exchange auctions close daily at 11:00 UK local time on Day D-1.
              Utility trading desks must submit firm volume and price orders prior to 11:00 GMT.
              This cutoff selects the newest forecast available to traders when placing day-ahead commitments.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="font-bold text-slate-200">
              Day-Ahead 12:00 London Time (Noon Cutoff)
            </div>
            <p className="text-slate-300 mt-1">
              Used for secondary power exchange auctions, interconnectors, and midday portfolio re-balancing.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="font-bold text-slate-200">
              Day-Ahead 17:00 London Time (Evening Schedule Freeze / Physical Notifications)
            </div>
            <p className="text-slate-300 mt-1">
              Sets thermal generator synchronisation schedules and initial Physical Notifications (PNs) to NESO.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="font-bold text-slate-200">
              Intraday Gate Closure (1 Hour Prior to Delivery)
            </div>
            <p className="text-slate-300 mt-1">
              Statutory BSC Gate Closure occurs exactly 1 hour prior to each settlement period start (T - 60 minutes).
              After this deadline, bilateral contract notifications cannot be altered and the System Operator balances the grid.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Accuracy Metric Definitions */}
      <section className="rounded-xl border border-navy-700 bg-navy-900/90 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-accent-teal" />
          4. Quantitative Accuracy Metrics & Error Sign Conventions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <div className="font-bold text-slate-200 font-sans">Mean Absolute Error (MAE)</div>
            <div className="bg-navy-900 p-2 rounded text-cyan-300">
              MAE = (1 / N) * ∑ |Forecast_i - Actual_i|
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Direct average deviation in MW. Intuitive benchmark of expected operational error.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <div className="font-bold text-slate-200 font-sans">Root Mean Squared Error (RMSE)</div>
            <div className="bg-navy-900 p-2 rounded text-emerald-300">
              RMSE = √ [ (1 / N) * ∑ (Forecast_i - Actual_i)² ]
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Penalizes large errors quadratically. Critical for estimating balancing reserve requirements.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <div className="font-bold text-slate-200 font-sans">Weighted Absolute Percentage Error (WAPE)</div>
            <div className="bg-navy-900 p-2 rounded text-accent-teal">
              WAPE (%) = [ ∑ |Forecast_i - Actual_i| / ∑ |Actual_i| ] * 100
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              Total volume miss relative to total wind generated. Guarded against division-by-zero when actual wind generation is zero.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-navy-800 space-y-2">
            <div className="font-bold text-slate-200 font-sans">Forecast Bias & Sign Convention</div>
            <div className="bg-navy-900 p-2 rounded text-amber-300">
              Bias = (1 / N) * ∑ (Forecast_i - Actual_i)
            </div>
            <p className="text-slate-300 font-sans text-[11px]">
              <strong>Positive Bias (+MW):</strong> Overforecasting (wind outturn fell short of expectations).<br />
              <strong>Negative Bias (-MW):</strong> Underforecasting (wind outturn exceeded expectations).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Procurement Decision Support */}
      <section className="rounded-xl border border-navy-700 bg-navy-900/90 p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-accent-amber" />
          5. Procurement Decision Support & Balancing Mechanism Exposure
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Wind power forecast errors directly impact day-ahead trading and physical balancing cash-out:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 rounded-lg bg-navy-950 border border-amber-900/60 space-y-2">
            <h4 className="font-bold text-amber-400">Overforecasting Consequence (System Short)</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When wind generation is overforecasted, the utility assumes more renewable power will be available
              than materializes. In the Day-Ahead market, the utility procures less thermal/import power or sells more power forward.
              During delivery, the portfolio is short of energy and must buy imbalance volume at the <strong>System Buy Price (SBP)</strong>,
              often experiencing severe peak balancing cash-out penalties.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-navy-950 border border-cyan-900/60 space-y-2">
            <h4 className="font-bold text-cyan-400">Underforecasting Consequence (System Long)</h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              When wind generation is underforecasted, excess uncontracted wind energy is generated during delivery.
              The utility may have unnecessarily purchased expensive thermal/import power in the day-ahead market.
              The surplus spill energy is cashed out at the <strong>System Sell Price (SSP)</strong>,
              which can drop to zero or negative prices during windy low-demand periods.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-navy-950 p-3.5 border border-navy-800 text-xs text-slate-400 italic">
          <strong>Compliance Notice:</strong> WindScope UK evaluates national metered wind generation forecasts only.
          It does not fabricate customer demand curves, embedded solar, or thermal generation fleets.
          Energy variance figures represent illustrative wind exposure rather than final utility imbalance.
        </div>
      </section>

      {/* 6. Timezone Conventions */}
      <section className="rounded-xl border border-navy-700 bg-navy-900/90 p-6 shadow-xl space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-cyan" />
          6. Timezone Conventions & Evaluation Boundary
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          All delivery periods evaluated in this pilot are constrained strictly to <strong>January 2026</strong> (2026-01-01 to 2026-01-31).
          In Great Britain, January is on Greenwich Mean Time (GMT, UTC+0).
          However, to ensure rigorous compliance across clock changes throughout the year, the backend uses
          timezone-aware <code className="text-cyan-300 font-mono">Europe/London</code> calendar date boundaries
          and standard UTC serialization.
        </p>
      </section>
    </div>
  );
};

