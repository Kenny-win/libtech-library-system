const express = require('express');
const router = express.Router();
const { getUlasanByBuku, addUlasan, updateUlasan } = require('../controllers/ulasanController');

router.get('/buku/:id_buku', getUlasanByBuku);
router.post('/', addUlasan);
router.put('/:id_ulasan', updateUlasan);

module.exports = router;