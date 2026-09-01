import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
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
  ArrowRight
} from 'lucide-react';
import investigationService from '../../services/investigationService';
import caseService from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';

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
  const isReadOnlyViewer = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';

  // Case Selection
  const [accessibleCases, setAccessibleCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [currentCase, setCurrentCase] = useState(null);

  // Timeline State
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

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
      setError(err.message || 'Error loading active cases.');
    }
  };

  // Fetch Timeline for selected Case
  const fetchTimeline = async (caseId) => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await investigationService.getCaseTimeline(caseId);
      setCurrentCase(res.data.case || null);
      setTimeline(res.data.timeline || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
      setError(err.message || 'Failed to load investigation journal.');
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
    setError(null);
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

      setSuccessMsg('Investigation journal entry recorded.');
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
      setError(err.message || 'Failed to record entry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Evidence
  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return;
    setSubmitting(true);
    setError(null);
    try {
      await investigationService.addEvidence(selectedEntry._id, evidenceForm);
      setSuccessMsg('Evidence attached to investigation entry.');
      setIsAddEvidenceModalOpen(false);
      setEvidenceForm({ name: '', type: 'PHYSICAL', description: '' });
      fetchTimeline(selectedCaseId);
    } catch (err) {
      setError(err.message || 'Failed to attach evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Entry
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEntry) return;
    setSubmitting(true);
    setError(null);
    try {
      await investigationService.updateInvestigation(selectedEntry._id, {
        title: entryForm.title,
        stage: entryForm.stage,
        notes: entryForm.notes,
      });
      setSuccessMsg('Investigation entry updated.');
      setIsEditModalOpen(false);
      fetchTimeline(selectedCaseId);
    } catch (err) {
      setError(err.message || 'Failed to update entry.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Entry
  const handleDeleteEntry = async (entryDoc) => {
    const confirm = window.confirm(`Delete entry "${entryDoc.title}"? This action is logged.`);
    if (!confirm) return;
    try {
      await investigationService.deleteInvestigation(entryDoc._id);
      setSuccessMsg('Investigation entry removed.');
      fetchTimeline(selectedCaseId);
    } catch (err) {
      setError(err.message || 'Failed to delete entry.');
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

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'INITIAL_EVALUATION':
        return <span className="badge-info font-bold">1. Initial Evaluation</span>;
      case 'EVIDENCE_COLLECTION':
        return <span className="badge-warning font-bold">2. Evidence Collection</span>;
      case 'INTERROGATION':
        return <span className="text-[10px] bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-bold">3. Interrogation</span>;
      case 'FORENSIC_ANALYSIS':
        return <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">4. Forensic Analysis</span>;
      case 'FINAL_REPORT':
        return <span className="badge-success font-bold">5. Final Report</span>;
      default:
        return <span>{stage}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info">Milestone 7</span>
            <span className="text-xs text-slate-500 font-mono">Case Investigation Journal</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Investigations & Chronological Timeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Log forensic findings, suspect interrogations, and evidence items in an immutable chronological journal.
          </p>
        </div>

        {!isReadOnlyViewer && selectedCaseId && (
          <button
            onClick={() => {
              setError(null);
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-sm shadow transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Investigation Entry</span>
          </button>
        )}
      </div>

      {/* Case Selector Bar */}
      <div className="card-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Briefcase className="w-5 h-5 text-brand-blue shrink-0" />
          <span className="text-xs font-semibold text-slate-700 shrink-0">Active Case File:</span>
          {accessibleCases.length === 0 ? (
            <span className="text-xs text-slate-400">No active cases in scope</span>
          ) : (
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono font-bold rounded-lg px-3 py-2 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none flex-1 sm:w-96"
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
            <span className="badge-info font-mono">{currentCase.caseNumber}</span>
            <span className="text-slate-500 font-medium">Officer: {currentCase.assignedOfficerId?.name}</span>
          </div>
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

      {/* Case Stage Tracker Banner */}
      {currentCase && (
        <div className="card-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Investigation Lifecycle Progression
            </h3>
            <span className="text-xs font-mono text-brand-blue font-bold">
              {timeline.length} Recorded Findings
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STAGES.map((s) => {
              const countInStage = timeline.filter((t) => t.stage === s.id).length;
              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-lg border text-center transition ${
                    countInStage > 0
                      ? 'bg-blue-50/70 border-brand-blue text-navy-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Step {s.step}</span>
                  <p className="font-bold text-xs mt-0.5">{s.label}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 font-bold">
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
        <h2 className="text-base font-bold text-navy-900 flex items-center gap-2 mb-6">
          <FileSearch className="w-5 h-5 text-brand-blue" />
          Chronological Investigation Dossier
        </h2>

        {loading ? (
          <p className="text-slate-400 text-center py-8 text-xs">Loading case timeline...</p>
        ) : timeline.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs space-y-2">
            <p>No investigation entries recorded yet for this case.</p>
            {!isReadOnlyViewer && (
              <p className="text-slate-400">
                Click <strong>"Log Investigation Entry"</strong> to record crime scene findings, forensics, or witness statements.
              </p>
            )}
          </div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((entry, idx) => (
              <div key={entry._id} className="relative group">
                {/* Timeline Circle Marker */}
                <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-brand-blue border-4 border-white ring-2 ring-slate-200 shadow"></div>

                {/* Entry Card */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition text-xs space-y-3">
                  {/* Entry Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-navy-900">{entry.title}</span>
                        {getStageBadge(entry.stage)}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Recorded by <strong>{entry.officerId?.name}</strong> ({entry.officerId?.employeeId || 'Officer'}) • <Clock className="w-3 h-3 inline ml-1 mr-0.5" /> {new Date(entry.recordedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {!isReadOnlyViewer && (
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setEvidenceForm({ name: '', type: 'PHYSICAL', description: '' });
                            setIsAddEvidenceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-[11px] text-slate-700 font-semibold transition"
                        >
                          <Paperclip className="w-3 h-3 text-brand-blue" />
                          <span>Attach Evidence</span>
                        </button>
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
                          className="p-1 text-slate-400 hover:text-brand-blue rounded"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!isReadOnlyViewer && (
                        <button
                          onClick={() => handleDeleteEntry(entry)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Entry Findings Notes */}
                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {entry.notes}
                  </div>

                  {/* Attached Evidence Items */}
                  {entry.evidence && entry.evidence.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> Attached Evidence ({entry.evidence.length})
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {entry.evidence.map((ev, evIdx) => (
                          <div
                            key={ev._id || evIdx}
                            className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5"
                          >
                            <div className="p-1.5 bg-slate-100 rounded shrink-0 mt-0.5">
                              {getEvidenceIcon(ev.type)}
                            </div>
                            <div className="space-y-0.5 overflow-hidden">
                              <p className="font-bold text-navy-900 truncate">{ev.name}</p>
                              <span className="text-[10px] text-brand-blue font-semibold">{ev.type}</span>
                              {ev.description && (
                                <p className="text-[11px] text-slate-600 truncate">{ev.description}</p>
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
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-brand-blue" />
                Log Investigation Findings
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Journal Entry Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Latent Fingerprint Match & Ballistics Review"
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Investigation Stage</label>
                <select
                  value={entryForm.stage}
                  onChange={(e) => setEntryForm({ ...entryForm, stage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.step}. {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Investigation Notes *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail witness interview responses, crime scene reconstructions, forensic lab verdicts..."
                  value={entryForm.notes}
                  onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              {/* Optional Initial Evidence Attachment */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-brand-blue" />
                  Initial Evidence Attachment (Optional)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Evidence Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Spent 9mm shell casing"
                      value={entryForm.evidenceName}
                      onChange={(e) => setEntryForm({ ...entryForm, evidenceName: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                    <select
                      value={entryForm.evidenceType}
                      onChange={(e) => setEntryForm({ ...entryForm, evidenceType: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 outline-none"
                    >
                      {EVIDENCE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Description / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Recovered from kitchen floor, tag #EV-901"
                    value={entryForm.evidenceDesc}
                    onChange={(e) => setEntryForm({ ...entryForm, evidenceDesc: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-900 outline-none"
                  />
                </div>
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
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Record Finding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ATTACH EVIDENCE MODAL */}
      {isAddEvidenceModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-brand-blue" />
                Attach Evidence to Entry
              </h3>
              <button onClick={() => setIsAddEvidenceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEvidenceSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evidence Label / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CCTV Surveillance Footage MP4"
                  value={evidenceForm.name}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evidence Classification</label>
                <select
                  value={evidenceForm.type}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                >
                  {EVIDENCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chain of Custody / Details</label>
                <textarea
                  rows={3}
                  placeholder="Collected by forensics unit, secured in vault locker #4..."
                  value={evidenceForm.description}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEvidenceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Attaching...' : 'Attach to Docket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ENTRY MODAL */}
      {isEditModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-blue" />
                Edit Investigation Entry
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                <select
                  value={entryForm.stage}
                  onChange={(e) => setEntryForm({ ...entryForm, stage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.step}. {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Investigation Notes *</label>
                <textarea
                  required
                  rows={5}
                  value={entryForm.notes}
                  onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
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
                  {submitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
