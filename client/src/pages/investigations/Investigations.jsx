import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Shield, 
  Lock, 
  FileText, 
  Briefcase, 
  Paperclip, 
  Image as ImageIcon, 
  Crosshair, 
  HardDrive, 
  FileCheck, 
  Clock, 
  ChevronRight,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Tag
} from 'lucide-react';
import investigationService from '../../services/investigationService';
import caseService from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Common UI Components
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FormField, Input, Select, Textarea } from '../../components/common/FormControls';
import EmptyState from '../../components/common/EmptyState';

const STAGES = [
  { id: 'INITIAL_EVALUATION', label: 'Initial Evaluation', step: 1 },
  { id: 'EVIDENCE_COLLECTION', label: 'Evidence Collection', step: 2 },
  { id: 'INTERROGATION', label: 'Interrogation', step: 3 },
  { id: 'FORENSIC_ANALYSIS', label: 'Forensic Analysis', step: 4 },
  { id: 'FINAL_REPORT', label: 'Final Report', step: 5 },
];

const EVIDENCE_TYPES = ['DOCUMENT', 'IMAGE', 'PHYSICAL', 'DIGITAL', 'WEAPON', 'OTHER'];

export default function Investigations() {
  const { user } = useAuth();
  const toast = useToast();
  const isReadOnlyViewer = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';

  // Case Selection
  const [accessibleCases, setAccessibleCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [currentCase, setCurrentCase] = useState(null);

  // Timeline State
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Delete Confirm Dialog
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Form State: Create Entry
  const [entryForm, setEntryForm] = useState({
    title: '',
    stage: 'EVIDENCE_COLLECTION',
    notes: '',
    evidenceName: '',
    evidenceType: 'DOCUMENT',
    evidenceDesc: '',
  });

  // Form State: Add Evidence
  const [evidenceForm, setEvidenceForm] = useState({
    name: '',
    type: 'PHYSICAL',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch Cases in Scope
  const fetchCases = async () => {
    try {
      const res = await caseService.getCases({ limit: 50 });
      const items = res.data.items || [];
      setAccessibleCases(items);
      if (items.length > 0 && !selectedCaseId) {
        setSelectedCaseId(items[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      toast.error(err.message || 'Error loading active cases.');
    }
  };

  // Fetch Timeline for selected Case
  const fetchTimeline = async (caseId) => {
    if (!caseId) return;
    setLoading(true);
    try {
      const res = await investigationService.getCaseTimeline(caseId);
      setCurrentCase(res.data.case || null);
      setTimeline(res.data.timeline || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
      toast.error(err.message || 'Failed to load investigation journal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchTimeline(selectedCaseId);
    }
  }, [selectedCaseId]);

  // Handle Create Entry
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCaseId) return;
    setSubmitting(true);
    try {
      const evidence = [];
      if (entryForm.evidenceName.trim()) {
        evidence.push({
          name: entryForm.evidenceName.trim(),
          type: entryForm.evidenceType,
          description: entryForm.evidenceDesc.trim(),
        });
      }

      await investigationService.createInvestigation({
        caseId: selectedCaseId,
        title: entryForm.title.trim(),
        stage: entryForm.stage,
        notes: entryForm.notes.trim(),
        evidence,
      });

      toast.success('Investigation journal entry recorded.');
      setIsCreateModalOpen(false);
      setEntryForm({
        title: '',
        stage: 'EVIDENCE_COLLECTION',
        notes: '',
        evidenceName: '',
        evidenceType: 'DOCUMENT',
        evidenceDesc: '',
      });
      fetchTimeline(selectedCaseId);
    } catch (err) {
      toast.error(err.message || 'Failed to record entry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Evidence
  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return;
    setSubmitting(true);
    try {
      await investigationService.addEvidence(selectedEntry._id, evidenceForm);
      toast.success('Evidence attached to investigation entry.');
      setIsAddEvidenceModalOpen(false);
      setEvidenceForm({ name: '', type: 'PHYSICAL', description: '' });
      fetchTimeline(selectedCaseId);
    } catch (err) {
      toast.error(err.message || 'Failed to attach evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Entry
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return;
    setSubmitting(true);
    try {
      await investigationService.updateInvestigation(selectedEntry._id, {
        title: entryForm.title,
        stage: entryForm.stage,
        notes: entryForm.notes,
      });
      toast.success('Investigation entry updated.');
      setIsEditModalOpen(false);
      fetchTimeline(selectedCaseId);
    } catch (err) {
      toast.error(err.message || 'Failed to update entry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete Entry
  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    setConfirmLoading(true);
    try {
      await investigationService.deleteInvestigation(entryToDelete._id);
      toast.success('Investigation entry removed from journal.');
      setEntryToDelete(null);
      fetchTimeline(selectedCaseId);
    } catch (err) {
      toast.error(err.message || 'Failed to delete entry.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'WEAPON':
        return <Crosshair className="w-3.5 h-3.5 text-red-600" />;
      case 'IMAGE':
        return <ImageIcon className="w-3.5 h-3.5 text-blue-600" />;
      case 'DIGITAL':
        return <HardDrive className="w-3.5 h-3.5 text-purple-600" />;
      case 'PHYSICAL':
        return <Layers className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <FileCheck className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const renderStageBadge = (stage) => {
    switch (stage) {
      case 'INITIAL_EVALUATION':
        return <Badge variant="info">1. Initial Evaluation</Badge>;
      case 'EVIDENCE_COLLECTION':
        return <Badge variant="warning">2. Evidence Collection</Badge>;
      case 'INTERROGATION':
        return <Badge variant="purple">3. Interrogation</Badge>;
      case 'FORENSIC_ANALYSIS':
        return <Badge variant="warning">4. Forensic Analysis</Badge>;
      case 'FINAL_REPORT':
        return <Badge variant="success">5. Final Report</Badge>;
      default:
        return <Badge variant="neutral">{stage}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Investigations & Case Journal"
        subtitle="Log forensic findings, suspect interrogations, and evidence items in a chronological docket."
        badge="INVESTIGATION JOURNAL"
        actions={
          !isReadOnlyViewer && selectedCaseId ? (
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => {
                setEntryForm({
                  title: '',
                  stage: 'EVIDENCE_COLLECTION',
                  notes: '',
                  evidenceName: '',
                  evidenceType: 'DOCUMENT',
                  evidenceDesc: '',
                });
                setIsCreateModalOpen(true);
              }}
            >
              Log Investigation Entry
            </Button>
          ) : null
        }
      />

      {/* Case Selector Bar */}
      <div className="card-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Briefcase className="w-5 h-5 text-brand-blue shrink-0" />
          <span className="text-xs font-semibold text-slate-700 shrink-0">Select Case File:</span>
          {accessibleCases.length === 0 ? (
            <span className="text-xs text-slate-400">No active cases in scope</span>
          ) : (
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none flex-1 sm:w-96 transition"
            >
              {accessibleCases.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.caseNumber} — {c.status} ({c.summary?.substring(0, 30)}...)
                </option>
              ))}
            </select>
          )}
        </div>

        {currentCase && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono font-bold text-navy-950 bg-navy-50 border border-brand-blue/20 px-2.5 py-1 rounded">
              {currentCase.caseNumber}
            </span>
            <span className="text-slate-500 font-medium">
              Lead: <strong>{currentCase.assignedOfficerId?.name || 'Unassigned'}</strong>
            </span>
            <Button
              variant="ghost"
              size="xs"
              icon={RefreshCw}
              onClick={() => fetchTimeline(selectedCaseId)}
            >
              Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Case Stage Tracker Banner */}
      {currentCase && (
        <div className="card-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Investigation Lifecycle Stages
            </h3>
            <span className="text-xs font-mono text-brand-blue font-bold">
              {timeline.length} Recorded Entries
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {STAGES.map((s) => {
              const countInStage = timeline.filter((t) => t.stage === s.id).length;
              const isPassed = countInStage > 0;
              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border text-center transition ${
                    isPassed
                      ? 'bg-brand-blue/5 border-brand-blue/30 text-navy-950'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Step {s.step}</span>
                  <p className="font-bold text-xs mt-0.5">{s.label}</p>
                  <span className={`inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    isPassed ? 'bg-white text-brand-blue border border-brand-blue/20 shadow-xs' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {countInStage} logged
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chronological Investigation Timeline Feed */}
      <div className="card-surface p-6">
        <h2 className="text-sm font-bold text-navy-950 flex items-center gap-2 mb-6">
          <FileSearch className="w-4 h-4 text-brand-blue" />
          Chronological Investigation Dossier
        </h2>

        {loading ? (
          <div className="space-y-4 py-6">
            <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        ) : timeline.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No Investigation Entries"
            description="No journal entries recorded for this case file yet. Log crime scene findings, witness interviews, or forensic reports to track investigation progress."
            action={
              !isReadOnlyViewer && selectedCaseId ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={PlusCircle}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Log First Finding
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((entry) => (
              <div key={entry._id} className="relative group">
                {/* Marker */}
                <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-brand-blue border-4 border-white ring-2 ring-slate-200 shadow-sm" />

                {/* Entry Card */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition text-xs space-y-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-navy-950">{entry.title}</span>
                        {renderStageBadge(entry.stage)}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Recorded by <strong>{entry.officerId?.name || 'Officer'}</strong> ({entry.officerId?.employeeId || 'ID'}) • <Clock className="w-3 h-3 inline ml-1 mr-0.5" /> {new Date(entry.recordedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {!isReadOnlyViewer && (
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Paperclip}
                          onClick={() => {
                            setSelectedEntry(entry);
                            setEvidenceForm({ name: '', type: 'PHYSICAL', description: '' });
                            setIsAddEvidenceModalOpen(true);
                          }}
                        >
                          Attach Evidence
                        </Button>
                      )}

                      {!isReadOnlyViewer && (
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setEntryForm({
                              title: entry.title,
                              stage: entry.stage,
                              notes: entry.notes,
                              evidenceName: '',
                              evidenceType: 'DOCUMENT',
                              evidenceDesc: '',
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-brand-blue hover:bg-slate-200/60 rounded-lg transition"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!isReadOnlyViewer && (
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Findings Notes */}
                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap text-xs">
                    {entry.notes}
                  </div>

                  {/* Attached Evidence */}
                  {entry.evidence && entry.evidence.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> Attached Evidence ({entry.evidence.length})
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {entry.evidence.map((ev, evIdx) => (
                          <div
                            key={ev._id || evIdx}
                            className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5 shadow-xs"
                          >
                            <div className="p-1.5 bg-slate-100 rounded shrink-0 mt-0.5">
                              {getEvidenceIcon(ev.type)}
                            </div>
                            <div className="space-y-0.5 overflow-hidden">
                              <p className="font-bold text-navy-950 truncate text-xs">{ev.name}</p>
                              <Badge variant="info">{ev.type}</Badge>
                              {ev.description && (
                                <p className="text-[11px] text-slate-600 truncate mt-0.5">{ev.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOG INVESTIGATION ENTRY MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Log Investigation Findings"
        subtitle="Record crime scene notes, forensics, witness testimonies, or evidence"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Journal Entry Title" required>
            <Input
              required
              placeholder="e.g. Latent Fingerprint Match & Ballistics Review"
              value={entryForm.title}
              onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
            />
          </FormField>

          <FormField label="Investigation Stage" required>
            <Select
              value={entryForm.stage}
              onChange={(e) => setEntryForm({ ...entryForm, stage: e.target.value })}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.step}. {s.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Detailed Investigation Notes" required>
            <Textarea
              required
              rows={4}
              placeholder="Detail witness interview responses, crime scene reconstructions, forensic lab verdicts..."
              value={entryForm.notes}
              onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
            />
          </FormField>

          {/* Optional Initial Evidence */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-brand-blue" />
              Initial Evidence Attachment (Optional)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Evidence Name">
                <Input
                  placeholder="e.g. Spent 9mm shell casing"
                  value={entryForm.evidenceName}
                  onChange={(e) => setEntryForm({ ...entryForm, evidenceName: e.target.value })}
                />
              </FormField>

              <FormField label="Classification">
                <Select
                  value={entryForm.evidenceType}
                  onChange={(e) => setEntryForm({ ...entryForm, evidenceType: e.target.value })}
                >
                  {EVIDENCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField label="Description / Custody Details">
              <Input
                placeholder="e.g. Recovered from kitchen floor, tag #EV-901"
                value={entryForm.evidenceDesc}
                onChange={(e) => setEntryForm({ ...entryForm, evidenceDesc: e.target.value })}
              />
            </FormField>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={PlusCircle}
            >
              Record Finding
            </Button>
          </div>
        </form>
      </Modal>

      {/* QUICK ATTACH EVIDENCE MODAL */}
      <Modal
        isOpen={isAddEvidenceModalOpen && !!selectedEntry}
        onClose={() => setIsAddEvidenceModalOpen(false)}
        title="Attach Evidence to Entry"
        subtitle={`Linking item to: ${selectedEntry?.title}`}
        size="md"
      >
        <form onSubmit={handleEvidenceSubmit} className="space-y-4">
          <FormField label="Evidence Label / Name" required>
            <Input
              required
              placeholder="e.g. CCTV Surveillance Footage MP4"
              value={evidenceForm.name}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, name: e.target.value })}
            />
          </FormField>

          <FormField label="Evidence Classification" required>
            <Select
              value={evidenceForm.type}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, type: e.target.value })}
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Chain of Custody / Description">
            <Textarea
              rows={3}
              placeholder="Collected by forensics unit, secured in vault locker #4..."
              value={evidenceForm.description}
              onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
            />
          </FormField>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddEvidenceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={Paperclip}
            >
              Attach to Docket
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT ENTRY MODAL */}
      <Modal
        isOpen={isEditModalOpen && !!selectedEntry}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Investigation Entry"
        subtitle="Update findings notes or stage designation"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormField label="Title" required>
            <Input
              required
              value={entryForm.title}
              onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
            />
          </FormField>

          <FormField label="Stage" required>
            <Select
              value={entryForm.stage}
              onChange={(e) => setEntryForm({ ...entryForm, stage: e.target.value })}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.step}. {s.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Investigation Notes" required>
            <Textarea
              required
              rows={5}
              value={entryForm.notes}
              onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
            />
          </FormField>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
            >
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Investigation Entry"
        message={`Are you sure you want to delete "${entryToDelete?.title}"? This forensic entry and all its attached evidence links will be permanently removed. This action is audited.`}
        confirmText="Delete Entry"
        confirmVariant="danger"
        loading={confirmLoading}
      />
    </div>
  );
}

