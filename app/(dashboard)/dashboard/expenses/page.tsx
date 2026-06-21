'use client';

import { useEffect, useState } from 'react';
import { expensesAPI, Expense, PaymentMethod, ExpenseCategory } from '@/app/lib/api';
import { Card, LoadingSkeleton, Button } from '@/app/components/ui';
import { useProtectedRoute } from '@/app/lib/auth';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getPaymentMethodName = (code: string, methods: PaymentMethod[]) => {
  const method = methods.find((m) => m.code === code);
  return method ? method.name : code;
};

export default function ExpensesPage() {
  const { isLoading: routeLoading } = useProtectedRoute();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'raw_material',
    category_id: undefined as number | undefined,
    category: '',
    description: '',
    amount: 0,
    payment_method: 'cash',
    date: new Date().toISOString().split('T')[0],
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catType, setCatType] = useState<'raw_material' | 'operational'>('raw_material');
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const [expenseType, setExpenseType] = useState<'raw_material' | 'operational' | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchExpenses = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await expensesAPI.getExpenses(expenseType, pageNum, 10, startDate, endDate);
      setExpenses(response.data);
      setTotalPages(response.total ? Math.ceil(response.total / 10) : 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const methods = await expensesAPI.getPaymentMethods();
      setPaymentMethods(methods);
      if (methods.length > 0 && !formData.payment_method) {
        setFormData(prev => ({ ...prev, payment_method: methods[0].code }));
      }
    } catch (err) {
      console.error('Failed to fetch payment methods', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await expensesAPI.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchExpenses(1);
    setPage(1);
    fetchPaymentMethods();
    fetchCategories();
  }, [expenseType, startDate, endDate]);

  useEffect(() => {
    fetchExpenses(page);
  }, [page]);

  const handleCreate = async () => {
    if (!formData.category || !formData.description || formData.amount <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await expensesAPI.createExpense({
        ...formData,
        date: `${formData.date}T00:00:00Z`,
      });

      setShowCreateModal(false);
      setFormData({
        type: 'raw_material',
        category_id: undefined,
        category: '',
        description: '',
        amount: 0,
        payment_method: 'cash',
        date: new Date().toISOString().split('T')[0],
      });
      await fetchExpenses(1);
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Failed to create expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedExpense || !formData.category || !formData.description || formData.amount <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await expensesAPI.updateExpense(selectedExpense.id, {
        ...formData,
        date: `${formData.date}T00:00:00Z`,
      });

      setShowEditModal(false);
      setSelectedExpense(null);
      setFormData({
        type: 'raw_material',
        category_id: undefined,
        category: '',
        description: '',
        amount: 0,
        payment_method: 'cash',
        date: new Date().toISOString().split('T')[0],
      });
      await fetchExpenses(page);
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      setDeletingId(id);
      setError(null);
      await expensesAPI.deleteExpense(id);
      await fetchExpenses(page);
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setFormData({
      type: 'raw_material',
      category_id: undefined,
      category: '',
      description: '',
      amount: 0,
      payment_method: 'cash',
      date: new Date().toISOString().split('T')[0],
    });
    setShowCreateModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setFormData({
      type: expense.type,
      category_id: expense.category_id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      payment_method: expense.payment_method || 'cash',
      date: new Date(expense.date).toISOString().split('T')[0],
    });
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await expensesAPI.createCategory({ name: newCatName.trim(), type: catType });
      setNewCatName('');
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to add category');
    }
  };

  const handleRenameCategory = async (id: number) => {
    if (!editingCatName.trim()) return;
    try {
      await expensesAPI.updateCategory(id, { name: editingCatName.trim(), type: catType });
      setEditingCatId(null);
      setEditingCatName('');
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to rename category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Past expenses referencing this category will keep their name but this category will be removed for future expenses.')) return;
    try {
      await expensesAPI.deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  if (routeLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Expenses</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage and view all expenses</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-500 hover:bg-blue-600">
          + Add Expense
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Expense Type
            </label>
            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as 'raw_material' | 'operational' | 'all')}
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="raw_material">Raw Material</option>
              <option value="operational">Operational</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
            />
          </div>
          <Button
            onClick={() => fetchExpenses(page)}
            variant="secondary"
            className="whitespace-nowrap"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Type
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                  Payment
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="inline-block">
                      <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-3 text-slate-600 dark:text-slate-400">Loading expenses...</p>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-slate-600 dark:text-slate-400">No expenses found</p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {expense.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-50">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {expense.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                        {getPaymentMethodName(expense.payment_method, paymentMethods)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === expense.id ? '⏳' : '🗑'} Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && expenses.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Add Expense
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: undefined, category: '' })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                >
                  <option value="raw_material">Raw Material</option>
                  <option value="operational">Operational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => {
                      const id = e.target.value ? parseInt(e.target.value) : undefined;
                      const name = categories.find((c) => c.id === id)?.name || '';
                      setFormData({ ...formData, category_id: id, category: name });
                    }}
                    className="flex-1 px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c.type === formData.type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setCatType(formData.type as 'raw_material' | 'operational');
                      setShowCategoryModal(true);
                    }}
                    className="px-3 py-2 border border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 rounded-lg text-slate-600 dark:text-slate-400 text-sm flex items-center justify-center whitespace-nowrap"
                  >
                    ⚙️ Manage
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  placeholder="Expense details"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                >
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((method) => (
                      <option key={method.id} value={method.code}>
                        {method.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? '⏳ Adding...' : 'Add Expense'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {showEditModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit Expense
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, category_id: undefined, category: '' })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                >
                  <option value="raw_material">Raw Material</option>
                  <option value="operational">Operational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => {
                      const id = e.target.value ? parseInt(e.target.value) : undefined;
                      const name = categories.find((c) => c.id === id)?.name || '';
                      setFormData({ ...formData, category_id: id, category: name });
                    }}
                    className="flex-1 px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter((c) => c.type === formData.type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setCatType(formData.type as 'raw_material' | 'operational');
                      setShowCategoryModal(true);
                    }}
                    className="px-3 py-2 border border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500 rounded-lg text-slate-600 dark:text-slate-400 text-sm flex items-center justify-center whitespace-nowrap"
                  >
                    ⚙️ Manage
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  placeholder="Expense details"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                >
                  {paymentMethods.length > 0 ? (
                    paymentMethods.map((method) => (
                      <option key={method.id} value={method.code}>
                        {method.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? '⏳ Saving...' : 'Save Changes'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Manage Categories
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setCatType('raw_material')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${catType === 'raw_material' ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Raw Material
              </button>
              <button
                type="button"
                onClick={() => setCatType('operational')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${catType === 'operational' ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Operational
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="New category name"
                className="flex-1 px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Add
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {categories.filter(c => c.type === catType).length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-4">No categories created yet.</p>
              ) : (
                categories
                  .filter(c => c.type === catType)
                  .map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm">
                      {editingCatId === cat.id ? (
                        <div className="flex-1 flex gap-2 mr-2">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-slate-300 rounded text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategory(cat.id)}
                            className="text-green-500 hover:text-green-600 font-semibold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="text-slate-400 hover:text-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{cat.name}</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              className="text-blue-500 hover:text-blue-600 text-xs"
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-red-500 hover:text-red-600 text-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
