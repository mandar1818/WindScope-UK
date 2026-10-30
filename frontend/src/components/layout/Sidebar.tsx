import React from 'react';
import {
  Wind, LayoutDashboard, LineChart, Target, Database, BookOpen,
  Activity, ChevronLeft, ChevronRight, FlaskConical, ShieldAlert,
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
  activeTab, onSelectTab, sourceStatus, onOpenStatusModal,
  isCollapsed = false, onToggleCollapse, isMobileOpen = false, onCloseMobile,
}) => {
  const isDemo = sourceStatus?.is_demonstration_mode;
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'forecast', label: 'Forecasts', icon: LineChart },
    { id: 'accuracy', label: 'Accuracy', icon: Target },
    { id: 'exposure', label: 'Procurement exposure', icon: ShieldAlert },
    { id: 'explorer', label: 'Data explorer', icon: Database },
    { id: 'testing-lab', label: 'Validation checks', icon: FlaskConical },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  const select = (id: string) => {
    onSelectTab(id);
    onCloseMobile?.();
  };

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-[#0e1726] transition-transform duration-200
        ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-[76px]' : 'lg:w-64'}`}>
        <div className="flex h-[68px] items-center justify-between border-b border-slate-800 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800/70">
              <Wind className="h-5 w-5 text-sky-300" strokeWidth={1.8} />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-[15px] font-semibold tracking-tight text-slate-100">WindScope <span className="font-normal text-slate-400">UK</span></div>
                <p className="mt-0.5 truncate text-[11px] text-slate-500">Wind generation analytics</p>
              </div>
            )}
          </div>
          {onToggleCollapse && (
            <button type="button" onClick={onToggleCollapse}
              className="hidden h-7 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-slate-200 lg:flex"
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}>
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {!isCollapsed && <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Workspace</p>}
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} type="button" onClick={() => select(id)}
                aria-current={active ? 'page' : undefined}
                title={isCollapsed ? label : undefined}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] transition-colors
                  ${isCollapsed ? 'justify-center' : ''}
                  ${active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}`}>
                <Icon size={17} strokeWidth={1.8} className={active ? 'text-sky-300' : 'text-slate-500'} />
                {!isCollapsed && <span className="truncate">{label}</span>}
                {!isCollapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-300" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button type="button" onClick={onOpenStatusModal}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[12px] text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Data source status' : undefined}>
            <Activity size={16} className={isDemo ? 'text-amber-400' : 'text-emerald-400'} />
            {!isCollapsed && <><span>Data source status</span><span className={`ml-auto text-[10px] ${isDemo ? 'text-amber-400' : 'text-emerald-400'}`}>{isDemo ? 'Demo' : sourceStatus ? 'Connected' : 'Checking'}</span></>}
          </button>
          {!isCollapsed && (
            <div className="mt-3 rounded-md bg-slate-900/70 px-3 py-3 text-[11px] leading-5 text-slate-500">
              <div className="font-medium text-slate-400">Evaluation period</div>
              <div>1–31 January 2026</div>
              <div className="mt-1">FUELHH · WINDFOR</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
