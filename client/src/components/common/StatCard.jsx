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
      iconBg: 'bg-blue-50 text-brand-blue border-blue-100',
      valueColor: 'text-navy-900',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      valueColor: 'text-navy-900',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
      valueColor: 'text-amber-600',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      valueColor: 'text-emerald-600',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
      valueColor: 'text-navy-900',
    },
    slate: {
      iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
      valueColor: 'text-navy-900',
    },
  };

  const scheme = colorMap[resolvedColor] || colorMap.blue;

  // Robust trend parsing (supports both string and object trend prop)
  const trendDir = typeof trend === 'object' && trend !== null
    ? (trend.direction || (trend.isPositive ? 'up' : 'down'))
    : trend;
  const trendText = typeof trend === 'object' && trend !== null
    ? (trend.label || trend.value || trendLabel)
    : trendLabel;

  const displayValue = value !== undefined && value !== null ? value : 0;
  const tooltipValue = typeof displayValue === 'string' || typeof displayValue === 'number'
    ? String(displayValue)
    : '';

  if (loading) {
    return (
      <div className={`card-surface p-4 animate-pulse min-w-0 w-full overflow-hidden flex flex-col justify-between ${className}`}>
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="h-3.5 w-16 sm:w-20 bg-slate-200 rounded min-w-0"></div>
          <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0"></div>
        </div>
        <div className="h-6 w-14 sm:w-16 bg-slate-200 rounded mt-3"></div>
        <div className="h-3 w-20 sm:w-24 bg-slate-200 rounded mt-2"></div>
      </div>
    );
  }

  return (
    <div className={`card-surface p-4 flex flex-col justify-between min-w-0 w-full overflow-hidden h-full ${className}`}>
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span
          className="text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-snug break-words line-clamp-2 min-w-0 flex-1"
          title={title}
        >
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-4 h-4 shrink-0" />
          </div>
        )}
      </div>

      <div className="mt-2.5 min-w-0">
        <p
          className={`text-xl sm:text-2xl font-bold font-mono tracking-tight truncate ${scheme.valueColor}`}
          title={tooltipValue}
        >
          {displayValue}
        </p>

        {(subtitle || trendDir) && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[11px] min-w-0">
            {trendDir && (
              <span
                className={`inline-flex items-center font-semibold shrink-0 ${
                  trendDir === 'up'
                    ? 'text-emerald-600'
                    : trendDir === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {trendDir === 'up' && <TrendingUp className="w-3 h-3 mr-0.5 shrink-0" />}
                {trendDir === 'down' && <TrendingDown className="w-3 h-3 mr-0.5 shrink-0" />}
                {trendDir === 'neutral' && <Minus className="w-3 h-3 mr-0.5 shrink-0" />}
                {trendText}
              </span>
            )}
            {subtitle && (
              <span
                className="text-slate-500 font-medium truncate block min-w-0 flex-1"
                title={subtitle}
              >
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
