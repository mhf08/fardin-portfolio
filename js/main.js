/* The Drawing Set — interactions.
   Everything degrades: no JS still yields a complete, navigable page. */
(function () {
  "use strict";

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    (function loop(t) { lenis.raf(t); requestAnimationFrame(loop); })();
  }

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");

  function syncToggle() {
    var dark = root.dataset.theme === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to day mode" : "Switch to night mode");
  }
  toggle.addEventListener("click", function (ev) {
    var swap = function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("mhf-theme", next); } catch (e) {}
      syncToggle();
    };
    // Circular reveal from the button itself where the browser supports it.
    if (reduceMotion || !document.startViewTransition) { swap(); return; }
    var x = ev.clientX, y = ev.clientY;
    var far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(swap).ready.then(function () {
      document.documentElement.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)",
                     "circle(" + far + "px at " + x + "px " + y + "px)"] },
        { duration: 620, easing: "cubic-bezier(.22,1,.36,1)",
          pseudoElement: "::view-transition-new(root)" }
      );
    });
  });
  syncToggle();

  /* ---------- Reading spine: progress, section marks, active label ----------
     Does what the ruler and the HUD used to do. Builds itself from whatever
     sections exist, so adding or removing one needs no change here. */
  var spine = document.querySelector(".spine");
  var spineFill = spine && spine.querySelector(".spine__fill");
  var sheetsForSpine = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var marks = [], spineLabel = null;

  if (spine && sheetsForSpine.length) {
    var marksBox = document.createElement("div");
    marksBox.className = "spine__marks";
    spine.appendChild(marksBox);
    spineLabel = document.createElement("span");
    spineLabel.className = "spine__label";
    document.body.appendChild(spineLabel);
    marks = sheetsForSpine.map(function () {
      var m = document.createElement("i");
      m.className = "spine__mark";
      marksBox.appendChild(m);
      return m;
    });
  }

  var spineTicking = false;
  function paintSpine() {
    spineTicking = false;
    if (!spine) return;
    var max = document.documentElement.scrollHeight - innerHeight;
    spineFill.style.height = (max > 0 ? Math.max(6, (scrollY / max) * 100) : 6) + "%";
    var h = document.documentElement.scrollHeight;
    var active = 0;
    sheetsForSpine.forEach(function (sec, i) {
      marks[i].style.top = ((sec.offsetTop / h) * 100).toFixed(2) + "%";
      if (scrollY >= sec.offsetTop - innerHeight * 0.35) active = i;
    });
    marks.forEach(function (m, i) { m.classList.toggle("on", i === active); });
    spineLabel.textContent = sheetsForSpine[active].dataset.name || "";
    spineLabel.style.top = Math.round(marks[active].getBoundingClientRect().top) + "px";
    spineLabel.classList.add("on");
  }
  if (spine) {
    addEventListener("scroll", function () {
      if (!spineTicking) { spineTicking = true; requestAnimationFrame(paintSpine); }
    }, { passive: true });
    addEventListener("resize", paintSpine);
    paintSpine();
  }

  /* ---------- Scroll spy: nav highlight ---------- */
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var navLinks = document.querySelectorAll("[data-spy]");

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      navLinks.forEach(function (a) {
        if (a.dataset.spy === el.id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  sheets.forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });

  /* ---------- Count-ups: measurements resolving ---------- */
  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counterObs.unobserve(e.target);
      var el = e.target;
      var target = parseFloat(el.dataset.count);
      var dec = parseInt(el.dataset.decimals || "0", 10);
      if (reduceMotion || isNaN(target)) { el.textContent = target.toFixed(dec); return; }
      var dur = 1100, start = null;
      (function tick(t) {
        if (!start) start = t;
        var p = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(dec);
      })(performance.now());
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (c) { counterObs.observe(c); });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  function closeMenu() {
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  /* ---------- Anchor jumps (the sheet-wipe transition is gone) ---------- */
  document.querySelectorAll("[data-wipe]").forEach(function (link) {
    link.addEventListener("click", function (ev) {
      var target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      ev.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target);
      else target.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });

  /* ---------- Carousels ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var track = root.querySelector(".carousel__track");
    var slides = Array.prototype.slice.call(track.children);
    var count = root.querySelector(".carousel__count");
    var prev = root.querySelector('.carousel__btn[data-dir="-1"]');
    var next = root.querySelector('.carousel__btn[data-dir="1"]');
    if (!slides.length) return;
    track.setAttribute("data-hot", "");

    function currentIndex() {
      var best = 0, bestDist = Infinity;
      slides.forEach(function (s, j) {
        var d = Math.abs((s.offsetLeft - slides[0].offsetLeft) - track.scrollLeft);
        if (d < bestDist) { bestDist = d; best = j; }
      });
      return best;
    }

    function update() {
      var idx = currentIndex();
      if (count) count.textContent = (idx + 1) + " / " + slides.length;
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === slides.length - 1;
    }

    function goTo(idx) {
      idx = Math.max(0, Math.min(slides.length - 1, idx));
      track.scrollTo({
        left: slides[idx].offsetLeft - slides[0].offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }

    if (prev) prev.addEventListener("click", function () { goTo(currentIndex() - 1); });
    if (next) next.addEventListener("click", function () { goTo(currentIndex() + 1); });

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () { update(); ticking = false; });
      }
    }, { passive: true });

    track.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft") { ev.preventDefault(); goTo(currentIndex() - 1); }
      if (ev.key === "ArrowRight") { ev.preventDefault(); goTo(currentIndex() + 1); }
    });

    update();
  });

  /* ---------- Lightbox ---------- */
  var box = document.querySelector(".lightbox");
  var boxImg = box.querySelector("img");
  var boxCaption = box.querySelector(".lightbox__caption");
  var boxCounter = box.querySelector(".lightbox__counter");
  var galleries = {};
  var current = { group: null, index: 0 };

  // Serve full-size images in the best format the browser decodes.
  // Anchors point at .jpg; we swap the extension once support is probed.
  var lbExt = ".jpg";
  function probeFormat(uri) {
    return new Promise(function (resolve) {
      var im = new Image();
      im.onload = function () { resolve(im.width > 0); };
      im.onerror = function () { resolve(false); };
      im.src = uri;
    });
  }
  probeFormat("data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=")
    .then(function (avifOk) {
      if (avifOk) { lbExt = ".avif"; return; }
      return probeFormat("data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA")
        .then(function (webpOk) { if (webpOk) lbExt = ".webp"; });
    });

  function fullSrc(a) { return a.getAttribute("href").replace(/\.jpg$/i, lbExt); }

  document.querySelectorAll("[data-lightbox]").forEach(function (a) {
    var group = a.dataset.lightbox;
    (galleries[group] = galleries[group] || []).push(a);
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      openBox(group, galleries[group].indexOf(a));
    });
  });

  function openBox(group, index) {
    current = { group: group, index: index };
    paintBox();
    box.showModal();
    if (!reduceMotion) {
      boxImg.classList.remove("developing");
      void boxImg.offsetWidth; // restart the develop animation
      boxImg.classList.add("developing");
    }
  }
  function paintBox() {
    var items = galleries[current.group];
    var a = items[current.index];
    boxImg.src = fullSrc(a);
    boxImg.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
    boxCaption.textContent = a.dataset.caption || "";
    boxCounter.textContent = (current.index + 1) + " / " + items.length;
    preloadNeighbors();
  }
  function preloadNeighbors() {
    var items = galleries[current.group];
    if (!items || items.length < 2) return;
    [1, -1].forEach(function (d) {
      var a = items[(current.index + d + items.length) % items.length];
      new Image().src = fullSrc(a);
    });
  }
  function step(delta) {
    var items = galleries[current.group];
    current.index = (current.index + delta + items.length) % items.length;
    paintBox();
  }

  // If a derived .avif/.webp is ever missing, fall back to the original JPEG
  boxImg.addEventListener("error", function () {
    if (current.group == null || /\.jpg$/i.test(boxImg.src)) return;
    boxImg.src = galleries[current.group][current.index].getAttribute("href");
  });

  // Touch: swipe horizontally to flip prints
  var swipeX = null, swipeY = null;
  box.addEventListener("touchstart", function (ev) {
    var t = ev.changedTouches[0];
    swipeX = t.clientX; swipeY = t.clientY;
  }, { passive: true });
  box.addEventListener("touchend", function (ev) {
    if (swipeX === null) return;
    var t = ev.changedTouches[0];
    var dx = t.clientX - swipeX, dy = t.clientY - swipeY;
    swipeX = swipeY = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  box.querySelector(".lightbox__close").addEventListener("click", function () { box.close(); });
  box.querySelector(".lightbox__nav--prev").addEventListener("click", function () { step(-1); });
  box.querySelector(".lightbox__nav--next").addEventListener("click", function () { step(1); });
  box.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowLeft") step(-1);
    if (ev.key === "ArrowRight") step(1);
  });
  box.addEventListener("click", function (ev) {
    if (ev.target === box) box.close(); // backdrop click
  });
  box.addEventListener("close", function () { boxImg.removeAttribute("src"); });

  /* ---------- Click-to-load YouTube ---------- */
  document.querySelectorAll(".yt").forEach(function (fig) {
    var btn = fig.querySelector(".yt__btn");
    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + fig.dataset.yt + "?autoplay=1&rel=0";
      iframe.title = "Radial drilling machine motion study";
      iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      btn.replaceWith(iframe);
    });
  });

  /* ---------- Broken-image fallback ---------- */
  document.querySelectorAll("img").forEach(function (img) {
    if (img.closest(".lightbox")) return; // lightbox img legitimately has no src when closed
    img.addEventListener("error", function () {
      var holder = img.closest("a") || img;
      holder.classList.add("img-missing");
      holder.dataset.alt = img.alt || "image";
      img.style.display = "none";
    });
  });

  /* ---------- Email addresses: copy, don't rely on mailto ----------
     Plenty of visitors have no desktop mail client, and on Windows a mailto
     handler mis-registered to a browser just opens that browser's start page.
     Copying always works. The href stays a real mailto so the link keeps its
     semantics, its right-click menu, and its behaviour where a client exists. */
  var copiedEl = document.querySelector(".contact__copied");
  var copyTimer;

  function say(msg) {
    if (!copiedEl) return;
    copiedEl.textContent = msg;
    copiedEl.classList.add("on");
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { copiedEl.classList.remove("on"); }, 3000);
  }
  // Older/blocked clipboard API: a hidden textarea + execCommand still works and,
  // unlike navigator.clipboard, needs no permission. Never fall back to the
  // mailto itself — that is the broken path this whole block exists to avoid.
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  document.querySelectorAll('.contact a[href^="mailto:"]').forEach(function (a) {
    a.addEventListener("click", function (ev) {
      var addr = a.getAttribute("href").replace(/^mailto:/, "").split("?")[0];
      ev.preventDefault();

      // Feedback is set synchronously, always. Copying can fail quietly in ways
      // we cannot detect in time: execCommand returns false when the document
      // isn't focused, and navigator.clipboard.writeText can sit unresolved in
      // the same situation. Showing the address first means the reader can
      // always select it by hand; a successful copy just upgrades the message.
      if (legacyCopy(addr)) {
        say(addr + " copied to clipboard");
      } else {
        say(addr);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(addr).then(function () {
            say(addr + " copied to clipboard");
          }, function () { /* leave the address on screen */ });
        }
      }
    });
  });

  /* ---------- Interaction layer ----------
     Everything here is assigned by ROLE, never by hand-tagging markup, so it
     keeps working as sections are added, rewritten or removed. */

  // load orchestration: the page arrives in order rather than all at once
  document.body.classList.add("is-loading");
  document.querySelectorAll(".hero__inner > *").forEach(function (el, i) {
    el.style.setProperty("--i", i);
  });
  var lift = function () { document.body.classList.remove("is-loading"); };
  addEventListener("load", function () { requestAnimationFrame(lift); });
  setTimeout(lift, 1800); // safety: never leave the page invisible

  // Heading masks are driven purely by CSS off the site's existing .reveal/.in
  // observer. A second observer proved unreliable here, and <picture> is
  // display:contents so it has no box to observe at all.

  // buttons lean toward the cursor
  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll(".btn").forEach(function (btn) {
        btn.addEventListener("mousemove", function (e) {
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          btn.classList.add("is-magnetic");
          btn.style.transform = "translate(" + (dx * 9).toFixed(1) + "px," + (dy * 5).toFixed(1) + "px)";
        });
        btn.addEventListener("mouseleave", function () {
          btn.classList.remove("is-magnetic");
          btn.style.transform = "";
        });
      });
  }

  /* ---------- Footer year ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
