import React, { useState, useEffect } from 'react';
import { 
  RotateCcw, 
  RotateCw,
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
  Redo2,
  FileCode,
  Eye,
  AlertCircle
} from 'lucide-react';
import recoveryService from '../../services/recoveryService';
import auditService from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

export default function RecoveryConsole() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState('REVERSIBLE'); // 'REVERSIBLE' | 'HISTORY'

  // Data States
  const [reversibleLogs, setReversibleLogs] = useState([]);
  const [recoveryHistory, setRecoveryHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  // Modal States
  const [selectedLogForDiff, setSelectedLogForDiff] = useState(null);
  const [confirmRollbackLog, setConfirmRollbackLog] = useState(null);
  const [confirmRedoLog, setConfirmRedoLog] = useState(null);

  const fetchConsoleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allLogsRes, historyRes, statsRes] = await Promise.all([
        auditService.getAuditLogs({ limit: 50 }),
        recoveryService.getRecoveryHistory({ limit: 25 }),
        auditService.getStats(),
      ]);

      // Reversible logs: items with non-empty oldValues and not UNDO_MUTATION or REDO_MUTATION
      const reversible = (allLogsRes.data.items || []).filter(
        (l) => l.oldValues && Object.keys(l.oldValues).length > 0 && l.action !== 'UNDO_MUTATION' && l.action !== 'REDO_MUTATION'
      );

      setReversibleLogs(reversible);
      setRecoveryHistory(historyRes.data.items || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Failed to load recovery console data:', err);
      setError(err.message || 'Failed to load recovery console data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsoleData();
  }, []);

  const handleExecuteRollback = async () => {
    if (!confirmRollbackLog) return;
    const logItem = confirmRollbackLog;
    setProcessingId(logItem._id);
    try {
      const res = await recoveryService.undoMutation(logItem._id);
      showSuccess(res.data.message || `Rollback executed: ${logItem.action} on ${logItem.entityType} restored.`);
      setConfirmRollbackLog(null);
      fetchConsoleData();
    } catch (err) {
      showError(err.message || 'Failed to execute rollback mutation.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecuteRedo = async () => {
    if (!confirmRedoLog) return;
    const logItem = confirmRedoLog;
    setProcessingId(logItem._id);
    try {
      const res = await recoveryService.redoMutation(logItem._id);
      showSuccess(res.data.message || `Redo executed: Action re-applied to ${logItem.entityType}.`);
      setConfirmRedoLog(null);
      fetchConsoleData();
    } catch (err) {
      showError(err.message || 'Failed to execute redo mutation.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Audit Recovery & Rollback Console"
        description="Safely inspect previous data snapshots and revert accidental mutations or re-apply historical states using tamper-evident audit logs."
        breadcrumbs={[
          { label: 'Admin', path: '/admin/dashboard' },
          { label: 'System Recovery' },
        ]}
        actions={
          <Button
            variant="secondary"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchConsoleData}
          >
            Refresh Engine
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Reversible Snapshots (Undo)"
          value={reversibleLogs.length}
          subtitle="Available for one-click restoration"
          icon={RotateCcw}
          variant="warning"
        />
        <StatCard
          title="Recovery History (Undo / Redo)"
          value={recoveryHistory.length}
          subtitle="Historical state reversals recorded"
          icon={History}
          variant="primary"
        />
        <StatCard
          title="Forensic Chain"
          value="100% Intact"
          subtitle="Non-destructive append-only log ledger"
          icon={ShieldAlert}
          variant="success"
        />
      </div>

      {error && (
        <ErrorState
          title="Console Synchronization Error"
          message={error}
          onRetry={fetchConsoleData}
        />
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('REVERSIBLE')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'REVERSIBLE'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Undo2 className="w-4 h-4 text-amber-600" />
          <span>Reversible Actions (Undo)</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-800">
            {reversibleLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'border-brand-blue text-brand-blue bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <History className="w-4 h-4 text-brand-blue" />
          <span>Rollback & Redo History</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700">
            {recoveryHistory.length}
          </span>
        </button>
      </div>

      {/* TAB 1: REVERSIBLE ACTIONS (UNDO) */}
      {activeTab === 'REVERSIBLE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Restorable Snapshot Ledger (Undo Candidates)</h2>
              <p className="text-xs text-slate-500">
                Mutations with verified pre-change snapshots available for atomic database rollback.
              </p>
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : reversibleLogs.length === 0 ? (
            <EmptyState
              icon={RotateCcw}
              title="No Reversible Snapshots Found"
              description="No recent mutation logs with restorable previous states exist in the current audit window."
              actionLabel="Refresh Ledger"
              onAction={fetchConsoleData}
            />
          ) : (
            <div className="space-y-3">
              {reversibleLogs.map((log) => (
                <div
                  key={log._id}
                  className="card-surface p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-l-4 border-l-amber-500"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="warning">{log.action}</Badge>
                      <span className="text-xs font-bold text-navy-900">{log.entityType}</span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        ID: {log.entityId}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {log.userId && (
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {log.userId.name} ({log.userId.employeeId || 'OFFICER'})
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono mt-2">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-950">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-red-700">Previous Snapshot (To Restore via Undo)</span>
                          <span className="text-[10px] text-red-600 font-bold">STATE BEFORE</span>
                        </div>
                        <pre className="text-[11px] overflow-x-auto max-h-24 whitespace-pre-wrap">
                          {JSON.stringify(log.oldValues, null, 2)}
                        </pre>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase font-bold text-emerald-700">Applied State (Current in DB)</span>
                          <span className="text-[10px] text-emerald-600 font-bold">STATE AFTER</span>
                        </div>
                        <pre className="text-[11px] overflow-x-auto max-h-24 whitespace-pre-wrap">
                          {JSON.stringify(log.newValues, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedLogForDiff(log)}
                    >
                      Full Diff
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      icon={RotateCcw}
                      loading={processingId === log._id}
                      onClick={() => setConfirmRollbackLog(log)}
                    >
                      Undo Action
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLLBACK & REDO HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="card-surface p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Rollback & Redo Execution History Ledger</h2>
              <p className="text-xs text-slate-500">Forensic trail of all state restorations and forward re-applications.</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{recoveryHistory.length} events</span>
          </div>

          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={4} columns={6} />
            </div>
          ) : recoveryHistory.length === 0 ? (
            <EmptyState
              icon={History}
              title="No Rollback History"
              description="No state restoration operations have been performed on this platform yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Target Entity</th>
                    <th>Original Action</th>
                    <th>Authorized Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recoveryHistory.map((item) => {
                    const isUndo = item.action === 'UNDO_MUTATION';
                    return (
                      <tr key={item._id}>
                        <td className="font-mono text-xs text-slate-600 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <Badge variant={isUndo ? 'warning' : 'success'}>
                            {item.action}
                          </Badge>
                        </td>
                        <td>
                          <span className="font-bold text-navy-900">{item.entityType}</span>
                          <span className="block text-[11px] font-mono text-slate-400">ID: {item.entityId}</span>
                        </td>
                        <td>
                          <span className="text-xs font-medium text-slate-700">
                            {item.metadata?.revertedAction || item.metadata?.redoneAction || 'MUTATION'}
                          </span>
                          {item.metadata?.revertedAuditId && (
                            <span className="block text-[10px] font-mono text-slate-400">
                              Ref: {item.metadata.revertedAuditId}
                            </span>
                          )}
                        </td>
                        <td className="text-xs text-slate-700">
                          <span className="font-semibold text-navy-900">{item.userId?.name || 'Admin'}</span>
                          <span className="block text-[11px] text-slate-500 font-mono">
                            {item.userId?.employeeId || 'SUPER_ADMIN'}
                          </span>
                        </td>
                        <td>
                          {isUndo ? (
                            <Button
                              variant="primary"
                              size="xs"
                              icon={RotateCw}
                              loading={processingId === item._id}
                              onClick={() => setConfirmRedoLog(item)}
                              className="bg-brand-blue hover:bg-blue-700"
                            >
                              Redo
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono italic">
                              Re-applied
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FULL DIFF MODAL */}
      {selectedLogForDiff && (
        <Modal
          isOpen={!!selectedLogForDiff}
          onClose={() => setSelectedLogForDiff(null)}
          title={`State Snapshot Comparison — ${selectedLogForDiff.action}`}
          subtitle={`Entity: ${selectedLogForDiff.entityType} (${selectedLogForDiff.entityId})`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Rolling back this record will write the <strong>State Snapshot (Before)</strong> back to the active database table.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">
                  Snapshot Before Mutation (Restorable via Undo)
                </span>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-auto max-h-80">
                  <pre>{JSON.stringify(selectedLogForDiff.oldValues, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                  State After Mutation (Applied)
                </span>
                <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-auto max-h-80">
                  <pre>{JSON.stringify(selectedLogForDiff.newValues, null, 2)}</pre>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setSelectedLogForDiff(null)}>
                Close Preview
              </Button>
              <Button
                variant="warning"
                icon={RotateCcw}
                onClick={() => {
                  const target = selectedLogForDiff;
                  setSelectedLogForDiff(null);
                  setConfirmRollbackLog(target);
                }}
              >
                Proceed to Undo
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM UNDO (ROLLBACK) DIALOG */}
      <ConfirmDialog
        isOpen={!!confirmRollbackLog}
        onClose={() => setConfirmRollbackLog(null)}
        onConfirm={handleExecuteRollback}
        title="Execute Database Rollback (Undo)"
        message={
          confirmRollbackLog
            ? `Are you sure you want to revert '${confirmRollbackLog.action}' on ${confirmRollbackLog.entityType} (ID: ${confirmRollbackLog.entityId})? The previous data snapshot will be restored into the active collection.`
            : ''
        }
        confirmText="Confirm & Undo"
        cancelText="Cancel"
        variant="warning"
        loading={!!processingId}
      />

      {/* CONFIRM REDO DIALOG */}
      <ConfirmDialog
        isOpen={!!confirmRedoLog}
        onClose={() => setConfirmRedoLog(null)}
        onConfirm={handleExecuteRedo}
        title="Execute Database Redo (Re-apply State)"
        message={
          confirmRedoLog
            ? `Are you sure you want to re-apply the forward state for ${confirmRedoLog.entityType} (ID: ${confirmRedoLog.entityId})? This will reverse the previous Undo action.`
            : ''
        }
        confirmText="Confirm & Redo"
        cancelText="Cancel"
        variant="primary"
        loading={!!processingId}
      />
    </div>
  );
}

