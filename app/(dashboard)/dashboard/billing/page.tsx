'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { saasAPI, Plan, Subscription, SubscriptionHistory } from '@/app/lib/api';
import { useProtectedRoute } from '@/app/lib/auth';
import { Card, Button, LoadingSkeleton } from '@/app/components/ui';

declare global {
  interface Window {
    snap: any;
  }
}

export default function BillingPage() {
  const { isLoading: authLoading } = useProtectedRoute('admin');
  
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Fetch all subscription billing page data
  const fetchData = async () => {
    try {
      setError('');
      const [subData, plansData, historyData] = await Promise.all([
        saasAPI.getActiveSubscription(),
        saasAPI.getPlans(),
        saasAPI.getSubscriptionHistory().catch(() => []), // fallback if history empty
      ]);
      setSubscription(subData);
      setPlans(plansData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat informasi langganan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  const handleUpgrade = async (planId: number) => {
    setError('');
    setPaymentSuccess('');
    setActionLoading(planId);
    
    try {
      const response = await saasAPI.upgradeSubscription(planId, cycle);
      
      if (typeof window !== 'undefined' && window.snap) {
        window.snap.pay(response.snap_token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            setPaymentSuccess('Pembayaran Anda berhasil diproses! Memperbarui status langganan...');
            fetchData();
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            setError('Pembayaran Anda tertunda. Silakan selesaikan pembayaran sesuai petunjuk.');
          },
          onError: (result: any) => {
            console.error('Payment error:', result);
            setError('Pembayaran gagal. Silakan coba kembali.');
          },
          onClose: () => {
            console.log('Payment popup closed');
          }
        });
      } else {
        // Fallback to direct redirect URL if snap.js is not loaded
        window.location.href = response.redirect_url;
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengajukan upgrade langganan.');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Langganan & Billing</h1>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  // Calculate product usage percentages
  const productUsage = subscription?.usage?.products_count || 0;
  const productLimit = subscription?.plan?.max_products || 0;
  const productPercent = productLimit > 0 ? Math.min(100, (productUsage / productLimit) * 100) : 0;

  const userUsage = subscription?.usage?.users_count || 0;
  const userLimit = subscription?.plan?.max_users || 0;
  const userPercent = userLimit > 0 ? Math.min(100, (userUsage / userLimit) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Midtrans Snap JS Script */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'Mid-client-Xo0mIsbX5oLYFoFQ'}
        strategy="afterInteractive"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Langganan & Paket</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola langganan toko, kuota resource, dan billing pembayaran Anda secara mandiri.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
          <p className="text-red-800 dark:text-red-200 text-sm font-semibold">{error}</p>
        </div>
      )}

      {paymentSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 rounded-xl animate-pulse">
          <p className="text-green-800 dark:text-green-200 text-sm font-semibold">{paymentSuccess}</p>
        </div>
      )}

      {/* Top Section: Active Plan & Realtime Resource Usage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Plan Detail Card */}
        <Card className="lg:col-span-1 border-blue-100 dark:border-blue-900/40 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-wider font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 px-2.5 py-1 rounded-full">
              Paket Saat Ini
            </span>
            <span className={`w-3.5 h-3.5 rounded-full ${subscription?.status === 'active' || subscription?.status === 'suspended' ? 'bg-green-500' : 'bg-yellow-500 animate-ping'}`} title={subscription?.status}></span>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize">
            {subscription?.plan?.name || 'Trial'}
          </h2>
          
          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{subscription?.status || 'trial'}</span>
            </div>
            
            {subscription?.trial_ends_at ? (
              <div className="flex justify-between">
                <span>Masa Uji Coba (Trial):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(subscription.trial_ends_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </span>
              </div>
            ) : subscription?.end_date ? (
              <div className="flex justify-between">
                <span>Masa Aktif Berakhir:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(subscription.end_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </span>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Realtime Usage Card */}
        <Card className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Batas Penggunaan Sumber Daya</h3>
          
          {/* Products Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Katalog Menu / Produk</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {productUsage} / {productLimit === 0 ? 'Tak Terbatas' : productLimit} Produk
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${productPercent > 90 ? 'bg-red-500' : productPercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                style={{ width: `${productPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Users Usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Pengguna Staf / Kasir</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {userUsage} / {userLimit === 0 ? 'Tak Terbatas' : userLimit} Staff
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${userPercent > 90 ? 'bg-red-500' : userPercent > 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                style={{ width: `${userPercent}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pricing Upgrade Grid Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pilihan Paket Langganan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upgrade paket Anda untuk meningkatkan kuota produk, jumlah kasir, dan membuka fitur laporan.
            </p>
          </div>
          
          {/* Cycle Toggle Slider */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start sm:self-center border border-slate-200 dark:border-slate-700/50">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${cycle === 'monthly' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${cycle === 'yearly' ? 'bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
            >
              Tahunan (Hemat 15%+)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans
            .filter((p) => p.name.toLowerCase() !== 'trial')
            .map((plan) => {
              const isCurrent = subscription?.plan_id === plan.id;
              const price = cycle === 'monthly' ? plan.monthly_price : plan.yearly_price;
              
              return (
                <Card
                  key={plan.id}
                  className={`flex flex-col justify-between border-2 transition-all duration-300 hover:scale-[1.02] ${isCurrent ? 'border-blue-500 shadow-lg dark:bg-slate-900/60 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div className="space-y-4">
                    {/* Badge */}
                    <div className="flex justify-between items-center">
                      <h4 className="text-xl font-extrabold capitalize text-slate-900 dark:text-white">
                        {plan.name}
                      </h4>
                      {isCurrent && (
                        <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="py-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        /{cycle === 'monthly' ? 'bulan' : 'tahun'}
                      </span>
                    </div>

                    {/* Feature limits */}
                    <ul className="space-y-3 pt-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-center gap-2.5">
                        <span className="text-blue-500">✓</span>
                        <span>Maks <strong>{plan.max_products === 0 ? 'Tak Terbatas' : plan.max_products}</strong> Produk</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="text-blue-500">✓</span>
                        <span>Maks <strong>{plan.max_users === 0 ? 'Tak Terbatas' : plan.max_users}</strong> Staf</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className="text-blue-500">✓</span>
                        <span>Maks <strong>{plan.max_outlets === 0 ? 'Tak Terbatas' : plan.max_outlets}</strong> Outlet</span>
                      </li>
                      <li className="flex items-center gap-2.5">
                        <span className={plan.has_reporting ? 'text-blue-500' : 'text-slate-300 dark:text-slate-700 line-through'}>
                          {plan.has_reporting ? '✓' : '✗'}
                        </span>
                        <span className={plan.has_reporting ? '' : 'text-slate-400 line-through'}>
                          Fitur Laporan & Analisa Bisnis
                        </span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    variant={isCurrent ? 'outline' : 'primary'}
                    isLoading={actionLoading === plan.id}
                    className="w-full mt-6"
                    disabled={isCurrent || actionLoading !== null}
                  >
                    {isCurrent ? 'Paket Aktif Anda' : 'Berlangganan Sekarang'}
                  </Button>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Bottom Section: Payment History */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Riwayat Pembayaran</h3>
        <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Belum ada riwayat transaksi pembayaran.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs uppercase font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4">Nomor Transaksi</th>
                    <th className="px-6 py-4">Paket</th>
                    <th className="px-6 py-4">Jumlah</th>
                    <th className="px-6 py-4">Metode Bayar</th>
                    <th className="px-6 py-4">Tanggal Bayar</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {history.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                        {row.payment_no}
                      </td>
                      <td className="px-6 py-4 capitalize text-slate-700 dark:text-slate-300">
                        {row.plan_name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {row.payment_method || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {row.paid_at ? new Date(row.paid_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${row.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200' : row.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
