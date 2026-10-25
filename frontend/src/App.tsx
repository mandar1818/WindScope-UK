import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { ForecastAnalysisPage } from './pages/ForecastAnalysisPage';
import { AccuracyAnalysisPage } from './pages/AccuracyAnalysisPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { apiService } from './services/api';
import { SourceStatus } from './types/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sourceStatus, setSourceStatus] = useState<SourceStatus | null>(null);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await apiService.getDataStatus();
        if (isMounted) {
          setSourceStatus({
            elexon_api_online: res.elexon_api_online,
            fuelhh_available: res.fuelhh_available,
            windfor_available: res.windfor_available,
            is_demonstration_mode: res.is_demonstration_mode,
            demonstration_notice: res.demonstration_notice,
            data_source_description: res.is_demonstration_mode
              ? 'Demonstration Benchmark Mode'
              : 'Elexon BMRS Insights API (Datasets FUELHH & WINDFOR)',
            last_updated_utc: res.last_checked_utc,
          });
        }
      } catch (e) {
        console.warn('Backend data status query failed:', e);
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-accent-teal selection:text-navy-950">
      <Header
        sourceStatus={sourceStatus}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <OverviewPage />}
        {activeTab === 'forecast' && <ForecastAnalysisPage />}
        {activeTab === 'accuracy' && <AccuracyAnalysisPage />}
        {activeTab === 'explorer' && <DataExplorerPage />}
        {activeTab === 'methodology' && <MethodologyPage />}
      </main>

      <footer className="border-t border-navy-800 bg-navy-950 py-6 text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">WindScope UK</span>
            <span>&bull;</span>
            <span>UK Electricity Utility Day-Ahead Trading Analytics</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500 font-sans">
            Authoritative Data: Elexon BMRS Datasets FUELHH (Wind Outturn) &amp; WINDFOR (Wind Forecast)
            <div className="mt-0.5">
              Strictly scoped to January 2026 delivery periods &bull; All times Europe/London (GMT) / UTC
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
