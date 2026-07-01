const db = require('../db');

// mngambil daftar semua sirkulasi peminjaman
const getPeminjaman = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id_peminjaman, p.tanggal_pinjam, p.tanggal_harus_kembali, 
        p.tanggal_kembali_asli, p.jumlah_hari_terlambat, p.status, p.denda,
        b.id_buku, b.judul, b.penulis, b.penerbit, b.stok, b.cover_drive_id,
        u.nama, u.peran, u.kelas, u.nis_nip
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      JOIN users u ON p.id_user = u.id_user
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data peminjaman" });
  }
};

// mengubah status peminjaman (Misal: dari 'pending' menjadi 'dipinjam', atau 'kembali')
const updateStatusPeminjaman = async (req, res) => {
  const { id } = req.params;
  const { status, tanggal_harus_kembali } = req.body; // Terima tanggal_harus_kembali dari frontend

  try {
    let query = "UPDATE peminjaman SET status = ?";
    let params = [status];

    // Jika status disetujui ("dipinjam") dan admin mengirimkan tanggal tenggat baru, update juga tanggalnya!
    if (status === 'dipinjam' && tanggal_harus_kembali) {
      query += ", tanggal_harus_kembali = ?";
      params.push(tanggal_harus_kembali);
    }

    query += " WHERE id_peminjaman = ?";
    params.push(id);

    const [result] = await db.query(query, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
    }
    
    res.status(200).json({ success: true, message: `Status berhasil diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengubah status peminjaman" });
  }
};

// Mengajukan peminjaman baru (Siswa/pegawai)
const createPeminjaman = async (req, res) => {
  const { id_buku, id_user } = req.body;

  try {
    // Validasi sederhana
    if (!id_buku || !id_user) {
      return res.status(400).json({ success: false, message: "Buku dan User harus diisi" });
    }

    // Insert ke tabel peminjaman
    // CURDATE() = tanggal hari ini di MySQL
    // DATE_ADD(CURDATE(), INTERVAL 7 DAY) = tenggat waktu otomatis 7 hari ke depan
    const query = `
      INSERT INTO peminjaman (id_user, id_buku, tanggal_pinjam, tanggal_harus_kembali, status)
      VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'pending')
    `;
    
    const [result] = await db.query(query, [id_user, id_buku]);

    res.status(201).json({ 
      success: true, 
      message: "Permintaan peminjaman berhasil dikirim. Menunggu persetujuan pustakawan." 
    });
  } catch (error) {
    console.error("Error create peminjaman:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan pada server saat meminjam buku." });
  }
};

// Mengambil daftar peminjaman khusus untuk 1 User (Siswa/Pegawai)
const getPeminjamanByUser = async (req, res) => {
  const { id_user } = req.params;

  try {
    const query = `
      SELECT 
        p.id_peminjaman, p.tanggal_pinjam, p.tanggal_harus_kembali, 
        p.tanggal_kembali_asli, p.jumlah_hari_terlambat, p.status, p.denda,
        b.id_buku, b.judul, b.penulis, b.penerbit, b.cover_drive_id
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      WHERE p.id_user = ?
      ORDER BY p.created_at DESC
    `;
    const [rows] = await db.query(query, [id_user]);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error get peminjaman by user:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data pinjaman Anda" });
  }
};

module.exports = { getPeminjaman, updateStatusPeminjaman, createPeminjaman, getPeminjamanByUser };