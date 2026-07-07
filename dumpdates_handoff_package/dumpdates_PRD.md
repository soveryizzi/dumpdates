# dumpdates — Product Requirements Document

**Status:** Draft v2 (all open build decisions resolved)
**Last updated:** 2026-07-02

---

## 1. Vision & Emotional Target

**What it is:** A monthly friend-group zine app. Each month, a group answers a shared set of questions, then reads each other's answers compiled into a digital zine.

**Who it's for:** Geographically dispersed friend groups who want a low-effort way to stay connected.

**The north star:** every feature gets checked against one question: *does this feel like "oh cute, oh this is so easy"?*

If a feature needs a paragraph to explain to a new member, it's wrong for this app. Friction is the enemy, not feature count.

---

## 2. Core User Flow (one cycle)

1. **Cycle opens** (1st of the month)
2. **Nomination window** (1st–15th) — members nominate up to 3 questions
3. **Pool locks** — all nominated questions become that month's question set (no voting). If nobody nominates, fallback to 5 random bank questions.
4. **Answer window** (16th–end of month) — members answer via text or image, autosaved, editable until deadline
5. **Auto-publish** — zine compiles automatically when the answer window closes
6. **Reading phase** — members read the compiled zine; last 6 issues stay in the archive

---

## 3. Timeline Structure (RESOLVED)

Anchored to fixed calendar dates rather than exact 14/14 day windows. Simpler mental model for members, and removes any ambiguity about month length.

| Phase | Days | What happens |
|---|---|---|
| Nomination | 1st–15th | Members submit 0–3 question nominations |
| Lock | 15th (end) | Pool finalized; fallback questions added if pool is empty |
| Answer | 16th–end of month | Members write/upload answers, autosaved, editable |
| Publish | 1st of the following month | Auto-publish, zine becomes readable |

**Member-facing rule of thumb:** "Nominate by the 15th, answer by month-end, read on the 1st."

**Timezone (RESOLVED):** all deadlines are anchored to **US Eastern Time (America/New_York), hardcoded** for MVP. All date math (window boundaries, cron schedules, lock checks) must convert to ET explicitly — never rely on the server's or browser's local timezone. Supabase cron runs in UTC, so scheduled jobs must be offset accordingly (e.g., midnight ET on the 1st = 04:00 or 05:00 UTC depending on daylight saving). Keep an eye out for off-by-one-day errors near midnight; per-group timezones are a possible future upgrade.

**Cycle overlap (important for the data model):** on the 1st of each month, two things happen at once — last month's cycle publishes AND this month's nomination window opens. The schema must comfortably hold **two active cycles per group simultaneously** (one in "published/reading" state, one in "nominating" state). Model cycles as rows with their own status, not as a single "current cycle" pointer on the group.

---

## 4. Locked Product Decisions

**Membership & Roles**
- One admin per group (the creator)
- Join via invite code only (no public/discoverable groups)
- Equal permissions for all members on nominations and answers
- Mid-cycle joiners enter at the group's current timeline position

**Admin powers (RESOLVED)**
- Remove members from the group
- Manually publish the current cycle's zine at any point (locks answers immediately and publishes whatever exists — same output as auto-publish, just early)
- Regenerate the invite code (in case a code leaks)
- Delete the group
- *Not in MVP:* transferring admin to another member (backlog)

**Nominations**
- Up to 3 nominations per member
- All nominated questions go into the pool — no voting, no filtering
- Fallback: 5 random questions from the question bank if the pool is empty

**Question bank (RESOLVED)**
- 45 hardcoded questions (written, final), stored in a `question_bank` table and seeded via `question_bank_seed.sql`
- Fallback logic picks 5 at random when a cycle's pool locks empty
- Status: written and delivered in `question_bank_seed.sql`

**Answers**
- Text plus up to 3 images per answer (locked; images stored via an answer_images table or array column)
- Image answers are stored in a **Supabase Storage bucket** — this is MVP scope, not Phase 2
- Autosaved continuously
- Editable until the deadline, then locked — **enforced at the RLS level**, not just hidden in the UI

**Auth (RESOLVED)**
- Email + password via Supabase Auth
- Email confirmation redirect URL must be configured in Supabase to point at the GitHub Pages URL

**Publishing & Visibility**
- Auto-publish when the answer window closes, no manual trigger needed (admin manual publish is an additional escape hatch, see Admin powers)
- Members see only their own answers pre-publish (RLS-enforced)
- Unanswered questions show a placeholder in the published zine

**Archive**
- 6-issue rolling archive
- Answers persist even after a member leaves the group

**Display**
- Username shown per answer
- Initials-based profile pictures (no photo upload for avatars)

---

## 5. Technical Architecture (refresh)

**Stack:** Vite + vanilla JavaScript, Supabase (auth, database, RLS, Storage, Edge Functions), GitHub Pages

**Build order (the v1 lesson):** data model → service layer → auth → one complete feature end-to-end, before touching broader UI. v1's mistake was building all UI first and wiring the backend after — that created a mess of components that assumed data shapes the backend didn't actually produce.

**Layered structure (from v2 scaffold):**
```
src/
  db/            → schema-aware queries, the dbQuery() helper
  state/         → app state management
  components/    → reusable UI pieces
  pages/         → top-level views
```

**Known landmine to document, not rediscover:** the Supabase JS SDK has an `initializePromise` hang bug. All DB access goes through a custom `dbQuery()` helper in `supabase.js` using raw `fetch()` with explicit access token passing — never the SDK's query builder directly. This needs a comment in the code and a line in onboarding docs for future-you.

**Auto-publish mechanism (RESOLVED, but new territory):**
- Edge Functions were **never built in v1 or v2** — this is first-time work, budget extra care here
- Publish runs as a Supabase Edge Function triggered by Supabase cron (pg_cron)
- **Retry strategy:** schedule the job to run **hourly during the 1st of the month (ET)**. The function is **idempotent** — it checks whether the cycle is already published and exits as a no-op if so. If one run fails, the next hourly run retries automatically. Simple, no queue infrastructure needed.
- **Manual publish** (admin) calls the same publish logic, so there is exactly one code path that publishes a zine
- Cron times must account for the UTC/ET offset (Section 3)

**Secrets & keys (guidance for a non-engineer — read this once, follow it always):**
- Supabase gives you two important keys. They are NOT equally sensitive:
  - **anon (public) key** — safe to ship in frontend code. It ends up visible in the built site by design; RLS policies are what actually protect the data. Do not panic when you see it in the deployed JS.
  - **service_role key** — full database access, bypasses RLS. **Never** goes in frontend code, never in the repo, never in a chat log. It is only used inside Edge Functions, supplied via Supabase's built-in secrets (`supabase secrets set`).
- Local setup pattern: a `.env` file holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; `.gitignore` includes `.env`; a committed `.env.example` shows the variable names with placeholder values so future-you remembers the shape.
- Rule of thumb: if a value would let a stranger read or change everyone's data, it never touches the repo.

**Repo (RESOLVED):** fresh repo named `dumpdates` under `soveryizzi`. The old `zeene` repo stays untouched as reference. GitHub Pages target: project page (likely `soveryizzi.github.io/dumpdates`), which means Vite's `base` config must be set to `/dumpdates/` — a classic first-deploy gotcha.

**RLS policies:** draft fresh in the new `schema.sql`, verifying row-level enforcement of BOTH product rules:
1. Members see only their own answers pre-publish
2. Answers are not writable after the deadline (or after manual publish locks the cycle)

---

## 6. Open Decisions

| Decision | Options | Notes |
|---|---|---|
| Figma-to-Claude MCP integration | When to set up | Not blocking for MVP build |

Everything else is resolved.

---

## 7. Backlog (Phase 2+)

Not in MVP scope, but tracked so they don't get lost:

- AI question generation via Anthropic API (prompt already written)
- Configurable publishing schedule (dropdowns in settings design; MVP hardcodes the calendar)
- Polls as a question type (appears in Figma components; not in MVP)
- In-app countdown banner showing time left in current window
- Email notifications via Supabase Edge Functions
- Past issues shelf (browsable UI on top of the 6-issue archive)
- Copy invite code button
- Member avatars in nav
- Transfer admin role to another member
- Per-group timezones (MVP hardcodes ET)
- Riso / ghost graphic elements (intentionally removed from v1, revisit for visual identity)
- iPad hand-drawn elements workflow (Procreate/Freeform → transparent PNG → `public/` folder)

---

## 8. Explicit Non-Goals

Keeping these out on purpose, to protect the "easy" feeling:

- No voting or ranking on nominated questions
- No public or discoverable groups — invite-only, always
- No editing answers after the deadline passes
- Not a real-time chat or messaging app
- No algorithmic feed or sorting — answers are read in the simple compiled zine format

---

## 9. Definition of Done (MVP)

A group can: create a group, invite members via code, nominate questions through the 15th, answer through month-end (text or image, autosaved, images stored in Supabase Storage), get an auto-published zine on the 1st (with hourly-retry safety net and an admin manual-publish escape hatch), and browse up to 6 past issues. All of it should feel like "oh cute, oh this is so easy" at every step.
