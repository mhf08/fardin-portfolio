// Wraps every <img src="assets/img/*.jpg"> in index.html with a <picture> that
// offers AVIF and WebP before the JPEG fallback. Idempotent — safe to re-run
// after editing markup (skips imgs already inside a <picture>).
//
// Run from repo root:  node tools/build-html.mjs

import { readFileSync, writeFileSync } from "node:fs";

const FILE = "index.html";
let html = readFileSync(FILE, "utf8");

const imgRe = /([ \t]*)(<img\b[^>]*\bsrc="(assets\/img\/[^"]+)\.jpg"[^>]*>)/g;
let wrapped = 0;

html = html.replace(imgRe, (match, indent, imgTag, base, offset, full) => {
  // Idempotency guard: if the lines just above already declare the webp source,
  // this img is already wrapped — leave it untouched.
  const before = full.slice(Math.max(0, offset - 200), offset);
  if (before.includes("image/webp")) return match;

  wrapped++;
  return (
    `${indent}<picture>\n` +
    `${indent}  <source type="image/avif" srcset="${base}.avif">\n` +
    `${indent}  <source type="image/webp" srcset="${base}.webp">\n` +
    `${indent}  ${imgTag}\n` +
    `${indent}</picture>`
  );
});

writeFileSync(FILE, html);
console.log(`Wrapped ${wrapped} <img> tags in <picture>.`);
