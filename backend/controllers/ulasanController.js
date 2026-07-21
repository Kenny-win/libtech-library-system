const db = require('../db');

// 1. Mengambil semua ulasan untuk satu buku tertentu
const getUlasanByBuku = async (req, res) => {
  const { id_buku } = req.params;
  try {
    const query = `
      SELECT ub.id_ulasan, ub.id_user, ub.rating, ub.komentar, ub.created_at, u.nama, u.peran 
      FROM ulasan_buku ub
      JOIN users u ON ub.id_user = u.id_user
      WHERE ub.id_buku = ?
      ORDER BY ub.created_at DESC
    `;
    const [rows] = await db.query(query, [id_buku]);

    // Hitung rata-rata rating
    const totalRating = rows.reduce((acc, curr) => acc + curr.rating, 0);
    const rataRata = rows.length > 0 ? (totalRating / rows.length).toFixed(1) : 0;

    res.status(200).json({ 
      success: true, 
      data: rows,
      rataRata: rataRata,
      totalUlasan: rows.length
    });
  } catch (error) {
    console.error("Error get ulasan:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil ulasan buku" });
  }
};

// 2. Menambahkan ulasan baru
const addUlasan = async (req, res) => {
  const { id_buku, id_user, rating, komentar } = req.body;

  if (!id_buku || !id_user || !rating) {
    return res.status(400).json({ success: false, message: "Rating wajib diisi!" });
  }

  try {
    // Cek apakah user sudah pernah memberi ulasan di buku ini (opsional: 1 user 1 review per buku)
    const [existing] = await db.query("SELECT id_ulasan FROM ulasan_buku WHERE id_buku = ? AND id_user = ?", [id_buku, id_user]);
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Anda sudah pernah memberikan ulasan untuk buku ini." });
    }

    await db.query(
      "INSERT INTO ulasan_buku (id_buku, id_user, rating, komentar) VALUES (?, ?, ?, ?)",
      [id_buku, id_user, rating, komentar || ""]
    );

    res.status(201).json({ success: true, message: "Ulasan berhasil dikirim! Terima kasih." });
  } catch (error) {
    console.error("Error add ulasan:", error);
    res.status(500).json({ success: false, message: "Gagal mengirim ulasan" });
  }
};

// 3. Memperbarui Ulasan yang sudah ada (Edit Review)
const updateUlasan = async (req, res) => {
  const { id_ulasan } = req.params;
  const { rating, komentar, id_user } = req.body; 

  if (!rating) {
    return res.status(400).json({ success: false, message: "Rating wajib diisi!" });
  }

  try {
    // Validasi keamanan: Pastikan ulasan ini benar milik user yang sedang login
    const [existing] = await db.query("SELECT id_user FROM ulasan_buku WHERE id_ulasan = ?", [id_ulasan]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: "Ulasan tidak ditemukan." });
    if (existing[0].id_user !== id_user) return res.status(403).json({ success: false, message: "Akses ditolak." });

    // Update ulasan
    await db.query(
      "UPDATE ulasan_buku SET rating = ?, komentar = ? WHERE id_ulasan = ?",
      [rating, komentar || "", id_ulasan]
    );

    res.status(200).json({ success: true, message: "Ulasan berhasil diperbarui!" });
  } catch (error) {
    console.error("Error update ulasan:", error);
    res.status(500).json({ success: false, message: "Gagal memperbarui ulasan" });
  }
};

module.exports = { getUlasanByBuku, addUlasan, updateUlasan };