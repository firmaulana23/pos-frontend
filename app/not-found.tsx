import Link from 'next/link';
import { Button } from '@/app/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 dark:from-blue-900 dark:via-blue-950 dark:to-slate-950 px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-white opacity-20 mb-4">404</h1>
          <div className="text-6xl mb-6">🔍</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan. Kembali ke dashboard untuk melanjutkan.
          </p>

          <Link href="/dashboard" className="inline-block">
            <Button variant="primary" size="lg">
              Kembali ke Dashboard
            </Button>
          </Link>

          <Link href="/login" className="inline-block ml-3">
            <Button variant="outline" size="lg">
              Ke Halaman Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
