import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching records from the server.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`p-6 bg-semantic-dangerBg border border-semantic-dangerBorder rounded-xl text-center flex flex-col items-center justify-center ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-xs font-bold text-red-900">{title}</h4>
      <p className="text-[11px] text-red-700 max-w-md mt-0.5 mb-3 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="xs" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
