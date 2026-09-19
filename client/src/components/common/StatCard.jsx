import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  variant,
  trend,
  trendLabel,
  loading = false,
  className = '',
}) {
  const variantMap = {
    primary: 'blue',
    warning: 'amber',
    success: 'emerald',
    danger: 'rose',
    neutral: 'slate',
    info: 'blue',
  };

  const resolvedColor = (variant && variantMap[variant]) || color || 'blue';

  const colorMap = {
    blue: {
      iconBg: 'bg-blue-50 text-brand-blue border-blue-100/80',
      valueColor: 'text-navy-900',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100/80',
      valueColor: 'text-navy-900',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100/80',
      valueColor: 'text-amber-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100/80',
      valueColor: 'text-emerald-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100/80',
      valueColor: 'text-navy-900',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600 border-slate-200/80',
      valueColor: 'text-navy-900',
    },
  };

  const scheme = colorMap[resolvedColor] || colorMap.blue;

  if (loading) {
    return (
      <div className={`card-surface p-3.5 sm:p-4 animate-pulse min-w-0 w-full flex flex-col justify-between ${className}`}>
        <div className="flex items-center justify-between gap-1.5">
          <div className="h-3 w-16 bg-slate-200 rounded"></div>
          <div className="w-7 h-7 rounded-lg bg-slate-200"></div>
        </div>
        <div className="h-6 w-12 bg-slate-200 rounded mt-2.5"></div>
        <div className="h-2.5 w-20 bg-slate-200 rounded mt-1.5"></div>
      </div>
    );
  }

  return (
    <div className={`card-surface p-3.5 sm:p-4 flex flex-col justify-between min-w-0 w-full transition hover:border-slate-300 ${className}`}>
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate" title={title}>
          {title}
        </span>
        {Icon && (
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="mt-2 min-w-0">
        <p className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight truncate ${scheme.valueColor}`}>
          {value !== undefined && value !== null ? value : 0}
        </p>

        {(subtitle || trend) && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] sm:text-[11px] min-w-0">
            {trend && (
              <span className={`inline-flex items-center font-semibold shrink-0 ${
                trend === 'up' || trend?.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <TrendingUp className="w-3 h-3 mr-0.5" />
                {trendLabel || trend?.label}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-400 font-medium truncate block min-w-0" title={subtitle}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
