'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const starterPrice = cycle === 'monthly' ? 100000 : 1000000;
  const proPrice = cycle === 'monthly' ? 250000 : 2500000;
  const enterprisePrice = cycle === 'monthly' ? 750000 : 7500000;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Ambient background glow spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-radial from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-radial from-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            ⚡
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            POS SaaS Platform
          </span>
        </div>
        
        <div>
          {isAuthenticated ? (
            <Link 
              href="/dashboard" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Ke Dashboard <span className="text-xs">➔</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="px-5 py-2.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-slate-700 text-slate-100 font-semibold rounded-xl text-sm transition-all duration-200 inline-flex items-center gap-2"
            >
              Login Toko <span className="text-xs">➔</span>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-12 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-20">
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
            Platform POS Modern untuk <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Bisnis Coffee Shop Anda
            </span>
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Kelola penjualan kasir, meja, program loyalitas member, diskon promo, pengeluaran operasional, 
            dan pantau rekap bahan baku secara real-time dari satu sistem multi-tenant terisolasi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              href="/register" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-blue-500/20"
            >
              Mulai Trial Gratis 14 Hari <span>➔</span>
            </Link>
          </div>
        </div>

        {/* Hero image mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition duration-500"></div>
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80" 
              alt="POS Dashboard Mockup" 
              className="relative max-w-full rounded-2xl border border-slate-800 shadow-2xl object-cover aspect-[4/3] w-[450px]"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20 relative z-20 border-t border-slate-900">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Fitur Unggulan Platform
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Sistem terintegrasi yang dirancang untuk mempercepat transaksi dan meningkatkan efisiensi operasional kafe Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-8 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-blue-500/30 hover:bg-slate-900/60 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 text-2xl font-bold mb-6">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Sangat Cepat & Responsif</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Proses transaksi penjualan kasir instan dengan struk digital. Dirancang responsif dan optimal untuk melayani antrean padat kafe Anda.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-blue-500/30 hover:bg-slate-900/60 transition-all duration-300">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 text-2xl font-bold mb-6">
              📊
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Laporan Keuangan COGS (HPP)</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Pantau laporan omzet harian, analisis profit kotor & bersih, serta nilai HPP produk otomatis untuk perhitungan margin bisnis akurat.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-blue-500/30 hover:bg-slate-900/60 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 text-2xl font-bold mb-6">
              📦
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Manajemen Bahan Baku & Resep</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              Sambungkan menu makanan/minuman dengan stok bahan baku secara langsung. Pengurangan otomatis saat menu laku terjual.
            </p>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-20 relative z-20 border-t border-slate-900">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Paket Harga Pilihan
            </h2>
            <p className="text-slate-400 max-w-xl">
              Pilih paket langganan yang paling sesuai dengan skala dan jumlah cabang operasional kafe Anda.
            </p>
          </div>

          {/* Billing Toggle Slider */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-xl self-center md:self-end">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${cycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${cycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tahunan (Hemat 15%+)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: Starter */}
          <div className="p-8 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-400">Starter</h4>
                <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-1">
                  {formatCurrency(starterPrice)}
                  <span className="text-xs text-slate-500 font-medium">/{cycle === 'monthly' ? 'bln' : 'thn'}</span>
                </div>
              </div>
              
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Maks. 200 Produk</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Maks. 10 Kasir / Staf</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Maks. 3 Outlet Cabang</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Laporan Penjualan & Margin HPP</span>
                </li>
              </ul>
            </div>
            
            <Link 
              href="/register" 
              className="mt-8 px-5 py-3 w-full bg-slate-900 border border-slate-800 text-white font-semibold text-center rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-colors"
            >
              Mulai Trial Starter
            </Link>
          </div>

          {/* Card 2: Pro */}
          <div className="p-8 bg-indigo-950/20 border-2 border-indigo-500/40 rounded-2xl flex flex-col justify-between hover:bg-indigo-950/30 transition-all duration-300 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-extrabold text-xs px-3.5 py-1 rounded-full shadow-lg">
              Paling Populer
            </span>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-indigo-400">Pro</h4>
                <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-1">
                  {formatCurrency(proPrice)}
                  <span className="text-xs text-slate-500 font-medium">/{cycle === 'monthly' ? 'bln' : 'thn'}</span>
                </div>
              </div>
              
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Maks. 1.000 Produk</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Maks. 30 Kasir / Staf</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Maks. 10 Outlet Cabang</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Laporan Penjualan & Margin HPP</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Support Prioritas 24/7</span>
                </li>
              </ul>
            </div>
            
            <Link 
              href="/register" 
              className="mt-8 px-5 py-3 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-center rounded-xl transition-all shadow-lg shadow-blue-500/10"
            >
              Mulai Trial Pro
            </Link>
          </div>

          {/* Card 3: Enterprise */}
          <div className="p-8 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col justify-between hover:border-slate-800 hover:bg-slate-900/60 transition-all duration-300">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-400">Enterprise</h4>
                <div className="text-3xl font-black text-white mt-2 flex items-baseline gap-1">
                  {formatCurrency(enterprisePrice)}
                  <span className="text-xs text-slate-500 font-medium">/{cycle === 'monthly' ? 'bln' : 'thn'}</span>
                </div>
              </div>
              
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Produk Tak Terbatas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Kasir / Staf Tak Terbatas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Outlet Cabang Tak Terbatas</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Laporan Penjualan & Margin HPP</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-blue-500">✓</span>
                  <span>Dedicated Account Manager</span>
                </li>
              </ul>
            </div>
            
            <Link 
              href="/register" 
              className="mt-8 px-5 py-3 w-full bg-slate-900 border border-slate-800 text-white font-semibold text-center rounded-xl hover:bg-slate-800 hover:border-slate-700 transition-colors"
            >
              Mulai Trial Enterprise
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 sm:px-8 py-10 border-t border-slate-900/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 relative z-20">
        <div>
          &copy; 2026 POS SaaS Platform. Hak Cipta Dilindungi.
        </div>
        <div className="flex items-center gap-1">
          Made with <span className="text-red-500">♥</span> in Jakarta
        </div>
      </footer>

    </div>
  );
}
