# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

This is a diploma (thesis) project: a music streaming service whose core feature is **track recommendations generated via TF-IDF** (text profile over track metadata, blended with normalized audio features, compared by cosine similarity). `dp-recommender-engine` is the service that implements this — see its own README and the "Why NearestNeighbors instead of a full cosine-similarity matrix" section for the actual algorithm. When the user talks about "recommendations" or "the recommender," this TF-IDF pipeline is almost always the thing in scope, not a generic suggestion feature.

## Repository layout

This is a diploma (thesis) project made of three independently-run services, each with its own git repo, plus a shared seed script:

- `dp-music-api-main/` — Node/Express/TypeScript "Core API". MongoDB-backed. Port `9999`.
- `dp-music-client-main/` — React/TypeScript (Create React App) + MobX client. Port `3000`.
- `dp-recommender-engine/` — Python/FastAPI content-based track recommender microservice. Port `8006`.
- `scripts/seed_tracks.py` — one-off script that seeds the API's MongoDB with tracks from the recommender's CSV dataset via the public `POST /api/v1/track` endpoint, so `track_id`s overlap between the two services.

There is no root package.json / build system tying these together — each service is run and developed independently, from its own directory.

## Running everything locally

Prerequisites: MongoDB running locally on `27017` (as a Windows service here), Node deps installed (`npm install` in both `dp-music-api-main` and `dp-music-client-main`), and a Python venv with `requirements.txt` installed in `dp-recommender-engine`.

```bash
# 1. Core API (from dp-music-api-main/)
npm run dev          # nodemon ./src/index.ts, serves on :9999

# 2. Recommender engine (from dp-recommender-engine/, venv activated)
python -m app.main   # serves on :8006; first run builds+caches TF-IDF/NearestNeighbors index under data/artifacts/

# 3. Client (from dp-music-client-main/)
npm start            # react-scripts dev server on :3000
```

Order matters loosely: the API and recommender don't block each other at startup, but the client calls the API, and the API's playlist recommendation endpoint calls the recommender over HTTP — so for that feature to work, the recommender must be up before it's exercised.

The client's API base URL is hardcoded in `dp-music-client-main/src/config/endpoints.ts` (`http://localhost:9999/api/v1`), not an env var. The API's recommender URL is hardcoded the same way in `dp-music-api-main/src/config/recomender.ts` (`http://localhost:8006`).

### API build/other commands (dp-music-api-main)

- `npm run build` — webpack bundle to `build/server.js`
- `npm start` — run the webpack build (production-style)
- No test script or linter is configured.

### Client commands (dp-music-client-main)

- `npm run build` / `npm test` — standard CRA scripts. No tests currently exist in `src/`.

### Recommender commands (dp-recommender-engine)

- `GET /health` reports whether the NearestNeighbors index finished building and how many tracks are indexed — check this before assuming the recommender is usable.
- No test suite configured.

## Architecture

### dp-music-api-main (Core API)

- Entry point `src/index.ts` wires Express, CORS, JSON body parsing, mounts everything under `/api/v1` via `src/routes/router-V1.routes.ts`, and falls through to a `NotFoundError` + central `errorHandler` middleware (`src/middlewares/error-handeler.ts`).
- Routing is versioned (`routes/api-version-1/*`) with four resource routers: `health`, `track`, `playlist`, `user`.
- Data layer uses an **Active Record** pattern: `src/database/active-records/*.record.ts` wrap Mongoose models (`src/database/models/*.model.ts`) and are the only place controllers should talk to the DB. Each record file exports a singleton instance (e.g. `playlistRecord`, `trackRecord`, `userRecord`) used directly in controllers.
- Auth is JWT-based (`jsonwebtoken`), with two middleware flavors:
  - `checkAuth` (`middlewares/check-authorization.ts`) — rejects the request if the token is missing/invalid, populates `request.jwt`.
  - `injectToken` (`middlewares/inject-token.ts`) — same decode logic but never rejects; used on routes that behave differently for authed vs anonymous users.
- `errors/` defines a `CustomError` hierarchy (`BadRequestError`, `NotFoundError`, `DatabaseConnectionError`, `RequestValidationError`); throw these from controllers/records and let `error-handeler.ts` serialize them.
- External integrations:
  - Spotify: `config/spotify.ts` + a module-level `spotifyToken` exported from `index.ts`, used by `utils/getSpotifyTrackInfo.ts` to enrich track records with cover art/artist/preview URL at read time (tracks are stored in Mongo without this metadata).
  - Recommender engine: `services/Reccomendation.service.ts` POSTs the playlist's `track_id`s to the recommender's `/playlist/recommendation/summary` and resolves the returned Spotify ids back to full track documents via `trackRecord.getTracksBySpotifyIds`. See `PlaylistController.getRecommendationSummary`.
- Logging goes through Winston (`src/logs/winston.ts` + `logController`/`logDB`/`logError`/`logGeneral` helpers), writing to `combined.log` / `error.log` in the project root.
- `plopfile.js` + `plop-templates/` provide a generator (likely for scaffolding new resources — controller/record/model/routes) rather than an app dependency.

### dp-music-client-main (Client)

- CRA app with MobX for state (`src/stores/*Store.ts`: `UserStore`, `PlayerStore`, `PlaylistStore`) exposed via React context in `src/hooks/useStore.ts` (`StoreContext`/`StoresEnum`), not `mobx-react-lite` observer wiring in a Provider at the root — check `src/index.tsx` before assuming Provider-based injection.
- `App.tsx` does manual path-based branching (`window.location.pathname`) for `/auth` and `/artist` *outside* of `react-router`'s `<Routes>`, and only wraps the "main app" pages (`/`, `/playlist/:id`, `/liked`, `/account`) in router `<Routes>`. Keep this in mind when adding pages — it's not a single consistent routing scheme.
- Auth flow lives in `src/hooks/useAuth.ts` + `useCheckAuth.ts`, combined in `useInit.ts` (called once from `App.tsx`): checks access token expiry in `localStorage` (`utils/LocalStorage.ts`), falls back to refresh-token exchange via `api/auth.api.ts`, then fetches the current user. Note the redirect-to-`/auth`-on-invalid-session branch in `useAuth.ts` is currently commented out.
- `src/api/*.api.ts` are thin wrappers around the shared `httpClient` (`src/api/HttpClient.ts`), which is a hand-rolled `fetch` wrapper (not axios) that always attaches `Authorization: Bearer <token>` from `localStorage` and always expects/parses a JSON body — including on `delete`.
- `src/config/endpoints.ts` hardcodes `BASE_URL` to the local API; there's no `.env`/`REACT_APP_*` override in this client.

### dp-recommender-engine (Recommender)

- Standalone FastAPI service, deliberately decoupled from MongoDB — it only agrees with the Node API on the Spotify `track_id` string as a shared key (see its `README.md` "Contract with dp-music-api-main" section).
- Pipeline (`app/recommender.py`): TF-IDF over track text metadata + MinMax-scaled audio features, L2-normalized and blended, indexed with `sklearn.neighbors.NearestNeighbors(metric="cosine")` — chosen over a full pairwise cosine-similarity matrix because the real dataset (~1.1M tracks) makes an O(n²) matrix infeasible (~4.5TB). Capped via `MAX_TRACKS` in `.env`.
- Fitted artifacts (TF-IDF/scaler/index) are cached under `ARTIFACTS_DIR` (`data/artifacts/`), keyed by dataset path+size+mtime, so only the first startup after a dataset change pays the fitting cost.
- Startup failure mode: if the dataset isn't present/ready, `DatasetNotReadyError` is caught in `main.py`'s startup hook so the process doesn't crash — `/health` reports `not_ready` instead. Check `/health` first when debugging "recommendations don't work."
- Endpoints: `POST /playlist/recommendation/summary` (used when creating "Made for you" playlists), `POST /playlist/recommendation/explained` (same results plus a per-feature cosine breakdown; backs the playlist page's "% match / Why this track?" UI), `PUT /catalog` (the API registers its Mongo `track_id`s so results are restricted to tracks the app has), `POST /evaluation` (leave-one-out offline metrics vs. ablations/baselines, shown on the stats page), and `GET /track/{track_id}/recommendation` (thesis single-track requirement, not wired up).
- The cache key includes `CACHE_VERSION` in `recommender.py`; bump it when the cached state's shape changes, which forces a one-time index rebuild.

## Track metadata (covers / previews)

Spotify's API is unusable here (requires the app owner to have Premium), so `utils/getSpotifyTrackInfo.ts` uses Deezer's public search. Covers, artists, and the stable `deezerId` are persisted on `Track` documents once resolved. **Preview URLs are never persisted**: Deezer signs them with a ~15-minute expiry (`hdnea=exp=...`), so the player fetches a fresh one per play via `GET /api/v1/track/:id/preview` (cached in memory until shortly before expiry).

## Cross-service contract gotchas

- Track identity is the Spotify id, stored as `track_id` in both the recommender's dataset and the API's Mongo `Track` documents. Mongo holds only ~45k of the index's 150k tracks, with uneven genre coverage, so unrestricted nearest neighbours often don't exist in Mongo. `RecommendationService.ensureCatalog()` fixes this by sending Mongo's `track_id`s to `PUT /catalog` once per API process (persisted to `data/artifacts/catalog.json`). If Mongo's track set changes, restart the API so the catalog is re-registered.
- Both cross-service URLs (`RECOMMENDER_API_ENDPOINT` in the API, `BASE_URL` in the client) are hardcoded to `localhost` with fixed ports rather than read from env — if you change a port, update the constant in the consuming service too, not just that service's own `.env`/`PORT`.
