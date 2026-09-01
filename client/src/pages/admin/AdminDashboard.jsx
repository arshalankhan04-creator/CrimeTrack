import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Briefcase, 
  FileText, 
  Activity, 
  KeyRound, 
  ArrowRight,
  TrendingUp,
  FileSearch,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
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
      console.error('Failed to load admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Role Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-success">ROLE: ADMIN</span>
            <span className="text-xs text-slate-500 font-mono">Employee ID: {user?.employeeId || 'ADM-001'}</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Administrator Executive Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome, <strong>{user?.name}</strong>. Global law enforcement command and station analytics overview.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs border border-slate-300 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top Level KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total FIRs */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total FIRs</span>
            <FileText className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats?.totalFIRs || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Incident Registry</span>
        </div>

        {/* Total Cases */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Cases</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats?.totalCases || 0}</p>
          <span className="text-[10px] text-purple-600 font-semibold">Investigation Files</span>
        </div>

        {/* Active Caseload */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Cases</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2 font-mono">{stats?.activeCaseload || 0}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Under Investigation</span>
        </div>

        {/* Solved Cases */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Solved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{stats?.resolvedCases || 0}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">{stats?.resolutionRate || 0}% Solved</span>
        </div>

        {/* Tracked Criminals */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Criminals</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats?.totalCriminals || 0}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Offender Master</span>
        </div>

        {/* Active Officers */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Officers</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats?.activeOfficersCount || 0}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Duty Officers</span>
        </div>
      </div>

      {/* Analytics Visualizations Component */}
      <AnalyticsCharts charts={charts} stats={stats} />

      {/* Operational Module Access Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-navy-900 uppercase tracking-wider text-slate-400">
          Operational Subsystems
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/users" className="card-surface p-4 hover:border-brand-blue transition group block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">User Hierarchy</span>
              <span className="badge-success">M3 Live</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Manage Officers, Viewers & Supervisions</p>
          </Link>

          <Link to="/firs" className="card-surface p-4 hover:border-brand-blue transition group block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">FIR Registry</span>
              <span className="badge-success">M4 Live</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Incident complaints & printable sheets</p>
          </Link>

          <Link to="/cases" className="card-surface p-4 hover:border-brand-blue transition group block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">Case Management</span>
              <span className="badge-success">M5 Live</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">Investigation lifecycle & reassignment</p>
          </Link>

          <Link to="/criminals" className="card-surface p-4 hover:border-brand-blue transition group block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900">Criminal Registry</span>
              <span className="badge-success">M6 Live</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Identity master & privacy lookup</p>
          </Link>
        </div>
      </div>

      {/* Recent Station Activity & Audits */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-navy-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-blue" />
            Live Department Activity & Audit Stream
          </h3>
          <span className="text-xs text-slate-400 font-mono">Real-time Stream</span>
        </div>

        {activities.length === 0 ? (
          <p className="text-slate-400 text-xs py-4 text-center">No recent audit logs.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {activities.map((act) => (
              <div key={act._id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="badge-info font-mono text-[10px] shrink-0">{act.action}</span>
                  <span className="text-slate-700 font-medium truncate">
                    <strong>{act.userId?.name || 'Officer'}</strong> recorded on {act.entityType}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(act.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
