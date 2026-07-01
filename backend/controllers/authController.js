const db = require('../db');
const nodemailer = require('nodemailer');

// Fungsi untuk login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email dan password wajib diisi!" });
  }

  try {
    // Cari user berdasarkan email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Email tidak terdaftar." });
    }

    const user = users[0];

    // Cek password (karena saat ini masih plain text tanpa hash bcrypt)
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Password salah!" });
    }

    // Jika sukses, kita kirimkan data user TANPA password ke frontend
    const userData = {
      id_user: user.id_user,
      nama: user.nama,
      email: user.email,
      peran: user.peran,
      kelas: user.kelas,
      nis_nip: user.nis_nip
    };

    res.status(200).json({ 
      success: true, 
      message: "Login berhasil!", 
      data: userData 
    });

  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// Fungsi Mengajukan Lupa Password (Dari Halaman Login)
const requestResetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email wajib diisi!" });
  }

  try {
    // 1. Cek apakah email terdaftar di tabel users
    const [users] = await db.query("SELECT id_user, nama FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "Email tidak ditemukan di sistem kami." });
    }
    const user = users[0];

    // 2. Cek apakah user ini sudah mengajukan dan statusnya masih 'pending'
    const [existingRequest] = await db.query(
      "SELECT id_request FROM reset_password_requests WHERE id_user = ? AND status = 'pending'", 
      [user.id_user]
    );

    if (existingRequest.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Anda sudah mengajukan reset password sebelumnya. Silakan tunggu Admin memprosesnya, atau cek email Anda." 
      });
    }

    // 3. Jika aman, masukkan pengajuan baru ke database
    await db.query(
      "INSERT INTO reset_password_requests (id_user, email, status) VALUES (?, ?, 'pending')",
      [user.id_user, email]
    );

    res.status(200).json({ 
      success: true, 
      message: "Pengajuan berhasil dikirim! Silakan tunggu Admin mereset password Anda dan mengirimkannya via email." 
    });

  } catch (error) {
    console.error("Error request reset:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

// Mengambil daftar pengajuan Lupa Password (Khusus Admin)
const getResetRequests = async (req, res) => {
  try {
    const query = `
      SELECT r.id_request, r.email, r.status, r.created_at, u.nama, u.peran 
      FROM reset_password_requests r
      JOIN users u ON r.id_user = u.id_user
      WHERE r.status = 'pending'
      ORDER BY r.created_at ASC
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data pengajuan" });
  }
};

// Memproses Reset Password (Oleh Admin)
const approveResetRequest = async (req, res) => {
  const { id_request } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ success: false, message: "Password baru wajib diisi!" });
  }

  try {
    // Ambil data pengajuannya
    const [requests] = await db.query("SELECT * FROM reset_password_requests WHERE id_request = ?", [id_request]);
    if (requests.length === 0) return res.status(404).json({ success: false, message: "Pengajuan tidak ditemukan" });

    const request = requests[0];

    // Update password di tabel users
    await db.query("UPDATE users SET password = ? WHERE id_user = ?", [newPassword, request.id_user]);

    // Tandai pengajuan selesai
    await db.query("UPDATE reset_password_requests SET status = 'selesai' WHERE id_request = ?", [id_request]);

    // LOGIKA MENGIRIM EMAIL (NODEMAILER) 
    // Konfigurasi email pengirim (Gunakan Gmail perpus dan 'App Password' dari akun Google)
    // Untuk tahap testing, pastikan untuk mengatur EMAIL_USER dan EMAIL_PASS di file .env source code
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'emailsekolah@gmail.com', // Ganti dengan email asli
        pass: process.env.EMAIL_PASS || 'passwordaplikasi',       // Ganti dengan App Password Gmail
      }
    });

    const mailOptions = {
      from: 'Perpustakaan Sekolah',
      to: request.email,
      subject: 'Pemberitahuan Reset Password Perpustakaan',
      text: `Halo ${request.email},\n\nPassword Anda telah berhasil di-reset oleh Admin Perpustakaan.\n\nPassword baru Anda adalah: ${newPassword}\n\nSilakan login menggunakan password baru ini dan jangan berikan kepada siapapun.\n\nTerima kasih.`
    };

    // Kirim email (diberi catch error agar kalau email gagal terkirim, aplikasi tidak crash)
    transporter.sendMail(mailOptions).catch(err => console.error("Gagal kirim email:", err));

    res.status(200).json({ success: true, message: "Password berhasil diubah dan email notifikasi sedang dikirim!" });
  } catch (error) {
    console.error("Error approve reset:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
  }
};

module.exports = { login, requestResetPassword, getResetRequests, approveResetRequest };