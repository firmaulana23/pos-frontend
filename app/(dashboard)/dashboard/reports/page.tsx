'use client';

import { useEffect, useState } from 'react';
import { reportAPI, FullReport } from '@/app/lib/api';
import { Card, Stat, LoadingSkeleton, Button, Input } from '@/app/components/ui';
import { SimpleDonutChart } from '@/app/components/charts';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateOnly = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ReportsPage() {
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'expenses' | 'promos_members' | 'stock'>('overview');

  // Pending states for custom filter range
  const [pendingStartDate, setPendingStartDate] = useState<string>('');
  const [pendingEndDate, setPendingEndDate] = useState<string>('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportAPI.getReport(startDate || undefined, endDate || undefined);
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const handleApplyFilter = () => {
    if (pendingStartDate && pendingEndDate) {
      setStartDate(pendingStartDate);
      setEndDate(pendingEndDate);
    }
  };

  const handleResetFilter = () => {
    setPendingStartDate('');
    setPendingEndDate('');
    setStartDate('');
    setEndDate('');
  };

  const setPresetRange = (preset: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    let start = new Date();
    
    if (preset === 'today') {
      start = today;
    } else if (preset === 'week') {
      start.setDate(today.getDate() - 7);
    } else if (preset === 'month') {
      start.setMonth(today.getMonth() - 1);
    } else if (preset === 'year') {
      start.setFullYear(today.getFullYear() - 1);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];
    
    setPendingStartDate(startStr);
    setPendingEndDate(endStr);
    setStartDate(startStr);
    setEndDate(endStr);
  };

  const handleDownload = async (format: 'pdf' | 'excel') => {
    try {
      setExporting(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const endpointPath = format === 'excel' ? 'excel' : 'pdf';
      const response = await fetch(`${BASE_URL}/report/download/${endpointPath}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`Export ${format.toUpperCase()} failed`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${startDate || 'all'}_${endDate || 'all'}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Download failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSkeleton count={5} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Comprehensive Reports</h2>
          <p className="text-slate-600 dark:text-slate-400">View detailed metrics, transactional data, promo logs, and inventory updates.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleDownload('pdf')}
            disabled={exporting}
            className="flex items-center gap-2 border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            📕 Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownload('excel')}
            disabled={exporting}
            className="flex items-center gap-2 border-green-200 text-green-600 dark:border-green-800 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20"
          >
            📗 Download Excel
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Preset Range:</span>
          {(['today', 'week', 'month', 'year'] as const).map(preset => (
            <button
              key={preset}
              onClick={() => setPresetRange(preset)}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              {preset === 'today' ? 'Hari Ini' : preset === 'week' ? '7 Hari Terakhir' : preset === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-end border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="w-44">
            <Input
              type="date"
              label="Mulai Tanggal"
              value={pendingStartDate}
              onChange={e => setPendingStartDate(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Input
              type="date"
              label="Sampai Tanggal"
              value={pendingEndDate}
              onChange={e => setPendingEndDate(e.target.value)}
            />
          </div>
          <Button onClick={handleApplyFilter} disabled={!pendingStartDate || !pendingEndDate}>Apply Filter</Button>
          {(startDate || endDate) && (
            <Button variant="outline" onClick={handleResetFilter}>Reset Filter</Button>
          )}
        </div>
        {report && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Periode Laporan: <strong className="text-slate-800 dark:text-slate-200">{report.period}</strong> | Dibuat: <strong className="text-slate-800 dark:text-slate-200">{report.generated_at}</strong>
          </div>
        )}
      </div>

      {error && (
        <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900">
          <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {(['overview', 'transactions', 'expenses', 'promos_members', 'stock'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 capitalize -mb-px ${activeTab === tab ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-bold' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            {tab.replace('_', ' & ')}
          </button>
        ))}
      </div>

      {report && (
        <div>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Stat
                  label="Total Transaksi"
                  value={report.sales_summary.total_transactions}
                  icon="📦"
                />
                <Stat
                  label="Pendapatan (Revenue)"
                  value={formatCurrency(report.sales_summary.total_revenue)}
                  icon="💵"
                />
                <Stat
                  label="Total Pengeluaran"
                  value={formatCurrency(report.expense_total)}
                  icon="💸"
                />
                <Stat
                  label="Estimasi Laba Bersih"
                  value={formatCurrency(report.sales_summary.total_revenue - report.expense_total)}
                  icon="📈"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Details</h3>} className="lg:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-xs text-slate-500">Sub Total</span>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(report.sales_summary.total_sub_total)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-xs text-slate-500">Total Pajak</span>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(report.sales_summary.total_tax)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="text-xs text-slate-500">Total Diskon</span>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(report.sales_summary.total_discount)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-xs text-blue-600 dark:text-blue-400">Total Nilai Redeem Member</span>
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{formatCurrency(report.redeem_summary.total_item_value)}</p>
                    </div>
                  </div>
                </Card>

                {report.payment_method_breakdown && report.payment_method_breakdown.length > 0 && (
                  <SimpleDonutChart
                    title="Payment Methods breakdown"
                    data={report.payment_method_breakdown.map(pm => ({
                      label: pm.payment_method,
                      value: pm.total
                    }))}
                    formatValue={formatCurrency}
                  />
                )}
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Logs</h3>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">No Transaksi</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Tanggal</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Customer</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Kasir</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Member / Promo</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Subtotal</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Discount</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Total</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Metode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-slate-500">No transactions recorded for this period.</td>
                      </tr>
                    ) : (
                      report.transactions.map(t => (
                        <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{t.transaction_no}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.created_at ? formatDate(t.created_at) : '-'}</td>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{t.customer_name || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.member?.full_name || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {t.member && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-1">M: {t.member.full_name}</span>}
                            {t.member_id && !t.member && <span className="text-xs text-slate-400">ID: {t.member_id}</span>}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(t.sub_total)}</td>
                          <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">{formatCurrency(t.discount)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-50">{formatCurrency(t.total)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">{t.payment_method}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* EXPENSES TAB */}
          {activeTab === 'expenses' && (
            <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Expense Details</h3>}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Tanggal</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Tipe</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Kategori</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Deskripsi</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Jumlah</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Metode Bayar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.expenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No expenses recorded for this period.</td>
                      </tr>
                    ) : (
                      report.expenses.map(e => (
                        <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDateOnly(e.date)}</td>
                          <td className="px-4 py-3 capitalize font-medium">{e.type.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{e.category}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{e.description || '-'}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-50">{formatCurrency(e.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase">{e.payment_method}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* PROMOS & MEMBERS TAB */}
          {activeTab === 'promos_members' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Promo Activity */}
              <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Promo Usages</h3>}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Kode</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Promo</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Digunakan</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Total Diskon</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.promo_usage.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No promo usages recorded.</td>
                        </tr>
                      ) : (
                        report.promo_usage.map(p => (
                          <tr key={p.promo_id} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{p.promo_code}</td>
                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{p.promo_name}</td>
                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{p.used_count}x</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-50">{formatCurrency(p.total_discount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Member Activity */}
              <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Member Activities</h3>}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Nama</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">No Kartu</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Poin</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Total Belanja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.member_activity.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No member activity recorded.</td>
                        </tr>
                      ) : (
                        report.member_activity.map(m => (
                          <tr key={m.member_id} className="border-b border-slate-100 dark:border-slate-800">
                            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{m.full_name}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.card_number}</td>
                            <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">{m.points}</td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-50">{formatCurrency(m.total_spent)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* STOCK TAB */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              {/* Stock movement rekap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Stock Movement Summary</h3>}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Bahan Baku</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">Satuan</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white text-emerald-600 dark:text-emerald-400">Total Masuk</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white text-red-600 dark:text-red-400">Total Keluar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.stock_movements.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No stock movements recorded.</td>
                          </tr>
                        ) : (
                          report.stock_movements.map((sm, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{sm.raw_material}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold">{sm.unit}</span>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">+{sm.total_in}</td>
                              <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">-{sm.total_out}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Stock adjustments logs */}
                <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Stock Adjustments</h3>}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Tanggal</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Bahan Baku</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">Jumlah</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Alasan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.stock_adjustments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-slate-500">No stock adjustments made in this period.</td>
                          </tr>
                        ) : (
                          report.stock_adjustments.map((sa, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{sa.date}</td>
                              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-50">{sa.raw_material} <span className="text-xs text-slate-400">({sa.unit})</span></td>
                              <td className={`px-4 py-3 text-right font-bold ${sa.quantity < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {sa.quantity > 0 ? `+${sa.quantity}` : sa.quantity}
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{sa.reason || sa.notes || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Complete stock daily summaries */}
              <Card header={<h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Stock Summaries & Variances</h3>}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                        <th className="px-3 py-3 text-left font-semibold text-slate-900 dark:text-white">Tanggal</th>
                        <th className="px-3 py-3 text-left font-semibold text-slate-900 dark:text-white">Bahan Baku</th>
                        <th className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-white">Awal</th>
                        <th className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-white">Masuk</th>
                        <th className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-white">Tersedia</th>
                        <th className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-white">Akhir</th>
                        <th className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-white">Pakai (Aktual)</th>
                        <th className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-white">Pakai (Teori)</th>
                        <th className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-white">Adj</th>
                        <th className="px-3 py-3 text-right font-semibold text-slate-900 dark:text-white">Selisih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.stock_summaries.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-6 text-center text-slate-500">No stock summaries recorded for this period.</td>
                        </tr>
                      ) : (
                        report.stock_summaries.map((s, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{s.date}</td>
                            <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-50">{s.raw_material} <span className="text-xs text-slate-400">({s.unit})</span></td>
                            <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">{s.beginning_stock}</td>
                            <td className="px-3 py-3 text-center text-emerald-600 dark:text-emerald-400">+{s.receipts_in}</td>
                            <td className="px-3 py-3 text-center text-slate-600 dark:text-slate-300">{s.total_available}</td>
                            <td className="px-3 py-3 text-center font-semibold text-slate-900 dark:text-slate-50">{s.ending_stock}</td>
                            <td className="px-3 py-3 text-center text-slate-800 dark:text-slate-200">{s.daily_usage}</td>
                            <td className="px-3 py-3 text-center text-slate-500 dark:text-slate-400">{s.theoretical_usage}</td>
                            <td className="px-3 py-3 text-center text-amber-600">{s.adjustments}</td>
                            <td className="px-3 py-3 text-right">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${s.variance === 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : s.variance < 0 ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'}`}>
                                {s.variance > 0 ? `+${s.variance}` : s.variance}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
