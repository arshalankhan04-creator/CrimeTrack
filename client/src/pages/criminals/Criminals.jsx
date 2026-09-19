import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Link as LinkIcon, 
  Unlink, 
  Shield, 
  Lock, 
  Fingerprint, 
  Briefcase,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Tag
} from 'lucide-react';
import criminalService from '../../services/criminalService';
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
import { TableSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];

export default function Criminals() {
  const { user } = useAuth();
  const toast = useToast();
  const isReadOnlyViewer = user?.role === 'VIEWER';
  const isAdmin = user?.role === 'ADMIN';

  const [criminals, setCriminals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  // Minimal Global Search Modal
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

  // Delete & Unlink Confirm Dialogs
  const [criminalToDelete, setCriminalToDelete] = useState(null);
  const [unlinkTarget, setUnlinkTarget] = useState(null); // { criminalId, caseId, caseNumber }
  const [confirmLoading, setConfirmLoading] = useState(false);

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
      toast.error(err.message || 'Error loading criminal registry.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch accessible cases for linking
  const fetchCasesForLinking = async () => {
    if (isReadOnlyViewer) return;
    try {
      const res = await caseService.getCases({ limit: 100 });
      const items = res.data.items || [];
      setAccessibleCases(items);
      if (items.length > 0 && !targetCaseId) {
        setTargetCaseId(items[0]._id);
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

  const handleResetFilters = () => {
    setSearch('');
    setGenderFilter('');
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
      toast.error('Global search failed: ' + (err.message || 'Server error'));
    } finally {
      setMinimalSearching(false);
    }
  };

  // Handle Register Criminal
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await criminalService.createCriminal(formData);
      toast.success(`Criminal profile for "${res.data.criminal?.name || formData.name}" registered successfully.`);
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
      toast.error(err.message || 'Failed to register criminal profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCriminal) return;
    setSubmitting(true);
    try {
      await criminalService.updateCriminal(selectedCriminal._id, formData);
      toast.success(`Profile for "${formData.name}" updated successfully.`);
      setIsEditModalOpen(false);
      fetchCriminals(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update criminal profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Link to Case
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCriminal || !targetCaseId) return;
    setSubmitting(true);
    try {
      await criminalService.linkCase(selectedCriminal._id, targetCaseId);
      toast.success(`Criminal linked to case successfully.`);
      setIsLinkModalOpen(false);
      fetchCriminals(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to link criminal to case.');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Unlink from Case
  const handleConfirmUnlink = async () => {
    if (!unlinkTarget) return;
    setConfirmLoading(true);
    try {
      await criminalService.unlinkCase(unlinkTarget.criminalId, unlinkTarget.caseId);
      toast.success('Criminal unlinked from case record.');
      fetchCriminals(pagination.page);
      if (selectedCriminal && isDossierModalOpen) {
        const refreshed = await criminalService.getCriminalById(unlinkTarget.criminalId);
        setSelectedCriminal(refreshed.data.criminal);
      }
      setUnlinkTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to unlink criminal: ' + err.message);
    } finally {
      setConfirmLoading(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!criminalToDelete) return;
    setConfirmLoading(true);
    try {
      await criminalService.deleteCriminal(criminalToDelete._id);
      toast.success(`Profile "${criminalToDelete.name}" deleted from registry.`);
      setCriminalToDelete(null);
      fetchCriminals(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete criminal record.');
    } finally {
      setConfirmLoading(false);
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
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Criminal Identity & Repeat Offender Registry"
        subtitle="Global criminal master database with privacy-preserving identity checks and cross-case association."
        badge="MASTER REGISTRY"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Search}
              onClick={() => {
                setMinimalQuery('');
                setMinimalResults([]);
                setIsSearchModalOpen(true);
              }}
            >
              Global Identity Lookup
            </Button>

            {!isReadOnlyViewer && (
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => {
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
              >
                Register Criminal
              </Button>
            )}
          </div>
        }
      />

      {/* Privacy Notice Banner */}
      <div className="p-4 bg-navy-50 border border-brand-blue/20 rounded-xl flex items-start gap-3 text-xs text-navy-800">
        <Lock className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <strong className="text-navy-950 font-semibold">Strict Privacy Enforcement:</strong> The Criminal Identity Master is globally searchable across departments for identity matching, but case-scoped records (FIR complaints, investigation notes, and evidence) remain strictly isolated to assigned Investigating Officers and their supervisors.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-surface p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
            <input
              type="text"
              placeholder="Search by Name, Alias, Marks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue font-medium"
            >
              <option value="">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {(search || genderFilter) && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                Clear
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchCriminals(pagination.page)}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Criminals Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : criminals.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Criminal Records Found"
            description={
              search || genderFilter
                ? 'No criminal records matched your search filters. Try adjusting the query.'
                : 'No criminal profiles registered in your operational scope yet.'
            }
            action={
              (search || genderFilter) ? (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Search Filters
                </Button>
              ) : !isReadOnlyViewer ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserPlus}
                  onClick={() => {
                    fetchCasesForLinking();
                    setIsCreateModalOpen(true);
                  }}
                >
                  Register First Profile
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto min-w-0 w-full">
              <table className="app-table w-full">
                <thead>
                  <tr>
                    <th className="min-w-[220px]">Criminal Identity</th>
                    <th className="min-w-[120px]">Demographics</th>
                    <th className="min-w-[240px]">Physical Marks / Tattoos</th>
                    <th className="min-w-[150px]">Associated Cases</th>
                    <th className="min-w-[220px]">Last Known Location</th>
                    <th className="text-right shrink-0 min-w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {criminals.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-navy-950 text-xs break-words">{c.name}</p>
                            {c.aliases && c.aliases.length > 0 && (
                              <p className="text-[11px] text-slate-500 font-medium break-words mt-0.5" title={c.aliases.join(', ')}>
                                <span className="text-slate-400 font-mono">Alias:</span> {c.aliases.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-slate-700 text-xs">{c.gender}</span>
                        {c.age && <span className="text-slate-500 text-xs"> • {c.age} yrs</span>}
                      </td>
                      <td className="text-slate-600 text-xs">
                        {c.identifyingMarks ? (
                          <p className="line-clamp-2 leading-relaxed" title={c.identifyingMarks}>
                            {c.identifyingMarks}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic">None logged</span>
                        )}
                      </td>
                      <td>
                        {c.associatedCaseIds && c.associatedCaseIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {c.associatedCaseIds.map((caseRef) => (
                              <span
                                key={caseRef._id || caseRef}
                                className="font-mono text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-semibold"
                              >
                                {caseRef.caseNumber || 'CASE'}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">No linked cases</span>
                        )}
                      </td>
                      <td className="text-slate-600 text-xs">
                        {c.address ? (
                          <div className="flex items-start gap-1.5 min-w-0" title={c.address}>
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{c.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unrecorded</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Dossier */}
                          <button
                            onClick={() => openDossier(c)}
                            className="p-1.5 text-brand-blue hover:bg-navy-50 rounded-lg transition"
                            title="View Complete Criminal Dossier"
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
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                              title="Link to Active Case Investigation"
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
                              className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition"
                              title="Edit Profile"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete (Admin only) */}
                          {!isReadOnlyViewer && isAdmin && (
                            <button
                              onClick={() => setCriminalToDelete(c)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
              onPageChange={(p) => fetchCriminals(p)}
            />
          </>
        )}
      </div>

      {/* PRIVACY-PRESERVING GLOBAL LOOKUP MODAL */}
      <Modal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        title="Global Privacy-Preserving Identity Lookup"
        subtitle="Search across state departments for identity matching while isolating case data"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>Cross-Jurisdiction Lookup:</strong> Returns minimal physical markers (name, known aliases, gender, scars/tattoos) to match repeat offenders. Case files, complaints, and evidence notes remain strictly isolated.
          </div>

          <form onSubmit={handleMinimalSearch} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Search by name, alias, tattoo, or identifying marks..."
              value={minimalQuery}
              onChange={(e) => setMinimalQuery(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none transition"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={minimalSearching}
              icon={Search}
            >
              Search
            </Button>
          </form>

          {/* Search Results */}
          <div className="space-y-3 pt-2 max-h-80 overflow-y-auto">
            {minimalResults.length > 0 ? (
              minimalResults.map((item) => (
                <div
                  key={item._id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-navy-950">{item.name}</span>
                      <Badge variant="info">{item.gender} • {item.age ? `${item.age} yrs` : 'Age N/A'}</Badge>
                    </div>
                    {item.aliases?.length > 0 && (
                      <p className="text-brand-blue font-mono text-xs">
                        Aliases: {item.aliases.join(', ')}
                      </p>
                    )}
                    <p className="text-slate-600 text-xs">
                      <strong>Identifying Marks:</strong> {item.identifyingMarks || 'None logged'}
                    </p>
                  </div>

                  {!isReadOnlyViewer && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={LinkIcon}
                      onClick={() => {
                        setSelectedCriminal(item);
                        fetchCasesForLinking();
                        setIsSearchModalOpen(false);
                        setIsLinkModalOpen(true);
                      }}
                    >
                      Link to Case
                    </Button>
                  )}
                </div>
              ))
            ) : minimalQuery && !minimalSearching ? (
              <p className="text-slate-400 text-center py-6 text-xs">No matching records found across registry.</p>
            ) : null}
          </div>
        </div>
      </Modal>

      {/* REGISTER CRIMINAL MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register Criminal Profile"
        subtitle="Create a new identity record in the central repeat-offender master registry"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Full Legal / Primary Name" required>
            <Input
              required
              placeholder="e.g. Vikram Malhotra"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Known Aliases (Comma separated)">
              <Input
                placeholder="e.g. Shadow, Vicky, Tiger"
                value={formData.aliases}
                onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
              />
            </FormField>

            <FormField label="Gender" required>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Approximate Age">
              <Input
                type="number"
                min="0"
                placeholder="e.g. 34"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </FormField>

            <FormField label="Initial Case Association (Optional)">
              <Select
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
              >
                <option value="">None (Standalone Registry Profile)</option>
                {accessibleCases.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.caseNumber} — {c.summary?.substring(0, 30)}...
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Physical Identifying Marks / Tattoos / Scars">
            <Textarea
              rows={2}
              placeholder="e.g. Deep scar on left cheek, dragon tattoo on right forearm..."
              value={formData.identifyingMarks}
              onChange={(e) => setFormData({ ...formData, identifyingMarks: e.target.value })}
            />
          </FormField>

          <FormField label="Last Known Address / Hideout">
            <Input
              placeholder="e.g. Flat 402, Sunshine Enclave, Rohini, New Delhi"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </FormField>

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
              icon={UserPlus}
            >
              Register Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* LINK TO CASE MODAL */}
      <Modal
        isOpen={isLinkModalOpen && !!selectedCriminal}
        onClose={() => setIsLinkModalOpen(false)}
        title="Link Criminal to Case"
        subtitle={`Associate ${selectedCriminal?.name} as suspect/accused in an active case`}
        size="md"
      >
        <form onSubmit={handleLinkSubmit} className="space-y-4">
          <FormField label="Target Case Investigation" required>
            {accessibleCases.length === 0 ? (
              <p className="text-red-600 text-xs font-medium p-3 bg-red-50 rounded-lg border border-red-200">
                No active cases found in your jurisdiction.
              </p>
            ) : (
              <Select
                required
                value={targetCaseId}
                onChange={(e) => setTargetCaseId(e.target.value)}
              >
                {accessibleCases.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.caseNumber} — {c.summary?.substring(0, 40)}...
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLinkModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={accessibleCases.length === 0}
              icon={LinkIcon}
            >
              Confirm Association
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditModalOpen && !!selectedCriminal}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Profile: ${selectedCriminal?.name}`}
        subtitle="Update suspect details and demographic markers"
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormField label="Full Legal Name" required>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Aliases (Comma separated)">
              <Input
                value={formData.aliases}
                onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
              />
            </FormField>

            <FormField label="Gender" required>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Approximate Age">
              <Input
                type="number"
                min="0"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Physical Identifying Marks">
            <Textarea
              rows={2}
              value={formData.identifyingMarks}
              onChange={(e) => setFormData({ ...formData, identifyingMarks: e.target.value })}
            />
          </FormField>

          <FormField label="Last Known Address">
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* CRIMINAL DOSSIER MODAL */}
      <Modal
        isOpen={isDossierModalOpen && !!selectedCriminal}
        onClose={() => setIsDossierModalOpen(false)}
        title={`Criminal Dossier: ${selectedCriminal?.name}`}
        subtitle="Complete identity profile and authorized case linkages"
        size="lg"
      >
        <div className="space-y-6">
          {/* Identity Header */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
              {selectedCriminal?.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-navy-950">{selectedCriminal?.name}</h4>
              {selectedCriminal?.aliases?.length > 0 && (
                <p className="text-brand-blue text-xs font-mono font-semibold">
                  Known Aliases: {selectedCriminal.aliases.join(', ')}
                </p>
              )}
              <p className="text-slate-600 text-xs">
                Gender: <strong className="text-slate-800">{selectedCriminal?.gender}</strong> • Age: <strong className="text-slate-800">{selectedCriminal?.age || 'N/A'} yrs</strong>
              </p>
            </div>
          </div>

          {/* Physical Markers & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Physical Identifying Marks
              </span>
              <p className="font-medium text-slate-800 text-xs">
                {selectedCriminal?.identifyingMarks || 'No distinctive physical marks logged.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Last Known Location / Address
              </span>
              <p className="font-medium text-slate-800 text-xs">
                {selectedCriminal?.address || 'Address unrecorded.'}
              </p>
            </div>
          </div>

          {/* Associated Cases */}
          <div>
            <h4 className="font-bold text-xs uppercase text-navy-950 tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-blue" />
              Authorized Linked Case Files ({selectedCriminal?.associatedCaseIds?.length || 0})
            </h4>

            {selectedCriminal?.associatedCaseIds?.length === 0 ? (
              <p className="text-slate-400 py-6 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200 text-xs">
                No active case associations found within your authorized jurisdiction.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedCriminal?.associatedCaseIds?.map((cRef) => (
                  <div
                    key={cRef._id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-navy-950">{cRef.caseNumber}</span>
                        <Badge variant="info">{cRef.status}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{cRef.summary}</p>
                    </div>

                    {!isReadOnlyViewer && (
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Unlink}
                        className="text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => setUnlinkTarget({
                          criminalId: selectedCriminal._id,
                          caseId: cRef._id,
                          caseNumber: cRef.caseNumber || 'Case'
                        })}
                      >
                        Unlink
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!criminalToDelete}
        onClose={() => setCriminalToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Criminal Record"
        message={`Are you sure you want to delete profile for "${criminalToDelete?.name}"? All associated case links will be detached. This action is permanently audited.`}
        confirmText="Delete Record"
        confirmVariant="danger"
        loading={confirmLoading}
      />

      {/* CONFIRM UNLINK DIALOG */}
      <ConfirmDialog
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onConfirm={handleConfirmUnlink}
        title="Unlink Criminal from Case"
        message={`Are you sure you want to remove the association between this criminal and ${unlinkTarget?.caseNumber}?`}
        confirmText="Unlink Case"
        confirmVariant="danger"
        loading={confirmLoading}
      />
    </div>
  );
}

