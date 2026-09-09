# RakTracker

Sistem manajemen inventaris spare part berbasis QR Code untuk lingkungan pabrik/maintenance.

## Fitur

- **Scan QR Code** - Scan stiker QR pada bin/rak untuk akses cepat daftar part
- **Manajemen Lokasi** - Buat lokasi secara single atau bulk (3 segmen: Kategori-Section-Bin)
- **Transaksi Stok** - Keluar/Masuk stok dengan validasi dan history tracking
- **Dashboard** - Monitoring stok menipis (low-stock alert)
- **Cetak QR** - Export QR Code dalam format PDF A4 (2x2 grid) untuk dicetak
- **Import/Export CSV** - Bulk import lokasi dan export data
- **PWA** - Installable di HP sebagai aplikasi

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore + Auth)
- **Libraries:** html5-qrcode, jspdf, papaparse, qrcode

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi Firebase

Copy `.env.example` ke `.env` dan isi dengan Firebase config project kamu:

```bash
cp .env.example .env
```

### 3. Jalankan development server

```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Jalankan dev server (Vite) |
| `npm run build` | Build production ke folder `dist/` |
| `npm run start` | Jalankan production server (Express) |
| `npm run lint` | Lint dengan Oxlint |

## Deploy ke Google Cloud Run

```bash
gcloud auth login
gcloud config set project <PROJECT_ID>
gcloud run deploy raktracker --source . --port 8080 --allow-unauthenticated
```

Atau deploy via Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

## Struktur Database

### Collections

- **`locations`** - Data lokasi/bin (document ID = `location_id`)
- **`parts`** - Data spare part
- **`stock_history`** - Log transaksi stok

### Format `location_id`

```
EL-A-B01
│ │  │
│ │  └── Kode Bin (B01, C12, dst)
│ └──── Section Rak (A, B, C, dst)
└────── Kode Kategori (EL, MK, PH, DR, CS)
```

| Kode | Kategori |
|------|----------|
| EL | Elektrikal & Kontrol |
| MK | Mekanikal |
| PH | Pneumatik & Hidraulik |
| DR | Drive & Motor |
| CS | Consumable/Fast-moving |

## Akses User

| Fitur | Admin | Teknisi |
|-------|:-----:|:-------:|
| Scan QR | ✓ | ✓ |
| Lihat Part | ✓ | ✓ |
| Transaksi Keluar/Masuk | ✓ | ✓ |
| CRUD Lokasi | ✓ | ✗ |
| Bulk Generate | ✓ | ✗ |
| Import/Export CSV | ✓ | ✗ |
| Export PDF | ✓ | ✗ |
| Dashboard | ✓ | ✗ |

## License

Private
