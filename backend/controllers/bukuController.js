// Kita panggil koneksi database dari server.js nanti, 
// tapi untuk sekarang kita parsing db lewat parameter atau import langsung.
const mysql = require('mysql2');
const XLSX = require('xlsx'); // WAJIB ada untuk membaca excel
const fs = require('fs');      // WAJIB ada untuk menghapus file
const db = require("../db");

// Fungsi untuk mengambil semua buku
const getSemuaBuku = async (req, res) => {
    try {
        // Query JOIN untuk mengambil nama kategori sekaligus
        const [rows] = await db.query(`
            SELECT b.*, k.nama_kategori 
            FROM buku b 
            LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
        `);
        
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data buku",
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data buku",
            error: error.message
        });
    }
};


// POST TAMBAH BUKU (BARU)
const tambahBuku = async (req, res) => {
    // Ambil data yang dikirim oleh React/Postman nanti di dalam req.body
    const { isbn, id_kategori, judul, penulis, penerbit, tahun_terbit, stok, no_lemari, no_rak, tingkatan, cover_drive_id } = req.body;

    // Validasi dasar: Kolom wajib jangan sampai kosong
    if (!judul || !penulis || !penerbit || !tahun_terbit) {
        return res.status(400).json({ success: false, message: "Kolom judul, penulis, penerbit, dan tahun terbit wajib diisi!" });
    }

    try {
        const query = `
            INSERT INTO buku (isbn, id_kategori, judul, penulis, penerbit, tahun_terbit, stok, no_lemari, no_rak, tingkatan, cover_drive_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(query, [isbn, id_kategori, judul, penulis, penerbit, tahun_terbit, stok, no_lemari, no_rak, tingkatan, cover_drive_id]);

        res.status(201).json({
            success: true,
            message: "Buku baru berhasil ditambahkan ke perpustakaan!"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Gagal menambahkan buku", error: error.message });
    }
};

// Fungsi import Excel
const importExcel = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file diunggah' });
    }

    const filePath = req.file.path;

    try {
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const dataExcel = XLSX.utils.sheet_to_json(worksheet);

        for (const row of dataExcel) {
            // Sesuaikan nama field dengan yang ada di Excel
            const query = `
                INSERT INTO buku (judul, penulis, penerbit, tahun_terbit, stok, isbn, id_kategori, no_lemari, no_rak, tingkatan, cover_drive_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                row['Judul'] || 'Tanpa Judul',
                row['Penulis'] || '-',
                row['Penerbit'] || '-',
                row['Tahun Terbit'] || 2026,
                row['Stok'] || 1,
                row['ISBN'] || null,
                row['ID Kategori'] || 1,
                row['No Lemari'] || 1,
                row['No Rak'] || 1,
                row['Tingkatan'] || 'Umum',
                row['Cover Drive ID'] || null
            ];
            
            await db.query(query, values); // Cukup db.query karena sudah .promise()
        }

        fs.unlinkSync(filePath); // Hapus file setelah proses selesai
        res.status(200).json({ success: true, message: `Berhasil mengimpor ${dataExcel.length} buku.` });

    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ success: false, message: "Error Import: " + error.message });
    }
};

// Fungsi Hapus Buku
const deleteBuku = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM buku WHERE id_buku = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Buku berhasil dihapus" });
  } catch (error) {
    console.error("Error delete buku:", error);
    return res.status(500).json({ success: false, message: "Gagal menghapus buku" });
  }
};

// Fungsi Edit Buku
const updateBuku = async (req, res) => {
  const { id } = req.params;
  const { judul, penulis, penerbit, tahun_terbit, stok, isbn, id_kategori, no_lemari, no_rak, tingkatan, cover_drive_id } = req.body;
  
  try {
    const query = `
      UPDATE buku 
      SET judul = ?, penulis = ?, penerbit = ?, tahun_terbit = ?, stok = ?, isbn = ?, id_kategori = ?, no_lemari = ?, no_rak = ?, tingkatan = ?, cover_drive_id = ?
      WHERE id_buku = ?
    `;
    const values = [judul, penulis, penerbit, tahun_terbit, stok, isbn, id_kategori, no_lemari, no_rak, tingkatan, cover_drive_id, id];
    
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }
    return res.status(200).json({ success: true, message: "Buku berhasil diperbarui" });
  } catch (error) {
    console.error("Error update buku:", error);
    return res.status(500).json({ success: false, message: "Gagal memperbarui buku" });
  }
};

module.exports = { getSemuaBuku, tambahBuku, importExcel, deleteBuku, updateBuku, };