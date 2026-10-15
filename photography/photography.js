/* Photography page: the tinted room.
   The Hour Between takes on the colour of whichever plate is in view. Each
   plate carries its colour in data-tint; the room mixes it into the paper in
   CSS. Without JS, or with reduced motion, the room simply stays plain. */
(function () {
  "use strict";

  var room = document.querySelector(".room--hour");
  if (!room || !("IntersectionObserver" in window)) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) room.style.setProperty("--tint", e.target.dataset.tint);
    });
  }, { rootMargin: "-40% 0px -40% 0px" });

  room.querySelectorAll("[data-tint]").forEach(function (el) { obs.observe(el); });
})();
