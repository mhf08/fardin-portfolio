/* POST /api/vote  { id }  -> toggle "I have this question too"

   Deduplicated by the anonymous per-browser cookie. That is defeatable by
   anyone who clears cookies, and deliberately so: the number exists to tell
   Fardin which topics to re-teach, not to decide anything. Hardening it would
   cost real privacy for no real gain. */

import { db } from "./_lib/db.js";
import { identify, json, fail, sameOrigin, body } from "./_lib/util.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return fail(res, 405, "Method not allowed.");
    }
    if (!sameOrigin(req)) return fail(res, 403, "Blocked.");

    const me = identify(req, res);
    const id = Number((await body(req)).id);
    if (!Number.isInteger(id)) return fail(res, 400, "Unknown question.");

    const sql = await db();

    const [post] = await sql`
      SELECT id FROM board_posts WHERE id = ${id} AND deleted_at IS NULL`;
    if (!post) return fail(res, 404, "That question is no longer there.");

    const added = await sql`
      INSERT INTO board_votes (post_id, voter) VALUES (${id}, ${me.hash})
      ON CONFLICT DO NOTHING RETURNING post_id`;
    if (!added.length) {
      await sql`DELETE FROM board_votes WHERE post_id = ${id} AND voter = ${me.hash}`;
    }

    // Recount rather than increment, so the number cannot drift out of step
    // with the rows that justify it.
    const [row] = await sql`
      UPDATE board_posts
      SET votes = (SELECT count(*) FROM board_votes WHERE post_id = ${id})
      WHERE id = ${id}
      RETURNING votes`;

    json(res, 200, { ok: true, votes: Number(row.votes), voted: Boolean(added.length) });
  } catch (err) {
    console.error("vote:", err);
    fail(res, 500, "Could not register that just now.");
  }
}
