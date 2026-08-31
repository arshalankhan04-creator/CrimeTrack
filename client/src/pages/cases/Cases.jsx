import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Shield, 
  Lock, 
  ArrowRight,
  History,
  UserCheck,
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';
import caseService from '../../services/caseService';
import firService from '../../services/firService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

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
  const isReadOnlyViewer = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';

  const [cases, setCases] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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

  // Handle Open Case
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await caseService.createCase(formData);
      setSuccessMsg(`Case ${res.data.case?.caseNumber || ''} opened successfully.`);
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
      setError(err.message || 'Failed to open case file.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    setError(null);
    try {
      await caseService.updateCaseStatus(selectedCase._id, newStatus);
      setSuccessMsg(`Case ${selectedCase.caseNumber} transitioned to ${newStatus}.`);
      setIsStatusModalOpen(false);
      fetchCases(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update case status.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reassign
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase || !reassignOfficerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await caseService.reassignCase(selectedCase._id, reassignOfficerId);
      setSuccessMsg(`Case ${selectedCase.caseNumber} reassigned successfully.`);
      setIsReassignModalOpen(false);
      fetchCases(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to reassign case.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    setError(null);
    try {
      await caseService.updateCase(selectedCase._id, {
        summary: formData.summary,
        priority: formData.priority,
      });
      setSuccessMsg(`Case ${selectedCase.caseNumber} updated successfully.`);
      setIsEditModalOpen(false);
      fetchCases(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update case.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteCase = async (caseDoc) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Case ${caseDoc.caseNumber}? This action is logged.`
    );
    if (!confirmDelete) return;

    try {
      await caseService.deleteCase(caseDoc._id);
      setSuccessMsg(`Case ${caseDoc.caseNumber} has been deleted.`);
      fetchCases(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete case.');
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="badge-info font-bold">OPEN</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="badge-warning font-bold">UNDER INVESTIGATION</span>;
      case 'SOLVED':
        return <span className="badge-success font-bold">SOLVED</span>;
      case 'CLOSED':
        return <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-300 font-bold">CLOSED</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="text-[10px] bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-bold">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] bg-blue-100 text-brand-blue border border-blue-200 px-2 py-0.5 rounded font-bold">MEDIUM</span>;
      case 'LOW':
        return <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">LOW</span>;
      default:
        return <span>{priority}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info">Milestone 5</span>
            <span className="text-xs text-slate-500 font-mono">Investigation Case Files</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Case Management & Investigation Lifecycle
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isReadOnlyViewer
              ? "Supervised read-only tracking of active case files and lifecycle progression."
              : "Track active investigations, manage case status lifecycles, and maintain audit trails."
            }
          </p>
        </div>

        {!isReadOnlyViewer && (
          <button
            onClick={() => {
              setError(null);
              fetchFIRsForCreation();
              setFormData({
                firId: availableFIRs[0]?._id || '',
                summary: '',
                priority: 'MEDIUM',
                caseNumber: '',
                assignedOfficerId: officers[0]?._id || '',
              });
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-sm shadow transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open New Case</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-semantic-successBg border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-semantic-dangerBg border border-red-200 rounded-lg flex items-center justify-between text-red-800 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="card-surface p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by Case #, summary keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium shrink-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-md transition ${statusFilter === tab.value ? 'bg-white text-navy-900 shadow-sm font-bold' : 'text-slate-600 hover:text-navy-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases Data Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Case Reference</th>
                <th className="px-6 py-3.5">FIR Linkage</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Investigation Stage</th>
                <th className="px-6 py-3.5">Investigating Officer</th>
                <th className="px-6 py-3.5">Date Opened</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    Loading case files...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No case files found matching current criteria.
                  </td>
                </tr>
              ) : (
                cases.map((caseDoc) => (
                  <tr key={caseDoc._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-navy-900">
                      <div>
                        <span>{caseDoc.caseNumber}</span>
                        <p className="text-[11px] text-slate-500 font-sans font-normal truncate max-w-xs mt-0.5">
                          {caseDoc.summary}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {caseDoc.firId ? (
                        <div>
                          <span className="font-mono text-brand-blue font-bold">{caseDoc.firId.firNumber}</span>
                          <p className="text-[10px] text-slate-500">{caseDoc.firId.crimeType} • {caseDoc.firId.complainantName}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unlinked</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(caseDoc.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(caseDoc.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">{caseDoc.assignedOfficerId?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{caseDoc.assignedOfficerId?.employeeId || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(caseDoc.openedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {/* View Docket & History */}
                      <button
                        onClick={() => openHistoryModal(caseDoc)}
                        className="p-1.5 text-brand-blue hover:bg-blue-50 rounded transition"
                        title="View Case Docket & Lifecycle History"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {/* Transition Status (Officer or Admin) */}
                      {!isReadOnlyViewer && (isAdmin || caseDoc.assignedOfficerId?._id === user?.id) && (
                        <button
                          onClick={() => {
                            setSelectedCase(caseDoc);
                            setNewStatus(caseDoc.status);
                            setIsStatusModalOpen(true);
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition"
                          title="Transition Status Stage"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {/* Admin Reassign Case */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedCase(caseDoc);
                            setReassignOfficerId(caseDoc.assignedOfficerId?._id || '');
                            setIsReassignModalOpen(true);
                          }}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition"
                          title="Reassign to Officer"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit (Officer or Admin) */}
                      {!isReadOnlyViewer && (isAdmin || caseDoc.assignedOfficerId?._id === user?.id) && (
                        <button
                          onClick={() => {
                            setSelectedCase(caseDoc);
                            setFormData({
                              firId: caseDoc.firId?._id || '',
                              summary: caseDoc.summary,
                              priority: caseDoc.priority,
                              caseNumber: caseDoc.caseNumber,
                              assignedOfficerId: caseDoc.assignedOfficerId?._id || '',
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded transition"
                          title="Edit Summary & Priority"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete (Officer or Admin) */}
                      {!isReadOnlyViewer && (isAdmin || caseDoc.assignedOfficerId?._id === user?.id) && (
                        <button
                          onClick={() => handleDeleteCase(caseDoc)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Case"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} case files)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCases(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => fetchCases(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* OPEN CASE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-blue" />
                Open Formal Case File
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select FIR Reference</label>
                {availableFIRs.length === 0 ? (
                  <p className="text-red-500 font-medium p-2 bg-red-50 rounded border border-red-200">
                    No active FIRs found in your scope. Please register an FIR before opening a case.
                  </p>
                ) : (
                  <select
                    required
                    value={formData.firId}
                    onChange={(e) => setFormData({ ...formData, firId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none font-mono"
                  >
                    {availableFIRs.map((fir) => (
                      <option key={fir._id} value={fir._id}>
                        {fir.firNumber} — {fir.crimeType} ({fir.complainantName})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custom Case # (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto: CASE-YYYY-XXXX"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none uppercase font-mono"
                  />
                </div>
              </div>

              {/* Admin Assigned Officer Selector */}
              {isAdmin && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign to Investigating Officer</label>
                  <select
                    value={formData.assignedOfficerId}
                    onChange={(e) => setFormData({ ...formData, assignedOfficerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    <option value="">Default to FIR Assigned Officer</option>
                    {officers.map((officer) => (
                      <option key={officer._id} value={officer._id}>
                        {officer.name} ({officer.employeeId || officer.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Investigation Summary</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline initial case hypothesis, primary objectives, crime scene findings..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || availableFIRs.length === 0}
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Opening Case...' : 'Open Case File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {isStatusModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-amber-600" />
                Transition Case Stage: {selectedCase.caseNumber}
              </h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Update the official status of this investigation. Transitioning to <strong>SOLVED</strong> or <strong>CLOSED</strong> automatically archives and timestamps case closure.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {STATUS_TABS.filter((t) => t.value !== '').map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setNewStatus(tab.value)}
                    className={`p-3 rounded-lg border text-left transition ${
                      newStatus === tab.value
                        ? 'border-brand-blue bg-blue-50/60 ring-2 ring-brand-blue font-bold text-navy-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-bold">{tab.label}</span>
                    <span className="text-[10px] text-slate-500">{tab.value}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || newStatus === selectedCase.status}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm Stage Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN CASE MODAL (ADMIN ONLY) */}
      {isReassignModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                Reassign Case: {selectedCase.caseNumber}
              </h3>
              <button onClick={() => setIsReassignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Transfer primary investigation responsibility to another active Officer. This reassignment will be logged in the immutable audit trail.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select New Investigating Officer</label>
                <select
                  required
                  value={reassignOfficerId}
                  onChange={(e) => setReassignOfficerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                >
                  <option value="">Select Officer...</option>
                  {officers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.name} ({officer.employeeId || officer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reassignOfficerId}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Transferring...' : 'Transfer Case File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CASE MODAL */}
      {isEditModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-blue" />
                Edit Case: {selectedCase.caseNumber}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Investigation Summary</label>
                <textarea
                  required
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CASE DETAILS & LIFECYCLE HISTORY MODAL */}
      {isHistoryModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col font-sans">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-navy-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-base">
                  Case Docket & Audit History: {selectedCase.caseNumber}
                </h3>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Summary Docket Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Current Stage</span>
                  <div className="mt-1">{getStatusBadge(selectedCase.status)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Priority</span>
                  <div className="mt-1">{getPriorityBadge(selectedCase.priority)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Officer</span>
                  <p className="font-semibold text-navy-900 mt-1">{selectedCase.assignedOfficerId?.name}</p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
