import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import SessionsTable from '../components/SessionsTable';
import { useSessions } from '../hooks/useAnalytics';

export default function Sessions() {
  const { sessions, pagination, loading, error, fetchSessions } = useSessions();
  const [currentPage, setCurrentPage] = useState(1);
  const LIMIT = 20;

  useEffect(() => {
    fetchSessions(currentPage, LIMIT);
  }, [fetchSessions, currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <Header title="Sessions" />
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Sessions</h1>
          <p className="page-subtitle">
            All unique browser sessions derived from tracked events
          </p>
        </div>

        <SessionsTable
          sessions={sessions}
          pagination={pagination}
          loading={loading}
          error={error}
          onPageChange={handlePageChange}
          onRetry={() => fetchSessions(currentPage, LIMIT)}
        />
      </div>
    </>
  );
}
