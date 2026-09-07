/* Shared helpers for the course Q&A board's /api/ functions.
   Files and folders under api/ whose name starts with "_" are not routed by
   Vercel, so this is a private module, not an endpoint. */

import crypto from "node:crypto";

/* ---------- secrets ---------------------------------------------------- */

/* ADMIN_SECRET does double duty: it is the password Fardin types to log in,
   and the key used to sign the admin cookie and to hash identifiers. Reusing
   it saves him configuring a second env var. It never leaves the server. */
function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SECRET is missing or shorter than 16 characters.");
  }
  return s;
}

export function hmac(value) {
  return crypto.createHmac("sha256", secret()).update(String(value)).digest("hex");
}

/* Timing-safe compare that does not leak length. */
function sameHex(a, b) {
  const x = Buffer.from(String(a || ""), "utf8");
  const y = Buffer.from(String(b || ""), "utf8");
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

/* ---------- cookies ---------------------------------------------------- */

export function cookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const YEAR = 60 * 60 * 24 * 365;

function setCookie(res, name, value, maxAge) {
  const bits = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  const prev = res.getHeader("Set-Cookie");
  const list = prev ? (Array.isArray(prev) ? prev.slice() : [prev]) : [];
  list.push(bits.join("; "));
  res.setHeader("Set-Cookie", list);
}

/* ---------- who is this ------------------------------------------------ */

/* A per-browser marker, separate from who the student says they are. It is what
   "delete your own post", one-vote-per-person and the rate limits key off, so
   those keep working without trusting anything the student typed. The raw id
   lives in an HttpOnly cookie and never reaches the page; only its hash is
   stored, so the database holds nothing replayable. */
export function identify(req, res) {
  const jar = cookies(req);
  let id = jar.mhfq_id;
  if (!id || !/^[a-f0-9]{32}$/.test(id)) {
    id = crypto.randomBytes(16).toString("hex");
    setCookie(res, "mhfq_id", id, YEAR * 2);
  }
  return { id, hash: hmac("who:" + id) };
}

/* ---------- admin ------------------------------------------------------ */

const ADMIN_DAYS = 45;

export function adminCookie() {
  const ts = Date.now();
  return `${ts}.${hmac("admin:" + ts)}`;
}

export function isAdmin(req) {
  const raw = cookies(req).mhfq_admin;
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return false;
  const ts = raw.slice(0, dot);
  if (!/^\d{10,16}$/.test(ts)) return false;
  if (Date.now() - Number(ts) > ADMIN_DAYS * 24 * 60 * 60 * 1000) return false;
  return sameHex(raw.slice(dot + 1), hmac("admin:" + ts));
}

export function checkPassword(supplied) {
  return sameHex(hmac("pw:" + String(supplied || "")), hmac("pw:" + secret()));
}

export function grantAdmin(res) {
  setCookie(res, "mhfq_admin", adminCookie(), 60 * 60 * 24 * ADMIN_DAYS);
}

export function revokeAdmin(res) {
  setCookie(res, "mhfq_admin", "", 0);
}

/* ---------- request plumbing ------------------------------------------- */

export function json(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).send(JSON.stringify(payload));
}

export function fail(res, status, message) {
  json(res, status, { ok: false, error: message });
}

/* Cookies carry the identity, so a cross-site POST would be a CSRF vector.
   SameSite=Lax already blocks it in current browsers; this is the second lock.
   Same-origin requests from the board send an Origin header that matches. */
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser or same-origin navigation
  try {
    return new URL(origin).host === String(req.headers.host || "");
  } catch {
    return false;
  }
}

export async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) throw new Error("Request body too large.");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Could not read that request.");
  }
}

/* ---------- content rules ---------------------------------------------- */

/* Course codes are validated by shape rather than against courses.json. That
   file is data the CMS rewrites; binding the API to it would mean a code
   change every time a course is added, and a bundling step to make the JSON
   readable from a function. The shape check rejects junk, and the board only
   ever links boards for courses that actually exist. */
export const COURSE_RE = /^[A-Z]{2,4} \d{3}$/;

export const LIMITS = {
  question: { min: 10, max: 1500 },
  answer: { min: 2, max: 4000 },
  name: { min: 3, max: 60 },
  studentId: 12,
};

/* BUET roll numbers are seven digits. This checks the shape, not the truth of
   it: nothing stops a student typing a classmate's number. It is attestation,
   which is enough when the person reading every post already knows the class by
   name. Real verification is the roster in ./roster.js, which is empty for now
   and can be filled in later without touching this code. */
export const STUDENT_ID_RE = /^\d{7}$/;

export function checkIdentity(name, studentId) {
  if (name.length < LIMITS.name.min) return "Please give your full name.";
  if (name.length > LIMITS.name.max) return "That name is too long.";
  if (!/[A-Za-z]/.test(name)) return "Please give your name, not just numbers.";
  if (!STUDENT_ID_RE.test(studentId)) return "Student ID should be your 7-digit roll number.";
  return null;
}

const LINK_RE = /(https?:\/\/|www\.)/i;

/* Normalise whitespace but keep paragraph breaks: students write in bursts on
   a phone and a wall of collapsed text is unreadable. */
export function clean(s, max) {
  return String(s == null ? "" : s)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function checkBody(text, kind, admin) {
  const limit = LIMITS[kind];
  if (text.length < limit.min) return `That is too short. Please write at least ${limit.min} characters.`;
  if (text.length > limit.max) return `That is too long. Keep it under ${limit.max} characters.`;
  // Fardin needs to be able to link a slide deck; nobody else needs links, and
  // banning them removes the only thing spam is ever actually for.
  if (!admin && LINK_RE.test(text)) return "Links are not allowed here. Describe it in words instead.";
  if (!admin && /(.)\1{20,}/.test(text)) return "That looks like keyboard mashing rather than a question.";
  return null;
}
