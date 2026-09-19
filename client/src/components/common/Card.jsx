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
    <div className={`card-surface ${className}`} {...props}>
      {(title || Icon || action) && (
        <div className="card-header">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                <Icon className="w-4 h-4 text-brand-blue" />
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-sm text-navy-900 leading-tight">{title}</h3>}
              {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}
