# DESIGN_SYSTEM.md — dumpdates

**Version 3 (verified against live Figma).** Source of truth: Izzi's Figma file `dumpdates` (fileKey `qcdMYQDmQf4SQdhdsZsiPF`). Colors and fonts below are the actual Figma variables and text styles, pulled via the Figma MCP connection. Contrast ratios computed against WCAG 2.1.

---

## 1. Brand & voice

- Wordmark: **\*dumpdates**, lowercase always, magenta asterisk-flower mark before the word
- The asterisk flower doubles as the empty-state illustration ("nothing here yet")
- All UI copy lowercase, warm, casual: "question garden", "your answers", "the crew", "saves automatically"
- Feature vocabulary (exact terms in UI and code comments):
  - **question garden** = nomination phase · **your answers** = answering phase · **zine** = published reading view · **the crew** = member list · **issue** = one monthly cycle's zine
- Dates in copy are friendly: "July 15", "August 1st" (never 2026-07-15)
- Microcopy is reassuring, never system-y: "saves automatically" not "autosave enabled"

## 2. Color tokens

### Core palette (Figma variables — exact)

| CSS token | Figma variable | Hex | Usage |
|---|---|---|---|
| `--bg-page` | surface/page green | `#d9ede0` | App background |
| `--bg-mint-soft` | dumpdates/light green 1 | `#e3eee9` | Soft panels, subtle fills |
| `--card-mint` | light green 1 | `#b7ddc5` | Primary sticky-note card |
| `--card-mint-2` | light green 2 | `#c5e6d2` | Card tint variation |
| `--green-medium` | medium green 1 | `#315d50` | Label 1 text, secondary emphasis |
| `--green-deep` | dark green 1 | `#162e1f` | Primary buttons, composer bg, ink text |
| `--green-deepest` | dark green 2 | `#0a1f12` | Darkest surfaces/text on dark |
| `--text-ink` | text/dark green | `#11301d` | Body text (hair darker than dark green 1) |
| `--accent-pink` | accent/dark pink | `#ac1f78` | Logo, brand pop, destructive text |
| `--accent-pink-soft` | accent/light pink | `#eeacd6` | Pink fills, hovers |
| `--accent-purple` | accent/light purple | `#9a9af8` | Avatar fills, gentle interactive accents |
| `--accent-purple-deep` | accent/dark purple | `#4c4ec6` | Purple as small text/icons, focus ring |
| `--white` | white | `#ffffff` | Paper panels, button labels |
| `--paper-margin` | (not a variable; sampled) | `#edbbbd` | Red notebook margin line |

**Strokes (Figma variables):** `--stroke-s` 1px · `--stroke-m` 1.5px · `--stroke-l` 1.8px
**Shadow (Figma effect style):** `0 2px 6px rgba(0,0,0,0.16)` ("Drop shadow on white background")

### Contrast audit (WCAG 2.1, computed on the real values)

| Pair | Ratio | Verdict |
|---|---|---|
| ink on page / cards / white | 9.8–13:1 | AAA — use freely |
| white on dark green 1 / 2 | 11.7–17.3:1 | AAA — buttons and composer are safe |
| **accent/dark pink `#ac1f78` on light bgs** | 5.3–6.5:1 | **AA — safe at any size.** Use directly for "remove"/"log out" |
| white on accent/dark pink | 6.5:1 | AA — filled pink buttons OK |
| ink on accent/light purple (avatars) | 5.8:1 | AA — **ink initials on purple**, not white |
| accent/dark purple on light bgs | 5.3:1 | AA — purple text/icons use the dark purple |
| medium green 1 on page/cards | 5.0–6.1:1 | AA — Label 1 styling is safe |
| accent/light pink `#eeacd6` | n/a | Fill/decoration only, never text |

**Rules**
- Cards rotate through the mint tints so a grid never looks uniform
- Pink = brand pop AND destructive (remove, log out). The real accent/dark pink passes AA at all sizes, so no special variant needed. Keep destructive uses small and text-based so it never feels alarming
- Never communicate state by color alone (pair with icon, underline, or label)

## 3. Typography (exact, from Figma text styles)

| Token | Family / weight | Use |
|---|---|---|
| `--font-display` | **Playfair Display SemiBold (600)** | Wordmark, headings, question text, zine titles. Lowercase. |
| `--font-body` | **Montserrat** (Regular 400; Medium 500 / SemiBold 600 for labels) | Body, answers, nav, labels, buttons |

### Type scale (Figma text components, exact px + letterspacing)

| Style | Spec | Use |
|---|---|---|
| Header 1 | Playfair 600 · 36px · -1.08px tracking | Page titles |
| Header 2 | Playfair 600 · 32px · -0.96px | Zine question headings |
| Header 3 | Playfair 600 · 20px · -0.6px | Card questions, panel titles |
| Body 1 | Montserrat 400 · 24px · -0.72px | Large body |
| Body 2 | Montserrat 400 · 18px · -0.54px | Default body, answers (italic for answers) |
| Label 1 | Montserrat 600 · 20px · +1.2px · color `--green-medium` | Section labels |
| Label 2 | Montserrat 500 · 16px · +0.96px | Overlines ("PROMPT CATEGORY") |

- Load via Google Fonts: Playfair Display (600) + Montserrat (400, 500, 600); self-host later if load speed matters
- Question length cap: **140 characters** in the composer so shrinking type never becomes unreadable
- Minimum rendered text size anywhere: 12px

## 4. Spacing, layout, shape

- **Spacing scale (4px base):** `--sp-1` 4 · `--sp-2` 8 · `--sp-3` 12 · `--sp-4` 16 · `--sp-6` 24 · `--sp-8` 32 · `--sp-12` 48
- **Card padding:** `--sp-6`; card grid gap: `--sp-6`
- **Content max-width:** ~1240px, centered; paper surface inset from page edges
- **Radii:** `--radius-card` 10px · `--radius-panel` 16px (paper sheet, modal panels) · `--radius-pill` 999px (buttons, chips) · `--radius-thumb` 8px (answer image thumbnails)
- **Shadow:** one soft shadow token for cards and modal: `0 2px 8px rgba(22,46,31,0.10)`; sticky notes may add a hair stronger shadow on hover

### Breakpoints

| Token | Width | Layout |
|---|---|---|
| mobile | <640px | Single column; cards full-width; composer chips stack; nav collapses labels to icons if tight |
| tablet | 640–1024px | 2-column card grid |
| desktop | >1024px | 3-column card grid (garden), 2-column (zine answers) |

## 5. Surfaces & texture (the signature look)

- **Notebook paper:** pale paper bg + faint horizontal rules + one vertical `--paper-margin` line on the left. Build with CSS `repeating-linear-gradient`, not images.
- **Sticky notes:** slight random rotation −2° to +2° (assign per-card, stable — not on every render), mint tint variation, soft shadow. The crookedness is the charm; keep rotation off on mobile if it causes horizontal overflow.
- **Tab notch:** active nav tab is a mint pill that visually connects into the band below the nav
- Only true image asset: the asterisk mark as SVG. Everything else is CSS.

## 6. Components

| Component | Spec |
|---|---|
| **Top nav** | Wordmark left; tabs: question garden / your answers / zine with speech-bubble icons; star (settings) right; active tab = mint pill notch. Semantic `<nav>`, `aria-current="page"` on active tab. |
| **Timeline banner** | Slim band under nav: "submit your questions by [date]" · "answer questions by [date]" · "read the Zine on [date]" with small icons. Static text in MVP. |
| **Prompt composer** | Deep-green panel; serif placeholder "write your own question here…"; chip "add a photo to prompt"; pill CTA "add to the next issue". Char counter appears near 140 cap. |
| **Question card (garden)** | Sticky note: overline category, serif question, photo icon bottom-right. States: default → hover (shadow lift) → added (− icon replaces +, card at 60% tint). |
| **Added-questions list** | Numbered outline rows with × remove; header "questions you've added to the next issue:"; shows 0–3 slots, disables composer CTA at 3 with hint "you've used your 3 nominations". |
| **Empty state** | Asterisk flower + serif "nothing here yet" + one-line hint. Reuse for empty pool, empty archive, no answers yet. |
| **Answer card (your answers)** | Serif question, italic answer textarea, image thumbnails (× remove on hover/focus), ⊕ add image, per-card save state. Page-level note "saves automatically". |
| **Zine page** | Paper sheet: "01 …" serif heading, answer cards with **username** header and initials avatar; unanswered = placeholder card ("[name] left this one blank"); pager: back / next page. NO edit affordances (no ×, no ⊕). |
| **Settings modal** | Overlay, 4 white panels: group info (invite code + copy, group avatar + name), the crew (avatar + name + remove per member, admin only), publishing (static schedule info in MVP), profile (username field, log out). Focus-trapped; Esc closes; × top-right. |
| **Avatars** | Member: initials on lavender circle, **ink text**; group: initials on mint square. Always paired with visible name or `aria-label`. |
| **Buttons** | Primary: green-deep pill, white label. Secondary: outline pill, ink label. Chip: small pill on dark (composer). Destructive: magenta-text, text-style. Min touch target 44×44px. |
| **Toast / inline feedback** | Small pill toast bottom-center: "copied!", "saved", "question added". Auto-dismiss 2.5s; `role="status"`. |
| **Form inputs** | White field, 1px mint-dark border, ink text; visible label above (never placeholder-only); focus ring (see §8); error = message text + icon below field, never color alone. |

### Component states (all interactive elements)

default · hover (shadow/tint lift) · **focus-visible (always)** · active · disabled (50% opacity + `cursor: not-allowed`) · loading (spinner replaces label, width preserved)

## 7. Motion

- Durations: 150ms (hovers, toggles) · 250ms (modal, toasts) · easing `ease-out`
- Zine page turn: simple crossfade or slide, 250ms; no elaborate 3D page flips
- **Respect `prefers-reduced-motion: reduce`:** disable card rotation transitions, page-turn animation, toast slide (fade only)

## 8. Accessibility checklist (build-time rules)

- [ ] Text contrast: use tokens per the audit in §2 (ink initials on purple avatars; accent/dark pink passes AA at all sizes)
- [ ] Every interactive element has a **visible focus ring**: `outline: 2px solid var(--accent-purple-deep); outline-offset: 2px`
- [ ] Touch targets ≥44×44px (nav tabs, ×/⊕ icons, pager arrows)
- [ ] Semantic HTML first: `<nav>`, `<main>`, `<button>` (never clickable divs), one `<h1>` per page
- [ ] Answer images get alt text: prompt the member for an optional caption; fall back to "photo answer from [username]"
- [ ] Settings modal: focus trap, Esc to close, focus returns to the star button
- [ ] Toasts use `role="status"`; errors use `role="alert"`
- [ ] Never color-only state; icons/underlines/labels accompany
- [ ] `prefers-reduced-motion` honored (§7)
- [ ] Zoom to 200% must not break layout (rem-based type, no fixed-height text boxes)
- [ ] Lowercase styling via CSS `text-transform: lowercase` on display text, so screen readers receive normally-cased source text

## 9. Design tokens — starter CSS

```css
:root {
  /* color — names mirror the Figma variables */
  --bg-page: #d9ede0;          /* surface/page green */
  --bg-mint-soft: #e3eee9;     /* dumpdates/light green 1 */
  --card-mint: #b7ddc5;        /* light green 1 */
  --card-mint-2: #c5e6d2;      /* light green 2 */
  --green-medium: #315d50;     /* medium green 1 */
  --green-deep: #162e1f;       /* dark green 1 */
  --green-deepest: #0a1f12;    /* dark green 2 */
  --text-ink: #11301d;         /* text/dark green */
  --accent-pink: #ac1f78;      /* accent/dark pink */
  --accent-pink-soft: #eeacd6; /* accent/light pink */
  --accent-purple: #9a9af8;    /* accent/light purple */
  --accent-purple-deep: #4c4ec6; /* accent/dark purple */
  --white: #ffffff;
  --paper-margin: #edbbbd;     /* sampled; not a Figma variable */

  /* type — exact Figma families */
  --font-display: "Playfair Display", Georgia, serif;  /* SemiBold 600 */
  --font-body: "Montserrat", "Segoe UI", sans-serif;

  /* space */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-6: 24px; --sp-8: 32px; --sp-12: 48px;

  /* strokes (Figma variables) */
  --stroke-s: 1px; --stroke-m: 1.5px; --stroke-l: 1.8px;

  /* shape */
  --radius-card: 10px;
  --radius-panel: 16px;
  --radius-pill: 999px;
  --radius-thumb: 8px;
  --shadow-card: 0 2px 6px rgba(0, 0, 0, 0.16); /* Figma effect style */

  /* motion */
  --dur-fast: 150ms;
  --dur-med: 250ms;
}
```

## 10. Imagery

- Answer photos: thumbnails at `--radius-thumb`, object-fit cover, ~96px square on cards; tap/click opens larger view in zine (backlog if needed)
- **Up to 3 images per answer** (locked decision); ⊕ hides at 3
- Client-side resize before upload (max ~1600px long edge) to keep the Storage bucket lean

## 11. Do / Don't

**Do:** vary card tints and rotations · keep copy lowercase and warm · reuse the asterisk flower for all empty states · build texture in CSS
**Don't:** ship dead buttons (no "generate with AI" chip in MVP) · show edit affordances in the zine read view · use white text on light purple · center-justify long body text · add features that need explaining

## 12. Scope flags — status

| Flag | Status |
|---|---|
| Publishing dropdowns in settings | **RESOLVED:** static text in MVP; configurable schedule → backlog |
| Multiple images per answer | **RESOLVED:** text + up to 3 images (schema: `answer_images` table or array column) |
| "generate prompt with AI" chip | Backlog (omit chip in MVP) |
| Polls (poll card, "add poll answers") | Not in PRD; backlog unless promoted |
| × on images in published zine | Design artifact; read view never shows edit affordances |
| Timeline banner | In design, cheap; candidate to promote to MVP — **awaiting Izzi's call** |
| Copy invite code button | In design, trivial; candidate to promote to MVP — **awaiting Izzi's call** |
| Editable group name + group avatar | In design, not in PRD; small — **awaiting Izzi's call** |
| Login screen shows old Zeene branding | Rebrand to dumpdates |

## 13. Later (post-MVP design work)

- Riso/ghost graphic layer + hand-drawn iPad assets (Procreate → transparent PNG → `public/`)
- Zine image lightbox; polls; AI question generation UI
- Per-member accent colors for answer cards in the zine
- Print/export-friendly zine stylesheet (a real zine you could print is very on-brand)
- Dark mode is explicitly **not** planned; the paper look is the brand
