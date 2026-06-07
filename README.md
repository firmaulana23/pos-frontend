# Coffee Shop POS SaaS Platform (Next.js Frontend)

Aplikasi frontend modern Point of Sale (POS) SaaS Multi-Tenant berbasis web. Dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **TypeScript**, dan **TailwindCSS 4**, aplikasi ini mendukung isolasi akses tenant berbasis subdomain wildcard, integrasi sistem pembayaran digital Midtrans Snap, serta dashboard administratif platform sentral.

---

## ⚡ Fitur Utama Frontend

- **🌐 Dynamic Subdomain Resolver**:
  - Secara otomatis mendeteksi subdomain tempat web diakses (misal: `kopikulo.localhost:3000`) dan mengarahkan API call secara dinamis ke subdomain backend terkait.
  - Mendukung domain lokal, alamat IP, dan wildcard DNS `nip.io`.
- **📝 Registrasi Toko Baru (Self-Service)**:
  - Halaman pendaftaran toko baru (`/register`) dengan glassmorphism UI, live subdomain validation, dan redirect instan ke subdomain toko setelah sukses.
- **💳 Dashboard Langganan & Billing**:
  - Halaman `/dashboard/billing` bagi pemilik toko untuk memantau sisa kuota kapasitas produk/kasir, melihat riwayat pembayaran, serta checkout upgrade langganan menggunakan **Midtrans Snap SDK**.
- **👑 Portal Super Admin**:
  - Halaman `/dashboard/super` bagi administrator pusat platform untuk memantau total omzet bulanan (MRR) dan menangguhkan (*suspend*) / mengaktifkan merchant toko.
- **🛡️ Otorisasi & Navigasi Cerdas**:
  - Menyembunyikan menu-menu tertentu dari pengguna kasir/staf biasa, serta menampilkan menu langganan/super admin secara dinamis sesuai domain & level otorisasi.

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Instalasi Dependensi
Kloning folder frontend ini dan instal dependensinya:
```bash
cd pos-frontend
npm install
```

### 2. Konfigurasi Environment (`.env.local`)
Buat file konfigurasi `.env.local` pada root folder frontend:
```env
# URL API Backend utama (tanpa subdomain)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Port backend jika berjalan lokal (digunakan untuk auto-mapping subdomain)
NEXT_PUBLIC_API_PORT=8080

# Kunci client Midtrans Sandbox Anda
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-Xo0mIsbX5oLYFoFQ
```

### 3. Jalankan Server Development
```bash
npm run dev
```
*Frontend Anda akan berjalan di `http://localhost:3000`.*

---

## 🌐 Cara Menguji Subdomain Lokal

Untuk menguji fitur multi-tenant secara lokal di komputer Anda:
1. **Menggunakan `.localhost` (Sangat Direkomendasikan)**:
   - Browser modern (seperti Chrome & Safari) otomatis mendukung pencarian subdomain lokal. Anda dapat langsung membuka alamat:
     👉 `http://kopikulo.localhost:3000/login`
2. **Menggunakan Wildcard DNS `nip.io`**:
   - Jika Anda perlu menguji menggunakan perangkat lain di jaringan Wi-Fi lokal, gunakan alamat IP Anda yang disandingkan dengan `nip.io`:
     👉 `http://kopikulo.192.168.1.141.nip.io:3000/login`

---

## 📁 Struktur Proyek Frontend

```
pos-frontend/
├── app/
│   ├── (auth)/                  # Rute publik (Login, Register)
│   │   ├── login/page.tsx       # Form login staf/admin
│   │   └── register/page.tsx    # Form registrasi toko SaaS baru
│   ├── (dashboard)/             # Rute terproteksi (Dashboard)
│   │   ├── dashboard/           # Halaman POS utama
│   │   │   ├── billing/page.tsx # Manajemen Langganan & Midtrans Snap
│   │   │   ├── super/page.tsx   # Portal Admin SaaS (Moderasi & MRR)
│   │   │   ├── page.tsx         # Dashboard analisa penjualan
│   │   │   └── pos/             # Transaksi POS Kasir
│   │   └── layout.tsx           # Sidebar Navigasi & dynamic links
│   ├── components/              # UI Reusable & Recharts components
│   ├── lib/
│   │   ├── api.ts               # Dynamic Base URL & REST API calls
│   │   └── auth.ts              # Custom hooks untuk proteksi & storage
│   ├── globals.css              # Setup TailwindCSS 4 & tokens
│   └── layout.tsx               # Root Layout
├── docs/                        # File referensi & API
├── tsconfig.json                # Konfigurasi TypeScript compiler
└── package.json                 # Daftar dependensi & npm scripts
```

---

## 🛠️ Perintah Berguna

```bash
npm run dev      # Menjalankan server dev local
npm run build    # Melakukan kompilasi produksi Next.js
npm run start    # Menjalankan server Next.js build produksi
npm run lint     # Menjalankan linter verifikasi kesalahan kode
```

*Dibuat menggunakan Next.js App Router untuk operasional web POS SaaS modern.*
