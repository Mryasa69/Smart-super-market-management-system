const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { testActivity } = require('../controllers/testActivityController');

// @route   GET /api/test-activity
router.get('/', protect, testActivity);

module.exports = router;
