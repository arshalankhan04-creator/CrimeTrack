import React from 'react';

export default function PageHeader({
  badge,
  badgeVariant = 'info',
  badgeMeta,
  title,
  subtitle,
  actions,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div>
        {(badge || badgeMeta) && (
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {badge && (
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-brand-blue border border-blue-200">
                {badge}
              </span>
            )}
            {badgeMeta && (
              <span className="text-xs text-slate-500 font-mono">
                {badgeMeta}
              </span>
            )}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
