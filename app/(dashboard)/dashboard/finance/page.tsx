'use client';

import { useEffect, useState } from 'react';
import { financeAPI, FinanceDashboardData, FinanceCheck } from '@/app/lib/api';
import { Card, Stat, LoadingSkeleton } from '@/app/components/ui';
import { SimpleDonutChart } from '@/app/components/charts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr: string | Date) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
};

export default function FinanceDashboardPage() {
  const [data, setData] = useState<FinanceDashboardData | null>(null);
  const [checks, setChecks] = useState<FinanceCheck[]>([]);
  const [totalChecks, setTotalChecks] = useState(0);
  const [checksPage, setChecksPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [pendingStartDate, setPendingStartDate] = useState('');
  const [pendingEndDate, setPendingEndDate] = useState('');

  // Reconciliation Audit Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditStartDate, setAuditStartDate] = useState('');
  const [auditEndDate, setAuditEndDate] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditSummary, setAuditSummary] = useState<any>(null);
  const [actualCash, setActualCash] = useState(0);
  const [actualRekening, setActualRekening] = useState(0);
  const [notes, setNotes] = useState('');
  const [auditSubmitLoading, setAuditSubmitLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine date params
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      let startDate = '';
      let endDate = '';

      if (dateRange === 'custom') {
        startDate = customStartDate;
        endDate = customEndDate;
      } else if (dateRange === 'today') {
        startDate = `${year}-${month}-${day}`;
        endDate = `${year}-${month}-${day}`;
      } else if (dateRange === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
        endDate = `${year}-${month}-${day}`;
      } else if (dateRange === 'month') {
        startDate = `${year}-${month}-01`;
        endDate = `${year}-${month}-${day}`;
      }

      const [dashData, checksRes] = await Promise.all([
        financeAPI.getDashboard(startDate || undefined, endDate || undefined),
        financeAPI.getChecks(checksPage, 8)
      ]);

      setData(dashData);
      setChecks(checksRes.data);
      setTotalChecks(checksRes.total);
    } catch (err: any) {
      console.error('Failed to load finance dashboard:', err);
      setError(err.message || 'Gagal memuat data keuangan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, customStartDate, customEndDate, checksPage]);

  // Load expected balance summary when dates change in the Audit Form
  const loadAuditSummary = async () => {
    if (!auditStartDate || !auditEndDate) return;
    try {
      setAuditLoading(true);
      setAuditError(null);
      const summary = await financeAPI.getSummary(auditStartDate, auditEndDate);
      setAuditSummary(summary);
      setActualCash(summary.expected_cash);
      setActualRekening(summary.expected_rekening);
    } catch (err: any) {
      setAuditError(err.message || 'Gagal memuat ringkasan audit.');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (isAuditModalOpen) {
      loadAuditSummary();
    }
  }, [auditStartDate, auditEndDate, isAuditModalOpen]);

  const openAuditModal = () => {
    // Set default audit dates: default starting from the date of the last check up to today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    let defaultStart = '';
    if (data?.last_check_date) {
      // Start day is the day after the last check end date
      const lastDate = new Date(data.last_check_date);
      lastDate.setDate(lastDate.getDate() + 1);
      defaultStart = lastDate.toISOString().split('T')[0];
    } else {
      // Default to 7 days ago if no past check
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      defaultStart = weekAgo.toISOString().split('T')[0];
    }

    setAuditStartDate(defaultStart);
    setAuditEndDate(todayStr);
    setNotes('');
    setAuditError(null);
    setIsAuditModalOpen(true);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditStartDate || !auditEndDate) return;

    try {
      setAuditSubmitLoading(true);
      setAuditError(null);

      await financeAPI.createCheck({
        start_date: auditStartDate,
        end_date: auditEndDate,
        starting_cash: auditSummary?.starting_cash || 0,
        starting_rekening: auditSummary?.starting_rekening || 0,
        actual_cash: actualCash,
        actual_rekening: actualRekening,
        notes,
      });

      setIsAuditModalOpen(false);
      setChecksPage(1);
      fetchDashboardData();
    } catch (err: any) {
      setAuditError(err.message || 'Gagal menyimpan hasil rekonsiliasi.');
    } finally {
      setAuditSubmitLoading(false);
    }
  };

  if (loading && !data) {
    return <LoadingSkeleton count={4} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <span className="text-4xl">⚠️</span>
        <h3 className="font-semibold text-red-900 dark:text-red-200 mt-2">Gagal Memuat Dashboard Keuangan</h3>
        <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary mt-4 px-4 py-2 text-sm rounded-lg">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart formats
  const salesShareData = (data.sales_share || []).map((item, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    return {
      label: item.payment_method ? (item.payment_method === 'cash' ? 'Cash' : item.payment_method === 'qris' ? 'QRIS' : item.payment_method === 'bank_transfer' ? 'Bank Transfer' : item.payment_method.toUpperCase()) : 'Unknown',
      value: item.total,
      color: colors[index % colors.length]
    };
  });

  const expensesShareData = (data.expenses_share || []).map((item, index) => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#ec4899', '#8b5cf6'];
    return {
      label: item.payment_method ? (item.payment_method === 'cash' ? 'Cash' : item.payment_method === 'qris' ? 'QRIS' : item.payment_method === 'bank_transfer' ? 'Bank Transfer' : item.payment_method.toUpperCase()) : 'Unknown',
      value: item.total,
      color: colors[index % colors.length]
    };
  });

  // Dual area chart data
  const trendData = (data.daily_trend || []).map((point) => ({
    date: formatShortDate(point.date),
    Sales: point.total_sales,
    Expenses: point.total_expenses,
  }));

  const totalSalesFromShare = (data.sales_share || []).reduce((sum, item) => sum + item.total, 0);
  const totalExpensesFromShare = (data.expenses_share || []).reduce((sum, item) => sum + item.total, 0);

  const formatRechartsCurrency = (value: any) => {
    if (value === 0) return '0';
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
    return `Rp ${value}`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header and top action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Finance
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Pantau arus kas, lakukan audit, pencocokan saldo aktual dengan sistem, dan analisa finansial.
          </p>
        </div>
        <button
          onClick={openAuditModal}
          className="btn-primary flex items-center justify-center gap-2 px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <span className="text-lg">⚖️</span>
          <span className="font-semibold text-sm">Rekonsiliasi Saldo (Audit)</span>
        </button>
      </div>

      {/* Date Filter Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Filter Periode Cash Flow</h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${dateRange === range
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {range === 'today' ? 'Hari Ini' : range === 'week' ? '7 Hari Terakhir' : 'Bulan Ini'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mulai Tanggal</label>
              <input
                type="date"
                value={pendingStartDate}
                onChange={(e) => setPendingStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={pendingEndDate}
                onChange={(e) => setPendingEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => {
                if (pendingStartDate && pendingEndDate) {
                  setCustomStartDate(pendingStartDate);
                  setCustomEndDate(pendingEndDate);
                  setDateRange('custom');
                }
              }}
              disabled={!pendingStartDate || !pendingEndDate}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Terapkan
            </button>
            {dateRange === 'custom' && (
              <button
                onClick={() => {
                  setPendingStartDate('');
                  setPendingEndDate('');
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setDateRange('month');
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-300 transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Financial Key Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] text-8xl opacity-10 pointer-events-none">💰</div>
          <p className="text-sm font-medium opacity-80">Total Penjualan (Inflow)</p>
          <h3 className="text-3xl font-extrabold mt-2">{formatCurrency(data.total_income)}</h3>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs font-semibold opacity-90">
            <span>Kas: {formatCurrency((data.sales_share || []).filter(s => s.payment_method === 'cash').reduce((sum, s) => sum + s.total, 0))}</span>
            <span>Rekening: {formatCurrency((data.sales_share || []).filter(s => s.payment_method !== 'cash').reduce((sum, s) => sum + s.total, 0))}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] text-8xl opacity-10 pointer-events-none">💸</div>
          <p className="text-sm font-medium opacity-80">Total Pengeluaran (Outflow)</p>
          <h3 className="text-3xl font-extrabold mt-2">{formatCurrency(data.total_expenses)}</h3>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs font-semibold opacity-90">
            <span>Rasio Beban Operasional:</span>
            <span>{data.opex_ratio.toFixed(1)}%</span>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${data.net_cash_flow >= 0 ? 'from-emerald-500 to-teal-600' : 'from-amber-500 to-orange-600'} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
          <div className="absolute right-[-10px] bottom-[-10px] text-8xl opacity-10 pointer-events-none">📈</div>
          <p className="text-sm font-medium opacity-80">Net Cash Flow (Net Income)</p>
          <h3 className="text-3xl font-extrabold mt-2">{formatCurrency(data.net_cash_flow)}</h3>
          <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs font-semibold opacity-90">
            <span>Status Kas Operasional:</span>
            <span>{data.net_cash_flow >= 0 ? 'SURPLUS' : 'DEFISIT'}</span>
          </div>
        </div>
      </div>

      {/* Balance Reconciliation Status (Latest Audit Status) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Status Saldo Riil Terkini (Rekonsiliasi)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Hasil audit fisik terakhir pada tanggal: <strong>{data.last_check_date ? formatDate(data.last_check_date) : 'Belum pernah di-audit'}</strong>
            </p>
          </div>
          {(data.difference_cash !== 0 || data.difference_rekening !== 0) && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold animate-pulse">
              <span>⚠️ Terdeteksi Selisih Saldo</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cash Ledger Audit status */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-2">
              <span className="text-base">💵</span> Saldo Kas Fisik (Cash Drawer)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Buku Sistem</span>
                <p className="text-sm font-bold text-slate-950 dark:text-white mt-1">{formatCurrency(data.expected_cash)}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fisik Riil</span>
                <p className="text-sm font-bold text-slate-950 dark:text-white mt-1">{formatCurrency(data.actual_cash)}</p>
              </div>
              <div className={`p-3 rounded-xl ${data.difference_cash === 0 ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'}`}>
                <span className="text-xs font-semibold block">Selisih</span>
                <p className="text-sm font-extrabold mt-1">
                  {data.difference_cash > 0 ? '+' : ''}{formatCurrency(data.difference_cash)}
                </p>
              </div>
            </div>
          </div>

          {/* Rekening Ledger Audit status */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-50 dark:border-slate-850 pb-2">
              <span className="text-base">🏦</span> Saldo Rekening Bank (QRIS & Transfer)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Buku Sistem</span>
                <p className="text-sm font-bold text-slate-950 dark:text-white mt-1">{formatCurrency(data.expected_rekening)}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Statement Riil</span>
                <p className="text-sm font-bold text-slate-950 dark:text-white mt-1">{formatCurrency(data.actual_rekening)}</p>
              </div>
              <div className={`p-3 rounded-xl ${data.difference_rekening === 0 ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300'}`}>
                <span className="text-xs font-semibold block">Selisih</span>
                <p className="text-sm font-extrabold mt-1">
                  {data.difference_rekening > 0 ? '+' : ''}{formatCurrency(data.difference_rekening)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Cash Flow Performance Trend Chart */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aliran Saldo Harian (Sales vs Expenses)</h3>
            <p className="text-xs text-slate-500">Menampilkan tren pendapatan dan pengeluaran harian operasional toko.</p>
          </div>
          
          <div className="w-full h-80">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatRechartsCurrency}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <RechartsTooltip
                    formatter={(value: any) => [formatCurrency(value), '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area name="Sales / Saldo Masuk" type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  <Area name="Expenses / Saldo Keluar" type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Tidak ada data tren untuk periode ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Donut Charts and Expenses Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Payment Method */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <SimpleDonutChart
            data={salesShareData}
            title="Breakdown Saldo Masuk (Sales)"
            formatValue={formatCurrency}
          />
        </div>

        {/* Expenses by Payment Method */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <SimpleDonutChart
            data={expensesShareData}
            title="Breakdown Saldo Keluar (Expense)"
            formatValue={formatCurrency}
          />
        </div>

        {/* Top Expense Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Alokasi Beban Biaya</h3>
            <p className="text-xs text-slate-500">Kategori pengeluaran operasional & bahan baku terbesar.</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-1">
            {data.top_expense_categories && data.top_expense_categories.length > 0 ? (
              data.top_expense_categories.map((item, i) => {
                const totalExpVal = data.total_expenses || 1;
                const percentage = (item.amount / totalExpVal) * 100;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{item.category}</span>
                      <span className="text-slate-950 dark:text-white">{formatCurrency(item.amount)} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Belum ada data pengeluaran.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reconciliation Audit Log History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Riwayat Audit & Rekonsiliasi Saldo</h3>
            <p className="text-xs text-slate-500">Log verifikasi kecocokan kas fisik dan rekening bank.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Waktu Audit</th>
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Kas Fisik (Sistem vs Riil)</th>
                <th className="px-6 py-4">Kas Rekening (Sistem vs Riil)</th>
                <th className="px-6 py-4">Selisih Kas</th>
                <th className="px-6 py-4">Selisih Rekening</th>
                <th className="px-6 py-4">Auditor</th>
                <th className="px-6 py-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
              {checks.length > 0 ? (
                checks.map((check) => {
                  const hasDiscrepancy = check.difference_cash !== 0 || check.difference_rekening !== 0;
                  return (
                    <tr key={check.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-950 dark:text-white">
                        {formatDate(check.created_at)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {check.start_date.split('T')[0]} s/d {check.end_date.split('T')[0]}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500">{formatCurrency(check.expected_cash)}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(check.actual_cash)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500">{formatCurrency(check.expected_rekening)}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(check.actual_rekening)}</span>
                      </td>
                      <td className={`px-6 py-4 font-bold ${check.difference_cash === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {check.difference_cash > 0 ? '+' : ''}{formatCurrency(check.difference_cash)}
                      </td>
                      <td className={`px-6 py-4 font-bold ${check.difference_rekening === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {check.difference_rekening > 0 ? '+' : ''}{formatCurrency(check.difference_rekening)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-300">
                        {check.checked_by?.full_name || check.checked_by?.username || 'System'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={check.notes}>
                        {check.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500 dark:text-slate-400">
                    Belum ada riwayat audit keuangan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalChecks > 8 && (
          <div className="p-4 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Menampilkan {checks.length} dari {totalChecks} riwayat audit
            </span>
            <div className="flex gap-2">
              <button
                disabled={checksPage === 1}
                onClick={() => setChecksPage(prev => prev - 1)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                disabled={checksPage * 8 >= totalChecks}
                onClick={() => setChecksPage(prev => prev + 1)}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Reconciliation Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Rekonsiliasi & Audit Saldo Toko</h3>
                <p className="text-xs text-slate-500 mt-0.5">Bandingkan saldo teoritis sistem dengan perhitungan aktual di lapangan.</p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAuditSubmit}>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Mulai Audit</label>
                    <input
                      type="date"
                      required
                      value={auditStartDate}
                      onChange={(e) => setAuditStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Akhir Audit</label>
                    <input
                      type="date"
                      required
                      value={auditEndDate}
                      onChange={(e) => setAuditEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none"
                    />
                  </div>
                </div>

                {auditLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 mt-3 font-semibold">Mengambil data transaksi sistem...</p>
                  </div>
                ) : auditError ? (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl text-xs font-semibold text-red-700 dark:text-red-300">
                    {auditError}
                  </div>
                ) : auditSummary ? (
                  <div className="space-y-6">
                    {/* Period flow summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Saldo Awal Kas</span>
                        <p className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-0.5">{formatCurrency(auditSummary.starting_cash)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Saldo Awal Rekening</span>
                        <p className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-0.5">{formatCurrency(auditSummary.starting_rekening)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Pemasukan (Sales)</span>
                        <p className="text-sm font-bold text-green-600 mt-0.5">+{formatCurrency(auditSummary.sales_cash + auditSummary.sales_rekening)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Pengeluaran</span>
                        <p className="text-sm font-bold text-red-500 mt-0.5">-{formatCurrency(auditSummary.expenses_cash + auditSummary.expenses_rekening)}</p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Cash Input */}
                      <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          💵 Kas Fisik Toko
                        </h4>
                        <div>
                          <span className="text-xs text-slate-500 block">Ekspektasi Sistem (Saldo Akhir):</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{formatCurrency(auditSummary.expected_cash)}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Jumlah Fisik Aktual (Rp) *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={actualCash}
                            onChange={(e) => setActualCash(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className={`p-2 rounded-lg text-xs font-semibold ${actualCash - auditSummary.expected_cash === 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          Selisih: {actualCash - auditSummary.expected_cash > 0 ? '+' : ''}{formatCurrency(actualCash - auditSummary.expected_cash)}
                        </div>
                      </div>

                      {/* Rekening Input */}
                      <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          🏦 Saldo Bank (Rekening)
                        </h4>
                        <div>
                          <span className="text-xs text-slate-500 block">Ekspektasi Sistem (Saldo Akhir):</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{formatCurrency(auditSummary.expected_rekening)}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Jumlah Statement Aktual (Rp) *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={actualRekening}
                            onChange={(e) => setActualRekening(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className={`p-2 rounded-lg text-xs font-semibold ${actualRekening - auditSummary.expected_rekening === 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          Selisih: {actualRekening - auditSummary.expected_rekening > 0 ? '+' : ''}{formatCurrency(actualRekening - auditSummary.expected_rekening)}
                        </div>
                      </div>
                    </div>

                    {/* Notes Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Catatan Reconcile / Alasan Selisih (jika ada)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Misal: Selisih Rp5,000 karena pembulatan cash kembalian customer."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs font-semibold">
                    Silakan tentukan range tanggal audit untuk memproses kalkulasi.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-150 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={auditLoading || auditSubmitLoading || !auditSummary}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-40"
                >
                  {auditSubmitLoading ? 'Menyimpan...' : 'Simpan Verifikasi Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
