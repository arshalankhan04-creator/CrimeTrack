import React from 'react';
import { Shield, Users, Briefcase, FileText, Activity, KeyRound, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-success">ROLE: ADMIN</span>
            <span className="text-xs text-slate-500 font-mono">Employee ID: {user?.employeeId || 'ADM-001'}</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, <strong>{user?.name}</strong>. You have global management authorization across all departments.
          </p>
        </div>
      </div>

      {/* Global Administrative Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">User Hierarchy</span>
            <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">M3 Scope</p>
          <p className="text-xs text-slate-500 mt-1">Manage Officers, Viewers & Supervisions</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Cases</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">M5 Scope</p>
          <p className="text-xs text-slate-500 mt-1">Assign & monitor cases across all stations</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">System Logs</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">M11 Scope</p>
          <p className="text-xs text-slate-500 mt-1">Audit Trail & Authentication Logs</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Reports</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">M10 Scope</p>
          <p className="text-xs text-slate-500 mt-1">Export PDF/Excel crime analytics</p>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="card-surface p-6 bg-slate-50">
        <h2 className="text-base font-semibold text-navy-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Active Security Profile & Session
        </h2>
        <div className="mt-3 text-xs text-slate-600 space-y-1.5 font-mono">
          <p>• Authenticated ID: <span className="text-navy-900 font-semibold">{user?._id || user?.id}</span></p>
          <p>• Official Email: <span className="text-navy-900 font-semibold">{user?.email}</span></p>
          <p>• Access Level: <span className="text-emerald-600 font-semibold">GLOBAL ADMIN (Read/Write all scopes)</span></p>
        </div>
      </div>
    </div>
  );
}
