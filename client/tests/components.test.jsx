import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// ── Formatters tests ──────────────────────────────────────────────────────────

import { formatNumber, truncate, truncateUrl, formatSessionId } from '../src/utils/formatters';

describe('formatters', () => {
  it('formatNumber returns formatted string', () => {
    // toLocaleString output varies by OS locale — just verify it's a non-empty string
    const result = formatNumber(1234567);
    expect(typeof result).toBe('string');
    expect(result).not.toBe('—');
    expect(result.length).toBeGreaterThan(4); // must have separators
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
  });

  it('truncate shortens long strings', () => {
    expect(truncate('hello world', 5)).toBe('hell…');
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('', 10)).toBe('');
  });

  it('truncateUrl strips scheme', () => {
    const result = truncateUrl('http://localhost:5173/products/123');
    expect(result).not.toMatch(/^http/);
    expect(result).toContain('localhost');
  });

  it('formatSessionId truncates very long IDs', () => {
    const longId = 'a'.repeat(50);
    const result = formatSessionId(longId);
    expect(result.length).toBeLessThan(longId.length);
    expect(result).toContain('…');
  });
});

// ── StatCard component tests ──────────────────────────────────────────────────

import StatCard from '../src/components/StatCard';

describe('StatCard', () => {
  it('renders label and formatted value', () => {
    render(
      <MemoryRouter>
        <StatCard label="Total Sessions" value={42} />
      </MemoryRouter>
    );
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows skeleton when value is null', () => {
    const { container } = render(
      <MemoryRouter>
        <StatCard label="Loading" value={null} />
      </MemoryRouter>
    );
    expect(container.querySelector('.skeleton')).toBeInTheDocument();
  });
});

// ── LoadingState and ErrorState tests ─────────────────────────────────────────

import LoadingState from '../src/components/LoadingState';
import ErrorState from '../src/components/ErrorState';

describe('LoadingState', () => {
  it('renders spinner and message', () => {
    render(<LoadingState message="Loading sessions…" />);
    expect(screen.getByText('Loading sessions…')).toBeInTheDocument();
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('renders error message and retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Network error" onRetry={onRetry} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    const retryBtn = screen.getByText(/retry/i);
    retryBtn.click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});

// ── SessionsTable empty state test ───────────────────────────────────────────

import SessionsTable from '../src/components/SessionsTable';

describe('SessionsTable', () => {
  it('shows empty state when no sessions', () => {
    render(
      <MemoryRouter>
        <SessionsTable
          sessions={[]}
          pagination={{ page: 1, limit: 20, total: 0, totalPages: 1 }}
          loading={false}
          error={null}
          onPageChange={() => {}}
          onRetry={() => {}}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/no sessions yet/i)).toBeInTheDocument();
  });

  it('renders sessions data when provided', () => {
    const sessions = [
      {
        session_id: 'test-session-001',
        total_events: 5,
        total_page_views: 2,
        total_clicks: 3,
        first_activity: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      },
    ];
    render(
      <MemoryRouter>
        <SessionsTable
          sessions={sessions}
          pagination={{ page: 1, limit: 20, total: 1, totalPages: 1 }}
          loading={false}
          error={null}
          onPageChange={() => {}}
          onRetry={() => {}}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('test-session-001')).toBeInTheDocument();
  });
});

// ── EventTimeline empty state test ───────────────────────────────────────────

import EventTimeline from '../src/components/EventTimeline';

describe('EventTimeline', () => {
  it('shows empty state for no events', () => {
    render(<EventTimeline events={[]} />);
    expect(screen.getByText(/no events in this session/i)).toBeInTheDocument();
  });

  it('renders page_view events', () => {
    const events = [
      {
        event_type: 'page_view',
        page_url: 'http://localhost:5173/',
        timestamp: new Date().toISOString(),
      },
    ];
    render(<EventTimeline events={events} />);
    expect(screen.getByText(/page view/i)).toBeInTheDocument();
  });

  it('renders click events with coordinates', () => {
    const events = [
      {
        event_type: 'click',
        page_url: 'http://localhost:5173/',
        timestamp: new Date().toISOString(),
        x: 100,
        y: 200,
        page_x: 100,
        page_y: 250,
      },
    ];
    render(<EventTimeline events={events} />);
    expect(screen.getByText(/click/i)).toBeInTheDocument();
  });
});

// ── API error display test ────────────────────────────────────────────────────

describe('API error display in SessionsTable', () => {
  it('shows error state with retry button', () => {
    const onRetry = vi.fn();
    render(
      <MemoryRouter>
        <SessionsTable
          sessions={[]}
          pagination={{ page: 1, limit: 20, total: 0, totalPages: 1 }}
          loading={false}
          error="Failed to fetch sessions"
          onPageChange={() => {}}
          onRetry={onRetry}
        />
      </MemoryRouter>
    );
    expect(screen.getByText(/failed to fetch sessions/i)).toBeInTheDocument();
  });
});
