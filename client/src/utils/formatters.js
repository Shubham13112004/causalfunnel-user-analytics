/**
 * Utility formatters for the dashboard.
 */

/**
 * Format a timestamp as a readable local date/time string.
 */
export const formatTimestamp = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

/**
 * Format a timestamp as a relative time string (e.g., "3 minutes ago").
 */
export const formatRelativeTime = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '—';

  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatTimestamp(ts);
};

/**
 * Truncate a string to maxLen characters, appending ellipsis.
 */
export const truncate = (str, maxLen = 50) => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + '…';
};

/**
 * Truncate a URL for display by removing scheme and keeping path.
 */
export const truncateUrl = (url, maxLen = 55) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const display = parsed.hostname + parsed.pathname + parsed.search;
    return truncate(display, maxLen);
  } catch {
    return truncate(url, maxLen);
  }
};

/**
 * Format a session ID for display (truncate if very long).
 */
export const formatSessionId = (id) => {
  if (!id) return '—';
  return id.length > 32 ? id.slice(0, 12) + '…' + id.slice(-8) : id;
};

/**
 * Format a number with thousands separators.
 */
export const formatNumber = (n) => {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString();
};
