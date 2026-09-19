import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Briefcase, 
  Activity, 
  Users, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

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
      {/* Header Banner */}
      <PageHeader
        badge="ROLE: HEADQUARTERS ADMIN"
        badgeMeta={`Badge ID: ${user?.employeeId || 'ADM-001'}`}
        title="Command Executive Overview"
        subtitle={`Welcome, ${user?.name || 'Administrator'}. Centralized operational analytics and real-time station oversight.`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchDashboardData}
          >
            Refresh Data
          </Button>
        }
      />

      {/* Top Level KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        <StatCard
          title="Total FIRs"
          value={stats?.totalFIRs}
          subtitle="Incident Registry"
          icon={FileText}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Cases"
          value={stats?.totalCases}
          subtitle="Investigation Files"
          icon={Briefcase}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Active Cases"
          value={stats?.activeCaseload}
          subtitle="Under Active Review"
          icon={Activity}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Solved Cases"
          value={stats?.resolvedCases}
          subtitle={`${stats?.resolutionRate || 0}% Resolution`}
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Criminals"
          value={stats?.totalCriminals}
          subtitle="Offender Master"
          icon={Users}
          color="rose"
          loading={loading}
        />
        <StatCard
          title="Duty Officers"
          value={stats?.activeOfficersCount}
          subtitle="Active Personnel"
          icon={UserCheck}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Analytics Visualizations Component */}
      <AnalyticsCharts charts={charts} stats={stats} />

      {/* Operational Module Access Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
          Operational Subsystems
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link to="/users" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">User Hierarchy</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Manage Officers, Viewers & Station Supervisions</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Security Scopes</span>
              <span className="text-brand-blue font-semibold">Access Console</span>
            </div>
          </Link>

          <Link to="/firs" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">FIR Management</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Citizen complaints, sequential tracking & printable sheets</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Complaint Intake</span>
              <span className="text-brand-blue font-semibold">Open Registry</span>
            </div>
          </Link>

          <Link to="/cases" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">Case Registry</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Investigation lifecycle, clearance milestones & reassignments</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Active Dossiers</span>
              <span className="text-brand-blue font-semibold">Manage Cases</span>
            </div>
          </Link>

          <Link to="/criminals" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">Criminal Registry</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Identity master, known aliases, marks & case linkage</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Repeat Offenders</span>
              <span className="text-brand-blue font-semibold">View Master</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Station Activity & Audits */}
      <Card
        title="Live Department Activity Stream"
        subtitle="Chronological audit records from central registries"
        icon={Clock}
      >
        {activities.length === 0 ? (
          <p className="text-slate-400 text-xs py-6 text-center">No recent audit activity logged.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {activities.map((act) => (
              <div key={act._id} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Badge variant="info" size="sm" className="font-mono text-[10px] shrink-0">
                    {act.action}
                  </Badge>
                  <span className="text-slate-700 font-medium truncate">
                    <strong className="text-navy-900">{act.userId?.name || 'Officer'}</strong> recorded action on {act.entityType}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(act.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
