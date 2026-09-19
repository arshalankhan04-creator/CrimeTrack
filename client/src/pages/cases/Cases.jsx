import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  History, 
  UserCheck, 
  Activity, 
  RefreshCw,
  X,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import caseService from '../../services/caseService';
import firService from '../../services/firService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FormField, Input, Select, Textarea } from '../../components/common/FormControls';
import { TableSkeleton, ListSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const STATUS_TABS = [
  { label: 'All Cases', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Under Investigation', value: 'UNDER_INVESTIGATION' },
  { label: 'Solved', value: 'SOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function Cases() {
  const { user } = useAuth();
  const toast = useToast();
  const isReadOnlyViewer = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';

  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Auxiliary data
  const [availableFIRs, setAvailableFIRs] = useState([]);
  const [officers, setOfficers] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmCase, setDeleteConfirmCase] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseHistory, setCaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firId: '',
    summary: '',
    priority: 'MEDIUM',
    caseNumber: '',
    assignedOfficerId: '',
  });

  const [newStatus, setNewStatus] = useState('UNDER_INVESTIGATION');
  const [reassignOfficerId, setReassignOfficerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch Cases
  const fetchCases = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      };
      const res = await caseService.getCases(params);
      setCases(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      setError(err.message || 'Error fetching cases.');
      toast.error('Failed to load case records.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch FIRs for case creation
  const fetchFIRsForCreation = async () => {
    if (isReadOnlyViewer) return;
    try {
      const res = await firService.getFIRs({ limit: 50 });
      setAvailableFIRs(res.data.items || []);
      if (res.data.items?.length > 0 && !formData.firId) {
        setFormData((prev) => ({ ...prev, firId: res.data.items[0]._id }));
      }
    } catch (err) {
      console.warn('Failed to load FIRs list:', err.message);
    }
  };

  // Fetch active officers for admin reassignment
  const fetchOfficers = async () => {
    if (!isAdmin) return;
    try {
      const res = await userService.getUsers({ role: 'OFFICER', isActive: 'true', limit: 100 });
      setOfficers(res.data.items || []);
    } catch (err) {
      console.warn('Failed to load officers list:', err.message);
    }
  };

  useEffect(() => {
    fetchCases(1);
    fetchFIRsForCreation();
    fetchOfficers();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCases(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    fetchCases(1);
  };

  // Handle Open Case
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await caseService.createCase(formData);
      toast.success(`Case ${res.data.case?.caseNumber || ''} opened successfully.`);
      setIsCreateModalOpen(false);
      setFormData({
        firId: availableFIRs[0]?._id || '',
        summary: '',
        priority: 'MEDIUM',
        caseNumber: '',
        assignedOfficerId: '',
      });
      fetchCases(1);
    } catch (err) {
      toast.error(err.message || 'Failed to open case file.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      await caseService.updateCaseStatus(selectedCase._id, newStatus);
      toast.success(`Case ${selectedCase.caseNumber} updated to ${newStatus}.`);
      setIsStatusModalOpen(false);
      fetchCases(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update case status.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reassign
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase || !reassignOfficerId) return;
    setSubmitting(true);
    try {
      await caseService.reassignCase(selectedCase._id, reassignOfficerId);
      toast.success(`Case ${selectedCase.caseNumber} reassigned successfully.`);
      setIsReassignModalOpen(false);
      fetchCases(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to reassign case.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      await caseService.updateCase(selectedCase._id, {
        summary: formData.summary,
        priority: formData.priority,
      });
      toast.success(`Case ${selectedCase.caseNumber} updated successfully.`);
      setIsEditModalOpen(false);
      fetchCases(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update case.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const confirmDeleteCase = async () => {
    if (!deleteConfirmCase) return;
    setDeleting(true);
    try {
      await caseService.deleteCase(deleteConfirmCase._id);
      toast.success(`Case ${deleteConfirmCase.caseNumber} has been deleted.`);
      setDeleteConfirmCase(null);
      fetchCases(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete case.');
    } finally {
      setDeleting(false);
    }
  };

  // Open History / Details Modal
  const openHistoryModal = async (caseDoc) => {
    setSelectedCase(caseDoc);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await caseService.getCaseHistory(caseDoc._id);
      setCaseHistory(res.data.history || []);
    } catch (err) {
      console.warn('Failed to load history:', err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openStatusModal = (caseDoc) => {
    setSelectedCase(caseDoc);
    setNewStatus(caseDoc.status);
    setIsStatusModalOpen(true);
  };

  const openReassignModal = (caseDoc) => {
    setSelectedCase(caseDoc);
    setReassignOfficerId(caseDoc.assignedOfficerId?._id || officers[0]?._id || '');
    setIsReassignModalOpen(true);
  };

  const openEditModal = (caseDoc) => {
    setSelectedCase(caseDoc);
    setFormData({
      summary: caseDoc.summary,
      priority: caseDoc.priority,
      caseNumber: caseDoc.caseNumber,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <PageHeader
        badge="CASE MANAGEMENT"
        badgeMeta="Central Investigation Docket Registry"
        title="Case Management"
        subtitle={
          isReadOnlyViewer
            ? "Supervised read-only tracking of active case files and clearance statuses."
            : "Manage active investigation files, status transitions, priority assignments, and case audit history."
        }
        actions={
          !isReadOnlyViewer && (
            <Button
              variant="primary"
              size="md"
              icon={PlusCircle}
              onClick={() => {
                setFormData({
                  firId: availableFIRs[0]?._id || '',
                  summary: '',
                  priority: 'MEDIUM',
                  caseNumber: '',
                  assignedOfficerId: '',
                });
                setIsCreateModalOpen(true);
              }}
            >
              Open New Case
            </Button>
          )
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-px">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors duration-150 ${
              statusFilter === tab.value
                ? 'border-brand-blue text-brand-blue bg-blue-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 rounded-t-lg'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Priority Filter Controls */}
      <div className="card-surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Input
            icon={Search}
            placeholder="Search by Case #, summary, FIR #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Priority Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {(search || priorityFilter || statusFilter) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} icon={X}>
              Clear
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={() => fetchCases(pagination.page)}
            title="Refresh List"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Cases Data Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th>Case Reference</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Linked FIR</th>
                <th>Assigned Officer</th>
                <th>Opened Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-0">
                    <TableSkeleton rows={5} columns={7} />
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      title="No cases found"
                      description={
                        search || statusFilter || priorityFilter
                          ? "No case files matched your active query filters."
                          : "No active or closed cases found in your current operational scope."
                      }
                      actionLabel={search || statusFilter || priorityFilter ? "Clear Filters" : (!isReadOnlyViewer ? "Open First Case" : undefined)}
                      onAction={search || statusFilter || priorityFilter ? handleClearFilters : () => setIsCreateModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <button
                        onClick={() => openHistoryModal(c)}
                        className="font-mono font-bold text-brand-blue hover:underline text-left"
                        title="Click to view Case Dossier & History"
                      >
                        {c.caseNumber}
                      </button>
                    </td>
                    <td>
                      <Badge variant={c.status} dot>
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={c.priority}>
                        {c.priority}
                      </Badge>
                    </td>
                    <td>
                      {c.firId ? (
                        <div>
                          <p className="font-mono font-semibold text-slate-800 text-[11px]">{c.firId.firNumber}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{c.firId.crimeType}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No FIR Linked</span>
                      )}
                    </td>
                    <td>
                      <p className="font-semibold text-slate-700">{c.assignedOfficerId?.name || 'Unassigned'}</p>
                      {c.assignedOfficerId?.employeeId && (
                        <p className="text-[10px] text-slate-400 font-mono">{c.assignedOfficerId.employeeId}</p>
                      )}
                    </td>
                    <td>
                      <p className="text-slate-700 font-medium">
                        {new Date(c.openedAt || c.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* History & Details */}
                        <button
                          type="button"
                          onClick={() => openHistoryModal(c)}
                          className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition"
                          title="View Case Dossier & Audit History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Status Transition (Admin or Assigned Officer) */}
                        {!isReadOnlyViewer && (isAdmin || c.assignedOfficerId?._id === user?.id) && (
                          <button
                            type="button"
                            onClick={() => openStatusModal(c)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Update Case Lifecycle Status"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                        )}

                        {/* Admin Reassign */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => openReassignModal(c)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Reassign to Officer"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Summary/Priority */}
                        {!isReadOnlyViewer && (isAdmin || c.assignedOfficerId?._id === user?.id) && (
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition"
                            title="Edit Case Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Case (Admin or Assigned Officer) */}
                        {!isReadOnlyViewer && (isAdmin || c.assignedOfficerId?._id === user?.id) && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmCase(c)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Case"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={10}
          onPageChange={(page) => fetchCases(page)}
          loading={loading}
        />
      </div>

      {/* OPEN CASE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Open New Investigation Case Docket"
        subtitle="Initiate formal investigative proceedings linked to an official FIR record."
        icon={Briefcase}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <FormField label="Link Associated FIR Complaint" required>
            {availableFIRs.length === 0 ? (
              <p className="p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                No existing FIR complaints found. Please register an FIR first before opening a case docket.
              </p>
            ) : (
              <Select
                required
                value={formData.firId}
                onChange={(e) => setFormData({ ...formData, firId: e.target.value })}
              >
                {availableFIRs.map((fir) => (
                  <option key={fir._id} value={fir._id}>
                    {fir.firNumber} — {fir.crimeType} ({fir.complainantName})
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Priority Level" required>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Custom Case Number" helpText="Auto-generated if left blank (CASE-YYYY-XXXX)">
              <Input
                type="text"
                placeholder="e.g. CASE-2026-0001"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                className="uppercase font-mono"
              />
            </FormField>
          </div>

          <FormField label="Executive Case Summary & Objective" required>
            <Textarea
              required
              rows={4}
              placeholder="Outline the investigative scope, key leads, victim profile, initial hypothesis, and investigation goals..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </FormField>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={availableFIRs.length === 0}
              loading={submitting}
            >
              Open Official Case
            </Button>
          </div>
        </form>
      </Modal>

      {/* CASE STATUS TRANSITION MODAL */}
      {selectedCase && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Status: ${selectedCase.caseNumber}`}
          subtitle="Transition case lifecycle through official investigation milestones."
          icon={Activity}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
            <FormField label="Select Target Status" required>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="OPEN">OPEN — Initial Docket Opened</option>
                <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION — Active Inquiries & Forensics</option>
                <option value="SOLVED">SOLVED — Perpetrators Identified / Charges Filed</option>
                <option value="CLOSED">CLOSED — Concluded & Archived</option>
              </Select>
            </FormField>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
              <span className="font-bold text-navy-900 block mb-0.5">Audit Trail Notice:</span>
              Status transitions are permanently timestamped and recorded in the central compliance audit trail.
            </div>

            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                Update Status
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADMIN REASSIGN OFFICER MODAL */}
      {selectedCase && isAdmin && (
        <Modal
          isOpen={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          title={`Reassign Officer: ${selectedCase.caseNumber}`}
          subtitle="Transfer case ownership and investigation duties to another active officer."
          icon={UserCheck}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
            <FormField label="Select Investigating Officer" required>
              <Select
                required
                value={reassignOfficerId}
                onChange={(e) => setReassignOfficerId(e.target.value)}
              >
                {officers.map((officer) => (
                  <option key={officer._id} value={officer._id}>
                    {officer.name} ({officer.employeeId || officer.email})
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <Button
                variant="secondary"
                onClick={() => setIsReassignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
              >
                Confirm Reassignment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* CASE DETAILS & AUDIT TIMELINE MODAL */}
      {selectedCase && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Case Dossier: ${selectedCase.caseNumber}`}
          subtitle="Official crime case record, investigative progress, and complete chronological audit history."
          size="lg"
        >
          <div className="space-y-6 text-xs">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Case Status</span>
                <div className="mt-1">
                  <Badge variant={selectedCase.status}>{selectedCase.status}</Badge>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Priority</span>
                <div className="mt-1">
                  <Badge variant={selectedCase.priority}>{selectedCase.priority}</Badge>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Officer</span>
                <p className="font-semibold text-navy-900 mt-1">
                  {selectedCase.assignedOfficerId?.name || 'Unassigned'}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Date Opened</span>
                <p className="font-semibold text-navy-900 mt-1">{new Date(selectedCase.openedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Linked FIR Section */}
            {selectedCase.firId && (
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                <p className="font-bold text-xs text-navy-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-blue" />
                  Linked First Information Report ({selectedCase.firId.firNumber})
                </p>
                <p className="text-slate-700"><strong>Complainant:</strong> {selectedCase.firId.complainantName} ({selectedCase.firId.complainantPhone})</p>
                <p className="text-slate-700"><strong>Incident Place:</strong> {selectedCase.firId.incidentPlace}</p>
                <p className="text-slate-700"><strong>FIR Description:</strong> {selectedCase.firId.description}</p>
              </div>
            )}

            {/* Case Summary */}
            <div>
              <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-1">
                Active Investigation Hypothesis / Summary
              </h4>
              <div className="p-3 bg-slate-50 border rounded-lg text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedCase.summary}
              </div>
            </div>

            {/* Chronological Audit Trail Timeline */}
            <div>
              <h4 className="font-bold text-xs uppercase text-navy-900 tracking-wider mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-brand-blue" />
                Chronological Audit Trail & Status Lifecycle
              </h4>

              {historyLoading ? (
                <p className="text-slate-400 py-4 text-center">Loading audit timeline...</p>
              ) : caseHistory.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No previous history records.</p>
              ) : (
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-200">
                  {caseHistory.map((event) => (
                    <div key={event._id} className="relative group">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-blue border-2 border-white ring-2 ring-slate-200"></div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-navy-900 font-mono">{event.action}</span>
                          <span className="text-slate-400">{new Date(event.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          Action recorded by <strong>{event.userId?.name || 'System User'}</strong> ({event.role})
                        </p>
                        {event.newValues?.status && (
                          <p className="text-[11px] text-emerald-700 font-medium mt-1">
                            Status changed from <code className="bg-slate-200 px-1 py-0.5 rounded">{event.oldValues?.status || 'INIT'}</code> to <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-bold">{event.newValues.status}</code>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
