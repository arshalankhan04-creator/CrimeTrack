import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  X, 
  Clock, 
  User, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  FileCode,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import auditService from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';

const ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'CREATE_USER',
  'UPDATE_USER',
  'REGISTER_FIR',
  'CREATE_CASE',
  'UPDATE_CASE_STATUS',
  'REASSIGN_CASE',
  'CREATE_CRIME',
  'CREATE_CRIMINAL',
  'LINK_CRIMINAL_CASE',
  'UNLINK_CRIMINAL_CASE',
  'CREATE_INVESTIGATION',
  'ADD_EVIDENCE',
  'UPDATE_INVESTIGATION',
  'DELETE_INVESTIGATION',
];

const ENTITY_TYPES = ['User', 'FIR', 'Case', 'Crime', 'Criminal', 'Investigation'];

export default function AuditLogs() {
  const { user } = useAuth();

  // Filter States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Data States
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  const fetchLogs = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageNum,
        limit: 20,
        search: search || undefined,
        action: selectedAction || undefined,
        entityType: selectedEntity || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };

      const [logsRes, statsRes] = await Promise.all([
        auditService.getAuditLogs(params),
        auditService.getStats(),
      ]);

      setLogs(logsRes.data.items || []);
      setPagination(logsRes.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to retrieve audit trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [selectedAction, selectedEntity]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs(1);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    setError(null);
    try {
      const params = {
        action: selectedAction || undefined,
        entityType: selectedEntity || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      await auditService.downloadCSV(params);
      setSuccessMsg('Audit compliance trail exported as CSV.');
    } catch (err) {
      setError(err.message || 'Failed to export audit trail.');
    } finally {
      setExporting(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.startsWith('CREATE') || action.startsWith('REGISTER')) {
      return <span className="badge-success font-mono font-bold text-[10px]">{action}</span>;
    }
    if (action.startsWith('UPDATE') || action.startsWith('REASSIGN')) {
      return <span className="badge-warning font-mono font-bold text-[10px]">{action}</span>;
    }
    if (action.startsWith('DELETE') || action.includes('FAILED')) {
      return <span className="badge-danger font-mono font-bold text-[10px]">{action}</span>;
    }
    return <span className="badge-info font-mono font-bold text-[10px]">{action}</span>;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-success font-bold">ADMIN SECURITY SCOPE</span>
            <span className="text-xs text-slate-500 font-mono">Immutable Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-blue" />
            Audit Logs & Security Trails
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete cryptographic audit trail of all database mutations, officer activities, and security events.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export Audit Trail (CSV)'}</span>
          </button>

          <button
            onClick={() => fetchLogs(page)}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-semantic-successBg border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-800 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-semantic-dangerBg border border-red-200 rounded-lg flex items-center justify-between text-red-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Audit KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Audit Events</span>
              <Activity className="w-4 h-4 text-brand-blue" />
            </div>
            <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats.totalCount}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Lifetime logged mutations</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Today's Mutations</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{stats.todayCount}</p>
            <span className="text-[10px] text-emerald-700 font-semibold">Recorded past 24 hours</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Officers</span>
              <User className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-2 font-mono">{stats.activeOfficersCount}</p>
            <span className="text-[10px] text-purple-700 font-semibold">Unique recorded actors</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Top Action</span>
              <Layers className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-sm font-bold text-navy-900 mt-2 font-mono truncate">
              {stats.topActions?.[0]?.action || 'N/A'}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold font-mono">
              {stats.topActions?.[0]?.count || 0} events
            </span>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-surface p-5 space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Action Type</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            >
              <option value="">All Actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Target Entity</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            >
              <option value="">All Entities</option>
              {ENTITY_TYPES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Date Range</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filter Logs</span>
            </button>
          </div>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-blue" />
            Audit Log Ledger ({pagination.total} Total Records)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading audit ledger...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No audit logs match your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Acting User</th>
                  <th className="py-3 px-3">Action Type</th>
                  <th className="py-3 px-3">Target Entity</th>
                  <th className="py-3 px-3">Changed Fields (Diff)</th>
                  <th className="py-3 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-bold text-navy-900">{log.userId?.name || 'System'}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.userId?.employeeId || log.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700">{log.entityType}</span>
                      {log.entityId && (
                        <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                          {log.entityId}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-600 font-mono text-[11px]">
                      {log.newValues ? JSON.stringify(log.newValues) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLog(log);
                          setIsDiffModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600 hover:text-navy-900 transition"
                        title="Inspect Diff Record"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <button
              disabled={page <= 1}
              onClick={() => {
                const prev = Math.max(page - 1, 1);
                setPage(prev);
                fetchLogs(prev);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-slate-500 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchLogs(next);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* AUDIT DIFF INSPECTOR MODAL */}
      {isDiffModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-blue" />
                Audit Record Diff Inspector
              </h3>
              <button onClick={() => setIsDiffModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              {/* Event Metadata */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Audit ID</span>
                  <p className="font-bold text-navy-900 text-xs mt-0.5 truncate">{selectedLog._id}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Action Type</span>
                  <p className="mt-0.5">{getActionBadge(selectedLog.action)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Acting Officer</span>
                  <p className="font-bold text-navy-900 text-xs mt-0.5">
                    {selectedLog.userId?.name} ({selectedLog.userId?.employeeId})
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Timestamp</span>
                  <p className="text-slate-700 text-xs mt-0.5">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Diff Side by Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Old Values */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Previous Values (Before)</span>
                  <pre className="p-3 bg-red-50/50 border border-red-200 rounded-lg text-[11px] text-red-900 font-mono whitespace-pre-wrap overflow-x-auto min-h-[120px]">
                    {selectedLog.oldValues
                      ? JSON.stringify(selectedLog.oldValues, null, 2)
                      : 'None (Initial Record / Creation)'}
                  </pre>
                </div>

                {/* New Values */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Updated Values (After)</span>
                  <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 font-mono whitespace-pre-wrap overflow-x-auto min-h-[120px]">
                    {selectedLog.newValues
                      ? JSON.stringify(selectedLog.newValues, null, 2)
                      : 'None'}
                  </pre>
                </div>
              </div>

              {/* Context Metadata */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Context Metadata</span>
                  <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 font-mono whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 shrink-0">
              <button
                onClick={() => setIsDiffModalOpen(false)}
                className="px-4 py-2 bg-navy-900 text-white rounded-lg font-semibold text-xs shadow hover:bg-navy-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
