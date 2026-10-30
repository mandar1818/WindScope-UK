import React from 'react';
import { Database, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'database' | 'alert';
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  message = 'No data matching your selection parameters was found in the January 2026 dataset.',
  icon = 'database',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-8 text-center flex flex-col items-center justify-center space-y-3">
      <div className="p-2.5 rounded-full bg-slate-800 text-slate-400">
        {icon === 'database' ? (
          <Database className="w-5 h-5 text-sky-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400" />
        )}
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
