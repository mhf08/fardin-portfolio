# Design system

The rules the site is actually built on. Read this before changing anything
visual. Written 2026-09-06, after the overhaul that replaced the original
"Drawing Set" theme.

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
physics, not preference. Night is the default, so most visitors see it.

---

## Accent discipline

The single easiest thing to get wrong. Brass used to sit on eyebrows, headings,
item numbers, frame numbers, plate numerals, borders, links and all the chrome.
If crimson inherits all of that the site turns red and looks institutional
regardless of the tokens. **Coverage is deliberately about a third of what
brass had.**

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

Four faces, one job each.

- **Fraunces** — display. The name, section headings, big numerals, photo captions.
- **Inter** — interface and body. Nav, labels, buttons, prose.
- **IBM Plex Mono** — annotation only, and rarely: index numbers, metadata
  stamps, section metas. It is not for headings; the `.label` class covers
  small uppercase headings in Inter.

All self-hosted as woff2 in `assets/fonts/`, latin subset.

---

## Structure

Nine named sections. Research sits third, immediately after About, because it
is what the audience came for.

`Title · About · Research · Teaching · Projects · Industry Experience · Skills · Recognition · Photography · Contact`

Education lives in About. Recognition (competitions and certificates) sits
after the substantive work, not level with the thesis.

**Cross-page links use stable name-based anchors** (`#contact`), never
`#sheet-NN`. Renumbering sections silently redirected the teaching page's
Contact button once already; an anchor that still resolves can still be wrong.

---

## The interaction layer

Content-agnostic by design. Everything is assigned **by role from JS**, never by
hand-tagging markup, so it keeps working as sections are added or removed.

- Theme toggle is a circular View Transitions reveal from the click point
- Load orchestration: the header and hero arrive in order, with an 1800ms
  safety timeout so a stalled `load` event can never leave the page invisible
- Section headings wipe up from their own baseline
- Buttons lean toward the cursor on fine pointers
- The spine carries scroll progress, section marks and the active section name

**Rule learned the hard way: never gate visibility on an observer.** The
heading wipe animates *from* the masked state, so the resting style is plain and
visible. A missed observer costs an animation, never content. An earlier version
hid every heading behind an observer that never fired.

Also: `picture { display: contents }` means a `<picture>` has no box and can
never be observed. Observe a wrapper instead.

---

## Photography

Two series, one component. Both share the frame, the hover and the caption
block (index, title, optional datum). They differ only where the difference
carries meaning:

- **Echoes of the Genba** — a contact sheet. Square crops, monochrome, four
  across, film-edge header, grease-pencil select marks.
- **The Design of Nature** — plates. Natural aspect, colour, two across with a
  full-width span.

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
