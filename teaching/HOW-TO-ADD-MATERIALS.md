# How to add course materials (no coding, no Claude needed)

This is your step-by-step for posting slides and handouts to
`mostofahabibfardin.vercel.app/teaching/`. Everything below is done from your web browser.
You never touch the command line and you never need to ask me.

> **Two ways to do this — pick based on file size:**
> - **Small files (roughly under 4 MB)** — use the **Pages CMS admin panel** instead
>   (`ADMIN-SETUP.md`). It's a form: fill it in, drag the file, done. Easier than this guide.
> - **Anything bigger (most slide decks, especially `.pptx`)** — the CMS's upload form has
>   a hard ~4.5 MB cap and will fail. Use **this guide** — GitHub's own web upload has no
>   size limit.
>
> Both methods edit the exact same files, so you can freely mix them file-by-file.

---

## How it works (the 10-second version)

Your Course Materials page reads one file, **`teaching/courses.json`**, and shows whatever
is listed in it. To post a new file you do two things:

1. **Upload the file** (PDF, PPTX, or similar) into the right course folder.
2. **Add one line** to `courses.json` pointing at that file.

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

### Step 1 — Upload the file

1. Go to your repository: **github.com/mhf08/fardin-portfolio**
2. Open the folder for the course. The four folders are:
   - `teaching/files/ipe331/` — IPE 331 Production Processes
   - `teaching/files/ipe332/` — IPE 332 Production Processes
   - `teaching/files/ipe204/` — IPE 204 Engineering Graphics & CAD
   - `teaching/files/ipe432/` — IPE 432 Machine Tools
3. Click **Add file → Upload files**.
4. Drag your file in — PDF, PPTX, DOCX, whatever the material actually is. **The name can
   have spaces and capital letters, that's fine** (e.g. `IPE 331 Forging.pptx` works exactly
   as well as `lecture-03.pdf`) — the only rule is that the **file** value you type into
   `courses.json` in Step 2 must match this name character-for-character, including spaces.
5. Click **Commit changes** (the green button).

### Step 2 — List it on the page

1. Open **`teaching/courses.json`** in the repo.
2. Click the **pencil icon** (top right) to edit.
3. Find the course you uploaded to. Each course has a `"materials": [ ... ]` list.
   Add one entry inside the square brackets. Copy this template and change the four values:

   ```json
   { "title": "Lecture 03 — Welding Processes", "file": "files/ipe331/IPE 331 Welding Lecture 3.pptx", "type": "Slides", "date": "2026-07-15" }
   ```

   - **title** — what students see (anything you like)
   - **file** — `files/<course-folder>/<your-file-name-exactly-as-uploaded>` (spaces are
     fine; the extension just has to match the real file — `.pdf`, `.pptx`, whatever it is)
   - **type** — a short tag, e.g. `Slides`, `Handout`, `Notes`, `Assignment` (or delete this part)
   - **date** — `YYYY-MM-DD`, e.g. `2026-07-15`. **Use the date you're posting it.** The
     "Updated ..." line at the bottom of the page updates itself to the newest date across all
     your materials, so as long as you give each new item today's date, the page always shows
     when you last posted something. You never edit that stamp by hand.

4. Click **Commit changes**.

That's it. Give it a minute, then refresh `mostofahabibfardin.vercel.app/teaching/`.

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

## Adding a whole new course

You are not limited to the four courses that are there now. To add another one (say you
start teaching `IPE 451` next term):

1. **Pick a short folder name** for it, lowercase, no spaces — usually the code without the
   space, e.g. `ipe451`.
2. **Make the folder by uploading its first PDF into it.** On GitHub, go to
   `teaching/files/`, click **Add file → Upload files**, and in the filename box type the
   folder and file together, like `ipe451/lecture-01.pdf`, then drag your PDF onto it and
   commit. (Typing `foldername/filename` is how GitHub creates a new folder.)
3. **Add the course to `courses.json`.** Copy one of the existing course blocks and paste it
   into the `"courses": [ ... ]` list, then change the values:

   ```json
   {
     "code": "IPE 451",
     "title": "Manufacturing Systems (Sessional)",
     "term": "2026",
     "description": "Short one-line description of the course.",
     "materials": [
       { "title": "Lecture 01 — Overview", "file": "files/ipe451/lecture-01.pdf", "type": "Slides", "date": "2026-08-01" }
     ]
   }
   ```

   Courses show up in the order you list them here, so put it wherever you want it to appear.

**Same comma rule, one level up:** every course block needs a comma after it *except the
last one* in the list. If you paste a new course in the middle, make sure the block before
it ends with a comma and the last block still has none.

**To remove a course** (e.g. you're done teaching it): delete its whole `{ ... }` block from
`courses.json`. You can leave its folder of PDFs alone or delete it — either way it stops
showing on the page.

---

## Handy variations

- **Post a deck with no type/date:** just leave those out —
  `{ "title": "Course Outline", "file": "files/ipe204/outline.pdf" }`
- **Remove a deck from the page:** delete its line from `courses.json` (you can leave the
  file in the folder or delete it too).
- **Change a course description:** edit the `"description"` text for that course.
- **PDF vs. PowerPoint?** Either works. PDFs open straight in the browser and never break
  formatting; `.pptx` files just download for students to open in PowerPoint — both are
  totally fine, just point `"file"` at whichever one you actually uploaded.
- **Replacing an old version of a deck with a corrected one:** upload the new file (can be
  a new name, e.g. add "v2" or the real date), update — don't just overwrite — the existing
  `courses.json` entry's `"file"` and `"date"` to point at the new one, then delete the old
  file from the folder so it doesn't sit around unused. (If you forget to delete it, it's
  harmless — it's just never linked from the page — but it's tidy to clean up.)

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
| Small file (under ~4 MB) | Pages CMS admin panel — see `ADMIN-SETUP.md` |
| Large file (over ~4 MB, most slide decks) | This guide — GitHub web upload, no size limit |
| Upload a file | `teaching/files/<course>/` → Add file → Upload files |
| List it | `teaching/courses.json` → add one `{ ... }` line |
| Course folders | ipe331, ipe332, ipe204, ipe432 |
| Live page | mostofahabibfardin.vercel.app/teaching/ |
| File name rule | any name works, spaces/capitals fine — just match `"file"` exactly |
| File types | PDF, PPTX, DOCX, etc. — whatever the material actually is |
| Comma rule | comma after every entry except the last |
