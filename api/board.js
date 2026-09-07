/* GET  /api/board?course=IPE%20331&sort=new|top   -> the thread list
   POST /api/board                                  -> ask a question or answer one

   Same-origin only. Reached from /teaching/questions/, which is why no CSP
   change was needed anywhere: connect-src 'self' already permits it. */

import { db, overRateLimit, isDuplicate } from "./_lib/db.js";
import { notify } from "./_lib/notify.js";
import {
  identify, handleFor, isAdmin, json, fail, sameOrigin, body,
  clean, checkBody, COURSE_RE, LIMITS,
} from "./_lib/util.js";

const MAX_QUESTIONS = 120;

function shape(row, me, votedSet) {
  return {
    id: Number(row.id),
    body: row.body,
    who: row.display_name || handleFor(row.author_hash),
    named: Boolean(row.display_name),
    instructor: row.is_instructor,
    votes: Number(row.votes),
    voted: votedSet.has(Number(row.id)),
    mine: row.author_hash === me.hash,
    at: row.created_at,
  };
}

async function list(req, res, me, admin) {
  const course = String(req.query.course || "").trim();
  if (!COURSE_RE.test(course)) return fail(res, 400, "Unknown course.");
  const top = req.query.sort === "top";

  const sql = await db();

  const questions = top
    ? await sql`
        SELECT * FROM board_posts
        WHERE course = ${course} AND parent_id IS NULL AND deleted_at IS NULL
        ORDER BY votes DESC, created_at DESC LIMIT ${MAX_QUESTIONS}`
    : await sql`
        SELECT * FROM board_posts
        WHERE course = ${course} AND parent_id IS NULL AND deleted_at IS NULL
        ORDER BY created_at DESC LIMIT ${MAX_QUESTIONS}`;

  const ids = questions.map((q) => Number(q.id));
  let answers = [];
  let voted = [];
  if (ids.length) {
    answers = await sql`
      SELECT * FROM board_posts
      WHERE parent_id = ANY(${ids}) AND deleted_at IS NULL
      ORDER BY is_instructor DESC, votes DESC, created_at ASC`;
    voted = await sql`
      SELECT post_id FROM board_votes WHERE voter = ${me.hash} AND post_id = ANY(${ids})`;
  }

  const votedSet = new Set(voted.map((v) => Number(v.post_id)));
  const byParent = new Map();
  for (const a of answers) {
    const key = Number(a.parent_id);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(shape(a, me, votedSet));
  }

  json(res, 200, {
    ok: true,
    admin,
    me: handleFor(me.hash),
    limits: LIMITS,
    questions: questions.map((q) => ({
      ...shape(q, me, votedSet),
      answers: byParent.get(Number(q.id)) || [],
    })),
  });
}

async function create(req, res, me, admin) {
  if (!sameOrigin(req)) return fail(res, 403, "Blocked.");

  const input = await body(req);

  // Honeypot. A real person never sees this field, so anything in it is a bot.
  if (clean(input.website, 200)) return json(res, 200, { ok: true, id: null });

  // Bots post instantly. People take a few seconds to type. Client-supplied and
  // therefore trivially forged, which is fine: it is the cheapest of several
  // filters, not the one doing the work.
  if (!admin && Number(input.elapsed) < 3000) {
    return fail(res, 429, "That was quick. Give it a moment and send again.");
  }

  const course = String(input.course || "").trim();
  if (!COURSE_RE.test(course)) return fail(res, 400, "Unknown course.");

  const parentId = input.parent == null ? null : Number(input.parent);
  if (parentId !== null && !Number.isInteger(parentId)) return fail(res, 400, "Unknown question.");

  const kind = parentId === null ? "question" : "answer";
  const text = clean(input.body, LIMITS[kind].max);
  const problem = checkBody(text, kind, admin);
  if (problem) return fail(res, 400, problem);

  const name = admin ? null : clean(input.name, LIMITS.name) || null;

  const sql = await db();

  if (!admin) {
    const limited = await overRateLimit(sql, me.hash);
    if (limited) return fail(res, 429, limited);
    if (await isDuplicate(sql, me.hash, text)) {
      return fail(res, 409, "You already posted that.");
    }
  }

  if (parentId !== null) {
    const [parent] = await sql`
      SELECT id FROM board_posts
      WHERE id = ${parentId} AND course = ${course}
        AND parent_id IS NULL AND deleted_at IS NULL`;
    if (!parent) return fail(res, 404, "That question is no longer there.");
  }

  const [row] = await sql`
    INSERT INTO board_posts (course, parent_id, body, display_name, author_hash, is_instructor)
    VALUES (${course}, ${parentId}, ${text}, ${name}, ${me.hash}, ${admin})
    RETURNING id`;

  // Not awaited on purpose: the student's confirmation should not wait on a
  // mail provider, and a failed email must never fail a post.
  if (!admin) {
    notify({
      course,
      kind,
      text,
      url: `https://${req.headers.host}/teaching/questions/?c=${encodeURIComponent(course)}`,
    });
  }

  json(res, 200, { ok: true, id: Number(row.id) });
}

export default async function handler(req, res) {
  try {
    const me = identify(req, res);
    const admin = isAdmin(req);
    if (req.method === "GET") return await list(req, res, me, admin);
    if (req.method === "POST") return await create(req, res, me, admin);
    res.setHeader("Allow", "GET, POST");
    return fail(res, 405, "Method not allowed.");
  } catch (err) {
    console.error("board:", err);
    return fail(res, 500, "The question board is having a moment. Try again shortly.");
  }
}
