import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Briefcase, 
  Users, 
  FileSearch, 
  Activity, 
  CheckCircle2, 
  PlusCircle, 
  RefreshCw,
  Layers,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import AnalyticsCharts from '../../components/dashboard/AnalyticsCharts';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

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
      {/* Header Banner */}
      <PageHeader
        badge="ROLE: INVESTIGATING OFFICER"
        badgeMeta={`Officer ID: ${user?.employeeId || 'OFF-101'}`}
        title="Officer Operational Workspace"
        subtitle={`Welcome, ${user?.name || 'Officer'}. Review assigned FIR complaints, active case files, and evidence items.`}
        actions={
          <>
            <Link to="/cases">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                Open Case
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchOfficerData}
            >
              Refresh
            </Button>
          </>
        }
      />

      {/* Officer Personal Caseload KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        <StatCard
          title="Assigned FIRs"
          value={stats?.totalFIRs}
          subtitle="Assigned Complaints"
          icon={FileText}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Active Caseload"
          value={stats?.activeCaseload}
          subtitle="Under Investigation"
          icon={Activity}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Solved Cases"
          value={stats?.resolvedCases}
          subtitle={`${stats?.resolutionRate || 0}% Cleared`}
          icon={CheckCircle2}
          color="emerald"
          loading={loading}
        />
        <StatCard
          title="Evidence Logged"
          value={stats?.totalEvidenceCount}
          subtitle="Items in Custody"
          icon={Layers}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Linked Suspects"
          value={stats?.totalCriminals}
          subtitle="Offender Records"
          icon={Users}
          color="rose"
          loading={loading}
        />
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts charts={charts} stats={stats} />

      {/* Operational Module Access Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider px-1">
          Operational Workspace Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/firs" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">FIR Registry</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Register & manage official citizen FIR complaints</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Complaint Intake</span>
              <span className="text-brand-blue font-semibold">Open Registry</span>
            </div>
          </Link>

          <Link to="/cases" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">My Cases</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Active investigation dossiers & status transitions</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Assigned Files</span>
              <span className="text-brand-blue font-semibold">Manage Cases</span>
            </div>
          </Link>

          <Link to="/criminals" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">Criminal Registry</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Identity matching, aliases & case suspect linkage</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Repeat Offenders</span>
              <span className="text-brand-blue font-semibold">Search Master</span>
            </div>
          </Link>

          <Link to="/investigations" className="card-surface p-5 hover:border-brand-blue/60 hover:shadow-card transition group flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900 group-hover:text-brand-blue transition">Investigation Journals</span>
                <span className="text-xs text-brand-blue font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Chronological case timeline & evidence locker notes</p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Forensics & Custody</span>
              <span className="text-brand-blue font-semibold">Open Journal</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Scope Restriction Info */}
      <div className="card-surface p-4 bg-slate-50/80 border-l-4 border-l-brand-blue text-xs">
        <h4 className="font-semibold text-navy-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-blue" />
          Active Officer Caseload Scope
        </h4>
        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
          Your dashboard metrics and case access are scoped to records assigned to your officer account ({user?.employeeId || user?.email}).
        </p>
      </div>
    </div>
  );
}
