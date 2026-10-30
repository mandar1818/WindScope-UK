import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded bg-navy-800/70 border border-navy-700/40 ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
      </div>
      <div className="flex items-baseline space-x-2 pt-1">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-2.5 w-full" />
      <Skeleton className="h-2.5 w-2/3" />
    </div>
  );
};

export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 320 }) => {
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/70 p-5 space-y-4" style={{ minHeight: height }}>
      <div className="flex justify-between items-center pb-2 border-b border-navy-800/80">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <div className="flex space-x-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="h-48 flex items-end justify-between gap-1 pt-6 px-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-t"
            // @ts-ignore
            style={{ height: `${20 + ((i * 17) % 65)}%` }}
          />
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => {
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/70 overflow-hidden">
      <div className="p-4 border-b border-navy-800/80 flex justify-between items-center">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 items-center">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3.5 w-24 flex-1" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

