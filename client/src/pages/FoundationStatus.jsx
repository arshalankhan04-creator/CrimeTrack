import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Database, 
  ShieldCheck, 
  FileText,
  Briefcase,
  Users,
  Search,
  BarChart3,
  FileSearch,
  MessageSquare,
  ArrowRight,
  Shield,
  Activity,
  Zap,
  Lock,
  Radio
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ErrorState from '../components/common/ErrorState';

export default function FoundationStatus() {
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async (isManual = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setHealthData(res);
      setLastChecked(new Date().toLocaleTimeString());
      if (isManual) {
        showSuccess('Station telemetry and health checks refreshed.');
      }
    } catch (err) {
      console.error('Health check failed:', err);
      const msg = err.message || 'Failed to connect to backend server.';
      setError(msg);
      if (isManual) {
        showError(msg);
      }
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth(false);
  }, []);

  const isDbConnected = healthData?.data?.database?.isConnected;

  const quickModules = [
    {
      title: 'FIR Management',
      desc: 'Register and search official First Information Reports with sequential numbering.',
      path: '/firs',
      icon: FileText,
      color: 'text-brand-blue bg-blue-50 border-blue-200',
    },
    {
      title: 'Case Management',
      desc: 'Track case lifecycles, priority matrices, history timelines, and assigned officers.',
      path: '/cases',
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Criminal Registry',
      desc: 'Privacy-preserving criminal master identities and cross-case linkage.',
      path: '/criminals',
      icon: Users,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Investigation Journals',
      desc: 'Chronological case diaries, stage progression meters, and evidence lockers.',
      path: '/investigations',
      icon: FileSearch,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: 'Global Omni-Search',
      desc: 'Unified multi-filter query engine across FIRs, cases, crimes, and evidence.',
      path: '/search',
      icon: Search,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
    },
    {
      title: 'Reports & Analytics',
      desc: 'Real-time statistical charts, CSV streaming exports, and printable police dossiers.',
      path: '/reports',
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        title="CrimeTrack Station Command Overview"
        description="Central Law Enforcement Command — Real-time telemetry, operational registries, subsystem integrity, and forensic audit pipelines."
        breadcrumbs={[
          { label: 'Overview', path: '/' },
          { label: 'System Health & Registries' },
        ]}
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={loading}
            onClick={() => fetchHealth(true)}
          >
            {lastChecked ? `Checked ${lastChecked}` : 'Refresh Health'}
          </Button>
        }
      />

      {error && (
        <ErrorState
          title="Telemetry Connection Issue"
          message={error}
          onRetry={fetchHealth}
        />
      )}

      {/* Main Connection Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend API Card */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              API Gateway
            </span>
            <div className="p-1.5 bg-blue-50 text-brand-blue rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {!error && healthData ? (
              <Badge variant="success">ONLINE (200 OK)</Badge>
            ) : (
              <Badge variant="danger">OFFLINE</Badge>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p className="flex justify-between">
              <span className="text-slate-400">Uptime:</span>
              <span className="font-mono text-slate-700">{healthData?.data?.uptime || 'Active'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Environment:</span>
              <span className="font-mono text-slate-700">Production Mode</span>
            </p>
          </div>
        </div>

        {/* MongoDB Database Card */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Database Engine
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {isDbConnected ? (
              <Badge variant="success">CONNECTED</Badge>
            ) : (
              <Badge variant="warning">RETRYING</Badge>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p className="flex justify-between">
              <span className="text-slate-400">Cluster:</span>
              <span className="font-mono text-slate-700">MongoDB 127.0.0.1</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Database:</span>
              <span className="font-mono text-slate-700">crimetrack</span>
            </p>
          </div>
        </div>

        {/* Security & RBAC Engine */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Security Protocol
            </span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <Badge variant="primary">RBAC ENFORCED</Badge>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p className="flex justify-between">
              <span className="text-slate-400">Auth Engine:</span>
              <span className="font-mono text-slate-700">JWT + bcrypt</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Active Roles:</span>
              <span className="font-mono text-slate-700">Admin / Officer / Viewer</span>
            </p>
          </div>
        </div>

        {/* Audit & Disaster Recovery */}
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Integrity Trails
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <Badge variant="success">IMMUTABLE LOGS</Badge>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p className="flex justify-between">
              <span className="text-slate-400">Audit Diff:</span>
              <span className="font-mono text-slate-700">Active</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Undo Engine:</span>
              <span className="font-mono text-slate-700">State-Aware</span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access Modules Navigation */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-blue" />
              Operational Modules & Registries
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct access to core station registries for FIR complaints, case dossiers, evidence lockers, and report analytics.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickModules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                to={m.path}
                className="group p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className={`p-2 rounded-lg w-fit border ${m.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs text-navy-900 mt-3 group-hover:text-brand-blue transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-blue group-hover:text-brand-hoverBlue transition">
                  <span>Open Registry</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

