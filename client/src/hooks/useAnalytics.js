import { useState, useCallback } from 'react';
import {
  getSessions,
  getSessionEvents,
  getAvailablePages,
  getHeatmapData,
  getHealth,
} from '../services/api';

/**
 * Generic async data fetcher hook.
 */
export function useAsync(asyncFn) {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const execute = useCallback(
    async (...args) => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await asyncFn(...args);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        setState({ data: null, loading: false, error: err.message || 'Unknown error' });
        throw err;
      }
    },
    [asyncFn]
  );

  return { ...state, execute };
}

/**
 * Hook for sessions list with pagination.
 */
export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSessions(page, limit);
      setSessions(result.data || []);
      setPagination(result.pagination || { page, limit, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  return { sessions, pagination, loading, error, fetchSessions };
}

/**
 * Hook for session event timeline.
 */
export function useSessionEvents(sessionId) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getSessionEvents(sessionId);
      setEvents(result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load session events');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { events, loading, error, fetchEvents };
}

/**
 * Hook for heatmap data.
 */
export function useHeatmap() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [heatmapData, setHeatmapData] = useState(null);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [pagesError, setPagesError] = useState(null);
  const [dataError, setDataError] = useState(null);

  const fetchPages = useCallback(async () => {
    setPagesLoading(true);
    setPagesError(null);
    try {
      const result = await getAvailablePages();
      setPages(result.data || []);
      if (result.data && result.data.length > 0) {
        setSelectedPage(result.data[0]);
      }
    } catch (err) {
      setPagesError(err.message || 'Failed to load available pages');
    } finally {
      setPagesLoading(false);
    }
  }, []);

  const fetchHeatmapData = useCallback(async (pageUrl) => {
    if (!pageUrl) return;
    setDataLoading(true);
    setDataError(null);
    setHeatmapData(null);
    try {
      const result = await getHeatmapData(pageUrl);
      setHeatmapData(result.data);
    } catch (err) {
      setDataError(err.message || 'Failed to load heatmap data');
    } finally {
      setDataLoading(false);
    }
  }, []);

  return {
    pages,
    selectedPage,
    setSelectedPage,
    heatmapData,
    pagesLoading,
    dataLoading,
    pagesError,
    dataError,
    fetchPages,
    fetchHeatmapData,
  };
}

/**
 * Hook for health check and overview stats.
 */
export function useOverviewStats() {
  const [health, setHealth] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthResult, sessionsResult] = await Promise.all([
        getHealth(),
        getSessions(1, 100),
      ]);
      setHealth(healthResult);
      setSessions(sessionsResult.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, []);

  // Compute aggregate stats from sessions
  const stats = sessions.reduce(
    (acc, s) => {
      acc.totalSessions += 1;
      acc.totalEvents += s.total_events || 0;
      acc.totalPageViews += s.total_page_views || 0;
      acc.totalClicks += s.total_clicks || 0;
      return acc;
    },
    { totalSessions: 0, totalEvents: 0, totalPageViews: 0, totalClicks: 0 }
  );

  return { health, sessions, stats, loading, error, fetchOverview };
}
