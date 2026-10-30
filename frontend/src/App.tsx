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
    <div className="min-h-screen bg-nature-bg text-nature-text flex flex-col font-sans selection:bg-nature-forest/15 selection:text-nature-forest">
      {/* Platform Shell */}
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
          className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
            isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
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
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {activeTab === 'overview' && <OverviewPage onNavigate={setActiveTab} />}
            {activeTab === 'forecast' && <ForecastAnalysisPage />}
            {activeTab === 'accuracy' && <AccuracyAnalysisPage />}
            {activeTab === 'exposure' && <ProcurementExposurePage />}
            {activeTab === 'explorer' && <DataExplorerPage />}
            {activeTab === 'testing-lab' && <TestingLabPage />}
            {activeTab === 'methodology' && <MethodologyPage />}
          </main>

          {/* Clean Natural Footer */}
          <footer className="border-t border-nature-border bg-white py-4 text-xs text-nature-muted mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center space-x-2 text-[11px]">
                <span className="font-semibold text-nature-text">WindScope UK</span>
                <span className="text-nature-border">&bull;</span>
                <span>Renewable Energy Forecasting &amp; Day-Ahead Analytics</span>
                <span className="text-nature-border">&bull;</span>
                <span className="font-mono text-nature-muted">January 2026 Evaluation</span>
              </div>

              <div className="text-[11px] text-nature-muted font-mono text-center sm:text-right">
                Elexon BMRS Datasets: FUELHH &amp; WINDFOR &bull; Europe/London (GMT)
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* System Telemetry Modal */}
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
