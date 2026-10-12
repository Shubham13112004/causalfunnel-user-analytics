const express = require('express');
const router = express.Router();
const { getHeatmapData, getAvailablePages } = require('../controllers/heatmapController');

router.get('/', getHeatmapData);

module.exports = router;

// Note: /api/pages is registered separately in app.js
