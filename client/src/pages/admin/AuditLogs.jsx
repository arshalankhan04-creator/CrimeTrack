import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  User, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  FileCode,
  FileText,
  Activity,
  ArrowRight,
  RotateCcw,
  Undo2
} from 'lucide-react';
import auditService from '../../services/auditService';
import recoveryService from '../../services/recoveryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Common UI Components
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

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
  const toast = useToast();

  // Filter States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Data States
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  // Undo Confirm Dialog
  const [logToUndo, setLogToUndo] = useState(null);
  const [undoLoading, setUndoLoading] = useState(false);

  const fetchLogs = async (pageNum = page) => {
    setLoading(true);
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
      toast.error(err.message || 'Failed to retrieve audit trail.');
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
    try {
      const params = {
        action: selectedAction || undefined,
        entityType: selectedEntity || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      await auditService.downloadCSV(params);
      toast.success('Audit compliance trail exported as CSV.');
    } catch (err) {
      toast.error(err.message || 'Failed to export audit trail.');
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmUndo = async () => {
    if (!logToUndo) return;
    setUndoLoading(true);
    try {
      const res = await recoveryService.undoMutation(logToUndo._id);
      toast.success(res.data.message || 'Mutation successfully reverted.');
      setIsDiffModalOpen(false);
      setLogToUndo(null);
      fetchLogs(page);
    } catch (err) {
      toast.error(err.message || 'Failed to revert mutation.');
    } finally {
      setUndoLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action === 'UNDO_MUTATION') {
      return <Badge variant="purple" className="flex items-center gap-1 font-mono"><RotateCcw className="w-3 h-3" /> UNDO_MUTATION</Badge>;
    }
    if (action.startsWith('CREATE') || action.startsWith('REGISTER')) {
      return <Badge variant="success" className="font-mono">{action}</Badge>;
    }
    if (action.startsWith('UPDATE') || action.startsWith('REASSIGN')) {
      return <Badge variant="warning" className="font-mono">{action}</Badge>;
    }
    if (action.startsWith('DELETE') || action.includes('FAILED')) {
      return <Badge variant="danger" className="font-mono">{action}</Badge>;
    }
    return <Badge variant="info" className="font-mono">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <PageHeader
        title="Audit Logs & Cryptographic Trail"
        subtitle="Immutable chronological ledger of all database mutations, administrative updates, and security telemetry."
        badge="SECURITY SCOPE"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              loading={exporting}
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchLogs(page)}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Audit KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Audit Events"
            value={stats.totalCount || 0}
            subtitle="Immutable Audit Logs"
            icon={Activity}
          />
          <StatCard
            title="Today's Mutations"
            value={stats.todayCount || 0}
            subtitle="Past 24 Hours Activity"
            icon={Clock}
            className="border-emerald-200"
          />
          <StatCard
            title="Active Officers"
            value={stats.activeOfficersCount || 0}
            subtitle="Duty Personnel"
            icon={User}
          />
          <StatCard
            title="Top Action"
            value={
              stats.topActions?.[0]?.action
                ? stats.topActions[0].action
                    .replace(/_/g, ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                : 'None Logged'
            }
            subtitle={`${stats.topActions?.[0]?.count || 0} Events Recorded`}
            icon={Layers}
            trend={{ direction: 'up', label: 'Leading' }}
          />
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-surface p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action, user, or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Action Type</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
            >
              <option value="">All Actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Entity</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
            >
              <option value="">All Entities</option>
              {ENTITY_TYPES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Date Range</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Search}
              className="w-full"
            >
              Filter Logs
            </Button>
          </div>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No Audit Records Found"
            description="No log events matched the specified search and filter criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Acting User</th>
                    <th>Action Type</th>
                    <th>Target Entity</th>
                    <th>Changed Fields (Diff)</th>
                    <th className="text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="text-slate-500 font-mono text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <div>
                          <p className="font-bold text-navy-950 text-xs">{log.userId?.name || 'System'}</p>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {log.userId?.employeeId || log.role}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="font-semibold text-slate-700 text-xs">{log.entityType}</span>
                        {log.entityId && (
                          <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td className="max-w-xs truncate text-slate-600 font-mono text-[11px]">
                        {log.newValues ? JSON.stringify(log.newValues) : '—'}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {log.oldValues && Object.keys(log.oldValues).length > 0 && log.action !== 'UNDO_MUTATION' && (
                            <button
                              onClick={() => setLogToUndo(log)}
                              className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-700 transition"
                              title="Revert Mutation (Undo)"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedLog(log);
                              setIsDiffModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-navy-900 transition"
                            title="Inspect Diff Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(p) => {
                setPage(p);
                fetchLogs(p);
              }}
            />
          </>
        )}
      </div>

      {/* AUDIT DIFF INSPECTOR MODAL */}
      <Modal
        isOpen={isDiffModalOpen && !!selectedLog}
        onClose={() => setIsDiffModalOpen(false)}
        title="Audit Record Diff Inspector"
        subtitle={`Transaction audit log #${selectedLog?._id}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Event Metadata */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Audit ID</span>
              <p className="font-bold text-navy-950 text-xs mt-0.5 truncate">{selectedLog?._id}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Action Type</span>
              <div className="mt-0.5">{selectedLog && getActionBadge(selectedLog.action)}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Acting Officer</span>
              <p className="font-bold text-navy-950 text-xs mt-0.5">
                {selectedLog?.userId?.name || 'System'} ({selectedLog?.userId?.employeeId || 'System'})
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Timestamp</span>
              <p className="text-slate-700 text-xs mt-0.5">{selectedLog?.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
          </div>

          {/* Diff Side by Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Old Values */}
            <div className="space-y-1.5 min-w-0">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Previous Values (Before)</span>
              <pre className="p-3 bg-red-50/50 border border-red-200 rounded-xl text-[11px] text-red-900 font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-60 min-h-[120px]">
                {selectedLog?.oldValues
                  ? JSON.stringify(selectedLog.oldValues, null, 2)
                  : 'None (Initial Record / Creation)'}
              </pre>
            </div>

            {/* New Values */}
            <div className="space-y-1.5 min-w-0">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Updated Values (After)</span>
              <pre className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-60 min-h-[120px]">
                {selectedLog?.newValues
                  ? JSON.stringify(selectedLog.newValues, null, 2)
                  : 'None'}
              </pre>
            </div>
          </div>

          {/* Context Metadata */}
          {selectedLog?.metadata && Object.keys(selectedLog.metadata).length > 0 && (
            <div className="space-y-1.5 min-w-0">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Context Metadata</span>
              <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-800 font-mono whitespace-pre-wrap break-all overflow-x-auto max-h-40">
                {JSON.stringify(selectedLog.metadata, null, 2)}
              </pre>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {selectedLog?.oldValues && Object.keys(selectedLog.oldValues).length > 0 && selectedLog.action !== 'UNDO_MUTATION' ? (
              <Button
                variant="primary"
                size="sm"
                icon={RotateCcw}
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  setLogToUndo(selectedLog);
                  setIsDiffModalOpen(false);
                }}
              >
                Revert This Mutation (Undo)
              </Button>
            ) : (
              <div />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDiffModalOpen(false)}
            >
              Close Inspector
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM UNDO MUTATION DIALOG */}
      <ConfirmDialog
        isOpen={!!logToUndo}
        onClose={() => setLogToUndo(null)}
        onConfirm={handleConfirmUndo}
        title="Revert Mutation (Undo)"
        message={`Are you sure you want to revert the mutation '${logToUndo?.action}' performed on ${logToUndo?.entityType}? This will restore the previous snapshot values.`}
        confirmText="Confirm Reversion"
        confirmVariant="danger"
        loading={undoLoading}
      />
    </div>
  );
}

