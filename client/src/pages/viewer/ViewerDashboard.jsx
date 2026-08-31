import React from 'react';
import { Eye, Shield, Lock, FileText, Briefcase, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ViewerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-warning">ROLE: VIEWER (READ-ONLY)</span>
            <span className="text-xs text-slate-500 font-mono">Emp ID: {user?.employeeId || 'VIW-201'}</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Supervised Viewer Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, <strong>{user?.name}</strong>. You have read-only access restricted to your supervising Officer's scope.
          </p>
        </div>
      </div>

      {/* Accessible Scopes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supervisor FIRs</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">Read-Only</p>
          <p className="text-xs text-slate-500 mt-1">View FIRs registered by supervisor</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supervisor Cases</span>
            <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">Read-Only</p>
          <p className="text-xs text-slate-500 mt-1">View active cases & investigation timeline</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Audit & Logs</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-red-600 mt-2">Restricted</p>
          <p className="text-xs text-slate-500 mt-1">System logs & mutation APIs are blocked</p>
        </div>
      </div>

      {/* Strict Read-Only Notice */}
      <div className="card-surface p-6 bg-amber-50/50 border-amber-200">
        <h2 className="text-base font-semibold text-navy-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600" />
          Viewer Read-Only Policy
        </h2>
        <p className="text-xs text-slate-700 mt-2">
          Your account is supervised under Officer ID: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-navy-900">{user?.supervisorOfficerId || 'Assigned Officer'}</code>. You cannot register FIRs, edit cases, modify suspects, or reassign cases.
        </p>
      </div>
    </div>
  );
}
