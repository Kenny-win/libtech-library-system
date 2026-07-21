const db = require('../db');

// Mengambil semua feedback (Khusus Admin)
const getFeedback = async (req, res) => {
  try {
    const query = `
      SELECT f.*, u.nama, u.peran 
      FROM website_feedback f
      JOIN users u ON f.id_user = u.id_user
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengambil data feedback." });
  }
};

// Mengirim feedback baru (Siswa/Pegawai)
const addFeedback = async (req, res) => {
  const { id_user, kategori, rating, pesan } = req.body;

  if (!id_user || !pesan || !rating) {
    return res.status(400).json({ success: false, message: "Semua kolom wajib diisi!" });
  }

  try {
    await db.query(
      "INSERT INTO website_feedback (id_user, kategori, rating, pesan) VALUES (?, ?, ?, ?)",
      [id_user, kategori, rating, pesan]
    );
    res.status(201).json({ success: true, message: "Terima kasih! Feedback Anda berhasil dikirim." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengirim feedback." });
  }
};

// Mengubah status feedback (Khusus Admin)
const updateStatusFeedback = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query("UPDATE website_feedback SET status = ? WHERE id_feedback = ?", [status, id]);
    res.status(200).json({ success: true, message: "Status berhasil diubah." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal mengubah status." });
  }
};

module.exports = { getFeedback, addFeedback, updateStatusFeedback };