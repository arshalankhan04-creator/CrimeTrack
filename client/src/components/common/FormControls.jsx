import React from 'react';

export function FormField({
  label,
  required = false,
  error,
  helpText,
  children,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {helpText && !error && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  );
}

export function Input({
  icon: Icon,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="relative rounded-lg">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        className={`w-full bg-white border ${
          error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-300 focus:ring-brand-blue/20 focus:border-brand-blue'
        } rounded-lg ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition font-sans ${className}`}
        {...props}
      />
    </div>
  );
}

export function Select({
  children,
  icon: Icon,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="relative rounded-lg">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <select
        className={`w-full bg-white border ${
          error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-300 focus:ring-brand-blue/20 focus:border-brand-blue'
        } rounded-lg ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 transition font-sans appearance-none ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-[10px]">
        ▼
      </div>
    </div>
  );
}

export function Textarea({
  error,
  rows = 3,
  className = '',
  ...props
}) {
  return (
    <textarea
      rows={rows}
      className={`w-full bg-white border ${
        error ? 'border-red-300 focus:ring-red-200 focus:border-red-500' : 'border-slate-300 focus:ring-brand-blue/20 focus:border-brand-blue'
      } rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition font-sans ${className}`}
      {...props}
    />
  );
}
