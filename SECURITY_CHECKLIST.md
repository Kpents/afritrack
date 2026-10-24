# AfriTrack v5 security checklist

Implemented and covered by API/unit tests: scrypt password hashing, opaque hashed session tokens, account ownership, optimistic revision checks, origin filtering, JSON object/type boundaries, credential input types, payload limits, bounded login rate-limit storage, path restrictions, HTTP security headers and HTTPS-only production configuration. Secure cookies are enabled with an HTTPS public origin. Existing server tests cover password changes and account deletion.

Operational gates still required:
- Configure TLS proxy, exact public origin, persistent disk, encrypted backups and restricted host access.
- Run Docker build and smoke tests on the deployment host; Docker is unavailable in the development shell.
- Test the actual public URL and mobile browsers; finish keyboard, contrast and screen-reader audit.
- Supply a reviewed privacy policy, retention/deletion rules covering backups, and incident response contacts.
- Implement email ownership verification and secure password recovery with a real mail service before public account enrollment.
- Review the complete imported/synchronized record schema and security-test hostile nested records. Top-level backup validation alone is not comprehensive.
- Replace illustrative foods with licensed, reviewed records. No nutrition verification was performed.

Limits: single-process in-memory authentication throttling is intentionally conservative behind a proxy (all proxy traffic may share one bucket); no trusted forwarded-IP parsing. No MFA, independent penetration test, regulatory certification, record-level sync merge, or encryption of database contents by the application.
