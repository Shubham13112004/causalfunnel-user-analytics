const mongoose = require('mongoose');

// Custom URL validator - must be http or https
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const eventSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: [true, 'session_id is required'],
      trim: true,
      maxlength: [255, 'session_id must not exceed 255 characters'],
      index: true,
    },
    event_type: {
      type: String,
      required: [true, 'event_type is required'],
      enum: {
        values: ['page_view', 'click'],
        message: 'event_type must be either "page_view" or "click"',
      },
      index: true,
    },
    page_url: {
      type: String,
      required: [true, 'page_url is required'],
      trim: true,
      maxlength: [2048, 'page_url must not exceed 2048 characters'],
      validate: {
        validator: isValidUrl,
        message: 'page_url must be a valid http or https URL',
      },
      index: true,
    },
    timestamp: {
      type: Date,
      required: [true, 'timestamp is required'],
      validate: {
        validator: (v) => v instanceof Date && !isNaN(v.getTime()),
        message: 'timestamp must be a valid date',
      },
      index: true,
    },
    // Click-specific fields (optional, validated conditionally)
    x: {
      type: Number,
      min: [0, 'x coordinate cannot be negative'],
    },
    y: {
      type: Number,
      min: [0, 'y coordinate cannot be negative'],
    },
    viewport_width: {
      type: Number,
      min: [1, 'viewport_width must be positive'],
    },
    viewport_height: {
      type: Number,
      min: [1, 'viewport_height must be positive'],
    },
    page_x: {
      type: Number,
      min: [0, 'page_x coordinate cannot be negative'],
    },
    page_y: {
      type: Number,
      min: [0, 'page_y coordinate cannot be negative'],
    },
    page_width: {
      type: Number,
      min: [1, 'page_width must be positive'],
    },
    page_height: {
      type: Number,
      min: [1, 'page_height must be positive'],
    },
  },
  {
    timestamps: false, // We manage timestamp ourselves
    versionKey: false,
  }
);

// Compound indexes for common query patterns
eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ page_url: 1, event_type: 1 });
eventSchema.index({ timestamp: -1 });

// Pre-save validation: click events must have x and y coordinates
eventSchema.pre('validate', function (next) {
  if (this.event_type === 'click') {
    if (this.x === undefined || this.x === null) {
      this.invalidate('x', 'x coordinate is required for click events', this.x);
    }
    if (this.y === undefined || this.y === null) {
      this.invalidate('y', 'y coordinate is required for click events', this.y);
    }
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
