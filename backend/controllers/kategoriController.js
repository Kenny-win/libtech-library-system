const db = require('../db');
const xlsx = require('xlsx'); 

// READ: Mengambil kategori beserta jumlah bukunya
const getKategori = async (req, res) => {
  try {
    const query = `
      SELECT k.id_kategori, k.nama_kategori, COUNT(b.id_buku) as jumlah_buku
      FROM kategori k
      LEFT JOIN buku b ON k.id_kategori = b.id_kategori
      GROUP BY k.id_kategori
      ORDER BY k.nama_kategori ASC
    `;
    const [rows] = await db.query(query);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Gagal mengambil data kategori" });
  }
};

// CREATE: Menambah kategori baru
const createKategori = async (req, res) => {
  const { nama_kategori } = req.body;
  if (!nama_kategori) return res.status(400).json({ success: false, message: "Nama kategori wajib diisi" });

  try {
    const [result] = await db.query("INSERT INTO kategori (nama_kategori) VALUES (?)", [nama_kategori]);
    res.status(201).json({ success: true, message: "Kategori berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal menambah kategori" });
  }
};

// UPDATE: Mengubah nama kategori
const updateKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;
  if (!nama_kategori) return res.status(400).json({ success: false, message: "Nama kategori wajib diisi" });

  try {
    const [result] = await db.query("UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?", [nama_kategori, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    
    res.status(200).json({ success: true, message: "Kategori berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gagal memperbarui kategori" });
  }
};

// DELETE: Menghapus kategori
const deleteKategori = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM kategori WHERE id_kategori = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    
    res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    // Error 1451 biasanya muncul jika kategori sedang dipakai oleh buku (Foreign Key Constraint)
    if (error.errno === 1451) {
      return res.status(400).json({ success: false, message: "Kategori tidak bisa dihapus karena masih ada buku di dalamnya!" });
    }
    res.status(500).json({ success: false, message: "Gagal menghapus kategori" });
  }
};

const uploadKategoriExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Tidak ada file Excel yang diunggah." });
  }

  try {
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
      const nama_kategori = row['Nama Kategori'];

      // Abaikan jika baris kosong
      if (!nama_kategori) {
        failCount++;
        continue;
      }

      try {
        // Cek agar tidak memasukkan kategori yang namanya sama ganda
        const [existing] = await db.query("SELECT id_kategori FROM kategori WHERE nama_kategori = ?", [nama_kategori]);
        if (existing.length > 0) {
          failCount++;
          continue; // Kategori sudah ada, lewati
        }

        await db.query("INSERT INTO kategori (nama_kategori) VALUES (?)", [nama_kategori]);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Selesai! Berhasil impor: ${successCount} kategori. Gagal/Duplikat: ${failCount} kategori.` 
    });

  } catch (error) {
    console.error("Error upload kategori:", error);
    res.status(500).json({ success: false, message: "Gagal memproses file Excel." });
  }
};

module.exports = { getKategori, createKategori, updateKategori, deleteKategori, uploadKategoriExcel  };