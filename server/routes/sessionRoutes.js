const express = require('express');
const router = express.Router();
const { getSessions, getSessionEvents } = require('../controllers/sessionController');

router.get('/', getSessions);
router.get('/:sessionId/events', getSessionEvents);

module.exports = router;
