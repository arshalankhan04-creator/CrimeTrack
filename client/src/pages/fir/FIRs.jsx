import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Printer, 
  Shield, 
  RefreshCw,
  X,
  Clock
} from 'lucide-react';
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
import { TableSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

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
  const toast = useToast();
  const isReadOnlyViewer = user?.role === 'VIEWER';

  const [firs, setFirs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('');

  // Officers list for Admin FIR assignment
  const [officers, setOfficers] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirmFIR, setDeleteConfirmFIR] = useState(null);
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
  const [deleting, setDeleting] = useState(false);

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
      toast.error('Failed to load FIR records.');
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

  const handleClearFilters = () => {
    setSearch('');
    setCrimeTypeFilter('');
    fetchFIRs(1);
  };

  // Handle Create FIR
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await firService.createFIR(formData);
      toast.success(`FIR ${res.data.fir?.firNumber || ''} registered successfully.`);
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
      toast.error(err.message || 'Failed to register FIR.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFIR) return;
    setSubmitting(true);
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
      toast.success(`FIR ${selectedFIR.firNumber} updated successfully.`);
      setIsEditModalOpen(false);
      fetchFIRs(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update FIR.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete FIR
  const confirmDeleteFIR = async () => {
    if (!deleteConfirmFIR) return;
    setDeleting(true);
    try {
      await firService.deleteFIR(deleteConfirmFIR._id);
      toast.success(`FIR ${deleteConfirmFIR.firNumber} deleted.`);
      setDeleteConfirmFIR(null);
      fetchFIRs(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete FIR.');
    } finally {
      setDeleting(false);
    }
  };

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

  const openViewModal = (fir) => {
    setSelectedFIR(fir);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="space-y-6 print:hidden">
        {/* Header Banner */}
        <PageHeader
        badge="COMPLAINT REGISTRY"
        badgeMeta="First Information Report (Section 154 Cr.P.C)"
        title="FIR Incident Management"
        subtitle={
          isReadOnlyViewer
            ? "Supervised read-only access to citizen FIR complaints assigned to your supervisor."
            : "Register, investigate, and maintain official citizen FIR complaint records."
        }
        actions={
          !isReadOnlyViewer && (
            <Button
              variant="primary"
              size="md"
              icon={PlusCircle}
              onClick={() => {
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
            >
              Register New FIR
            </Button>
          )
        }
      />

      {/* Search & Filter Bar */}
      <div className="card-surface p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <Input
            icon={Search}
            placeholder="Search FIR #, complainant, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Category:</span>
          <select
            value={crimeTypeFilter}
            onChange={(e) => setCrimeTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          >
            <option value="">All Crime Categories</option>
            {CRIME_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {(search || crimeTypeFilter) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} icon={X}>
              Clear
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={() => fetchFIRs(pagination.page)}
            title="Refresh List"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* FIRs Data Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="app-table">
            <thead>
              <tr>
                <th>FIR Reference</th>
                <th>Category</th>
                <th>Complainant</th>
                <th>Incident Location & Date</th>
                <th>Investigating Officer</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-0">
                    <TableSkeleton rows={5} columns={6} />
                  </td>
                </tr>
              ) : firs.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyState
                      title="No FIR records found"
                      description={
                        search || crimeTypeFilter
                          ? "No FIR records matched your active query filters."
                          : "No First Information Reports are currently logged in your operational scope."
                      }
                      actionLabel={search || crimeTypeFilter ? "Clear Filters" : (!isReadOnlyViewer ? "Register First FIR" : undefined)}
                      onAction={search || crimeTypeFilter ? handleClearFilters : () => setIsCreateModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : (
                firs.map((fir) => (
                  <tr key={fir._id}>
                    <td className="font-mono font-bold text-brand-blue">
                      {fir.firNumber}
                    </td>
                    <td>
                      <Badge variant={fir.crimeType}>
                        {fir.crimeType}
                      </Badge>
                    </td>
                    <td>
                      <p className="font-semibold text-navy-900">{fir.complainantName}</p>
                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {fir.complainantPhone}
                      </p>
                    </td>
                    <td>
                      <p className="text-slate-800 font-medium flex items-center gap-1.5 truncate max-w-[220px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {fir.incidentPlace}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {new Date(fir.incidentDate).toLocaleString()}
                      </p>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-700">{fir.assignedOfficerId?.name || 'Unassigned'}</p>
                      {fir.assignedOfficerId?.employeeId && (
                        <p className="text-[10px] text-slate-400 font-mono">{fir.assignedOfficerId.employeeId}</p>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openViewModal(fir)}
                          className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition"
                          title="View Official Police FIR Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!isReadOnlyViewer && (user?.role === 'ADMIN' || fir.assignedOfficerId?._id === user?.id) && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(fir)}
                              className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition"
                              title="Edit FIR"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmFIR(fir)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete FIR"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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
          onPageChange={(page) => fetchFIRs(page)}
          loading={loading}
        />
      </div>
      {/* End Main Interactive Page Content print:hidden wrapper */}
      </div>

      {/* REGISTER FIR MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register First Information Report (FIR)"
        subtitle="Mandatory incident complaint entry pursuant to statutory law."
        icon={FileText}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Crime Category" required>
              <Select
                value={formData.crimeType}
                onChange={(e) => setFormData({ ...formData, crimeType: e.target.value })}
                required
              >
                {CRIME_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Custom FIR Number" helpText="Leave empty to auto-generate sequential identifier">
              <Input
                type="text"
                placeholder="e.g. FIR-2026-0001"
                value={formData.firNumber}
                onChange={(e) => setFormData({ ...formData, firNumber: e.target.value })}
                className="uppercase font-mono"
              />
            </FormField>
          </div>

          {/* Complainant Section */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="font-bold text-navy-900 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-blue" />
              Complainant Identification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Full Name" required>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Aarav Mehta"
                  value={formData.complainantName}
                  onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                />
              </FormField>

              <FormField label="Contact Phone" required>
                <Input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={formData.complainantPhone}
                  onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Residential / Official Address">
              <Input
                type="text"
                placeholder="Full street address and locality"
                value={formData.complainantAddress}
                onChange={(e) => setFormData({ ...formData, complainantAddress: e.target.value })}
              />
            </FormField>
          </div>

          {/* Incident Details Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Incident Date & Time" required>
              <Input
                type="datetime-local"
                required
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              />
            </FormField>

            <FormField label="Incident Location / Place" required>
              <Input
                type="text"
                required
                placeholder="e.g. Sector 14 Commercial Market, Shop #12"
                value={formData.incidentPlace}
                onChange={(e) => setFormData({ ...formData, incidentPlace: e.target.value })}
              />
            </FormField>
          </div>

          {/* Admin Assigned Officer Selector */}
          {user?.role === 'ADMIN' && (
            <FormField label="Assign Investigating Officer">
              <Select
                value={formData.assignedOfficerId}
                onChange={(e) => setFormData({ ...formData, assignedOfficerId: e.target.value })}
              >
                <option value="">Assign to myself (Chief Admin)</option>
                {officers.map((officer) => (
                  <option key={officer._id} value={officer._id}>
                    {officer.name} ({officer.employeeId || officer.email})
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Detailed Incident Narrative" required>
            <Textarea
              required
              rows={4}
              placeholder="Provide comprehensive details of the reported incident, property, suspect descriptions, or witnesses discovered..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              loading={submitting}
            >
              Submit Official FIR
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT FIR MODAL */}
      {selectedFIR && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit FIR Record: ${selectedFIR.firNumber}`}
          subtitle="Update incident details or complainant contact information."
          icon={Edit3}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <FormField label="Crime Category" required>
              <Select
                required
                value={formData.crimeType}
                onChange={(e) => setFormData({ ...formData, crimeType: e.target.value })}
              >
                {CRIME_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Complainant Name" required>
                <Input
                  type="text"
                  required
                  value={formData.complainantName}
                  onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                />
              </FormField>

              <FormField label="Complainant Phone" required>
                <Input
                  type="text"
                  required
                  value={formData.complainantPhone}
                  onChange={(e) => setFormData({ ...formData, complainantPhone: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Incident Place of Occurrence" required>
              <Input
                type="text"
                required
                value={formData.incidentPlace}
                onChange={(e) => setFormData({ ...formData, incidentPlace: e.target.value })}
              />
            </FormField>

            <FormField label="Incident Narrative / Statement" required>
              <Textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormField>

            <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <Button
                variant="secondary"
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
      )}

      {/* OFFICIAL POLICE FIR DOCUMENT SHEET MODAL */}
      {selectedFIR && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Official Police First Information Report Sheet"
          subtitle="Legal document generated under statutory criminal procedure."
          icon={Shield}
          maxWidth="max-w-3xl"
          hideHeaderOnPrint={true}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Official Sheet
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
              >
                Done
              </Button>
            </>
          }
        >
          <div className="p-4 sm:p-6 space-y-5 text-slate-900 text-xs font-sans print:p-0 print:space-y-4">
            {/* Official Police Dossier Print Header */}
            <div className="text-center pb-3 border-b-2 border-slate-900">
              <div className="flex items-center justify-between pb-2 border-b border-slate-300">
                <div className="text-left">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                    State Police Department • Criminal Investigation Wing
                  </h2>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    FIRST INFORMATION REPORT (F.I.R.) • RECORDED UNDER SECTION 154 CR.P.C.
                  </p>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-700">
                  <p className="font-bold text-slate-900">DISTRICT CENTRAL POLICE STATION</p>
                  <p className="text-slate-500">Security: Statutory Record</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
                <span>FIR NO: <strong className="text-navy-900 text-sm">{selectedFIR.firNumber}</strong></span>
                <span>DATE REGISTERED: {new Date(selectedFIR.createdAt).toLocaleDateString()}</span>
                <span>TIME: {new Date(selectedFIR.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Classification & Assigned Personnel Strip */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 print:bg-transparent p-3 rounded-lg border border-slate-200 print:border-slate-300">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Crime Classification Category</p>
                <p className="font-bold text-sm text-navy-900 mt-0.5">{selectedFIR.crimeType}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Assigned Investigating Officer</p>
                <p className="font-bold text-sm text-navy-900 mt-0.5">{selectedFIR.assignedOfficerId?.name || 'Unassigned'}</p>
                <p className="text-[10px] font-mono text-slate-600">ID / Badge: {selectedFIR.assignedOfficerId?.employeeId || 'N/A'}</p>
              </div>
            </div>

            {/* Section 1: Complainant Information */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                1. Details of Complainant / Informant
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 text-[11px]">Full Legal Name:</span>
                  <p className="font-semibold text-slate-900">{selectedFIR.complainantName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Contact Telephone / Mobile:</span>
                  <p className="font-semibold text-slate-900 font-mono">{selectedFIR.complainantPhone}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 text-[11px]">Present / Residential Address:</span>
                  <p className="font-semibold text-slate-900">{selectedFIR.complainantAddress || 'Not provided by complainant'}</p>
                </div>
              </div>
            </div>

            {/* Section 2: Incident Information */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                2. Occurrence of Offence & Location Particulars
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 text-[11px]">Date & Time of Incident:</span>
                  <p className="font-semibold text-slate-900">{new Date(selectedFIR.incidentDate).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Place of Occurrence / Crime Scene:</span>
                  <p className="font-semibold text-slate-900">{selectedFIR.incidentPlace}</p>
                </div>
              </div>
            </div>

            {/* Section 3: Statement Narrative */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                3. Recorded Complaint Statement & Narrative
              </h4>
              <div className="p-3.5 bg-slate-50 print:bg-white rounded-lg border border-slate-200 print:border-slate-300 text-slate-900 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedFIR.description}
              </div>
            </div>

            {/* Section 4: Signatures & Verification Block */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-[11px] text-slate-600 print:pt-8">
              <div>
                <div className="h-12 border-b border-slate-400 w-3/4 mx-auto"></div>
                <p className="mt-2 font-bold text-slate-900">Signature / Thumb Impression of Informant</p>
                <p className="text-[10px] text-slate-500">Recorded in presence of duty personnel</p>
              </div>
              <div>
                <div className="h-12 border-b border-slate-400 w-3/4 mx-auto"></div>
                <p className="mt-2 font-bold text-slate-900">Signature & Seal of Officer In-Charge</p>
                <p className="text-[10px] text-slate-500">Police Station In-Charge / Duty Officer</p>
              </div>
            </div>

            {/* Confidentiality Footer Notice */}
            <div className="pt-3 text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 print:border-slate-300">
              CONFIDENTIAL LAW ENFORCEMENT RECORD — GENERATED VIA CRIMETRACK PLATFORM
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteConfirmFIR}
        onClose={() => setDeleteConfirmFIR(null)}
        onConfirm={confirmDeleteFIR}
        title="Delete First Information Report?"
        message={`Are you sure you want to delete FIR ${deleteConfirmFIR?.firNumber}? This record will be soft-deleted and logged in the immutable audit trail.`}
        confirmText="Delete Record"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
