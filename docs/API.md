# API Documentation

## Base URL

Development: `http://localhost:5000/api`

---

## GET /health

Returns the server and database status.

**Response 200 (healthy):**
```json
{
  "success": true,
  "status": "ok",
  "database": {
    "status": "connected",
    "host": "127.0.0.1",
    "name": "causalfunnel_analytics"
  },
  "server": {
    "timestamp": "2026-10-12T09:00:00.000Z",
    "uptime": 42,
    "nodeVersion": "v22.11.0"
  }
}
```

**Response 503 (DB unavailable):**
```json
{
  "success": false,
  "status": "degraded",
  "database": { "status": "disconnected", "host": null, "name": null },
  "server": { "timestamp": "...", "uptime": 0, "nodeVersion": "..." }
}
```

---

## POST /events

Store a tracking event.

**Headers:** `Content-Type: application/json`

**Body — page_view:**
```json
{
  "session_id": "session-abc-123",
  "event_type": "page_view",
  "page_url": "http://localhost:5173/home",
  "timestamp": "2026-10-12T09:00:00.000Z"
}
```

**Body — click:**
```json
{
  "session_id": "session-abc-123",
  "event_type": "click",
  "page_url": "http://localhost:5173/home",
  "timestamp": "2026-10-12T09:00:05.000Z",
  "x": 240,
  "y": 300,
  "viewport_width": 1366,
  "viewport_height": 768,
  "page_x": 240,
  "page_y": 450,
  "page_width": 1366,
  "page_height": 1800
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "672abc123def456789012345",
    "session_id": "session-abc-123",
    "event_type": "click",
    "page_url": "http://localhost:5173/home",
    "timestamp": "2026-10-12T09:00:05.000Z"
  }
}
```

**Response 400 (validation error):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["x coordinate is required for click events", "y coordinate is required for click events"]
}
```

**Validation rules:**
- `session_id` — required string, max 255 chars
- `event_type` — must be `"page_view"` or `"click"`
- `page_url` — required, valid http/https URL
- `timestamp` — ISO 8601 date string (optional; defaults to server time)
- `x`, `y` — required for click events, non-negative numbers
- `viewport_width`, `viewport_height` — optional, positive numbers
- `page_x`, `page_y`, `page_width`, `page_height` — optional, non-negative

---

## GET /sessions

Returns sessions derived by aggregating events.

**Query parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Results per page (max 100) |

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "session-abc-123",
      "total_events": 5,
      "total_page_views": 2,
      "total_clicks": 3,
      "first_activity": "2026-10-12T09:00:00.000Z",
      "last_activity": "2026-10-12T09:10:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

Sessions are sorted by `last_activity` descending (most recent first).

---

## GET /sessions/:sessionId/events

Returns all events for a session in chronological order.

**URL parameter:** `:sessionId` — the session ID string (URL-encoded if it contains special characters)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "session-abc-123",
      "event_type": "page_view",
      "page_url": "http://localhost:5173/home",
      "timestamp": "2026-10-12T09:00:00.000Z"
    },
    {
      "session_id": "session-abc-123",
      "event_type": "click",
      "page_url": "http://localhost:5173/home",
      "timestamp": "2026-10-12T09:00:05.000Z",
      "x": 240,
      "y": 300,
      "page_x": 240,
      "page_y": 450,
      "viewport_width": 1366,
      "viewport_height": 768,
      "page_width": 1366,
      "page_height": 1800
    }
  ]
}
```

Returns an empty `data` array for sessions with no events. This is not an error.

---

## GET /heatmap

Returns click data for a specific page URL.

**Query parameters:**

| Param | Required | Description |
|---|---|---|
| `url` | yes | URL-encoded page URL |

**Example:**
```
GET /api/heatmap?url=http%3A%2F%2Flocalhost%3A5173%2Fhome
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "page_url": "http://localhost:5173/home",
    "total_clicks": 3,
    "clicks": [
      {
        "x": 240,
        "y": 300,
        "page_x": 240,
        "page_y": 450,
        "viewport_width": 1366,
        "viewport_height": 768,
        "page_width": 1366,
        "page_height": 1800,
        "timestamp": "2026-10-12T09:00:05.000Z"
      }
    ]
  }
}
```

Only `click` events are returned. `page_view` events are excluded.

---

## GET /pages

Returns all distinct page URLs that have tracked events.

**Response 200:**
```json
{
  "success": true,
  "data": [
    "http://localhost:5173/",
    "http://localhost:5173/about",
    "http://localhost:5173/products"
  ]
}
```

Used by the heatmap page selector to populate the dropdown.

---

## Error Response Format

All error responses use this structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "details": ["Optional array of validation errors"]
}
```

| Status | Meaning |
|---|---|
| 400 | Bad request / validation failure |
| 404 | Route not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 503 | Service unavailable (DB offline) |

---

## Rate Limiting

`POST /api/events` is limited to **200 requests per minute per IP address**.

Exceeding this returns HTTP 429:
```json
{
  "success": false,
  "error": "Too many events received from this IP, please try again after a minute"
}
```

---

## CORS Policy

The API allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `http://127.0.0.1:5500` (VS Code Live Server)
- `http://127.0.0.1:5501`
- `null` (local file:// origin)

For production, set `CLIENT_ORIGIN` in `server/.env` to your actual frontend domain.
