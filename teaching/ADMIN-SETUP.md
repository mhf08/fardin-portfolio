# Setting up the admin panel (form-based uploads, no code)

This gives you a dashboard where you add slides by filling a form and dragging in the
PDF — no editing `courses.json` by hand. It uses **Pages CMS** (pagescms.org), a free
tool that connects to your GitHub repo.

> **Important — do these first, in order.** The admin panel can only work once the site
> is (1) pushed to GitHub and (2) deployed live. Until then there's nothing for it to
> connect to. See the "Prerequisites" section at the bottom.

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
   - **PDF file** — click to upload; drag your PDF straight in.
   - **Type** — pick from the dropdown (Slides, Handout, etc.).
   - **Date posted** — pick today's date.
4. Click **Save**.

Pages CMS commits the file and the entry for you. Your site rebuilds and the new item
appears at `mostofahabibfardin.com/teaching/` in about a minute. The "Updated" date on the
page moves itself to match — you never touch it.

**Adding a new course:** in the same dashboard, expand **Courses**, click **Add**, and fill
in the code, title, term, and description. Then add materials to it as above.

---

## Prerequisites (why it isn't live yet)

The admin panel connects to your **deployed** site and your **GitHub** repo. Right now:

1. **The latest work isn't pushed to GitHub yet.** Everything built recently (the teaching
   page, this config) is sitting on your machine, uncommitted. It needs to be committed and
   pushed to `mhf08/fardin-portfolio`.
2. **The site isn't deployed.** There's no live `mostofahabibfardin.com` yet. It needs to be
   deployed on Vercel, with the GitHub repo connected so changes publish automatically.

Once those two are done, follow the setup steps above and you're running. Ask Claude for the
deploy guide if you want a step-by-step for those two prerequisites.

---

## If you ever prefer the manual way

The by-hand method still works exactly as before (upload a PDF + add one line to
`courses.json`) — see `HOW-TO-ADD-MATERIALS.md`. The admin panel and the manual method edit
the same files, so you can mix them freely.
