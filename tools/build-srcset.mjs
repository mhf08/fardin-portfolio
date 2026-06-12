// Upgrades every <picture> in index.html to a responsive srcset:
// adds the 800px tier (where build-images.mjs produced one) plus a sizes hint,
// so phones stop downloading 1600px images. Idempotent — skips pictures
// that already carry a "800w" descriptor.
//
// Run from repo root, AFTER build-images.mjs:  node tools/build-srcset.mjs

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const FILE = "index.html";
let html = readFileSync(FILE, "utf8");
let upgraded = 0;

html = html.replace(/<picture>([\s\S]*?)<\/picture>/g, (block, inner) => {
  if (inner.includes(" 800w,")) return block; // already responsive

  const base = (inner.match(/srcset="(assets\/img\/[^"]+)\.avif"/) || [])[1];
  const width = parseInt((inner.match(/\bwidth="(\d+)"/) || [])[1], 10);
  if (!base || !width) return block;
  if (!existsSync(base + "-800.avif")) return block; // no tier (image ≤900px wide)

  // The hero spans the viewport; everything else renders at ~half width on
  // desktop and near-full width on phones.
  const sizes = base.includes("hero") ? "100vw" : "(max-width: 880px) 92vw, 48vw";

  let out = block.replace(
    `srcset="${base}.avif"`,
    `srcset="${base}-800.avif 800w, ${base}.avif ${width}w" sizes="${sizes}"`
  );
  out = out.replace(
    `srcset="${base}.webp"`,
    `srcset="${base}-800.webp 800w, ${base}.webp ${width}w" sizes="${sizes}"`
  );
  upgraded++;
  return out;
});

writeFileSync(FILE, html);
console.log(`Upgraded ${upgraded} pictures to responsive srcset.`);
