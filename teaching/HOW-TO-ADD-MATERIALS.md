# How to add course materials (no coding, no Claude needed)

This is your step-by-step for posting slides and handouts to
`mostofahabibfardin.com/teaching/`. Everything below is done from your web browser.
You never touch the command line and you never need to ask me.

---

## How it works (the 10-second version)

Your Course Materials page reads one file, **`teaching/courses.json`**, and shows whatever
is listed in it. To post a new slide deck you do two things:

1. **Upload the PDF** into the right course folder.
2. **Add one line** to `courses.json` pointing at that PDF.

Save both, wait about a minute, and the page updates itself.

---

## One-time setup (do this once, ever)

For the "wait about a minute and it updates itself" part to work, your GitHub repository
must be connected to Vercel so that every change you save online automatically redeploys
the site.

- If you set the site up on Vercel by **importing the GitHub repo** (`mhf08/fardin-portfolio`),
  this is already on. Saving a change on GitHub triggers a new deploy automatically.
- If you're not sure, open your project on **vercel.com → Settings → Git**. If it shows the
  GitHub repo connected, you're done. If not, connect it there once.

After that, the steps below are all you ever do.

---

## Adding a slide deck (every time)

### Step 1 — Upload the PDF

1. Go to your repository: **github.com/mhf08/fardin-portfolio**
2. Open the folder for the course. The four folders are:
   - `teaching/files/ipe331/` — IPE 331 Production Processes
   - `teaching/files/ipe332/` — IPE 332 Production Processes
   - `teaching/files/ipe204/` — IPE 204 Engineering Graphics & CAD
   - `teaching/files/ipe432/` — IPE 432 Machine Tools
3. Click **Add file → Upload files**.
4. Drag your PDF in. **Give it a simple name with no spaces**, e.g. `lecture-03.pdf`
   or `handout-welding.pdf` (use hyphens, not spaces).
5. Click **Commit changes** (the green button).

### Step 2 — List it on the page

1. Open **`teaching/courses.json`** in the repo.
2. Click the **pencil icon** (top right) to edit.
3. Find the course you uploaded to. Each course has a `"materials": [ ... ]` list.
   Add one entry inside the square brackets. Copy this template and change the four values:

   ```json
   { "title": "Lecture 03 — Welding Processes", "file": "files/ipe331/lecture-03.pdf", "type": "Slides", "date": "2026-07-15" }
   ```

   - **title** — what students see (anything you like)
   - **file** — `files/<course-folder>/<your-file-name>.pdf` (must match Step 1 exactly)
   - **type** — a short tag, e.g. `Slides`, `Handout`, `Notes`, `Assignment` (or delete this part)
   - **date** — `YYYY-MM-DD`, e.g. `2026-07-15` (or delete this part)

4. Click **Commit changes**.

That's it. Give it a minute, then refresh `mostofahabibfardin.com/teaching/`.

---

## The one rule that matters: commas

Inside a course's `materials` list, **every entry needs a comma after it except the last
one.** Two examples:

**One item — no comma:**
```json
"materials": [
  { "title": "Lecture 01", "file": "files/ipe331/lecture-01.pdf", "type": "Slides", "date": "2026-07-08" }
]
```

**Three items — commas after all but the last:**
```json
"materials": [
  { "title": "Lecture 01", "file": "files/ipe331/lecture-01.pdf", "type": "Slides", "date": "2026-07-08" },
  { "title": "Lecture 02", "file": "files/ipe331/lecture-02.pdf", "type": "Slides", "date": "2026-07-11" },
  { "title": "Handout — Casting", "file": "files/ipe331/handout-casting.pdf", "type": "Handout", "date": "2026-07-12" }
]
```

Newest at the top or bottom is up to you — they show in the order you list them.

---

## Handy variations

- **Post a deck with no type/date:** just leave those out —
  `{ "title": "Course Outline", "file": "files/ipe204/outline.pdf" }`
- **Remove a deck from the page:** delete its line from `courses.json` (you can leave the
  PDF in the folder or delete it too).
- **Change a course description:** edit the `"description"` text for that course.
- **PowerPoint instead of PDF?** You can, but PDFs open in the browser and never break
  formatting. If you upload a `.pptx`, students download it to open — still fine, just point
  the `"file"` at the `.pptx` name.

---

## If the page says it couldn't load the list

That almost always means a typo in `courses.json` — usually a **missing or extra comma**,
or a missing quote mark. Open `courses.json` on GitHub, look at the course you last edited,
and check the commas against the examples above. Fix it, commit, and the page recovers on
its own. Nothing else on the site is affected.

---

## Quick reference

| Task | Where |
| --- | --- |
| Upload a PDF | `teaching/files/<course>/` → Add file → Upload files |
| List it | `teaching/courses.json` → add one `{ ... }` line |
| Course folders | ipe331, ipe332, ipe204, ipe432 |
| Live page | mostofahabibfardin.com/teaching/ |
| File name rule | lowercase, hyphens, no spaces, ends in `.pdf` |
| Comma rule | comma after every entry except the last |
