import React from 'react';
import { Shield, Users, Briefcase, FileText, Activity, KeyRound, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        {/* User Management (M3 Live) */}
        <Link to="/users" className="card-surface p-5 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">User Hierarchy</span>
            <div className="p-2 bg-blue-50 text-brand-blue rounded-lg group-hover:bg-brand-blue group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-navy-900">User Console</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">M3 Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage Officers, Viewers & Supervisions</p>
        </Link>

        {/* FIR Management (M4 Live) */}
        <Link to="/firs" className="card-surface p-5 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">FIR Incident Registry</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-navy-900">FIR Registry</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">M4 Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Global view of registered FIR complaints</p>
        </Link>

        {/* Global Cases (M5 Scope) */}
        <div className="card-surface p-5 opacity-80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Case Files</span>
            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-slate-700">Case Management</span>
            <span className="text-[10px] bg-blue-100 text-brand-blue font-bold px-2 py-0.5 rounded">M5 Next</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Assign & monitor cases across all stations</p>
        </div>

        {/* System Audit Logs (M11 Scope) */}
        <div className="card-surface p-5 opacity-80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">System Logs</span>
            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-slate-700">Audit Trail</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">M11 Scope</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Immutable administrative audit log records</p>
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
