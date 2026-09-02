import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Briefcase, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  MessageCircle,
  ThumbsUp,
  Tag,
  Send
} from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import caseService from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';

const FEEDBACK_TYPES = [
  { value: 'SYSTEM_FEEDBACK', label: 'System Experience' },
  { value: 'BUG_REPORT', label: 'Bug / Issue Report' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'CASE_FEEDBACK', label: 'Case Handling Feedback' },
];

const CATEGORIES = [
  'General',
  'UI/UX & Design',
  'Performance & Speed',
  'FIR Management',
  'Investigation Tools',
  'Evidence Handling',
  'Security & Compliance',
];

export default function Feedback() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Filter States
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Data States
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Submit Form State
  const [formData, setFormData] = useState({
    feedbackType: 'SYSTEM_FEEDBACK',
    category: 'General',
    subject: '',
    message: '',
    rating: 5,
    priority: 'MEDIUM',
    relatedCaseId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Triage Form State
  const [triageData, setTriageData] = useState({
    status: 'IN_REVIEW',
    priority: 'MEDIUM',
    adminResponse: '',
  });
  const [triaging, setTriaging] = useState(false);

  const fetchFeedbacks = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageNum,
        limit: 15,
        search: search || undefined,
        feedbackType: selectedType || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      };

      const [listRes, statsRes] = await Promise.all([
        feedbackService.getFeedbackList(params),
        feedbackService.getStats(),
      ]);

      setFeedbacks(listRes.data.items || []);
      setPagination(listRes.data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
      setStats(statsRes.data.stats || null);
    } catch (err) {
      console.error('Failed to load feedback:', err);
      setError(err.message || 'Failed to load feedback submissions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCasesForSelect = async () => {
    try {
      const res = await caseService.getCases({ limit: 50 });
      setCases(res.data.items || []);
    } catch (err) {
      console.error('Failed to load cases:', err);
    }
  };

  useEffect(() => {
    fetchFeedbacks(1);
    fetchCasesForSelect();
  }, [selectedType, selectedStatus, selectedPriority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFeedbacks(1);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await feedbackService.createFeedback({
        ...formData,
        relatedCaseId: formData.relatedCaseId || undefined,
      });
      setSuccessMsg('Feedback submitted successfully. Thank you for your contribution.');
      setIsSubmitModalOpen(false);
      setFormData({
        feedbackType: 'SYSTEM_FEEDBACK',
        category: 'General',
        subject: '',
        message: '',
        rating: 5,
        priority: 'MEDIUM',
        relatedCaseId: '',
      });
      fetchFeedbacks(1);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    setTriaging(true);
    setError(null);
    try {
      await feedbackService.triageFeedback(selectedFeedback._id, triageData);
      setSuccessMsg('Feedback triaged and response updated successfully.');
      setIsTriageModalOpen(false);
      fetchFeedbacks(page);
    } catch (err) {
      setError(err.message || 'Failed to update feedback triage.');
    } finally {
      setTriaging(false);
    }
  };

  const openTriageModal = (item) => {
    setSelectedFeedback(item);
    setTriageData({
      status: item.status || 'IN_REVIEW',
      priority: item.priority || 'MEDIUM',
      adminResponse: item.adminResponse || '',
    });
    setIsTriageModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge-warning font-mono font-bold text-[10px]">PENDING</span>;
      case 'IN_REVIEW':
        return <span className="badge-info font-mono font-bold text-[10px]">IN_REVIEW</span>;
      case 'RESOLVED':
        return <span className="badge-success font-mono font-bold text-[10px]">RESOLVED</span>;
      case 'REJECTED':
        return <span className="badge-danger font-mono font-bold text-[10px]">REJECTED</span>;
      default:
        return <span className="badge-info font-mono text-[10px]">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">MEDIUM</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info font-bold">COMMUNITY & OPERATIONS</span>
            <span className="text-xs text-slate-500 font-mono">Satisfaction & Issue Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-blue" />
            Feedback & Issue Reporting Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit bug reports, feature requests, and officer satisfaction ratings with station triage management.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-xs shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Feedback</span>
          </button>

          <button
            onClick={() => fetchFeedbacks(page)}
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

      {/* KPI Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Submissions</span>
              <MessageCircle className="w-4 h-4 text-brand-blue" />
            </div>
            <p className="text-2xl font-bold text-navy-900 mt-2 font-mono">{stats.totalCount}</p>
            <span className="text-[10px] text-slate-500 font-semibold">Logged across station</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Pending Triage</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-2 font-mono">{stats.pendingCount}</p>
            <span className="text-[10px] text-amber-700 font-semibold">Awaiting review</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Resolved Issues</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2 font-mono">{stats.resolvedCount}</p>
            <span className="text-[10px] text-emerald-700 font-semibold">Addressed by admin</span>
          </div>

          <div className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Satisfaction Score</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900 mt-2 font-mono flex items-center gap-1">
              {stats.avgRating} <span className="text-xs text-slate-400 font-sans">/ 5.0</span>
            </p>
            <span className="text-[10px] text-slate-500 font-semibold">Average rating</span>
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
                placeholder="Search subject or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Feedback Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            >
              <option value="">All Types</option>
              {FEEDBACK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 outline-none focus:bg-white"
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-xs shadow transition flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Filter Items</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feedback Feed / Table */}
      <div className="card-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-brand-blue" />
            Feedback Submissions ({pagination.total} Records)
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading feedback feed...</div>
        ) : feedbacks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No feedback matches your query.</div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((item) => (
              <div
                key={item._id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                    <span className="text-xs font-bold text-navy-900">{item.feedbackType.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-400 font-mono">• {item.category}</span>
                    {item.rating && (
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.userId?.name} ({item.userId?.role})</span>
                    <span>• {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-navy-900">{item.subject}</h3>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{item.message}</p>
                </div>

                {item.relatedCaseId && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-800 font-mono">
                    <Briefcase className="w-3 h-3" />
                    <span>Linked Case: {item.relatedCaseId.caseNumber}</span>
                  </div>
                )}

                {/* Admin Official Response Box */}
                {item.adminResponse && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Official Administration Response
                      </span>
                      {item.resolvedAt && (
                        <span className="font-mono text-[10px] text-emerald-700">
                          {new Date(item.resolvedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-900 text-xs">{item.adminResponse}</p>
                  </div>
                )}

                {/* Admin Triage Action Button */}
                {isAdmin && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => openTriageModal(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-navy-900 hover:text-white rounded-lg text-xs font-semibold text-slate-700 transition"
                    >
                      Triage & Respond
                    </button>
                  </div>
                )}
              </div>
            ))}
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
                fetchFeedbacks(prev);
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
                fetchFeedbacks(next);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* SUBMIT FEEDBACK MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-blue" />
                Submit Feedback or Report Issue
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Feedback Type</label>
                  <select
                    value={formData.feedbackType}
                    onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                  >
                    {FEEDBACK_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of issue or proposal..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide comprehensive details, steps to reproduce, or workflow suggestions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satisfaction Rating</label>
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formData.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Optional Linked Case</label>
                <select
                  value={formData.relatedCaseId}
                  onChange={(e) => setFormData({ ...formData, relatedCaseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                >
                  <option value="">None (General Station Feedback)</option>
                  {cases.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.caseNumber} - {c.summary}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN TRIAGE & RESPONSE MODAL */}
      {isTriageModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-blue" />
                Feedback Triage & Resolution
              </h3>
              <button onClick={() => setIsTriageModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriageSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-navy-900 text-xs">{selectedFeedback.subject}</p>
                <p className="text-slate-600 text-[11px]">{selectedFeedback.message}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1 font-mono">
                  <span>From: {selectedFeedback.userId?.name}</span>
                  <span>• {new Date(selectedFeedback.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Workflow</label>
                  <select
                    value={triageData.status}
                    onChange={(e) => setTriageData({ ...triageData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={triageData.priority}
                    onChange={(e) => setTriageData({ ...triageData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Administration Response</label>
                <textarea
                  rows={4}
                  placeholder="Provide resolution details, explanation, or follow-up instructions..."
                  value={triageData.adminResponse}
                  onChange={(e) => setTriageData({ ...triageData, adminResponse: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTriageModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={triaging}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{triaging ? 'Saving...' : 'Update & Resolve'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
