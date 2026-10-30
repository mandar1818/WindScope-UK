import React from 'react';
import {
  Wind,
  LayoutDashboard,
  LineChart,
  Target,
  Database,
  BookOpen,
  Activity,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  FlaskConical,
  ShieldAlert,
} from 'lucide-react';
import { SourceStatus } from '../../types/api';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  sourceStatus: SourceStatus | null;
  onOpenStatusModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  sourceStatus,
  onOpenStatusModal,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isDemo = sourceStatus?.is_demonstration_mode;

  const NAV_ITEMS = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: 'Executive',
    },
    {
      id: 'forecast',
      label: 'Forecast Analysis',
      shortLabel: 'Forecast',
      icon: LineChart,
      badge: 'Waterfall',
    },
    {
      id: 'accuracy',
      label: 'Accuracy Analysis',
      shortLabel: 'Accuracy',
      icon: Target,
      badge: 'Metrics',
    },
    {
      id: 'exposure',
      label: 'Procurement Exposure',
      shortLabel: 'Exposure',
      icon: ShieldAlert,
      badge: 'MWh Risk',
    },
    {
      id: 'explorer',
      label: 'Data Explorer',
      shortLabel: 'Explorer',
      icon: Database,
      badge: 'CSV',
    },
    {
      id: 'testing-lab',
      label: 'Interactive Testing Lab',
      shortLabel: 'Testing Lab',
      icon: FlaskConical,
      badge: 'QA Suite',
      isSpecial: true,
    },
    {
      id: 'methodology',
      label: 'Methodology & Reference',
      shortLabel: 'Methods',
      icon: BookOpen,
      badge: 'Docs',
    },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#070d19] border-r border-navy-800/80 transition-all duration-300 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800/80 bg-[#091122]">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 via-navy-800 to-navy-950 border border-cyan-500/40 shadow-inner">
              <Wind className="w-5 h-5 text-accent-cyan" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-sm tracking-wider text-slate-100 uppercase">
                    WindScope
                  </span>
                  <span className="font-light text-sm text-accent-cyan">
                    UK
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Trading &amp; Procurement Desk
                </p>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-100 hover:bg-navy-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
              Analytics Modules
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-accent-teal text-navy-950 font-bold shadow-md shadow-cyan-950/40'
                    : item.isSpecial
                    ? 'text-cyan-300 hover:text-cyan-100 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-800/40'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-navy-800/60'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={item.label}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? 'text-navy-950'
                        : item.isSpecial
                        ? 'text-accent-cyan'
                        : 'text-slate-400'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-navy-950/30 text-navy-950 font-semibold'
                        : item.isSpecial
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                        : 'bg-navy-900 text-slate-400 border border-navy-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* System Telemetry in Nav */}
          <div className="pt-3">
            {!isCollapsed && (
              <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                System Telemetry
              </div>
            )}
            <button
              onClick={onOpenStatusModal}
              className={`w-full flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-all text-slate-300 hover:text-slate-100 hover:bg-navy-800/60 ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
              title="System Status"
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {!isCollapsed && <span>System Status</span>}
              </div>

              {!isCollapsed && (
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                    isDemo
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDemo ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {isDemo ? 'Demo' : 'Online'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer Widget */}
        {!isCollapsed && (
          <div className="p-3 m-3 rounded-lg bg-navy-900/80 border border-navy-800 text-[11px] font-mono text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 font-sans font-semibold">
              <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400">
                <Zap className="w-3 h-3 text-accent-cyan" /> GB Market Scope
              </span>
              <span className="text-[10px] text-accent-teal">Jan 2026</span>
            </div>
            <div className="text-[10px] text-slate-400 font-sans leading-tight">
              Elexon BMRS Datasets: FUELHH (Outturn) &amp; WINDFOR (Forecasts)
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
