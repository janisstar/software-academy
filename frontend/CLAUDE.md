# Software Academy — Frontend Instructions

Applies to `frontend/` (React 18 + TypeScript + Vite + CSS Modules, npm).
Read together with the root `CLAUDE.md`.

## Frontend architecture — group by INTERFACE (not by role)

Folders are grouped by _interface area_, not by user role.
Reason: the learner roles (inspector, user/welder, fitter) all see the SAME
portal — only the set of lessons differs, and that set is returned by the
backend per role. Creating `pages/inspector`, `pages/welder`, etc. is FORBIDDEN —
it duplicates layout (violates the "no duplicated logic" principle).
admin/manager/site also have identical access in the MVP.

Rule: a new learner role = ZERO new folders (only a role on the backend + data).
A new area folder appears ONLY when a new TYPE of interface is needed.

Areas (interfaces):

- `landing` — public marketing site, no authentication
- `login` — sign-in screen, no authentication
- `master` — vendor interface (Jenna): manage content and companies
- `app` — (later) shared learning portal for all learner roles; also hosts
  Users / Reports for admin/manager/site

Structure:

```
frontend/src/
├── pages/            # one screen = one route, grouped by area
│   ├── landing/      # LandingPage.tsx (+ .module.css)
│   ├── login/        # LoginPage.tsx
│   └── master/       # MasterHomePage.tsx, (later) Lessons, Users, Reports…
│   # app/ — add when we start the learning portal
├── components/       # components grouped by area
│   ├── landing/      # Header, Hero… (landing only)
│   ├── login/        # LoginForm… (login only)
│   ├── master/       # Sidebar, Header, Footer, Filters, Cards (master only)
│   └── ui/           # SHARED across all areas: Button, VideoCard, Card, Input…
│   # app/ — shared components of the learning portal (later)
├── routes/           # routing infrastructure: AppRoutes, ProtectedRoute
├── api/ hooks/ styles/ types/ utils/ constants/ assets/
```

Placement rules:

- Component used in >1 area → `components/ui/` (shared).
- Component tied to a single area → `components/<area>/`.
- Reuse before creating: check `components/ui/` and `hooks/` (e.g. `useAuth`)
  before adding a new component or hook. Extract shared logic into a hook/util
  rather than copy-pasting.
- Each component sits next to its `<Component>.module.css` (co-location).
- Page files are named by area: `MasterHomePage`, not `HomePage`.

## API types = codegen (single source of truth)

- API types are **generated** from the backend OpenAPI spec into
  `src/api/schema.d.ts` via `npm run gen:api`.
- **Never hand-edit `schema.d.ts`.** After any backend schema change, regenerate.
- Import friendly aliases from `src/types/api.ts` (which re-exports the generated
  schemas), not `schema.d.ts` directly.
- Codegen generates **types only** — do not add `openapi-fetch`, and do not touch
  `src/api/client.ts` as part of it.

## Design system — strict, centralized

- **All design values live in `src/styles/`** as CSS variables, split by concern:
  - `styles/colors.css` — palette (graphite scale + teal accent) and status colors.
  - `styles/typography.css` — font family (Inter), sizes, weights (400/500).
  - `styles/spacing.css` — 4px spacing scale, radii (8–14px), shadows.
  - `styles/fonts.css` — @font-face / font imports.
  - `styles/index.css` — imports the above; imported once in `main.tsx`.
- **Components must use tokens via `var(--…)` and CSS Modules** (`*.module.css`).
  Never hardcode hex colors, px spacing, or font sizes in components — reference
  tokens.
- Key tokens (must stay consistent): accent teal `--accent: #12A594`
  (hover `#0E8576`), graphite neutrals, status `completed #6AA632`,
  `danger #D14B4B`.
- Accessibility: WCAG 2.1 AA; color is never the only signal; touch targets
  ≥ 44px.
- Mobile-first: side nav on desktop, bottom tabs on mobile.

## Tooling

- Package manager: **npm**.
- Format with Prettier, lint with the existing ESLint config — keep the code
  warning-free. If a genuinely useful plugin is needed (e.g. stylelint for CSS
  tokens), propose it first and explain why before installing.
