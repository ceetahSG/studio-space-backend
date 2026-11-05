# StudioSpace Backend

The StudioSpace backend is an Express and MongoDB API for the StudioSpace
creative-workspace marketplace. It manages studio listings, category
discovery, studio details, reservations, and authenticated host mutations.

**Live API:** https://studio-space-backend-server.vercel.app
**Frontend:** https://studio-space-xi-umber.vercel.app

## Responsibilities

- Connect to MongoDB and expose StudioSpace collections.
- Return all studios, featured studios, category-filtered studios, and one
  studio by ID.
- Create and retrieve studio bookings.
- Create, update, and delete studio listings.
- Verify Better Auth JWTs for protected mutation endpoints.
- Support Vercel deployment through `vercel.json`.

## Tech stack

- Node.js
- Express 5
- MongoDB Node.js driver
- `jose` for JWT/JWKS verification
- CORS and dotenv
- Vercel serverless deployment

## Project structure

```text
index.js       # Express application, MongoDB connection, and API routes
vercel.json    # Vercel Node runtime and catch-all route configuration
package.json   # Runtime dependencies and scripts
```

## Local setup

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A MongoDB database
- A frontend Better Auth deployment that exposes its JWKS endpoint when using
  protected endpoints

### Install and run

```bash
git clone https://github.com/ceetahSG/studio-space-backend.git
cd studio-space-backend
npm install
node index.js
```

The API listens on port `5000` by default.

### Environment variables

Create `.env` with values for your environment:

```env
PORT=5000
MONGO_DB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
CLIENT_URL=http://localhost:3000
```

`CLIENT_URL` is used to locate the Better Auth JWKS endpoint:

```text
${CLIENT_URL}/api/auth/jwks
```

For production, set `CLIENT_URL` to the deployed frontend URL and configure
the frontend's `NEXT_PUBLIC_API_URL` to this API's deployed URL.

## API endpoints

### Public endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `GET` | `/studios` | Return all studios |
| `GET` | `/featured-studios` | Return up to six featured studios |
| `GET` | `/studio/id/:id` | Return one studio by MongoDB ID |
| `GET` | `/studio/:category` | Return studios in a category |
| `GET` | `/bookings/:email` | Return bookings for an email address |

### Protected endpoints

Send a valid Better Auth JWT in the request header:

```http
Authorization: Bearer <jwt>
```

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/studios` | Create a studio listing |
| `PUT` | `/studios/:id` | Replace a studio listing |
| `PATCH` | `/studio/:id` | Update studio fields |
| `DELETE` | `/studios/:id` | Delete a studio listing |
| `POST` | `/booking` | Create a booking request |

The current booking cancellation endpoint is:

| Method | Endpoint | Description |
| --- | --- | --- |
| `DELETE` | `/booking/:id` | Delete a booking record |

## Example requests

### Create a studio

```bash
curl -X POST "$API_URL/studios" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{
    "studioTitle": "Daylight Loft",
    "category": "Photo Studio",
    "hourlyRate": 45,
    "securityDeposit": 100,
    "maximumCapacity": 8,
    "city": "Dhaka",
    "address": "Dhanmondi",
    "images": ["https://example.com/studio.jpg"],
    "amenities": ["Natural light", "Parking"],
    "overview": "A flexible daylight studio for photo and video production.",
    "hostName": "Studio Host",
    "hostEmail": "host@example.com"
  }'
```

### Create a booking

```bash
curl -X POST "$API_URL/booking" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{
    "studioId": "<studio-id>",
    "studioTitle": "Daylight Loft",
    "userEmail": "creator@example.com",
    "date": "2026-12-01",
    "guestCount": 2
  }'
```

## Available scripts

The repository currently has no automated test suite or npm start script.
Start the server directly with:

```bash
node index.js
```

Verify the local health check with:

```bash
curl http://localhost:5000/
```

## Deployment

The backend is configured for Vercel with `vercel.json`. Configure `PORT`,
`MONGO_DB_URI`, and `CLIENT_URL` in the Vercel project environment settings,
then deploy the `main` branch.

## Security notes

Protected routes require a Better Auth JWT and reject requests without an
authorization header. Keep MongoDB credentials and deployment secrets out of
source control. The API currently uses bearer-token verification; HTTPOnly
cookie transport, ownership checks, and automated API tests are planned
hardening work.

## Related repository

- Frontend application: https://github.com/ceetahSG/studioSpace-Frontend
