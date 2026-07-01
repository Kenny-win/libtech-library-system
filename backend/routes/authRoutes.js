const express = require('express');
const router = express.Router();
const { login, requestResetPassword, getResetRequests, approveResetRequest  } = require('../controllers/authController');

// Route POST /api/auth/login
router.post('/login', login);
router.post('/lupa-password', requestResetPassword);
router.get('/lupa-password-requests', getResetRequests);
router.put('/lupa-password-requests/:id_request/approve', approveResetRequest);

module.exports = router;