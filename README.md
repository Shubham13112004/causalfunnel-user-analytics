# Simple User Analytics Application

A full-stack user analytics application that tracks website activity, records user sessions, captures click interactions, and visualizes user journeys and click heatmaps through a React dashboard.

The project demonstrates how a lightweight JavaScript tracking script can collect frontend events, send them to a Node.js backend, persist them in MongoDB, and display meaningful analytics.

## Features

### 1. Website Event Tracking

* Lightweight JavaScript tracking script that can be embedded into a webpage.
* Tracks `page_view` events when a page loads.
* Tracks `click` events when users interact with the page.
* Records session ID, event type, page URL, and timestamp.
* Captures click coordinates for heatmap visualization.
* Supports session reuse and inactivity-based session expiration.

### 2. Backend APIs

* Receives and validates tracking events.
* Stores events in MongoDB.
* Retrieves sessions with event counts.
* Retrieves chronological events for a specific session.
* Provides click data for page-level heatmaps.
* Provides a list of tracked pages.
* Includes error handling and request validation.

### 3. Analytics Dashboard

* Displays tracked sessions and their event counts.
* Shows the event journey for a selected session.
* Presents events in chronological order.
* Provides a page selector for heatmap visualization.
* Visualizes recorded click locations on a page.
* Includes loading, empty, and error states.

### 4. Security and Reliability

* Environment variables for configuration.
* Request validation and error handling.
* CORS configuration.
* Security headers with Helmet.
* Rate limiting for API requests.
* No collection of form field values by the tracking script.

---

## Tech Stack

| Layer            | Technologies                     |
| ---------------- | -------------------------------- |
| Frontend         | React 18, Vite 5, React Router 6 |
| Charts and Icons | Recharts, Lucide React           |
| Backend          | Node.js, Express.js 4            |
| Database         | MongoDB, Mongoose 8              |
| Configuration    | dotenv                           |
| Security         | Helmet, CORS, express-rate-limit |
| Frontend Testing | Vitest, React Testing Library    |
| Backend Testing  | Jest, Supertest                  |
| Development      | npm, Git, GitHub                 |

---

## Architecture

```text
                  Website / Demo Page
                          |
                          v
                 JavaScript Tracker
                          |
                 page_view / click
                          |
                          v
                   Express API
                          |
                  Validate Events
                          |
                          v
                       MongoDB
                          |
             +------------+------------+
             |            |            |
             v            v            v
          Sessions      Events      Click Data
             |            |            |
             +------------+------------+
                          |
                          v
                   React Dashboard
                          |
             +------------+------------+
             |                         |
             v                         v
       Session Explorer          Click Heatmap
```

## Project Structure

The following is the intended project structure. Refer to the actual repository for the final file names and organization.

```text
simple-user-analytics/
├── client/
│   ├── public/
│   │   └── tracker.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── tests/
│   └── package.json
│
├── demo/
│   └── index.html
│
├── docs/
│   └── API.md
│
├── .gitignore
├── package.json
└── README.md
```

---

## Prerequisites

Install the following before running the project:

* **Node.js:** Version 18 or later; Node.js 22 is recommended.
* **npm:** Compatible with your installed Node.js version.
* **MongoDB:** A local MongoDB instance or a MongoDB Atlas database.
* **Git:** To clone and manage the repository.
* **Modern browser:** Chrome, Edge, Firefox, or another compatible browser.

Verify your installations:

```bash
node --version
npm --version
git --version
```

---

## Installation and Setup

### Step 1: Clone the Repository

Replace `<your-github-username>` with your GitHub username.

```bash
git clone https://github.com/<your-github-username>/<your-repository-name>.git
cd <your-repository-name>
```

### Step 2: Install Dependencies

If the project contains separate frontend and backend packages, install their dependencies:

```bash
npm install --prefix server
npm install --prefix client
```

If the root directory also defines dependencies, install those as well:

```bash
npm install
```

Run only the commands applicable to the `package.json` files in your repository.

### Step 3: Configure MongoDB

You can use either a local MongoDB instance or MongoDB Atlas.

**Option A: Local MongoDB**

Start your MongoDB service and use a connection string such as:

```text
mongodb://127.0.0.1:27017/user_analytics
```

**Option B: MongoDB Atlas**

1. Create a MongoDB Atlas cluster.
2. Configure a database user.
3. Allow network access from your development environment.
4. Copy your database connection string.
5. Replace the credentials and database name as appropriate.

Never commit database credentials to GitHub.

### Step 4: Configure Backend Environment Variables

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/user_analytics
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### Step 5: Configure Frontend Environment Variables

If the frontend uses `VITE_API_BASE_URL`, create a `.env` file inside the `client` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Ensure `.env` files are included in `.gitignore`.

---

## Running the Application

### Start the Backend

From the project root, run:

```bash
npm run dev:server
```

Alternatively, if the backend has its own development script:

```bash
npm run dev --prefix server
```

The backend should be available at:

```text
http://localhost:5000
```

### Start the Frontend

Open a second terminal and run:

```bash
npm run dev:client
```

Alternatively:

```bash
npm run dev --prefix client
```

The frontend should be available at:

```text
http://localhost:5173
```

**Note:** These commands depend on the scripts defined in your `package.json` files. Use the commands supported by your actual repository.

---

## Testing the Tracking Script

The JavaScript tracker should be tested on a webpage separate from the analytics dashboard.

### Step 1: Start the Backend and Frontend

Ensure MongoDB, the backend API, and the React dashboard are running.

### Step 2: Open the Demo Page

If your demo page is a standalone HTML file, serve it using a local development server, such as the VS Code Live Server extension.

For example, the demo page might be available at:

```text
http://localhost:5500
```

Use the actual URL provided by your local server.

### Step 3: Embed the Tracker

Add the tracker script to the demo page. For example:

```html
<script
  src="http://localhost:5173/tracker.js"
  data-api-url="http://localhost:5000/api/events"
  defer
></script>
```

Ensure that the script path, API endpoint, and configuration attribute match the implementation in your repository.

### Step 4: Generate Events

1. Open the demo page.
2. Navigate or reload the page to generate a page-view event.
3. Click different elements on the page.
4. Scroll and click at different positions.
5. Open the analytics dashboard.
6. Verify that the session and event records appear.
7. Select a session to inspect its event journey.
8. Select a page to view its click heatmap.

If events do not appear, inspect the browser's developer console, Network tab, backend logs, and MongoDB records.

---

## Event Data Model

Each event should contain the following information.

| Field        | Description                                   |
| ------------ | --------------------------------------------- |
| `session_id` | Identifier associated with a browsing session |
| `event_type` | Type of event, such as `page_view` or `click` |
| `page_url`   | URL of the page where the event occurred      |
| `timestamp`  | Time when the event was recorded              |
| `x`          | Horizontal click coordinate, when applicable  |
| `y`          | Vertical click coordinate, when applicable    |

Additional fields may be included when supported by the implementation.

### Example: Page View Event

```json
{
  "session_id": "example-session-id",
  "event_type": "page_view",
  "page_url": "http://localhost:5500/",
  "timestamp": "2026-10-12T10:30:00.000Z"
}
```

### Example: Click Event

```json
{
  "session_id": "example-session-id",
  "event_type": "click",
  "page_url": "http://localhost:5500/",
  "timestamp": "2026-10-12T10:30:05.000Z",
  "x": 420,
  "y": 280
}
```

These examples illustrate the expected event structure. The actual payload may contain additional fields or use different field names depending on the implementation.

---

## Session Management

The tracker associates events with a session identifier so that related interactions can be grouped together.

A session can support:

* Tracking multiple page views and clicks.
* Reusing a session identifier across page navigations.
* Grouping events into a chronological journey.
* Starting a new session after a configured period of inactivity.

If implemented, a 30-minute inactivity timeout can be used to determine when to create a new session.

Session handling should account for browser storage restrictions and use a fallback where appropriate.

---

## Click Heatmap

The heatmap visualizes the locations where users clicked on a selected page.

The dashboard should allow users to:

1. Select a tracked page.
2. Retrieve click events for that page.
3. View click positions over a page representation.
4. Identify areas receiving more interaction.

### Coordinate Handling

Click coordinates can be represented in different coordinate systems:

* **Viewport coordinates:** Position relative to the visible browser window.
* **Document coordinates:** Position relative to the full page, including scrolling.
* **Normalized coordinates:** Relative positions calculated using the page dimensions.

The tracker and dashboard must use a consistent coordinate system.

For example, document coordinates can be calculated as:

```javascript
const pageX = event.clientX + window.scrollX;
const pageY = event.clientY + window.scrollY;
```

If the heatmap uses normalized positions, both the click coordinates and the corresponding page dimensions must be stored and interpreted consistently.

**Limitation:** A click-dot visualization is not necessarily a statistical heatmap. Density-based heatmaps, device-specific layouts, and responsive page geometry can be added as future improvements.

---

## API Reference

The following endpoints describe the intended API functionality. Verify the actual routes and response schemas against the backend implementation.

| Method | Endpoint                          | Purpose                            |
| ------ | --------------------------------- | ---------------------------------- |
| `GET`  | `/api/health`                     | Check backend health               |
| `POST` | `/api/events`                     | Submit a tracking event            |
| `GET`  | `/api/sessions`                   | Retrieve sessions and event counts |
| `GET`  | `/api/sessions/:sessionId/events` | Retrieve events for a session      |
| `GET`  | `/api/heatmap?url=<page-url>`     | Retrieve click data for a page     |
| `GET`  | `/api/pages`                      | Retrieve tracked pages             |

### Health Check

```http
GET /api/health
```

Use this endpoint to check whether the backend is responding, if implemented.

### Submit an Event

```http
POST /api/events
Content-Type: application/json
```

Example request body:

```json
{
  "session_id": "example-session-id",
  "event_type": "page_view",
  "page_url": "http://localhost:5500/",
  "timestamp": "2026-10-12T10:30:00.000Z"
}
```

### Retrieve Sessions

```http
GET /api/sessions
```

Returns session information and associated event counts, depending on the implemented response schema.

### Retrieve Session Events

```http
GET /api/sessions/example-session-id/events
```

Returns the events associated with the selected session, ideally ordered chronologically.

### Retrieve Heatmap Data

```http
GET /api/heatmap?url=http%3A%2F%2Flocalhost%3A5500%2F
```

Returns click data associated with the selected page, depending on the implemented API.

For complete request and response examples, see [`docs/API.md`](docs/API.md), if present in the repository.

---

## Testing

Run the tests supported by your project.

### Frontend Tests

```bash
npm run test:client
```

Alternatively, if the client package defines the test script:

```bash
npm run test --prefix client
```

### Backend Tests

```bash
npm test --prefix server
```

Backend integration tests may require a running MongoDB instance and a dedicated test database.

Use a separate database for tests to avoid modifying development or production data.

### Production Build

```bash
npm run build
```

For a frontend-specific build:

```bash
npm run build --prefix client
```

Confirm the actual scripts in the corresponding `package.json` files before running these commands.

---

## Security Considerations

The application should follow these security practices:

* Keep database credentials and API configuration secrets out of source control.
* Validate incoming event payloads on the backend.
* Restrict accepted event types and field sizes.
* Configure CORS to allow only intended origins.
* Use appropriate security headers.
* Apply rate limits to event ingestion endpoints.
* Avoid collecting passwords, form values, or other unnecessary sensitive information.
* Avoid rendering untrusted content as HTML.
* Use HTTPS and appropriate access controls in production.

The dashboard and event API may require authentication and authorization before being used with real user data.

---

## Assumptions and Trade-offs

* The application focuses on basic behavioral analytics rather than a complete commercial analytics platform.
* Session identification is handled in the browser.
* Session expiration is determined by the configured inactivity policy.
* Click events provide interaction coordinates for visualization.
* The dashboard retrieves data through backend APIs.
* The visualization may use click dots rather than a density-based heatmap.
* Real-time streaming and live dashboard updates are outside the basic scope unless implemented.
* Analytics accuracy depends on browser behavior, event delivery, and coordinate consistency.

These assumptions should be updated to reflect the final implementation.

---

## Known Limitations and Future Improvements

Potential improvements include:

* Authentication and role-based access control.
* Real-time event updates using WebSockets or Server-Sent Events.
* Density-based heatmap visualization.
* Filtering sessions by date, page, or event type.
* Pagination for large datasets.
* Better handling of offline events and network failures.
* Bot and automated-traffic filtering.
* Configurable event retention and data deletion.
* Privacy consent and data anonymization features.
* Performance improvements for large event collections.
* Deployment with monitoring and structured logging.

---

## Deployment

The application can be deployed using separate frontend, backend, and database services.

### Frontend

Build the React application and deploy the generated production assets to a static hosting provider.

Configure:

```env
VITE_API_BASE_URL=<your-deployed-api-base-url>
```

### Backend

Deploy the Node.js application to a server hosting provider.

Configure the production environment variables:

```env
PORT=5000
MONGODB_URI=<your-production-mongodb-connection-string>
CLIENT_ORIGIN=<your-deployed-frontend-origin>
NODE_ENV=production
```

The exact environment variables depend on the implementation.

### Database

Use MongoDB Atlas or another securely managed MongoDB deployment.

Before deployment:

* Configure the database network access rules.
* Restrict CORS to the required origins.
* Use HTTPS.
* Verify production environment variables.
* Test event ingestion and retrieval against the deployed database.
* Confirm that the public demo page can send events to the production API.

**Deployment status:** Add the live application URL here after successfully deploying and testing the application.

**Live Demo:** `Coming Soon`

---

## What I Learned

This project provides practical experience with:

* Building a full-stack application using React and Node.js.
* Designing REST APIs with Express.js.
* Storing and retrieving analytics events with MongoDB.
* Tracking browser interactions using JavaScript.
* Managing user sessions and event journeys.
* Working with click coordinates and heatmap visualization.
* Validating API requests and handling errors.
* Testing frontend and backend functionality.
* Documenting setup, API usage, and deployment requirements.

---

## Author

**Shubham Desai**

* GitHub: [Shubham13112004](https://github.com/Shubham13112004)
* LinkedIn: [Shubham Desai](https://www.linkedin.com/in/shubham-desai-0a235a36b/)

