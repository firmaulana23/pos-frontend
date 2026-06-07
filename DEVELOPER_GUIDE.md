# Developer Quick Reference

## 🎯 Common Tasks

### Adding a New Dashboard Page

1. Create the folder: `app/(dashboard)/page-name/`
2. Create `page.tsx` inside that folder
3. Use the `useProtectedRoute()` hook to ensure authentication
4. The layout with sidebar will automatically wrap your page

```typescript
'use client';

import { useProtectedRoute } from '@/app/lib/auth';

export default function MyPage() {
  const { isLoading } = useProtectedRoute();
  
  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <div className="space-y-8">
      {/* Your content */}
    </div>
  );
}
```

### Making API Calls

```typescript
import { dashboardAPI, authAPI, menuAPI } from '@/app/lib/api';

// Dashboard stats
const stats = await dashboardAPI.getStats('2024-01-01', '2024-01-31');

// Menu items
const items = await menuAPI.getMenuItems(1);

// Add-ons
const addOns = await menuAPI.getAddOns();
```

### Using Auth Hook

```typescript
import { useAuth } from '@/app/lib/auth';

export default function Component() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      User: {user?.username}
      Role: {user?.role}
    </div>
  );
}
```

### Creating a Form Input

```typescript
import { Input } from '@/app/components/ui';

export default function MyForm() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  
  return (
    <Input
      label="Email"
      type="email"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      error={error}
      placeholder="Enter email"
    />
  );
}
```

### Creating a Button

```typescript
import { Button } from '@/app/components/ui';

export default function Component() {
  const [loading, setLoading] = useState(false);
  
  return (
    <>
      {/* Primary */}
      <Button variant="primary" onClick={handleClick}>
        Create
      </Button>
      
      {/* Secondary */}
      <Button variant="secondary">
        Cancel
      </Button>
      
      {/* Outline */}
      <Button variant="outline">
        Delete
      </Button>
      
      {/* Large with loading */}
      <Button size="lg" isLoading={loading}>
        Save
      </Button>
    </>
  );
}
```

### Displaying Metrics

```typescript
import { Stat } from '@/app/components/ui';

<Stat
  label="Total Revenue"
  value="Rp 1,250,000"
  icon="💰"
  trend={{ value: 15, isPositive: true }}
/>
```

### Creating a Chart

```typescript
import { SimpleLineChart } from '@/app/components/charts';

const data = [
  { label: 'Jan', value: 1000 },
  { label: 'Feb', value: 1500 },
  { label: 'Mar', value: 1200 },
];

<SimpleLineChart data={data} title="Sales" color="#3b82f6" />
```

### Formatting Numbers

```typescript
// Currency (IDR)
const formatted = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
}).format(1500000); // Rp 1.500.000

// Regular number
const num = (1500000).toLocaleString('id-ID'); // 1.500.000
```

## 📦 Available Components

### UI Components (`app/components/ui.tsx`)
- `Input` - Text input with label and error
- `Button` - Styled button with variants
- `Card` - Container with optional header
- `Stat` - Metric display card
- `LoadingSkeleton` - Loading placeholder

### Chart Components (`app/components/charts.tsx`)
- `SimpleLineChart` - Line trend chart
- `SimpleBarChart` - Horizontal bar chart
- `SimpleDonutChart` - Donut distribution chart

## 🎨 CSS Utilities

Available custom utilities in `globals.css`:

```typescript
// Buttons
className="btn-primary"    // Blue primary button
className="btn-secondary"  // Gray secondary button
className="btn-outline"    // Outlined button

// Cards
className="card"           // Card container
className="shadow-card"    // Shadow effect

// Inputs
className="input-field"    // Styled input field

// Text
className="text-primary"   // Primary color text
className="text-secondary" // Secondary color text

// Colors
className="bg-gradient-primary"  // Blue gradient
```

## 🌐 API Error Handling

```typescript
import { ApiError } from '@/app/lib/api';

try {
  const data = await dashboardAPI.getStats();
} catch (err: any) {
  const apiError: ApiError = err;
  console.log(apiError.message);   // Error message
  console.log(apiError.code);      // HTTP code
  console.log(apiError.details);   // Full response
}
```

## 🔐 Protected Routes

Routes inside `(dashboard)` folder are automatically protected:
- Checks for authentication token
- Redirects to login if not authenticated
- Shows dashboard layout with sidebar

Routes inside `(auth)` folder:
- Public routes (no protection)
- Used for login, signup, etc.

## 📱 Responsive Design

Tailwind breakpoints:
```
sm: 640px   (tablets)
md: 768px   (small devices)
lg: 1024px  (desktop)
xl: 1280px  (large desktop)
```

Usage:
```typescript
// Show on desktop only
className="hidden lg:block"

// Mobile first
className="flex-col md:flex-row"

// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

## 🌙 Dark Mode

All components support dark mode:

```typescript
// Tailwind dark: prefix
className="bg-white dark:bg-slate-900"
className="text-slate-900 dark:text-white"

// Check in code
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  // Dark mode
}
```

## 🚀 Environment Variables

Check `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Access in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## 📝 TypeScript Types

```typescript
// API responses
interface LoginResponse {
  token: string;
  user: User;
}

interface DashboardStats {
  total_sales: number;
  gross_profit: number;
  net_profit: number;
  // ... more fields
}

// Auth
interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  // ... more fields
}
```

## 🔄 Common Patterns

### Date Range Filter
```typescript
const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

const today = new Date();
let startDate: string | undefined;

if (dateRange === 'today') {
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  startDate = `${year}-${month}-${day}`;
}
```

### Loading State
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSkeleton />;
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await apiCall();
  setError(null);
} catch (err: any) {
  setError(err.message);
}

{error && <div className="text-red-600">{error}</div>}
```

## 🌐 SaaS & Multi-Tenant Patterns

### 1. Dynamic Subdomain Resolution (`app/lib/api.ts`)
Aplikasi frontend Next.js ini secara dinamis menyelesaikan subdomain host browser untuk memetakan domain API backend yang tepat per tenant:
* Jika berada di domain utama (`localhost:3000` atau `192.168.1.141:3000`), `BASE_URL` tetap bernilai `NEXT_PUBLIC_API_URL` (skema core `public`).
* Jika berada di subdomain (`kopikulo.localhost:3000`), `BASE_URL` secara dinamis diubah menjadi `http://kopikulo.localhost:8080/api/v1` (atau via DNS `nip.io` `http://kopikulo.192.168.1.141.nip.io:8080/api/v1` pada IP lokal).

### 2. Integrasi Pembayaran Midtrans Snap (`app/(dashboard)/dashboard/billing/page.tsx`)
Untuk memicu pembayaran digital, kita memuat SDK Midtrans secara dinamis menggunakan modul `<Script>` Next.js:
```typescript
import Script from 'next/script';

<Script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
  strategy="afterInteractive"
/>
```
Proses pembayaran dipicu via handler:
```typescript
const response = await saasAPI.upgradeSubscription(planId, cycle);
window.snap.pay(response.snap_token, {
  onSuccess: (result) => { /* update UI */ },
  onPending: (result) => { /* show info pending */ },
  onError: (result) => { /* show error */ }
});
```

---

## 🆘 Troubleshooting

| Kendala | Solusi |
|-------|----------|
| Login gagal (404/Not Found) | Periksa apakah Anda mencoba masuk menggunakan IP/subdomain yang salah. Pastikan API backend berjalan. |
| Koneksi database core terputus / tabel `plans` hilang | Pastikan skema `public` telah di-seeding (`go run cmd/seed/main.go`) dan database backend sudah di-restart. |
| Popup Midtrans Snap tidak terbuka | Pastikan `Script` Snap SDK termuat di browser (lihat konsol untuk error `window.snap is undefined`) dan variabel client-key sudah benar di `.env.local`. |
| Tombol Super Admin tidak muncul | Tombol Super Admin hanya dimuat secara dinamis jika pengguna login sebagai `admin` dari domain utama platform (tanpa subdomain). |
| Build error Next.js | Periksa kesalahan penulisan tipe data TypeScript dengan perintah `npm run lint`. |

## 📚 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Happy coding! 🎉**
