import React from 'react';

export default function PageHeader({
  badge,
  badgeVariant = 'info',
  badgeMeta,
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  className = '',
}) {
  const displaySubtitle = subtitle || description;

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-start justify-between gap-4 min-w-0 w-full max-w-full ${className}`}>
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 flex-wrap">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {b.path ? (
                  <span className="hover:text-brand-blue transition">{b.label}</span>
                ) : (
                  <span className="text-slate-600 font-medium">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {(badge || badgeMeta) && (
          <div className="flex items-center gap-2 mb-1.5 flex-wrap min-w-0">
            {badge && (
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-brand-blue border border-blue-200 shrink-0">
                {badge}
              </span>
            )}
            {badgeMeta && (
              <span className="text-xs text-slate-500 font-mono truncate">
                {badgeMeta}
              </span>
            )}
          </div>
        )}

        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight break-words">
          {title}
        </h1>
        {displaySubtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl break-words">
            {displaySubtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap max-w-full self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
