import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Edit3, 
  Trash2, 
  Eye, 
  Link as LinkIcon, 
  Unlink, 
  Shield, 
  Lock, 
  Fingerprint, 
  FileText, 
  Briefcase,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import criminalService from '../../services/criminalService';
import caseService from '../../services/caseService';
import { useAuth } from '../../context/AuthContext';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

export default function Criminals() {
  const { user } = useAuth();
  const isReadOnlyViewer = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';

  const [criminals, setCriminals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  // Minimal Search Modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [minimalQuery, setMinimalQuery] = useState('');
  const [minimalResults, setMinimalResults] = useState([]);
  const [minimalSearching, setMinimalSearching] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedCriminal, setSelectedCriminal] = useState(null);

  // Active cases for linking
  const [accessibleCases, setAccessibleCases] = useState([]);
  const [targetCaseId, setTargetCaseId] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    aliases: '',
    age: '',
    gender: 'MALE',
    identifyingMarks: '',
    photoUrl: '',
    address: '',
    caseId: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch Criminals
  const fetchCriminals = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        gender: genderFilter || undefined,
      };
      const res = await criminalService.getCriminals(params);
      setCriminals(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch criminals:', err);
      setError(err.message || 'Error loading criminal registry.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch accessible cases for linking
  const fetchCasesForLinking = async () => {
    if (isReadOnlyViewer) return;
    try {
      const res = await caseService.getCases({ limit: 100 });
      setAccessibleCases(res.data.items || []);
      if (res.data.items?.length > 0 && !targetCaseId) {
        setTargetCaseId(res.data.items[0]._id);
      }
    } catch (err) {
      console.warn('Failed to load cases:', err.message);
    }
  };

  useEffect(() => {
    fetchCriminals(1);
    fetchCasesForLinking();
  }, [genderFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCriminals(1);
  };

  // Minimal Global Search execution
  const handleMinimalSearch = async (e) => {
    e.preventDefault();
    if (!minimalQuery.trim()) return;
    setMinimalSearching(true);
    try {
      const res = await criminalService.searchMinimal(minimalQuery.trim());
      setMinimalResults(res.data.criminals || []);
    } catch (err) {
      console.error('Minimal search failed:', err);
    } finally {
      setMinimalSearching(false);
    }
  };

  // Handle Register Criminal
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await criminalService.createCriminal(formData);
      setSuccessMsg(`Criminal profile for "${res.data.criminal?.name}" registered successfully.`);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        aliases: '',
        age: '',
        gender: 'MALE',
        identifyingMarks: '',
        photoUrl: '',
        address: '',
        caseId: '',
      });
      fetchCriminals(1);
    } catch (err) {
      setError(err.message || 'Failed to register criminal profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCriminal) return;
    setSubmitting(true);
    setError(null);
    try {
      await criminalService.updateCriminal(selectedCriminal._id, formData);
      setSuccessMsg(`Profile for "${formData.name}" updated successfully.`);
      setIsEditModalOpen(false);
      fetchCriminals(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update criminal profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Link to Case
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCriminal || !targetCaseId) return;
    setSubmitting(true);
    setError(null);
    try {
      await criminalService.linkCase(selectedCriminal._id, targetCaseId);
      setSuccessMsg(`Criminal linked to case successfully.`);
      setIsLinkModalOpen(false);
      fetchCriminals(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to link criminal to case.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Unlink from Case
  const handleUnlink = async (criminalId, caseId) => {
    const confirm = window.confirm('Are you sure you want to unlink this criminal from the case?');
    if (!confirm) return;
    try {
      await criminalService.unlinkCase(criminalId, caseId);
      setSuccessMsg('Criminal unlinked from case.');
      fetchCriminals(pagination.page);
      if (selectedCriminal && isDossierModalOpen) {
        const refreshed = await criminalService.getCriminalById(criminalId);
        setSelectedCriminal(refreshed.data.criminal);
      }
    } catch (err) {
      setError(err.message || 'Failed to unlink criminal.');
    }
  };

  // Handle Delete
  const handleDeleteCriminal = async (criminalDoc) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete profile for "${criminalDoc.name}"? This action is logged.`
    );
    if (!confirmDelete) return;

    try {
      await criminalService.deleteCriminal(criminalDoc._id);
      setSuccessMsg(`Profile "${criminalDoc.name}" has been deleted.`);
      fetchCriminals(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete criminal record.');
    }
  };

  // Open Dossier Modal
  const openDossier = async (criminalDoc) => {
    setSelectedCriminal(criminalDoc);
    setIsDossierModalOpen(true);
    try {
      const res = await criminalService.getCriminalById(criminalDoc._id);
      setSelectedCriminal(res.data.criminal);
    } catch (err) {
      console.warn('Failed to load dossier details:', err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info">Milestone 6</span>
            <span className="text-xs text-slate-500 font-mono">Criminal Identity Master</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Criminal Identity & Repeat Offender Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global criminal master database with privacy-preserving identity checks and case association.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Privacy-Preserving Global Lookup Button */}
          <button
            onClick={() => {
              setMinimalQuery('');
              setMinimalResults([]);
              setIsSearchModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm border border-slate-300 transition"
          >
            <Search className="w-4 h-4 text-brand-blue" />
            <span>Global Identity Lookup</span>
          </button>

          {!isReadOnlyViewer && (
            <button
              onClick={() => {
                setError(null);
                fetchCasesForLinking();
                setFormData({
                  name: '',
                  aliases: '',
                  age: '',
                  gender: 'MALE',
                  identifyingMarks: '',
                  photoUrl: '',
                  address: '',
                  caseId: accessibleCases[0]?._id || '',
                });
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-sm shadow transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Criminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
        <Lock className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <strong className="text-navy-900">Strict Privacy Enforcement:</strong> The Criminal Identity Master is globally searchable for identity matching, but case-scoped records (FIR complaints, investigation notes, and evidence) are strictly isolated to assigned Investigating Officers and their supervisors.
        </div>
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
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by Name, Alias, Identifying Marks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Genders</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Criminal Registry Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Criminal Record</th>
                <th className="px-6 py-3.5">Demographics</th>
                <th className="px-6 py-3.5">Physical Identifying Marks</th>
                <th className="px-6 py-3.5">Associated Active Cases</th>
                <th className="px-6 py-3.5">Last Known Address</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Loading criminal records...
                  </td>
                </tr>
              ) : criminals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No criminal records found in your operational scope. Use Global Lookup to search national records.
                  </td>
                </tr>
              ) : (
                criminals.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-navy-900 shrink-0 text-sm">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-navy-900">{c.name}</p>
                          {c.aliases && c.aliases.length > 0 && (
                            <p className="text-[10px] text-brand-blue font-medium mt-0.5">
                              Alias: {c.aliases.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">{c.gender}</span>
                      {c.age && <span className="text-slate-500"> • {c.age} yrs</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {c.identifyingMarks || <span className="text-slate-400">None logged</span>}
                    </td>
                    <td className="px-6 py-4">
                      {c.associatedCaseIds && c.associatedCaseIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.associatedCaseIds.map((caseRef) => (
                            <span
                              key={caseRef._id || caseRef}
                              className="font-mono text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold"
                            >
                              {caseRef.caseNumber || 'CASE'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">No linked cases in scope</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs">
                      {c.address || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {/* View Dossier */}
                      <button
                        onClick={() => openDossier(c)}
                        className="p-1.5 text-brand-blue hover:bg-blue-50 rounded transition"
                        title="View Criminal Dossier & Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Link to Case */}
                      {!isReadOnlyViewer && (
                        <button
                          onClick={() => {
                            setSelectedCriminal(c);
                            fetchCasesForLinking();
                            setIsLinkModalOpen(true);
                          }}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition"
                          title="Link to Active Case"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Edit Details */}
                      {!isReadOnlyViewer && (
                        <button
                          onClick={() => {
                            setSelectedCriminal(c);
                            setFormData({
                              name: c.name,
                              aliases: (c.aliases || []).join(', '),
                              age: c.age || '',
                              gender: c.gender || 'MALE',
                              identifyingMarks: c.identifyingMarks || '',
                              photoUrl: c.photoUrl || '',
                              address: c.address || '',
                              caseId: '',
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded transition"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      {!isReadOnlyViewer && isAdmin && (
                        <button
                          onClick={() => handleDeleteCriminal(c)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Record"
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

        {/* Pagination */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} criminal records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCriminals(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 font-medium transition"
            >
              Previous
            </button>
            <button
              onClick={() => fetchCriminals(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 font-medium transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* PRIVACY-PRESERVING GLOBAL LOOKUP MODAL */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-base text-navy-900">
                  Global Minimal Identification Lookup
                </h3>
              </div>
              <button onClick={() => setIsSearchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <strong>Privacy Protected Search:</strong> Returns minimal identity markers (name, aliases, age, gender, scars/tattoos) across all departments. Private case details, FIRs, and officer notes remain hidden.
              </div>

              <form onSubmit={handleMinimalSearch} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter name, alias, or physical mark (e.g. 'Shadow', 'Dragon tattoo')..."
                  value={minimalQuery}
                  onChange={(e) => setMinimalQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
                <button
                  type="submit"
                  disabled={minimalSearching}
                  className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-hoverBlue disabled:opacity-50"
                >
                  {minimalSearching ? 'Searching...' : 'Search'}
                </button>
              </form>

              {/* Minimal Results List */}
              <div className="space-y-3 pt-2">
                {minimalResults.length > 0 ? (
                  minimalResults.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-navy-900">{item.name}</span>
                          <span className="badge-info">{item.gender} • {item.age || 'N/A'} yrs</span>
                        </div>
                        {item.aliases?.length > 0 && (
                          <p className="text-brand-blue font-mono text-[11px]">
                            Known Aliases: {item.aliases.join(', ')}
                          </p>
                        )}
                        <p className="text-slate-600 text-[11px]">
                          <strong>Identifying Marks:</strong> {item.identifyingMarks || 'None'}
                        </p>
                      </div>

                      {!isReadOnlyViewer && (
                        <button
                          onClick={() => {
                            setSelectedCriminal(item);
                            fetchCasesForLinking();
                            setIsSearchModalOpen(false);
                            setIsLinkModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs shrink-0"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                          <span>Link to Case</span>
                        </button>
                      )}
                    </div>
                  ))
                ) : minimalQuery && !minimalSearching ? (
                  <p className="text-slate-400 text-center py-6">No matching criminal records found.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER CRIMINAL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-blue" />
                Register Criminal Profile
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal / Primary Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aliases (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Shadow, Vicky"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approximate Age</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 34"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Case Link (Optional)</label>
                  <select
                    value={formData.caseId}
                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none font-mono"
                  >
                    <option value="">None (Standalone Identity)</option>
                    {accessibleCases.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.caseNumber} — {c.summary?.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Identifying Marks / Tattoos / Scars</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Deep scar on left cheek, dragon tattoo on forearm..."
                  value={formData.identifyingMarks}
                  onChange={(e) => setFormData({ ...formData, identifyingMarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Known Address / Hideout</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Sunshine Enclave, Rohini"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-hoverBlue text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK TO CASE MODAL */}
      {isLinkModalOpen && selectedCriminal && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-purple-600" />
                Link Criminal to Case
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLinkSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Associate <strong>{selectedCriminal.name}</strong> as an active suspect/accused in one of your assigned case files.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Case Investigation</label>
                {accessibleCases.length === 0 ? (
                  <p className="text-red-500 font-medium p-2 bg-red-50 rounded border border-red-200">
                    No active cases found in your scope.
                  </p>
                ) : (
                  <select
                    required
                    value={targetCaseId}
                    onChange={(e) => setTargetCaseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none font-mono"
                  >
                    {accessibleCases.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.caseNumber} — {c.summary?.substring(0, 35)}...
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || accessibleCases.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Linking...' : 'Confirm Association'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && selectedCriminal && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-blue" />
                Edit Criminal Profile: {selectedCriminal.name}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aliases (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.aliases}
                    onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approximate Age</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physical Identifying Marks</label>
                <textarea
                  rows={2}
                  value={formData.identifyingMarks}
                  onChange={(e) => setFormData({ ...formData, identifyingMarks: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Known Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRIMINAL DOSSIER MODAL */}
      {isDossierModalOpen && selectedCriminal && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col font-sans">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-navy-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-base">
                  Criminal Profile Dossier: {selectedCriminal.name}
                </h3>
              </div>
              <button onClick={() => setIsDossierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Profile Bio Header */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xl shrink-0">
                  {selectedCriminal.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-navy-900">{selectedCriminal.name}</h4>
                  {selectedCriminal.aliases?.length > 0 && (
                    <p className="text-brand-blue font-semibold">
                      Known Aliases: {selectedCriminal.aliases.join(', ')}
                    </p>
                  )}
                  <p className="text-slate-600">
                    Gender: <strong>{selectedCriminal.gender}</strong> | Age: <strong>{selectedCriminal.age || 'N/A'} yrs</strong>
                  </p>
                </div>
              </div>

              {/* Physical Markers & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Physical Identifying Marks
                  </span>
                  <p className="font-medium text-slate-800 mt-1">
                    {selectedCriminal.identifyingMarks || 'No distinctive marks recorded.'}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Last Known Location / Address
                  </span>
                  <p className="font-medium text-slate-800 mt-1">
                    {selectedCriminal.address || 'Address unverified.'}
                  </p>
                </div>
              </div>

              {/* Associated Cases (Scoped to User Access) */}
              <div>
                <h4 className="font-bold text-xs uppercase text-navy-900 tracking-wider mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-brand-blue" />
                  Authorized Linked Case Files ({selectedCriminal.associatedCaseIds?.length || 0})
                </h4>

                {selectedCriminal.associatedCaseIds?.length === 0 ? (
                  <p className="text-slate-400 py-3 bg-slate-50 rounded-lg text-center border">
                    No linked active cases in your authorized jurisdiction.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedCriminal.associatedCaseIds?.map((cRef) => (
                      <div
                        key={cRef._id}
                        className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold font-mono text-navy-900">{cRef.caseNumber}</span>
                          <span className="ml-2 badge-info">{cRef.status}</span>
                          <p className="text-[11px] text-slate-600 mt-0.5">{cRef.summary}</p>
                        </div>

                        {!isReadOnlyViewer && (
                          <button
                            onClick={() => handleUnlink(selectedCriminal._id, cRef._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                            title="Unlink Case"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>
                        )}
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
