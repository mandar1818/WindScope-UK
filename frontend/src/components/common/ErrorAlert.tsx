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
  onRetry,
}) => {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4 text-rose-950 shadow-sm">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-rose-900 text-sm">{title}</h4>
          <p className="mt-1 text-xs text-rose-800 leading-relaxed font-mono">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-rose-100 text-xs text-rose-900 font-medium transition-colors border border-rose-300 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-700" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
