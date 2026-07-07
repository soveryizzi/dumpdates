# dumpdates — Project Handoff

**Read this first.** It's the fastest way to understand the project before touching any code. Pair it with `dumpdates_PRD.md` (the full spec).

---

## Start Here (30-second version)

**dumpdates** is a monthly digital zine app for friend groups. Each month members nominate questions, answer them, and read everyone's answers compiled into a zine. The whole thing should feel like *"oh cute, oh this is so easy."*

This is a **fresh restart (v3)**. Two previous versions taught hard lessons — those lessons are baked into the PRD and this doc. Please respect them; they were expensive.

**Working with the person:** they have no engineering/CS background and rely on you to write, debug, and architect all code. Keep explanations plain. When you give change instructions, **include the file name and step number together.** They batch multiple changes into single prompts to conserve credits, so bundle related work. **Secrets, keys, and configuration are areas where they explicitly want step-by-step, follow-along guidance — never assume prior knowledge there.**

---

## The Non-Negotiable Rules

These are the "learned the hard way" rules. Breaking them recreates old bugs.

**1. Never use the Supabase JS SDK query builder directly.**
There is a known `initializePromise` hang bug. **All** database access must route through a custom fetch-based helper called `dbQuery()` (lives in `supabase.js`). Use raw `fetch()` against the Supabase REST endpoint with explicit access-token passing. Never `supabase.from(...).select(...)`.

**2. Build order is strict:**
`data model → service layer → auth → one complete feature end-to-end → then expand UI`
v1 failed by building all the UI first and wiring the backend after. Do not repeat this. Get one feature working top-to-bottom before broadening.

**3. Defer visual polish.**
Riso/ghost graphic elements and decorative UI are intentionally set aside for later. Don't reintroduce them early. Function first.

**4. Every feature is checked against the emotional target.**
If a feature needs a paragraph to explain to a new member, it's probably wrong. Friction is the enemy.

**5. All date math is US Eastern Time (America/New_York), hardcoded.**
Never rely on server or browser local time. Supabase cron runs in UTC — offset accordingly (midnight ET = 04:00/05:00 UTC depending on daylight saving). Watch for off-by-one-day bugs near midnight.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Language | Vanilla JavaScript (no framework) |
| Backend | Supabase (auth, Postgres DB, RLS, Storage, Edge Functions) |
| Hosting | GitHub Pages |
| Design | Figma (MCP handoff planned, not yet set up) |

**Suggested source structure** (carried from v2 scaffold):
```
src/
  db/            → queries + the dbQuery() helper
  state/         → app state management
  components/    → reusable UI pieces
  pages/         → top-level views
supabase.js      → Supabase client + dbQuery() helper
```

---

## Key Infrastructure

- **Supabase project ref:** `gbzptapkiwpdtngurobz.supabase.co`
- **GitHub handle:** `soveryizzi`
- **Repo:** fresh repo named `dumpdates` (decided — do not reuse the old `zeene` repo; it stays as reference)
- **GitHub Pages target:** project page at `soveryizzi.github.io/dumpdates` → Vite config must set `base: '/dumpdates/'` before first deploy
- **Deploy command:**
  ```
  git add . && git commit -m "message" && git push && npm run deploy
  ```

**Preview mode:** a `preview_only.html` existed in v2 (worth recreating in v3) that boots directly into a no-auth dummy-data preview. It lets the person evaluate frontend feel without any backend state. Very useful for design iteration.

---

## Secrets & Keys (step-by-step, no prior knowledge assumed)

Supabase gives the project two keys. **They are very different:**

| Key | Sensitivity | Where it lives |
|---|---|---|
| **anon (public) key** | Safe to be public. It ships inside the frontend code by design; RLS is the real lock on the data. | `.env` file locally, embedded in the built site |
| **service_role key** | DANGEROUS. Bypasses all security rules. | ONLY in Supabase's Edge Function secrets. Never in the repo, frontend, or a chat message. |

**One-time local setup (do this at project start):**
1. **File: `.env`** (create in project root) — add two lines:
   `VITE_SUPABASE_URL=https://gbzptapkiwpdtngurobz.supabase.co`
   `VITE_SUPABASE_ANON_KEY=<paste anon key from Supabase dashboard → Settings → API>`
2. **File: `.gitignore`** — confirm it contains a line that says `.env` (this keeps the file out of GitHub)
3. **File: `.env.example`** (create, and DO commit this one) — same two variable names but with placeholder values, so the shape is documented
4. **Rule of thumb:** if a value would let a stranger read or change everyone's data, it never touches the repo

When Edge Functions need the service_role key later, it gets set with `supabase secrets set` on the command line — Claude will provide the exact command at that step.

---

## The Timeline (core mechanic)

Fixed calendar-date anchors, all in **ET**:

| Phase | When | What |
|---|---|---|
| Nominate | 1st–15th | Members submit up to 3 question nominations |
| Lock | end of 15th | Pool finalized (fallback: 5 random questions from the 45-question bank if empty) |
| Answer | 16th–end of month | Members answer (text or image), autosaved, editable |
| Publish | 1st of next month | Zine auto-publishes via Edge Function |

**Member rule of thumb:** "Nominate by the 15th, answer by month-end, read on the 1st."

**Cycle overlap:** on the 1st, last month's cycle publishes AND the new month's nominations open — at the same time. The schema must support **two active cycles per group at once** (one publishing/reading, one nominating). Never model "the group's current cycle" as a single pointer.

**Auto-publish (first-time work — Edge Functions were never built in v1/v2):**
- Supabase Edge Function triggered by Supabase cron (pg_cron)
- Runs **hourly throughout the 1st (ET)**; the function is **idempotent** (checks "already published?" and exits if so), which makes the hourly schedule an automatic retry mechanism if a run fails
- **Admin manual publish** exists as an escape hatch: locks answers immediately and publishes, using the exact same publish logic (one code path)

---

## First Session: Suggested Starting Point

Following the strict build order, the first end-to-end slice should be:

1. **Data model** — write `schema.sql`: groups, members, cycles, questions, question_bank (seeded with 45 questions — see `question_bank_seed.sql`), nominations, answers. Include RLS policies for BOTH rules: "members see only their own answers before publish" AND "answers not writable after deadline/publish."
2. **Service layer** — build `supabase.js` with the `dbQuery()` helper first. Then group + auth queries on top of it.
3. **Auth** — email/password signup/login + join-via-code flow. Configure the email-confirmation redirect URL in Supabase to point at the GitHub Pages URL.
4. **One full feature** — recommend the **nomination flow** end-to-end (create group → invite code → nominate a question → see it in the pool). It's the simplest complete loop and proves the whole stack works.

Only after that slice works should UI broaden to answering, image upload (Storage bucket), and the zine view.

**Question bank: DONE.** All 45 questions are written and live in `question_bank_seed.sql` — fold them into schema setup during Slice 1.

---

## Verification (how Izzi confirms each slice is done)

No eng instincts required — each slice has a plain-browser checklist. A slice is NOT done until every box checks.

**Slice 1: Data model**
- [ ] In Supabase dashboard → Table Editor, all tables appear (groups, members, cycles, question_bank, nominations, answers)
- [ ] question_bank shows 45 rows
- [ ] In Authentication → Policies, every table shows RLS **enabled** with policies listed (no table says "RLS disabled")

**Slice 2: Service layer**
- [ ] A test page (or browser console) can call `dbQuery()` and get data back without hanging
- [ ] Confirm by searching the code: zero occurrences of `supabase.from(`

**Slice 3: Auth**
- [ ] Sign up with a real email → confirmation email arrives → clicking it lands back on the app (not an error page)
- [ ] Log out, log back in with the password — works
- [ ] Wrong password shows a friendly error, not a crash

**Slice 4: Nomination flow (end-to-end)**
- [ ] Create a group in the browser → a new row appears in the `groups` table in Supabase
- [ ] Invite code displays; joining from a second account (or incognito window) with that code adds a `members` row
- [ ] Nominate a question → row appears in `nominations`; a 4th nomination from the same member is blocked
- [ ] The second account can see the pool but cannot see anything it shouldn't (check against RLS rules)

**Later slices (answering, publish):**
- [ ] Answer autosaves (type, refresh the page, text is still there)
- [ ] Image answer uploads and the file appears in the Storage bucket
- [ ] Before publish: account A cannot see account B's answers
- [ ] Admin manual publish → zine readable by all members, answers locked (editing attempt fails)
- [ ] After the deadline, editing an answer is blocked even if the UI is bypassed (test via console request)

---

## Still Open (decide with the person)

- **Figma-to-Claude MCP integration** — timing for design handoff. Not blocking MVP.

Everything else is locked in the PRD. When in doubt, check the PRD's "Locked Product Decisions" and "Explicit Non-Goals" sections before assuming.

---

## Files in This Handoff

- `CLAUDE.md` — session-start briefing for Claude Code (auto-read every session)
- `HANDOFF.md` — this file (read first)
- `dumpdates_PRD.md` — full product + architecture spec
- `ROADMAP.md` — build order with progress checkboxes
- `DESIGN_SYSTEM.md` — verified tokens, components, accessibility rules (for UI phases)
- `question_bank_seed.sql` — 45-question fallback bank, run after schema.sql
