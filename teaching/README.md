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
