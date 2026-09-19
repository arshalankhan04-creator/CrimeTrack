import React from 'react';
import { 
  User, 
  Shield, 
  Mail, 
  Phone, 
  BadgeCheck, 
  KeyRound, 
  Calendar, 
  ShieldAlert,
  Lock,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';

export default function ProfileModal({ isOpen, onClose, user }) {
  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'CT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleVariant = (role) => {
    if (role === 'ADMIN') return 'danger';
    if (role === 'OFFICER') return 'primary';
    return 'warning';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Officer Credential & Dossier"
      subtitle="Authenticated personnel profile and department clearance details."
      size="md"
    >
      <div className="space-y-5 text-xs font-sans">
        {/* Officer Card Header */}
        <div className="p-4 bg-gradient-to-br from-navy-900 to-navy-950 border border-navy-800 rounded-xl text-white flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-md border-2 border-navy-700 shrink-0">
            {getInitials(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-white truncate">{user.name}</h3>
              <Badge variant={getRoleVariant(user.role)} size="sm">
                {user.role}
              </Badge>
            </div>

            <p className="text-xs text-blue-300 font-mono mt-0.5">
              ID: {user.employeeId || 'POL-ADMIN-001'}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Duty • Central Command</span>
            </div>
          </div>
        </div>

        {/* Credentials & Contact Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-500" />
              Official Email
            </span>
            <p className="font-semibold text-navy-900 text-xs mt-1 truncate">
              {user.email || 'officer@crimetrack.gov'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" />
              Contact Phone
            </span>
            <p className="font-semibold text-navy-900 text-xs mt-1">
              {user.phone || '+91 98765 43210'}
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-500" />
              Department Division
            </span>
            <p className="font-semibold text-navy-900 text-xs mt-1">
              Central Crime Investigation Bureau
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              Account Commissioned
            </span>
            <p className="font-semibold text-navy-900 text-xs mt-1">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Service'}
            </p>
          </div>
        </div>

        {/* Security & Access Scope Banner */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-navy-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-blue" />
              Security Protocol & RBAC Clearance
            </span>
            <span className="text-[10px] font-mono text-brand-blue font-bold">LEVEL {user.role === 'ADMIN' ? '3 (FULL)' : user.role === 'OFFICER' ? '2 (WRITE)' : '1 (READ)'}</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {user.role === 'ADMIN'
              ? 'Full supervisory administrative clearance. Authorized for disaster recovery rollback, audit log verification, and user credential management.'
              : user.role === 'OFFICER'
              ? 'Investigative officer clearance. Authorized for FIR intake, case docket updates, criminal identity linkage, and forensic journals.'
              : 'Read-only viewer clearance. Authorized for public safety review, report exports, and search registries.'}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
}
