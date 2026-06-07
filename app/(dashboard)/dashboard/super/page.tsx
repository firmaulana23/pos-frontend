'use client';

import { useEffect, useState } from 'react';
import { superAdminAPI, TenantAdmin, SuperAdminStats } from '@/app/lib/api';
import { useProtectedRoute } from '@/app/lib/auth';
import { Card, Button, Stat, LoadingSkeleton } from '@/app/components/ui';

export default function SuperAdminPage() {
  const { isLoading: authLoading } = useProtectedRoute('admin');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [tenants, setTenants] = useState<TenantAdmin[]>([]);
  const [search, setSearch] = useState('');
  
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setError('');
      const [statsData, tenantsData] = await Promise.all([
        superAdminAPI.getStats(),
        superAdminAPI.getTenants(),
      ]);
      setStats(statsData);
      setTenants(tenantsData);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data administrasi SaaS.');
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

  const handleSuspend = async (tenantId: number) => {
    if (!confirm('Apakah Anda yakin ingin menangguhkan (suspend) toko ini? Toko tidak akan bisa diakses oleh staff.')) return;
    
    setError('');
    setSuccess('');
    setActionLoading(tenantId);
    try {
      await superAdminAPI.suspendTenant(tenantId);
      setSuccess('Toko berhasil ditangguhkan.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal menangguhkan toko.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (tenantId: number) => {
    setError('');
    setSuccess('');
    setActionLoading(tenantId);
    try {
      await superAdminAPI.activateTenant(tenantId);
      setSuccess('Toko berhasil diaktifkan kembali.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Gagal mengaktifkan toko.');
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

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(search.toLowerCase()) ||
    t.owner_email.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Super Admin</h1>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Super Admin Portal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Panel administrasi pusat untuk memantau pendaftaran toko POS, pendapatan MRR platform, dan memoderasi akses tenant.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
          <p className="text-red-800 dark:text-red-200 text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 rounded-xl">
          <p className="text-green-800 dark:text-green-200 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Stat
          label="Total Toko Terdaftar"
          value={stats?.total_tenants || 0}
          icon="🏢"
        />
        <Stat
          label="Toko Aktif (Paid)"
          value={stats?.active_tenants || 0}
          icon="✅"
        />
        <Stat
          label="Toko Masa Trial"
          value={stats?.trial_tenants || 0}
          icon="⏳"
        />
        <Stat
          label="Toko Ditangguhkan"
          value={stats?.suspended_tenants || 0}
          icon="🚫"
        />
        <div className="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <p className="text-sm text-blue-100 font-semibold">Estimasi MRR Platform</p>
          <p className="text-2xl font-black mt-2">
            {formatCurrency(stats?.estimated_mrr || 0)}
          </p>
          <span className="text-xs text-blue-100 block mt-2 opacity-85">Monthly Recurring Revenue</span>
        </div>
      </div>

      {/* Tenants Moderation Table Card */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Daftar Toko / Tenants</h3>
          <input
            type="text"
            className="input-field max-w-sm text-sm"
            placeholder="Cari nama toko, subdomain, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
          {filteredTenants.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              Tidak ada toko yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs uppercase font-extrabold border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4">Toko / Subdomain</th>
                    <th className="px-6 py-4">Pemilik & Email</th>
                    <th className="px-6 py-4">Paket Aktif</th>
                    <th className="px-6 py-4">Masa Aktif</th>
                    <th className="px-6 py-4">Tanggal Registrasi</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredTenants.map((row) => {
                    const registerDate = new Date(row.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' });
                    const hasActiveSubscription = row.subscription && row.subscription.status === 'active';
                    
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{row.name}</p>
                          <span className="font-mono text-xs text-blue-500 hover:underline">
                            {row.subdomain}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-700 dark:text-slate-300 font-medium">Email Pemilik</p>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{row.owner_email}</span>
                        </td>
                        <td className="px-6 py-4 capitalize font-semibold text-slate-700 dark:text-slate-300">
                          {row.plan?.name || 'Trial'}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {row.status === 'trial' && row.trial_ends_at ? (
                            <span>Trial s/d {new Date(row.trial_ends_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                          ) : row.subscription?.end_date ? (
                            <span>Exp s/d {new Date(row.subscription.end_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {registerDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${row.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200' : row.status === 'trial' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200' : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {row.status === 'suspended' ? (
                            <Button
                              onClick={() => handleActivate(row.id)}
                              variant="primary"
                              size="sm"
                              isLoading={actionLoading === row.id}
                              disabled={actionLoading !== null}
                            >
                              Aktifkan
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleSuspend(row.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                              isLoading={actionLoading === row.id}
                              disabled={actionLoading !== null}
                            >
                              Suspend
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
