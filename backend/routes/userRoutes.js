const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUsers, uploadUsersExcel, createUser, updateUser, deleteUser } = require('../controllers/userController');

// Konfigurasi Multer untuk menyimpan file sementara di memori (tidak di save ke harddisk backend)
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getUsers);
// Menggunakan upload.single('file')
router.post('/upload', upload.single('file'), uploadUsersExcel);
router.post('/', createUser); 
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;