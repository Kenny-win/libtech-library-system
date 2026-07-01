const express = require('express');
const router = express.Router();
const { getKategori, createKategori, updateKategori, deleteKategori } = require('../controllers/kategoriController');

router.get('/', getKategori);
router.post('/', createKategori);
router.put('/:id', updateKategori);
router.delete('/:id', deleteKategori);

module.exports = router;