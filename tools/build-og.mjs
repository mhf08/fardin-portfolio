// Renders the social-share card (assets/og.jpg, 1200×630) as a Drawing Set
// title block. Uses system fonts (Georgia/Consolas) so sharp can rasterize
// the SVG on Windows without font bundling.
//
// Run from repo root:  node tools/build-og.mjs

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let sharp;
for (const base of [
  process.cwd(),
  "D:/Website Content/Portfolio Site/Site-Rebuild/artifacts/personal-website",
]) {
  try { sharp = require(require.resolve("sharp", { paths: [base] })); break; }
  catch { /* try next */ }
}
if (!sharp) { console.error("sharp not found"); process.exit(1); }

const paper = "#F3EFE6", ink = "#1F221C", brass = "#9C6B1E", bright = "#C8922E", soft = "#5C594E";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${paper}"/>

  <!-- double drawing frame -->
  <rect x="22" y="22" width="1156" height="586" fill="none" stroke="${ink}" stroke-width="3"/>
  <rect x="34" y="34" width="1132" height="562" fill="none" stroke="${ink}" stroke-width="1" opacity="0.55"/>

  <!-- registration mark, top right -->
  <g stroke="${bright}" stroke-width="2.5" fill="none">
    <circle cx="1090" cy="110" r="26"/>
    <line x1="1090" y1="64"  x2="1090" y2="92"/>
    <line x1="1090" y1="128" x2="1090" y2="156"/>
    <line x1="1044" y1="110" x2="1072" y2="110"/>
    <line x1="1108" y1="110" x2="1136" y2="110"/>
  </g>
  <circle cx="1090" cy="110" r="5" fill="${ink}"/>

  <!-- eyebrow -->
  <text x="80" y="178" font-family="Consolas, monospace" font-size="22" letter-spacing="6"
        fill="${brass}">RESEARCH &#183; TEACHING &#183; INDUSTRIAL &amp; PRODUCTION ENGINEERING</text>

  <!-- name -->
  <text x="76" y="290" font-family="Georgia, serif" font-size="88" font-weight="bold"
        fill="${ink}">Mostofa Habib Fardin</text>

  <!-- role -->
  <text x="80" y="352" font-family="Georgia, serif" font-size="34" font-style="italic"
        fill="${brass}">Lecturer &amp; Researcher, BUET</text>

  <!-- title block -->
  <line x1="34" y1="468" x2="1166" y2="468" stroke="${ink}" stroke-width="2"/>
  <line x1="430" y1="468" x2="430" y2="596" stroke="${ink}" stroke-width="1" opacity="0.55"/>
  <line x1="650" y1="468" x2="650" y2="596" stroke="${ink}" stroke-width="1" opacity="0.55"/>
  <line x1="850" y1="468" x2="850" y2="596" stroke="${ink}" stroke-width="1" opacity="0.55"/>

  <text x="64" y="514" font-family="Consolas, monospace" font-size="17" letter-spacing="4" fill="${soft}">DRAWN BY</text>
  <text x="64" y="556" font-family="Georgia, serif" font-size="27" fill="${ink}">Mostofa Habib Fardin</text>

  <text x="460" y="514" font-family="Consolas, monospace" font-size="17" letter-spacing="4" fill="${soft}">SHEET</text>
  <text x="460" y="556" font-family="Georgia, serif" font-size="27" fill="${ink}">01 of 09</text>

  <text x="680" y="514" font-family="Consolas, monospace" font-size="17" letter-spacing="4" fill="${soft}">REV</text>
  <text x="680" y="556" font-family="Georgia, serif" font-size="27" fill="${ink}">2026.07</text>

  <text x="880" y="514" font-family="Consolas, monospace" font-size="17" letter-spacing="4" fill="${soft}">STATUS</text>
  <circle cx="891" cy="548" r="7" fill="${bright}"/>
  <text x="908" y="556" font-family="Georgia, serif" font-size="25" fill="${ink}">Open to research</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile("assets/og.jpg");
const meta = await sharp("assets/og.jpg").metadata();
console.log(`og.jpg written: ${meta.width}x${meta.height}`);
