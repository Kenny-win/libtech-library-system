const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getKategori, createKategori, updateKategori, deleteKategori, uploadKategoriExcel  } = require('../controllers/kategoriController');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getKategori);
router.post('/', createKategori);
router.put('/:id', updateKategori);
router.delete('/:id', deleteKategori);
router.post('/upload', upload.single('file'), uploadKategoriExcel);

module.exports = router;