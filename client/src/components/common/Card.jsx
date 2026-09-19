import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  icon: Icon,
  action,
  noPadding = false,
  ...props
}) {
  return (
    <div className={`card-surface min-w-0 w-full ${className}`} {...props}>
      {(title || Icon || action) && (
        <div className="card-header">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0">
                <Icon className="w-4 h-4 text-brand-blue" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {title && <h3 className="font-bold text-sm text-navy-900 leading-tight truncate">{title}</h3>}
              {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}
      <div className={`min-w-0 w-full ${noPadding ? '' : 'p-5'}`}>{children}</div>
    </div>
  );
}
