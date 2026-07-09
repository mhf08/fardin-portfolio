# Upgrade Path — living document

> Working file for site upgrades. Claude: consult this at the start of any site task,
> mark items done as they land, add new findings to the backlog. Bigger session detail
> lives in HANDOFF.md; this file is the what-and-why, not the how.

Positioning (agreed 2026-07-09): **academia leads, photography is a supporting personal
layer.** Voice rules: no em dashes, no AI-sounding writing in any copy.

## Done

- [x] Hero rewrite: academia-led eyebrow/role/value line, softened photography tagline,
      "Read the Thesis" as primary CTA (2026-07-09)
- [x] Career update sitewide: Adjunct → full-time Lecturer, Jul 8 2026 (2026-07-09)
- [x] Contact lede names academic collaborators; photography secondary (2026-07-09)
- [x] Toolkit BOM: Teaching & Communication category, items 009–011 (2026-07-09)
- [x] Courses taught as pill list with real codes (IPE 331/332/204/432); mobile
      pill-wrap CSS fix (2026-07-09)
- [x] Thesis label: "Manuscript in preparation" (2026-07-09)
- [x] Sheet reorder: Thesis 05, Projects 06, all labels/nav/CTAs renumbered (2026-07-09)
- [x] Photography artist statement rewritten (no longer duplicates About); fixed
      smart-quote class-attribute bug on Genba series desc (2026-07-09)

## Next up (from the 2026-07-09 full review)

- [x] **Fix hero tagline grammar**: "and chases" → "and chase" (2026-07-09)
- [x] **Rewrite About paragraph 1 + 2**: para 1 now opens "now teaching in the same
      department that trained me," research-first framing; para 2 rewritten so it no
      longer duplicates the hero's "structure that doesn't announce itself" line
      (2026-07-09)
- [x] **REV bump**: loader, HUD, title block, About sheet meta, footer → 2026.07;
      JSON-LD dateModified → 2026-07-09. Also updated page title / og:title /
      twitter:title to "Mostofa Habib Fardin · Lecturer & Researcher, BUET" (old ones
      said "Industrial Engineer & Visual Storyteller") (2026-07-09)
- [x] **Em-dash sweep**: all prose, headings, meta lines, lightbox captions, and
      llms.txt swept. Em dashes kept ONLY in numbered drafting callouts (FIG. / TABLE /
      FILM edge / loader Rev line) where they are period-correct engineering-drawing
      typography; 10 visible survivors, all accounted for (2026-07-09)
- [x] **About statrow**: added "Courses taught: 4 (this term)" stat; grid back to
      4 cols desktop / 2×2 mobile (2026-07-09)

## New backlog items (found during 2026-07-09 sweep)

- [ ] **Regenerate og.jpg** (tools/build-og.mjs): the share image still reads
      "Industrial & Production Engineer — Visual Storyteller"; og:image:alt kept
      matching the image for now. Regenerate with the lecturer title, then update alt

## Done (2026-07-09, second batch)

- [x] **og.jpg regenerated** via build-og.mjs: eyebrow → RESEARCH · TEACHING · IPE,
      role → "Lecturer & Researcher, BUET", status → "Open to research", REV → 2026.07.
      og:image:alt updated to match. og/twitter descriptions rewritten academia-first
- [x] **Research Interests block** added to end of Thesis sheet (prose + 5 tag pills:
      Supply Chain Resilience, ML Demand Forecasting, Multi-Echelon Simulation,
      Information Systems in Operations, Quality & Process Control). New CSS
      .thesis__interests (border-top divider, matches .thesis__results treatment)
- [x] **Contact button renamed** "The 'Iteration Input'" → "Leave Feedback"
- [x] **MS Office certificate dropped**; .certs grid 3→2 cols so the two survivors
      (Lean Six Sigma, CR Recognition) fill the row cleanly

## Blocked on user input

- [ ] **Resume swap** (ON HOLD): user is updating resume.pdf and will hand it over. On
      arrival, drop into assets/resume.pdf (no other propagation needed — meta/OG/llms/
      JSON-LD/REV already done)
- [ ] **Thesis PDF artifact**: "Read the full thesis" link or abstract download on the
      Thesis sheet — needs the file from user (research-interests line now DONE separately)
- [x] **Hero background image** DONE (2026-07-09): user generated a warm drafting-desk
      scene (blueprints + drafting compass + scale ruler + mechanical pencil, a vintage
      film camera, and 2–3 B&W prints nodding to the Genba series) — mixes academia +
      photography exactly as intended. Source 1672×941 PNG → center-cropped to 1408×768,
      re-encoded to hero.jpg/avif/webp + 800 tiers via a one-off scratchpad script
      matching build-images settings (avif q52/e6, webp q78/e5). Verified legible in both
      themes; old hero backed up to scratchpad/hero_backup

## Orphaned assets to clean up

- [ ] assets/img/awards/ms-office*.{jpg,avif,webp} (+ 800 tiers) now unreferenced after
      dropping the cert — safe to delete on next asset pass

## Teaching / course-materials hub (built 2026-07-09)

- [x] **`/teaching/` page** — standalone, branded (reuses tokens/fonts via /css/styles.css +
      /teaching/teaching.css), data-driven from `/teaching/courses.json`, rendered by
      `/teaching/teaching.js` (vanilla, no build). Four courses seeded (IPE 331/332/204/432),
      materials empty. Files live on-domain under `/teaching/files/<course>/`. Discreet links
      added to the main site: footer + Experience card ("Course materials for my students ↗").
      Self-service guide at `teaching/HOW-TO-ADD-MATERIALS.md` (browser-only GitHub workflow,
      deploy-excluded so it stays private). All paths root-absolute (works with/without trailing
      slash — a relative-path version broke the JSON fetch at `/teaching` no-slash; fixed).
- [ ] **PREREQUISITE for auto-update:** GitHub repo must be connected to Vercel (Settings → Git)
      so the user's browser commits auto-deploy. Confirm this is on when the site is deployed.
- [~] **Form-based admin (Pages CMS)** — user chose a no-code form UI over editing JSON.
      `.pages.yml` config + teaching/ADMIN-SETUP.md written. BLOCKED on prerequisites: commit+push
      + deploy the site, then user authorizes Pages CMS at app.pagescms.org. Config syntax to be
      verified on first connect (can't test a Git CMS locally).
- [ ] **Check BUET policy** on hosting course materials on a personal site before publicizing.

## The big one

- [ ] **B1 — Interactive bullwhip simulator on the Thesis sheet.** The single upgrade
      that would put the site in top-0.1% territory; turns the thesis from a summary
      into a demonstration. (Deferred earlier as "later development.")

## Backlog (earlier deferred items)

- [ ] B2 — scroll-scrubbed exploded view of the radial drill (Projects)
- [ ] B3 — one real artifact per case study + pulled-out headline metrics
- [ ] Photography: possible third series later (user will advise)

## Deploy status

- [x] **DEPLOYED 2026-07-09** — live at https://mostofahabibfardin.vercel.app/ , repo pushed.
- [x] Domain repointed placeholder `mostofahabibfardin.com` → `mostofahabibfardin.vercel.app`
      across index.html (canonical/og/twitter/JSON-LD/plausible), sitemap.xml (+ added
      /teaching/ URL, bumped lastmod), robots.txt, and the teaching guides. NOTE: user is on the
      vercel.app subdomain for now; if a custom domain is attached later, swap the domain back
      across those files (README documents the find-replace).
- [ ] **These edits need to be committed + pushed** to go live (auto-deploys if Vercel↔GitHub
      Git integration is on — user to confirm Settings → Git).
- [ ] **Verify on the live deploy** (was untestable locally): open the site + /teaching/ with
      DevTools, check for CSP violations; confirm og.jpg preview resolves. (WebFetch/preview were
      down at edit time due to a temporary model-classifier outage.)
- [ ] Connect **Pages CMS** (app.pagescms.org) for the form-based admin — see teaching/ADMIN-SETUP.md.
- [ ] Uncomment Plausible script after signup (data-domain now set to vercel.app).

## Backlog — custom domain (if/when registered)

- [ ] Attach custom domain in Vercel → Settings → Domains, then swap
      `mostofahabibfardin.vercel.app` → the real domain across index.html, sitemap.xml,
      robots.txt, teaching guides, and Plausible data-domain.
