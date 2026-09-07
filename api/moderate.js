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

      const admin = isAdmin(req);
      const sql = await db();
      const [post] = await sql`
        SELECT id, author_hash FROM board_posts WHERE id = ${id} AND deleted_at IS NULL`;

      /* Fardin can remove anything; everyone else only what they wrote. Nobody
         can touch another person's post, which is what "not public" means here.
         Retraction matters more now that posts carry a real name: a student who
         regrets one should not have to email to get it taken down.

         A missing row answers exactly as a forbidden one does, so the endpoint
         cannot be used to find out which ids exist. Only Fardin, who may delete
         anything anyway, gets told that the row was simply not there. */
      const denied = () => fail(res, 403, "You can only delete your own post.");
      if (!post) return admin ? json(res, 200, { ok: true }) : denied();
      if (!admin && post.author_hash !== me.hash) return denied();

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
