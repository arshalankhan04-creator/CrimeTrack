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
  BadgeAlert
} from 'lucide-react';
import userService from '../../services/userService';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
    setError(null);
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
      setError(err.message || 'Error fetching users list.');
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
    setError(null);
    try {
      await userService.createUser(formData);
      setSuccessMsg('User created successfully.');
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
      setError(err.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setError(null);
    try {
      await userService.updateUser(selectedUser._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        employeeId: formData.employeeId,
      });
      setSuccessMsg('User profile updated successfully.');
      setIsEditModalOpen(false);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const confirmAction = window.confirm(
      `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} user ${user.name}?`
    );
    if (!confirmAction) return;

    try {
      await userService.setUserStatus(user._id, newStatus);
      setSuccessMsg(`User ${user.name} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to change user status.');
    }
  };

  // Handle Supervisor Reassignment
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !reassignSupervisorId) return;
    setSubmitting(true);
    setError(null);
    try {
      await userService.assignSupervisor(selectedUser._id, reassignSupervisorId);
      setSuccessMsg(`Supervisor reassigned for ${selectedUser.name}.`);
      setIsReassignModalOpen(false);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to reassign supervisor.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      employeeId: user.employeeId || '',
      supervisorOfficerId: user.supervisorOfficerId?._id || '',
    });
    setIsEditModalOpen(true);
  };

  // Open Reassign Modal
  const openReassignModal = (user) => {
    setSelectedUser(user);
    setReassignSupervisorId(user.supervisorOfficerId?._id || '');
    setIsReassignModalOpen(true);
  };

  // Counts for summary
  const officerCount = users.filter((u) => u.role === 'OFFICER').length;
  const viewerCount = users.filter((u) => u.role === 'VIEWER').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-info">Milestone 3</span>
            <span className="text-xs text-slate-500 font-mono">User & Role Management</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mt-2 tracking-tight">
            Officer & Viewer Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Admin console for provisioning officers, viewers, and establishing supervisory hierarchies.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue hover:bg-brand-hoverBlue text-white font-semibold rounded-lg text-sm shadow transition shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
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
            placeholder="Search by name, email, badge ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Role Filter Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium shrink-0">
            <button
              onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-md transition ${roleFilter === '' ? 'bg-white text-navy-900 shadow-sm font-bold' : 'text-slate-600 hover:text-navy-900'}`}
            >
              All Users
            </button>
            <button
              onClick={() => setRoleFilter('OFFICER')}
              className={`px-3 py-1.5 rounded-md transition ${roleFilter === 'OFFICER' ? 'bg-white text-navy-900 shadow-sm font-bold' : 'text-slate-600 hover:text-navy-900'}`}
            >
              Officers
            </button>
            <button
              onClick={() => setRoleFilter('VIEWER')}
              className={`px-3 py-1.5 rounded-md transition ${roleFilter === 'VIEWER' ? 'bg-white text-navy-900 shadow-sm font-bold' : 'text-slate-600 hover:text-navy-900'}`}
            >
              Viewers
            </button>
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Officer / User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Badge ID</th>
                <th className="px-6 py-3.5">Supervisor</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Loading users registry...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">{user.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' && <span className="badge-success">ADMIN</span>}
                      {user.role === 'OFFICER' && <span className="badge-info">OFFICER</span>}
                      {user.role === 'VIEWER' && <span className="badge-warning">VIEWER</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {user.employeeId || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'VIEWER' ? (
                        user.supervisorOfficerId ? (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 font-medium">
                              {user.supervisorOfficerId.name}
                            </span>
                            <button
                              onClick={() => openReassignModal(user)}
                              className="text-brand-blue hover:underline text-[10px]"
                              title="Reassign supervisor"
                            >
                              (Change)
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openReassignModal(user)}
                            className="text-red-500 hover:underline font-semibold"
                          >
                            Unassigned
                          </button>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="badge-success">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="badge-danger">
                          <XCircle className="w-3 h-3" />
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-slate-100 rounded transition"
                        title="Edit Profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-1.5 rounded transition ${
                            user.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          <UserCheck className="w-4 h-4" />
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
            Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total accounts)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => fetchUsers(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-brand-blue" />
                Provision Official Account
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">User Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${formData.role === 'OFFICER' ? 'border-brand-blue bg-blue-50/50 font-bold text-brand-blue' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="OFFICER"
                      checked={formData.role === 'OFFICER'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="text-brand-blue"
                    />
                    <span>Investigating Officer</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer ${formData.role === 'VIEWER' ? 'border-amber-500 bg-amber-50/50 font-bold text-amber-700' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="role"
                      value="VIEWER"
                      checked={formData.role === 'VIEWER'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value, supervisorOfficerId: officers[0]?._id || '' })}
                      className="text-amber-500"
                    />
                    <span>Supervised Viewer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspector Ramesh Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@crimetrack.gov"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge / Employee ID</label>
                  <input
                    type="text"
                    placeholder="e.g. OFF-105"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Supervisor Selector if Viewer */}
              {formData.role === 'VIEWER' && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-1">
                  <label className="block font-semibold text-amber-900">
                    Assign Supervising Officer
                  </label>
                  <p className="text-[11px] text-amber-700">
                    Viewer will have read-only visibility restricted to this Officer's assigned cases.
                  </p>
                  <select
                    required
                    value={formData.supervisorOfficerId}
                    onChange={(e) => setFormData({ ...formData, supervisorOfficerId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="">Select Supervising Officer...</option>
                    {officers.map((officer) => (
                      <option key={officer._id} value={officer._id}>
                        {officer.name} ({officer.employeeId || officer.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
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
                  {submitting ? 'Creating User...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-blue" />
                Edit Profile: {selectedUser.name}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Badge / Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
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
                  {submitting ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN SUPERVISOR MODAL */}
      {isReassignModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-navy-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-amber-600" />
                Reassign Supervisor for {selectedUser.name}
              </h3>
              <button onClick={() => setIsReassignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Select a new supervising Officer for this Viewer. The Viewer's case visibility will immediately shift to the selected Officer's scope.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Active Supervising Officer
                </label>
                <select
                  required
                  value={reassignSupervisorId}
                  onChange={(e) => setReassignSupervisorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                >
                  <option value="">Choose an Officer...</option>
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
                  disabled={submitting || !reassignSupervisorId}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow disabled:opacity-50"
                >
                  {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
