# Panduan Deployment HRIS CSB
## Untuk Non-Technical User

Panduan ini akan membantu Anda step-by-step dari nol sampai aplikasi bisa dipakai karyawan.

---

## YANG PERLU ANDA SIAPKAN

| Item | Keterangan |
|------|------------|
| ✅ Email aktif | Untuk daftar akun |
| ✅ Laptop/PC | Untuk setup awal |
| ✅ HP karyawan | Untuk akses aplikasi |
| ✅ Internet | Untuk akses Vercel & Supabase |

---

## TAHAP 1: BUAT AKUN GitHub

GitHub adalah tempat menyimpan kode aplikasi (seperti Google Drive untuk kode).

1. Buka **github.com**
2. Klik **Sign up**
3. Isi:
   - Email Anda
   - Password
   - Username (misal: `csbdev`)
4. Verifikasi email
5. Selesai! Akun GitHub sudah jadi

---

## TAHAP 2: BUAT AKUN Supabase (Database)

1. Buka **supabase.com**
2. Klik **Sign in with GitHub** (pakai akun yang tadi)
3. Klik **New Project**
4. Isi:
   - **Organization**: Create new → nama bebas (misal: CSB)
   - **Project name**: `hris-csb`
   - **Database Password**: Buat password baru (CATAT!)
   - **Region**: `Southeast Asia (Singapore)`
5. Klik **Create new project**
6. Tunggu ~2 menit sampai selesai
7. Klik **Connection string** → **URI** → Copy
   - Format: `postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
   - **SIMPAN INI!** (akan dipakai di tahap deployment)

---

## TAHAP 3: BUAT AKUN Vercel (Hosting)

1. Buka **vercel.com**
2. Klik **Sign up** → **Continue with GitHub**
3. Authorize Vercel → Login
4. Selesai! Vercel sudah terhubung ke GitHub

---

## TAHAP 4: UPLOAD KODE KE GITHUB

> **Catatan**: Tahap ini dilakukan oleh developer (atau saya bantu nanti)

```bash
# Buka terminal di folder project
cd "C:\Users\User\Desktop\HRIS CSB"

# Init git repository
git init
git add .
git commit -m "Initial commit: HRIS CSB"

# Buat repository baru di GitHub, lalu push
git remote add origin https://github.com/csbdev/hris-csb.git
git push -u origin main
```

---

## TAHAP 5: SETUP DATABASE

### 5.1 Jalankan Migration

```bash
# Di folder project
npx prisma migrate dev --name init
```

### 5.2 Seed Data Awal

```bash
# Insert data awal (2 cabang + admin + 2 karyawan sample)
npx tsx src/lib/seed.ts
```

**Data yang akan di-insert:**

| Cabang | Alamat | Jam Kerja |
|--------|--------|-----------|
| Kantor Pusat Jakarta | Jl. Sudirman No. 1 | 08:00 - 17:00 |
| Cabang Bandung | Jl. Asia Afrika No. 1 | 07:30 - 16:30 |

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin HR | admin@csb.com | admin123 | ADMIN |
| Budi Santoso | budi@csb.com | karyawan123 | KARYAWAN |
| Siti Aminah | siti@csb.com | karyawan123 | KARYAWAN |

---

## TAHAP 6: DEPLOY KE VERCEL

### Cara Deploy dari Vercel

1. Login ke **vercel.com**
2. Klik **+ Add New** → **Project**
3. Pilih repository `hris-csb`
4. Klik **Import**
5. Pada bagian **Environment Variables**, tambahkan:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | `postgresql://...` (dari Supabase) |
   | `JWT_SECRET` | `hris-csb-secret-key-change-in-production` |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (dari Supabase) |

6. Klik **Deploy**
7. Tunggu ~3 menit
8. Klik **Visit** untuk membuka aplikasi

---

## TAHAP 7: SETUP AWAL APLIKASI

### 7.1 Login sebagai Admin

1. Buka link yang didapat dari Vercel
2. Login dengan akun admin:
   - Email: `admin@csb.com`
   - Password: `admin123`
3. **Ganti password** setelah login pertama kali

### 7.2 Buat Akun Karyawan

1. Masuk ke menu **👥 Karyawan**
2. Klik **+ Tambah Karyawan**
3. Isi data:
   - Nama lengkap
   - Email (untuk login)
   - Password
   - No HP
   - Cabang (pilih)
   - Jabatan
   - Tanggal masuk
4. Karyawan sudah bisa login

### 7.3 Setup Lokasi Cabang

1. Masuk ke menu **📍 Cabang**
2. Klik **+ Tambah Cabang**
3. Isi:
   - Nama cabang
   - Alamat lengkap
   - **Latitude & Longitude** (cari di Google Maps)
   - Radius (misal: 100 meter)
   - Jam kerja (misal: 08:00 - 17:00)

### 7.4 Karyawan Registrasi Wajah

1. Karyawan login di HP
2. Masuk ke menu **👤 Profil** → **Registrasi Wajah**
3. Ambil selfie 3-5 foto dengan angle berbeda
4. Sistem akan menyimpan data wajah
5. Selesai! Sudah bisa absen

---

## TAHAP 8: KARYAWAN ABSENSI

### Dari HP Karyawan

1. Buka browser (Chrome/Safari)
2. Ketik: `hris-csb.vercel.app`
3. Login dengan email & password
4. Klik menu **⏰ Absen**
5. Klik tombol **Absen Masuk** atau **Absen Pulang**
6. Izinkan akses kamera
7. Izinkan akses lokasi (GPS)
8. Ambil selfie
9. Tunggu proses verifikasi
10. Jika berhasil → Absensi tercatat ✅

### Yang Dilihat Karyawan

- Status absen hari ini (hadir/terlambat/alpa)
- Jam masuk & pulang
- Riwayat absensi mingguan di **🏠 Home**
- Jadwal kerja di **📅 Schedule Saya**

---

## TAHAP 9: ADMIN MONITORING

### Dari Browser (Laptop/HP)

1. Login sebagai Admin
2. Dashboard akan menampilkan:
   - Jumlah karyawan hadir/terlambat/alpa hari ini
   - Rekap per cabang
   - Absensi terakhir (real-time)
3. Buka menu **⏰ Time Management** untuk:
   - Lihat rekap absensi
   - Filter per tanggal/karyawan/cabang
   - Export Excel
4. Buka menu **✅ Approval** untuk:
   - Setujui/tolak absensi luar radius

---

## TROUBLESHOOTING

| Masalah | Solusi |
|---------|--------|
| GPS tidak muncul | Pastikan izin lokasi aktif di browser |
| Kamera tidak aktif | Izinkan akses kamera di browser |
| Face recognition gagal | Pastikan pencahayaan cukup, wajah terlihat jelas |
| Tidak bisa absen (di luar radius) | Pastikan GPS aktif dan berada di area kantor |
| Lupa password | Hubungi admin untuk reset |
| Database penuh | Hubungi developer untuk upgrade Supabase |

---

## LINK PENTING

| Layanan | URL |
|---------|-----|
| Aplikasi HRIS | `hris-csb.vercel.app` |
| Vercel Dashboard | `vercel.com/dashboard` |
| Supabase Dashboard | `supabase.com/dashboard` |
| GitHub Repository | `github.com/csbdev/hris-csb` |

---

## ESTIMASI BIAYA TAHUNAN

```
┌─────────────────────────────────────────────┐
│           BIAYA TAHUN PERTAMA               │
├─────────────────────────────────────────────┤
│ Vercel (Free)           : Rp 0             │
│ Supabase (Free)         : Rp 0             │
│ Domain (opsional)       : Rp 150.000/tahun │
│ ─────────────────────────────────────────── │
│ TOTAL                   : Rp 0 - 150.000   │
└─────────────────────────────────────────────┘
```

---

## AKUN DEFAULT

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin HR | admin@csb.com | admin123 | ADMIN |
| Budi Santoso | budi@csb.com | karyawan123 | KARYAWAN |
| Siti Aminah | siti@csb.com | karyawan123 | KARYAWAN |

**⚠️ Ganti password setelah login pertama kali!**

---

*Panduan ini dibuat: 14 September 2026*
