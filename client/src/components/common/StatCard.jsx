import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  trendLabel,
  loading = false,
  className = '',
}) {
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

  const scheme = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <div className={`card-surface p-4 animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
          <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
        </div>
        <div className="h-7 w-16 bg-slate-200 rounded mt-3"></div>
        <div className="h-3 w-28 bg-slate-200 rounded mt-2"></div>
      </div>
    );
  }

  return (
    <div className={`card-surface p-4.5 flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5">
        <p className={`text-2xl font-bold font-mono tracking-tight ${scheme.valueColor}`}>
          {value !== undefined && value !== null ? value : 0}
        </p>

        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            {trend && (
              <span className={`inline-flex items-center font-semibold ${
                trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
                {trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
                {trendLabel}
              </span>
            )}
            {subtitle && (
              <span className="text-slate-500 font-medium truncate">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
