# AfriTrack v3 — Functional Expansion (14 October 2026)

## Features built

| Feature | Actual behavior |
|---|---|
| Diary bulk actions | Checkbox select, move to existing custom group, delete selected items for selected date |
| Diary groups | Add/remove custom meal categories; reject deletion of groups with diary entries |
| Meal templates | Capture a group of logged entries with snapshot nutrients; re-log into date-specific diary |
| Recent foods | Distinct recently logged foods, quick open in food selection |
| Recipe importer | Paste 1–50 ingredient lines with grams/kg; fail all unmatched lines; normalize nutrient totals to cooked yield; save as custom recipe |
| Energy estimates | Mifflin–St Jeor adult equation, configurable activity multipliers, explicit opt-in application of result |
| Macro presets | Balanced, protein-focused, carbohydrate-focused editable goals |
| Food contributors | Rank stored diary entries by kcal, protein, carbs, fat or fibre |
| Dual-metric charts | Per-series normalization; 7/14/30/90-day history; saved/reopened chart definitions |
| CSV health import | Atomic validation and local import of steps, water (ml), weight (kg) and sleep hours |
| Data feedback | Local draft reporting and JSON export; no submission to actual nutrition reviewers |
| Manual micronutrients | 20 vitamin/mineral measures supported on custom foods with unknown-value coverage; portion and fully-known recipe propagation |
| Live fasting readout | Active fasting duration updates every 30 seconds in the Fasting tab |
| Camera barcode reader | EAN/UPC camera detection when supported; searches user-entered barcodes only |

## Running and checking

`cd app && npm start` · Node 18+ · http://localhost:4173

`cd app && npm test` · 39 passing automated unit tests. Node HTTP server served index successfully at http://localhost:4174 during checks. Browser end-to-end UI verification was unavailable due to runtime restrictions: browser `ERR_BLOCKED_BY_ADMINISTRATOR` on both local and file URLs. Test on Chrome/Safari/Android and iOS before distributing.

## Known limitations

- All supplied nutrition numbers are illustrative; micronutrient and food source verification remain unimplemented.
- No secure cloud account/sync, wearable direct integrations, billing, image AI, professional features or real moderation. CSV data import requires a correctly formatted exported file.
- Browser barcode reader depends on HTTPS/localhost, device camera permissions and `BarcodeDetector` support. No public packaged-food catalog is bundled.
- No professional or medical advice; resting/maintenance energy estimates can be inaccurate. Adult-only equation form.
- Currently localStorage per-browser; backup is essential, and private clinical data should not be saved.

See FEATURE_PARITY_MATRIX.md for the fuller 140-item implementation coverage and NEXT_STEPS.md for phased production work.
