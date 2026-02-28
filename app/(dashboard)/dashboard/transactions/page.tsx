'use client';

import { useEffect, useState } from 'react';
import { transactionsAPI, Transaction, TransactionsResponse } from '@/app/lib/api';
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
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    default:
      return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return 'Cash';
    case 'card':
      return 'Card';
    case 'qris':
      return 'Qris';
    case 'digital_wallet':
      return 'Digital Wallet';
    default:
      return '💰';
  }
};

const getDateRange = (rangeType: string): { start: Date; end: Date } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (rangeType) {
    case 'today': {
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return { start: today, end };
    }
    case 'week': {
      const dayOfWeek = today.getDay();
      const start = new Date(today);
      start.setDate(today.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'all':
    default:
      return { start: new Date('2000-01-01'), end: today };
  }
};

export default function TransactionsPage() {
  const { isLoading: routeLoading } = useProtectedRoute();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<'pending' | 'paid' | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTransactions = async (pageNum: number, currentSearch?: string) => {
    try {
      setLoading(true);
      setError(null);

      const statusFilter = status === 'all' ? undefined : (status as 'pending' | 'paid');
      const limit = 10;

      let apiStartDate: string | undefined;
      let apiEndDate: string | undefined;

      if (dateRange === 'custom') {
        apiStartDate = startDate || undefined;
        apiEndDate = endDate || undefined;
      } else if (dateRange !== 'all') {
        const { start, end } = getDateRange(dateRange);
        const formatYMD = (date: Date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };
        apiStartDate = formatYMD(start);
        apiEndDate = formatYMD(end);
      }

      const activeSearch = currentSearch !== undefined ? currentSearch : searchTerm;

      const response = await transactionsAPI.getTransactions(
        statusFilter,
        limit,
        pageNum,
        apiStartDate,
        apiEndDate,
        activeSearch || undefined
      );

      setTransactions(response.data);
      setTotalPages(Math.ceil(response.total / limit));
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(page, searchTerm);
    }, 400); // debounce API calls
    return () => clearTimeout(timer);
  }, [page, status, searchTerm, dateRange, startDate, endDate]);

  const handlePay = async (transactionId: number) => {
    try {
      setPayingId(transactionId);
      await transactionsAPI.payTransaction(transactionId, 'cash');
      // Refresh the list
      await fetchTransactions(page);
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
    } finally {
      setPayingId(null);
    }
  };

  const handleDelete = async (transactionId: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      setDeletingId(transactionId);
      await transactionsAPI.deleteTransaction(transactionId);
      // Refresh the list
      await fetchTransactions(page);
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  // Client side filtering is removed since API handles it now.
  const filteredTransactions = transactions;

  if (routeLoading) {
    return <LoadingSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Transactions</h2>
        <p className="text-slate-600 dark:text-slate-400">Manage and view all your transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Date Range</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {['today', 'week', 'month', 'all', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range as 'today' | 'week' | 'month' | 'all' | 'custom');
                  if (range !== 'custom') {
                    setStartDate('');
                    setEndDate('');
                  }
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${dateRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
              >
                {range === 'custom' && '📅'} {range}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Status and Search row */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Status filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as 'pending' | 'paid' | 'all');
                setPage(1);
              }}
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by transaction no or customer name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Refresh button */}
          <Button
            onClick={() => fetchTransactions(page)}
            variant="secondary"
            className="whitespace-nowrap"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Error message */}
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

      {/* Transactions table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Transaction No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">Method</th>
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
                    <p className="mt-3 text-slate-600 dark:text-slate-400">Loading transactions...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-slate-600 dark:text-slate-400">No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetails(true);
                        }}
                        className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {transaction.transaction_no}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-900 dark:text-slate-50">
                      {transaction.customer_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-50">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-lg">
                      {getPaymentMethodIcon(transaction.payment_method)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDetails(true);
                        }}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        👁 View
                      </button>

                      {transaction.status === 'pending' && (
                        <button
                          onClick={() => handlePay(transaction.id)}
                          disabled={payingId === transaction.id}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors disabled:opacity-50"
                        >
                          {payingId === transaction.id ? '⏳' : '✓'} Pay
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deletingId === transaction.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                      >
                        {deletingId === transaction.id ? '⏳' : '🗑'} Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredTransactions.length > 0 && (
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

      {/* Details modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Transaction Details
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            {/* Transaction info */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Transaction No</p>
                  <p className="font-mono font-semibold text-slate-900 dark:text-slate-50">{selectedTransaction.transaction_no}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Customer</p>
                  <p className="text-slate-900 dark:text-slate-50">{selectedTransaction.customer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Date</p>
                  <p className="text-slate-900 dark:text-slate-50">{formatDate(selectedTransaction.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Items</h4>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                {selectedTransaction.items.map((item) => (
                  <div key={item.id} className="border-b border-slate-200 dark:border-slate-700 pb-2 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {item.menu_item.name} x{item.quantity}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                    {item.add_ons && item.add_ons.length > 0 && (
                      <div className="ml-4 text-sm text-slate-600 dark:text-slate-400">
                        {item.add_ons.map((addon) => (
                          <div key={addon.id}>
                            + {addon.add_on.name} x{addon.quantity} ({formatCurrency(addon.total_price)})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">{formatCurrency(selectedTransaction.sub_total)}</span>
              </div>
              {selectedTransaction.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tax</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-50">+{formatCurrency(selectedTransaction.tax)}</span>
                </div>
              )}
              {selectedTransaction.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Discount</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(selectedTransaction.discount)}</span>
                </div>
              )}
              <div className="border-t border-slate-300 dark:border-slate-600 pt-2 flex justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="font-bold text-lg text-slate-900 dark:text-slate-50">{formatCurrency(selectedTransaction.total)}</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowDetails(false)}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}