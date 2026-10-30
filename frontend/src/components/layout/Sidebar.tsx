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
          className="fixed inset-0 z-40 bg-[#26332C]/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white border-r border-nature-border transition-all duration-200 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 w-60'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-nature-border bg-white">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-nature-forest-light border border-nature-border flex items-center justify-center text-nature-forest">
              <Wind className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-semibold text-sm text-nature-text tracking-tight">
                    WindScope
                  </span>
                  <span className="font-medium text-xs text-nature-forest font-mono">
                    UK
                  </span>
                </div>
                <p className="text-[10px] text-nature-muted truncate">
                  Renewable Energy Analytics
                </p>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-6 h-6 rounded text-nature-muted hover:text-nature-text hover:bg-nature-bg transition-colors"
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
            <div className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-nature-muted/80">
              Workspace
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center rounded-md py-1.5 text-xs transition-colors ${
                  isActive
                    ? 'bg-nature-forest-light text-nature-forest font-semibold border-l-2 border-nature-forest pl-2.5 pr-2'
                    : 'text-nature-muted hover:text-nature-text hover:bg-nature-bg pl-3 pr-2'
                } ${isCollapsed ? 'justify-center px-0' : 'justify-start'}`}
                title={item.label}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-nature-forest' : 'text-nature-muted'
                  } ${!isCollapsed ? 'mr-2.5' : ''}`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* System & Source Status Footer Strip */}
        <div className="p-2.5 border-t border-nature-border bg-[#FAFCF9]">
          <button
            onClick={onOpenStatusModal}
            className="w-full flex items-center justify-between p-2 rounded-md bg-white hover:bg-nature-bg border border-nature-border text-[11px] text-nature-text transition-colors shadow-sm"
            title="Inspect System & Data Pipeline Status"
          >
            <div className="flex items-center space-x-2 truncate">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isDemo ? 'bg-nature-risk' : 'bg-nature-actual'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate text-nature-text font-medium">
                  {isDemo ? 'Demo Mode' : 'Elexon BMRS Live'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] text-nature-muted font-mono">Status &rarr;</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
