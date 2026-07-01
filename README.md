# 📚 LibTech - Sistem Manajemen Perpustakaan Terpadu

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)

**LibTech** adalah sistem informasi manajemen perpustakaan modern berskala *Enterprise* yang dirancang khusus untuk memenuhi kebutuhan sirkulasi, manajemen katalog, dan analitik di lingkungan sekolah (Siswa, Pegawai, dan Pustakawan).

Aplikasi ini dikembangkan untuk memfasilitasi ekosistem literasi digital di **Sekolah Bodhicitta**.

---

## ✨ Fitur Unggulan

- 🔐 **Autentikasi Multi-Peran (RBAC):** Akses spesifik yang dibedakan antara Pustakawan (Admin), Pegawai, dan Siswa.
- 📈 **Dasbor Analitik Real-Time:** Visualisasi data interaktif menggunakan grafik (*Line Chart, Bar Chart, Doughnut Chart*) untuk memantau tren peminjaman, kategori terpopuler, dan performa sirkulasi.
- 🔄 **Manajemen Sirkulasi Pintar:** Proses *Approval* (Setujui/Tolak), penyesuaian tenggat waktu fleksibel, dan kalkulasi denda otomatis.
- 📚 **Katalog Cerdas & Load More:** Katalog buku yang cepat (anti-lag) dilengkapi pencarian cerdas berdasarkan multi-filter.
- 📤 **Import & Export Excel:** Kemudahan menambah ratusan data buku maupun data pengguna (*User*) dalam sekali klik menggunakan *spreadsheet*.
- 📧 **Pemulihan Kata Sandi Otomatis:** Fitur lupa *password* yang terintegrasi dengan persetujuan Admin dan pengiriman notifikasi otomatis via Email (Nodemailer).
- 🌗 **Glassmorphism & Dark Mode:** Antarmuka pengguna (UI) modern yang memanjakan mata, dilengkapi fitur peralihan Mode Terang dan Mode Gelap.

---

## 🛠️ Teknologi yang Digunakan

**Frontend:**
- [React.js](https://reactjs.org/) (Vite)
- [Tailwind CSS v3](https://tailwindcss.com/)
- Recharts (Visualisasi Data)
- Multer / XLSX (Import/Export Data)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- [MySQL2](https://www.npmjs.com/package/mysql2) (Prepared Statements & Promise)
- Nodemailer (SMTP Email Server)

---

## 🚀 Panduan Instalasi (Lokal)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi LibTech di komputer lokal Anda.

### Persiapan Database
1. Buat database baru di MySQL dengan nama `db_perpus_sekolah`.
2. *Import* struktur tabel dan *Trigger* dari file `.sql` Anda ke dalam database tersebut.

## 🚀 Panduan Instalasi (Lokal)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi LibTech di komputer lokal Anda.

### 1. Persiapan Database (MySQL)
1. Buka XAMPP / Laragon, nyalakan modul **MySQL**.
2. Buat database baru di MySQL dengan nama `db_perpus_sekolah`.
3. *Import* struktur tabel dan *Trigger* dari file `.sql` *backup* Anda ke dalam database tersebut.

### 2. Pengaturan Backend (Server API)
Backend dibangun menggunakan Node.js dan Express.
1. Buka terminal, arahkan ke folder backend: `cd backend`.
2. Instal semua dependensi pendukung: `npm install`
3. Buat file `.env` di dalam folder `backend/` dan isi dengan konfigurasi database serta kredensial email Anda:
`
DB_HOST=localhost
`

`
DB_USER=root
`

`
DB_PASSWORD=
`

`
DB_NAME=db_perpus_sekolah
`

`
EMAIL_USER=email_resmi_sekolah@gmail.com
`

`
EMAIL_PASS=16_digit_app_password_google
`

5. Jalankan server backend: `node server.js`
*(Catatan: Jika Anda telah memasang `nodemon` di package.json, Anda dapat menggunakan perintah `npm run dev` agar server otomatis me-restart saat ada perubahan kode).*
   
   Server backend akan berjalan di **`http://localhost:5000`**.
   
### 3. Pengaturan Frontend (Client UI)
Frontend dibangun menggunakan React.js dan Vite.
1. Buka terminal baru, arahkan ke folder frontend: `cd frontend`
2. Instal semua dependensi UI dan Library (seperti Tailwind, Recharts, dll): `npm install`
3. Jalankan server pengembangan Vite: `npm run dev`
4. Buka tautan lokal yang diberikan Vite di terminal (biasanya **`http://localhost:5173`**) melalui *browser* Anda.
---

## 👨‍💻 Pengembang

Sistem ini dirancang dan dikembangkan oleh:
- **Kenny Calnelius Winata, M.Kom.** - Software Developer & Mandarin Teacher
- **Shelvy Wu, S.Kom.** - Software Developer

*(Hak Cipta © 2026 Perpustakaan Sekolah)*

