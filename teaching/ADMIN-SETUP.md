# Setting up the admin panel (form-based uploads, no code)

This gives you a dashboard where you add slides by filling a form and dragging in the
file — no editing `courses.json` by hand. It uses **Pages CMS** (pagescms.org), a free
tool that connects to your GitHub repo.

> **Size limit — read this first:** Pages CMS's upload form runs through a backend that
> hard-caps uploads at about **4.5 MB**. Lecture slide decks (especially `.pptx` with
> embedded images) routinely exceed that. If your file is bigger than ~4 MB, don't fight
> the form — use the manual GitHub upload method instead (`HOW-TO-ADD-MATERIALS.md`),
> which has no size limit. Use the CMS for anything smaller (handouts, short PDFs).

> The site is live at **https://mostofahabibfardin.vercel.app/** and pushed to GitHub, so
> the prerequisites are met — you can set up the admin panel now.
>
> One thing to confirm: your Vercel project must be **connected to the GitHub repo** (Vercel
> → Settings → Git) so that changes the admin panel commits get published automatically. If
> you imported the repo when deploying, this is already on.

---

## One-time setup (about 10 minutes, mostly clicking "Authorize")

1. Go to **app.pagescms.org**.
2. Click **Sign in with GitHub** and authorize it.
3. Choose your repository: **mhf08/fardin-portfolio**.
4. Pages CMS reads the `.pages.yml` file that's already in your repo, so it will show a
   **"Courses & Materials"** section automatically. Nothing else to configure.

That's it. Bookmark your Pages CMS dashboard — that's your admin panel from now on.

---

## Adding a slide deck (every time, no code)

1. Open your Pages CMS dashboard and click **Courses & Materials**.
2. Find the course, expand its **Materials** list, and click **Add**.
3. Fill the form:
   - **Title** — what students see.
   - **File** — click to upload (PDF, PPTX, DOCX, and a few image types all work);
     drag it straight in. **If it's over ~4 MB, stop and use the manual method below instead** —
     the form will fail silently or error out past the CMS's size cap.
   - **Type** — pick from the dropdown (Slides, Handout, etc.).
   - **Date posted** — pick today's date.
4. Click **Save**.

Pages CMS commits the file and the entry for you. Your site rebuilds and the new item
appears at `mostofahabibfardin.vercel.app/teaching/` in about a minute. The "Updated" date on
the page moves itself to match — you never touch it.

**Adding a new course:** in the same dashboard, expand **Courses**, click **Add**, and fill
in the code, title, term, and description. Then add materials to it as above.

---

## If you ever prefer the manual way (or your file is too big for the CMS)

The by-hand method still works exactly as before (upload a file + add one line to
`courses.json`) — see `HOW-TO-ADD-MATERIALS.md`. It has no size limit, unlike this CMS. The
admin panel and the manual method edit the same files, so you can mix them freely — use
whichever is easier for a given file.
