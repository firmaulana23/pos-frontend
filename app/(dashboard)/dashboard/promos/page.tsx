'use client';

import { useEffect, useState } from 'react';
import { promosAPI, Promo } from '@/app/lib/api';
import { Card, LoadingSkeleton, Button } from '@/app/components/ui';
import { useProtectedRoute } from '@/app/lib/auth';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function PromosPage() {
    const { isLoading: routeLoading } = useProtectedRoute();
    const [promos, setPromos] = useState<Promo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: 0,
        min_order_amount: 0,
        max_discount: 0,
        start_at: '',
        end_at: '',
        usage_limit: 0,
        stackable: false,
        is_active: true,
    });

    const fetchPromos = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await promosAPI.getPromos();
            setPromos(data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load promos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleCreate = async () => {
        if (!formData.code || !formData.name || !formData.discount_value || !formData.start_at || !formData.end_at) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const payload = {
                code: formData.code,
                name: formData.name,
                description: formData.description,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                min_order_amount: formData.min_order_amount > 0 ? formData.min_order_amount : undefined,
                max_discount: formData.max_discount > 0 ? formData.max_discount : undefined,
                usage_limit: formData.usage_limit > 0 ? formData.usage_limit : undefined,
                stackable: formData.stackable,
                is_active: formData.is_active,
                start_date: `${formData.start_at}T00:00:00Z`,
                end_date: `${formData.end_at}T23:59:59Z`,
            };

            await promosAPI.createPromo(payload);
            setShowCreateModal(false);
            await fetchPromos();
        } catch (err: any) {
            setError(err.message || 'Failed to create promo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedPromo) return;

        try {
            setSubmitting(true);
            setError(null);

            const payload = {
                code: formData.code,
                name: formData.name,
                description: formData.description,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                min_order_amount: formData.min_order_amount > 0 ? formData.min_order_amount : undefined,
                max_discount: formData.max_discount > 0 ? formData.max_discount : undefined,
                usage_limit: formData.usage_limit > 0 ? formData.usage_limit : undefined,
                stackable: formData.stackable,
                is_active: formData.is_active,
                start_date: `${formData.start_at}T00:00:00Z`,
                end_date: `${formData.end_at}T23:59:59Z`,
            };

            await promosAPI.updatePromo(selectedPromo.id, payload);
            setShowEditModal(false);
            await fetchPromos();
        } catch (err: any) {
            setError(err.message || 'Failed to update promo');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this promo?')) return;

        try {
            setDeletingId(id);
            setError(null);
            await promosAPI.deletePromo(id);
            await fetchPromos();
        } catch (err: any) {
            setError(err.message || 'Failed to delete promo');
        } finally {
            setDeletingId(null);
        }
    };

    const openCreateModal = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            discount_type: 'percentage',
            discount_value: 0,
            min_order_amount: 0,
            max_discount: 0,
            start_at: '',
            end_at: '',
            usage_limit: 0,
            stackable: false,
            is_active: true,
        });
        setError(null);
        setShowCreateModal(true);
    };

    const openEditModal = (promo: Promo) => {
        setFormData({
            code: promo.code,
            name: promo.name,
            description: promo.description || '',
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            min_order_amount: promo.min_order_amount || 0,
            max_discount: promo.max_discount || 0,
            start_at: promo.start_date.split('T')[0],
            end_at: promo.end_date.split('T')[0],
            usage_limit: promo.usage_limit || 0,
            stackable: promo.stackable || false,
            is_active: promo.is_active,
        });
        setError(null);
        setSelectedPromo(promo);
        setShowEditModal(true);
    };

    if (routeLoading) {
        return <LoadingSkeleton count={4} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Promo Management</h2>
                    <p className="text-slate-600 dark:text-slate-400">Manage promotional codes and discounts</p>
                </div>
                <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600">
                    + Add Promo
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
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Code</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Discount</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Validity</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Usage Limit</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Status</th>
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
                                        <p className="mt-3 text-slate-600 dark:text-slate-400">Loading promos...</p>
                                    </td>
                                </tr>
                            ) : promos?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No promos found. Click the Add Promo button to create one.
                                    </td>
                                </tr>
                            ) : (
                                promos?.map((promo) => (
                                    <tr key={promo.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600">
                                                {promo.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">{promo.name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : formatCurrency(promo.discount_value)}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 text-sm">
                                            {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                                            {promo.usage_limit || 'Unlimited'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${promo.is_active
                                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                }`}>
                                                {promo.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => openEditModal(promo)}
                                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                                            >
                                                ✏ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id)}
                                                disabled={deletingId === promo.id}
                                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                                            >
                                                {deletingId === promo.id ? '⏳' : '🗑'} Delete
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
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Promo</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code *</label>
                                <input type="text" placeholder="Promo Code (e.g. SUMMER25)" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 uppercase" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                                <input type="text" placeholder="Promo Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea rows={2} placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Type *</label>
                                <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (Rp)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Value *</label>
                                <input type="number" placeholder="Value" value={formData.discount_value || ''} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                                <input type="date" value={formData.start_at} onChange={(e) => setFormData({ ...formData, start_at: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                                <input type="date" value={formData.end_at} onChange={(e) => setFormData({ ...formData, end_at: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usage Limit (0 for unlimited)</label>
                                <input type="number" min="0" placeholder="0" value={formData.usage_limit || ''} onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div className="flex flex-col gap-3 justify-center">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="add-stackable" checked={formData.stackable} onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                                    <label htmlFor="add-stackable" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Allow stacking with Member discount</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                            <button onClick={handleCreate} disabled={submitting} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50">{submitting ? 'Adding...' : 'Add Promo'}</button>
                        </div>
                    </Card>
                </div>
            )}

            {showEditModal && selectedPromo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Promo</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Code *</label>
                                <input type="text" placeholder="Promo Code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 uppercase" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
                                <input type="text" placeholder="Promo Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea rows={2} placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Type *</label>
                                <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500">
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (Rp)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Value *</label>
                                <input type="number" placeholder="Value" value={formData.discount_value || ''} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                                <input type="date" value={formData.start_at} onChange={(e) => setFormData({ ...formData, start_at: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                                <input type="date" value={formData.end_at} onChange={(e) => setFormData({ ...formData, end_at: e.target.value })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usage Limit (0 for unlimited)</label>
                                <input type="number" min="0" placeholder="0" value={formData.usage_limit || ''} onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })} className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" />
                            </div>

                            <div className="flex flex-col gap-3 justify-center">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="edit-stackable" checked={formData.stackable} onChange={(e) => setFormData({ ...formData, stackable: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                                    <label htmlFor="edit-stackable" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Allow stacking with Member discount</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="edit-active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                                    <label htmlFor="edit-active" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Promo is active</label>
                                </div>
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
