# Mostofa Habib Fardin — Portfolio ("The Drawing Set")

A zero-dependency static portfolio. No framework, no runtime build — just HTML, CSS,
and a little JS. Two optional Node scripts regenerate the image and markup assets.

## Files

```
index.html            the whole site (9 numbered "sheets") — the deploy artifact
404.html              error page
sitemap.xml           single-URL sitemap
robots.txt            allow-all + sitemap pointer
_headers              caching + security headers (Netlify / Cloudflare Pages)
css/styles.css        design system + all styles + @font-face
js/main.js            theme, ruler, scroll-spy, carousels, wipe transitions, lightbox
favicon-v2.png        original favicon
favicon.svg           registration-mark favicon (fallback)
assets/
  fonts/              self-hosted woff2 (Fraunces, Inter, IBM Plex Mono — latin subset)
  img/                images as .jpg + .avif + .webp siblings (see pipeline below)
  resume.pdf, og.jpg
tools/
  build-assets.ps1    (1) compress source images from the old site → assets/img/*.jpg
  build-images.mjs    (2) emit .avif + .webp next to every assets/img/*.jpg
  build-html.mjs      (3) wrap every <img> in <picture> with avif/webp sources
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
node tools/build-images.mjs                                       # AVIF + WebP variants
node tools/build-html.mjs                                         # wrap new <img> in <picture> (idempotent)
```

`build-images.mjs` and `build-html.mjs` need Node + `sharp`. Sharp is resolved from
this folder or, failing that, the old React site's `node_modules`.

## Deploy

Drag the `fardin-portfolio` folder into **Netlify Drop** or **Cloudflare Pages**
(both honor `_headers` and auto-use `404.html`). No build command, no publish
sub-directory — the folder *is* the site. Vercel works too; port `_headers` to
`vercel.json`.

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
