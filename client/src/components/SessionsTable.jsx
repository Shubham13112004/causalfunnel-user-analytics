import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTimestamp, formatRelativeTime, formatSessionId } from '../utils/formatters';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function SessionsTable({ sessions, pagination, loading, error, onPageChange, onRetry }) {
  const navigate = useNavigate();

  if (loading) return <LoadingState message="Loading sessions…" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  if (!sessions || sessions.length === 0) {
    return (
      <div className="data-table-wrapper">
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <div className="empty-state-icon">
            <Eye size={24} />
          </div>
          <div className="empty-state-title">No sessions yet</div>
          <div className="empty-state-desc">
            Open the demo webpage and interact with it to generate sessions.
            <br />
            <strong>Demo:</strong> <code>http://localhost:5500/demo/index.html</code>
          </div>
        </div>
      </div>
    );
  }

  const { page, limit, total, totalPages } = pagination;
  const startRow = (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, total);

  return (
    <div className="data-table-wrapper">
      <div className="data-table-header">
        <div className="data-table-title">All Sessions</div>
        <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>
          {total} total
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Total Events</th>
              <th>Page Views</th>
              <th>Clicks</th>
              <th>First Activity</th>
              <th>Last Activity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr
                key={session.session_id}
                className="clickable"
                onClick={() => navigate(`/sessions/${encodeURIComponent(session.session_id)}`)}
              >
                <td>
                  <span className="session-id">{formatSessionId(session.session_id)}</span>
                </td>
                <td>
                  <strong>{session.total_events}</strong>
                </td>
                <td>
                  <span className="badge badge-pageview">{session.total_page_views}</span>
                </td>
                <td>
                  <span className="badge badge-click">{session.total_clicks}</span>
                </td>
                <td style={{ color: 'var(--color-text-secondary)', fontSize: '.78rem' }}>
                  {formatTimestamp(session.first_activity)}
                </td>
                <td style={{ color: 'var(--color-text-secondary)', fontSize: '.78rem' }}>
                  <span title={formatTimestamp(session.last_activity)}>
                    {formatRelativeTime(session.last_activity)}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/sessions/${encodeURIComponent(session.session_id)}`);
                    }}
                  >
                    <ArrowRight size={13} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {startRow}–{endRow} of {total} sessions
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: '.78rem', color: 'var(--color-text-secondary)' }}>
            Page {page} / {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
