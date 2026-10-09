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

## Bugs found but deliberately NOT changed (they would change behaviour)
1. **Scoreboard API order is reversed.** In `ChallengeService.getScoreboard` the trailing `.reversed()` flips the whole comparator, so `/api/scoreboard` returns the lowest score first. The UI looks correct only because the Scoreboard and Dashboard pages re-sort the list themselves. README TC-08's "solve timestamp" tie-break is not implemented.
2. **Admin "Edit Challenge" is broken.** `AdminChallengeRequest.flag` is `@NotBlank`, so leaving the flag blank ("keep existing", as the form says) is rejected with 400. When the flag is re-entered, the form never sends `hint1`–`hint3`, so the edit erases hint tiers 2 and 3.
3. **Deleting a challenge** that has any submissions or hint unlocks fails with HTTP 500 (foreign keys, no cascade), although the confirmation dialog says the submissions will be removed.
4. **Deleting a user** who has unlocked any hint fails with HTTP 500. `UserService.deleteUser` removes their submissions but not their `hint_unlocks`.
5. The admin **Manage Users** score is gross points (hint penalties ignored), so it disagrees with the scoreboard. In the "Stage Completed!" banner on the Challenges page, the text says "earned {full points}" while the badge beside it shows the net points.
6. **Dead code:** `ChallengesView` mounts `ChallengeModal`, but nothing ever opens it (`setIsModalOpen(true)` is never called), so the 470-line component is unreachable.
7. **Obsolete scripts:** `hideFlags.mjs` and `updateRefinedPuzzles.mjs` are byte-identical. Both, plus `updatePuzzles.mjs`, push an old set of challenges with different titles and flags through the admin API. Running one would overwrite the current 8 stages.
