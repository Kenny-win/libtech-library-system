const express = require('express');
const router = express.Router();
const { getTrenPeminjaman, getKategoriPopuler, getStatusSirkulasi, getPeminjamAktif, getRekapDenda } = require('../controllers/analitikController');

router.get('/tren', getTrenPeminjaman);
router.get('/kategori-populer', getKategoriPopuler);
router.get('/status-sirkulasi', getStatusSirkulasi);
router.get('/peminjam-aktif', getPeminjamAktif);
router.get('/rekap-denda', getRekapDenda);

module.exports = router;