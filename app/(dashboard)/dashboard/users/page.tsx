'use client';

import { useEffect, useState } from 'react';
import { usersAPI, User } from '@/app/lib/api';
import { Card, LoadingSkeleton, Button } from '@/app/components/ui';
import { useProtectedRoute } from '@/app/lib/auth';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function UsersPage() {
  const { isLoading: routeLoading } = useProtectedRoute('admin');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    role: 'cashier' as 'admin' | 'manager' | 'cashier',
    is_active: true,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersAPI.getUsers();
      setUsers(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirm_password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await usersAPI.createUser(formData);
      setShowCreateModal(false);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      setError(null);
      await usersAPI.updateUser(selectedUser.id, {
        full_name: formData.full_name,
        email: formData.email,
        is_active: formData.is_active,
      });
      await usersAPI.updateUserRole(selectedUser.id, formData.role);
      setShowEditModal(false);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setDeletingId(id);
      setError(null);
      await usersAPI.deleteUser(id);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      full_name: '',
      role: 'cashier',
      is_active: true,
    });
    setShowCreateModal(true);
  };

  const openEditModal = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      confirm_password: '',
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  if (routeLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage all users in the system</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600">
          + Add User
        </Button>
      </div>

      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900">
          <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Full Name</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Role</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="inline-block">
                      <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-3 text-slate-600 dark:text-slate-400">Loading users...</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">{user.username}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.full_name || '-'}</td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 capitalize">{user.role}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === user.id ? '⏳' : '🗑'} Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Add New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                <input type="password" placeholder="Password" value={formData.password} onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (error === 'Passwords do not match') setError(null);
                }} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password *</label>
                <input type="password" placeholder="Confirm Password" value={formData.confirm_password} onChange={(e) => {
                  setFormData({ ...formData, confirm_password: e.target.value });
                  if (error === 'Passwords do not match') setError(null);
                }} className={`w-full px-4 py-2 border-2 ${formData.confirm_password && formData.password !== formData.confirm_password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'} rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none`} />
                {formData.confirm_password && formData.password !== formData.confirm_password && (
                  <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'cashier' })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500">
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={submitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50">{submitting ? 'Adding...' : 'Add User'}</button>
            </div>
          </Card>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'cashier' })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500">
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="active" className="text-sm text-slate-700 dark:text-slate-300">Active</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button onClick={handleUpdate} disabled={submitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50">{submitting ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
