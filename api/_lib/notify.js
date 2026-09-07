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
  if (!key || !to) return;

  // Until a custom domain is verified, Resend only delivers from its own
  // onboarding sender, and only to the address that owns the account. That is
  // exactly this case: one recipient, himself.
  const from = process.env.NOTIFY_FROM || "Course board <onboarding@resend.dev>";
  const subject = `${course}: new ${kind}${who ? " from " + who : ""}`;
  const preview = text.length > 600 ? text.slice(0, 600) + "..." : text;

  fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text: `${preview}\n\n---\nOpen the board: ${url}`,
    }),
  }).catch((err) => console.error("notify:", err));
}
