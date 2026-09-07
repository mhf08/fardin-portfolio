/* POST /api/moderate  { action: "login" | "logout" | "delete", ... }

   There is no separate admin page. Fardin logs in on the board itself, and the
   delete controls appear inline next to every post. He moderates in context, on
   his phone, in the same view the students see — which is the only version of
   this he will actually use. */

import { db } from "./_lib/db.js";
import {
  identify, isAdmin, checkPassword, grantAdmin, revokeAdmin,
  json, fail, sameOrigin, body,
} from "./_lib/util.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return fail(res, 405, "Method not allowed.");
    }
    if (!sameOrigin(req)) return fail(res, 403, "Blocked.");

    const me = identify(req, res);
    const input = await body(req);
    const action = String(input.action || "");

    if (action === "login") {
      // A wrong password costs a second. Brute-forcing a long random secret
      // through a rate like that is not a threat worth more machinery.
      await new Promise((r) => setTimeout(r, 1000));
      if (!checkPassword(input.password)) return fail(res, 401, "Wrong password.");
      grantAdmin(res);
      return json(res, 200, { ok: true, admin: true });
    }

    if (action === "logout") {
      revokeAdmin(res);
      return json(res, 200, { ok: true, admin: false });
    }

    if (action === "delete") {
      const id = Number(input.id);
      if (!Number.isInteger(id)) return fail(res, 400, "Unknown post.");

      const sql = await db();
      const [post] = await sql`
        SELECT id, author_hash FROM board_posts WHERE id = ${id} AND deleted_at IS NULL`;
      if (!post) return json(res, 200, { ok: true });

      // Fardin can remove anything. Anyone else can remove only their own post,
      // which is the difference between moderation and censorship.
      const admin = isAdmin(req);
      if (!admin && post.author_hash !== me.hash) return fail(res, 403, "Not yours to delete.");

      // Soft delete: the row stays, so a deletion is reversible in the database
      // if something is ever removed by mistake or in anger.
      await sql`UPDATE board_posts SET deleted_at = now() WHERE id = ${id}`;
      return json(res, 200, { ok: true });
    }

    return fail(res, 400, "Unknown action.");
  } catch (err) {
    console.error("moderate:", err);
    fail(res, 500, "Could not do that just now.");
  }
}
