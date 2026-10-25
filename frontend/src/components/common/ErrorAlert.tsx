import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'API Communication Error',
  message,
  onRetry
}) => {
  return (
    <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-red-200 shadow-md">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-300 text-sm">{title}</h4>
          <p className="mt-1 text-xs text-red-200/90 leading-relaxed font-mono">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-red-900/60 hover:bg-red-800 text-xs text-red-100 font-medium transition-colors border border-red-700/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

