# AfriTrack v5 deployment

Supported topology: one Node 24 process, SQLite on a durable local volume, same-origin frontend and API, HTTPS reverse proxy. Do not scale to multiple hosts against this SQLite file. PostgreSQL is not implemented.

Local: `cd app`, then `npm start`; open http://localhost:4173. Run `npm test` for API and calculation tests. No install step is required. Production build: `docker build -t afritrack:v5 .` (runs tests in its build stage).

Production:
1. Provision a Linux Docker host with persistent disk and an HTTPS domain.
2. Copy `.env.example` to `.env` and set AFRITRACK_ORIGIN to the exact HTTPS origin, without a trailing slash. Compose reads this file; direct Node execution needs exported environment variables or `node --env-file=.env server/server.mjs`.
3. Run `docker compose up -d --build`.
4. Configure Caddy or another TLS reverse proxy to send that domain to 127.0.0.1:4173. Only expose HTTPS publicly. The application port is bound to localhost.
5. Verify `/api/health`, create a test account, log a meal, restart the container and verify retrieval, then test another browser and a sync conflict. No production URL has been provisioned by this work.

Database schema is initialized idempotently by `openDatabase`; existing users, sessions and backups are retained. The baseline upgrade marks PRAGMA user_version=1 nondestructively and refuses newer schemas. A general multi-version migration runner remains future work.

Backups: use `node server/backup.mjs SOURCE.sqlite NEW_BACKUP.sqlite` on the host where Node 24 can read the database, or run it inside the container with a destination in a mounted backup directory. VACUUM INTO captures a consistent snapshot including WAL changes; copying the live main SQLite file alone is unsafe. Encrypt backups, store them independently, restrict access, and set a retention policy. The destination must not already exist.

Recovery drill: stop writes, preserve the current database and WAL/SHM files together, restore a backup into an empty data directory with node-user ownership, start the service, check health and a known test account's state. Perform this drill before accepting real data.

Rollback: retain the previous image digest and an independently verified pre-release backup. Stop the service before restoring data. Do not delete the named volume during routine redeployment. Restore both the previous image and compatible database if a future schema migration prevents a code-only rollback.

External requirements: hosting/domain credentials, reviewed privacy policy and retention procedures, verified food dataset licensing and nutrition review. Email reset, payments, wearables, AI recognition, PostgreSQL and dietitian collaboration are not configured and must not be represented as connected.


## GitHub Pages client review

Build with `node scripts/build-pages.mjs`. Test its project-subpath layout with `node scripts/preview-pages.mjs`, then open http://127.0.0.1:4174/afritrack/. This static client build contains no database files, backend code or secrets. `app/src/deployment.js` is rewritten only inside dist to disable cloud account requests. The source flag stays false for the full server build.

GitHub Actions Pages deployment needs repository Settings → Pages → Source: GitHub Actions. The workflow uploads only dist. Reviewers can use logging, recipes, reports and export in their own browser; data does not sync to other devices. No production user records are published. Clearing browser storage removes that browser's diary, so use JSON backup for retention.
