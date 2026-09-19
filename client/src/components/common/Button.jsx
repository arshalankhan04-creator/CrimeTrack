import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  className = '',
  title,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-blue hover:bg-brand-hoverBlue text-white shadow-sm focus:ring-brand-blue/50 border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-300',
    danger: 'bg-semantic-danger hover:bg-red-700 text-white shadow-sm focus:ring-red-500/50 border border-transparent',
    warning: 'bg-semantic-warning hover:bg-amber-700 text-white shadow-sm focus:ring-amber-500/50 border border-transparent',
    success: 'bg-semantic-success hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500/50 border border-transparent',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent focus:ring-slate-200',
    outline: 'bg-transparent hover:bg-blue-50 text-brand-blue border border-brand-blue/30 hover:border-brand-blue focus:ring-brand-blue/30',
    dark: 'bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 focus:ring-navy-600',
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-1 gap-1',
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
    </button>
  );
}
