# Posting course materials

Everything you need to put slides and handouts on
`mostofahabibfardin.vercel.app/teaching/`. All of it is done in a web browser.
No command line, no code, no need to ask me.

Merges the former `ADMIN-SETUP.md` and `HOW-TO-ADD-MATERIALS.md`, which
described two methods for the same job and repeated most of each other.

---

## Pick your method by file size

| Your file | Use | Why |
|---|---|---|
| Under ~4 MB | **Method A — the admin panel** | It is a form. Fill it in, drag the file, done. |
| Over ~4 MB (most `.pptx` decks) | **Method B — GitHub upload** | The admin panel's uploader runs through a Vercel backend that hard-caps request bodies at ~4.5 MB. It will fail. GitHub's own upload has no limit. |

Both methods edit the same two things, so you can mix them file by file.

**How it works underneath:** the page reads one file, `teaching/courses.json`,
and shows whatever is listed in it. Posting anything is always (1) put the file
in a course folder, (2) add one line to `courses.json`.

---

## One-time setup

**For either method**, the repo must be connected to Vercel so saved changes
redeploy automatically. If you created the Vercel project by importing
`mhf08/fardin-portfolio` from GitHub, this is already on. To check:
vercel.com → your project → Settings → Git.

**For Method A only**, once ever:

1. Go to **app.pagescms.org**
2. **Sign in with GitHub** and authorize it
3. Choose **mhf08/fardin-portfolio**
4. It reads `.pages.yml` from the repo and shows a **Courses & Materials**
   section automatically. Nothing to configure.

Bookmark that dashboard. It is your admin panel.

---

## Method A — the admin panel (small files)

1. Open the Pages CMS dashboard, click **Courses & Materials**
2. Find the course, expand **Materials**, click **Add**
3. Fill the form: **Title** (what students see), **File** (drag it in),
   **Type** (Slides, Handout, …), **Date posted** (today)
4. **Save**

It commits the file and the entry for you. The page updates in about a minute.

**A new course:** expand **Courses** → **Add** → fill in code, title, term,
description, then add materials to it as above.

---

## Method B — GitHub upload (any size)

### 1. Upload the file

1. Go to **github.com/mhf08/fardin-portfolio**
2. Open the course folder: `teaching/files/ipe331/`, `.../ipe332/`,
   `.../ipe204/` or `.../ipe432/`
3. **Add file → Upload files**, drag it in, **Commit changes**

Spaces and capitals in the filename are fine (`IPE 331 Forging.pptx` works).
The only rule is that the `"file"` value you type in step 2 must match the real
name character for character.

### 2. List it on the page

Open `teaching/courses.json`, click the pencil icon, find the course, and add
one entry inside its `"materials": [ ... ]` list:

```json
{ "title": "Lecture 03 — Welding Processes", "file": "files/ipe331/IPE 331 Welding Lecture 3.pptx", "type": "Slides", "date": "2026-07-15" }
```

- **title** — what students see, anything you like
- **file** — `files/<course-folder>/<exact file name>`
- **type** — a short tag: Slides, Handout, Notes, Assignment. Optional.
- **date** — `YYYY-MM-DD`, the day you post it. The "Updated …" line at the
  bottom of the page derives itself from the newest date across all materials,
  so you never edit that stamp by hand.

**Commit changes.** Wait a minute, refresh the page.

---

## The one rule that matters: commas

Inside `materials`, every entry needs a comma after it **except the last**.

```json
"materials": [
  { "title": "Lecture 01", "file": "files/ipe331/lecture-01.pdf", "type": "Slides", "date": "2026-07-08" },
  { "title": "Lecture 02", "file": "files/ipe331/lecture-02.pdf", "type": "Slides", "date": "2026-07-11" }
]
```

The same rule applies one level up, between course blocks.

---

## Adding a whole new course

1. Pick a folder name, lowercase, no spaces, usually the code without the space: `ipe451`
2. Create the folder by uploading its first file into it: on GitHub go to
   `teaching/files/`, **Add file → Upload files**, and type the folder and file
   together in the name box, like `ipe451/lecture-01.pdf`. That is how GitHub
   makes a new folder.
3. Add the course block to `courses.json`:

```json
{
  "code": "IPE 451",
  "title": "Manufacturing Systems (Sessional)",
  "term": "2026",
  "description": "Short one-line description.",
  "materials": [
    { "title": "Lecture 01 — Overview", "file": "files/ipe451/lecture-01.pdf", "type": "Slides", "date": "2026-08-01" }
  ]
}
```

Courses appear in the order listed. **To remove a course**, delete its whole
`{ ... }` block; its folder can stay or go.

---

## Variations

- **No type or date:** leave them out — `{ "title": "Course Outline", "file": "files/ipe204/outline.pdf" }`
- **Remove one item:** delete its line from `courses.json`
- **PDF or PowerPoint:** both fine. PDFs open in the browser; `.pptx` downloads.
  Just point `"file"` at whichever you actually uploaded.
- **Replacing a deck with a corrected version:** upload the new file under a new
  name, update the existing entry's `"file"` and `"date"` to point at it, then
  delete the old file. Leaving it is harmless, just untidy.

---

## If the page says it couldn't load the list

Almost always a typo in `courses.json` — usually a missing or extra comma, or a
missing quote. Open it on GitHub, check the course you edited last against the
examples above, fix, commit. The page recovers on its own and nothing else on
the site is affected.

---

## Quick reference

| Task | Where |
|---|---|
| Small file, under ~4 MB | Pages CMS dashboard (Method A) |
| Large file, over ~4 MB | GitHub web upload (Method B) |
| Upload a file | `teaching/files/<course>/` → Add file → Upload files |
| List it | `teaching/courses.json` → one `{ ... }` entry |
| Course folders | ipe331, ipe332, ipe204, ipe432 |
| Live page | mostofahabibfardin.vercel.app/teaching/ |
| Filename rule | any name; just match `"file"` exactly |
| Comma rule | comma after every entry except the last |

---

# The question board

`/teaching/questions/` is a Reddit-style board, one per course. A student posts
a question in their own words and it appears immediately. You answer it, other
students can answer it too, and anyone can tap "same" on a question to say they
have it as well. Your answers are marked **Instructor** and pinned above the
rest.

**Everyone posting gives their full name and 7-digit roll number**, and both are
always visible to you when you are signed in. Each post also has a "Hide my name
from classmates" box: tick it and the class sees "Anonymous to classmates" while
you still see exactly who wrote it. The roll number is never shown to students
under any setting.

**Deleting:** you can delete anything. A student can delete only their own post,
which matters now that posts carry a real name — someone who regrets a question
can take it down without emailing you. Nobody can touch anyone else's post.

It is a separate page from the materials list on purpose. The materials page has
no runtime dependency on any of this, so if the board ever breaks, your slides
are untouched.

The board is set to **noindex** — Google will not list it. That is deliberate:
these are students' unedited words on a site that is also your academic profile,
and a post you delete would otherwise live on in Google's cache.

## One-time setup (about 15 minutes, all in a browser)

1. **vercel.com → your project → Storage → Create Database → Neon → Create.**
   Accept the defaults and attach it to this project. This sets `DATABASE_URL`
   for you. Free tier; nothing to configure.

2. **Settings → Environment Variables → Add**, name `ADMIN_SECRET`. The value is
   the password you will type to sign in as instructor. Make it long and random
   (a password manager's generator is ideal). Apply it to all environments.
   Minimum 16 characters, and the code refuses to run below that.

3. **Redeploy** (Deployments → the top one → ... → Redeploy) so the new
   variables are picked up. The tables create themselves on the first visit.

4. Open `/teaching/questions/`, click **Instructor sign in** at the bottom, and
   paste the `ADMIN_SECRET` value. You stay signed in on that device for 45 days.

## Getting told when someone posts (optional, do it later)

Until then, you check the board yourself. To get an email instead, add two more
environment variables and redeploy:

- `RESEND_API_KEY` — from a free account at resend.com (3,000 emails a month)
- `NOTIFY_EMAIL` — where the alerts go

If these are not set, nothing happens and nothing breaks; the board simply does
not email. **Note:** until a custom domain is verified with Resend, they will
only deliver to the address that owns the Resend account. That is fine here,
since you are the only recipient. Once the site has its own domain, verify it
with Resend and set `NOTIFY_FROM` to an address on it.

## Moderating

Sign in and a **Delete** link appears on every post, along with the writer's name
and roll number. Students see Delete only on their own posts. Deletes are soft:
the row stays in the database and can be brought back with a SQL update if
something is removed by mistake.

## Turning on real ID checking, later

Right now the roll number is only checked for shape (7 digits). Nothing stops a
student typing a classmate's number, so treat it as them signing their name
rather than as proof.

When you want the real thing, open `api/_lib/roster.js` and paste the roll
numbers for a course between the brackets:

```js
export const ROSTER = {
  "IPE 331": ["2004001", "2004002", "2004003"],
};
```

Commit it and the server starts rejecting anything not on that list, **for that
course only**. Courses you leave out stay on the format check, so you can switch
it on one course at a time. No other file changes.

Anything you post while signed in carries the Instructor badge and sorts to the
top of its thread. You are also exempt from the link ban and the rate limits.

## What stops spam

There is no CAPTCHA, because the site's Content-Security-Policy forbids loading
one. Instead:

- a name and roll number on every post, which is most of the deterrent
- a hidden field no human sees; anything that fills it is silently discarded
- posts sent in under 3 seconds of the page rendering are rejected
- 4 posts per 10 minutes and 25 per day per browser
- the same text twice within 6 hours is rejected
- students cannot post links at all (you can)
- length limits: questions 10–1500 characters, answers 2–4000

## Adding a course

Nothing to do. The board reads the same `courses.json` as the materials page, so
adding a course in the admin panel gives it a board automatically.

## If the board says it is not loading

Check, in this order: that `DATABASE_URL` and `ADMIN_SECRET` both exist in
Vercel's environment variables; that you redeployed after adding them; and
Vercel → your project → Logs for the actual error. The materials page and the
rest of the site are unaffected either way.
