import React from 'react';
import {
  Wind,
  LayoutDashboard,
  LineChart,
  Target,
  Database,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FlaskConical,
  Activity,
  CheckCircle2,
  AlertTriangle,
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
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'forecast',
      label: 'Forecast Analysis',
      icon: LineChart,
    },
    {
      id: 'accuracy',
      label: 'Accuracy Metrics',
      icon: Target,
    },
    {
      id: 'exposure',
      label: 'Procurement Exposure',
      icon: ShieldAlert,
    },
    {
      id: 'explorer',
      label: 'Data Explorer',
      icon: Database,
    },
    {
      id: 'testing-lab',
      label: 'Testing Lab',
      icon: FlaskConical,
    },
    {
      id: 'methodology',
      label: 'Methodology',
      icon: BookOpen,
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
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#0e1526] border-r border-slate-800/80 transition-all duration-200 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 w-60'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sky-400">
              <Wind className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-sm text-slate-100 tracking-tight">
                    WindScope
                  </span>
                  <span className="font-normal text-xs text-sky-400 font-mono">
                    UK
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Day-Ahead Analytics
                </p>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-2.5 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Navigation
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center rounded py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-medium border-l-2 border-sky-400 pl-2.5 pr-2'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 pl-3 pr-2'
                } ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-sky-400' : 'text-slate-400'
                  } ${!isCollapsed ? 'mr-2.5' : ''}`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* System & Source Status Footer Strip */}
        <div className="p-2.5 border-t border-slate-800/80 bg-[#0a0f1c]">
          <button
            onClick={onOpenStatusModal}
            className="w-full flex items-center justify-between p-2 rounded bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 transition-colors"
            title="Inspect System & Data Pipeline Status"
          >
            <div className="flex items-center space-x-2 truncate">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isDemo ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate text-slate-300 font-sans">
                  {isDemo ? 'Demonstration Mode' : 'Elexon BMRS Live'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] text-slate-500 font-mono">Status &rarr;</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
