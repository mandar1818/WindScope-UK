import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { SystemStatusModal } from './components/layout/SystemStatusModal';
import { OverviewPage } from './pages/OverviewPage';
import { ForecastAnalysisPage } from './pages/ForecastAnalysisPage';
import { AccuracyAnalysisPage } from './pages/AccuracyAnalysisPage';
import { ProcurementExposurePage } from './pages/ProcurementExposurePage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { TestingLabPage } from './pages/TestingLabPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { apiService } from './services/api';
import { SourceStatus } from './types/api';
import { Database, ShieldCheck, Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sourceStatus, setSourceStatus] = useState<SourceStatus | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const fetchSourceStatus = async () => {
    try {
      const res = await apiService.getDataStatus();
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
    } catch (e) {
      console.warn('Backend data status query failed:', e);
    }
  };

  useEffect(() => {
    fetchSourceStatus();
  }, []);

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col font-sans selection:bg-accent-teal selection:text-navy-950">
      {/* Financial Terminal Shell */}
      <div className="flex flex-1">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          sourceStatus={sourceStatus}
          onOpenStatusModal={() => setIsStatusModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Application Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Top Navigation Bar */}
          <TopNav
            activeTab={activeTab}
            sourceStatus={sourceStatus}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenStatusModal={() => setIsStatusModalOpen(true)}
            onRefresh={fetchSourceStatus}
          />

          {/* Main Dashboard Pages Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'overview' && <OverviewPage onNavigate={setActiveTab} />}
            {activeTab === 'forecast' && <ForecastAnalysisPage />}
            {activeTab === 'accuracy' && <AccuracyAnalysisPage />}
            {activeTab === 'exposure' && <ProcurementExposurePage />}
            {activeTab === 'explorer' && <DataExplorerPage />}
            {activeTab === 'testing-lab' && <TestingLabPage />}
            {activeTab === 'methodology' && <MethodologyPage />}
          </main>

          {/* Enterprise Terminal Footer */}
          <footer className="border-t border-navy-800/80 bg-[#070d19] py-5 text-xs text-slate-400 font-mono mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center space-x-2">
                <span className="font-bold text-slate-200">WindScope UK</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-accent-cyan">Enterprise Trading Analytics</span>
                <span className="text-slate-600">&bull;</span>
                <span>GB National Wind Fleet</span>
              </div>

              <div className="text-center md:text-right text-[11px] text-slate-400 font-sans">
                Elexon BMRS Datasets: FUELHH (Metered Outturn) &amp; WINDFOR (Day-Ahead Forecasts)
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Evaluation Scope: January 2026 &bull; Timestamps: Europe/London (GMT) / UTC
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* System Status Telemetry Modal */}
      <SystemStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        status={sourceStatus}
        onRefresh={fetchSourceStatus}
      />
    </div>
  );
}

export default App;
