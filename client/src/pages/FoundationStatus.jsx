import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Database, 
  Shield, 
  Layers, 
  Cpu, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export default function FoundationStatus() {
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info">Milestone 1</span>
            <span className="text-xs text-slate-500 font-mono">Architecture Foundation</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            CrimeTrack System Status
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            MERN Police Crime & Case Management System Foundation Handshake
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition border border-slate-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Recheck API</span>
          </button>
        </div>
      </div>

      {/* Main Connection Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Backend API Card */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Backend API Server
            </span>
            <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            {!error && healthData ? (
              <>
                <span className="badge-success">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ONLINE (200 OK)
                </span>
              </>
            ) : (
              <span className="badge-danger">
                <XCircle className="w-3.5 h-3.5" />
                OFFLINE
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p><strong>Endpoint:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded">/api/health</code></p>
            <p><strong>Port:</strong> 5000 (Express.js)</p>
            <p><strong>Uptime:</strong> {healthData?.data?.uptime || 'N/A'}</p>
          </div>
        </div>

        {/* MongoDB Status Card */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Database Engine
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            {isDbConnected ? (
              <span className="badge-success">
                <CheckCircle2 className="w-3.5 h-3.5" />
                CONNECTED
              </span>
            ) : (
              <span className="badge-warning">
                <XCircle className="w-3.5 h-3.5" />
                {healthData?.data?.database?.state?.toUpperCase() || 'STANDBY / RETRYING'}
              </span>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p><strong>Driver:</strong> Mongoose v8.x</p>
            <p><strong>Database:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded">crimetrack</code></p>
            <p><strong>Host:</strong> {healthData?.data?.database?.host || '127.0.0.1'}</p>
          </div>
        </div>

        {/* Frontend Client Card */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Frontend Client
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="badge-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              REACT + VITE READY
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-1">
            <p><strong>Port:</strong> 5173</p>
            <p><strong>Design System:</strong> Police Institutional Slate/Navy</p>
            <p><strong>Last Sync:</strong> {lastChecked || 'Initial load'}</p>
          </div>
        </div>
      </div>

      {/* Raw Health Response Detail */}
      <div className="card-surface p-6">
        <h2 className="text-base font-semibold text-navy-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-blue" />
          Backend Health Endpoint Payload
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Live response from Express REST API confirming CORS, environment parsing, and response formatting.
        </p>

        <div className="mt-4 bg-navy-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
          {loading ? (
            <p className="text-slate-400">Querying API...</p>
          ) : error ? (
            <p className="text-red-400">{JSON.stringify({ success: false, error }, null, 2)}</p>
          ) : (
            <pre>{JSON.stringify(healthData, null, 2)}</pre>
          )}
        </div>
      </div>

      {/* Implementation Roadmap Progress Overview */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-blue" />
            CrimeTrack Implementation Roadmap & Milestones
          </h2>
          <span className="badge-success">5 / 15 Milestones Completed</span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" /> M1 COMPLETED
            </span>
            <p className="font-semibold text-xs text-navy-900 mt-2">Project Foundation</p>
            <p className="text-[11px] text-slate-600 mt-1">Express, MongoDB, React, Vite, Tailwind CSS, Health Endpoint.</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" /> M2 COMPLETED
            </span>
            <p className="font-semibold text-xs text-navy-900 mt-2">Auth & Authorization</p>
            <p className="text-[11px] text-slate-600 mt-1">JWT, bcrypt, RBAC middleware, Login portal, Multi-role dashboards.</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" /> M3 COMPLETED
            </span>
            <p className="font-semibold text-xs text-navy-900 mt-2">User Management</p>
            <p className="text-[11px] text-slate-600 mt-1">Admin Officer/Viewer creation, supervisor assignment, audit integration.</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" /> M4 COMPLETED
            </span>
            <p className="font-semibold text-xs text-navy-900 mt-2">FIR Management</p>
            <p className="text-[11px] text-slate-600 mt-1">FIR registration, officer scoping, search/filter, printable police sheet.</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
              <CheckCircle2 className="w-3 h-3" /> M5 COMPLETED
            </span>
            <p className="font-semibold text-xs text-navy-900 mt-2">Case Management</p>
            <p className="text-[11px] text-slate-600 mt-1">Case creation, FIR linkage, status lifecycle, history tracking, reassignment.</p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg">
            <span className="text-[10px] font-bold text-brand-blue bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
              M6 UPCOMING
            </span>
            <p className="font-semibold text-xs text-navy-900 mt-2">Crimes & Criminals</p>
            <p className="text-[11px] text-slate-600 mt-1">Crime classification, minimal global criminal search, suspect linking.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg opacity-75">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">M7 QUEUED</span>
            <p className="font-semibold text-xs text-navy-900 mt-2">Investigations</p>
            <p className="text-[11px] text-slate-600 mt-1">Investigation timeline notes, evidence attachments, case history.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg opacity-75">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">M8–M15</span>
            <p className="font-semibold text-xs text-navy-900 mt-2">Analytics & Polish</p>
            <p className="text-[11px] text-slate-600 mt-1">Reports, Audit Logs, Undo/Redo, Testing, and Production Polish.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
