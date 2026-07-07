# CLAUDE.md — dumpdates

Read this at the start of every session. It is short on purpose. Full context lives in `HANDOFF.md` and `dumpdates_PRD.md` (repo root). Read those before large or unfamiliar tasks, and read `DESIGN_SYSTEM.md` before any UI work (Phase 6+).

## What this is

A monthly friend-group zine app. Members nominate questions (1st–15th), answer them (16th–month-end), and read the auto-published zine (1st of next month). Emotional target for every feature: *"oh cute, oh this is so easy."* If a feature needs a paragraph to explain, it's wrong.

## Working with Izzi

- No engineering/CS background — you write, debug, and architect all code
- Plain language, no unexplained jargon
- Change instructions must include **file name + step number together**
- She batches work into single prompts to conserve credits — bundle related changes
- Secrets, keys, and config need step-by-step follow-along guidance, always

## Non-negotiable rules (learned the expensive way)

1. **NEVER use the Supabase JS SDK query builder** (`supabase.from(...)`). Known `initializePromise` hang bug. ALL database access goes through the custom `dbQuery()` fetch-based helper in `supabase.js`, with explicit access-token passing.
2. **Build order is strict:** data model → service layer → auth → one complete feature end-to-end → then expand UI. Follow `ROADMAP.md`; do not skip ahead.
3. **All date math is US Eastern Time (America/New_York), hardcoded.** Never trust server or browser local time. Supabase cron is UTC — offset accordingly (midnight ET = 04:00/05:00 UTC by DST).
4. **Security rules live in RLS, not just the UI.** Two rules especially: members see only their own answers pre-publish; answers are not writable after deadline/publish.
5. **Defer visual polish.** No riso/ghost graphics or decorative UI until the backlog phase. Function first.
6. **A step is not done until its verification checklist passes** (see `HANDOFF.md` → Verification). Then commit. Update `ROADMAP.md` checkboxes as steps complete.

## Stack & structure

Vite + vanilla JS (no framework) · Supabase (auth, Postgres, RLS, Storage, Edge Functions) · GitHub Pages

```
src/
  db/            → queries + dbQuery() helper
  state/         → app state
  components/    → reusable UI
  pages/         → top-level views
supabase.js      → Supabase client + dbQuery()
```

## Key facts

- Supabase project: `vqbcxvzxxfhxfmfdvrem.supabase.co` (corrected 2026-07-06 — older docs had a stale ref, `gbzptapkiwpdtngurobz`)
- Hosting: GitHub Pages project page → Vite config `base: '/dumpdates/'`
- Auth: email + password (Supabase Auth); confirmation redirect URL must point at the Pages URL
- Question bank: 45 questions, seeded via `question_bank_seed.sql` (fallback picks 5 at random)
- Cycle overlap: on the 1st, one cycle publishes while the next opens for nominations — schema supports two active cycles per group; never a single "current cycle" pointer
- Publish: one code path. Edge Function, cron hourly through the 1st (ET), idempotent (no-op if already published). Admin manual publish calls the same logic and locks answers immediately.

## Secrets

- anon key → `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), gitignored; `.env.example` committed with placeholders. Anon key in built frontend is fine — RLS is the lock.
- service_role key → ONLY in Edge Function secrets (`supabase secrets set`). Never in repo, frontend, or chat.

## Deploy

```
git add . && git commit -m "message" && git push && npm run deploy
```
