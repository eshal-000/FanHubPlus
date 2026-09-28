# Fan Hub Plus

Fan Hub Plus is the Async Divas TechWiz 2026 fandom project by Eshal, Maria and Wirsha. The active application is a React/Vite client and an Express/Mongoose API. Its Fandom Pulse interface brings together fandom discovery, media, events, releases, merchandise and fan participation.

## What is in the app

- Public pages: home and about; category-based Explore and content details; characters and article details; events and event details; releases; merchandise and merchandise details; feedback; and media details.
- Accounts: registration, login, password reset, protected dashboard, bookmarks, content submissions and submission history. The dashboard combines account activity such as saved items and submissions.
- Media details: trailers, cast and related items, with a five-star rating API for signed-in users.
- Admin: protected dashboard and management screens for users, content, characters, articles, submissions, events, releases, merchandise and feedback. Admin APIs also support categories and media management, although the admin media page is currently reserved rather than implemented.
- Appearance: a dark/light Fandom Pulse theme toggle stored locally in the browser; the theme context also supports local font-scale preferences, but there is no font-scale control on the current profile page.

Some screens are still in progress: `/media` is a placeholder landing page, `/profile` displays preference controls without saving them, and `/articles` currently shows bundled example articles rather than the API collection. The server does provide profile and article endpoints, and `/articles/:id` fetches article details from the API. Explore also includes curated/local multimedia examples alongside API-backed category and featured-content requests. Do not assume every page is fully database-backed.

## Stack

| Area           | Technology                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Client         | React 19, Vite 8, React Router 7, Tailwind CSS 3, Axios, Framer Motion, Lucide/React Icons, Recharts, Leaflet/React Leaflet |
| API            | Node.js, Express 5, Mongoose 9, MongoDB                                                                                     |
| Authentication | JWT bearer tokens, bcryptjs password hashing and role-protected routes                                                      |

The Fandom Pulse palette uses dark burgundy `#230018`, raspberry `#99004D`, hot pink `#FF006B`, cream `#FFF3DE`, electric yellow `#FFE347` and card `#390B2B`. Fonts include Orbitron, Plus Jakarta Sans and Protest Riot.

## Project layout

```text
client/                 React application and static assets
server/                 Express routes, controllers, models and scripts
database-import-prep/   Historical offline import proposals/artifacts
database-import-manifests/  Historical audit and test reports
database-backups/       Local database backup artifacts
code-backups/           Local code snapshots
integration-backups/    Local integration snapshots
marias-work/, wirshas-work/, wirshas-db/  Separate team/source artifacts
```

Use `client/` and `server/` for the running application. Backup, import and teammate directories are not required to start it; do not run import or seed scripts against a database without reviewing their effects first.

## Local setup

1. Install a current Node.js release compatible with Vite 8 and Mongoose 9, and npm. Have a MongoDB instance or Atlas connection available for database-backed features.
2. From the project root, install dependencies:

   ```bash
   npm --prefix client install
   npm --prefix server install
   ```
3. From the project root, copy the example environment files. In Bash:

   ```bash
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   ```

   In Windows PowerShell, use `Copy-Item client/.env.example client/.env` and `Copy-Item server/.env.example server/.env` instead.
4. Edit `server/.env`: set `MONGODB_URI` to your own connection string and `JWT_SECRET` to a strong private value before using authentication. `MONGODB_DB_NAME` defaults to `fanhubplus`; `PORT` defaults to `5000`; `CLIENT_URL` defaults to `http://localhost:5173`. Set `client/.env`'s `VITE_API_BASE_URL` to the API base URL (default `http://localhost:5000/api`). If either port changes, update the client API URL and server CORS `CLIENT_URL` accordingly. Never commit real credentials or share database backups publicly.

The API can start without `MONGODB_URI`, but database-dependent requests will not work. A missing `JWT_SECRET` prevents successful token creation. The current password-reset flow logs a temporary reset endpoint/token to the backend console for local development; it does **not** send an email.

## Run locally

Open two terminals at the project root:

```bash
npm --prefix server run dev
```

```bash
npm --prefix client run dev
```

Open `http://localhost:5173`. The API listens at `http://localhost:5000`; `GET http://localhost:5000/api/health` reports both service status and whether MongoDB is connected. `status: ok` alone does not mean the database is connected.

On Windows PowerShell installations where `npm` is blocked by script execution policy, use `npm.cmd` in place of `npm` in the commands above and below.

## API overview

All endpoints are under `/api`. Public reads include `/health`, `/categories`, `/contents`, `/characters`, `/articles`, `/media`, `/events`, `/releases` and `/merch`, plus detail routes where implemented. `POST /feedback` accepts fan feedback. Authentication routes live under `/auth`; authenticated users can access `/profile`, `/bookmarks`, `/submissions/mine` and media ratings at `/media/:mediaId/rating`. `/admin` holds role-restricted statistics, user management and content-management endpoints. Requests that need a session use `Authorization: Bearer <token>`.

Public browsing depends on records in MongoDB; installing dependencies alone does not populate collections. Admin access requires an existing user with the `admin` role; public registration creates normal users, not admins.

## Checks

From the project root:

```bash
npm --prefix client run build
npm --prefix client run lint
npm --prefix server run check
```

`build` writes to `client/dist/`. `lint` may report warnings even when it exits successfully. `server run check` starts and closes the API and **attempts a MongoDB connection if `MONGODB_URI` is configured**; without a URI, it checks scaffold startup only. It is not an isolated test suite. Historical database audits and test scripts under `server/scripts/` may require a database or have write/cleanup effects; review each script before running it.

## Ownership guardrails

- Eshal: global UI, auth/profile, media, shared app integration and backend auth/media foundation.
- Maria: explorer/content, characters, articles, bookmarks and submissions.
- Wirsha: events, releases, merchandise, feedback and admin UI.

Do not modify another member's assigned implementation files without team approval.
