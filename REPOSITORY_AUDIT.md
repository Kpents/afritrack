# Technical audit: swapnilpreet/CRONOMETER.COM

Repository: https://github.com/swapnilpreet/CRONOMETER.COM (public; examined 14 Oct 2026)

**Decision:** Feature reference only, not a safe basis for AfriTrack source reuse or production hosting.

## Confirmed findings from source inspection

1. Project is a 2022 educational React/Chakra UI + Express/Mongoose/Redux clone. Its README describes simple login, nutritional calculations and a weekly graph, but numerous screens are largely static React markup, hardcoded figures or graphics.
2. `cronometer-clone/src/Components/AfterLogin/pages/Dairy.jsx` embeds fixed foods, macro values and an October 2022 date. Chart images are imported from static files.
3. `cronometer-clone/src/Components/AfterLogin/pages/Trends.jsx` renders chart images rather than user-calculated chart data.
4. `cronometer-clone/src/Components/AfterLogin/pages/Modal1.jsx` renders an "Add" button, but no working save handler in that component.
5. `Backend/routes/userFood.route.js` does not scope the read/delete queries to the logged-in user and its delete method references `UserFoodsModel`, which is not imported or defined there. It also uses a regex from unvalidated request text.
6. `Backend/routes/userExercise.route.js` returns all exercises without scoping them to a user.
7. `Backend/index.js` imports `validate` from `model/auth.model`, while the inspected model exports `User`, not `validate`; `app.use(validate)` is therefore invalid as written.
8. The authentication middleware is exported as a factory but passed to `app.use(authentication)` without invoking it. Authorization behavior is therefore broken as wired. Login code also logs user data and password hashes during login.
9. The Git tree contains `Backend/.env` and committed `node_modules`. We did not read or reuse the `.env` contents. Secrets present in publicly committed environment files should be treated as exposed and rotated by their owner.
10. GitHub repository metadata reports no top-level license. Backend package manifest's ISC declaration does not grant blanket permission to reuse the rest of the repository.

## Outcome

AfriTrack re-implements app workflows and its design *from scratch*, without copying source or assets from that repository. It is deliberately a locally run, single-browser MVP pending verified nutrition data and a secure production backend.
