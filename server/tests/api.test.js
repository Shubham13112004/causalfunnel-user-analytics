/**
 * Backend API Tests
 * Connects to a real running MongoDB instance.
 *
 * PREREQUISITES: MongoDB must be running on localhost:27017
 * Run: mongod --dbpath D:\data\db --port 27017
 *
 * Uses a dedicated test database (causalfunnel_test) that is
 * dropped after each test run to avoid polluting real data.
 */
const request = require('supertest');
const mongoose = require('mongoose');

// Use a dedicated test DB — never the production DB
const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/causalfunnel_test';

let app;

beforeAll(async () => {
  process.env.MONGODB_URI = TEST_DB_URI;
  process.env.NODE_ENV = 'test';

  await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });

  // Clear require cache so app picks up the correct MONGODB_URI
  Object.keys(require.cache).forEach((key) => {
    if (
      key.includes('server\\app') || key.includes('server/app') ||
      key.includes('server\\models') || key.includes('server/models') ||
      key.includes('server\\routes') || key.includes('server/routes') ||
      key.includes('server\\controllers') || key.includes('server/controllers') ||
      key.includes('server\\middleware') || key.includes('server/middleware')
    ) {
      delete require.cache[key];
    }
  });

  app = require('../app');
}, 15000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ── Health endpoint ───────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  test('returns 200 with database connected status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.database.status).toBe('connected');
    expect(res.body.server.timestamp).toBeDefined();
    expect(res.body.server.nodeVersion).toMatch(/^v\d+/);
  });
});

// ── POST /api/events ──────────────────────────────────────────────────────────

describe('POST /api/events', () => {
  test('creates a valid page_view event', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        session_id: 'test-session-001',
        event_type: 'page_view',
        page_url: 'http://localhost:5173/home',
        timestamp: new Date().toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.event_type).toBe('page_view');
    expect(res.body.data.session_id).toBe('test-session-001');
  });

  test('creates a valid click event with all coordinates', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({
        session_id: 'test-session-001',
        event_type: 'click',
        page_url: 'http://localhost:5173/home',
        timestamp: new Date().toISOString(),
        x: 240,
        y: 300,
        viewport_width: 1366,
        viewport_height: 768,
        page_x: 240,
        page_y: 450,
        page_width: 1366,
        page_height: 1800,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.event_type).toBe('click');
  });

  test('rejects event missing session_id', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ event_type: 'page_view', page_url: 'http://localhost:5173/home' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  test('rejects unsupported event_type', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ session_id: 'sess-1', event_type: 'hover', page_url: 'http://localhost:5173/' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid URL', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ session_id: 'sess-1', event_type: 'page_view', page_url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects ftp:// URL', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ session_id: 'sess-1', event_type: 'page_view', page_url: 'ftp://example.com/file' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects invalid timestamp', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ session_id: 'sess-1', event_type: 'page_view', page_url: 'http://localhost:5173/', timestamp: 'bad-date' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects click event missing coordinates', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ session_id: 'sess-1', event_type: 'click', page_url: 'http://localhost:5173/', timestamp: new Date().toISOString() });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('rejects negative click coordinates', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ session_id: 'sess-1', event_type: 'click', page_url: 'http://localhost:5173/', timestamp: new Date().toISOString(), x: -10, y: 300 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('uses server timestamp when client omits one', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ session_id: 'sess-ts', event_type: 'page_view', page_url: 'http://localhost:5173/' });
    expect(res.status).toBe(201);
    expect(res.body.data.timestamp).toBeDefined();
    expect(new Date(res.body.data.timestamp).getTime()).not.toBeNaN();
  });
});

// ── GET /api/sessions ─────────────────────────────────────────────────────────

describe('GET /api/sessions', () => {
  test('returns empty array with correct pagination when no events', async () => {
    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
    expect(res.body.pagination.page).toBe(1);
  });

  test('aggregates sessions correctly from events', async () => {
    await request(app).post('/api/events').send({ session_id: 'agg-001', event_type: 'page_view', page_url: 'http://localhost:5173/', timestamp: '2026-10-12T09:00:00Z' });
    await request(app).post('/api/events').send({ session_id: 'agg-001', event_type: 'click', page_url: 'http://localhost:5173/', timestamp: '2026-10-12T09:01:00Z', x: 100, y: 200 });
    await request(app).post('/api/events').send({ session_id: 'agg-002', event_type: 'page_view', page_url: 'http://localhost:5173/about', timestamp: '2026-10-12T09:05:00Z' });

    const res = await request(app).get('/api/sessions');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.total).toBe(2);

    const s1 = res.body.data.find(s => s.session_id === 'agg-001');
    expect(s1.total_events).toBe(2);
    expect(s1.total_page_views).toBe(1);
    expect(s1.total_clicks).toBe(1);
    expect(s1.first_activity).toBeDefined();
    expect(s1.last_activity).toBeDefined();
  });

  test('respects pagination parameters', async () => {
    for (let i = 1; i <= 3; i++) {
      await request(app).post('/api/events').send({ session_id: `page-sess-${i}`, event_type: 'page_view', page_url: 'http://localhost:5173/', timestamp: new Date().toISOString() });
    }
    const res = await request(app).get('/api/sessions?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.totalPages).toBe(2);
    expect(res.body.pagination.total).toBe(3);
  });
});

// ── GET /api/sessions/:sessionId/events ───────────────────────────────────────

describe('GET /api/sessions/:sessionId/events', () => {
  test('returns events in chronological order', async () => {
    await request(app).post('/api/events').send({ session_id: 'chrono-sess', event_type: 'page_view', page_url: 'http://localhost:5173/', timestamp: '2026-10-12T09:00:00Z' });
    await request(app).post('/api/events').send({ session_id: 'chrono-sess', event_type: 'page_view', page_url: 'http://localhost:5173/', timestamp: '2026-10-12T09:02:00Z' });
    await request(app).post('/api/events').send({ session_id: 'chrono-sess', event_type: 'page_view', page_url: 'http://localhost:5173/', timestamp: '2026-10-12T09:01:00Z' });

    const res = await request(app).get('/api/sessions/chrono-sess/events');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    const ts = res.body.data.map(e => new Date(e.timestamp).getTime());
    expect(ts[0]).toBeLessThan(ts[1]);
    expect(ts[1]).toBeLessThan(ts[2]);
  });

  test('returns empty array for nonexistent session', async () => {
    const res = await request(app).get('/api/sessions/does-not-exist-xyz/events');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('includes click coordinates in response', async () => {
    await request(app).post('/api/events').send({ session_id: 'coord-sess', event_type: 'click', page_url: 'http://localhost:5173/', timestamp: new Date().toISOString(), x: 150, y: 250, page_x: 150, page_y: 350, viewport_width: 1280, viewport_height: 720 });
    const res = await request(app).get('/api/sessions/coord-sess/events');
    expect(res.status).toBe(200);
    expect(res.body.data[0].x).toBe(150);
    expect(res.body.data[0].y).toBe(250);
    expect(res.body.data[0].page_x).toBe(150);
  });
});

// ── GET /api/heatmap ──────────────────────────────────────────────────────────

describe('GET /api/heatmap', () => {
  test('returns 400 when url param missing', async () => {
    const res = await request(app).get('/api/heatmap');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 for invalid url param', async () => {
    const res = await request(app).get('/api/heatmap?url=not-a-url');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('filters clicks by exact page URL only', async () => {
    const target = 'http://localhost:5173/product';
    const other  = 'http://localhost:5173/about';
    await request(app).post('/api/events').send({ session_id: 'hm-sess', event_type: 'click', page_url: target, timestamp: new Date().toISOString(), x: 100, y: 200 });
    await request(app).post('/api/events').send({ session_id: 'hm-sess', event_type: 'click', page_url: other,  timestamp: new Date().toISOString(), x: 300, y: 400 });

    const res = await request(app).get(`/api/heatmap?url=${encodeURIComponent(target)}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total_clicks).toBe(1);
    expect(res.body.data.clicks[0].x).toBe(100);
    expect(res.body.data.page_url).toBe(target);
  });

  test('ignores page_view events in heatmap results', async () => {
    const url = 'http://localhost:5173/views-only';
    await request(app).post('/api/events').send({ session_id: 'hm-sess2', event_type: 'page_view', page_url: url, timestamp: new Date().toISOString() });
    const res = await request(app).get(`/api/heatmap?url=${encodeURIComponent(url)}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total_clicks).toBe(0);
    expect(res.body.data.clicks).toEqual([]);
  });

  test('returns empty when no clicks for url', async () => {
    const res = await request(app).get(`/api/heatmap?url=${encodeURIComponent('http://localhost:5173/never-visited')}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total_clicks).toBe(0);
  });
});

// ── GET /api/pages ────────────────────────────────────────────────────────────

describe('GET /api/pages', () => {
  test('returns empty array when no events', async () => {
    const res = await request(app).get('/api/pages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  test('returns distinct page URLs only', async () => {
    const urls = ['http://localhost:5173/', 'http://localhost:5173/about'];
    for (const url of urls) {
      await request(app).post('/api/events').send({ session_id: 'pages-sess', event_type: 'page_view', page_url: url, timestamp: new Date().toISOString() });
      await request(app).post('/api/events').send({ session_id: 'pages-sess', event_type: 'page_view', page_url: url, timestamp: new Date().toISOString() });
    }
    const res = await request(app).get('/api/pages');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data).toContain('http://localhost:5173/');
    expect(res.body.data).toContain('http://localhost:5173/about');
  });
});
