/**
 * CausalFunnel Analytics Tracker
 * =================================
 * Standalone JavaScript tracking script. Framework-independent.
 *
 * USAGE (include in any HTML page):
 *
 *   <script
 *     src="http://localhost:5173/tracker.js"
 *     data-api-url="http://localhost:5000/api/events"
 *     defer>
 *   </script>
 *
 * CONFIGURATION (data attributes on the script tag):
 *   data-api-url          - Backend API events endpoint (required)
 *   data-session-timeout  - Inactivity timeout in minutes (default: 30)
 *   data-debug            - Set to "true" to enable console logging
 *
 * WHAT IT TRACKS:
 *   - page_view  : On every page load (DOMContentLoaded or script execution)
 *   - click      : Every user click, with viewport and page-relative coordinates
 *
 * WHAT IT DOES NOT TRACK:
 *   - Input field values (especially passwords, payment info)
 *   - Keystrokes
 *   - Form submissions
 *   - Mouse movements
 *
 * SESSION MANAGEMENT:
 *   Session IDs are stored in localStorage.
 *   A session expires after the configured inactivity timeout.
 *   The same session_id is reused across page reloads and navigation
 *   within the same origin during the active session window.
 *
 * PRIVACY NOTE:
 *   This tracker is for development and internal analytics.
 *   Production use requires proper privacy disclosure, GDPR compliance,
 *   and stronger abuse prevention on the backend.
 */

(function () {
  'use strict';

  // ── Guard: prevent double-initialization ─────────────────────────────────
  if (window.__cf_tracker_initialized) return;
  window.__cf_tracker_initialized = true;

  // ── Configuration ─────────────────────────────────────────────────────────
  const scriptEl = document.currentScript ||
    document.querySelector('script[data-api-url]');

  const API_URL = scriptEl?.getAttribute('data-api-url') || 'http://localhost:5000/api/events';
  const SESSION_TIMEOUT_MS = parseInt(scriptEl?.getAttribute('data-session-timeout') || '30', 10) * 60 * 1000;
  const DEBUG = scriptEl?.getAttribute('data-debug') === 'true';

  function log(...args) {
    if (DEBUG) console.log('[CF Tracker]', ...args);
  }

  log('Initializing. API:', API_URL);

  // ── Session management ────────────────────────────────────────────────────
  const SESSION_KEY = '__cf_session_id';
  const ACTIVITY_KEY = '__cf_last_activity';

  function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getSessionId() {
    try {
      const now = Date.now();
      const storedId = localStorage.getItem(SESSION_KEY);
      const lastActivity = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0', 10);

      // Check if session has expired due to inactivity
      const isExpired = storedId && (now - lastActivity > SESSION_TIMEOUT_MS);

      if (!storedId || isExpired) {
        const newId = generateId();
        localStorage.setItem(SESSION_KEY, newId);
        localStorage.setItem(ACTIVITY_KEY, String(now));
        log('New session created:', newId, isExpired ? '(previous expired)' : '');
        return newId;
      }

      // Reuse existing valid session
      return storedId;
    } catch (e) {
      // localStorage unavailable (private browsing, iframe restrictions, etc.)
      // Fall back to an in-memory session for this page load
      if (!window.__cf_session_fallback) {
        window.__cf_session_fallback = generateId();
        log('localStorage unavailable, using in-memory session');
      }
      return window.__cf_session_fallback;
    }
  }

  function updateLastActivity() {
    try {
      localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
    } catch (e) {
      // Ignore - localStorage unavailable
    }
  }

  // ── Event sending ─────────────────────────────────────────────────────────
  function sendEvent(payload) {
    const body = {
      ...payload,
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
    };

    log('Sending event:', body);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // keepalive allows the request to complete even if the page unloads
      keepalive: true,
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) {
          res.json().then((d) => log('Event send failed:', d)).catch(() => {});
        } else {
          log('Event sent OK');
        }
      })
      .catch((err) => {
        // Network errors must never crash the host page
        log('Network error sending event:', err.message);
      });
  }

  // ── Page view tracking ────────────────────────────────────────────────────
  let pageViewSent = false;

  function trackPageView() {
    if (pageViewSent) return; // Prevent duplicate on the same page load
    pageViewSent = true;

    sendEvent({
      event_type: 'page_view',
      page_url: window.location.href,
    });
  }

  // ── Click tracking ────────────────────────────────────────────────────────
  function trackClick(event) {
    // Skip clicks on the script itself or if target is not in the document
    if (!document.contains(event.target)) return;

    // Do not track coordinates from within password/payment fields
    const tag = (event.target || {}).tagName || '';
    const inputType = (event.target || {}).type || '';
    if (tag === 'INPUT' && (inputType === 'password' || inputType === 'credit-card')) return;

    updateLastActivity();

    const scrollX = window.scrollX || window.pageXOffset || 0;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    sendEvent({
      event_type: 'click',
      page_url: window.location.href,

      // Viewport-relative coordinates (clientX/clientY)
      x: Math.round(event.clientX),
      y: Math.round(event.clientY),

      // Page-relative coordinates (includes scroll offset)
      page_x: Math.round(event.clientX + scrollX),
      page_y: Math.round(event.clientY + scrollY),

      // Viewport dimensions
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,

      // Full page dimensions
      page_width: Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.body.clientWidth,
        document.documentElement.clientWidth
      ),
      page_height: Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      ),
    });
  }

  // ── Initialize ────────────────────────────────────────────────────────────
  // Track page view immediately (or wait for DOM if needed)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageView, { once: true });
  } else {
    trackPageView();
  }

  // Attach click listener to document (event delegation - catches all clicks)
  document.addEventListener('click', trackClick, { capture: true, passive: true });

  log('Tracker ready. Session:', getSessionId());
})();
