import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No records found',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = FolderSearch,
  actionLabel,
  onAction,
  actionIcon: ActionIcon = Plus,
  className = '',
}) {
  return (
    <div className={`py-12 px-4 text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3.5 shadow-xs">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <h4 className="text-sm font-bold text-navy-900">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" icon={ActionIcon} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
