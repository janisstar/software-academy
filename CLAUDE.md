# Software Academy — Project Instructions

Corporate learning portal for the Manufacturing Platform.
Backend: FastAPI + SQLAlchemy 2.0 + Alembic + PostgreSQL (Docker).
Frontend: React 18 + TypeScript + Vite + CSS Modules.
Standalone app, own auth, mobile-first.

**Frontend work:** also follow `frontend/CLAUDE.md` (loads automatically when
working inside `frontend/`).

## Communication

- Jenna is a **junior developer** and works in **Russian** → reply in Russian,
  explain clearly at a junior level, avoid unexplained jargon.
- Move in **small steps**: one change at a time, show the result, wait for
  confirmation before the next step. Do not batch many unrelated changes.
- Flag a risk or disagreement **once**, then respect Jenna's final decision.

## Documentation-first (read before you code)

Always consult `docs/` before changing anything. Start with:

- `docs/01-project-overview.md` — product, roles, permission model.
- `docs/06-api-conventions.md` — locked decisions (the source of truth):
  sessions, master-singleton, GDPR, `privileges` object, trailing slashes,
  `/api/` prefix without versioning.
- `docs/07-api-reference.md` — full endpoint map + how the frontend calls the API.
- `docs/05-roadmap.md` — where we are / what's next.

Match the nearest existing pattern in the relevant folder rather than inventing
new ones.

## Locked architectural decisions — never break these

- **Auth = server-side sessions** in an httpOnly cookie (Argon2id passwords).
  Never introduce JWT or move auth to the client. The frontend calls the API
  with `credentials: "include"` (see `frontend/src/api/client.ts`).
- **`master` is a singleton** platform role: created only by seed; cannot be
  created, assigned, locked, or deleted via the API.
  Role keys: `master / admin / manager / site / inspector / user / fitter`.
- **Backend layering:** `api/` (thin routes) → `services/` (business logic) →
  `models/` + `schemas/`. Business logic lives on the backend; the frontend
  stays presentational.
- **Content is global**; user **progress is strictly personal** — nobody sees
  another user's progress.
- **DB changes go through Alembic:** `alembic revision --autogenerate`, review
  the generated file, then `upgrade head`. Never edit an already-applied
  migration file.

## File & code discipline

- **Reuse before creating.** Before adding a component / hook / util / type /
  service, search the repo for an existing one and extend or compose it instead
  of making near-duplicate copies.
- **Never delete files or code without explicit permission.** If something looks
  removable, point it out and ask first. Prefer additive / edit changes.
- Keep changes **minimal, clean, and readable**: clear names, small functions,
  comments where a junior would need them. No dead code, no commented-out blocks
  left behind.
- **Backend folder structure:** `app/api`, `app/core`, `app/models`,
  `app/schemas`, `app/services`.

## Testing & verification — Jenna tests manually

- **Jenna runs and tests the app herself** (dev server, `docker compose up`,
  browser, Swagger, runtime flows). Do **NOT** start servers, open a browser, or
  walk through runtime flows (login, navigation, etc.) to "prove" a change works.
  That is her job.
- The agent **may** run **static checks only**: `tsc` / `npm run build` for the
  frontend, and equivalent compile / type checks for the backend — to confirm
  imports and types are intact. Report the output briefly. Nothing that requires
  the app to be running.
- Instead of runtime evidence, **write a testing guide**: the exact manual steps
  for Jenna to verify in dev mode — what to start, what to click / enter, and the
  expected result for each step (happy path + key edge cases). Keep it short and
  concrete.

## Workflow for every task

1. Identify the exact layer(s) affected.
2. Read the nearest related files + relevant `docs/`.
3. Search for reusable components / hooks / utils / types / services first.
4. Apply the smallest conventional change.
5. Verify **statically only** (`tsc` / `npm run build`, compile / type checks)
   and report the output. Do **not** run the app; write Jenna a **testing guide**
   for manual dev-mode checks instead.

## Output format

- Short summary of the change.
- Files touched (and why).
- Conventions / assumptions followed.
- Static-check output (`tsc` / `npm run build`), if run.
- **Testing guide**: exact manual steps for Jenna to test in dev mode (what to
  start, what to click / enter, expected result per step).
- One short follow-up suggestion if more work remains.
