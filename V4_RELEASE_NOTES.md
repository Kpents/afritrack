# AfriTrack v4 — Authenticated multi-device foundation

## Shipped and tested

- Original AfriTrack minimalist frontend remains functional; v1–v3 user workflows preserved.
- SQLite database for independent user identities, account sessions and revisioned per-user diary backups.
- Sign-up, sign-in, sign-out, current-password change with other-session invalidation, account deletion.
- Scrypt salt+password hashing, random opaque cookies, hashed session tokens in database, HttpOnly/SameSite=Strict cookies, mutating origin checks, login rate-limit, response hardening, JSON payload limit.
- Device-scoped browser state for each account, kept separate from previous unauthenticated diaries.
- No implicit transfer of a guest diary to an account. Optional explicit "Copy offline guest diary" action.
- Local diary saves continue while the app is open without internet; edits queue automatically for synchronization when online.
- Optimistic concurrency checking via revision number; when another device made changes, the client preserves local edits, shows an explicit conflict and asks which copy to keep.
- Explicit server-record restore downloads a safety JSON backup before replacing local data.
- Foreground revalidation pulls a newer server copy when no unsynced device edits exist.
- Settings reachable on small screens by tapping the profile/avatar button in the top bar.
- Server integration tests validate registration, data isolation, conflict protection, session persistence, logout, credential changes, account deletion and SQLite restart.
- Client unit tests validate guest/account isolation, explicit guest import, stale-revision conflict behavior, signout cache cleanup.

## Honest limits

- The server is self-hosted and requires Node.js >=22.13. It is *not* a hosted cloud account service until independently deployed and operated. No email verification, reset email, passkeys, MFA, social login, or OAuth.
- No automatic cloud database encryption at rest; use host disk encryption, secure deployment, backed-up storage and TLS/HTTPS proxy. Sessions expire after 30 days. No security/privacy compliance audit has been completed.
- This is whole-document revision-based synchronization, not record-level conflict merging or multi-user shared journals. A conflict requires an explicit user decision.
- While the app is open, offline edits queue locally. Cold offline starts requiring a prior account session validation are not supported; the server must be reachable.
- The original 25 African meals are **unverified test estimates**. Do not make medical or precision nutrition decisions from these example values.
- Third-party AI/photo recognition, food databases, wearable sync, billing, dietitian accounts and regulatory readiness are not yet implemented.
- Chromium E2E navigation was blocked in this execution environment. This release has automated API + pure logic tests and syntax checks, **not** a completed manual/automated end-to-end mobile browser certification.

## Operational and next-phase priorities

1. Move SQLite to managed PostgreSQL with encrypted backups, migrations and restore drills (when scaling to many users).
2. Add email verification, secure account recovery, account notifications, and MFA/passkeys.
3. Professionally source, license, label and validate West African food-composition data with qualified reviewers.
4. Implement record-level offline queues and conflict resolution for multi-device concurrent edits.
5. Secure independent staging and production environments; accessibility + E2E testing; formal security/privacy review, including data-subject requests and deletion of backups.
