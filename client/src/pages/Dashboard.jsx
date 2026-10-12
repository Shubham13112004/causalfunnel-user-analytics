import React, { useEffect } from 'react';
import {
  Users, Activity, Eye, MousePointerClick, Database,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useOverviewStats } from '../hooks/useAnalytics';
import { formatTimestamp, formatSessionId, formatRelativeTime } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { health, sessions, stats, loading, error, fetchOverview } = useOverviewStats();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const chartData = [
    { name: 'Page Views', value: stats.totalPageViews, color: '#4f46e5' },
    { name: 'Clicks', value: stats.totalClicks, color: '#f59e0b' },
  ];

  return (
    <>
      <Header title="Overview" />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Analytics Overview</h1>
          <p className="page-subtitle">Real-time summary of tracked user activity</p>
        </div>

        {loading && <LoadingState message="Loading overview…" />}
        {error && !loading && <ErrorState message={error} onRetry={fetchOverview} />}

        {!loading && !error && (
          <>
            <div className="stat-cards-grid">
              <StatCard
                label="Unique Sessions"
                value={stats.totalSessions}
                icon={Users}
                iconBg="#eef2ff"
                iconColor="#4f46e5"
                subtitle="Distinct browser sessions"
              />
              <StatCard
                label="Total Events"
                value={stats.totalEvents}
                icon={Activity}
                iconBg="#f0fdf4"
                iconColor="#10b981"
                subtitle="All tracked interactions"
              />
              <StatCard
                label="Page Views"
                value={stats.totalPageViews}
                icon={Eye}
                iconBg="#eff6ff"
                iconColor="#3b82f6"
                subtitle="page_view events"
              />
              <StatCard
                label="Click Events"
                value={stats.totalClicks}
                icon={MousePointerClick}
                iconBg="#fffbeb"
                iconColor="#f59e0b"
                subtitle="click events"
              />
            </div>

            {/* DB status card */}
            <div
              className="card"
              style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: health?.success ? '#d1fae5' : '#fee2e2',
                  color: health?.success ? '#065f46' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Database size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '.875rem' }}>
                  Database: {health?.database?.status || 'checking…'}
                </div>
                <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>
                  {health?.database?.host
                    ? `Connected to ${health.database.host} / ${health.database.name}`
                    : 'Run MongoDB locally or configure Atlas connection'}
                </div>
              </div>
            </div>

            {/* Event distribution chart */}
            {stats.totalEvents > 0 && (
              <div className="chart-wrapper" style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, fontSize: '.9375rem', marginBottom: 16 }}>
                  Event Distribution
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent sessions */}
            <div className="data-table-wrapper">
              <div className="data-table-header">
                <div className="data-table-title">Recent Sessions</div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sessions')}>
                  View all →
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <div className="empty-state-icon">
                    <Users size={22} />
                  </div>
                  <div className="empty-state-title">No sessions yet</div>
                  <div className="empty-state-desc">
                    Open the demo page and interact with it to start generating analytics data.
                    <br />
                    <code
                      style={{
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '.78rem',
                        marginTop: 8,
                        display: 'inline-block',
                      }}
                    >
                      http://localhost:5500/demo/index.html
                    </code>
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Session ID</th>
                        <th>Events</th>
                        <th>Page Views</th>
                        <th>Clicks</th>
                        <th>Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.slice(0, 10).map((s) => (
                        <tr
                          key={s.session_id}
                          className="clickable"
                          onClick={() => navigate(`/sessions/${encodeURIComponent(s.session_id)}`)}
                        >
                          <td><span className="session-id">{formatSessionId(s.session_id)}</span></td>
                          <td><strong>{s.total_events}</strong></td>
                          <td><span className="badge badge-pageview">{s.total_page_views}</span></td>
                          <td><span className="badge badge-click">{s.total_clicks}</span></td>
                          <td style={{ fontSize: '.78rem', color: 'var(--color-text-secondary)' }}>
                            <span title={formatTimestamp(s.last_activity)}>
                              {formatRelativeTime(s.last_activity)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
