# Product Requirements Document (PRD)
## HRIS CSB - Sistem Absensi & Monitoring Karyawan

**Nama Proyek:** HRIS CSB  
**Versi:** 3.0  
**Tanggal:** 14 September 2026  
**Status:** Final

---

## 1. Ringkasan

HRIS CSB adalah **sistem absensi karyawan** berbasis web yang menggunakan **selfie foto + GPS + face recognition** untuk mencegah kecurangan. Sistem ini memiliki 2 user: **Admin (HR)** dan **Karyawan**.

### Tech Stack (Gratis)

| Komponen | Teknologi | Biaya |
|----------|-----------|-------|
| **Frontend** | Next.js + TypeScript + Tailwind | Gratis |
| **UI Library** | shadcn/ui | Gratis |
| **Database** | Supabase (PostgreSQL) | Gratis (500MB) |
| **Hosting** | Vercel | Gratis |
| **Domain** | vercel.app | Gratis |
| **Face Recognition** | face-api.js (client-side) | Gratis |

---

## 2. Pengguna Sistem

| Role | Jumlah | Fungsi Utama |
|------|--------|--------------|
| **Admin (HR)** | 1-2 orang | Monitor absensi, kelola data karyawan, schedule, payroll |
| **Karyawan** | < 50 orang | Absen harian, lihat schedule, lihat riwayat absensi |

---

## 3. Layout & Navigasi

### 3.1 Layout Sidebar (Admin & Karyawan)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────────────────────────┐ │
│  │          │  │  Header: Judul Halaman        [Profil]   │ │
│  │ SIDEBAR  │  ├──────────────────────────────────────────┤ │
│  │          │  │                                          │ │
│  │ 📊       │  │                                          │ │
│  │ Dashboard│  │           KONTEN HALAMAN                 │ │
│  │          │  │                                          │ │
│  │ 👥       │  │                                          │ │
│  │ Karyawan │  │                                          │ │
│  │          │  │                                          │ │
│  │ 📅       │  │                                          │ │
│  │ Schedule │  │                                          │ │
│  │          │  │                                          │ │
│  │ ⏰       │  │                                          │ │
│  │ Time Mgmt│  │                                          │ │
│  │          │  │                                          │ │
│  │ 💰       │  │                                          │ │
│  │ Payroll  │  │                                          │ │
│  │          │  │                                          │ │
│  │ 📍       │  │                                          │ │
│  │ Cabang   │  │                                          │ │
│  │          │  │                                          │ │
│  └──────────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Menu Sidebar Admin

```
┌─────────────────────┐
│  📊 Dashboard       │  ← Overview statistik
├─────────────────────┤
│  👥 Karyawan        │  ← CRUD data karyawan
├─────────────────────┤
│  📅 Schedule        │  ← Buat & kelola jadwal kerja
├─────────────────────┤
│  ⏰ Time Management │  ← Data absensi karyawan
├─────────────────────┤
│  💰 Payroll         │  ← Perhitungan gaji
├─────────────────────┤
│  📍 Cabang          │  ← Kelola lokasi cabang
├─────────────────────┤
│  ✅ Approval        │  ← Persetujuan (izin, luar radius)
├─────────────────────┤
│  📋 Laporan         │  ← Export & cetak laporan
└─────────────────────┘
```

### 3.3 Menu Sidebar Karyawan

```
┌─────────────────────┐
│  🏠 Home            │  ← Dashboard + Riwayat Mingguan
├─────────────────────┤
│  ⏰ Absen           │  ← Halaman absensi (selfie+GPS)
├─────────────────────┤
│  📅 Schedule Saya   │  ← Lihat jadwal kerja
├─────────────────────┤
│  📋 Riwayat         │  ← Riwayat absensi lengkap
├─────────────────────┤
│  👤 Profil           │  ← Data diri + registrasi wajah
└─────────────────────┘
```

---

## 4. Fitur & Modul

### 4.1 MODUL ABSENSI (CORE)

#### 4.1.1 Mekanisme Check-in / Check-out

```
┌─────────────────────────────────────────────────────────────┐
│              STATUS TOMBOL ABSENSI                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  KONDISI 1: Belum absen hari ini                            │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  ABSEN MASUK    │  │  (disabled)     │                  │
│  │  ✅ Tersedia    │  │  ABSEN PULANG   │                  │
│  └─────────────────┘  │  ❌ Tidak bisa  │                  │
│                        └─────────────────┘                  │
│                                                             │
│  KONDISI 2: Sudah absen masuk, belum pulang                 │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  (disabled)     │  │  ABSEN PULANG   │                  │
│  │  ABSEN MASUK    │  │  ✅ Tersedia    │                  │
│  │  ❌ Sudah absen │  └─────────────────┘                  │
│  └─────────────────┘                                       │
│                                                             │
│  KONDISI 3: Sudah absen masuk DAN pulang                    │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  (disabled)     │  │  (disabled)     │                  │
│  │  ABSEN MASUK    │  │  ABSEN PULANG   │                  │
│  │  ❌ Selesai     │  │  ❌ Selesai     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ATURAN:                                                    │
│  • 1x Check-in per hari                                     │
│  • 1x Check-out per hari                                    │
│  • Check-out hanya bisa setelah check-in                    │
│  • Setelah keduanya selesai, tombol tidak available         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.2 Mekanisme Kamera

```
┌─────────────────────────────────────────────────────────────┐
│                 KAPAN KAMERA MUNCUL                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ❌ Kamera TIDAK muncul saat:                               │
│     • Pertama kali buka halaman absensi                     │
│     • Sedang melihat riwayat                                │
│     • Idle / tidak melakukan aksi                           │
│                                                             │
│  ✅ Kamera MUNCUL saat:                                     │
│     • Klik tombol "Absen Masuk"                             │
│     • Klik tombol "Absen Pulang"                            │
│                                                             │
│  ALUR:                                                      │
│  1. Klik tombol absen → Kamera aktif                        │
│  2. Ambil selfie → Proses face recognition                  │
│  3. Selesai → Kamera mati                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.3 Fitur Absensi

| ID | Fitur | Keterangan |
|----|-------|------------|
| AB-01 | Selfie Check-in | Ambil selfie saat absen masuk |
| AB-02 | Selfie Check-out | Ambil selfie saat absen pulang |
| AB-03 | GPS Tracking | Ambil lokasi otomatis via browser |
| AB-04 | GPS Refresh | Tombol refresh untuk update lokasi GPS |
| AB-05 | Face Recognition | Verifikasi wajah pakai face-api.js |
| AB-06 | Geofencing | Cek apakah dalam radius lokasi cabang |
| AB-07 | Riwayat Mingguan | Tampilan riwayat 7 hari terakhir di Home |

#### 4.1.4 GPS & Geofencing

```
┌─────────────────────────────────────────────────────────────┐
│                    MEKANISME GPS                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TAMPILAN GPS:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📍 Lokasi Anda: Kantor Pusat Jakarta              │   │
│  │  📏 Jarak: 25 meter dari pusat                     │   │
│  │                                                     │   │
│  │  [🔄 Refresh Lokasi]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  KONDISI:                                                   │
│                                                             │
│  1. DALAM RADIUS (≤ 100m)                                  │
│     → Absensi langsung diterima ✅                         │
│                                                             │
│  2. LUAR RADIUS (> 100m)                                   │
│     → Absensi MASUK KE PENGAJUAN ADMIN ⏳                  │
│     → Status: "Menunggu Persetujuan"                       │
│     → Admin dapat lihat detail: foto, lokasi, alasan       │
│     → Admin bisa approve atau reject                       │
│                                                             │
│  3. GPS TIDAK AKTIF                                        │
│     → Tidak bisa absen ❌                                  │
│     → Pesan: "Aktifkan GPS untuk absen"                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.1.5 Face Recognition

```
┌─────────────────────────────────────────────────────────────┐
│               MEKANISME FACE RECOGNITION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  REGISTRASI WAJAH (sekali saja):                            │
│  1. Karyawan selfie 3-5 foto                                │
│  2. face-api.js ekstrak face embedding (128 angka unik)    │
│  3. Simpan embedding di database                            │
│  4. Wajah sudah terdaftar                                   │
│                                                             │
│  SAAT ABSENSI:                                              │
│  1. Karyawan selfie 1 foto                                  │
│  2. face-api.js ekstrak face embedding                      │
│  3. Bandingkan dengan yang tersimpan (cosine similarity)    │
│  4. Jika similarity > 0.6 → Cocok → Absensi diterima      │
│                                                             │
│  JIKA GAGAL (3x berturut-turut):                           │
│  → Absensi masuk ke pengajuan admin                         │
│  → Admin bisa verifikasi manual                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2 MODUL SCHEDULE / JADWAL KERJA

#### 4.2.1 Fitur Schedule

| ID | Fitur | Keterangan |
|----|-------|------------|
| SC-01 | Buat Schedule 1 Karyawan | Pilih karyawan + tanggal + jam kerja |
| SC-02 | Buat Schedule Banyak | Select banyak karyawan + tanggal + jam |
| SC-03 | Import via Excel | Upload template Excel untuk batch schedule |
| SC-04 | Lihat Schedule Harian | Karyawan lihat jadwal hari ini |
| SC-05 | Lihat Schedule Mingguan | Karyawan lihat jadwal 7 hari ke depan |
| SC-06 | Edit Schedule | Ubah jadwal yang sudah dibuat |
| SC-07 | Hapus Schedule | Hapus jadwal (sebelum tanggal berlaku) |

#### 4.2.2 Membuat Schedule

```
┌─────────────────────────────────────────────────────────────┐
│              FORM BUAT SCHEDULE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 Buat Jadwal Kerja                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pilih Karyawan:                                    │   │
│  │  ☑ Budi Santoso                                     │   │
│  │  ☑ Siti Aminah                                      │   │
│  │  ☐ Andi Wijaya                                      │   │
│  │  ☐ Rina Sari                                        │   │
│  │  [Pilih Semua]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Rentang Tanggal (maks 1 bulan):                    │   │
│  │  Dari: [14/09/2026]  Sampai: [14/10/2026]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Jam Kerja:                                         │   │
│  │  Masuk: [08:00]  Pulang: [17:00]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Hari Kerja:                                        │   │
│  │  ☑ Senin  ☑ Selasa  ☑ Rabu  ☑ Kamis  ☑ Jumat      │   │
│  │  ☐ Sabtu  ☐ Minggu                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Simpan Schedule]                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.3 Import Schedule via Excel

```
┌─────────────────────────────────────────────────────────────┐
│              IMPORT SCHEDULE EXCEL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Download Template: [📥 Download Template]               │
│                                                             │
│  2. Isi Template Excel:                                     │
│  ┌────────────┬────────────┬────────────┬────────┬────────┐│
│  │ Nama       │ Email      │ Tanggal    │ Masuk  │ Pulang ││
│  ├────────────┼────────────┼────────────┼────────┼────────┤│
│  │ Budi       │ budi@csb   │ 14/09/2026 │ 08:00  │ 17:00  ││
│  │ Budi       │ budi@csb   │ 15/09/2026 │ 08:00  │ 17:00  ││
│  │ Siti       │ siti@csb   │ 14/09/2026 │ 07:30  │ 16:30  ││
│  └────────────┴────────────┴────────────┴────────┴────────┘│
│                                                             │
│  3. Upload: [📤 Upload File Excel]                          │
│                                                             │
│  4. Preview:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✓ 50 jadwal akan ditambahkan                       │   │
│  │  ✓ 3 karyawan terdampak                             │   │
│  │                                                     │   │
│  │  [Konfirmasi]  [Batal]                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2.4 Tampilan Schedule Karyawan

```
┌─────────────────────────────────────────────────────────────┐
│  📅 JADWAL KERJA SAYA                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📆 Minggu, 14 - 20 September 2026                         │
│  [< Minggu Depan]  [Minggu Depan >]                        │
│                                                             │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │  SENIN   │  SELASA  │   RABU   │  KAMIS   │             │
│  │  14/09   │  15/09   │  16/09   │  17/09   │             │
│  ├──────────┼──────────┼──────────┼──────────┤             │
│  │ 08:00 -  │ 08:00 -  │ 08:00 -  │ 08:00 -  │             │
│  │ 17:00    │ 17:00    │ 17:00    │ 17:00    │             │
│  │ Kantor   │ Kantor   │ Kantor   │ Kantor   │             │
│  │ Pusat    │ Pusat    │ Pusat    │ Pusat    │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│                                                             │
│  ┌──────────┬──────────┐                                   │
│  │  JUMAT   │  SABTU   │                                   │
│  │  18/09   │  19/09   │                                   │
│  ├──────────┼──────────┤                                   │
│  │ 08:00 -  │ LIBUR    │                                   │
│  │ 17:00    │          │                                   │
│  │ Kantor   │          │                                   │
│  │ Pusat    │          │                                   │
│  └──────────┴──────────┘                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.3 MODUL HOME / DASHBOARD KARYAWAN

#### 4.3.1 Tampilan Home Karyawan

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 HOME                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 Budi Santoso                                           │
│  📍 Kantor Pusat Jakarta                                   │
│  📅 Senin, 14 September 2026                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STATUS ABSENSI HARI INI                            │   │
│  │                                                     │   │
│  │  ✅ Sudah Absen Masuk: 08:02                        │   │
│  │  ⏳ Belum Absen Pulang                              │   │
│  │                                                     │   │
│  │  [ ABSEN PULANG SEKARANG ]                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📍 LOKASI ANDA                                     │   │
│  │                                                     │   │
│  │  Status: Dalam area kantor ✅                       │   │
│  │  Jarak: 25 meter dari pusat                         │   │
│  │                                                     │   │
│  │  [🔄 Refresh Lokasi]                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📋 RIWAYAT MINGGU INI                              │   │
│  │                                                     │   │
│  │  Senin, 14-Sep-2026                                 │   │
│  │  Masuk: 08:02 | Pulang: Belum absen pulang          │   │
│  │                                                     │   │
│  │  Minggu, 13-Sep-2026                                │   │
│  │  Masuk: 07:58 | Pulang: 17:05                       │   │
│  │                                                     │   │
│  │  Sabtu, 12-Sep-2026                                 │   │
│  │  Masuk: 08:00 | Pulang: 17:00                       │   │
│  │                                                     │   │
│  │  Jumat, 11-Sep-2026                                 │   │
│  │  Masuk: 08:15 | Pulang: 17:10                       │   │
│  │                                                     │   │
│  │  Kamis, 10-Sep-2026                                 │   │
│  │  Masuk: 07:55 | Pulang: 17:00                       │   │
│  │                                                     │   │
│  │  Rabu, 09-Sep-2026                                  │   │
│  │  Masuk: 08:00 | Pulang: 17:00                       │   │
│  │                                                     │   │
│  │  Selasa, 08-Sep-2026                                │   │
│  │  Masuk: 08:05 | Pulang: 17:02                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3.2 Format Riwayat Mingguan

```
Format: "Hari, dd-mmm-yyyy"

Contoh output:
─────────────
Senin, 14-Sep-2026
Masuk: 08:02 | Pulang: Belum absen pulang

Minggu, 13-Sep-2026
Masuk: 07:58 | Pulang: 17:05

Sabtu, 12-Sep-2026
Masuk: 08:00 | Pulang: 17:00

Keterangan:
- Jika sudah absen masuk hari ini → tampilkan jam masuk
- Jika belum absen pulang → tampilkan "Belum absen pulang"
- Jika sudah absen pulang → tampilkan jam pulang
- Tampilkan 7 hari terakhir (termasuk hari ini)
```

---

### 4.4 MODUL DATABASE KARYAWAN (Admin)

| ID | Fitur | Keterangan |
|----|-------|------------|
| DK-01 | Daftar Karyawan | Tabel list semua karyawan |
| DK-02 | Tambah Karyawan | Form input data karyawan baru |
| DK-03 | Edit Karyawan | Ubah data karyawan |
| DK-04 | Hapus Karyawan | Nonaktifkan/hapus karyawan |
| DK-05 | Import Excel | Upload data karyawan via Excel |
| DK-06 | Export Excel | Download data karyawan |
| DK-07 | Registrasi Wajah | Admin bisa lihat status registrasi wajah |
| DK-08 | Filter & Search | Filter by cabang, status, search by nama |

---

### 4.5 MODUL TIME MANAGEMENT (Admin)

| ID | Fitur | Keterangan |
|----|-------|------------|
| TM-01 | Rekap Absensi | Tabel data absensi semua karyawan |
| TM-02 | Filter Tanggal | Pilih rentang tanggal (max 1 bulan) |
| TM-03 | Filter Karyawan | Pilih karyawan spesifik |
| TM-04 | Filter Cabang | Pilih per cabang |
| TM-05 | Import Absensi Manual | Upload Excel untuk input absensi manual |
| TM-06 | Edit Absensi | Admin bisa edit data absensi |
| TM-07 | Detail Absensi | Klik untuk lihat foto selfie + GPS |
| TM-08 | Export Excel | Download data absensi |
| TM-09 | Status Persetujuan | Lihat absensi yang menunggu approval (luar radius) |

#### Import Absensi Manual

```
┌─────────────────────────────────────────────────────────────┐
│              IMPORT ABSENSI MANUAL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📥 Import Data Absensi                                     │
│                                                             │
│  METODE 1: Input Manual                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pilih Karyawan: [Budi Santoso         ▼]           │   │
│  │  Tanggal: [14/09/2026]                              │   │
│  │  Jam Masuk: [08:00]  Jam Pulang: [17:00]           │   │
│  │  Status: [Hadir ▼]                                  │   │
│  │  Keterangan: [________________]                     │   │
│  │                                                     │   │
│  │  [Simpan]                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  METODE 2: Upload Excel (Batch)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Download Template: [📥 Download]                │   │
│  │                                                     │   │
│  │  2. Isi Template:                                   │   │
│  │  ┌──────────┬────────────┬─────────┬─────────┬────┐ │   │
│  │  │ Nama     │ Tanggal    │ Masuk   │ Pulang  │Stts│ │   │
│  │  ├──────────┼────────────┼─────────┼─────────┼────┤ │   │
│  │  │ Budi     │ 14/09/2026 │ 08:00   │ 17:00   │HDI │ │   │
│  │  │ Siti     │ 14/09/2026 │ 08:15   │ 17:00   │TLT │ │   │
│  │  └──────────┴────────────┴─────────┴─────────┴────┘ │   │
│  │                                                     │   │
│  │  3. Upload: [📤 Upload]                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.6 MODUL PAYROLL (Admin)

| ID | Fitur | Keterangan |
|----|-------|------------|
| PY-01 | Komponen Gaji | Gaji pokok, tunjangan, potongan |
| PY-02 | Hitung Gaji | Otomatis hitung berdasarkan kehadiran |
| PY-03 | Select Karyawan | Pilih karyawan yang mau dihitung gajinya |
| PY-04 | Slip Gaji | Generate PDF slip gaji |
| PY-05 | Pajak (PPH 21) | Kalkulasi pajak otomatis |
| PY-06 | Rekap Gaji | Laporan gaji bulanan |
| PY-07 | Export Excel | Download data gaji |

---

### 4.7 MODUL CABANG / LOKASI (Admin)

| ID | Fitur | Keterangan |
|----|-------|------------|
| BR-01 | Daftar Cabang | Tabel semua cabang |
| BR-02 | Tambah Cabang | Input nama + alamat + GPS + radius |
| BR-03 | Edit Cabang | Ubah data cabang |
| BR-04 | Hapus Cabang | Hapus cabang (jika tidak ada karyawan) |
| BR-05 | Jam Kerja | Set jam masuk/pulang per cabang |

#### Form Tambah Cabang

```
┌─────────────────────────────────────────────────────────────┐
│              TAMBAH CABANG BARU                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nama Cabang: [________________]                            │
│                                                             │
│  Alamat Lengkap:                                            │
│  [________________________________________________]        │
│  [________________________________________________]        │
│                                                             │
│  Koordinat GPS:                                             │
│  Latitude:  [-6.2297____________]                           │
│  Longitude: [106.8453___________]                           │
│  [📍 Ambil dari Google Maps]                                │
│                                                             │
│  Radius Geofencing: [100] meter                             │
│                                                             │
│  Jam Kerja:                                                 │
│  Jam Masuk:  [08:00]                                        │
│  Jam Pulang: [17:00]                                        │
│                                                             │
│  [Simpan Cabang]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.8 MODUL APPROVAL (Admin)

| ID | Fitur | Keterangan |
|----|-------|------------|
| AP-01 | Daftar Pengajuan | List absensi/izin yang menunggu approval |
| AP-02 | Approval Luar Radius | Review absensi dari luar area kantor |
| AP-03 | Approval Gagal Face Recognition | Review absensi yang gagal verifikasi wajah |
| AP-04 | Approval Izin | Review pengajuan izin dari karyawan |
| AP-05 | Approve/Reject | Setujui atau tolak dengan catatan |

#### Tampilan Approval

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ MENUNGGU PERSETUJUAN (3)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚠️ LOKASI DI LUAR RADIUS                          │   │
│  │                                                     │   │
│  │  👤 Budi Santoso                                    │   │
│  │  📅 14/09/2026  ⏰ 08:15                            │   │
│  │  📍 1.5 km dari Kantor Pusat Jakarta                │   │
│  │  📷 [Lihat Foto]                                    │   │
│  │                                                     │   │
│  │  Alasan: "Sedang di luar kota untuk kunjungan"      │   │
│  │                                                     │   │
│  │  [✅ Setujui]  [❌ Tolak]  [💬 Catatan]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ⚠️ GAGAL FACE RECOGNITION                         │   │
│  │                                                     │   │
│  │  👤 Siti Aminah                                     │   │
│  │  📅 14/09/2026  ⏰ 07:55                            │   │
│  │  📷 [Lihat Foto]                                    │   │
│  │                                                     │   │
│  │  Skor Similarity: 0.45 (di bawah threshold 0.6)     │   │
│  │                                                     │   │
│  │  [✅ Setujui]  [❌ Tolak]  [💬 Catatan]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.9 MODUL LOGIN & SESSION

| ID | Fitur | Keterangan |
|----|-------|------------|
| LO-01 | Login | Email + Password |
| LO-02 | Session Persist | Data login tersimpan, tidak perlu login ulang |
| LO-03 | Auto Logout | Session expire setelah 24 jam tidak aktif |
| LO-04 | Remember Me | Opsi "Ingat saya" (opsional) |
| LO-05 | Lupa Password | Reset password via email |

#### Mekanisme Session

```
┌─────────────────────────────────────────────────────────────┐
│                 MEKANISME SESSION                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PERTAMA KALI LOGIN:                                        │
│  1. User masukkan email + password                          │
│  2. Sistem verifikasi → Benar                               │
│  3. Sistem buat JWT token + simpan di localStorage          │
│  4. Token tersimpan di browser                              │
│                                                             │
│  SELANJUTNYA:                                               │
│  1. User buka aplikasi                                      │
│  2. Sistem cek localStorage → Ada token?                    │
│  3. Jika ada → Langsung masuk (tidak perlu login lagi)     │
│  4. Jika tidak ada → Minta login                            │
│                                                             │
│  SESSION EXPIRE:                                            │
│  • Setelah 24 jam tidak aktif → Token expire                │
│  • User harus login ulang                                   │
│                                                             │
│  LOGOUT:                                                    │
│  • Token dihapus dari localStorage                          │
│  • User harus login lagi                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Struktur Database

### Diagram Relasi

```
┌──────────────┐       ┌──────────────┐
│   branches   │       │   employees  │
├──────────────┤       ├──────────────┤
│ id           │◄──┐   │ id           │
│ name         │   │   │ branch_id (FK)│──┐
│ address      │   ├───│ user_id (FK) │  │
│ latitude     │   │   │ full_name    │  │
│ longitude    │   │   │ phone        │  │
│ radius_meters│   │   │ status       │  │
│ work_start   │   │   └──────────────┘  │
│ work_end     │   │                      │
└──────────────┘   │                      │
                   │                      │
                   │   ┌──────────────────┘
                   │   │
                   │   │   ┌──────────────┐
                   │   │   │  schedules   │
                   │   │   ├──────────────┤
                   │   │   │ id           │
                   │   │   │ employee_id  │◄─┐
                   │   │   │ date         │  │
                   │   │   │ start_time   │  │
                   │   │   │ end_time     │  │
                   │   │   │ branch_id    │  │
                   │   │   └──────────────┘  │
                   │   │                      │
                   │   │   ┌──────────────┐  │
                   │   │   │ attendances  │  │
                   │   │   ├──────────────┤  │
                   │   │   │ id           │  │
                   └───┼───│ employee_id  │◄─┘
                       │   │ date         │
                       │   │ check_in     │
                       │   │ check_out    │
                       │   │ selfie_in    │
                       │   │ selfie_out   │
                       │   │ gps_lat_in   │
                       │   │ gps_lng_in   │
                       │   │ gps_lat_out  │
                       │   │ gps_lng_out  │
                       │   │ face_score   │
                       │   │ status       │
                       │   │ is_approved  │
                       │   │ approved_by  │
                       │   └──────────────┘
                       │
                       │   ┌──────────────┐
                       │   │  face_data   │
                       │   ├──────────────┤
                       │   │ id           │
                       └───│ employee_id  │
                           │ embedding    │
                           │ created_at   │
                           └──────────────┘

┌──────────────┐       ┌──────────────┐
│    users     │       │ leave_requests│
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ email        │       │ employee_id  │
│ password_hash│       │ type         │
│ role         │       │ start_date   │
│ created_at   │       │ end_date     │
└──────────────┘       │ status       │
                       │ approved_by  │
                       └──────────────┘
```

---

## 6. Bisnis Rules

### 6.1 Absensi
- Karyawan hanya bisa **1x check-in** dan **1x check-out** per hari
- Tombol check-out hanya **available setelah check-in**
- Setelah check-in dan check-out selesai, **kedua tombol tidak available**
- Kamera hanya muncul saat tombol absen diklik
- GPS harus aktif untuk bisa absen

### 6.2 Geofencing
- Jika dalam radius → Absensi langsung diterima
- Jika di luar radius → Masuk ke **pengajuan admin** (tidak langsung ditolak)
- Admin bisa approve/reject dengan catatan

### 6.3 Face Recognition
- Registrasi wajah minimal 3 foto
- Threshold similarity: 0.6
- Jika gagal 3x → Masuk ke pengajuan admin
- Data wajah disimpan sebagai embedding, bukan foto

### 6.4 Schedule
- Admin bisa buat schedule 1 karyawan atau banyak sekaligus
- Import via Excel dengan template yang disediakan
- Rentang tanggal maksimal 1 bulan
- Karyawan bisa lihat schedule harian dan mingguan

### 6.5 Session
- Login tersimpan di localStorage
- Tidak perlu login ulang sampai session expire (24 jam)
- Token dihapus saat logout

---

## 7. Security

| Aspek | Implementasi |
|-------|--------------|
| **Password** | Hashed pakai bcrypt |
| **Session** | JWT token di localStorage (expire: 24 jam) |
| **Database** | Encrypted connection (SSL via Supabase) |
| **Face Data** | Disimpan sebagai embedding (128 float), bukan foto |
| **GPS** | Cross-check IP location untuk deteksi spoofing |
| **API** | Rate limiting, input validation |
| **RBAC** | Admin hanya akses data admin, karyawan hanya data sendiri |

---

## 8. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14+ (App Router), TypeScript |
| **UI Library** | Tailwind CSS + shadcn/ui |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (via Supabase) |
| **ORM** | Prisma |
| **Auth** | NextAuth.js + JWT |
| **Storage** | Supabase Storage (untuk foto selfie) |
| **Face Recognition** | face-api.js |
| **Email** | Resend / Nodemailer |
| **PDF** | React-PDF / Puppeteer |
| **Deployment** | Vercel |

---

## 9. Milestone

| Fase | Durasi | Deliverables |
|------|--------|--------------|
| **Fase 1: Setup** | 1 minggu | Setup project, database, authentication, session |
| **Fase 2: Absensi Core** | 2 minggu | Selfie + GPS + face recognition + geofencing |
| **Fase 3: Schedule** | 1 minggu | Manajemen jadwal kerja + import Excel |
| **Fase 4: Admin Panel** | 2 minggu | Dashboard, time management, approval, payroll |
| **Fase 5: Multi Branch** | 1 minggu | Manajemen cabang, geofencing per cabang |
| **Fase 6: Polish** | 1 minggu | Testing, bug fix, deployment |

**Total: ~8 minggu (2 bulan)**

---

*Document Created: 14 September 2026*  
*Updated: 14 September 2026 v3.0*
