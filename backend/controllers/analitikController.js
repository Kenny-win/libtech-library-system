const db = require('../db');

// Ambil data tren peminjaman
const getTrenPeminjaman = async (req, res) => {
  try {
    // Tangkap parameter filter dan grouping (default: 'month')
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    // Logika Filter Tanggal
    let dateFilter = "tanggal_pinjam >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = "tanggal_pinjam BETWEEN ? AND ?";
      params = [startDate, endDate];
    } else if (startDate) {
      dateFilter = "tanggal_pinjam >= ?";
      params = [startDate];
    } else if (endDate) {
      dateFilter = "tanggal_pinjam <= ?";
      params = [endDate];
    }

    // Logika Pengelompokan (X-Axis) secara Dinamis
    let selectClause = "";
    let groupByClause = "";
    
    if (groupBy === 'date') {
      // Harian: 12 Jun 2026
      selectClause = `
        DATE_FORMAT(tanggal_pinjam, '%Y-%m-%d') AS sort_key,
        DATE_FORMAT(tanggal_pinjam, '%d %b %Y') AS label_tampil,
        COUNT(id_peminjaman) AS total_pinjam
      `;
      groupByClause = `sort_key, label_tampil`;
    } else if (groupBy === 'year') {
      // Tahunan: 2026
      selectClause = `
        YEAR(tanggal_pinjam) AS sort_key,
        YEAR(tanggal_pinjam) AS label_tampil,
        COUNT(id_peminjaman) AS total_pinjam
      `;
      groupByClause = `sort_key, label_tampil`;
    } else {
      // Bulanan (Default): Jun 2026
      selectClause = `
        DATE_FORMAT(tanggal_pinjam, '%Y-%m') AS sort_key,
        CONCAT(LEFT(MONTHNAME(tanggal_pinjam), 3), ' ', YEAR(tanggal_pinjam)) AS label_tampil,
        COUNT(id_peminjaman) AS total_pinjam
      `;
      groupByClause = `sort_key, label_tampil`;
    }

    const query = `
      SELECT ${selectClause}
      FROM peminjaman
      WHERE ${dateFilter}
      GROUP BY ${groupByClause}
      ORDER BY sort_key ASC
    `;
    const [rows] = await db.query(query, params);

    // Format output untuk Recharts
    const formattedData = rows.map(row => ({
      name: row.label_tampil,
      total: row.total_pinjam
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error get tren peminjaman:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data tren" });
  }
};

// Mengambil Top 5 Kategori Paling Sering Dipinjam
const getKategoriPopuler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = "p.tanggal_pinjam >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = "p.tanggal_pinjam BETWEEN ? AND ?";
      params = [startDate, endDate];
    } else if (startDate) {
      dateFilter = "p.tanggal_pinjam >= ?";
      params = [startDate];
    } else if (endDate) {
      dateFilter = "p.tanggal_pinjam <= ?";
      params = [endDate];
    }

    const query = `
      SELECT 
        k.nama_kategori AS name, 
        COUNT(p.id_peminjaman) AS total
      FROM peminjaman p
      JOIN buku b ON p.id_buku = b.id_buku
      JOIN kategori k ON b.id_kategori = k.id_kategori
      WHERE ${dateFilter}
      GROUP BY k.id_kategori, k.nama_kategori
      ORDER BY total DESC
      LIMIT 5
    `;
    
    const [rows] = await db.query(query, params);
    
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error get kategori populer:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data kategori populer" });
  }
};

// Mengambil Proporsi Status Sirkulasi (Doughnut Chart) - Dengan Filter Role
const getStatusSirkulasi = async (req, res) => {
  try {
    // Tangkap parameter role dari frontend
    const { startDate, endDate, role } = req.query;
    
    // Harus pakai alias 'p.' karena kita akan menggunakan JOIN
    let dateFilter = "p.tanggal_pinjam >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = "p.tanggal_pinjam BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = "p.tanggal_pinjam >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateFilter = "p.tanggal_pinjam <= ?";
      params.push(endDate);
    }

    // Logika Filter Peran (Role)
    let roleFilter = "";
    if (role) {
      roleFilter = " AND u.peran = ?";
      params.push(role);
    }

    const query = `
      SELECT 
        CASE 
          WHEN p.status = 'kembali' THEN 'Kembali'
          WHEN p.status = 'dipinjam' AND p.tanggal_harus_kembali < CURDATE() THEN 'Terlambat'
          WHEN p.status = 'dipinjam' AND p.tanggal_harus_kembali >= CURDATE() THEN 'Sedang Dipinjam'
          WHEN p.status = 'pending' THEN 'Pending'
          WHEN p.status = 'ditolak' THEN 'Ditolak'
        END AS name,
        COUNT(p.id_peminjaman) AS value
      FROM peminjaman p
      JOIN users u ON p.id_user = u.id_user
      WHERE ${dateFilter} ${roleFilter}
      GROUP BY name
    `;
    
    const [rows] = await db.query(query, params);
    
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error get status sirkulasi:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data status sirkulasi" });
  }
};

// Mengambil Peminjam Paling Aktif (Leaderboard) dengan Filter Role & Status dan Dinamis (Limit)
const getPeminjamAktif = async (req, res) => {
  try {
    // Tangkap parameter limit (default 5 jika kosong)
    const { startDate, endDate, status, role, limit } = req.query;
    const limitQuery = parseInt(limit) || 5; 
    
    let dateFilter = "p.tanggal_pinjam >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = "p.tanggal_pinjam BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = "p.tanggal_pinjam >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateFilter = "p.tanggal_pinjam <= ?";
      params.push(endDate);
    }

    let statusFilter = "";
    if (status) {
      statusFilter = " AND p.status = ?";
      params.push(status);
    }

    let roleFilter = "";
    if (role) {
      roleFilter = " AND u.peran = ?";
      params.push(role);
    }

    // Masukkan variabel limitQuery ke bagian akhir LIMIT
    const query = `
      SELECT 
        u.id_user,
        u.nama, 
        u.peran, 
        u.kelas,
        COUNT(p.id_peminjaman) AS total_transaksi
      FROM peminjaman p
      JOIN users u ON p.id_user = u.id_user
      WHERE ${dateFilter} ${statusFilter} ${roleFilter}
      GROUP BY u.id_user, u.nama, u.peran, u.kelas
      ORDER BY total_transaksi DESC
      LIMIT ${limitQuery}
    `;
    
    const [rows] = await db.query(query, params);
    
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error get peminjam aktif:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data peminjam aktif" });
  }
};

// Mengambil Rekapitulasi Total Denda (Metric Card)
const getRekapDenda = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = "tanggal_pinjam >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = "tanggal_pinjam BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = "tanggal_pinjam >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateFilter = "tanggal_pinjam <= ?";
      params.push(endDate);
    }

    // Hitung total denda dan jumlah pelanggar
    const query = `
      SELECT 
        IFNULL(SUM(denda), 0) AS total_denda,
        COUNT(id_peminjaman) AS total_transaksi_denda
      FROM peminjaman
      WHERE ${dateFilter} AND denda > 0
    `;
    
    const [rows] = await db.query(query, params);
    
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error get rekap denda:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data rekap denda" });
  }
};

module.exports = { getTrenPeminjaman, getKategoriPopuler, getStatusSirkulasi, getPeminjamAktif, getRekapDenda };