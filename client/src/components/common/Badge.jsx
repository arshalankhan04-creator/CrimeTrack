import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) {
  const baseStyles = 'inline-flex items-center font-semibold rounded-md border select-none';

  const variants = {
    // Roles
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    officer: 'bg-blue-50 text-blue-700 border-blue-200',
    viewer: 'bg-amber-50 text-amber-700 border-amber-200',

    // Statuses
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    under_investigation: 'bg-amber-50 text-amber-700 border-amber-200',
    solved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-700 border-slate-300',

    // Priorities
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-slate-50 text-slate-600 border-slate-200',

    // Crime Categories
    theft: 'bg-sky-50 text-sky-700 border-sky-200',
    robbery: 'bg-orange-50 text-orange-700 border-orange-200',
    assault: 'bg-rose-50 text-rose-700 border-rose-200',
    murder: 'bg-red-50 text-red-800 border-red-200',
    homicide: 'bg-red-50 text-red-800 border-red-200',
    cybercrime: 'bg-purple-50 text-purple-700 border-purple-200',
    fraud: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    burglary: 'bg-amber-50 text-amber-700 border-amber-200',
    extortion: 'bg-teal-50 text-teal-700 border-teal-200',
    other: 'bg-slate-100 text-slate-600 border-slate-200',

    // General Semantics
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const dotColors = {
    admin: 'bg-purple-500',
    officer: 'bg-blue-500',
    viewer: 'bg-amber-500',
    open: 'bg-blue-500',
    under_investigation: 'bg-amber-500',
    solved: 'bg-emerald-500',
    closed: 'bg-slate-500',
    critical: 'bg-red-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-slate-400',
  };

  const normalizedVariant = variant.toLowerCase().replace(/\s+/g, '_');
  const variantClass = variants[normalizedVariant] || variants.default;
  const dotClass = dotColors[normalizedVariant] || dotColors.default;

  return (
    <span className={`${baseStyles} ${variantClass} ${sizes[size] || sizes.md} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />}
      <span>{children}</span>
    </span>
  );
}
