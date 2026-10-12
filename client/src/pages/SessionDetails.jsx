import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, MousePointerClick, Eye, Activity } from 'lucide-react';
import Header from '../components/Header';
import EventTimeline from '../components/EventTimeline';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import StatCard from '../components/StatCard';
import { useSessionEvents } from '../hooks/useAnalytics';
import { formatTimestamp, formatSessionId } from '../utils/formatters';

export default function SessionDetails() {
  const { sessionId } = useParams();
  const decodedSessionId = decodeURIComponent(sessionId);
  const { events, loading, error, fetchEvents } = useSessionEvents(decodedSessionId);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Compute derived stats
  const pageViews = events.filter((e) => e.event_type === 'page_view').length;
  const clicks = events.filter((e) => e.event_type === 'click').length;
  const firstActivity = events.length > 0 ? events[0].timestamp : null;
  const lastActivity = events.length > 0 ? events[events.length - 1].timestamp : null;

  return (
    <>
      <Header title="Session Details" />
      <div className="main-content">
        <Link to="/sessions" className="back-link">
          <ArrowLeft size={14} /> Back to Sessions
        </Link>

        <div className="page-header">
          <h1 className="page-title">Session Details</h1>
          <p className="page-subtitle" style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem' }}>
            {decodedSessionId}
          </p>
        </div>

        {loading && <LoadingState message="Loading session events…" />}
        {error && !loading && <ErrorState message={error} onRetry={fetchEvents} />}

        {!loading && !error && (
          <>
            <div className="stat-cards-grid" style={{ marginBottom: 24 }}>
              <StatCard
                label="Total Events"
                value={events.length}
                icon={Activity}
                iconBg="#eef2ff"
                iconColor="#4f46e5"
              />
              <StatCard
                label="Page Views"
                value={pageViews}
                icon={Eye}
                iconBg="#eff6ff"
                iconColor="#3b82f6"
              />
              <StatCard
                label="Clicks"
                value={clicks}
                icon={MousePointerClick}
                iconBg="#fffbeb"
                iconColor="#f59e0b"
              />
              <div className="stat-card">
                <div className="stat-card-header">
                  <div className="stat-card-label">Duration</div>
                  <div className="stat-card-icon" style={{ background: '#f0fdf4', color: '#10b981' }}>
                    <Clock size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '.8rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  <div><strong>Start:</strong> {formatTimestamp(firstActivity)}</div>
                  <div><strong>End:</strong> {formatTimestamp(lastActivity)}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Event Journey</div>
                <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>
                  Chronological order
                </span>
              </div>
              <div className="card-body">
                <EventTimeline events={events} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
