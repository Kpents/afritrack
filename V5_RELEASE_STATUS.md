# v5 release status — 24 October 2026

## Fully working within tested scope

46 Node tests passed using Node 24.18.0, with loopback access enabled for the API suites. Coverage includes registration/login and ownership, account deletion and password changes, persistent SQLite restart, stale revision conflicts, scoped client storage, transient retry scheduling, portion/macronutrient arithmetic, missing micronutrients, recipe yield, CSV handling, schema baseline upgrades and consistent backup restoration. These are API/unit/integration results, not full browser certification of every feature.

Desktop browser workflow checked: open explorer, select jollof, change portion to 100 g, add to diary, verify 155 kcal, reload and verify dashboard retrieval. All figures are calculations over explicitly unverified catalog fixtures. Mobile dashboard and explorer rendered at 390 × 844; screenshots saved under screenshots/.

## Partially working

Reference-inspired visual treatment on existing pages and a functional first-use welcome/setup flow are implemented. All requested standalone screen layouts are not complete. Guest food logging is checked in the browser; account workflows are API-tested. Whole-document sync has durable pending flags, backoff and explicit conflicts, but lacks record-level merge and cold offline authenticated startup. SQLite single-instance deployment is packaged; PostgreSQL is not implemented. Baseline schema versioning handles the legacy schema; a general multi-version migration framework remains outstanding.

Docker build and all 46 tests passed on GitHub Actions (validate run 40103173236). GitHub Pages client deployment succeeded (run 40103173155, second attempt). Live URL: https://kpents.github.io/afritrack/. The Node account backend is not hosted; Compose has not been run against a production server. Comprehensive responsive interaction, accessibility and adversarial nested-record validation remain engineering work.

## Not yet implemented

Licensed verified African food composition import and review; thousands-food catalog and detailed ingredient variations; email verification/password recovery; payments/subscriptions; professional client permissions; AI/voice recognition; native health/wearables; external adapter integrations; production operational/security review. These require both engineering and, where applicable, provider credentials or data licensing.

## Artifacts

README.md, DEPLOYMENT.md, SECURITY_CHECKLIST.md, IMPLEMENTATION_LOG.md, Dockerfile, compose.yaml, .env.example, .github/workflows/ci.yml, tests/hardening.test.mjs, tests/backup.test.mjs, updated tests/cloud.test.mjs, and FEATURE_PARITY_MATRIX.md addendum.

Screenshots represent the changed implementation, not the supplied reference or old preview images. The preview server uses a temporary database, with only synthetic browser test data.


## Public client preview verification

Created public repository https://github.com/Kpents/afritrack and published https://kpents.github.io/afritrack/ on 24 October 2026. Checked onboarding, food explorer, 100 g jollof logging (155 illustrative kcal), reload persistence and mobile rendering at 390x844 on the live site. Source and preview contain no server databases or real user health histories. New screenshot: screenshots/v5-live-welcome.png. The hosted preview has explicitly disabled cloud account controls and stores each reviewer's records only in that browser.

