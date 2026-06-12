// Generates AVIF + WebP siblings for every JPEG under assets/img/.
// Same dimensions as the source JPEG, so the <img width/height> stays valid
// (zero CLS) while modern browsers fetch the far smaller next-gen format.
//
// Run from the repo root:  node tools/build-images.mjs
// Requires sharp. We borrow the install from the old React site if needed.

import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { createRequire } from "node:module";

// sharp may live in this project or in the old site — resolve from either.
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

const ROOT = join(process.cwd(), "assets", "img");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (extname(p).toLowerCase() === ".jpg") out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let done = 0, savedJpg = 0, sumAvif = 0, sumWebp = 0;

await Promise.all(files.map(async (src) => {
  const avif = src.replace(/\.jpg$/i, ".avif");
  const webp = src.replace(/\.jpg$/i, ".webp");
  const input = sharp(src);

  await input.clone().avif({ quality: 52, effort: 6 }).toFile(avif);
  await input.clone().webp({ quality: 78, effort: 5 }).toFile(webp);

  savedJpg += statSync(src).size;
  sumAvif += statSync(avif).size;
  sumWebp += statSync(webp).size;
  done++;
}));

const mb = (n) => (n / 1048576).toFixed(2) + " MB";
console.log(`Encoded ${done} images.`);
console.log(`  JPEG total : ${mb(savedJpg)}`);
console.log(`  WebP total : ${mb(sumWebp)}`);
console.log(`  AVIF total : ${mb(sumAvif)}`);
