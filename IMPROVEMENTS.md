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
