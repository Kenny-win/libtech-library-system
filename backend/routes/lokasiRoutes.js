const express = require('express');
const router = express.Router();
const { getLokasi } = require('../controllers/lokasiControllers');

router.get('/', getLokasi);

module.exports = router;