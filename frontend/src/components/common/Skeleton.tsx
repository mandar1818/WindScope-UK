import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded bg-slate-800/60 border border-slate-700/30 ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-3">
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
    <div className="rounded-lg border border-slate-800 bg-[#0e1526] p-4 space-y-3" style={{ minHeight: height }}>
      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-60" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2">
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
    <div className="rounded-lg border border-slate-800 bg-[#0e1526] overflow-hidden">
      <div className="p-3 border-b border-slate-800 flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="p-3 space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-3 items-center">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24 flex-1" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
};
