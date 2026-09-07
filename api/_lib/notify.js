/* Optional email ping when someone posts.

   Deliberately optional. Reliable sending needs a verified domain, and the
   custom domain is still an open item (ROADMAP 05-D). So: if RESEND_API_KEY
   and NOTIFY_EMAIL are not set, this does nothing at all and the board works
   exactly as before. Set them later and notifications simply start.

   Nothing here can fail a post. The caller does not await it, and every error
   is swallowed to the log — a student's question must never be lost because a
   mail provider had a bad minute. */

const ENDPOINT = "https://api.resend.com/emails";

export function notify({ course, kind, who, text, url }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  // Say why nothing was sent. Silence is correct behaviour when alerts are not
  // configured, but silence with no explanation is impossible to debug from a
  // dashboard, which is the only place he can look.
  if (!key || !to) {
    console.log(
      "notify: skipped, " +
        (!key && !to ? "RESEND_API_KEY and NOTIFY_EMAIL are both unset" :
         !key ? "RESEND_API_KEY is unset" : "NOTIFY_EMAIL is unset")
    );
    return;
  }

  // Until a custom domain is verified, Resend only delivers from its own
  // onboarding sender, and only to the address that owns the account. That is
  // exactly this case: one recipient, himself.
  const from = process.env.NOTIFY_FROM || "Course board <onboarding@resend.dev>";
  const subject = `${course}: new ${kind}${who ? " from " + who : ""}`;
  const preview = text.length > 600 ? text.slice(0, 600) + "..." : text;
  const esc = (v) =>
    String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* A text-only body is scored slightly more harshly by spam filters, and on a
     phone the board link is only tappable as a real anchor. Sending both parts
     costs nothing and fixes both. The student's words are escaped: they are
     untrusted input and this is now markup. */
  const html =
    `<div style="font:15px/1.55 -apple-system,Segoe UI,sans-serif;color:#1C1A1B">` +
    (who ? `<p style="margin:0 0 12px;color:#5E5658">${esc(who)}</p>` : "") +
    `<p style="margin:0 0 20px;white-space:pre-wrap">${esc(preview)}</p>` +
    `<p style="margin:0"><a href="${esc(url)}" style="color:#A10F26">Open the ${esc(course)} board</a></p>` +
    `</div>`;

  fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: `${who ? who + "\n\n" : ""}${preview}\n\n---\nOpen the board: ${url}`,
      html,
    }),
  })
    .then(async (r) => {
      if (r.ok) {
        console.log(`notify: sent to ${to}`);
        return;
      }
      // Resend's own message is the useful part: an unverified domain, a key
      // without send permission, or a recipient it refuses to deliver to all
      // say so here, and none of them are guessable from the outside.
      const detail = await r.text().catch(() => "");
      console.error(`notify: Resend returned ${r.status} — ${detail.slice(0, 400)}`);
    })
    .catch((err) => console.error("notify: request failed —", err));
}
