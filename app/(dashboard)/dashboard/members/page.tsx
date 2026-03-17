'use client';

import { useEffect, useState } from 'react';
import { membersAPI, Member } from '@/app/lib/api';
import { Card, LoadingSkeleton, Button } from '@/app/components/ui';
import { useProtectedRoute } from '@/app/lib/auth';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function MembersPage() {
  const { isLoading: routeLoading } = useProtectedRoute();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    discount: 0,
    expired_date: '',
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await membersAPI.getMembers();
      setMembers(response || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreate = async () => {
    if (!formData.full_name || !formData.phone_number || !formData.discount || !formData.expired_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        ...formData,
        expired_date: `${formData.expired_date}T23:59:59Z`,
      };

      await membersAPI.createMember(payload);
      setShowCreateModal(false);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to create member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMember) return;

    try {
      setSubmitting(true);
      setError(null);
      await membersAPI.updateMember(selectedMember.id, {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email,
        discount: formData.discount,
        expired_date: `${formData.expired_date}T23:59:59Z`,
      });
      setShowEditModal(false);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to update member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this member?')) return;

    try {
      setDeletingId(id);
      setError(null);
      await membersAPI.deleteMember(id);
      await fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete member');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: '',
      discount: 0,
      expired_date: '',
    });
    setShowCreateModal(true);
  };

  const openEditModal = (member: Member) => {
    setFormData({
      full_name: member.full_name,
      email: member.email || '',
      phone_number: member.phone_number,
      discount: member.discount,
      expired_date: member.expired_date.split('T')[0], // Format for input type="date"
    });
    setSelectedMember(member);
    setShowEditModal(true);
  };

  if (routeLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Member Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage all members in the system</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600">
          + Add Member
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Card Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Full Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Phone</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Points</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Discount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Expired Date</th>
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
                    <p className="mt-3 text-slate-600 dark:text-slate-400">Loading members...</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{member.card_number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">{member.full_name}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{member.phone_number}</td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{member.points}</td>
                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{member.discount}%</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(member.expired_date)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === member.id ? '⏳' : '🗑'} Delete
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
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Member</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input type="text" placeholder="Phone Number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount (%)</label>
                <input type="number" placeholder="Discount" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expired Date</label>
                <input type="date" placeholder="Expired Date" value={formData.expired_date} onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={submitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50">{submitting ? 'Adding...' : 'Add Member'}</button>
            </div>
          </Card>
        </div>
      )}

      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Member</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input type="text" placeholder="Phone Number" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount</label>
                <input type="number" placeholder="Discount" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expired Date</label>
                <input type="date" placeholder="Expired Date" value={formData.expired_date} onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
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
