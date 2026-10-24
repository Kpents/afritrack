# AfriTrack next milestones (after v4)

1. **Production hardening:** enforce secure HTTPS deployment, e-mail verification/recovery, MFA or passkeys, backup restore drills, server logs without sensitive data, independent security review, access consent/deletion policies. Transition to managed PostgreSQL when justified.
2. **Nutrition provenance:** acquire license/permission for authoritative Ghana/FAO ingredient data; add recipe grams and cooked yields, per-nutrient analytical provenance, per-food reviewer decisions, alias/country variants, user-reported corrections and explicit confidence labels. No unsupported micronutrient claims.
3. **Full mobile UX/e2e:** test real iOS/Android devices and keyboard/screen reader workflows, implement robust per-record IndexedDB queue and server-side merges. Cold-start offline authenticated access requires privacy design.
4. **Integrations:** real regional packaged-food barcode catalog; Apple Health and Health Connect apps; controlled photo inference, multilingual speech capture with explicit meal confirmation.
5. **Subscription/professional suite:** opt-in dietitian collaboration, client roles, reporting permissions, billing, export and privacy workflows.

Read `FEATURE_PARITY_MATRIX.md` for the full inventory. V4 is genuine additional functionality, but **not** universal Cronometer feature parity.
