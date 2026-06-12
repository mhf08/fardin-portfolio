/* Sets the theme before first paint. Loaded synchronously (tiny) and kept
   external so the Content-Security-Policy can stay `script-src 'self'`
   with no unsafe-inline. */
(function () {
  var t = null;
  try { t = localStorage.getItem("theme"); } catch (e) { /* private mode */ }
  if (!t) t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = t;
})();
