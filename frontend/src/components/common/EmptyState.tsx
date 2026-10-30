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
    <div className="rounded-lg border border-nature-border bg-white p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
      <div className="p-2.5 rounded-full bg-nature-bg border border-nature-border text-nature-forest">
        {icon === 'database' ? (
          <Database className="w-5 h-5 text-nature-forest" />
        ) : (
          <AlertCircle className="w-5 h-5 text-nature-risk" />
        )}
      </div>

      <div className="max-w-md space-y-1">
        <h4 className="text-sm font-semibold text-nature-text">{title}</h4>
        <p className="text-xs text-nature-muted leading-relaxed">{message}</p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-nature-bg text-xs font-medium text-nature-forest border border-nature-border transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-nature-forest" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
