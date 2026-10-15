# Design system

The rules the site is actually built on. Read this before changing anything
visual. Written 2026-09-06, last updated 2026-09-07.

Supersedes and merges the old `DESIGN.md` (the 2026-06 Drawing Set brief),
`THEME-BRIEF.md` (the questionnaire that chose the new direction) and
`THEME-OVERHAUL.md` (the migration spec, now executed). All three are in git
history if the reasoning behind a decision is ever needed in full.

---

## Who the site is for

Settled by questionnaire, 2026-09-04. These answers govern close calls.

| Question | Answer |
|---|---|
| Audience | PhD applications and research collaborators first, teaching visibility second. Not industry. |
| The one impression | "A faculty member who doesn't use those boring sites, and has some personality." Credible first, memorable second. |
| Worse failure | Being thought **unserious**. So when a call is close, take the restrained option. |
| Photography | Academic first, photographer second. Photography is the site's texture, not a competing subject. |
| Register | Warm. Both themes. Between "made by a designer" and "made by an engineer with taste". |
| Motion | Yes, as long as it is not distracting. |

---

## Palette

Accent is BUET crimson, sampled from `ipe.buet.ac.bd` computed styles:
`rgb(191,20,48)` = `#BF1430`, with `#A10F26` as the darker variant.

The governing principle: **BUET lends the red, everything else stays his.**
Take the crimson, but not their pure white or their cool near-black — the warm
paper is what keeps the site from reading as a department microsite.

```css
:root {                        html[data-theme="dark"] {
  --paper:        #F7F4F1;       --paper:        #171516;
  --paper-raised: #FFFCFA;       --paper-raised: #201D1F;
  --ink:          #1C1A1B;       --ink:          #EDE7E4;
  --ink-soft:     #5E5658;       --ink-soft:     #A2999B;
  --brass:        #A10F26;       --brass:        #DD4B5E;
  --brass-bright: #BF1430;       --brass-bright: #EF6274;
}                              }
```

The accent tokens are still named `--brass` from the previous palette. Renaming
them touches ~40 rules for no functional gain, so they stayed.

### Contrast, verified

| Pair | Ratio |
|---|---|
| ink on light paper | 15.80:1 |
| ink-soft on light paper | 6.50:1 |
| `#A10F26` on light paper | 7.34:1 |
| ink on dark paper | 14.85:1 |
| ink-soft on dark paper | 6.55:1 |
| `#DD4B5E` on dark paper | **4.54:1** |

**`#DD4B5E` clears 4.5:1 by 0.04.** Fine for labels, numerals and short
emphasis. Never set a paragraph in it.

### Why dark mode is not the brand red

`#BF1430` is **2.91:1** on `#171516` — it fails even the 3:1 non-text floor.
`#A10F26` is worse at 2.26:1. Lightening a crimson to clear contrast pushes it
toward rose, so night shift reads slightly rosier than the brand. That is
physics, not preference.

### Default theme (since 2026-10-15)

Day is the default on the main site. The old reason for a night default (the
monochrome Genba series) moved to `/photography/`, which defaults to night.
`js/theme-init.js` resolves: saved choice (`mhf-theme`) → the page's
`<html data-default-theme="dark|light|auto">` → day. The teaching pages use
`auto` (follow the OS), which is what every page did before.

---

## Accent discipline

The single easiest thing to get wrong. Brass used to sit on eyebrows, headings,
item numbers, frame numbers, plate numerals, borders, links and all the chrome.
If crimson inherits all of that the site turns red and looks institutional
regardless of the tokens. **Coverage is deliberately about a third of what
brass had.**

**Crimson italic budget:** two places, the hero surname and "compare notes"
in Contact. The About pull quote is ink.

**Crimson is allowed on:** the hero surname · the hero eyebrow · `.label`
section headings · link and nav hover · the focus ring · the status dot · the
`+` in the thesis figures · the `.xp--current` border · the contact-sheet
grease-pencil marks.

**Everything else uses `--ink-soft`**, including all chrome. The spine, the
header and every index number are neutral. Institutional colour on persistent
furniture is exactly what reads as a department template.

### The low-percentage trap

A faint wash of warm gold reads as paper. **A faint wash of crimson reads as
pink**, which is the one thing an institutional red must not do. Any
`color-mix` below about 15% must be derived from `--ink`, never the accent.
Two rules hit this (the skills-table band rows and their hover) and both are
now neutral.

---

## Type

Three faces, one job each, plus three text roles.

- **Fraunces** — display. The name, section headings, big numerals, photo captions.
- **Inter** — interface and body. Nav, labels, buttons, prose.
- **IBM Plex Mono** — almost gone (2026-10-15). Only years in the honours list,
  carousel and lightbox counters, and the MHF mark. Mono everywhere is what
  made the site read as a developer portfolio.

Text roles: `.label` (Inter, uppercase, tracked) for small headings and
eyebrows; `.meta` (Inter, sentence case, 0.88rem) for section metas, dates and
places, captions; plain body for everything else. The nav and the theme toggle
are Inter in sentence case.

All self-hosted as woff2 in `assets/fonts/`, latin subset.

---

## Structure

Eight sections, six in the nav (since 2026-10-15). Research sits third,
immediately after About, because it is what the audience came for.

`Title · About · Research · Teaching · Projects · Experience · Photography band · Contact`

- **About** holds education and **Honours & Awards** (a CV-style year / award /
  one line list; event photos and certificates open in the lightbox from a text
  link, never inline).
- **Research** is an agenda paragraph, interest tags and **Publications &
  Output**. The thesis findings and headline numbers are off the page while the
  paper is in preparation; do not put them back (or into llms.txt) until it is
  published.
- **Experience** is industry work plus the **Skills & Methods** table (no item
  numbers).
- **Photography** is a short band before Contact: intro, three thumbnails, a
  link. It is not in the nav; a quiet "Photography ↗" sits after a divider.
- Contact is not crimson in the nav. "Resume" is called **CV** everywhere; the
  file is `Mostofa-Habib-Fardin-CV.pdf` and `vercel.json` redirects the old
  `-Resume.pdf` path.

Name anchors for links from outside: `#research`, `#publications`,
`#photography`, `#contact` (`.anchor` spans).

**Cross-page links use stable name-based anchors** (`#contact`), never
`#sheet-NN`. Renumbering sections silently redirected the teaching page's
Contact button once already; an anchor that still resolves can still be wrong.

---

## Motion

Four duration tokens and one curve cover everything. Defined in `:root`.

| Token | Value | Used for |
|---|---|---|
| `--t-fast` | 240ms | hovers, small state changes |
| `--t-mid` | 520ms | panels, component reveals, the nav rule |
| `--t-slow` | 900ms | headings, section content |
| `--t-view` | 1150ms | the full-view moments: section change, theme change |

Easing is `--ease-out`, `cubic-bezier(0.22, 1, 0.36, 1)`, everywhere.

**`main.js` reads these from CSS** through a `motion(name, fallback)` helper
rather than keeping its own copy. Changing `--t-view` retimes the section
reveal, the theme reveal and the wipe fallback together. Do not hardcode a
duration in JS; it will drift the first time the token is tuned.

Ambient loops are deliberately outside the system: the hero drift (36s), the
status dot (2.4s) and the scroll cue (2s) are not transitions and should not
march to the same clock.

---

## Section switching

Clicking a nav item does **not** scroll. It jumps instantly and reveals the
destination with a **circle growing from the centre of the item you clicked**,
using the View Transitions API — the same gesture as the theme toggle, and the
same duration.

Two earlier attempts and why they failed, so neither gets retried:

- **A long smooth scroll** (Lenis, 1.05s) — travelling 10,000px to reach a
  section is slow and tells you nothing.
- **A View Transition cross-fade** — read as choppy. The cost is not the
  snapshot; it is the *blend*. Dissolving two very different scroll positions
  of a text-heavy page overlaps two sets of type and looks like mush. A
  clip-path circle does no blending at all, it simply uncovers, which is why
  the same API feels clean here and bad there.

The panel wipe (`.wipe`, two panels sweeping, jump at the covered midpoint) is
kept as a **real fallback** for browsers without View Transitions, not as dead
code. Reduced motion falls through to an instant jump.

`getBoundingClientRect()` for the circle origin must be captured **before**
`closeMenu()`, or on mobile the collapsing panel gives a stale rect.

---

## The interaction layer

Content-agnostic by design. Everything is assigned **by role from JS**, never by
hand-tagging markup, so it keeps working as sections are added or removed.

- Load orchestration: the header and hero arrive in order, with an 1800ms
  safety timeout so a stalled `load` event can never leave the page invisible
- Section headings wipe up from their own baseline, and replay that wipe on
  arrival when you jump to them
- The spine carries scroll progress, section marks and the active section name
- A crimson rule slides between nav items to mark the current section
- The mobile panel staggers its items in

**Rule learned the hard way: never gate visibility on an observer, or on an
animation.** The heading wipe animates *from* the masked state, so the resting
style is plain and visible; a missed observer costs an animation, never
content. The mobile nav items are animated in on `.open` for the same reason,
rather than being hidden and released. An earlier version hid every heading
behind an observer that never fired.

Also: `picture { display: contents }` means a `<picture>` has no box and can
never be observed. Observe a wrapper instead.

---

## Buttons

Pills, `border-radius: 999px`, because the contact row's icon buttons were
already circles and the two now rhyme. The resting border is `--line`, not full
`--ink`, so a row of three reads as one group rather than three boxes.
`:focus-visible` gets the same treatment as `:hover`.

`.btn--solid`'s hover label is a hardcoded `#fff` **on purpose**: the sweep
behind it is crimson in both themes, so `--paper` would put dark text on red in
night shift.

---

## Photography

Three series, one component. All share the frame, the hover and the caption
block (index, title, optional datum). They differ only where the difference
carries meaning.

**Two places (since 2026-10-15).** The main page has a short Photography band
before Contact (intro, one thumbnail per series, a link). The full series live on `/photography/`, built as three
rooms after a series index:

- **Echoes of the Genba**: a contact sheet. Square crops, monochrome, four
  across, film-edge header, frame numbers only (captions live under the prints
  and in the lightbox). Selects are circled with a loose grease-pencil loop.
  Below the sheet, the selects hang as paper prints (white border, shadow) on
  an edge-to-edge dark wall lit from above, and "develop" in on arrival.
  Select = print: circle a frame (`data-mark="select"`) and add it to the wall.
- **The Design of Nature**: an exhibition wall with a fixed rhythm: wide plate
  (near edge to edge, never taller than the screen), pair of portraits at a
  shared height, wide plate, pair. Labels sit under each work. A pair's flex
  share is each plate's aspect ratio (`--ar`), which is what equalises heights.
- **The Hour Between**: a sequence of large uncropped colour plates. The room's
  background mixes in each plate's `data-tint` as it scrolls into view
  (`photography/photography.js`); off under reduced motion. Copy never names a
  time of day, because dawn photos will join.

Main-page band (since 2026-10-15): one thumbnail per series, Genba = the clock
(G12), Nature = N01, Hour = Haze and Halo. The two-image covers and the dice
went with the full sheet; the clock was the user's must-keep. Thumbs are square, unbordered, each with its own
focal point (`--focus-xy`) so the subject survives and the watermark is cropped out.

Captions sit below the image and are always visible. They used to be
hover-only overlays, which made them invisible to anyone without a mouse.

The photography stays unbranded. It is the half of the site that is most
identifiably his and the strongest argument that the red is a nod rather than
an identity transplant.

---

## What not to do

- Do not adopt BUET's pure white or their cool near-black.
- Do not put crimson on the spine, header, footer or any persistent chrome.
- Do not use `#BF1430` in dark mode. It fails contrast.
- Do not add a second accent. One borrowed colour is a nod; two is a rebrand.
- Do not add interstitial photographs between unrelated sections. This was
  tried and removed: a photograph placed for rhythm rather than relevance reads
  as random, because it is.
- Do not restore the drawing-set chrome (ruler, HUD, title block, sheet-wipe,
  registration cursor). It was removed deliberately: the metaphor was too narrow
  for the field, and crimson chrome plus drafting chrome compounds into a
  department microsite.

---

## History, briefly

The site launched in 2026-06 as **"The Drawing Set"**: nine numbered engineering
sheets with title blocks, revision marks, a left-edge ruler, a live coordinate
HUD and a registration-mark cursor, in drafting cream and brass. It was coherent
and well made, and it is why the current typography and the contact-sheet
gallery exist.

It was replaced in 2026-09 because the metaphor was **too narrow** — industrial
and production engineering is systems, operations, quality and flow, and
drafting is one corner of it. The replacement removes the announced metaphor
rather than swapping in another one: the identity now lives in the typography,
the photography and one quiet spine.
