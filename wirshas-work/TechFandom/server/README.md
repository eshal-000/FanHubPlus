# Fan Hub Plus — API Server

Express + MongoDB (Mongoose) + JWT backend for the **Fan Hub Plus** hackathon build by Team Async Divas.

---

## 1. Setup

```bash
cd server
cp .env.example .env        # then fill in MONGO_URI + JWT_SECRET
npm install
npm run seed                # demo data (optional but recommended)
npm run dev                 # node --watch server.js → http://localhost:5000
```

`.env` keys:

| Key | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas (or local) connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES` | Token lifetime (default `7d`) |
| `PORT` | Default `5000` |
| `CLIENT_ORIGIN` | Comma-separated allowed CORS origins (default `http://localhost:5173`) |

## 2. Demo credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@fanhub.com` | `admin123` |
| **User** | `user@fanhub.com` | `user123` |

Plus 3 demo fans (`ayesha@`, `marco@`, `lena@fanhub.com` / `demo123`).

## 3. Seeded dataset

| Collection | Count | Notes |
|---|---|---|
| Users | 5 | 1 admin, 4 users with fandom prefs |
| Characters | 20 | All 8 categories, all 7 fandoms, relatedContent linked |
| Articles | 14 | 2 featured, rich-text bodies, published with views |
| Content | 16 | article/video/audio/image mix, popularity 49–95 |
| Media | 18 | video/audio/explainer mix with embeds + thumbnails |
| Events | 10 | past / **live** / upcoming mix, real city coordinates (Tokyo, Seoul, LA, Dubai, London, NY) |
| Releases | 16 | upcoming/released/delayed across all 6 types |
| Merch | 20 | gallery images + all 5 tag types |
| Feedback | 7 | bug/suggestion/query × open/in-progress/resolved, guests + users |
| Submissions | 3 | pending/approved/rejected |
| Bookmarks | 10 | across all 4 itemTypes |

Dates are generated **relative to seed time**, so the Time-Travel slider and "Live Now" event states always demo correctly.

## 4. API surface

All responses are JSON. List endpoints return `{ items: [...] }` and accept `?page=&limit=`.

### Public
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/characters` | `?search=&fandom=&category=&sort=name\|-createdAt` |
| GET | `/api/characters/:id` | → `{ character, relatedContent: { articles, media, merch } }` |
| GET | `/api/articles` | `?search=&fandom=&category=&sort=-publishedAt\|-views\|title&featured=true` (published only) |
| GET | `/api/articles/:id` | → `{ article, relatedArticles }` (+1 view) |
| GET | `/api/content` | `?category=&type=&popularity=&sort=` |
| GET | `/api/media` | `?fandom=&category=&tags=a,b&mediaType=` |
| GET | `/api/events` | `?city=&eventType=&timeFilter=past\|live\|upcoming` |
| GET | `/api/events/:id` | → `{ event, relatedEvents }` |
| GET | `/api/releases` | `?releaseType=&fandom=&category=&status=&sort=releaseDate\|title` |
| GET | `/api/merch` | `?fandom=&category=&tags=&search=` |
| GET | `/api/merch/:id` | → `{ merch, relatedMerch }` |
| POST | `/api/feedback` | `{ type, subject, message, name?, email? }` — guest-friendly (soft auth) |
| POST | `/api/auth/register` | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | → `{ token, user }` |
| POST | `/api/auth/forgot` | logs reset URL to console (hackathon mode) |
| POST | `/api/auth/reset/:token` | `{ password }` |

### Protected (Bearer token)
| Method | Endpoint | Notes |
|---|---|---|
| GET / PUT | `/api/profile` | name, fandoms, interests, displayPreferences, avatar |
| GET | `/api/bookmarks` | → `{ items }` with populated `.item` docs |
| POST | `/api/bookmarks` | `{ itemId, itemType }` (article/character/media/merch) — duplicate-proof |
| DELETE | `/api/bookmarks/:itemId` | `{ itemType? }` body optional |
| POST | `/api/submissions` | `{ title, category, fandom, body, imageUrl? }` |
| GET | `/api/submissions/mine` | own submissions |

### Admin (`protect` + `adminOnly`)
| Method | Endpoint | Notes |
|---|---|---|
| POST | `/api/admin/auth/login` | admin-role enforced (403 otherwise) |
| GET | `/api/admin/stats` | activeUsersCount, 7-day `activeUsers` series, popularCategories, trendingCategory, totalContent, upcomingEvents, pendingFeedback |
| GET | `/api/admin/users` | + `recentBookmarks/recentSubmissions/recentFeedback` (5 each, titles resolved) |
| PATCH | `/api/admin/users/:id` | `{ role: user\|admin }` (self-demotion blocked) |
| CRUD | `/api/admin/{characters,articles,content,media,events,releases,merch,submissions,feedback}` | GET list, POST create, PUT/PATCH `:id` (returns bare doc), DELETE `:id` |
| POST | `/api/admin/{submissions,feedback}/bulk` | `{ action, ids }` — submissions: approve/reject/reviewed/publish/delete; feedback: resolve/reopen/in-progress/delete |

## 5. Architecture notes

- **`models/constants.js`** — every enum in one place, matching the frontend filter lists exactly
- **Field bridges** — admin forms and public pages use some different field names (`image`/`imageUrl`, `coverImage`/`imageUrls`, `popularityScore`/`popularity`); model aliases + pre-validate hooks keep both working
- **`middleware/auth.js`** re-checks the user on every request so role changes apply instantly; `admin.js` enforces `role === "admin"`
- **`middleware/error.js`** maps Mongoose validation (400), duplicate keys (409), CastError (400) and JWT errors (401) to clean JSON
- **Events** store `lat`/`long` synced both ways with a GeoJSON `location` Point (`2dsphere`-indexed) for future geo queries
- **Search** uses escaped-regex `$or` across whitelisted fields (deterministic regardless of Atlas text index availability)

## 6. Scripts

```bash
npm run dev     # dev server with watch
npm start       # production start
npm run seed    # reset + reseed the whole database
```
