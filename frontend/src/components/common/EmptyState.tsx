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
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/60 p-10 text-center flex flex-col items-center justify-center space-y-3">
      <div className="p-3 rounded-full bg-navy-800/80 border border-navy-700/80 text-slate-400">
        {icon === 'database' ? (
          <Database className="w-6 h-6 text-accent-cyan" />
        ) : (
          <AlertCircle className="w-6 h-6 text-accent-amber" />
        )}
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-sm font-semibold text-slate-200 tracking-wide">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center space-x-2 px-3 py-1.5 rounded-md bg-navy-800 hover:bg-navy-700 text-xs font-medium text-slate-200 border border-navy-600 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-accent-teal" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

