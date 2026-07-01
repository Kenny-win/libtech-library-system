const express = require('express');
const router = express.Router();
const multer = require('multer');
const bukuController = require('../controllers/bukuController');
const { getSemuaBuku, tambahBuku, importExcel, deleteBuku, updateBuku } = require('../controllers/bukuController');
// Konfigurasi Multer
const upload = multer({ dest: 'uploads/' });

// Alamat: GET http://localhost:5000/api/buku
router.get('/', getSemuaBuku);
router.post('/', tambahBuku);
router.delete('/:id', deleteBuku);
router.put('/:id', updateBuku);

// Rute Import: Pakai middleware 'upload.single' sebelum masuk ke controller
router.post('/upload', upload.single('file'), importExcel);

module.exports = router;