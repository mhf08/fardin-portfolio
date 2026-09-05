> **HISTORICAL 2026-09-05.** This is the original "Drawing Set" brief the site was
> built from. It still describes the live site accurately, but the user has decided the
> drawing-set metaphor is too narrow for their field, and the replacement direction
> ("warm editorial, quietly systematic") is specified in `THEME-BRIEF.md`. Read this for
> why the current design is the way it is, not for where it is going.
> One factual drift: the site has nine sheets now, not the eight described below.

# Design Brief — mostofahabibfardin.com

## Pass 1 — Design plan

### Concept: "The Drawing Set"

Mostofa is an industrial & production engineer who photographs the world as a system.
The most characteristic artifact of his discipline is the **engineering drawing set** —
numbered sheets, title blocks, revision marks, figure callouts, bills of materials.
The entire site is typeset as one: eight numbered sheets, each with a title block,
each figure captioned and numbered. Structure *is* the decoration.

This is warm, not cold: drafting-paper cream instead of blueprint cyan, brass instead
of safety yellow, a humanist serif instead of a stencil face. It reads like a drawing
set that has been handled — precise, but made by a person.

### Color palette

| Name            | Hex       | Role                                            |
|-----------------|-----------|-------------------------------------------------|
| Drafting Paper  | `#F3EFE6` | Light background — warm cream, not white        |
| Carbon Ink      | `#1F221C` | Primary text; dark-mode background base         |
| Brass           | `#9C6B1E` | Accent for text/links (AA on paper)             |
| Bright Brass    | `#C8922E` | Rules, ticks, marks, dark-mode accent           |
| Graphite        | `#5C594E` | Secondary text, captions                        |
| Raised Paper    | `#FBF8F1` | Cards / panels one step off the background      |

Dark mode ("night shift") inverts to ink-dark paper `#17190F→#181A16`, bone text
`#ECE6D8`, brass brightened to `#D9A84E`.

### Typography

- **Display: Fraunces** (variable, optical sizing + italic). Warm, sharp-serifed,
  slightly eccentric — the "human hand" against the grid. Used for headlines,
  pull-quotes, and the giant email link.
- **Body/UI: Inter** (400/500/600). Neutral, legible, disappears behind content.
- **Annotation: IBM Plex Mono** (400/500). Every sheet number, figure callout,
  table, label and title block. This is the voice of the drawing set.

Scale (fluid): display `clamp(2.75rem → 5.75rem)`, section titles
`clamp(2rem → 3.25rem)`, body `1.0625rem/1.7`, annotations `0.72–0.8rem` with
wide tracking, uppercase.

### Layout concept

A single page presented as eight numbered sheets. A fixed vertical **ruler** runs
down the left edge on desktop with real tick marks; a brass indicator tracks scroll
position and a mono readout names the current sheet. Each section opens with a
title-block header: serif title left, mono metadata right (sheet no. / rev / scale).

```
+--+------------------------------------------------------------+
|R |  MHF.        02 Profile 03 Experience 04 Work ... [NIGHT]   |
|U +------------------------------------------------------------+
|L |  MOSTOFA HABIB FARDIN · INDUSTRIAL & PRODUCTION ENGINEER    |
|E |                                                              |
|R |  Production systems,                                         |
|  |  brought into tolerance.                  (huge Fraunces)    |
|t |                                                              |
|i |  lede paragraph .............................                |
|c |  [ Read the case studies ]  [ Résumé (PDF) ]                 |
|k |  +----------+----------+----------+----------+               |
|s |  | DRAWN BY | SHEET    | REV      | STATUS   |  ← title block|
|  |  +----------+----------+----------+----------+               |
+--+------------------------------------------------------------+
   |  ============ SHEET 02 — PROFILE ============                |
   |  [portrait + FIG.]   text, pull-quote, stat row              |
   |  ============ SHEET 03 — EXPERIENCE =========                |
   |  RANCON attachment — bullets + photo strip                   |
   |  ============ SHEET 04 — PROJECTS ===========                |
   |  3 case studies, each: PROBLEM / BUILD / RESULT + figures    |
   |  ============ SHEET 05 — RESEARCH ===========                |
   |  thesis: bullwhip × ML × blockchain                          |
   |  ============ SHEET 06 — TOOLKIT & RECORD ====               |
   |  BOM-style skills table, education, recognition              |
   |  ============ SHEET 07 — FIELD NOTES ========                |
   |  two photo series, numbered figures with captions            |
   |  ============ SHEET 08 — CONTACT ============                |
   |  giant email link, copy button, socials                      |
   +--------------------------------------------------------------+
```

### Signature element

**The title block + ruler.** The hero ends in a real engineering title block
(DRAWN BY / SHEET 01 OF 08 / REV 2026.06 / STATUS), and the left-edge ruler with
its live sheet readout carries the metaphor through the whole scroll. Nothing else
on the page needs to shout.

### Motion

- **Sheet wipe**: clicking any nav link runs a two-panel ink/brass wipe over the
  viewport; the jump happens under cover. This is the "bold page transition" —
  it turns anchor jumps into page turns.
- Scroll reveals: short rise-and-fade, once, via IntersectionObserver.
- All motion gated behind `prefers-reduced-motion`.

## Pass 2 — Self-critique

What in Pass 1 was the generic default? Four things; all revised:

1. **Centered hero with social icons** (what the old site did, what every template
   does). Replaced with a left-set editorial opening — name in the eyebrow, the
   *claim* in the headline, identity data moved into the title block where the
   metaphor wants it. Social links live in Contact, once.
2. **Charcoal-dark + gold-glow theme.** The old site's dark charcoal/amber is the
   default "premium portfolio" look. Inverted: the site is **paper-first** — warm
   light mode is the primary art direction, dark mode is the considered secondary.
   Almost nobody ships a cream portfolio; it photographs the engineering-drawing
   concept far better.
3. **Skills as card grids with icons.** Deleted. Skills are a **bill of materials**
   — a numbered mono table (ITEM / CATEGORY / SPECIFICATION). More honest, more
   scannable, and on-concept.
4. **Photography as hover-reveal masonry.** Hover-only captions die on touch and
   hide the writing, which is the best part. Captions are now *visible* plate
   captions with figure numbers, like plates in a technical report.

Aesthetic risk kept on purpose: a cream/brass palette and a mono-heavy annotation
layer could read "old document" rather than "engineer." The Fraunces display
voltage and the strict grid keep it contemporary; the risk is justified because
the audience (hiring managers) sees a hundred dark-gradient portfolios a week and
zero drawing sets.

## Tech decisions

Zero-dependency static site: one HTML file, one CSS file, one JS file.
No framework — the old React/Three.js stack was ~2 MB of JS for a content page.
Static HTML is faster than any hydration strategy, trivially deployable
(Netlify/Vercel/GitHub Pages drag-and-drop), and durable. Images are pre-compressed
(max 1600–1800 px long edge, JPEG q80, EXIF rotation baked) by `tools/build-assets.ps1`.
