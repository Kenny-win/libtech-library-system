const express = require('express');
const router = express.Router();
const { getFeedback, addFeedback, updateStatusFeedback } = require('../controllers/feedbackController');

router.get('/', getFeedback);
router.post('/', addFeedback);
router.put('/:id/status', updateStatusFeedback);

module.exports = router;