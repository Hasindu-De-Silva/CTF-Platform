# Improvements Log — UI Polish & Backend Hardening

This document records the changes applied on top of the original project. Every
change is **additive or non-breaking**: no existing API contract, business rule,
scoring logic, flag-verification flow, or route behaviour was altered.

---

## Frontend / UI

| # | File | Change | Why it matters |
|---|------|--------|----------------|
| 1 | `src/index.css` | Implemented the `animate-in / fade-in / zoom-in-* / slide-in-from-*` utility contract that the components already referenced but that had no matching CSS (the app was shipping dead animation classes). Added a `prefers-reduced-motion` guard, a faint console-style grid backdrop, thicker cyan scrollbars, a global accessible `:focus-visible` ring, `text-gradient-cyan`, `cta-sheen`, `animate-float`, and `animate-spin-slow`. | Enter transitions across modals, cards, and toasts now actually play; the whole app gains motion, depth, and consistent keyboard focus without any new dependency. |
| 2 | `src/components/common/Navbar.tsx` | Added a working **mobile navigation drawer** (hamburger toggle) — previously nav links were `hidden md:flex` with no mobile fallback, so phones had no navigation at all. Refactored the duplicated admin/player link markup into a single data-driven `NavItem[]` map. Applied the new gradient/sheen utilities. | Fixes a real responsive gap and removes ~80 lines of duplicated JSX while keeping behaviour identical. |
| 3 | `src/components/player/ChallengeCard.tsx` | Card is now keyboard-operable (`role="button"`, `tabIndex`, Enter/Space handler), lifts on hover, shows an animated accent bar + radial glow, and states hint availability clearly. | Accessibility + a more tactile, modern challenge grid. |
| 4 | `src/views/LoginView.tsx` | Added a **show/hide password** toggle, `autoComplete` hints, an `aria-live` error alert, entry animation, and the CTA sheen. | Standard login UX expectations; better a11y. |
| 5 | `src/views/RegisterView.tsx` | Added the entry animation to match the login screen. | Visual consistency. |

All frontend changes pass `tsc -b` (strict TypeScript, exit 0).

---

## Backend / Spring Boot (non-breaking hardening only)

| # | File | Change | Why it matters |
|---|------|--------|----------------|
| 1 | `config/GlobalExceptionHandler.java` *(new)* | A `@RestControllerAdvice` that maps `IllegalArgumentException` → `400`, bean-validation failures → `400` with field detail, and any other unhandled exception → a generic `500` (no stack trace leaked). Success paths are untouched. | Clean, predictable JSON errors for the frontend; stops internal stack traces from reaching clients. |
| 2 | `controller/HealthController.java` *(new)* | Adds an unauthenticated read-only `GET /api/health` returning `{status:"UP", ...}`. | Lets Docker/CI probe liveness without a session. Purely additive. |
| 3 | `config/SecurityConfig.java` | (a) Permitted `/api/health` publicly (a new rule, existing rules unchanged). (b) Added defense-in-depth response headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and a `Referrer-Policy`. | Hardens browser handling of responses without changing any endpoint behaviour. |

No changes were made to: entities, DTOs, repositories, services, the scoring
algorithm, the hint-penalty engine, flag BCrypt verification, the data seeder,
`application.properties`, `pom.xml`, or `docker-compose.yml`.

---

# Round 2 — Code Quality Refactor (no behaviour change)

Internal clean-up only: no UI, API, scoring, or challenge content was changed.
Challenge content (the `challenges/` folder, the Stage 1–8 views, the
generator scripts and the artifacts) was not touched.

## Frontend

| # | File(s) | Change |
|---|---------|--------|
| 1 | `src/utils/challenge.ts` *(new)* | One home for logic that was copy-pasted across views: `getNetPoints` (was inlined 5×), `getLaunchTarget` (the stage → in-app page/label mapping, 2× 20-line ternary chains), `withHintUnlocked` (hint-unlock state update, 2×), `areAllSolved` (2×), `byStageOrder` (5×), and `getDifficultyVariant` (moved out of `Badge.tsx`). |
| 2 | `src/utils/errors.ts` *(new)* | `getErrorMessage(err, fallback)` replaces 15 repeated `err instanceof Error ? err.message : '…'` blocks. |
| 3 | `ChallengesView`, `ChallengeModal`, `DashboardView`, `ScoreboardView`, `Admin*View`, `ChallengeFormModal`, `ChallengeCard` | Use the helpers above. Tier-title maps and the empty admin form are module constants (no longer rebuilt on every render). The search text is lower-cased once per render, not three times per item. |
| 4 | `Badge.tsx`, `Modal.tsx` | Style maps hoisted to module scope; `BadgeVariant` type exported. Removes one fast-refresh lint warning. |
| 5 | `AuthContext.tsx`, `ToastContext.tsx` | Stable callbacks (`useCallback`) and memoised context values (`useMemo`), so showing a toast no longer re-renders every component that uses `useToast()`. |

## Backend

| # | File(s) | Change |
|---|---------|--------|
| 1 | `ChallengeService` | Named constants for the hint-tier range and the rate limits (2 s cooldown, 5 failures / 60 s); the net-points rule is one `netPoints()` method shared by flag submission and the scoreboard; one `findChallenge()` replaces 6 copies of the lookup-or-throw. |
| 2 | 5 controllers | Removed the duplicated `@CrossOrigin` annotations. `SecurityConfig`'s CORS policy already handles every request first, so they had no effect (proven by identical CORS headers before and after). |
| 3 | `ChallengeController` | Gets the artifact challenge through the service instead of the repository directly. |
| 4 | Repositories | Removed 5 unused query methods and an unneeded `@Repository`; replaced a fully-qualified annotation with an import. |
| 5 | `DataSeeder` | SLF4J logging instead of `System.out.println`. Finds each stage with one targeted query instead of loading every challenge 8 times. |
| 6 | `SecurityConfig`, `UserService` | Imports instead of inline fully-qualified class names, method references, `Stream.toList()`. |
| 7 | **Test suite** *(new)* | The backend had no tests. `mvn test` now runs 30 tests on in-memory H2 (no MySQL needed): `ScoringRulesTest` pins the README penalty table and the 50% floor, and `PlatformApiIntegrationTest` covers auth, flags, rate limits, brute-force lockout, hints, reset, scoreboard, admin, artifacts, re-seeding and CORS. Adds the `h2` test-scope dependency. |

## Repository hygiene
- Stopped tracking `__pycache__/generate_challenges.cpython-314.pyc` (a generated file) and added Python caches to `.gitignore`.
- `ctf-platform-backend/README.md`: corrected the outdated startup-log sample and documented `mvn test`.

## How "no behaviour change" was verified
- **Backend:** the new tests passed on the original code first, then on the refactored code. A temporary harness also recorded every response body, status code, content type and CORS/security header for a full multi-user scenario. Those recordings were byte-identical before and after.
- **Frontend:** the production CSS bundle is byte-identical (same SHA-256), so no styling changed. Both builds were also driven through the same 65-step player and admin session in headless Chromium against a mock API, and the rendered DOM matched at every step. `tsc -b` passes, and lint warnings went from 11 to 10.

## Bugs found during the refactor (left alone in this round — all fixed in Round 3 below)
1. **Scoreboard API order is reversed.** In `ChallengeService.getScoreboard` the trailing `.reversed()` flips the whole comparator, so `/api/scoreboard` returns the lowest score first. The UI looks correct only because the Scoreboard and Dashboard pages re-sort the list themselves. README TC-08's "solve timestamp" tie-break is not implemented.
2. **Admin "Edit Challenge" is broken.** `AdminChallengeRequest.flag` is `@NotBlank`, so leaving the flag blank ("keep existing", as the form says) is rejected with 400. When the flag is re-entered, the form never sends `hint1`–`hint3`, so the edit erases hint tiers 2 and 3.
3. **Deleting a challenge** that has any submissions or hint unlocks fails with HTTP 500 (foreign keys, no cascade), although the confirmation dialog says the submissions will be removed.
4. **Deleting a user** who has unlocked any hint fails with HTTP 500. `UserService.deleteUser` removes their submissions but not their `hint_unlocks`.
5. The admin **Manage Users** score is gross points (hint penalties ignored), so it disagrees with the scoreboard. In the "Stage Completed!" banner on the Challenges page, the text says "earned {full points}" while the badge beside it shows the net points.
6. **Dead code:** `ChallengesView` mounts `ChallengeModal`, but nothing ever opens it (`setIsModalOpen(true)` is never called), so the 470-line component is unreachable.
7. **Obsolete scripts:** `hideFlags.mjs` and `updateRefinedPuzzles.mjs` are byte-identical. Both, plus `updatePuzzles.mjs`, push an old set of challenges with different titles and flags through the admin API. Running one would overwrite the current 8 stages.

---

# Round 3 — Bug Fixes

Fixes for the bugs found in Round 2, plus one more found while fixing them (#8).
Each backend fix (#1–#5, #8) has a regression test that fails on the Round 2 code.
The frontend fixes were checked in a real browser (see Verification).

| # | Bug | Fix |
|---|-----|-----|
| 1 | Admin "Edit Challenge": a blank flag was rejected, and a successful edit erased hint tiers 2–3 | `AdminChallengeRequest.flag` is no longer `@NotBlank`; `ChallengeService.createChallenge` now requires it ("Flag is required when creating a challenge"), and on update a blank flag keeps the old one, as before. `ChallengeFormModal` loads tier 1 into the hint box and sends tiers 2–3 back unchanged. It also keeps the challenge's own domain in the dropdown: 4 of the 8 seeded domains were missing, so the form showed the wrong one. The range label is corrected from "1 - 6" to "1 - 8". |
| 2 | Deleting a challenge that players had attempted failed with HTTP 500 | `ChallengeService.deleteChallenge` (now `@Transactional`) deletes the challenge's hint unlocks and submissions first, as the confirmation dialog already promised. |
| 3 | Deleting a player who had unlocked a hint failed with HTTP 500 | `UserService.deleteUser` also deletes the player's hint unlocks. |
| 4 | `/api/scoreboard` listed the lowest score first | Fixed the comparator: net points (high → low), then flags solved, then whoever reached their score first, as the README's TC-08 describes. Username is the last tie-break, so the order is always the same. |
| 5 | Points disagreed between screens | The admin **Manage Users** score now deducts hint penalties, matching the scoreboard. The "Stage Completed!" banner shows the points actually awarded. |
| 6 | Unreachable `ChallengeModal` (470 lines) | Deleted, with its unused wiring in `ChallengesView`. |
| 7 | Obsolete scripts that would overwrite the live stages | Deleted `hideFlags.mjs`, `updateRefinedPuzzles.mjs` and `updatePuzzles.mjs`; nothing referenced them, and they remain in git history. |
| 8 | **Hint text leaked to players.** Every `/api/challenges` response carried the legacy `hint` field. For stages 2–8 it is exactly the tier-1 text, and for stage 1 an even more revealing one, sent before the hint is unlocked. | The player `ChallengeResponse` no longer has a `hint` field; hint text is only sent through `hints[]` once unlocked. The challenge cards and the hints panel now use `hints[]`, so they look the same. Admin endpoints are unchanged. |

## Verification
- **Backend:** 35 tests pass (`mvn test`), including new regression tests for #1–#5 and #8. All 7 of those failed on the Round 2 code with the original symptoms (500 errors, 400 on a blank flag, leaked hint, 400 instead of 287 points, ascending order).
- **Frontend:** `tsc -b` and the build pass. In the 65-step browser comparison against the original build, the only DOM changes are the two intended ones: the banner showing net points, and the corrected label.
- **End to end:** the real backend (in-memory H2) and the built frontend were driven through the UI. 19 checks covered every fix above, and they passed on two fresh runs.

## Still open (not changed)
- Hint tiers 2 and 3 are kept safe, but the admin form still has no fields to edit them.
- README TC-05 says hints must be unlocked in order, but the backend does not enforce it. A player can unlock tier 3 alone and pay 25% instead of the full 50%.
- Hidden (inactive) challenges are left out of the player list, but players can still open one by id and submit flags to it.
