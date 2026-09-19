import React from 'react';

export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="w-full animate-pulse">
      <div className="bg-slate-100 h-10 border-b border-slate-200"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-100">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-3.5 bg-slate-200 rounded"
              style={{ width: `${Math.max(15, (100 / columns) - 2)}%` }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface p-5 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
