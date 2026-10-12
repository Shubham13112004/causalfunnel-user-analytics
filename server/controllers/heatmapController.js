const Event = require('../models/Event');

/**
 * GET /api/heatmap?url=<encoded-page-url>
 * Return click data for the specified page URL.
 */
const getHeatmapData = async (req, res, next) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string' || url.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'url query parameter is required',
      });
    }

    // Validate URL format
    let decodedUrl;
    try {
      decodedUrl = decodeURIComponent(url.trim());
      const parsed = new URL(decodedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return res.status(400).json({
        success: false,
        error: 'url must be a valid http or https URL',
      });
    }

    // Query click events for the exact page URL (safe parameterized query)
    const clicks = await Event.find(
      { page_url: decodedUrl, event_type: 'click' },
      {
        _id: 0,
        x: 1,
        y: 1,
        page_x: 1,
        page_y: 1,
        viewport_width: 1,
        viewport_height: 1,
        page_width: 1,
        page_height: 1,
        timestamp: 1,
      }
    ).sort({ timestamp: 1 });

    return res.json({
      success: true,
      data: {
        page_url: decodedUrl,
        total_clicks: clicks.length,
        clicks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pages
 * Return distinct page URLs that have tracked events.
 */
const getAvailablePages = async (req, res, next) => {
  try {
    const pages = await Event.distinct('page_url');
    return res.json({
      success: true,
      data: pages.sort(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHeatmapData, getAvailablePages };
