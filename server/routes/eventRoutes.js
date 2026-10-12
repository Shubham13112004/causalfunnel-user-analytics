const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createEvent } = require('../controllers/eventController');

// Rate limit for event ingestion: 200 requests per minute per IP
const eventIngestionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Too many events received from this IP, please try again after a minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', eventIngestionLimiter, createEvent);

module.exports = router;
