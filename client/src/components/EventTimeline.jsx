import React from 'react';
import { Eye, MousePointerClick } from 'lucide-react';
import { formatTimestamp, truncateUrl } from '../utils/formatters';

export default function EventTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Eye size={24} />
        </div>
        <div className="empty-state-title">No events in this session</div>
        <div className="empty-state-desc">
          This session ID exists but has no recorded events.
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {events.map((event, idx) => {
        const isClick = event.event_type === 'click';
        const isLast = idx === events.length - 1;

        return (
          <div key={idx} className="timeline-item">
            <div className="timeline-left">
              <div className={`timeline-dot ${isClick ? 'click' : 'pageview'}`}>
                {isClick ? <MousePointerClick size={13} /> : <Eye size={13} />}
              </div>
              {!isLast && <div className="timeline-line" />}
            </div>

            <div className="timeline-content">
              <div className="timeline-content-header">
                <span className={`badge ${isClick ? 'badge-click' : 'badge-pageview'}`}>
                  {isClick ? 'Click' : 'Page View'}
                </span>
                <span className="timeline-time">{formatTimestamp(event.timestamp)}</span>
              </div>

              <div className="timeline-url" title={event.page_url}>
                {truncateUrl(event.page_url, 80)}
              </div>

              {isClick && event.x !== undefined && event.y !== undefined && (
                <div className="timeline-coords">
                  <MousePointerClick size={11} />
                  Viewport: ({event.x}, {event.y})
                  {event.page_x !== undefined && event.page_y !== undefined && (
                    <>&nbsp;· Page: ({event.page_x}, {event.page_y})</>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
