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
  MessageCircle,
  ThumbsUp,
  Tag,
  Send,
  SlidersHorizontal,
  CheckCircle
} from 'lucide-react';
import feedbackService from '../../services/feedbackService';
import caseService from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { FormField, Input, Select, Textarea } from '../../components/common/FormControls';
import Pagination from '../../components/common/Pagination';
import { ListSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

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
  const { showSuccess, showError } = useToast();
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
    try {
      await feedbackService.createFeedback({
        ...formData,
        relatedCaseId: formData.relatedCaseId || undefined,
      });
      showSuccess('Feedback submitted successfully. Thank you for your contribution.');
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
      showError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTriageSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    setTriaging(true);
    try {
      await feedbackService.triageFeedback(selectedFeedback._id, triageData);
      showSuccess('Feedback triaged and response recorded successfully.');
      setIsTriageModalOpen(false);
      fetchFeedbacks(page);
    } catch (err) {
      showError(err.message || 'Failed to update feedback triage.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Feedback & Issue Reporting Hub"
        description="Submit bug reports, feature requests, and officer satisfaction ratings with station administration triage management."
        breadcrumbs={[
          { label: 'Overview', path: '/' },
          { label: 'Feedback & Support' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={() => fetchFeedbacks(page)}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsSubmitModalOpen(true)}
            >
              Submit Feedback
            </Button>
          </div>
        }
      />

      {error && (
        <ErrorState
          title="Feedback Stream Error"
          message={error}
          onRetry={() => fetchFeedbacks(page)}
        />
      )}

      {/* KPI Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
          <StatCard
            title="Total Submissions"
            value={stats.totalCount}
            subtitle="Logged across station"
            icon={MessageCircle}
            variant="primary"
          />
          <StatCard
            title="Pending Triage"
            value={stats.pendingCount}
            subtitle="Awaiting review"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Resolved Issues"
            value={stats.resolvedCount}
            subtitle="Addressed by admin"
            icon={CheckCircle2}
            variant="success"
          />
          <StatCard
            title="Satisfaction Score"
            value={`${stats.avgRating || 0} / 5.0`}
            subtitle="Average officer rating"
            icon={Star}
            variant="neutral"
          />
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-surface p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <FormField label="Search Keywords">
            <Input
              placeholder="Search subject or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FormField>

          <FormField label="Feedback Type">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                ...FEEDBACK_TYPES,
              ]}
            />
          </FormField>

          <FormField label="Status">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'PENDING' },
                { value: 'IN_REVIEW', label: 'IN REVIEW' },
                { value: 'RESOLVED', label: 'RESOLVED' },
                { value: 'REJECTED', label: 'REJECTED' },
              ]}
            />
          </FormField>

          <FormField label="Priority">
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'LOW', label: 'LOW' },
                { value: 'MEDIUM', label: 'MEDIUM' },
                { value: 'HIGH', label: 'HIGH' },
                { value: 'CRITICAL', label: 'CRITICAL' },
              ]}
            />
          </FormField>

          <div className="flex items-end">
            <Button
              type="submit"
              variant="secondary"
              icon={Search}
              className="w-full"
            >
              Filter Feed
            </Button>
          </div>
        </form>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-4">
        <div className="card-surface p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-brand-blue">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900">
                Feedback Submissions ({pagination.total} Records)
              </h2>
              <p className="text-xs text-slate-500">
                Citizen inquiries, officer bug reports, and station suggestions
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : feedbacks.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No Feedback Records Found"
            description="No feedback submissions match your active filter criteria. Try adjusting filters or submit a new inquiry."
            actionLabel="Submit Feedback"
            onAction={() => setIsSubmitModalOpen(true)}
          />
        ) : (
          <div className="space-y-4 min-w-0 w-full">
            {feedbacks.map((item) => (
              <div
                key={item._id}
                className="card-surface p-5 hover:border-slate-300 transition space-y-3 min-w-0 w-full"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Badge variant={item.status}>{item.status}</Badge>
                    <Badge variant={item.priority}>{item.priority}</Badge>
                    <span className="text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[150px]">
                      {item.feedbackType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">• {item.category}</span>
                    {item.rating && (
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono shrink-0">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[120px]">{item.userId?.name}</span>
                    <span>({item.userId?.role})</span>
                    <span>• {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-navy-900 break-words">{item.subject}</h3>
                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-line break-words leading-relaxed">{item.message}</p>
                </div>

                {item.relatedCaseId && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 font-mono max-w-full truncate">
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Linked Case: {item.relatedCaseId.caseNumber}</span>
                  </div>
                )}

                {/* Admin Official Response Box */}
                {item.adminResponse && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1 min-w-0">
                    <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px] min-w-0">
                      <span className="flex items-center gap-1 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Official Administration Response
                      </span>
                      {item.resolvedAt && (
                        <span className="font-mono text-[10px] text-emerald-700 shrink-0 ml-2">
                          {new Date(item.resolvedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-950 text-xs break-words">{item.adminResponse}</p>
                  </div>
                )}

                {/* Admin Triage Action Button */}
                {isAdmin && (
                  <div className="pt-2 flex justify-end border-t border-slate-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={ShieldCheck}
                      onClick={() => openTriageModal(item)}
                    >
                      Triage & Respond
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                pageSize={pagination.limit}
                onPageChange={(p) => {
                  setPage(p);
                  fetchFeedbacks(p);
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* SUBMIT FEEDBACK MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Feedback or Report Issue"
        subtitle="Log operational suggestions, feature requests, or technical bug reports to station administrators."
        size="md"
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Feedback Type" required>
              <Select
                value={formData.feedbackType}
                onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
                options={FEEDBACK_TYPES}
              />
            </FormField>

            <FormField label="Category" required>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />
            </FormField>
          </div>

          <FormField label="Subject" required>
            <Input
              required
              placeholder="Summary of issue or proposal..."
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </FormField>

          <FormField label="Detailed Description" required>
            <Textarea
              rows={4}
              required
              placeholder="Provide comprehensive details, steps to reproduce, or workflow suggestions..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Satisfaction Rating">
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 hover:scale-110 transition rounded focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= formData.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Priority" required>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={[
                  { value: 'LOW', label: 'LOW' },
                  { value: 'MEDIUM', label: 'MEDIUM' },
                  { value: 'HIGH', label: 'HIGH' },
                  { value: 'CRITICAL', label: 'CRITICAL' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Optional Linked Case">
            <Select
              value={formData.relatedCaseId}
              onChange={(e) => setFormData({ ...formData, relatedCaseId: e.target.value })}
              options={[
                { value: '', label: 'None (General Station Feedback)' },
                ...cases.map((c) => ({
                  value: c._id,
                  label: `${c.caseNumber} - ${c.summary ? c.summary.substring(0, 40) : 'Case'}`,
                })),
              ]}
            />
          </FormField>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              loading={submitting}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADMIN TRIAGE & RESPONSE MODAL */}
      {selectedFeedback && (
        <Modal
          isOpen={isTriageModalOpen}
          onClose={() => setIsTriageModalOpen(false)}
          title="Feedback Triage & Official Resolution"
          subtitle={`Reviewing submission from ${selectedFeedback.userId?.name || 'Officer'}`}
          size="md"
        >
          <form onSubmit={handleTriageSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 min-w-0">
              <p className="font-bold text-navy-900 text-xs break-words">{selectedFeedback.subject}</p>
              <p className="text-slate-600 text-xs leading-relaxed break-words">{selectedFeedback.message}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 font-mono flex-wrap">
                <span className="truncate max-w-[150px]">From: {selectedFeedback.userId?.name}</span>
                <span>• {new Date(selectedFeedback.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Status Workflow" required>
                <Select
                  value={triageData.status}
                  onChange={(e) => setTriageData({ ...triageData, status: e.target.value })}
                  options={[
                    { value: 'PENDING', label: 'PENDING' },
                    { value: 'IN_REVIEW', label: 'IN REVIEW' },
                    { value: 'RESOLVED', label: 'RESOLVED' },
                    { value: 'REJECTED', label: 'REJECTED' },
                  ]}
                />
              </FormField>

              <FormField label="Priority" required>
                <Select
                  value={triageData.priority}
                  onChange={(e) => setTriageData({ ...triageData, priority: e.target.value })}
                  options={[
                    { value: 'LOW', label: 'LOW' },
                    { value: 'MEDIUM', label: 'MEDIUM' },
                    { value: 'HIGH', label: 'HIGH' },
                    { value: 'CRITICAL', label: 'CRITICAL' },
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Official Administration Response" required>
              <Textarea
                rows={4}
                required
                placeholder="Provide resolution details, explanation, or follow-up instructions..."
                value={triageData.adminResponse}
                onChange={(e) => setTriageData({ ...triageData, adminResponse: e.target.value })}
              />
            </FormField>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsTriageModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                icon={CheckCircle2}
                loading={triaging}
              >
                Update & Resolve
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

