import React, { useState, useEffect } from 'react';
import { 
  FileText, 
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
  MapPin, 
  Phone, 
  User, 
  Printer, 
  Shield, 
  Lock, 
  Building2,
  Clock
} from 'lucide-react';
import firService from '../../services/firService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const CRIME_TYPES = [
  'THEFT',
  'ROBBERY',
  'ASSAULT',
  'MURDER',
  'CYBERCRIME',
  'FRAUD',
  'HOMICIDE',
  'BURGLARY',
  'EXTORTION',
  'OTHER',
];

export default function FIRs() {
  const { user } = useAuth();
  const isReadOnlyViewer = user?.role === 'VIEWER';

  const [firs, setFirs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('');

  // Officers list for Admin FIR assignment
  const [officers, setOfficers] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFIR, setSelectedFIR] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firNumber: '',
    complainantName: '',
    complainantPhone: '',
    complainantAddress: '',
    incidentDate: new Date().toISOString().slice(0, 16),
    incidentPlace: '',
    description: '',
    crimeType: 'THEFT',
    assignedOfficerId: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch FIRs
  const fetchFIRs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        crimeType: crimeTypeFilter || undefined,
      };
      const res = await firService.getFIRs(params);
      setFirs(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch FIRs:', err);
      setError(err.message || 'Error fetching FIRs list.');
    } finally {
      setLoading(false);
    }
  };

  // If Admin, fetch officers for assignment selector
  const fetchOfficers = async () => {
    if (user?.role !== 'ADMIN') return;
    try {
      const res = await userService.getUsers({ role: 'OFFICER', isActive: 'true', limit: 100 });
      setOfficers(res.data.items || []);
    } catch (err) {
      console.warn('Failed to load officers list:', err.message);
    }
  };

  useEffect(() => {
    fetchFIRs(1);
    fetchOfficers();
  }, [crimeTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFIRs(1);
  };

  // Handle Create FIR
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await firService.createFIR(formData);
      setSuccessMsg(`FIR ${res.data.fir?.firNumber || ''} registered successfully.`);
      setIsCreateModalOpen(false);
      setFormData({
        firNumber: '',
        complainantName: '',
        complainantPhone: '',
        complainantAddress: '',
        incidentDate: new Date().toISOString().slice(0, 16),
        incidentPlace: '',
        description: '',
        crimeType: 'THEFT',
        assignedOfficerId: '',
      });
      fetchFIRs(1);
    } catch (err) {
      setError(err.message || 'Failed to register FIR.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFIR) return;
    setSubmitting(true);
    setError(null);
    try {
      await firService.updateFIR(selectedFIR._id, {
        complainantName: formData.complainantName,
        complainantPhone: formData.complainantPhone,
        complainantAddress: formData.complainantAddress,
        incidentDate: formData.incidentDate,
        incidentPlace: formData.incidentPlace,
        description: formData.description,
        crimeType: formData.crimeType,
      });
      setSuccessMsg(`FIR ${selectedFIR.firNumber} updated successfully.`);
      setIsEditModalOpen(false);
      fetchFIRs(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update FIR.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete FIR
  const handleDeleteFIR = async (fir) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete FIR ${fir.firNumber}? This action is logged.`
    );
    if (!confirmDelete) return;

    try {
      await firService.deleteFIR(fir._id);
      setSuccessMsg(`FIR ${fir.firNumber} has been deleted.`);
      fetchFIRs(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete FIR.');
    }
  };

  // Open Edit Modal
  const openEditModal = (fir) => {
    setSelectedFIR(fir);
    setFormData({
      firNumber: fir.firNumber,
      complainantName: fir.complainantName,
      complainantPhone: fir.complainantPhone,
      complainantAddress: fir.complainantAddress || '',
      incidentDate: new Date(fir.incidentDate).toISOString().slice(0, 16),
      incidentPlace: fir.incidentPlace,
      description: fir.description,
      crimeType: fir.crimeType,
      assignedOfficerId: fir.assignedOfficerId?._id || '',
    });
    setIsEditModalOpen(true);
  };

  // Open View Sheet Modal
  const openViewModal = (fir) => {
    setSelectedFIR(fir);
    setIsViewModalOpen(true);
  };

  const getCrimeTypeBadge = (type) => {
    switch (type) {
      case 'MURDER':
      case 'HOMICIDE':
      case 'ASSAULT':
        return <span className="badge-danger font-bold">{type}</span>;
      case 'ROBBERY':
      case 'BURGLARY':
      case 'EXTORTION':
        return <span className="badge-warning font-bold">{type}</span>;
      case 'CYBERCRIME':
      case 'FRAUD':
        return <span className="badge-info font-bold">{type}</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-300 font-bold">{type}</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info font-bold">COMPLAINT REGISTRY</span>
            <span className="text-xs text-slate-500 font-mono">First Information Report (FIR) Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            FIR Incident Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isReadOnlyViewer 
              ? "Supervised read-only access to FIR complaints assigned to your supervisor."
              : "Register, investigate, and maintain official citizen FIR complaint records."
            }
          </p>
        </div>

        {!isReadOnlyViewer && (
          <button
            onClick={() => {
              setError(null);
              setFormData({
                firNumber: '',
                complainantName: '',
                complainantPhone: '',
                complainantAddress: '',
                incidentDate: new Date().toISOString().slice(0, 16),
                incidentPlace: '',
                description: '',
                crimeType: 'THEFT',
                assignedOfficerId: officers[0]?._id || '',
              });
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-sm shadow transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New FIR</span>
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
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search by FIR #, complainant, location, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs text-slate-500 font-semibold shrink-0">Category:</label>
          <select
            value={crimeTypeFilter}
            onChange={(e) => setCrimeTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Crime Categories</option>
            {CRIME_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FIRs Data Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">FIR Reference</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Complainant</th>
                <th className="px-6 py-3.5">Incident Location & Date</th>
                <th className="px-6 py-3.5">Investigating Officer</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Loading FIR registry...
                  </td>
                </tr>
              ) : firs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No FIR records found in current scope.
                  </td>
                </tr>
              ) : (
                firs.map((fir) => (
                  <tr key={fir._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-brand-blue">
                      {fir.firNumber}
                    </td>
                    <td className="px-6 py-4">
                      {getCrimeTypeBadge(fir.crimeType)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-navy-900">{fir.complainantName}</p>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {fir.complainantPhone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {fir.incidentPlace}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {new Date(fir.incidentDate).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">{fir.assignedOfficerId?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{fir.assignedOfficerId?.employeeId || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {/* View Official FIR Sheet */}
                      <button
                        onClick={() => openViewModal(fir)}
                        className="p-1.5 text-brand-blue hover:bg-blue-50 rounded transition"
                        title="View Official Police FIR Sheet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit (Officer owner or Admin only) */}
                      {!isReadOnlyViewer && (user?.role === 'ADMIN' || fir.assignedOfficerId?._id === user?.id) && (
                        <button
                          onClick={() => openEditModal(fir)}
                          className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded transition"
                          title="Edit FIR"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete (Officer owner or Admin only) */}
                      {!isReadOnlyViewer && (user?.role === 'ADMIN' || fir.assignedOfficerId?._id === user?.id) && (
                        <button
                          onClick={() => handleDeleteFIR(fir)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete FIR"
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
            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} FIR records)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchFIRs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => fetchFIRs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* REGISTER FIR MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-blue" />
                Register First Information Report (FIR)
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Crime Category</label>
                  <select
                    required
                    value={formData.crimeType}
                    onChange={(e) => setFormData({ ...formData, crimeType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    {CRIME_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custom FIR Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto-generation (FIR-YYYY-XXXX)"
                    value={formData.firNumber}
                    onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none uppercase font-mono"
                  />
                </div>
              </div>

              {/* Complainant Section */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <p className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-blue" />
                  Complainant Identification
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Mehta"
                      value={formData.complainantName}
                      onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="9876543210"
                      value={formData.complainantPhone}
                      onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Residential / Contact Address</label>
                  <input
                    type="text"
                    placeholder="Full address of the complainant"
                    value={formData.complainantAddress}
                    onChange={(e) => setFormData({ ...formData, complainantAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              {/* Incident Details Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incident Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incident Location / Place</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 14 Commercial Market, Shop #12"
                    value={formData.incidentPlace}
                    onChange={(e) => setFormData({ ...formData, incidentPlace: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              {/* Admin Assigned Officer Selector */}
              {user?.role === 'ADMIN' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign to Officer</label>
                  <select
                    value={formData.assignedOfficerId}
                    onChange={(e) => setFormData({ ...formData, assignedOfficerId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  >
                    <option value="">Assign to myself (Chief Admin)</option>
                    {officers.map((officer) => (
                      <option key={officer._id} value={officer._id}>
                        {officer.name} ({officer.employeeId || officer.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Incident Narrative</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide comprehensive details of the reported incident, stolen property, suspects, or evidence discovered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {submitting ? 'Registering FIR...' : 'Submit Official FIR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FIR MODAL */}
      {isEditModalOpen && selectedFIR && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-blue" />
                Edit FIR Record: {selectedFIR.firNumber}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Crime Category</label>
                <select
                  required
                  value={formData.crimeType}
                  onChange={(e) => setFormData({ ...formData, crimeType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                >
                  {CRIME_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Complainant Name</label>
                  <input
                    type="text"
                    required
                    value={formData.complainantName}
                    onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Complainant Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.complainantPhone}
                    onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Incident Location</label>
                <input
                  type="text"
                  required
                  value={formData.incidentPlace}
                  onChange={(e) => setFormData({ ...formData, incidentPlace: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Incident Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {submitting ? 'Saving Changes...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL POLICE FIR DOCUMENT SHEET MODAL */}
      {isViewModalOpen && selectedFIR && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 max-w-3xl w-full overflow-hidden max-h-[95vh] flex flex-col font-sans">
            {/* Header with Print Control */}
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between shrink-0 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-blue" />
                <span className="font-bold text-sm">Official First Information Report Sheet</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 rounded-lg text-xs font-semibold border border-navy-700 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Record</span>
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="p-8 space-y-6 overflow-y-auto text-slate-800 text-xs">
              {/* Institutional Header */}
              <div className="text-center pb-4 border-b-2 border-navy-900">
                <h2 className="text-lg font-bold text-navy-900 uppercase tracking-wider">
                  Police Department • Criminal Investigation Wing
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold">
                  FIRST INFORMATION REPORT UNDER SECTION 154 CR.P.C.
                </p>
                <div className="mt-3 flex items-center justify-between text-xs font-mono">
                  <span>FIR NO: <strong className="text-navy-900 text-sm">{selectedFIR.firNumber}</strong></span>
                  <span>DATE OF RECORD: {new Date(selectedFIR.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Grid 1: Basic Information */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Crime Classification</p>
                  <p className="font-bold text-sm text-navy-900 mt-0.5">{selectedFIR.crimeType}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Investigating Officer</p>
                  <p className="font-bold text-sm text-navy-900 mt-0.5">{selectedFIR.assignedOfficerId?.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{selectedFIR.assignedOfficerId?.employeeId || ''}</p>
                </div>
              </div>

              {/* Grid 2: Complainant Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 border-b pb-1">
                  1. Details of Complainant / Informant
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-slate-500">Full Legal Name:</span>
                    <p className="font-semibold text-navy-900">{selectedFIR.complainantName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone Number:</span>
                    <p className="font-semibold text-navy-900 font-mono">{selectedFIR.complainantPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Address:</span>
                    <p className="font-semibold text-navy-900">{selectedFIR.complainantAddress || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Grid 3: Incident Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 border-b pb-1">
                  2. Incident Information
                </h4>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <span className="text-slate-500">Date & Time of Incident:</span>
                    <p className="font-semibold text-navy-900">{new Date(selectedFIR.incidentDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Place of Occurrence:</span>
                    <p className="font-semibold text-navy-900">{selectedFIR.incidentPlace}</p>
                  </div>
                </div>
              </div>

              {/* Incident Narrative */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-navy-900 border-b pb-1">
                  3. Recorded Statement / Incident Narrative
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {selectedFIR.description}
                </div>
              </div>

              {/* Signatures Footer */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-500">
                <div>
                  <div className="h-10 border-b border-slate-300 w-3/4 mx-auto"></div>
                  <p className="mt-2 font-semibold text-navy-900">Signature / Thumb Impression of Complainant</p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 w-3/4 mx-auto"></div>
                  <p className="mt-2 font-semibold text-navy-900">Duty Officer / Station In-Charge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
