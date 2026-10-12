const Event = require('../models/Event');

/**
 * GET /api/sessions
 * Aggregate sessions from events. Returns one entry per unique session_id.
 */
const getSessions = async (req, res, next) => {
  try {
    // Parse and validate pagination
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 20;

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1 || limit > 100) limit = 20;

    const skip = (page - 1) * limit;

    // Aggregate to derive session data from events
    const [sessions, totalResult] = await Promise.all([
      Event.aggregate([
        {
          $group: {
            _id: '$session_id',
            total_events: { $sum: 1 },
            total_page_views: {
              $sum: { $cond: [{ $eq: ['$event_type', 'page_view'] }, 1, 0] },
            },
            total_clicks: {
              $sum: { $cond: [{ $eq: ['$event_type', 'click'] }, 1, 0] },
            },
            first_activity: { $min: '$timestamp' },
            last_activity: { $max: '$timestamp' },
          },
        },
        { $sort: { last_activity: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            session_id: '$_id',
            total_events: 1,
            total_page_views: 1,
            total_clicks: 1,
            first_activity: 1,
            last_activity: 1,
          },
        },
      ]),
      Event.aggregate([
        { $group: { _id: '$session_id' } },
        { $count: 'total' },
      ]),
    ]);

    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sessions/:sessionId/events
 * Fetch all events for a particular session, sorted chronologically.
 */
const getSessionEvents = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required and must be a non-empty string',
      });
    }

    // Sanitize: only match exact session_id string
    const events = await Event.find(
      { session_id: sessionId.trim() },
      {
        _id: 0,
        session_id: 1,
        event_type: 1,
        page_url: 1,
        timestamp: 1,
        x: 1,
        y: 1,
        viewport_width: 1,
        viewport_height: 1,
        page_x: 1,
        page_y: 1,
        page_width: 1,
        page_height: 1,
      }
    ).sort({ timestamp: 1 });

    return res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSessions, getSessionEvents };
