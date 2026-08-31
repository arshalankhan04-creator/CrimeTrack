import React from 'react';
import { Shield, FileText, Briefcase, Users, FileSearch, ArrowRight, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function OfficerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info">ROLE: INVESTIGATING OFFICER</span>
            <span className="text-xs text-slate-500 font-mono">Badge / Emp ID: {user?.employeeId || 'OFF-101'}</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Officer Operational Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, <strong>{user?.name}</strong>. You are authorized to manage FIRs, Cases, and Investigations assigned to your scope.
          </p>
        </div>
      </div>

      {/* Operational Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/firs" className="card-surface p-5 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">My FIRs</span>
            <div className="p-2 bg-blue-50 text-brand-blue rounded-lg group-hover:bg-brand-blue group-hover:text-white transition">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-navy-900">FIR Complaints</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">M4 Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Create & manage citizen FIR complaints</p>
        </Link>

        <Link to="/cases" className="card-surface p-5 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Cases</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-navy-900">Case Files</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">M5 Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Assigned case files & status updates</p>
        </Link>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Criminal Registry</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">M6 Scope</p>
          <p className="text-xs text-slate-500 mt-1">Global search & case linking</p>
        </div>

        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Investigations</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileSearch className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 mt-2">M7 Scope</p>
          <p className="text-xs text-slate-500 mt-1">Timeline entries & evidence notes</p>
        </div>
      </div>

      {/* Scope Restriction Info */}
      <div className="card-surface p-6 bg-slate-50 border-l-4 border-l-brand-blue">
        <h2 className="text-base font-semibold text-navy-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-blue" />
          Active Ownership Enforcement
        </h2>
        <p className="text-xs text-slate-600 mt-2">
          According to the CrimeTrack security rules, you can only modify records where <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">assignedOfficerId === '{user?._id || user?.id}'</code>. Attempts to edit another Officer's cases or view unassigned private records are automatically blocked by the backend API.
        </p>
      </div>
    </div>
  );
}
