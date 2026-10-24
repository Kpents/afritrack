# AfriTrack v5 — release candidate foundation

This update preserves the supplied dependency-free PWA and SQLite account service. It is a partial implementation of the supplied v5 specification, not a completed public product.

## Run

Node 24 recommended (minimum 22.13). From this directory:

```sh
npm start --prefix app
npm test --prefix app
```

Open http://localhost:4173. Settings contains account registration and login. New accounts have empty diaries; guest records transfer only through an explicit action. All catalog nutrition remains illustrative and labeled unverified.

## Delivered changes

- Cream, forest and terracotta visual styling, reduced-motion support, clearer focus rings and larger controls.
- JSON object/content-type validation, safer credential handling, malformed-origin rejection, bounded rate-limit memory, HTTPS production guard, HSTS and graceful shutdown.
- Durable pending snapshot synchronization now retries transient failures with exponential backoff capped at 60 seconds. Revision conflicts still require explicit choice; there is no automatic record merge.
- Nondestructive legacy schema initialization with SQLite user_version tracking and a guard against opening newer schemas.
- Consistent SQLite backup CLI and restoration regression test.
- Multi-stage non-root Dockerfile, persistent-volume Compose configuration, environment example, CI, deployment/rollback instructions.

## Verification and remaining work

See [V5_RELEASE_STATUS.md](V5_RELEASE_STATUS.md), [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md), [DEPLOYMENT.md](DEPLOYMENT.md), and [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md). The existing detailed [feature matrix](FEATURE_PARITY_MATRIX.md) remains the long-term inventory, with a v5 status addendum.

No production deployment has been performed. No public URL is claimed. Docker packaging must still be built on a Docker host. Verified food data, email recovery, PostgreSQL, payment/wearable/AI adapters, dedicated onboarding and professional workflows, and comprehensive mobile end-to-end testing remain open.

## Source

`app/src` contains the UI, nutrition calculations, local persistence and cloud client; `server` contains the same-origin HTTP API, SQLite account model and backup tool; `tests` contains Node API/calculation/storage regressions. No React rewrite or external assets were introduced. Original v4 notes remain available in V4_RELEASE_NOTES.md.

## Client preview on GitHub Pages

The public progress preview is designed for `https://kpents.github.io/afritrack/`. Publishing is verified separately in the release status; this configured address alone is not proof of a successful deployment.

`node scripts/build-pages.mjs` exports only the frontend to `dist/`, with cloud account controls explicitly unavailable. Diaries, recipes, health entries and exports work in browser storage. The first-use welcome page sets a diary name without creating a cloud account. No sample user histories are seeded. Source food values remain labeled illustrative estimates.

The Pages workflow runs tests, builds and deploys on main. In repository Settings → Pages, select GitHub Actions as the source. The full Node/SQLite backend is in the repository but does not execute on GitHub Pages. A separate persistent server deployment is required for registration and cross-device sync.
