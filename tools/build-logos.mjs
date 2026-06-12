// Pulls the institution crests from the old site, downscales them, and writes
// transparent webp + png into assets/img/logos/. Run from repo root:
//   node tools/build-logos.mjs

import { mkdirSync, statSync } from "node:fs";
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

const SRC = "D:/Website Content/Portfolio Site/Site-Rebuild/attached_assets";
const OUT = "assets/img/logos";
mkdirSync(OUT, { recursive: true });

const jobs = [
  { src: `${SRC}/buet-seeklogo_1776505671675.png`, out: "buet" },
  { src: `${SRC}/Notre_Dame_College,_Dhaka_Monogram.svg_1776505694867.png`, out: "notre-dame" },
];

for (const j of jobs) {
  const base = sharp(j.src).resize({ width: 128, withoutEnlargement: true });
  await base.clone().png({ compressionLevel: 9, palette: true }).toFile(`${OUT}/${j.out}.png`);
  await base.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}/${j.out}.webp`);
  const kb = (f) => Math.round(statSync(`${OUT}/${j.out}.${f}`).size / 1024);
  console.log(`${j.out}: png ${kb("png")} KB, webp ${kb("webp")} KB`);
}
