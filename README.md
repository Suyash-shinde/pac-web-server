# Pune Anime Community (PAC) Website

A community website for the Pune Anime Community — events, creators, cosplayers,
gallery, store (showcase), blog, and community pages.

**Stack:** React 19 + Vite (client) · Express 5 + MySQL (server) · plain JavaScript.

- Dark theme matching the PAC logo (**black + crimson red + silver**), mobile-first.
- Global CSS design system with fixed color tokens in
  [client/src/index.css](client/src/index.css).

---

## Project structure

```
pac-web/
  client/   React + Vite front-end
    src/
      components/   layout (Navbar/Footer), ui kit, cards
      pages/        all public pages
      data/         local stub data (used as fallback if the API is down)
      lib/          api.js, useApi.js, format.js
  server/   Express + MySQL API
    config/db.js    MySQL connection pool
    db/             schema.sql, seed.js
    routes/         /api routes
    controllers/    content (reads) + forms (writes)
    middleware/     async handler, validation, error handling
```

## Prerequisites

- Node.js 18+
- A running MySQL (or MariaDB) server

## 1. Server setup

```bash
cd server
npm install
cp .env.example .env        # then edit DB_USER / DB_PASSWORD / DB_NAME (+ set JWT_SECRET)
npm run seed                # creates the `pac` database, schema, and sample data
npm run create-admin        # creates an admin user (default: admin@pac.local / admin123)
npm run dev                 # starts the API on http://localhost:4000
```

> Override admin credentials: `ADMIN_EMAIL=you@pac.in ADMIN_PASSWORD=secret npm run create-admin`

Quick checks:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/events
```

## 2. Client setup

```bash
cd client
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm run dev                 # starts Vite on http://localhost:5173
```

Open http://localhost:5173. If the API/DB is not running, pages still render using
the local stub data in `client/src/data/`.

## API endpoints

| Method | Path                     | Description                       |
| ------ | ------------------------ | --------------------------------- |
| GET    | `/health`                | Service health check              |
| GET    | `/api/events`            | Upcoming events (`?past=1` = past)|
| GET    | `/api/events/:slug`      | Single event                      |
| GET    | `/api/creators`          | Creators                          |
| GET    | `/api/cosplayers`        | Cosplayers                        |
| GET    | `/api/creators/:slug`    | Single creator / cosplayer        |
| GET    | `/api/blog`              | Blog posts                        |
| GET    | `/api/blog/:slug`        | Single post                       |
| GET    | `/api/gallery`           | Gallery items                     |
| GET    | `/api/products`          | Store products (showcase)         |
| GET    | `/api/testimonials`      | Testimonials                      |
| GET    | `/api/stats`             | Community stats                   |
| GET    | `/api/team`              | Team members                      |
| GET    | `/api/partners`          | Partners                          |
| POST   | `/api/contact`           | Contact / collaboration / volunteer form |
| POST   | `/api/newsletter`        | Newsletter signup                 |
| POST   | `/api/auth/login`        | Admin login → `{ token, user }`   |
| GET    | `/api/auth/me`           | Current user (Bearer token)       |
| *      | `/api/admin/*`           | Protected admin CRUD + submissions (admin role) |

### Admin panel

Visit **`/admin`** in the browser (or the "Admin" link in the footer). Log in with
the credentials from `npm run create-admin`. From there you can:

- Create / edit / delete **events, blog posts, creators/cosplayers, products**
- View **contact messages** and **newsletter signups**

Admin routes are protected by JWT (7-day expiry); the token is stored in the
browser and sent as a `Bearer` header. Set a strong `JWT_SECRET` in
`server/.env` for production.

## Scripts

**client:** `npm run dev` · `npm run build` · `npm run lint` · `npm run preview`
**server:** `npm run dev` · `npm start` · `npm run seed`

## Roadmap (not yet built)

- Phase 4+: member accounts & RSVP, social login (Google/Discord/Instagram),
  real store + payments, forums, ticketing, membership tiers.
