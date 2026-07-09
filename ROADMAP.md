# ROADMAP.md — dumpdates v3 build order

Build strictly in order. A step is done only when its verification checks pass (`HANDOFF.md` → Verification). Check boxes as you go so any session can see exactly where the project stands.

---

## Phase 0 — Foundations (no features yet)

- [x] **0.1** Create fresh `dumpdates` repo · Vite scaffold · `base: '/dumpdates/'` in Vite config
- [x] **0.2** Secrets setup: `.env`, `.gitignore` (includes `.env`), `.env.example`
- [x] **0.3** Add docs to repo root: `CLAUDE.md`, `HANDOFF.md`, `dumpdates_PRD.md`, `ROADMAP.md`, `question_bank_seed.sql`
- [x] **0.4** Deploy a hello-world page to GitHub Pages — proves the deploy pipeline before any real code exists

## Phase 1 — Data model

- [x] **1.1** `schema.sql`: groups, members, cycles, questions, nominations, answers, question_bank
- [x] **1.2** RLS on every table (incl. own-answers-only pre-publish; no writes after lock)
- [x] **1.3** Run `question_bank_seed.sql` → 45 rows

## Phase 2 — Service layer

- [x] **2.1** `supabase.js` with `dbQuery()` helper (raw fetch, explicit token) — built and tested FIRST
- [x] **2.2** Query functions for groups/members on top of `dbQuery()`

## Phase 3 — Auth

- [x] **3.1** Email/password signup, login, logout
- [x] **3.2** Confirmation redirect URL configured in Supabase → Pages URL

## Phase 4 — Groups & membership

- [ ] **4.1** Create group (creator = admin) · invite code generated
- [ ] **4.2** Join via invite code
- [ ] **4.3** Member list view

## Phase 5 — Cycle engine (dates, ET)

- [ ] **5.1** ET date helpers: current phase from today's date (nominating / answering / publish-due)
- [ ] **5.2** Cycle rows created/advanced correctly; two active cycles per group supported
- [ ] **5.3** Pool lock at end of the 15th · empty-pool fallback pulls 5 random bank questions

## Phase 6 — Nominations ★ first complete end-to-end feature

- [ ] **6.1** Nominate a question (max 3 per member, enforced in DB)
- [ ] **6.2** View the current pool
- [ ] **6.3** Full loop verified: create group → join via code → nominate → see pool
- [ ] **MILESTONE: the whole stack works.** Only now does UI broaden.

## Phase 7 — Answers (text)

- [ ] **7.1** Answer view: this cycle's questions, text input
- [ ] **7.2** Autosave (type → refresh → still there)
- [ ] **7.3** Editable until deadline; RLS blocks edits after lock even via console
- [ ] **7.4** Pre-publish privacy verified: A cannot see B's answers

## Phase 8 — Answers (image)

- [ ] **8.1** Supabase Storage bucket + access rules
- [ ] **8.2** Image upload (up to 3 per answer); files land in bucket; display back to owner

## Phase 9 — Publish & the zine

- [ ] **9.1** Zine view: published cycle readable by all members, usernames + initials avatars, placeholders for unanswered
- [ ] **9.2** Edge Function: publish logic (idempotent — no-op if already published)
- [ ] **9.3** Cron schedule: hourly through the 1st (ET) = built-in retry
- [ ] **9.4** Admin manual publish button → same code path, locks answers immediately

## Phase 10 — Archive & admin tools

- [ ] **10.1** 6-issue rolling archive, browsable
- [ ] **10.2** Answers persist after a member leaves
- [ ] **10.3** Admin: remove member · regenerate invite code · delete group

## Phase 11 — Ship it

- [ ] **11.1** Recreate `preview_only.html` (no-auth dummy-data preview)
- [ ] **11.2** Friction pass: walk every flow against "oh cute, oh this is so easy"
- [ ] **11.3** Real deploy, real friend group, one live month = MVP done

---

## After MVP (backlog — see PRD §7)

AI question generation · countdown banner · email notifications · past-issues shelf UI · copy invite code button · avatars in nav · admin transfer · per-group timezones · riso/ghost visual identity · hand-drawn asset workflow
