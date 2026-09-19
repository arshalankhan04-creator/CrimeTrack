import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  loading = false,
  className = '',
}) {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const startRecord = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 ${className}`}>
      <div>
        Showing <span className="font-semibold text-slate-900">{startRecord}</span> to{' '}
        <span className="font-semibold text-slate-900">{endRecord}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span> records
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="xs"
          disabled={currentPage <= 1 || loading}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>

        <span className="px-2 text-xs font-semibold text-slate-700 font-mono">
          {currentPage} / {totalPages || 1}
        </span>

        <Button
          variant="secondary"
          size="xs"
          disabled={currentPage >= totalPages || loading}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
