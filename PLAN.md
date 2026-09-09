# PLAN FINAL - Spare Part & Inventory Tracker QR (v3 - 2026-09-08)

> Status: FINAL & DIKUNCI. Siap eksekusi. Stack: Vite + React + Firebase Firestore + Tailwind + PWA

## Keputusan Final
1.  **Granularitas:** 1 Rak -> N Bin. QR ditempel **per Bin/kotak kecil**, bukan per Rak.
2.  **Format `location_id` (3 segmen):** `EL-A-B01` = `EL` (kode kategori) - `A` (Section Rak) - `B01` (Kode Bin). Contoh lain: `MK-C-B12`, `PH-A-B05`.
3.  **Akses:** Hanya **Admin** yang boleh Create / Bulk Generate / Import CSV / Export CSV / Export PDF. Teknisi hanya Scan + Transaksi Keluar/Masuk.
4.  **Fitur Wajib Admin:** Bulk Generate, Import CSV, Export CSV, Export PDF A4 dibagi 4 (2x2 grid).
5.  **Filter:** Wajib ada filter di halaman List Part setelah scan (search nama/part_number + filter low-stock).

Mapping Kategori Fixed (5):
- Elektrikal & Kontrol = `EL`
- Mekanikal = `MK`
- Pneumatik & Hidraulik = `PH`
- Drive & Motor = `DR`
- Consumable/Fast-moving = `CS`

Format Validasi:
- `location_id` regex: `^[A-Z]{2}-[A-Z]-[A-Z0-9]{2,4}$` (contoh `EL-A-B01`)
- `section_rak`: `^[A-Z]$` (1 huruf)
- `kode_bin`: `^[A-Z][0-9]{2,3}$` (contoh `B01`, `C12`)
- `no_induk` (jika dipakai di `parts`): `^[0-9]{3}$` zero-padded `001-999`

---

## 1. Struktur Project & Arsitektur

**Arsitektur: Frontend-Only + BaaS (Firebase)**
Browser HP/Desktop (HMI) <-> Firebase Firestore (DB) + Firebase Hosting + Firebase Auth
Tidak perlu server Express. Update realtime via Firestore listener.

**Alur Data Inti (Scan -> Transaksi):**
```
[QR Stiker Bin "EL-A-B01"] -> Scan via html5-qrcode -> decode "EL-A-B01"
-> Query Firestore: parts where location_id == "EL-A-B01"
-> Tampilkan List Part di Bin itu (dengan Filter client-side)
-> Teknisi Pilih Part -> Form Keluar/Masuk (jumlah, nama_pengambil, keperluan)
-> Submit -> Firestore Transaction (update parts.stok_saat_ini + create stock_history)
-> UI auto-refresh realtime
```
QR hanya berisi `location_id` (alamat), bukan data part. Alasan: QR statis, 1 Bin bisa banyak part, QR pendek = mudah scan saat kotor.

**Folder Structure:**
```
/part-tracker
├── PLAN.md (file ini)
├── firebase.json
├── /src
│   ├── /pages
│   │   ├── Scan.jsx
│   │   ├── LocationDetail.jsx (list part + FilterBar)
│   │   ├── PartDetail.jsx
│   │   ├── TransactionForm.jsx
│   │   ├── Dashboard.jsx (low-stock)
│   │   ├── History.jsx
│   │   ├── Search.jsx
│   │   └── /admin
│   │       ├── LocationsList.jsx
│   │       ├── LocationsCreate.jsx (Single & Bulk 3 segmen)
│   │       └── LocationsImport.jsx
│   ├── /components
│   │   ├── CardPart.jsx
│   │   ├── FilterBar.jsx
│   │   ├── Scanner.jsx
│   │   ├── QRPreview.jsx
│   │   └── Navbar.jsx
│   └── /lib
│       ├── firebase.js
│       ├── constants.js (CATEGORIES, mapping EL dll)
│       ├── generateLocationId.js
│       ├── csv.js
│       └── pdf.js
└── /public (icon PWA, template CSV)
```

---

## 2. Skema Database Firestore (3 Collections)

### `locations` - Document ID = `location_id`
| Field | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `location_id` | string PK | `EL-A-B01` | Isi QR, 3 segmen |
| `kode_kategori` | string | `EL` | EL,MK,PH,DR,CS |
| `kategori` | string | `Elektrikal & Kontrol` | Nama lengkap display |
| `section_rak` | string | `A` | Section rak |
| `kode_bin` | string | `B01` | Kode bin |
| `bin_group_id` | string | `EL-A` | Helper untuk filter Section |
| `deskripsi_lokasi` | string | `Section A Bin 1 - atas` | Opsional |
| `createdAt` | timestamp | serverTimestamp |  |
| `createdBy` | string | uid admin | Audit |

### `parts` - Document ID auto `prt_xxx`
| Field | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `nama_part` | string | `Kontaktor Schneider LC1D09` |  |
| `location_id` | string FK | `EL-A-B01` | Index wajib |
| `kategori` | string | `Elektrikal & Kontrol` | Sinkron dengan lokasi |
| `brand` | string | `Schneider` |  |
| `part_number` | string | `LC1D09M7` | Index search |
| `part_number_alternatif` | array<string> | `["LC1D09BD"]` | array-contains |
| `kompatibel_mesin` | array<string> | `["Mesin Wrapping 1"]` |  |
| `satuan` | string | `pcs` / `meter` |  |
| `stok_saat_ini` | number | `4` | Kritis |
| `stok_minimum` | number | `2` | Trigger merah |
| `no_induk` | string | `001` | Opsional, pindahan segmen 4 lama |
| `updatedAt` | timestamp |  |  |

### `stock_history` - Document ID auto `hist_xxx`
| Field | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `part_id` | string FK | `prt_xxx` | Index |
| `location_id` | string | `EL-A-B01` | Denormalisasi |
| `tipe` | string | `keluar` / `masuk` | Enum |
| `jumlah` | number | `2` | >0 |
| `timestamp` | timestamp | serverTimestamp | Waktu server |
| `nama_pengambil` | string | `Budi - Shift 2` |  |
| `keperluan` | string | `Breakdown Line 1` | Dropdown + free text |
| `stok_sesudah` | number | `2` | Snapshot |

**Relasi:** 1 Location -> N Parts, 1 Part -> N History. Dijaga via `location_id` & `part_id`.
**Aturan Transaksi:** Update `stok_saat_ini` + create `stock_history` HARUS dalam 1 `runTransaction`. Validasi `stok_saat_ini >= 0` setelah keluar. Blok jika `jumlah > stok_saat_ini`.

**Index Firestore Wajib:**
- `parts: location_id ASC`
- `stock_history: part_id ASC, timestamp DESC`
- `locations: section_rak ASC, kode_bin ASC`

**Security Rules (rencana):**
```
match /locations/{id} {
  allow read: if request.auth != null;
  allow create, update, delete: if request.auth.token.role == "admin";
}
match /parts/{id} {
  allow read: if request.auth != null;
  allow create, update: if request.auth.token.role == "admin";
  allow update: if request.auth != null && // untuk transaksi stok (hanya boleh ubah stok_saat_ini)
}
match /stock_history/{id} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
}
```
MVP awal: `role == "admin"` bisa diganti `request.auth.token.email == "admin@pabrik.com"` jika belum pakai custom claims.

---

## 3. Halaman/Screen & Alur + Filter

### `/` Scan (Halaman Utama)
- Tombol besar [SCAN QR RAK] (html5-qrcode, kamera belakang) + Input manual `EL-A-B01` fallback + Search Global part.
- Sukses scan -> `navigate("/location/EL-A-B01")`

### `/location/:locationId` (List Part per Bin) - HALAMAN INTI TEKNISI
- Header: `EL-A-B01 | Elektrikal - Section A Bin B01` + deskripsi.
- **FilterBar (Wajib):** `[Search nama/part_number/brand]` `[Filter Kategori]` `[Toggle: Semua / Stok Menipis Saja]`. Filter client-side setelah query.
- List Card Part: Nama, Part Number, Brand, Stok `4 pcs` (merah + icon warning jika `stok <= stok_minimum`), Satuan.
- Klik Card -> `/part/:partId`
- Tombol `[+ Tambah Part di Bin Ini]` (Admin only)

### `/part/:partId` (Detail Part)
- Detail lengkap + 2 tombol besar: `[AMBIL STOK (Keluar)]` merah, `[TAMBAH STOK (Masuk)]` hijau.
- Tampilkan 5 history terakhir part ini.

### `/part/:partId/transaction?type=keluar|masuk`
- Form: Jumlah (number, >0, blok jika keluar > stok), Nama Pengambil (wajib), Keperluan (dropdown: Breakdown, Preventive, Restock, Pinjam + free text).
- Submit -> Transaction -> sukses -> balik ke `/location/:locationId` dengan toast.

### `/admin/locations` (List Admin)
- Tabel: `Location ID | Kategori | Section | Bin | Deskripsi | Jml Part | Aksi [QR][Edit][Delete]`
- Search by `location_id/kode_bin`, Filter Section/Kategori, Checkbox multi-select.
- Aksi bulk: `[Export CSV]` `[Export PDF A4/4]` untuk yang ter-select / ter-filter.

### `/admin/locations/create` (Single & Bulk 3 Segmen)
```
[Dropdown Kategori*] -> auto prefix EL
[Input Section*: A] (1 huruf)
[Mode: Single | Bulk]
- Single: [Kode Bin*: B01] -> Preview: EL-A-B01
- Bulk: [Kode Bin Awal*: B01] [Jumlah Bin*: 6] -> Preview list EL-A-B01 .. EL-A-B06
[Deskripsi Prefix Opsional]
[Simpan] -> writeBatch -> Modal Sukses [Download PDF A4/4] [Download CSV] [Ke List]
```
Validasi: cek duplikat per ID via getDoc, lock `location_id` setelah create.

### `/admin/locations/import`
- Tombol `[Download Template CSV]`
- Upload CSV -> parse papaparse -> preview 5 baris + summary Valid/Error (duplikat, format salah) -> `[Import Valid Saja]`

### Halaman Global (Desktop)
- `/search` - Cari part by nama/part_number/kompatibel_mesin
- `/dashboard` - Tabel part low-stock (`stok <= stok_minimum`) filter per kategori
- `/history` - Log semua history filter tanggal/lokasi/part/tipe, export CSV
- `/admin/locations/:id/edit` - Hanya edit `kategori` & `deskripsi`, `section_rak/kode_bin` locked. Delete blok jika masih ada parts di lokasi itu.

---

## 4. Urutan Tahap Development

### Tahap 0 - Setup Fondasi (1-2 hari)
1. Setup Vite + React + Tailwind + Firebase SDK + html5-qrcode + papaparse + jspdf + qrcode
2. Setup Firebase project, Firestore, Hosting, Auth (1 akun admin awal)
3. Buat constants `CATEGORIES` & helper `generateLocationId(kode_kategori, section, kode_bin)`

### Tahap 1 - Fondasi Lokasi (Prioritas 1)
1. Buat `/admin/locations` (list read)
2. Buat `/admin/locations/create` Single & Bulk 3 segmen + validasi regex + cek duplikat + writeBatch
3. Test generate 6 Bin `EL-A-B01`..`B06`

### Tahap 2 - Bulk Lengkap
1. Export CSV (Blob download)
2. Import CSV + preview + validasi + writeBatch (max 500/batch)
3. Export PDF A4/4 (qrcode -> dataURL -> jspdf 2x2 grid, 105x148.5mm per QR, margin 10mm)

### Tahap 3 - Inti Teknisi
1. `/location/:id` + FilterBar client-side
2. `/part/:id` + `TransactionForm` + Firestore Transaction stok
3. `/` Scan (html5-qrcode) + fallback input manual + permission handling

### Tahap 4 - Desktop & Polish
1. Search, Dashboard Low-Stock, History
2. PWA (Add to Home Screen), Navbar responsive
3. Deploy Firebase Hosting, uji di jaringan pabrik

### Tahap 5 - Hardening
1. Perketat Firestore Rules (isAdmin)
2. Buat index Firestore
3. Cetak QR final, tempel, uji race condition 2 HP ambil bersamaan

---

## 5. Hal Teknis yang Sudah Diputuskan & Perhatikan

1.  **Format QR:** Hanya string `EL-A-B01` (pendek, renggang, tahan kotor).
2.  **Deteksi Part:** Via query `where location_id == scannedId`, bukan dari QR. Pilih part manual setelah filter.
3.  **Stok:** Tidak boleh minus, validasi di frontend + Rules + Transaction. `satuan` bisa `pcs` (integer) atau `meter` (float) -> `jumlah` support float, validasi >0.
4.  **Keperluan:** Dropdown tetap + free text biar laporan rapi.
5.  **Jaringan:** Butuh online. Sediakan UX error "Gagal simpan, cek WiFi, coba lagi". Offline sync tidak di MVP.
6.  **Cetak PDF:** A4 dibagi 4 = 2x2 @ 105x148.5mm. Tiap kuadran: QR tengah + `EL-A-B01` bold + `Kategori | Sec A Bin B01` + deskripsi kecil. File `QR_EL-A-B01_6bin.pdf`.
7.  **CSV Template:** Header `kode_kategori,section_rak,kode_bin,deskripsi_lokasi` (4 kolom terpisah, sistem gabungkan). Support juga 1 kolom `location_id` untuk impor cepat.
8.  **ID Tidak Bisa Diedit:** Setelah create, `location_id` locked. Salah -> delete & create baru (cetak ulang stiker).

---

## Library yang Akan Dipakai
- `firebase` (Firestore, Auth, Hosting)
- `html5-qrcode` (scan)
- `qrcode` (generate QR untuk PDF)
- `jspdf` (layout PDF A4)
- `papaparse` (CSV parse)
- `react-router-dom`

---

## Next Step Setelah Plan Ini
Langsung eksekusi Tahap 0 (setup project) lalu Tahap 1. Tidak perlu keputusan tambahan lagi kecuali mapping kode kategori mau diubah.
