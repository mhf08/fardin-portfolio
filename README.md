# Mostofa Habib Fardin — Portfolio ("The Drawing Set")

A zero-dependency static portfolio. No framework, no runtime build — just HTML, CSS,
and a little JS. Two optional Node scripts regenerate the image and markup assets.

## Files

```
index.html            the whole site (9 numbered "sheets") — the deploy artifact
404.html              error page
sitemap.xml           single-URL sitemap
robots.txt            allow-all + sitemap pointer
llms.txt              summary for AI assistants that index/cite the site
vercel.json           CSP + security + caching headers (Vercel)
css/styles.css        design system + all styles + @font-face
js/theme-init.js      pre-paint theme pick (external so CSP needs no unsafe-inline)
js/main.js            ruler, scroll-spy, carousels, transitions, lightbox, cursor, HUD
favicon-v2.png        original favicon
assets/
  fonts/              self-hosted woff2 (Fraunces, Inter, IBM Plex Mono — latin subset)
  img/                images as .jpg + .avif + .webp siblings (see pipeline below)
  resume.pdf, og.jpg
tools/
  build-assets.ps1    (1) compress source images from the old site → assets/img/*.jpg
  build-images.mjs    (2) emit .avif/.webp + an 800px tier next to every assets/img/*.jpg
  build-html.mjs      (3) wrap every <img> in <picture> with avif/webp sources
  build-srcset.mjs    (4) add the 800w tier + sizes to every <picture> (responsive)
  build-og.mjs        regenerates the social-share card (assets/og.jpg)
DESIGN.md             the design brief (Pass 1 + Pass 2 critique)
```

## Run locally

```powershell
npx -y serve -l 4173 .
# open http://localhost:4173/
```

## Asset pipeline (only re-run when images change)

```powershell
# from the repo root
powershell -ExecutionPolicy Bypass -File tools/build-assets.ps1   # source JPEGs (uses old site as source)
node tools/build-images.mjs                                       # AVIF/WebP + 800px tiers
node tools/build-html.mjs                                         # wrap new <img> in <picture> (idempotent)
node tools/build-srcset.mjs                                       # add responsive srcset (idempotent)
```

The lightbox upgrades its full-size fetches to AVIF/WebP automatically (with a JPEG
fallback), so no markup changes are needed there.

`build-images.mjs` and `build-html.mjs` need Node + `sharp`. Sharp is resolved from
this folder or, failing that, the old React site's `node_modules`.

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
