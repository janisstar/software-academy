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
- `login` — sign-in screen, plus the first-login flow (temporary password,
  consents); the sign-in screen needs no authentication, the first-login screens
  need a session but are deliberately kept out of the portal
- `legal` — public document texts (Privacy Policy, Terms); linked from the
  landing footer and from the consents screen, opened in a separate tab
- `master` — vendor interface (Jenna): manage content and companies
- `app` — (later) shared learning portal for all learner roles; also hosts
  Users / Reports for admin/manager/site

Structure:

```
frontend/src/
├── pages/            # one screen = one route, grouped by area
│   ├── landing/      # LandingPage.tsx (+ .module.css)
│   ├── login/        # LoginPage.tsx, FirstLoginPasswordPage, FirstLoginConsentsPage
│   ├── legal/        # PrivacyPage.tsx, TermsPage.tsx
│   └── master/       # MasterHomePage.tsx, (later) Lessons, Users, Reports…
│   # app/ — add when we start the learning portal
├── components/       # components grouped by area
│   ├── landing/      # Header, Hero… (landing only)
│   ├── login/        # LoginBook, AuthShell, StepCard, FirstLoginLayout (login only)
│   ├── legal/        # LegalLayout (legal only)
│   ├── master/       # Sidebar, Header, Footer, Filters, Cards (master only)
│   └── ui/           # SHARED across all areas: Button, VideoCard, Card, Input…
│   # app/ — shared components of the learning portal (later)
├── routes/           # routing infrastructure: AppRoutes, ProtectedRoute, FirstLoginGate
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

## Navigation = one config, never JSX

- The master menu structure lives in a single array in
  `components/master/navConfig.ts` (i18n label key, icon name, `path` or
  `children`). `SideNav`, `NavGroup` and `TabBar` render from that array.
- **Adding a menu item = one entry in the config.** Never edit the JSX of the
  nav components to add, reorder or hide an item.
- Role visibility is expressed only as a `roles` list on a config entry and
  resolved through `visibleNavItems()` + the existing `activeRole()` from
  `types/api.ts`. Do not add role checks inside components; a group with no
  visible children disappears automatically.
- Icon names in the config are plain strings; the mapping to inline SVG
  components lives in `components/master/MasterIcons.tsx`.

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
- **Radii — the app interface has a square character.** Buttons and chips use
  `--radius-xs`; text fields and selects `--radius-sm`; cards `--radius-lg`.
  `--radius-pill` is allowed ONLY in the marketing areas (landing, login) and on
  the Switch track. New app components never use pill.
- Key tokens (must stay consistent): accent teal `--accent: #12A594`
  (hover `#0E8576`), graphite neutrals, status `completed #6AA632`,
  `danger #D14B4B`.
- Accessibility: WCAG 2.1 AA; color is never the only signal; touch targets
  ≥ 44px.
- Mobile-first: side nav on desktop, bottom tabs on mobile.

## UI language & i18n — every string goes through the dictionary

- **No user-facing string is ever hardcoded in a component.** Headings, labels,
  buttons, placeholders, hints, error messages, empty states, `alt` text,
  `aria-label` — all of them come from `t('…')`.
- **English is the source language.** `src/i18n/en/common.json` is the master
  dictionary; other languages are added as sibling folders (`src/i18n/fi/…`)
  and registered in `src/i18n/index.ts`.
- **Code comments, docs and commit messages stay in Russian** — that is the team
  language. Only what the user sees is translated.
- Design mockups in `docs/mockups/` are written in Russian for review purposes —
  translate the copy when implementing them.

How to use it:

```tsx
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
<h1>{t('login.title')}</h1>
<p>{t('master.signedInAs', { name: user.name })}</p>   // подстановка
```

- **Keys are type-checked.** `src/types/i18next.d.ts` derives the key union from
  the English JSON, so a typo fails `npm run build` instead of rendering the raw
  key in the browser. Never silence that error with a cast.
- **Key naming:** `<area>.<block>.<element>` — `login.cover.word`,
  `landing.hero.cta`. Strings shared by more than one area go under `common.*`
  or `brand.*`. Group by where the string is shown, not by its wording.
- **Lists of items** (categories, cards) keep the key strings in the data array
  with `as const`, not the texts — see `LandingCategories.tsx`. Without
  `as const` TypeScript widens them to `string` and the type check is lost.
- One namespace (`common`) for now. Split it only when the file stops being
  readable, and register the new namespace in `src/i18n/index.ts`.
- Adding a string = add the key to the English JSON first, then use it.
  Do not leave a key untranslated in the other language files.

## Tooling

- Package manager: **npm**.
- Format with Prettier, lint with the existing ESLint config — keep the code
  warning-free. If a genuinely useful plugin is needed (e.g. stylelint for CSS
  tokens), propose it first and explain why before installing.
