/* Sets the theme before first paint. Loaded synchronously (tiny) and kept
   external so the Content-Security-Policy can stay `script-src 'self'`
   with no unsafe-inline.

   Order: the visitor's saved choice, then the page's own default
   (<html data-default-theme="dark|light|auto">), then day. "auto" follows
   the OS setting. The main site defaults to day; /photography/ defaults to
   night because its rooms are built for it. "theme" was the key read before
   2026-10-15 while the toggle wrote "mhf-theme", so a choice never stuck;
   both are read now. */
(function () {
  var root = document.documentElement;
  var t = null;
  try { t = localStorage.getItem("mhf-theme") || localStorage.getItem("theme"); } catch (e) { /* private mode */ }
  if (t !== "light" && t !== "dark") {
    var d = root.getAttribute("data-default-theme");
    if (d === "auto") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    else t = d === "dark" ? "dark" : "light";
  }
  root.dataset.theme = t;
})();
