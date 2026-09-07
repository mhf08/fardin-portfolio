/* Neon Postgres access for the Q&A board.

   Two deliberate choices worth knowing before changing anything here:

   1. The schema creates itself. Fardin cannot run migrations, so the tables are
      created on first use with CREATE TABLE IF NOT EXISTS. It costs a few
      milliseconds once per cold start and removes a whole class of "it works on
      my machine" from his life.
   2. Vote counts are RECOMPUTED from board_votes rather than incremented. A
      counter that drifts is a counter nobody trusts; recomputing is self-healing
      and, at this volume, free. */

import { neon } from "@neondatabase/serverless";

let client = null;
let ready = null;

/* Vercel's Neon integration lets you put a custom prefix on the environment
   variables it creates, so the connection string can arrive as DATABASE_URL,
   POSTGRES_URL, STORAGE_DATABASE_URL or anything else someone typed into that
   box. Rather than make the setup depend on getting a text field exactly right,
   look for the usual names first and then fall back to any variable that
   actually holds a Postgres URL. Pooled connections are preferred: these are
   serverless functions, and each one is short-lived. */
const PREFERRED = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
];

function isPostgresUrl(value) {
  return typeof value === "string" && /^postgres(ql)?:\/\//.test(value);
}

export function findConnectionString(env = process.env) {
  for (const name of PREFERRED) {
    if (isPostgresUrl(env[name])) return { name, url: env[name] };
  }
  // Any prefixed variant, e.g. STORAGE_DATABASE_URL. Sorted so the choice is
  // deterministic rather than dependent on environment ordering, and unpooled
  // variants sort after their pooled siblings by name length.
  const found = Object.keys(env)
    .filter((name) => /(DATABASE|POSTGRES|PG)_/.test(name) && isPostgresUrl(env[name]))
    .sort((a, b) => a.length - b.length || a.localeCompare(b))[0];
  return found ? { name: found, url: env[found] } : null;
}

function connect() {
  if (client) return client;
  const found = findConnectionString();
  if (!found) {
    throw new Error(
      "No Postgres connection string found in the environment. Create the Neon " +
        "database from the Vercel dashboard (Storage -> Neon), connect it to this " +
        "project, and redeploy so the variables are picked up."
    );
  }
  // Logged once per cold start so it is obvious in Vercel's logs which variable
  // was used, if the custom prefix ever causes a surprise.
  console.log("db: using connection string from " + found.name);
  client = neon(found.url);
  return client;
}

async function migrate(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS board_posts (
      id            BIGSERIAL PRIMARY KEY,
      course        TEXT        NOT NULL,
      parent_id     BIGINT      REFERENCES board_posts(id) ON DELETE CASCADE,
      title         TEXT,
      body          TEXT        NOT NULL,
      display_name  TEXT,
      author_hash   TEXT        NOT NULL,
      is_instructor BOOLEAN     NOT NULL DEFAULT FALSE,
      votes         INTEGER     NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      deleted_at    TIMESTAMPTZ
    )`;
  /* The table already exists in production, created on the first request before
     names were required, so new columns are added rather than declared above.
     ADD COLUMN IF NOT EXISTS makes this safe to run on every cold start and
     safe on a fresh database too. */
  await sql`ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS student_id TEXT`;
  await sql`ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE`;

  await sql`
    CREATE TABLE IF NOT EXISTS board_votes (
      post_id BIGINT NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
      voter   TEXT   NOT NULL,
      PRIMARY KEY (post_id, voter)
    )`;
  await sql`
    CREATE INDEX IF NOT EXISTS board_posts_thread_idx
      ON board_posts (course, parent_id, created_at DESC)`;
  await sql`
    CREATE INDEX IF NOT EXISTS board_posts_rate_idx
      ON board_posts (author_hash, created_at DESC)`;
}

export async function db() {
  const sql = connect();
  if (!ready) {
    // On failure, clear the cached promise so the next request retries rather
    // than inheriting a permanently rejected one for the life of the instance.
    ready = migrate(sql).catch((err) => {
      ready = null;
      throw err;
    });
  }
  await ready;
  return sql;
}

/* ---------- rate limiting ---------------------------------------------- */

/* No CAPTCHA is possible under this site's CSP, and none is needed: posts are
   cheap to delete and the board is not indexed. These caps exist to stop a
   script, not to police enthusiasm. A student asking four questions in ten
   minutes before an exam is the behaviour we want, so the short window is
   generous and the daily cap does the real work. */
export const RATE = { burst: 4, burstMinutes: 10, daily: 25 };

export async function overRateLimit(sql, authorHash) {
  const [row] = await sql`
    SELECT
      count(*) FILTER (WHERE created_at > now() - interval '10 minutes') AS burst,
      count(*) FILTER (WHERE created_at > now() - interval '24 hours')   AS daily
    FROM board_posts
    WHERE author_hash = ${authorHash}`;
  if (Number(row.burst) >= RATE.burst) {
    return `That is ${RATE.burst} posts in ${RATE.burstMinutes} minutes. Give it a few minutes.`;
  }
  if (Number(row.daily) >= RATE.daily) {
    return "That is a lot of posts today. Try again tomorrow, or email me.";
  }
  return null;
}

export async function isDuplicate(sql, authorHash, text) {
  const [row] = await sql`
    SELECT 1 FROM board_posts
    WHERE author_hash = ${authorHash}
      AND body = ${text}
      AND created_at > now() - interval '6 hours'
    LIMIT 1`;
  return Boolean(row);
}
