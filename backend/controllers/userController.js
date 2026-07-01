const db = require('../db');
const xlsx = require('xlsx');

// Mengambil Daftar Semua User (Siswa/Pegawai/Admin)
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id_user, nis_nip, nama, email, peran, kelas, created_at FROM users ORDER BY created_at DESC");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data pengguna." });
  }
};

// Mengunggah File Excel dan Import ke Database
const uploadUsersExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Tidak ada file Excel yang diunggah." });
  }

  try {
    // Membaca file dari memory buffer multer
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: "File Excel kosong atau format tidak sesuai." });
    }

    let successCount = 0;
    let failCount = 0;

    for (const row of data) {
      // Pastikan nama kolom di Excel (Header) persis dengan yang ada di kurung siku ini
      const nis_nip = row['NIS/NIP'];
      const nama = row['Nama'];
      const email = row['Email'];
      const password = row['Password'] || '123456'; // Default password jika di Excel kosong
      const peran = row['Peran'] ? row['Peran'].toLowerCase() : 'siswa';
      const kelas = row['Kelas'] || null;

      // Skip jika data penting kosong
      if (!nis_nip || !nama || !email) {
        failCount++;
        continue;
      }

      try {
        await db.query(
          "INSERT INTO users (nis_nip, nama, email, password, peran, kelas) VALUES (?, ?, ?, ?, ?, ?)",
          [nis_nip, nama, email, password, peran, kelas]
        );
        successCount++;
      } catch (err) {
        // Akan gagal (masuk catch) jika ada Email atau NIS yang ganda (karena UNIQUE constraint)
        failCount++;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Selesai! Berhasil impor: ${successCount} data. Gagal: ${failCount} data (mungkin email ganda atau data kosong).` 
    });

  } catch (error) {
    console.error("Error upload users:", error);
    res.status(500).json({ success: false, message: "Gagal memproses file Excel." });
  }
};

// Menambah Satu User Secara Manual
const createUser = async (req, res) => {
  const { nis_nip, nama, email, password, peran, kelas } = req.body;
  
  if (!nis_nip || !nama || !email || !password || !peran) {
    return res.status(400).json({ success: false, message: "Semua kolom wajib diisi!" });
  }

  try {
    await db.query(
      "INSERT INTO users (nis_nip, nama, email, password, peran, kelas) VALUES (?, ?, ?, ?, ?, ?)",
      [nis_nip, nama, email, password, peran, kelas || null]
    );
    res.status(201).json({ success: true, message: "Pengguna berhasil ditambahkan" });
  } catch (error) {
    // Tangani error jika email atau NIS ganda (Duplicate Entry)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Email atau NIS/NIP sudah terdaftar!" });
    }
    console.error("Error create user:", error);
    res.status(500).json({ success: false, message: "Gagal menambah pengguna." });
  }
};

// Memperbarui Data User (Edit)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nis_nip, nama, email, password, peran, kelas } = req.body;

  if (!nis_nip || !nama || !email || !peran) {
    return res.status(400).json({ success: false, message: "Semua kolom wajib diisi!" });
  }

  try {
    // Jika admin mengisi password baru, update passwordnya juga. Jika kosong, biarkan password lama.
    let query = "UPDATE users SET nis_nip = ?, nama = ?, email = ?, peran = ?, kelas = ?";
    let params = [nis_nip, nama, email, peran, kelas || null];

    if (password) {
      query += ", password = ?";
      params.push(password);
    }

    query += " WHERE id_user = ?";
    params.push(id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    res.status(200).json({ success: true, message: "Data pengguna berhasil diperbarui" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Email atau NIS/NIP sudah terdaftar oleh pengguna lain!" });
    }
    console.error("Error update user:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui pengguna." });
  }
};

// Menghapus User (Delete)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM users WHERE id_user = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    res.status(200).json({ success: true, message: "Pengguna berhasil dihapus." });
  } catch (error) {
    // Error 1451: Menghalangi penghapusan jika user punya riwayat peminjaman buku
    if (error.errno === 1451) {
      return res.status(400).json({ success: false, message: "Pengguna ini tidak bisa dihapus karena masih memiliki riwayat peminjaman!" });
    }
    console.error("Error delete user:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus pengguna." });
  }
};

module.exports = { getUsers, uploadUsersExcel, createUser, updateUser, deleteUser };