import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Shield, 
  Lock, 
  FileText, 
  Briefcase, 
  Info,
  Activity,
  CheckCircle2,
  Users,
  FileSearch,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';

export default function ViewerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchViewerData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
      ]);

      setStats(statsRes.data.stats || null);
      setCharts(chartsRes.data.charts || null);
    } catch (err) {
      console.error('Failed to load viewer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewerData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
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
            Welcome, <strong>{user?.name}</strong>. Read-only tracking of your supervisor's assigned investigations and metrics.
          </p>
        </div>

        <button
          onClick={fetchViewerData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs border transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Supervisor FIRs</span>
          <p className="text-2xl font-bold text-navy-900 mt-1 font-mono">{stats?.totalFIRs || 0}</p>
        </div>
        <div className="card-surface p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Active Cases</span>
          <p className="text-2xl font-bold text-amber-600 mt-1 font-mono">{stats?.activeCaseload || 0}</p>
        </div>
        <div className="card-surface p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Solved Cases</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{stats?.resolvedCases || 0}</p>
        </div>
        <div className="card-surface p-4">
          <span className="text-[10px] font-bold uppercase text-slate-400">Resolution Rate</span>
          <p className="text-2xl font-bold text-brand-blue mt-1 font-mono">{stats?.resolutionRate || 0}%</p>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <AnalyticsCharts charts={charts} stats={stats} />

      {/* Accessible Scopes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/firs" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Supervisor FIRs</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">View FIRs registered by supervisor</p>
        </Link>

        <Link to="/cases" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Case Files</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">View active cases & investigation timeline</p>
        </Link>

        <Link to="/criminals" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Offender Registry</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">View scoped suspect & criminal records</p>
        </Link>

        <Link to="/investigations" className="card-surface p-4 hover:border-brand-blue transition group block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900">Investigations</span>
            <span className="text-[10px] text-brand-blue font-bold group-hover:translate-x-0.5 transition-transform">Open &rarr;</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">View case timeline & evidence entries</p>
        </Link>
      </div>

      {/* Strict Read-Only Notice */}
      <div className="card-surface p-5 bg-amber-50/50 border-amber-200 text-xs">
        <h2 className="font-semibold text-navy-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600" />
          Supervised Read-Only Enforcement
        </h2>
        <p className="text-slate-700 mt-1.5">
          Your account has read-only authorization scoped to supervisor ID: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-navy-900 font-bold">{user?.supervisorOfficerId || 'Assigned Officer'}</code>. All write endpoints return <code className="font-mono text-red-600">403 Forbidden</code>.
        </p>
      </div>
    </div>
  );
}
