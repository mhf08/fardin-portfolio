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
let done = 0, tiers = 0, savedJpg = 0, sumAvif = 0, sumWebp = 0;

await Promise.all(files.map(async (src) => {
  // skip already-generated tier files on re-runs
  if (/-800\.jpg$/i.test(src)) return;
  const base = src.replace(/\.jpg$/i, "");
  const input = sharp(src);

  await input.clone().avif({ quality: 52, effort: 6 }).toFile(base + ".avif");
  await input.clone().webp({ quality: 78, effort: 5 }).toFile(base + ".webp");

  // 800px-wide tier for small viewports (only where it actually saves)
  const meta = await input.metadata();
  if (meta.width > 900) {
    await input.clone().resize({ width: 800 }).avif({ quality: 52, effort: 6 }).toFile(base + "-800.avif");
    await input.clone().resize({ width: 800 }).webp({ quality: 78, effort: 5 }).toFile(base + "-800.webp");
    tiers++;
  }

  savedJpg += statSync(src).size;
  sumAvif += statSync(base + ".avif").size;
  sumWebp += statSync(base + ".webp").size;
  done++;
}));

const mb = (n) => (n / 1048576).toFixed(2) + " MB";
console.log(`Encoded ${done} images (${tiers} with an 800px tier).`);
console.log(`  JPEG total : ${mb(savedJpg)}`);
console.log(`  WebP total : ${mb(sumWebp)}`);
console.log(`  AVIF total : ${mb(sumAvif)}`);
