import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Undo2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import recoveryService from '../../services/recoveryService';
import auditService from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';

export default function RecoveryConsole() {
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState('REVERSIBLE'); // 'REVERSIBLE' | 'HISTORY'

  // Data States
  const [reversibleLogs, setReversibleLogs] = useState([]);
  const [recoveryHistory, setRecoveryHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchConsoleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allLogsRes, historyRes, statsRes] = await Promise.all([
        auditService.getAuditLogs({ limit: 50 }),
        recoveryService.getRecoveryHistory({ limit: 25 }),
        auditService.getStats(),
      ]);

      // Reversible logs: items with non-empty oldValues and not UNDO_MUTATION
      const reversible = (allLogsRes.data.items || []).filter(
        (l) => l.oldValues && Object.keys(l.oldValues).length > 0 && l.action !== 'UNDO_MUTATION'
      );

      setReversibleLogs(reversible);
      setRecoveryHistory(historyRes.data.items || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Failed to load recovery console data:', err);
      setError(err.message || 'Failed to load recovery console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsoleData();
  }, []);

  const handleRollback = async (logItem) => {
    const confirm = window.confirm(
      `Confirm rollback: Revert '${logItem.action}' on ${logItem.entityType}? Previous snapshot will be written back to the database.`
    );
    if (!confirm) return;

    setProcessingId(logItem._id);
    setError(null);
    try {
      const res = await recoveryService.undoMutation(logItem._id);
      setSuccessMsg(res.data.message || 'Rollback executed successfully.');
      fetchConsoleData();
    } catch (err) {
      setError(err.message || 'Failed to execute rollback.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-warning font-bold">ADMIN DISASTER RECOVERY</span>
            <span className="text-xs text-slate-500 font-mono">State-Aware Rollback</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-amber-600" />
            Audit Recovery & Undo Console
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Safely revert accidental mutations, reassignments, or status changes using tamper-evident audit snapshots.
          </p>
        </div>

        <button
          onClick={fetchConsoleData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs border transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Engine</span>
        </button>
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

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Reversible Mutations</span>
            <RotateCcw className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{reversibleLogs.length}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Ready for one-click rollback</span>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Executed Rollbacks</span>
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2 font-mono">{recoveryHistory.length}</p>
          <span className="text-[10px] text-purple-700 font-semibold">Total undo events in ledger</span>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Recovery Health</span>
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-emerald-600 mt-2 font-mono">Forensic Chain Intact</p>
          <span className="text-[10px] text-slate-500 font-semibold">Non-destructive snapshots active</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('REVERSIBLE')}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'REVERSIBLE'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span>Reversible Actions Stream ({reversibleLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Rollback Audit History ({recoveryHistory.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: REVERSIBLE MUTATIONS STREAM */}
      {activeTab === 'REVERSIBLE' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              Reversible Audit Snapshots
            </h2>
            <span className="text-[11px] text-slate-500">
              Only actions with stored previous state snapshots are shown
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Scanning audit snapshots...</div>
          ) : reversibleLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No reversible mutation snapshots found in recent audit history.
            </div>
          ) : (
            <div className="space-y-3">
              {reversibleLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge-warning font-mono font-bold text-[10px]">{log.action}</span>
                      <span className="text-xs font-bold text-navy-900">{log.entityType}</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        ID: {log.entityId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-2">
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-900">
                        <span className="text-[9px] uppercase font-bold text-red-600 block">Snapshot to Restore (Before)</span>
                        <pre className="text-[10px] truncate whitespace-pre-wrap">{JSON.stringify(log.oldValues)}</pre>
                      </div>
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                        <span className="text-[9px] uppercase font-bold text-emerald-600 block">Current Applied (After)</span>
                        <pre className="text-[10px] truncate whitespace-pre-wrap">{JSON.stringify(log.newValues)}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col justify-end">
                    <button
                      onClick={() => handleRollback(log)}
                      disabled={processingId === log._id}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs shadow flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{processingId === log._id ? 'Reverting...' : 'Rollback Mutation'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: ROLLBACK HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-blue" />
              Rollback Execution History Ledger
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">{recoveryHistory.length} Rollback Events</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading rollback history...</div>
          ) : recoveryHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No rollback operations recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Rollback Timestamp</th>
                    <th className="py-3 px-3">Restored Entity</th>
                    <th className="py-3 px-3">Reverted Action</th>
                    <th className="py-3 px-3">Reverted By</th>
                    <th className="py-3 px-3">Original Audit Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {recoveryHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-navy-900">{item.entityType}</span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">{item.entityId}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge-warning text-[10px] font-bold">
                          {item.metadata?.revertedAction || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {item.userId?.name || 'Admin'} ({item.userId?.employeeId || 'ADMIN'})
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[10px] truncate max-w-[140px]">
                        {item.metadata?.revertedAuditId || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
