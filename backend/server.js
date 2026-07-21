require('dotenv').config(); // wajib berada di paling atas!!
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
// app.use(cors()) ini nanti ketika sudah berjalan baru buka

// sementara seperti dibawah dulu karena pakai ngrok
app.use(cors({
  origin: '*', 
  allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning'] // Mengizinkan sandi dari Ngrok
}));
app.use(express.json()); // Supaya server bisa membaca data JSON dari frontend

// Import Route Buku
const bukuRoutes = require('./routes/bukuRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const peminjamanRoutes = require('./routes/peminjamanRoutes');
const analitikRoutes = require('./routes/analitikRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ulasanRoutes = require('./routes/ulasanRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Konfigurasi Koneksi MySQL Pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tes Koneksi Database saat Server Menyala
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Gagal terhubung ke database:', err.message);
    } else {
        console.log('✅ Database MySQL Terhubung dengan Sukses!');
        connection.release(); // Kembalikan koneksi ke pool
    }
});

// // Mengatur folder penyimpanan file upload sementara
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = 'uploads/';
//     // Buat folder 'uploads' otomatis jika belum ada
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// Route Testing Dasar
app.get('/', (req, res) => {
    res.send('Selamat datang di API LibTech - Backend Ready!');
});

// Buat Route dengan prefix
app.use('/api/auth', authRoutes);
app.use('/api/buku', bukuRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/analitik', analitikRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ulasan', ulasanRoutes);
app.use('/api/feedback', feedbackRoutes);

// Menjalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});
