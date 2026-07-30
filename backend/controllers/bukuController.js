// Kita panggil koneksi database dari server.js nanti,
// tapi untuk sekarang kita parsing db lewat parameter atau import langsung.
const mysql = require("mysql2");
const XLSX = require("xlsx");
const fs = require("fs");
const db = require("../db"); // Import pool

// Fungsi Mengambil Semua Buku (Diupdate agar menampilkan multi-lokasi)
const getSemuaBuku = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.*, 
        k.nama_kategori,
        IFNULL(AVG(ub.rating), 0) AS rating_rata,
        COUNT(ub.id_ulasan) AS total_ulasan,
        GROUP_CONCAT(DISTINCT l.nama_lokasi SEPARATOR ', ') AS daftar_lokasi,
        GROUP_CONCAT(DISTINCT l.id_lokasi SEPARATOR ', ') AS daftar_id_lokasi 
      FROM buku b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN ulasan_buku ub ON b.id_buku = ub.id_buku
      LEFT JOIN buku_lokasi bl ON b.id_buku = bl.id_buku
      LEFT JOIN lokasi l ON bl.id_lokasi = l.id_lokasi
      GROUP BY b.id_buku
      ORDER BY b.id_buku DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching buku:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data buku" });
  }
};

// Fungsi Tambah Buku Manual (Diupdate untuk tabel buku_lokasi)
const tambahBuku = async (req, res) => {
  const {
    isbn,
    id_kategori,
    judul,
    penulis,
    penerbit,
    tahun_terbit,
    stok,
    no_lemari,
    no_rak,
    tingkatan,
    cover_drive_id,
    lokasi, // <-- Ini BARU, kita asumsikan array misal: [1, 5]
  } = req.body;

  if (!judul || !penulis || !penerbit || !tahun_terbit) {
    return res.status(400).json({
      success: false,
      message: "Kolom judul, penulis, penerbit, dan tahun terbit wajib diisi!",
    });
  }

  try {
    // Simpan data buku utama dulu
    const queryBuku = `
      INSERT INTO buku (isbn, id_kategori, judul, penulis, penerbit, tahun_terbit, stok, no_lemari, no_rak, tingkatan, cover_drive_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [resultBuku] = await db.query(queryBuku, [
      isbn,
      id_kategori,
      judul,
      penulis,
      penerbit,
      tahun_terbit,
      stok,
      no_lemari,
      no_rak,
      tingkatan,
      cover_drive_id,
    ]);

    const idBukuBaru = resultBuku.insertId;

    // Simpan multi-lokasi jika ada array 'lokasi' yang dikirim
    if (lokasi && Array.isArray(lokasi) && lokasi.length > 0) {
      for (const idLokasi of lokasi) {
        await db.query(
          "INSERT INTO buku_lokasi (id_buku, id_lokasi) VALUES (?, ?)",
          [idBukuBaru, idLokasi],
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Buku baru berhasil ditambahkan ke perpustakaan!",
    });
  } catch (error) {
    console.error("Error tambah buku:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan buku",
      error: error.message,
    });
  }
};

// Fungsi Import Excel (Diupdate untuk multi-lokasi dan string kosong/strip "-")
const importExcel = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Tidak ada file diunggah" });
  }
  const filePath = req.file.path;
  try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dataExcel = XLSX.utils.sheet_to_json(worksheet);

    for (const row of dataExcel) {
      // Menangani lemari & rak yang isinya strip '-' atau kosong menjadi null
      const rawLemari = row["No Lemari"];
      const rawRak = row["No Rak"];
      const noLemari =
        rawLemari === undefined || rawLemari === "" || rawLemari === "-"
          ? null
          : rawLemari;
      const noRak =
        rawRak === undefined || rawRak === "" || rawRak === "-" ? null : rawRak;

      // Insert data buku utama
      const queryBuku = `
        INSERT INTO buku (judul, penulis, penerbit, tahun_terbit, stok, isbn, id_kategori, no_lemari, no_rak, tingkatan, cover_drive_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        row["Judul"] || "Tanpa Judul",
        row["Penulis"] || "-",
        row["Penerbit"] || "-",
        row["Tahun Terbit"] || 2026,
        row["Stok"] || 1,
        row["ISBN"] || null,
        row["ID Kategori"] || 1,
        noLemari,
        noRak,
        row["Tingkatan"] || "Umum",
        row["Cover Drive ID"] || null,
      ];

      const [resultBuku] = await db.query(queryBuku, values);
      const idBukuBaru = resultBuku.insertId;

      // Insert multi-lokasi jika kolom "Lokasi" diisi di Excel
      if (row["Lokasi"]) {
        // Pisahkan nama lokasi dengan tanda koma, dan gunakan 'new Set' untuk MENGHAPUS DUPLIKAT secara otomatis (misal: "Unit SMA, Unit SMA")
        const lokasiArray = [
          ...new Set(
            String(row["Lokasi"])
              .split(",")
              .map((l) => l.trim()),
          ),
        ];

        for (const namaLokasi of lokasiArray) {
          // Cari id_lokasi berdasarkan namanya
          const [cekLokasi] = await db.query(
            "SELECT id_lokasi FROM lokasi WHERE nama_lokasi = ?",
            [namaLokasi],
          );
          if (cekLokasi.length > 0) {
            // Gunakan "INSERT IGNORE" agar MySQL mengabaikan data jika kombinasi id_buku dan id_lokasi sudah ada, bukannya malah error
            await db.query(
              "INSERT IGNORE INTO buku_lokasi (id_buku, id_lokasi) VALUES (?, ?)",
              [idBukuBaru, cekLokasi[0].id_lokasi],
            );
          }
        }
      }
    }

    fs.unlinkSync(filePath); // Hapus file dari folder temporer
    res.status(200).json({
      success: true,
      message: `Berhasil mengimpor ${dataExcel.length} buku beserta lokasinya!`,
    });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("Error import excel:", error);
    res
      .status(500)
      .json({ success: false, message: "Error Import: " + error.message });
  }
};

// Fungsi Delete dan Update belum kita ubah dulu terkait multi-lokasi agar Anda mudah memahaminya,
// tapi saya sediakan persis seperti punya Anda:
const deleteBuku = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM buku WHERE id_buku = ?", [id]);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Buku tidak ditemukan" });
    return res
      .status(200)
      .json({ success: true, message: "Buku berhasil dihapus" });
  } catch (error) {
    console.error("Error delete buku:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menghapus buku" });
  }
};

const updateBuku = async (req, res) => {
  const { id } = req.params;
  const { 
    judul, penulis, penerbit, tahun_terbit, stok, isbn, 
    id_kategori, no_lemari, no_rak, tingkatan, cover_drive_id,
    lokasi
  } = req.body;

  try {

    const query = `
      UPDATE buku 
      SET judul=?, penulis=?, penerbit=?, tahun_terbit=?, stok=?, isbn=?, id_kategori=?, no_lemari=?, no_rak=?, tingkatan=?, cover_drive_id=?
      WHERE id_buku=?
    `;
    const [result] = await db.query(query, [judul, penulis, penerbit, tahun_terbit, stok, isbn, id_kategori, no_lemari, no_rak, tingkatan, cover_drive_id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }


    await db.query("DELETE FROM buku_lokasi WHERE id_buku = ?", [id]);

    if (lokasi && Array.isArray(lokasi) && lokasi.length > 0) {
      for (const idLokasi of lokasi) {
        await db.query("INSERT INTO buku_lokasi (id_buku, id_lokasi) VALUES (?, ?)", [id, idLokasi]);
      }
    }

    return res.status(200).json({ success: true, message: "Buku beserta lokasinya berhasil diperbarui!" });
  } catch (error) {
    console.error("Error update buku:", error);
    return res.status(500).json({ success: false, message: "Gagal memperbarui buku" });
  }
};

module.exports = {
  getSemuaBuku,
  tambahBuku,
  importExcel,
  deleteBuku,
  updateBuku,
};
