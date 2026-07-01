const express = require('express');
const router = express.Router();
const { getPeminjaman, updateStatusPeminjaman, createPeminjaman, getPeminjamanByUser } = require('../controllers/peminjamanController');

router.get('/', getPeminjaman);
router.put('/:id/status', updateStatusPeminjaman); 
router.post('/', createPeminjaman);
router.get('/user/:id_user', getPeminjamanByUser);

module.exports = router;