import React from 'react';
import { AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) {
  const iconMap = {
    danger: { Icon: Trash2, color: 'text-red-600 bg-red-50 border-red-100' },
    warning: { Icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    info: { Icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  };

  const { Icon, color } = iconMap[variant] || iconMap.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl border shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed pt-1">
          <p>{message}</p>
        </div>
      </div>
    </Modal>
  );
}
