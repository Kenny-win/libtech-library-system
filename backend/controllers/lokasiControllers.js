const db = require('../db');

const getLokasi = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id_lokasi, nama_lokasi FROM lokasi ORDER BY nama_lokasi ASC");
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching lokasi:", error);
    return res.status(500).json({ success: false, message: "Gagal mengambil data lokasi" });
  }
};

module.exports = { getLokasi };