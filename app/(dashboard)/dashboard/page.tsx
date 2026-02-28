'use client';

import { useEffect, useState } from 'react';
import { dashboardAPI, DashboardStats } from '@/app/lib/api';
import { Card, Stat, LoadingSkeleton } from '@/app/components/ui';
import { SimpleLineChart, SimpleBarChart, SimpleDonutChart } from '@/app/components/charts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return value.toLocaleString('id-ID');
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [prevStats, setPrevStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date ranges
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        let startDate: string | undefined;
        let endDate: string | undefined;
        let prevStartDate: string | undefined;
        let prevEndDate: string | undefined;

        if (dateRange === 'custom') {
          startDate = customStartDate;
          endDate = customEndDate;
          prevStartDate = undefined;
          prevEndDate = undefined;
        } else if (dateRange === 'today') {
          startDate = `${year}-${month}-${day}`;
          endDate = `${year}-${month}-${day}`;
          // Yesterday
          const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
          const yYear = yesterday.getFullYear();
          const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
          const yDay = String(yesterday.getDate()).padStart(2, '0');
          prevStartDate = `${yYear}-${yMonth}-${yDay}`;
          prevEndDate = `${yYear}-${yMonth}-${yDay}`;
        } else if (dateRange === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const weekAgoYear = weekAgo.getFullYear();
          const weekAgoMonth = String(weekAgo.getMonth() + 1).padStart(2, '0');
          const weekAgoDay = String(weekAgo.getDate()).padStart(2, '0');
          startDate = `${weekAgoYear}-${weekAgoMonth}-${weekAgoDay}`;
          endDate = `${year}-${month}-${day}`;
          // Previous week (7 days before)
          const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
          const twoWeeksAgoYear = twoWeeksAgo.getFullYear();
          const twoWeeksAgoMonth = String(twoWeeksAgo.getMonth() + 1).padStart(2, '0');
          const twoWeeksAgoDay = String(twoWeeksAgo.getDate()).padStart(2, '0');
          prevStartDate = `${twoWeeksAgoYear}-${twoWeeksAgoMonth}-${twoWeeksAgoDay}`;
          prevEndDate = `${weekAgoYear}-${weekAgoMonth}-${String(parseInt(weekAgoDay) - 1).padStart(2, '0')}`;
        } else if (dateRange === 'month') {
          startDate = `${year}-${month}-01`;
          endDate = `${year}-${month}-${day}`;
          // Previous month
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lYear = lastMonth.getFullYear();
          const lMonth = String(lastMonth.getMonth() + 1).padStart(2, '0');
          const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
          const lDay = String(lastDayLastMonth).padStart(2, '0');
          prevStartDate = `${lYear}-${lMonth}-01`;
          prevEndDate = `${lYear}-${lMonth}-${lDay}`;
        }

        // Fetch current period
        const currentData = await dashboardAPI.getStats(startDate, endDate);
        setStats(currentData);

        // Fetch previous period if not "all time" or "custom"
        if ((dateRange !== 'all' && dateRange !== 'custom') && prevStartDate && prevEndDate) {
          try {
            const previousData = await dashboardAPI.getStats(prevStartDate, prevEndDate);
            setPrevStats(previousData);
          } catch {
            setPrevStats(null);
          }
        } else {
          setPrevStats(null);
        }
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, customStartDate, customEndDate]);

  // Calculate trend value
  const calculateTrend = (current: number, previous: number | null | undefined): { value: number; isPositive: boolean } | null => {
    if (!previous || previous === 0) return null;
    const percentageChange = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(percentageChange)),
      isPositive: percentageChange >= 0,
    };
  };

  if (loading) {
    return <LoadingSkeleton count={4} />;
  }

  if (error) {
    return (
      <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900">
        <div className="flex items-start gap-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">Error Loading Dashboard</h3>
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">No data available</p>
      </div>
    );
  }

  // Prepare chart data
  const salesChartData = (stats.sales_chart || []).map((item) => ({
    label: new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    value: item.amount,
  }));

  const topItemsData = (stats.top_menu_items || []).map((item) => ({
    label: item.name,
    value: item.total_sold,
  }));

  // Transform payment method data with colors
  const paymentMethodsData = (stats.sales_by_payment_method || []).map((item, index) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
    return {
      label: item.payment_method.charAt(0).toUpperCase() + item.payment_method.slice(1),
      value: item.total_sales,
      color: colors[index % colors.length],
    };
  });

  return (
    <div className="space-y-8">
      {/* Header with date filter */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard Analytics
          </h2>
          <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your business overview.</p>
        </div>

        {/* Date Filter Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filter by Date</h3>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setDateRange(range);
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${dateRange === range
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {range === 'all' ? 'All Time' : range === 'today' ? 'Today' : range === 'week' ? 'Last 7 Days' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Custom date range */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Or select custom range:</p>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    if (dateRange !== 'custom') {
                      setDateRange('custom');
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    if (dateRange !== 'custom') {
                      setDateRange('custom');
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
                />
              </div>
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setDateRange('all');
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 font-medium transition-colors duration-200"
              >
                Reset
              </button>
            </div>

            {/* Selected date range display */}
            {dateRange === 'custom' && customStartDate && customEndDate && (
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  📅 Selected: <strong>{customStartDate}</strong> to <strong>{customEndDate}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key metrics - grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          label="Total Sales"
          value={formatCurrency(stats.total_sales)}
          // icon="💰"
          trend={calculateTrend(stats.total_sales, prevStats?.total_sales)}
        />
        <Stat
          label="Gross Profit"
          value={formatCurrency(stats.gross_profit)}
          // icon="📈"
          trend={calculateTrend(stats.gross_profit, prevStats?.gross_profit)}
        />
        <Stat
          label="Net Profit"
          value={formatCurrency(stats.net_profit)}
          // icon="💎"
          trend={calculateTrend(stats.net_profit, prevStats?.net_profit)}
        />
        <Stat
          label="Profit Margin"
          value={`${stats.gross_margin_percent.toFixed(1)}%`}
          // icon="📊"
          trend={calculateTrend(stats.gross_margin_percent, prevStats?.gross_margin_percent)}
        />
      </div>

      {/* Orders overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatNumber(stats.total_orders)}</p>
            </div>
            <div className="text-4xl bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">📦</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Paid Orders</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatNumber(stats.paid_orders)}</p>
            </div>
            <div className="text-4xl bg-green-100 dark:bg-green-900 p-4 rounded-lg">✅</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{formatNumber(stats.pending_orders)}</p>
            </div>
            <div className="text-4xl bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">⏳</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Expenses</p>
              <p className="text-3xl font-bold text-black dark:text-white mt-2">{formatCurrency(stats.total_operational_expenses + stats.total_raw_material_expenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card header={<h3 className="text-lg font-semibold">Sales Trend</h3>}>
            <SimpleLineChart data={salesChartData} color="#3b82f6" />
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold mb-6">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Sales</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(stats.total_sales)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total COGS</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(stats.total_cogs)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
              <span className="text-sm text-green-900 dark:text-green-200 font-medium">Gross Profit</span>
              <span className="font-semibold text-green-900 dark:text-green-200">{formatCurrency(stats.gross_profit)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Operational Expenses</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(stats.total_operational_expenses)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400">Raw Material Expenses</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(stats.total_raw_material_expenses)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
              <span className="text-sm text-blue-900 dark:text-blue-200 font-medium">Net Profit</span>
              <span className="font-semibold text-blue-900 dark:text-blue-200">{formatCurrency(stats.net_profit)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart data={topItemsData} title="Top Selling Menu Items" color="#8b5cf6" />

        {/* Payment methods distribution */}
        <SimpleDonutChart
          data={paymentMethodsData}
          title="Sales by Payment Method"
          formatValue={formatCurrency}
        />
      </div>
    </div>
  );
}