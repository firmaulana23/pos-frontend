'use client';

import { useEffect, useState } from 'react';
import { stockAPI, RawMaterial, DailySummary } from '@/app/lib/api';
import { Card, LoadingSkeleton, Button, Input } from '@/app/components/ui';
import { useProtectedRoute } from '@/app/lib/auth';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function StockPage() {
    const { isLoading: routeLoading } = useProtectedRoute();
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    const [materials, setMaterials] = useState<RawMaterial[]>([]);
    const [summaries, setSummaries] = useState<DailySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Modals for Master Data
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Modals for Stock Operations
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
    const [showOpnameModal, setShowOpnameModal] = useState(false);

    const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [formData, setFormData] = useState({ name: '', unit: 'kg', stock: 0 });
    const [operationData, setOperationData] = useState({ raw_material_id: 0, quantity: 0, notes: '' });
    const [opnameData, setOpnameData] = useState<Array<{ raw_material_id: number, ending_stock: number, notes: string }>>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            if (activeTab === 'current') {
                const data = await stockAPI.getRawMaterials();
                setMaterials(data || []);
            } else {
                const data = await stockAPI.getDailySummaries(startDate || undefined, endDate || undefined);
                setSummaries(data || []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, startDate, endDate]);

    // Master Data Methods
    const handleCreate = async () => {
        if (!formData.name || !formData.unit) return setError('Name and Unit are required');
        try {
            setSubmitting(true);
            await stockAPI.createRawMaterial({ name: formData.name, unit_of_measure: formData.unit, current_stock: formData.stock });
            setShowCreateModal(false);
            await fetchData();
        } catch (err: any) { setError(err.message || 'Failed to create raw material'); }
        finally { setSubmitting(false); }
    };

    const handleUpdate = async () => {
        if (!selectedMaterial || !formData.name || !formData.unit) return setError('Name and Unit are required');
        try {
            setSubmitting(true);
            await stockAPI.updateRawMaterial(selectedMaterial.id, { name: formData.name, unit_of_measure: formData.unit, current_stock: formData.stock });
            setShowEditModal(false);
            await fetchData();
        } catch (err: any) { setError(err.message || 'Failed to update raw material'); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this raw material?')) return;
        try {
            setDeletingId(id);
            await stockAPI.deleteRawMaterial(id);
            await fetchData();
        } catch (err: any) { setError(err.message || 'Failed to delete raw material'); }
        finally { setDeletingId(null); }
    };

    // Stock Operations Methods
    const handleReceipt = async () => {
        if (!operationData.raw_material_id || operationData.quantity <= 0) return setError('Please select an item and enter a valid positive quantity');
        try {
            setSubmitting(true);
            await stockAPI.createReceipt({ raw_material_id: operationData.raw_material_id, quantity: operationData.quantity, notes: operationData.notes || undefined });
            setShowReceiptModal(false);
            await fetchData();
        } catch (err: any) { setError(err.message || 'Failed to create receipt'); }
        finally { setSubmitting(false); }
    };

    const handleAdjustment = async () => {
        if (!operationData.raw_material_id || operationData.quantity === 0) return setError('Please select an item and enter a valid quantity (positive or negative)');
        try {
            setSubmitting(true);
            await stockAPI.createAdjustment({ raw_material_id: operationData.raw_material_id, quantity: operationData.quantity, notes: operationData.notes || undefined });
            setShowAdjustmentModal(false);
            await fetchData();
        } catch (err: any) { setError(err.message || 'Failed to create adjustment'); }
        finally { setSubmitting(false); }
    };

    const handleOpname = async () => {
        const validOpnames = opnameData.filter(op => op.ending_stock >= 0);
        if (validOpnames.length === 0) return setError('No valid stock opname data to submit');
        try {
            setSubmitting(true);
            await stockAPI.createDailySummary(validOpnames.map(op => ({
                raw_material_id: op.raw_material_id,
                ending_stock: op.ending_stock,
                notes: op.notes || undefined
            })));
            setShowOpnameModal(false);
            await fetchData();
        } catch (err: any) { setError(err.message || 'Failed to create stock opname'); }
        finally { setSubmitting(false); }
    };

    const openOpnameModal = () => {
        setOpnameData(materials.map(m => ({ raw_material_id: m.id, ending_stock: m.current_stock, notes: '' })));
        setError(null);
        setShowOpnameModal(true);
    };

    if (routeLoading) return <LoadingSkeleton count={4} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Stock Management</h2>
                    <p className="text-slate-600 dark:text-slate-400">Manage raw materials, track inventory, and view records</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {activeTab === 'current' && (
                        <>
                            <Button onClick={() => setShowReceiptModal(true)} className="bg-emerald-500 hover:bg-emerald-600 border-transparent text-white border">
                                + Masuk
                            </Button>
                            <Button onClick={() => setShowAdjustmentModal(true)} className="bg-amber-500 hover:bg-amber-600 border-transparent text-white border">
                                + Internal
                            </Button>
                            <Button onClick={openOpnameModal} className="bg-indigo-500 hover:bg-indigo-600 border-transparent text-white border">
                                ✏️ Opname
                            </Button>
                            <Button onClick={() => { setFormData({ name: '', unit: 'kg', stock: 0 }); setError(null); setShowCreateModal(true); }}>
                                + Add Item
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'current' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                    Master Data
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                >
                    Opname History
                </button>
            </div>

            {activeTab === 'history' && (
                <div className="flex justify-end pr-2 pl-2">
                    <div className="flex gap-4">
                        <Input
                            type="date"
                            label="Start Date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                            type="date"
                            label="End Date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        {(startDate || endDate) && (
                            <div className="flex items-end mb-1">
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="text-xs text-blue-500 hover:text-blue-600"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900">
                    <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
                </div>
            )}

            {/* Main Tables */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    {activeTab === 'current' ? (
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Item Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Unit of Measure</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Current Stock</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td></tr>
                                ) : materials.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No raw materials found.</td></tr>
                                ) : (
                                    materials.map((material) => (
                                        <tr key={material.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">{material.name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                                    {material.unit_of_measure}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-50">{material.current_stock}</td>
                                            <td className="px-6 py-4">
                                                {material.current_stock > 0 ? (
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">In Stock</span>
                                                ) : (
                                                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">Out of Stock</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => { setFormData({ name: material.name, unit: material.unit_of_measure, stock: material.current_stock }); setSelectedMaterial(material); setShowEditModal(true); }} className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors">✏ Edit</button>
                                                <button onClick={() => handleDelete(material.id)} disabled={deletingId === material.id} className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50">{deletingId === material.id ? '⏳' : '🗑'} Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Item</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Start</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">In</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actual Usage</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Theoretical</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Adj</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">End</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Variance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">Loading history...</td></tr>
                                ) : summaries.length === 0 ? (
                                    <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">No history records found.</td></tr>
                                ) : (
                                    summaries.map((summary) => (
                                        <tr key={summary.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">{formatDate(summary.summary_date)}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-50">{summary.raw_material?.name || `ID ${summary.raw_material_id}`}</td>
                                            <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">{summary.beginning_stock}</td>
                                            <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{summary.receipts_in}</td>
                                            <td className="px-6 py-4 text-right text-slate-900 dark:text-white font-medium">{summary.daily_usage}</td>
                                            <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">{summary.theoretical_usage}</td>
                                            <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400">{summary.adjustments > 0 ? `+${summary.adjustments}` : summary.adjustments}</td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-50">{summary.ending_stock}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${summary.variance === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : summary.variance < 0 ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'}`}>
                                                    {summary.variance > 0 ? `+${summary.variance}` : summary.variance}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Item Master Modal (Create Items) */}
            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card
                        className="w-full max-w-md"
                        header={
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{showEditModal ? 'Edit Item' : 'Add Item'}</h3>
                                <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            <Input label="Name *" placeholder="e.g. Coffee Beans" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <Input label="Unit of Measure *" placeholder="e.g. kg, gram, pcs" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                            {!showEditModal && (
                                <Input type="number" label="Initial Stock" placeholder="0" value={formData.stock || ''} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}>Cancel</Button>
                            <Button onClick={showEditModal ? handleUpdate : handleCreate} isLoading={submitting} className="flex-1">{showEditModal ? 'Save Changes' : 'Add Item'}</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Stock Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card
                        className="w-full max-w-md"
                        header={
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Stock Receipt</h3>
                                <button onClick={() => setShowReceiptModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Material *</label>
                                <select value={operationData.raw_material_id} onChange={e => setOperationData({ ...operationData, raw_material_id: Number(e.target.value) })} className="input-field w-full">
                                    <option value={0}>Select a material...</option>
                                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit_of_measure})</option>)}
                                </select>
                            </div>
                            <Input type="number" min="0" label="Quantity Received *" placeholder="0" value={operationData.quantity || ''} onChange={e => setOperationData({ ...operationData, quantity: Number(e.target.value) })} />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes</label>
                                <textarea placeholder="e.g. Received new stock" value={operationData.notes} onChange={e => setOperationData({ ...operationData, notes: e.target.value })} className="input-field w-full" rows={3}></textarea>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowReceiptModal(false)}>Cancel</Button>
                            <Button onClick={handleReceipt} isLoading={submitting} className="flex-1 bg-emerald-500 hover:bg-emerald-600">Submit Receipt</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Stock Adjustment Modal */}
            {showAdjustmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card
                        className="w-full max-w-md"
                        header={
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Stock Adjustment</h3>
                                <button onClick={() => setShowAdjustmentModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Material *</label>
                                <select value={operationData.raw_material_id} onChange={e => setOperationData({ ...operationData, raw_material_id: Number(e.target.value) })} className="input-field w-full">
                                    <option value={0}>Select a material...</option>
                                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} (Current: {m.current_stock})</option>)}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity Offset (+/-) *</label>
                                <p className="text-xs text-slate-500 mb-2">Use negative values for waste/loss, positive for found items.</p>
                                <input type="number" placeholder="0" value={operationData.quantity || ''} onChange={e => setOperationData({ ...operationData, quantity: Number(e.target.value) })} className="input-field w-full" />
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Reason/Notes</label>
                                <textarea placeholder="e.g. Wasted 1kg due to spill" value={operationData.notes} onChange={e => setOperationData({ ...operationData, notes: e.target.value })} className="input-field w-full" rows={3}></textarea>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowAdjustmentModal(false)}>Cancel</Button>
                            <Button onClick={handleAdjustment} isLoading={submitting} className="flex-1 bg-amber-500 hover:bg-amber-600">Submit Adjustment</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Stock Opname Modal */}
            {showOpnameModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card
                        className="w-full max-w-4xl max-h-[90vh] flex flex-col"
                        header={
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Daily Stock Opname</h3>
                                    <p className="text-sm text-slate-500">Record the physical count of stock for today.</p>
                                </div>
                                <button onClick={() => setShowOpnameModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">✕</button>
                            </div>
                        }
                    >
                        <div className="overflow-y-auto flex-1 mb-4 pr-2">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="p-3 text-left font-semibold text-slate-900 dark:text-white">Item Name</th>
                                        <th className="p-3 text-center font-semibold text-slate-900 dark:text-white">System Stock</th>
                                        <th className="p-3 text-center font-semibold text-slate-900 dark:text-white">Actual Physical Count</th>
                                        <th className="p-3 text-left font-semibold text-slate-900 dark:text-white">Notes (Optional)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materials.map((m) => (
                                        <tr key={m.id} className="border-b border-slate-200 dark:border-slate-700">
                                            <td className="p-3 font-medium text-slate-900 dark:text-slate-50">{m.name} <span className="text-xs text-slate-400">({m.unit_of_measure})</span></td>
                                            <td className="p-3 text-center font-medium text-slate-500 dark:text-slate-400">{m.current_stock}</td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number" min="0"
                                                    value={opnameData.find(op => op.raw_material_id === m.id)?.ending_stock ?? m.current_stock}
                                                    onChange={(e) => {
                                                        const newDat = [...opnameData];
                                                        const idx = newDat.findIndex(op => op.raw_material_id === m.id);
                                                        if (idx > -1) newDat[idx].ending_stock = Math.max(0, Number(e.target.value));
                                                        setOpnameData(newDat);
                                                    }}
                                                    className="input-field text-center w-24 py-1 !px-2"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <input
                                                    type="text" placeholder="Reason for variance..."
                                                    value={opnameData.find(op => op.raw_material_id === m.id)?.notes ?? ''}
                                                    onChange={(e) => {
                                                        const newDat = [...opnameData];
                                                        const idx = newDat.findIndex(op => op.raw_material_id === m.id);
                                                        if (idx > -1) newDat[idx].notes = e.target.value;
                                                        setOpnameData(newDat);
                                                    }}
                                                    className="input-field w-full py-1"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setShowOpnameModal(false)}>Cancel</Button>
                            <Button onClick={handleOpname} isLoading={submitting} className="flex-1 bg-indigo-500 hover:bg-indigo-600">Submit Opname Records</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
