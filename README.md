# Mostofa Habib Fardin — Portfolio

A static portfolio with no framework and no build step: the folder *is* the site.
The only dependency is `sharp`, used by the offline image scripts in `tools/`.
Nothing about the deployed site needs Node.

## Files

```
index.html            the whole site (9 named sections) — the deploy artifact
404.html              error page
sitemap.xml           two-URL sitemap
robots.txt            allow-all + sitemap pointer
llms.txt              summary for AI assistants that index or cite the site
vercel.json           CSP, security and caching headers
.vercelignore         keeps tools/, *.md and node_modules out of the deploy
.pages.yml            Pages CMS config for the Course Materials admin panel
favicon-v3.png        gear + camera aperture mark, BUET crimson

css/styles.css        tokens, layout, components, interaction layer, @font-face
js/theme-init.js      pre-paint theme pick (external, so the CSP needs no unsafe-inline)
js/main.js            spine, scroll-spy, carousels, lightbox, copy-to-clipboard,
                      theme toggle, interaction layer
js/lib/lenis.min.js   smooth scrolling

assets/fonts/         self-hosted woff2 (Fraunces, Inter, IBM Plex Mono, latin subset)
assets/img/           every image as .jpg + .avif + .webp, most with an 800px tier
assets/og.jpg         social share card

Mostofa-Habib-Fardin-Resume.pdf
                      at the repo root ON PURPOSE — inside /assets/ it would inherit
                      vercel.json's 1-year immutable cache, so a swapped résumé
                      could serve stale for months

teaching/             the Course Materials sub-page
  index.html, teaching.css, teaching.js
  courses.json        the data the page renders
  files/<course>/     the actual slides and handouts
  README.md           how to post materials (both methods)

tools/
  build-images.mjs    emit .avif/.webp + an 800px tier beside every assets/img/*.jpg
  build-html.mjs      wrap every <img> in <picture> with avif/webp sources
  build-srcset.mjs    add the 800w tier + sizes to every <picture>
  build-og.mjs        regenerate assets/og.jpg

DESIGN.md             the design system: palette, contrast, accent rules, do-nots
HANDOFF.md            running log of what happened, for AI continuity (local only)
ROADMAP.md            the forward plan (local only)
```

Deleted in the 2026-09-06 cleanup, recoverable from git history: three stale
theme previews, `UPGRADES.md` (superseded by ROADMAP), `THEME-OVERHAUL.md` and
`THEME-BRIEF.md` (both folded into DESIGN.md), the two teaching guides (merged
into `teaching/README.md`), and `build-logos.mjs` / `build-assets.ps1` (one-time
migration tools whose source folder no longer exists).

## Run locally

```powershell
npx -y serve -l 4173 .
# open http://localhost:4173/
```

## Asset pipeline (only re-run when images change)

```powershell
npm install          # once, pulls sharp
npm run images       # AVIF/WebP + 800px tiers
npm run html         # wrap new <img> in <picture>   (idempotent)
npm run srcset       # add responsive srcset          (idempotent)
npm run og           # regenerate the social card
```

The lightbox upgrades its full-size fetches to AVIF/WebP automatically (with a JPEG
fallback), so no markup changes are needed there.

### Note on the image scripts

`build-images.mjs` re-encodes **every** JPEG on each run, rewriting ~78 files.
That is fine, but run it when images actually change and commit the result on
its own so the diff stays readable.

`node_modules/` is gitignored and excluded from the deploy along with
`package.json` and the lockfile.

## Deploy (Vercel)

No build command, no output directory — the folder *is* the site. Either:

```powershell
# from this folder — first run links the project, then:
npx vercel --prod
```

…or push the folder to a GitHub repo and import it at vercel.com/new
(framework preset: **Other**; leave build command and output directory empty).

`vercel.json` carries the security headers (CSP, HSTS, etc.) and the immutable
caching for `/assets/*`. Vercel serves `404.html` automatically for missing paths.

CSP rationale (JSON can't hold comments):
- `script-src` has no `unsafe-inline` — all JS is external (`js/theme-init.js`, `js/main.js`);
  `plausible.io` is pre-allowed so enabling analytics needs no header change.
- `style-src 'unsafe-inline'` is required by the `style="--d:n"` stagger attributes — low risk.
- `img-src data:` is required by the AVIF/WebP support probes in `js/main.js`.
- `frame-src youtube-nocookie.com` + `img-src i.ytimg.com` serve the motion-study embed.

After the first deploy, open the site once with DevTools — any CSP violation
shows in the console and is a one-line allowlist fix in `vercel.json`.

### One thing to do before/after deploy

The canonical URL is set to **`mostofahabibfardin.com`** as a placeholder. After you
register your domain, find-and-replace `mostofahabibfardin.com` across `index.html`,
`sitemap.xml`, and `robots.txt`.

To enable analytics: sign up at [plausible.io](https://plausible.io), add your domain,
then uncomment the one `<script>` line near the bottom of `<head>` in `index.html`.

## Editing content

All content is plain HTML in `index.html`, organized by sheet
(`<!-- ============ SHEET 0X — NAME ============ -->`). Colors and fonts live at the
top of `css/styles.css` as CSS custom properties. After adding an image, run
`build-images.mjs` then `build-html.mjs` to generate its next-gen formats and wrap it.
