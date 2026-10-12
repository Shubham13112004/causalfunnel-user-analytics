/**
 * API service layer - all backend communication goes through here.
 * Reads VITE_API_BASE_URL from environment; falls back to /api (Vite proxy).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const request = async (path, options = {}) => {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      throw new ApiError(`Server returned non-JSON response`, res.status, null);
    }

    if (!res.ok) {
      const message = data?.error || `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, data);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network errors, CORS failures, etc.
    throw new ApiError(
      err.message || 'Network error - is the backend server running?',
      0,
      null
    );
  }
};

// ── API functions ─────────────────────────────────────────────────────────────

export const getHealth = () => request('/health');

export const getSessions = (page = 1, limit = 20) =>
  request(`/sessions?page=${page}&limit=${limit}`);

export const getSessionEvents = (sessionId) =>
  request(`/sessions/${encodeURIComponent(sessionId)}/events`);

export const getAvailablePages = () => request('/pages');

export const getHeatmapData = (pageUrl) =>
  request(`/heatmap?url=${encodeURIComponent(pageUrl)}`);

export { ApiError };
