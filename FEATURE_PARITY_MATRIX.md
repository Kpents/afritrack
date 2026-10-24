# AfriTrack — Cronometer Feature Parity Matrix

**Audit:** 14 October 2026; updated for AfriTrack v4 on 14 October 2026. **Scope:** features documented on Cronometer public Basic, Gold, Pro, user manual and release notes. This is a practical audit rather than a contractual guarantee of every private setting or unreleased feature.

**Status legend:** **Working** = implemented in the locally runnable v4 self-hosted prototype; **Partial** = useful local subset, restricted to verified capabilities / sample data; **Not built** = requires additional engineering, licensing, cloud infrastructure or native/mobile access. **This is an implementation checklist, not a production certification. V4 backend integration tests passed, but complete interactive browser E2E was blocked by the environment.**

| Area | Feature | AfriTrack v4 status |
|---|---|---|
| Accounts / platform | Installable offline-first PWA | Working |
| Accounts / platform | Local backup/restore (v1-compatible) | Working |
| Accounts / platform | Mobile-responsive interface | Partial |
| Accounts / platform | Accessibility semantics and keyboard controls | Partial |
| Accounts / platform | Cloud user accounts and profiles | Working (self-hosted SQLite) |
| Accounts / platform | Email sign-up, password reset and social login | Partial (email/password registration + sign-in; no reset or social) |
| Accounts / platform | Two-factor authentication and passkeys | Not built |
| Accounts / platform | Encrypted multi-device sync and conflict resolution | Partial (revisioned multi-device sync + conflict UI; HTTPS required at deployment, no end-to-end encryption) |
| Accounts / platform | Account deletion and privacy export | Working (server deletion + browser JSON export; legal compliance review still needed) |
| Accounts / platform | Push reminders and notification controls | Not built |
| Accounts / platform | Native iOS and Android releases | Not built |
| Accounts / platform | Custom dashboard widgets and layout | Not built |
| Accounts / platform | Internationalization and regional units | Not built |
| Accounts / platform | Gold-style plans, entitlement checks and billing | Not built |
| Food discovery and data | African dish catalog (25 sample meals) | Working |
| Food discovery and data | Regional food search and filters | Working |
| Food discovery and data | Custom foods with per-100g figures | Working |
| Food discovery and data | Favourite foods | Working |
| Food discovery and data | Manual local EAN/UPC barcode lookup | Working |
| Food discovery and data | Regional dishes and local-language aliases | Partial |
| Food discovery and data | Serving sizes and household measures | Partial |
| Food discovery and data | Food data provenance labeling | Partial |
| Food discovery and data | Ingredient and topping adjustments | Partial |
| Food discovery and data | Food library search ranking | Partial |
| Food discovery and data | Independently validated 95-nutrient dataset | Not built |
| Food discovery and data | Licensed global food composition database | Not built |
| Food discovery and data | African packaged-product/barcode database | Not built |
| Food discovery and data | Live camera barcode scanner | Partial |
| Food discovery and data | Food submission and correction workflow | Partial |
| Food discovery and data | Dietitian-reviewed regional recipe variants | Not built |
| Food discovery and data | Country-specific ingredients, yields and retention factors | Not built |
| Food discovery and data | Diet tags, allergens and exclusions | Not built |
| Food discovery and data | Nutrient source audit trail and quality confidence | Not built |
| Diary and logging | Food logging by selected date/meal | Working |
| Diary and logging | Food portion grams and accompaniments | Working |
| Diary and logging | Diary add/edit/delete | Working |
| Diary and logging | Date picker and date navigation | Working |
| Diary and logging | Optional food entry timestamps | Working |
| Diary and logging | Copy a single logged meal | Working |
| Diary and logging | Copy all foods from previous day | Working |
| Diary and logging | Recurring meals with selected weekdays | Working |
| Diary and logging | Water logging and water target | Working |
| Diary and logging | Daily notes | Working |
| Diary and logging | Natural-language meal query and quantity parsing | Partial |
| Diary and logging | Voice-to-text capture (browser-dependent) | Partial |
| Diary and logging | Verified AI food photo recognition and portion inference | Not built |
| Diary and logging | True Siri/Android voice shortcut integration | Not built |
| Diary and logging | Diary multi-select and bulk edit | Working |
| Diary and logging | Customizable diary groups | Working |
| Diary and logging | Drag-and-drop diary reordering | Not built |
| Diary and logging | History-based quick add and recent foods | Working |
| Diary and logging | Food photo archive | Not built |
| Diary and logging | Meal planning and food schedule calendar | Not built |
| Foods / recipes | Custom recipe builder from logged foods | Working |
| Foods / recipes | Saved recipes with adjustable servings | Working |
| Foods / recipes | Delete custom foods and recipes | Working |
| Foods / recipes | Pre-calculated recipe nutrition estimates (demo sources only) | Partial |
| Foods / recipes | Recipe URL importer and ingredient parsing | Not built |
| Foods / recipes | Paste-recipe importer | Working |
| Foods / recipes | Cooked recipe weight / yield correction | Partial |
| Foods / recipes | Custom meal templates distinct from recipes | Working |
| Foods / recipes | Shared food and recipe links | Not built |
| Foods / recipes | Food label OCR import | Not built |
| Nutrition and diet goals | Calories, macros and fibre totals | Working |
| Nutrition and diet goals | Per-day editable calorie and macro targets | Working |
| Nutrition and diet goals | Weekday macro target scheduler | Working |
| Nutrition and diet goals | Macronutrient daily progress visuals | Working |
| Nutrition and diet goals | Weekly macro balance chart | Working |
| Nutrition and diet goals | Energy expenditure from manual exercise (MET estimate) | Partial |
| Nutrition and diet goals | Nutrient ranking and suggestions (only macros/fibre) | Partial |
| Nutrition and diet goals | Daily nutrition report based on demo values | Partial |
| Nutrition and diet goals | Non-judgmental target/balance summaries | Partial |
| Nutrition and diet goals | BMR/TDEE calculator with activity levels | Partial |
| Nutrition and diet goals | Adaptive energy targets/weight-goal forecast | Not built |
| Nutrition and diet goals | Keto/low-carb calculator and net carbs | Not built |
| Nutrition and diet goals | Complete vitamin and mineral tracking | Partial |
| Nutrition and diet goals | Fatty acids, amino acids, phytate and fibre subtypes | Not built |
| Nutrition and diet goals | Dietary reference intake target wizard | Not built |
| Nutrition and diet goals | Nutrient balances / ratios and absorption scores | Not built |
| Nutrition and diet goals | Nutrition Scores and custom score selection | Not built |
| Nutrition and diet goals | Food contributors by nutrient | Working |
| Nutrition and diet goals | Keto, vegan and other diet templates | Partial |
| Nutrition and diet goals | Supplement nutrition logging | Not built |
| Activity and biometrics | Manual steps entry | Working |
| Activity and biometrics | Exercise sessions and MET calorie estimates | Working |
| Activity and biometrics | Body weight entries | Working |
| Activity and biometrics | Biometrics: BP, glucose, heart rate, temperature, waist, mood | Working |
| Activity and biometrics | Manual sleep duration tracking | Working |
| Activity and biometrics | Manual custom numeric biometrics | Working |
| Activity and biometrics | Biometric deletion and date history | Working |
| Activity and biometrics | Weight chart from local manually entered data | Partial |
| Activity and biometrics | Movement/nutrition together in reports | Partial |
| Activity and biometrics | Apple Health / Apple Watch integration | Not built |
| Activity and biometrics | Android Health Connect / Samsung Health integration | Not built |
| Activity and biometrics | Fitbit, Garmin, WHOOP, Oura and Withings integrations | Not built |
| Activity and biometrics | Dexcom/CGM and Keto-Mojo data integration | Not built |
| Activity and biometrics | Polar/Suunto and other supported wearables | Not built |
| Activity and biometrics | Cycle and period tracking | Not built |
| Activity and biometrics | Stool / Bristol scale logging | Not built |
| Activity and biometrics | Heart rate time-series visualization | Not built |
| Activity and biometrics | Glucose-ketone index and CGM overlays | Not built |
| Activity and biometrics | Sleep stages and recovery monitoring | Not built |
| Insights, reports and coaching | Seven-day intake overview and calorie bars | Working |
| Insights, reports and coaching | Custom metric selection (10 local metrics) | Working |
| Insights, reports and coaching | 7/14/30/90-day metric trends | Working |
| Insights, reports and coaching | Date-by-date report tables | Working |
| Insights, reports and coaching | Browser Print / Save as PDF | Working |
| Insights, reports and coaching | Diary CSV export | Working |
| Insights, reports and coaching | Food diary logging streak | Working |
| Insights, reports and coaching | JSON backup download | Working |
| Insights, reports and coaching | Nutrient oracle for supported demo fields | Partial |
| Insights, reports and coaching | Contextual nutrient goal gaps | Partial |
| Insights, reports and coaching | Dual axis / two-series custom correlation charts | Working |
| Insights, reports and coaching | Save and manage named custom charts | Working |
| Insights, reports and coaching | Advanced nutrient balance visualizations | Not built |
| Insights, reports and coaching | Daily and weekly Nutrition Scores | Not built |
| Insights, reports and coaching | Nutrient absorption score | Not built |
| Insights, reports and coaching | Comparisons with public DRIs | Not built |
| Insights, reports and coaching | Nutrition snapshots | Not built |
| Insights, reports and coaching | Data export from connected devices | Not built |
| Insights, reports and coaching | AI assistant grounded in personal logs and goals | Not built |
| Insights, reports and coaching | Health professional share links / permissions | Not built |
| Optional timers and habits | Manual fasting timer start/stop/history | Working |
| Optional timers and habits | Live fasting elapsed-time display (while app open) | Working |
| Optional timers and habits | Live second-by-second timer and push completion alert | Not built |
| Optional timers and habits | Fasting recurrence/scheduling | Not built |
| Optional timers and habits | Hydration reminder schedule | Not built |
| Optional timers and habits | Streak recovery and goal notifications | Not built |
| Professional / organization | Dietitian coach accounts and practitioner permissions | Not built |
| Professional / organization | Client invitation, consent and group management | Not built |
| Professional / organization | Real-time client dashboards and diary review | Not built |
| Professional / organization | Secure 1:1 client messaging | Not built |
| Professional / organization | Client-specific goals and meal plans | Not built |
| Professional / organization | 24-hour dietary recall workflow | Not built |
| Professional / organization | Practitioner reports and export packages | Not built |
| Professional / organization | Share recipes and plans with clients | Not built |
| Professional / organization | Custom white-label branding | Not built |
| Professional / organization | Practice directory and discovery | Not built |
| Professional / organization | HIPAA/CCPA/GDPR compliance program and BAAs | Not built |
| Professional / organization | Organization admin, staff roles and audit log | Not built |

**Inventory:** 140 line items — 50 working, 24 partial, 66 not built. Line items are implementation subfeatures, not independent official Cronometer features; avoid comparing the count with competitor marketing.

## AfriTrack v3 added capabilities

- **Working locally:** custom diary groups; multi-select and bulk move/delete; recently logged foods; reusable meal templates; gram/kg text recipe import (including final cooked yield); editable macro presets; food contributors by demo nutrient; two-metric trend charts and saved chart definitions; user-supplied step/water/weight/sleep CSV import; exportable food correction drafts; optional manual entry and traceable aggregation of 20 micronutrients (no missing-as-zero).
- **Partial:** camera barcode scanning is available only on devices/browsers supporting `BarcodeDetector` and `getUserMedia`, and resolves only barcodes stored in a user's custom food library. Adult BMR/maintenance estimates use a population formula and manually supplied activity levels, not a personalized clinical recommendation. Cooked yield adjustment does not apply food-specific micronutrient retention factors. Manually logged micronutrients are not validated or compared to age-specific dietary reference intakes. Food correction drafts are saved/exported locally; none are submitted to a professional reviewer.
- This **does not** imply official Cronometer source equivalence or production-level validation.

## African-first differentiators (still to build for public release)

1. Licensed national and regional food composition tables with citation, analyzed-vs-calculated nutrient provenance and reviewer approval.
2. Ghana-first dishes and serving descriptions with ingredient weights; then Nigerian, Ethiopian, Kenyan, South African and wider-African variants.
3. Mixed meal component selector (waakye + egg + gari + shito, banku + fish + pepper etc.). The current demo add-ons work mechanically but **use illustrative values**.
4. English, Twi, Ga, Ewe, Hausa, Yoruba, Igbo, Kiswahili, Zulu and regional aliases, localized portion terms and cultural context, reviewed by speakers/dietitians.
5. African packaged-goods barcode submissions with moderation, licensed labels and regional merchant coverage.
6. Ingredient-aware photo and speech logging with explicit user confirmation and uncertainty display; never AI-fabricated nutrient measurements.

## V4 backend and account-extension checklist

| Capability | V4 implementation | Limitation |
|---|---|---|
| SQLite account database and sessions | Working | Node.js >=22.13, built-in SQLite experimental API |
| Password hashing (scrypt) and secure cookie properties | Working | Must deploy behind HTTPS with correct `AFRITRACK_ORIGIN` |
| Email/password registration and sign-in | Working | No account email verification or password-recovery delivery |
| Change password and revoke other sessions | Working | No MFA, security notifications or unusual-sign-in detection |
| Separate per-user server backups | Working | Data is stored in plaintext at rest; restrict database host/permissions |
| Background page-open synchronization | Working | Periodic background sync while PWA is closed not supported |
| Revision conflict detection and explicit resolution | Working | Record-by-record merge not implemented |
| Guest-to-account migration with explicit confirmation | Working | Copies local diary; does not merge two accounts |
| Account sign-out clearing local account cache | Working | Existing browser-local guest copy is retained separately |
| Server account deletion | Working | Host operator must also apply retention policy to external backups |
| Offline account use after cold page restart while server unavailable | Partial | The user must reconnect for session validation; never bypass auth |
| Automatic database backups, recovery drill, audit trails | Not built | Needed for operational reliability |

## Build order and gating

**P0 — reliability and trust:** authentication/isolation + migrations, reliable recipe models and test fixtures, validated Ghanaian ingredient database, portion/yield standardization, privacy/compliance review and accessibility/e2e coverage.

**P1 — consumer parity:** verified macro/micro tracking, barcode catalog/camera, custom diary grouping, repeat/scheduler refinement, meal templates, nutrition reports and reliable device sync.

**P2 — enhanced insights:** dual-axis charts, nutrition scores/absorption models, goal algorithms, dietary presets, photo/voice integrations, alerts, coach with privacy safeguards.

**P3 — professional:** client consent, clinical workflows, secure messaging, practitioners, organizations, white label and business subscriptions.

**Do not** publicly represent demo calorie values as clinical-grade or claim HIPAA/GDPR compliance without independent legal/security evidence.

## Primary public references

- Cronometer official features: https://cronometer.com/features/
- Basic: https://cronometer.com/features/free-nutrition-tracking-app.html
- Gold: https://cronometer.com/gold/
- Diary manual: https://support.cronometer.com/hc/en-us/sections/360002520492-Diary
- Foods manual: https://support.cronometer.com/hc/en-us/sections/360002520612-Foods
- Trends manual: https://support.cronometer.com/hc/en-us/sections/360002524051-Trends
- Integrations: https://cronometer.com/features/sync-devices.html
- Pro: https://cronometer.com/pro/
- Official changes: https://cronometer.com/blog/cronometer-updates-whats-new-improved/
- Crono Coach: https://cronometer.com/blog/crono-coach/

## v5 release-candidate addendum — 24 October 2026

The v4 rows above are retained as historical inventory, not newly certified v5 parity. This update changes deployment packaging, backend input boundaries, retry scheduling, and global visual tokens. Existing function/API tests are rerun. Manual desktop guest logging and reload persistence are checked separately. Full mobile, account browser journeys and deployment certification remain incomplete.

| Area | v5 status | Evidence / limitation |
| --- | --- | --- |
| Accounts and state isolation | API-tested | Existing server integration suite; no browser account journey certification |
| Portion and macro calculations | Unit-tested and desktop guest flow checked | Catalog estimates remain unverified |
| Micronutrients and recipes | Unit-tested | Missing values remain unknown; no verified catalog micros |
| Pending sync retry | Unit-tested | Whole-document snapshot, explicit conflicts; cold offline account session unavailable |
| SQLite schema and backup | Integration-tested | Nondestructive baseline version; backup integrity/restore checked |
| Responsive interface | Partial | Palette applied; complete mobile/accessibility certification outstanding |
| Docker / CI | Configured, unverified runtime | Docker not available locally; CI has not run on GitHub |
| Public deployment | Not completed | Hosting, domain, TLS and reachable production URL required |
| Recovery, payments, wearables, AI, professional collaboration | Not implemented | External services and remaining engineering required |
