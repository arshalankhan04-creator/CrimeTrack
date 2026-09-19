import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  UserCheck, 
  Shield, 
  Link as LinkIcon, 
  AlertCircle, 
  X,
  Phone,
  Mail,
  Lock,
  BadgeAlert,
  RefreshCw,
  UserX
} from 'lucide-react';
import userService from '../../services/userService';
import { useToast } from '../../context/ToastContext';

// Common UI Components
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FormField, Input, Select } from '../../components/common/FormControls';
import { TableSkeleton } from '../../components/common/Skeletons';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Officers list for supervisor dropdown
  const [officers, setOfficers] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Status Toggle Dialog
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OFFICER',
    phone: '',
    employeeId: '',
    supervisorOfficerId: '',
  });

  const [reassignSupervisorId, setReassignSupervisorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch Users
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter !== '' ? statusFilter : undefined,
      };
      const res = await userService.getUsers(params);
      setUsers(res.data.items || []);
      setPagination(res.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch users:', err);
      toast.error(err.message || 'Error fetching users list.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active officers for supervisor selector
  const fetchOfficers = async () => {
    try {
      const res = await userService.getUsers({ role: 'OFFICER', isActive: 'true', limit: 100 });
      setOfficers(res.data.items || []);
    } catch (err) {
      console.warn('Failed to load active officers list:', err.message);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    fetchOfficers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  // Handle User Creation
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userService.createUser(formData);
      toast.success('User account provisioned successfully.');
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'OFFICER',
        phone: '',
        employeeId: '',
        supervisorOfficerId: '',
      });
      fetchUsers(1);
      fetchOfficers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userService.updateUser(selectedUser._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        employeeId: formData.employeeId,
      });
      toast.success('User profile updated successfully.');
      setIsEditModalOpen(false);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Toggle Confirm
  const handleConfirmToggleStatus = async () => {
    if (!userToToggleStatus) return;
    setConfirmLoading(true);
    const newStatus = !userToToggleStatus.isActive;
    try {
      await userService.setUserStatus(userToToggleStatus._id, newStatus);
      toast.success(`User ${userToToggleStatus.name} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      setUserToToggleStatus(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to change user status.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle Supervisor Reassignment
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !reassignSupervisorId) return;
    setSubmitting(true);
    try {
      await userService.assignSupervisor(selectedUser._id, reassignSupervisorId);
      toast.success(`Supervisor reassigned for ${selectedUser.name}.`);
      setIsReassignModalOpen(false);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to reassign supervisor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (userDoc) => {
    setSelectedUser(userDoc);
    setFormData({
      name: userDoc.name,
      email: userDoc.email,
      password: '',
      role: userDoc.role,
      phone: userDoc.phone || '',
      employeeId: userDoc.employeeId || '',
      supervisorOfficerId: userDoc.supervisorOfficerId?._id || '',
    });
    setIsEditModalOpen(true);
  };

  // Open Reassign Modal
  const openReassignModal = (userDoc) => {
    setSelectedUser(userDoc);
    setReassignSupervisorId(userDoc.supervisorOfficerId?._id || '');
    setIsReassignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Officer & User Directory"
        subtitle="Provision officers and supervised viewers, manage badge credentials, and establish supervision hierarchies."
        badge="ADMINISTRATION"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                password: '',
                role: 'OFFICER',
                phone: '',
                employeeId: '',
                supervisorOfficerId: officers[0]?._id || '',
              });
              setIsCreateModalOpen(true);
            }}
          >
            Provision User
          </Button>
        }
      />

      {/* Search and Filters Bar */}
      <div className="card-surface p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Search by name, email, badge ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium shrink-0">
            <button
              onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-lg transition text-xs ${roleFilter === '' ? 'bg-white text-navy-950 shadow-xs font-bold' : 'text-slate-600 hover:text-navy-950'}`}
            >
              All Roles
            </button>
            <button
              onClick={() => setRoleFilter('OFFICER')}
              className={`px-3 py-1.5 rounded-lg transition text-xs ${roleFilter === 'OFFICER' ? 'bg-white text-navy-950 shadow-xs font-bold' : 'text-slate-600 hover:text-navy-950'}`}
            >
              Officers
            </button>
            <button
              onClick={() => setRoleFilter('VIEWER')}
              className={`px-3 py-1.5 rounded-lg transition text-xs ${roleFilter === 'VIEWER' ? 'bg-white text-navy-950 shadow-xs font-bold' : 'text-slate-600 hover:text-navy-950'}`}
            >
              Viewers
            </button>
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue font-medium"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => fetchUsers(pagination.page)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-surface overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No Users Found"
            description="No user accounts matched the filter criteria."
            action={
              (search || roleFilter || statusFilter) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Officer / User</th>
                    <th>Role</th>
                    <th>Badge ID</th>
                    <th>Supervision</th>
                    <th>Account Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-950 text-xs">{u.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="role" role={u.role}>{u.role}</Badge>
                      </td>
                      <td className="font-mono text-slate-600 text-xs font-semibold">
                        {u.employeeId || '—'}
                      </td>
                      <td>
                        {u.role === 'VIEWER' ? (
                          u.supervisorOfficerId ? (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-700 font-medium">
                                {u.supervisorOfficerId.name}
                              </span>
                              <button
                                onClick={() => openReassignModal(u)}
                                className="text-brand-blue hover:underline text-[11px] font-semibold"
                                title="Reassign supervisor"
                              >
                                (Change)
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openReassignModal(u)}
                              className="text-red-500 hover:underline font-semibold text-xs"
                            >
                              Unassigned
                            </button>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td>
                        {u.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="danger">Deactivated</Badge>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition"
                            title="Edit Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => setUserToToggleStatus(u)}
                              className={`p-1.5 rounded-lg transition ${
                                u.isActive
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.isActive ? 'Deactivate User Account' : 'Activate User Account'}
                            >
                              {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
              onPageChange={(p) => fetchUsers(p)}
            />
          </>
        )}
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Provision Official Account"
        subtitle="Create a new officer or supervised viewer account with access permissions"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">User Access Level</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${formData.role === 'OFFICER' ? 'border-brand-blue bg-blue-50/50 font-bold text-brand-blue shadow-xs' : 'border-slate-200 text-slate-700'}`}>
                <input
                  type="radio"
                  name="role"
                  value="OFFICER"
                  checked={formData.role === 'OFFICER'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="text-brand-blue focus:ring-brand-blue"
                />
                <span>Investigating Officer</span>
              </label>
              <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs transition ${formData.role === 'VIEWER' ? 'border-amber-500 bg-amber-50/50 font-bold text-amber-700 shadow-xs' : 'border-slate-200 text-slate-700'}`}>
                <input
                  type="radio"
                  name="role"
                  value="VIEWER"
                  checked={formData.role === 'VIEWER'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, supervisorOfficerId: officers[0]?._id || '' })}
                  className="text-amber-500 focus:ring-amber-500"
                />
                <span>Supervised Viewer</span>
              </label>
            </div>
          </div>

          <FormField label="Full Name" required>
            <Input
              required
              placeholder="e.g. Inspector Ramesh Patel"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email Address" required>
              <Input
                type="email"
                required
                placeholder="officer@crimetrack.gov"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormField>

            <FormField label="Initial Password" required>
              <Input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Badge / Employee ID">
              <Input
                placeholder="e.g. OFF-105"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </FormField>

            <FormField label="Contact Phone">
              <Input
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>
          </div>

          {/* Supervisor Selector if Viewer */}
          {formData.role === 'VIEWER' && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <FormField label="Assign Supervising Officer" required>
                <Select
                  required
                  value={formData.supervisorOfficerId}
                  onChange={(e) => setFormData({ ...formData, supervisorOfficerId: e.target.value })}
                >
                  <option value="">Select Supervising Officer...</option>
                  {officers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.name} ({officer.employeeId || officer.email})
                    </option>
                  ))}
                </Select>
              </FormField>
              <p className="text-[11px] text-amber-800">
                Viewer will have read-only visibility restricted to this Officer's assigned cases.
              </p>
            </div>
          )}

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
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={isEditModalOpen && !!selectedUser}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Profile: ${selectedUser?.name}`}
        subtitle="Update officer demographics and badge credentials"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <FormField label="Full Legal Name" required>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Badge / Employee ID">
              <Input
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </FormField>

            <FormField label="Contact Phone">
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>
          </div>

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
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* REASSIGN SUPERVISOR MODAL */}
      <Modal
        isOpen={isReassignModalOpen && !!selectedUser}
        onClose={() => setIsReassignModalOpen(false)}
        title={`Reassign Supervisor: ${selectedUser?.name}`}
        subtitle="Viewer's case visibility will immediately shift to the selected officer"
        size="md"
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <FormField label="Select Active Supervising Officer" required>
            <Select
              required
              value={reassignSupervisorId}
              onChange={(e) => setReassignSupervisorId(e.target.value)}
            >
              <option value="">Choose an Officer...</option>
              {officers.map((officer) => (
                <option key={officer._id} value={officer._id}>
                  {officer.name} ({officer.employeeId || officer.email})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReassignModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              disabled={!reassignSupervisorId}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Confirm Reassignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      <ConfirmDialog
        isOpen={!!userToToggleStatus}
        onClose={() => setUserToToggleStatus(null)}
        onConfirm={handleConfirmToggleStatus}
        title={userToToggleStatus?.isActive ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${userToToggleStatus?.isActive ? 'deactivate' : 'activate'} user ${userToToggleStatus?.name}? ${userToToggleStatus?.isActive ? 'The user will immediately lose access to CrimeTrack.' : 'The user will be able to log in.'}`}
        confirmText={userToToggleStatus?.isActive ? 'Deactivate' : 'Activate'}
        confirmVariant={userToToggleStatus?.isActive ? 'danger' : 'primary'}
        loading={confirmLoading}
      />
    </div>
  );
}

