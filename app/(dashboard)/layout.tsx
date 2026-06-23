'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/auth';
import { authAPI } from '@/app/lib/api';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const allNavItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard', badge: null, roles: ['admin', 'manager', 'cashier'] },
  { href: '/dashboard/pos', icon: '🛒', label: 'POS', badge: null, roles: ['admin', 'manager', 'cashier'] },
  { href: '/dashboard/transactions', icon: '💳', label: 'Transactions', badge: null, roles: ['admin', 'manager', 'cashier'] },
  { href: '/dashboard/menu', icon: '🍽️', label: 'Menu', badge: null, roles: ['admin', 'manager'] },
  { href: '/dashboard/reports', icon: '📈', label: 'Reports', badge: null, roles: ['admin', 'manager'] },
  { href: '/dashboard/finance', icon: '💸', label: 'Finance', badge: null, roles: ['admin'] },
  { href: '/dashboard/expenses', icon: '💰', label: 'Expenses', badge: null, roles: ['admin', 'manager'] },
  { href: '/dashboard/stock', icon: '📦', label: 'Stock', badge: null, roles: ['admin', 'manager'] },
  { href: '/dashboard/promos', icon: '🎟️', label: 'Promos', badge: null, roles: ['admin', 'manager', 'cashier'] },
  { href: '/dashboard/members', icon: '🧑‍🤝‍🧑', label: 'Members', badge: null, roles: ['admin', 'manager', 'cashier'] },
  { href: '/dashboard/users', icon: '👥', label: 'Users', badge: null, roles: ['admin'] },
  { href: '/dashboard/settings', icon: '⚙️', label: 'Settings', badge: null, roles: ['admin'] },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navItems, setNavItems] = useState(allNavItems);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordFormData.old_password || !passwordFormData.new_password || !passwordFormData.confirm_password) {
      setPasswordError('Silakan isi semua bidang');
      return;
    }
    if (passwordFormData.new_password.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return;
    }
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      setPasswordError('Konfirmasi password baru tidak cocok');
      return;
    }

    try {
      setSubmittingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      await authAPI.changePassword(passwordFormData);
      setPasswordSuccess('Password berhasil diubah!');
      setPasswordFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  useEffect(() => {
    if (user) {
      setNavItems(allNavItems.filter(item => item.roles.includes(user.role)));
    }
  }, [user]);


  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">POS</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="font-medium flex-1">{item.label}</span>
                    {item.badge && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{item.badge}</span>}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {(user?.username?.[0] || 'A').toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors text-center"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            </button>

            {/* User menu */}
            <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right cursor-pointer select-none" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-bold text-sm hover:opacity-90 transition-opacity focus:outline-none"
              >
                {(user?.username?.[0] || 'A').toUpperCase()}
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 py-2">
                    <button
                      onClick={() => {
                        setChangePasswordOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      🔑 Ganti Password
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors border-t border-slate-100 dark:border-slate-700"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </div>
      </div>

      {/* Change Password Modal */}
      {changePasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ganti Password</h3>
              <button 
                onClick={() => {
                  setChangePasswordOpen(false);
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }} 
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">{passwordSuccess}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password Saat Ini *
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="Password Saat Ini" 
                  value={passwordFormData.old_password} 
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, old_password: e.target.value })} 
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password Baru *
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="Password Baru (min 6 karakter)" 
                  value={passwordFormData.new_password} 
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, new_password: e.target.value })} 
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Password Baru *
                </label>
                <input 
                  type="password" 
                  required
                  placeholder="Konfirmasi Password Baru" 
                  value={passwordFormData.confirm_password} 
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, confirm_password: e.target.value })} 
                  className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }} 
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submittingPassword} 
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submittingPassword ? 'Memproses...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}