import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Briefcase, 
  Users, 
  FileSearch, 
  Activity, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

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
      {/* Header Banner */}
      <PageHeader
        badge="ROLE: VIEWER (READ-ONLY)"
        badgeMeta={`Desk ID: ${user?.employeeId || 'VIW-201'}`}
        title="Supervised Viewer Portal"
        subtitle={`Welcome, ${user?.name || 'Operator'}. Read-only intelligence tracking of your supervising officer's caseload.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchViewerData}
          >
            Refresh
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Supervisor FIRs"
          value={stats?.totalFIRs}
          subtitle="Assigned Complaints"
          icon={FileText}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Active Cases"
          value={stats?.activeCaseload}
          subtitle="Under Investigation"
          icon={Activity}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Solved Cases"
          value={stats?.resolvedCases}
          subtitle="Cleared Inquiries"
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Resolution Rate"
          value={`${stats?.resolutionRate || 0}%`}
          subtitle="Clearance Efficiency"
          icon={CheckCircle2}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Analytics Visualizations */}
      <AnalyticsCharts charts={charts} stats={stats} />

      {/* Accessible Scopes */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
          Supervised Read-Only Registries
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link to="/firs" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">FIR Complaints</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Read-only view of supervisor incident complaints</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Supervised Intake</span>
              <span className="text-brand-blue font-semibold">Inspect FIRs</span>
            </div>
          </Link>

          <Link to="/cases" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">Case Registry</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Track investigation timeline & clearance progression</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Supervised Dockets</span>
              <span className="text-brand-blue font-semibold">Track Cases</span>
            </div>
          </Link>

          <Link to="/criminals" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">Criminal Registry</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Look up criminal identity records linked to cases</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Offender Lookup</span>
              <span className="text-brand-blue font-semibold">Inspect Profiles</span>
            </div>
          </Link>

          <Link to="/investigations" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">Investigation Journals</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Read officer investigation notes & custody records</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Evidence Entries</span>
              <span className="text-brand-blue font-semibold">Read Journal</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Viewer Notice */}
      <div className="card-surface p-4 bg-slate-50/80 border-l-4 border-l-amber-500 text-xs">
        <h4 className="font-semibold text-navy-900 flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-600" />
          Desk Viewer Permissions
        </h4>
        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
          You are currently in Supervised Viewer mode. You can inspect complaints, evidence details, and status timelines, while mutation and deletion operations remain restricted to authorized investigating officers and administrators.
        </p>
      </div>
    </div>
  );
}
