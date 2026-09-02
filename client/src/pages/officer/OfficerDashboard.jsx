import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Briefcase, 
  Users, 
  FileSearch, 
  ArrowRight, 
  Lock,
  Activity,
  CheckCircle2,
  PlusCircle,
  Clock,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOfficerData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes, activityRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
        dashboardService.getRecentActivity(),
      ]);

      setStats(statsRes.data.stats || null);
      setCharts(chartsRes.data.charts || null);
      setActivities(activityRes.data.activities || []);
    } catch (err) {
      console.error('Failed to load officer metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
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
            Welcome, <strong>{user?.name}</strong>. Manage your assigned FIR complaints, active case dockets, and evidence streams.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/cases"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-xs shadow transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Open Case</span>
          </Link>
          <button
            onClick={fetchOfficerData}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Officer Personal Caseload KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">My FIRs</span>
            <FileText className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats?.totalFIRs || 0}</p>
          <span className="text-[10px] text-brand-blue font-semibold">Assigned Complaints</span>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Caseload</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2 font-mono">{stats?.activeCaseload || 0}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Under Investigation</span>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Solved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{stats?.resolvedCases || 0}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">{stats?.resolutionRate || 0}% Success</span>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Evidence Logged</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2 font-mono">{stats?.totalEvidenceCount || 0}</p>
          <span className="text-[10px] text-purple-700 font-semibold">Items in Custody</span>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Linked Suspects</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats?.totalCriminals || 0}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Criminal Profiles</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts charts={charts} stats={stats} />

      {/* Operational Module Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/firs" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">My FIRs</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Register & manage citizen FIR complaints</p>
        </Link>

        <Link to="/cases" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">My Cases</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active case files & lifecycle updates</p>
        </Link>

        <Link to="/criminals" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Criminal Registry</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Global lookup & case linkage</p>
        </Link>

        <Link to="/investigations" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Investigations</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Journal timeline & evidence notes</p>
        </Link>
      </div>

      {/* Scope Restriction Info */}
      <div className="card-surface p-5 bg-slate-50 border-l-4 border-l-brand-blue text-xs">
        <h2 className="font-semibold text-navy-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-blue" />
          Active Ownership Enforcement
        </h2>
        <p className="text-slate-600 mt-1.5">
          Your dashboard analytics are strictly computed over records assigned to your officer account (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono">{user?.employeeId}</code>).
        </p>
      </div>
    </div>
  );
}
