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
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function FoundationStatus() {
  const { user, isAuthenticated } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setHealthData(res);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err.message || 'Failed to connect to backend server.');
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
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
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-success font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SYSTEM ACTIVE
            </span>
            <span className="text-xs text-slate-500 font-mono">Central Law Enforcement Command</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight flex items-center gap-2">
            CrimeTrack Station Command Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise Police Crime & Case Management System — Real-time telemetry, operational registries, and forensic auditing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition border border-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Health Status</span>
          </button>
        </div>
      </div>

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
          <div className="mt-2 flex items-baseline gap-2">
            {!error && healthData ? (
              <span className="badge-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ONLINE (200 OK)
              </span>
            ) : (
              <span className="badge-danger">
                <XCircle className="w-3.5 h-3.5" />
                OFFLINE
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
            <p><strong>Uptime:</strong> {healthData?.data?.uptime || 'Active'}</p>
            <p><strong>Environment:</strong> Production Mode</p>
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
          <div className="mt-2 flex items-baseline gap-2">
            {isDbConnected ? (
              <span className="badge-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CONNECTED
              </span>
            ) : (
              <span className="badge-warning">
                <XCircle className="w-3.5 h-3.5" />
                RETRYING
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
            <p><strong>Cluster:</strong> MongoDB 127.0.0.1</p>
            <p><strong>Database:</strong> crimetrack</p>
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
          <div className="mt-2 flex items-baseline gap-2">
            <span className="badge-success">
              <ShieldCheck className="w-3.5 h-3.5" />
              RBAC ENFORCED
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
            <p><strong>Auth:</strong> JWT Bearer + bcrypt</p>
            <p><strong>Roles:</strong> Admin / Officer / Viewer</p>
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
          <div className="mt-2 flex items-baseline gap-2">
            <span className="badge-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              IMMUTABLE LOGS
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
            <p><strong>Audit Diff:</strong> Active</p>
            <p><strong>Undo Engine:</strong> State-Aware</p>
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
              Access core station services for FIR complaints, investigation journals, evidence files, and report generation.
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
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {m.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-brand-blue group-hover:translate-x-1 transition-transform">
                  <span>Open Registry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
