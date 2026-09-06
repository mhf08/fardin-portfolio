# THEME OVERHAUL — implementation spec

> Written 2026-09-06. Supersedes the direction section of `THEME-BRIEF.md`,
> which settled *what* to do; this file settles *how*, with the BUET palette
> folded in. Work from this file.
>
> Not deployed (`.vercelignore` excludes `*.md`). Committed, so it survives.

---

## Verdict, in one line

**Do both, together, and cut the accent's coverage by about two thirds.**
The palette swap alone is half a day. The structural change is one to two days.
Doing them separately costs more than doing them once, because both touch the
same rules.

---

## The governing principle

You asked to keep the site yours without it becoming BUET-like. That is the
whole design problem, and it has a precise answer:

> **BUET lends the red. Everything else stays yours.**

Crimson is one borrowed element inside a palette, a typeface and a body of
photographs that are entirely your own. The moment you also adopt BUET's white,
their cool near-black, or start painting the site's furniture red, you stop
looking like a person with an institutional affiliation and start looking like a
department microsite.

Four rules follow, and they are not negotiable if you want this to work.

**1. Take the red. Leave the rest of their palette.**
BUET's site is crimson on pure white with a cool `#212529` near-black. Pure
white would strip the warmth that makes your site feel handled rather than
generated. Keep a warm paper and a warm-neutral dark.

**2. Crimson never touches the chrome.**
The ruler, the progress spine, the header, the footer, any persistent furniture.
Institutional colour on persistent furniture is exactly what reads as "official
department template". Chrome goes neutral. Crimson appears in the content.

**3. Crimson must be rarer than brass was.**
This is the single most important rule in this document and the easiest to get
wrong. Brass currently sits on eyebrows, headings, item numbers, frame numbers,
plate numbers, borders, links, the ruler, the HUD and the title block. If
crimson simply inherits all of that, the site turns red and looks like BUET
regardless of what the tokens say. Cut accent coverage to roughly a third. What
loses the accent goes to `--ink-soft`, not to a second colour.

**4. The photography stays unbranded.**
Sheet 08 and the lightbox keep their own warm darkroom treatment. It is the half
of the site that is most identifiably yours, and it is the strongest argument
that the red is a nod and not an identity transplant.

---

## Feasibility — the actual numbers

Measured, not estimated.

### The palette is genuinely cheap

`css/styles.css` is 1,176 lines and routes **every** colour through ten custom
properties. There are no scattered colour decisions to hunt down.

| What | Count | Effort |
|------|-------|--------|
| Tokens carrying the whole palette | 10, twice (light + dark) | trivial |
| `color-mix()` calls referencing the accent | **6** | must audit each, see below |
| Hardcoded colours outside the token blocks | **14**, of which ~6 are warm values that will not follow a reskin | half hour |

That is the entire surface. The BUET preview already proves it: a 66-line
override file reskins the whole site with zero structural change.

### The structural change is modest too

| Surface | CSS rules | HTML refs | JS lines |
|---------|-----------|-----------|----------|
| `.ruler` | 9 | 5 | 6 |
| `.hud` | 6 | 5 | 12 |
| `.titleblock` | 10 | 5 | 0 |
| `.wipe` (sheet transition) | 7 | 17 | 14 |
| `.cursor` (registration mark) | 8 | 3 | 10 |

About **40 CSS rules, 35 HTML references and 42 of the 437 lines in
`main.js`** — roughly a tenth of the JavaScript. Plus **12 visible drafting
strings** in the copy: eight `FIG.`, three `CASE`, one `TABLE`, plus `Rev
2026.09`, `Scale 1:1`, `Drawn by` and the sheet counts.

Nothing here is entangled. It is deletion and replacement, not surgery.

---

## Part A — The palette

### Source

Sampled from `ipe.buet.ac.bd` computed styles, not guessed:
**`rgb(191,20,48)` = `#BF1430`**, 138 occurrences, the dominant accent, with
**`#A10F26`** as its darker variant.

### Tokens

```css
:root {
  --paper:        #F7F4F1;   /* warm off-white, NOT BUET's pure white */
  --paper-raised: #FFFCFA;
  --ink:          #1C1A1B;
  --ink-soft:     #5E5658;
  --brass:        #A10F26;   /* rename to --accent during the overhaul */
  --brass-bright: #BF1430;
  --line:         rgba(28, 26, 27, 0.22);
  --line-soft:    rgba(28, 26, 27, 0.10);
  --shadow:       0 18px 50px -18px rgba(28, 26, 27, 0.26);
  --focus:        #A10F26;
}

html[data-theme="dark"] {
  --paper:        #171516;   /* warm-neutral charcoal, NOT the current olive */
  --paper-raised: #201D1F;
  --ink:          #EDE7E4;
  --ink-soft:     #A2999B;
  --brass:        #DD4B5E;
  --brass-bright: #EF6274;
  --line:         rgba(237, 231, 228, 0.22);
  --line-soft:    rgba(237, 231, 228, 0.09);
  --shadow:       0 18px 50px -18px rgba(0, 0, 0, 0.6);
  --focus:        #EF6274;
}
```

### Contrast, verified

| Pair | Ratio | Verdict |
|------|-------|---------|
| ink on light paper | 15.80:1 | pass |
| ink-soft on light paper | 6.50:1 | pass |
| crimson `#A10F26` on light paper | 7.34:1 | pass, safe for body text |
| crimson-bright `#BF1430` on light paper | 5.71:1 | pass |
| ink on dark paper | 14.85:1 | pass |
| ink-soft on dark paper | 6.55:1 | pass |
| crimson `#DD4B5E` on dark paper | **4.54:1** | pass, but only just |
| crimson-bright `#EF6274` on dark paper | 5.77:1 | pass |

**`#DD4B5E` clears 4.5:1 by 0.04.** Treat it as safe for labels, numerals and
short emphasis, and never set a paragraph in it.

### Why dark mode cannot use the real BUET red

| | on `#171516` |
|---|---|
| `#BF1430` (BUET) | **2.91:1** — fails even the 3:1 non-text floor |
| `#A10F26` (BUET dark) | **2.26:1** — worse |
| `#DD4B5E` (proposed) | 4.54:1 |

Lightening a crimson to clear contrast necessarily pushes it toward rose. This
is physics, not preference. **Night shift will read slightly rosier than the
brand and there is no way around it.** Accept it, or make light the default.
Given night is currently your default, know that most visitors will see the
rose-leaning version.

### Accent discipline — the allow-list

Rule 3 above, made concrete.

**Crimson is allowed on:**
- the surname in the hero
- `.label` section headings (the small uppercase ones)
- the hero eyebrow
- link hover and the focus ring
- the status dot
- the `+` in the thesis figures, and nothing else in that band
- the `.xp--current` left border, marking the live role

**Crimson is removed from — send these to `--ink-soft`:**
- the ruler and its readout
- the HUD
- the title block
- BOM item numbers `001`–`012`
- contact-sheet frame numbers `08-01`–`08-10`
- plate numerals `Plate I`–`VI`
- `TABLE 03-A`, `CASE 06-x`, `FIG. 06-xx` callouts (if the metaphor survives at all)
- `.case__step h4` headings

That is roughly a two-thirds cut. The site reads warm-neutral with deliberate
red emphasis, instead of red-by-default.

---

## Part B — The structure

### Recommendation: yes, drop the drawing metaphor, and the crimson makes it more urgent

The palette change does not merely coexist with the structural change, it
**raises the stakes on it**. Crimson chrome plus drafting chrome is two
institutional signals compounding. A red ruler, a red-stamped title block and a
`Rev 2026.09` revision mark together read as an official engineering document
produced by a department. Brass was idiosyncratic enough to escape that; crimson
is not.

You also already decided this on its own merits: the metaphor is too narrow for
your field, and it should be felt rather than announced.

### What goes

| Element | Replace with |
|---------|--------------|
| `.ruler` + readout | a single unlabelled left-edge progress line, the "spine" |
| `.hud` (live coordinates) | nothing |
| `.titleblock` | nothing; the hero's role line already says it |
| `.wipe` sheet transition | nothing; a plain anchor jump |
| `.cursor` registration mark | nothing; the OS cursor |
| Nav sheet numbers `02`–`09` | words only |
| `Rev 2026.09`, `Scale 1:1`, `Drawn by`, `Sheet 01 of 09` | delete |
| `FIG.` / `CASE` / `TABLE` callouts | plain captions, or drop the numbering |

### What stays, and why

- **Fraunces, Inter, IBM Plex Mono.** You named the typography as the thing you
  would be sorry to lose. It is also what makes the site yours.
- **The contact-sheet gallery** with its grease-pencil marks. Photographic, not
  drafting. The most distinctive thing on the site.
- **Night/day shift.**
- **The nine sections.** Structure is fine; only the drafting costume goes.
- **Everything shipped in September**: the thesis figures band, the raised hero
  opacity, the density system, the mono-as-annotation discipline.

### The one thing to add

Give the Thesis section a treatment the other eight do not get: its own grid,
more room, a photograph belonging to it. Eight consistent sections and one
deliberate exception says "this is the important one" in a way no label can.

---

## Part C — Knock-on fixes the token swap will miss

These are the traps. The BUET preview already hit two of them.

### 1. Accent `color-mix()` calls — all six need judgement

| Line | Rule | Risk |
|------|------|------|
| 323 | `.hero__rule` — accent at 35% | fine |
| 406 | title-block scan sweep — bright at 28% | element is being deleted |
| 424 | status-dot pulse — bright at 45% | fine |
| 516 | `.xp--current` border — accent 45% mixed into `--line` | fine, keep |
| 643 | `.bom__group th` band — bright at **5%** | **reads PINK.** Confirmed in preview. Go neutral: `color-mix(in srgb, var(--ink) 5%, transparent)` |
| 647 | BOM row hover — bright at **7%** | **reads PINK.** Same fix at 4% |

The general law: **a faint wash of warm gold reads as paper; a faint wash of
crimson reads as pink.** Any tint below about 15% must be re-derived from
`--ink`, not the accent.

### 2. Hardcoded warm values that will not follow the reskin

Fourteen colours sit outside the token blocks. Most are deliberate (`#fff` on
solid buttons, `#000` behind the video, the lightbox backdrop). These six are
the site's old cream, hardcoded, and will clash with a new paper:

| Line | Value | Belongs to |
|------|-------|------------|
| 660 | `#F3EFE6` | certification logo tile background |
| 762 | `#D8D2C4` | lightbox chrome |
| 767 | `#EDE8DC` | lightbox chrome |
| 944 | `#E8E2D4` | contact-sheet frame |
| 950 | `#F1ECDF` | `.frame__note` caption text |
| 1017 | `rgba(31, 34, 28, 0.5)` | plate hover shadow |

Tokenise all six before the swap or they will look wrong afterwards.

### 3. Theme-dependent meta

`index.html` carries two `<meta name="theme-color">` values matching the old
palette. Update both.

---

## Work plan

Sequenced so each stage is independently shippable and independently revertable.

| # | Stage | What | Effort |
|---|-------|------|--------|
| 1 | **Tokenise the strays** | Fix the six hardcoded warm values and the two pink washes, on the *current* palette. Nothing changes visually. | 1 hour |
| 2 | **Swap the palette** | Replace the ten tokens in both themes. Update `theme-color` metas. Apply the accent allow-list from Part A. | half day |
| 3 | **Strip the chrome** | Remove ruler, HUD, title block, wipe, cursor. Add the spine. Strip nav numbers. | half day |
| 4 | **Language pass** | Drafting vocabulary out, systems vocabulary in. Twelve visible strings plus the callouts. | 2 hours |
| 5 | **Thesis feature treatment** | The one deliberate exception. | half day |

Stages 1 and 2 give you most of the visible change. Stage 3 is what stops it
looking institutional. **Do not ship 2 without 3** — a crimson palette on
drafting chrome is the worst of both worlds, and worse than what you have now.

---

## Risks

**Turning the site red.** The failure mode is transferring brass coverage to
crimson one-to-one. Mitigation: the allow-list in Part A, applied literally.

**Losing warmth.** Neutralising the paper toward BUET's white would cost the
handled, photographic quality. Mitigation: `#F7F4F1` and `#171516` are both
deliberately warm. Do not neutralise them further.

**Dark mode drifting to rose.** Unavoidable, quantified above. Decide in advance
whether you accept it or switch the default to light.

**Shipping stage 2 alone.** See above. Sequence matters more than speed here.

---

## Verification checklist

Run at 1920x1080, both themes, then at 375px.

- [ ] No hardcoded old-cream value remains outside the token blocks
- [ ] No `color-mix` below 15% references the accent
- [ ] Accent appears only on the Part A allow-list
- [ ] Chrome carries no accent colour at all
- [ ] Contrast spot-checks match the table in Part A
- [ ] Both `theme-color` metas updated
- [ ] Photography sheet and lightbox unchanged in feel
- [ ] `overflowX` is 0 at 1920 and 375
- [ ] No failing requests beyond the known Vercel insights 404
- [ ] JSON-LD still parses; `dateModified` and both sitemap `lastmod` bumped

---

## What not to do

- Do not adopt BUET's pure white or their cool near-black.
- Do not put crimson on the ruler, spine, header or footer.
- Do not use the true `#BF1430` in dark mode. It fails contrast at 2.91:1.
- Do not add a second accent. One borrowed colour is a nod; two is a rebrand.
- Do not re-add interstitial photographs between unrelated sections.
- Do not touch the contact-sheet gallery.

---

## Reference

- Working preview: `theme-buet-preview.html` + `css/theme-buet-preview.css`,
  generated from the real `index.html`. Serve locally and open
  `/theme-buet-preview.html`.
- Prior decisions and the questionnaire that produced them: `THEME-BRIEF.md`.
- Everything that has already shipped: `HANDOFF.md`.
- Remaining non-theme work: `ROADMAP.md`.
