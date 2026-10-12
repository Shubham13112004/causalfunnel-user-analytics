const Event = require('../models/Event');

/**
 * POST /api/events
 * Receive and store a tracking event.
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      session_id,
      event_type,
      page_url,
      timestamp,
      x,
      y,
      viewport_width,
      viewport_height,
      page_x,
      page_y,
      page_width,
      page_height,
    } = req.body;

    // Use client timestamp if valid, otherwise fall back to server time
    let eventTimestamp;
    if (timestamp) {
      const parsed = new Date(timestamp);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid timestamp format. Use ISO 8601 (e.g., 2026-10-12T09:00:00.000Z)',
        });
      }
      eventTimestamp = parsed;
    } else {
      eventTimestamp = new Date(); // Server-generated UTC timestamp
    }

    const eventData = {
      session_id,
      event_type,
      page_url,
      timestamp: eventTimestamp,
    };

    // Add click-specific fields if present
    if (event_type === 'click') {
      if (x !== undefined) eventData.x = Number(x);
      if (y !== undefined) eventData.y = Number(y);
      if (viewport_width !== undefined) eventData.viewport_width = Number(viewport_width);
      if (viewport_height !== undefined) eventData.viewport_height = Number(viewport_height);
      if (page_x !== undefined) eventData.page_x = Number(page_x);
      if (page_y !== undefined) eventData.page_y = Number(page_y);
      if (page_width !== undefined) eventData.page_width = Number(page_width);
      if (page_height !== undefined) eventData.page_height = Number(page_height);
    }

    const event = new Event(eventData);
    await event.save();

    return res.status(201).json({
      success: true,
      data: {
        id: event._id,
        session_id: event.session_id,
        event_type: event.event_type,
        page_url: event.page_url,
        timestamp: event.timestamp,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors with user-friendly messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }
    next(error);
  }
};

module.exports = { createEvent };
