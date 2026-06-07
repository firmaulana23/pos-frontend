'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saasAPI } from '@/app/lib/api';
import { Input, Button } from '@/app/components/ui';

export default function RegisterPage() {
  const [storeName, setStoreName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerUsername, setOwnerUsername] = useState('');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [baseDomain, setBaseDomain] = useState('localhost:3000');
  
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.host; // e.g. "localhost:3000" or "192.168.1.141:3000"
      // If it's a tenant subdomain currently, strip it to show the main domain
      const parts = hostname.split('.');
      if (parts.length > 2 && hostname.includes('nip.io')) {
        setBaseDomain(parts.slice(1).join('.'));
      } else if (parts.length > 2 && !hostname.includes('nip.io') && !/^[0-9.:]+$/.test(hostname)) {
        setBaseDomain(parts.slice(1).join('.'));
      } else if (parts.length === 2 && parts[1].startsWith('localhost')) {
        setBaseDomain(parts[1]);
      } else {
        setBaseDomain(hostname);
      }
    }
  }, []);

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters and dashes
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (subdomain.length < 3) {
      setError('Subdomain harus memiliki minimal 3 karakter.');
      setLoading(false);
      return;
    }

    try {
      await saasAPI.registerTenant({
        store_name: storeName,
        subdomain,
        owner_email: ownerEmail,
        owner_username: ownerUsername,
        owner_full_name: ownerFullName,
        owner_password: ownerPassword,
      });

      setSuccess('Toko Anda berhasil didaftarkan! Mengalihkan ke toko baru Anda...');
      
      // Compute redirect URL to the new tenant's subdomain
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const protocol = window.location.protocol;
          const hostOnly = baseDomain.split(':')[0];
          const port = baseDomain.split(':')[1] ? `:${baseDomain.split(':')[1]}` : '';
          
          let redirectUrl = '';
          if (hostOnly === '192.168.1.141' || hostOnly === 'localhost') {
            if (hostOnly === 'localhost') {
              redirectUrl = `${protocol}//${subdomain}.localhost${port}/login`;
            } else {
              redirectUrl = `${protocol}//${subdomain}.${hostOnly}.nip.io${port}/login`;
            }
          } else {
            redirectUrl = `${protocol}//${subdomain}.${baseDomain}/login`;
          }
          window.location.href = redirectUrl;
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Subdomain mungkin sudah digunakan.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-950 dark:to-slate-950 px-4 py-12">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -top-40 -left-40 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -bottom-40 right-40 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -bottom-40 left-40 animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
          {/* Header Gradient banner */}
          <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center px-8 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
              <div>
                <h1 className="text-xl font-bold">POS SaaS Platform</h1>
                <p className="text-xs text-blue-100">Buat Toko POS Baru Anda Sekarang</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {/* Error & Success States */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 rounded-lg animate-pulse">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nama Toko"
                  type="text"
                  placeholder="Kopi Kulo"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  disabled={loading}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subdomain Toko
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="kopikulo"
                    value={subdomain}
                    onChange={handleSubdomainChange}
                    disabled={loading}
                    required
                  />
                  {subdomain && (
                    <p className="mt-1.5 text-xs text-blue-500 dark:text-blue-400 font-medium truncate">
                      URL Toko: <span className="underline">{subdomain}.{baseDomain}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 my-4 pt-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                  Akun Pemilik Toko (Admin)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap"
                    type="text"
                    placeholder="Muhamad Maulana"
                    value={ownerFullName}
                    onChange={(e) => setOwnerFullName(e.target.value)}
                    disabled={loading}
                    required
                  />

                  <Input
                    label="Username Admin"
                    type="text"
                    placeholder="admin_kopikulo"
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Email Pemilik"
                    type="email"
                    placeholder="owner@kopikulo.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    disabled={loading}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? 'Mendaftarkan Toko...' : 'Daftar & Mulai Trial 14 Hari'}
              </Button>
            </form>
          </div>

          <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
            <span className="text-slate-600 dark:text-slate-400">Sudah punya akun?</span>
            <a href="/login" className="text-blue-500 hover:text-blue-600 font-bold transition-colors">
              Masuk Toko
            </a>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
      `}</style>
    </div>
  );
}
