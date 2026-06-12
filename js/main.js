/* The Drawing Set — interactions.
   Everything degrades: no JS still yields a complete, navigable page. */
(function () {
  "use strict";

  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Loader: print in once per session ---------- */
  var loader = document.getElementById("loader");
  if (loader) {
    var seen = false;
    try { seen = sessionStorage.getItem("mhf-seen"); } catch (e) { /* private mode */ }
    if (reduceMotion || seen) {
      loader.remove();
    } else {
      try { sessionStorage.setItem("mhf-seen", "1"); } catch (e) {}
      var loaderStart = performance.now();
      var dismiss = function () {
        if (!loader) return;
        loader.classList.add("done");
        setTimeout(function () { if (loader) { loader.remove(); loader = null; } }, 650);
      };
      var finish = function () {
        setTimeout(dismiss, Math.max(0, 1800 - (performance.now() - loaderStart)));
      };
      if (document.readyState === "complete") finish();
      else addEventListener("load", finish, { once: true });
      // Let an impatient visitor skip after the print settles
      setTimeout(function () {
        ["click", "keydown", "wheel", "touchstart"].forEach(function (ev) {
          addEventListener(ev, dismiss, { once: true, passive: true });
        });
      }, 750);
    }
  }

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");

  function syncToggle() {
    var dark = root.dataset.theme === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to day mode" : "Switch to night mode");
  }
  toggle.addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    syncToggle();
  });
  syncToggle();

  /* ---------- Ruler: ticks + scroll progress + sheet readout ---------- */
  var ruler = document.querySelector(".ruler");
  var ticksBox = ruler.querySelector(".ruler__ticks");
  var progress = ruler.querySelector(".ruler__progress");
  var readoutNo = ruler.querySelector(".ruler__sheet");
  var readoutLabel = ruler.querySelector(".ruler__label");

  for (var i = 0; i <= 60; i++) {
    var tick = document.createElement("span");
    tick.style.top = (i / 60 * 100) + "%";
    if (i % 5 === 0) tick.className = "major";
    ticksBox.appendChild(tick);
  }

  var progressTicking = false;
  function paintProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - innerHeight;
    progress.style.height = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    progressTicking = false;
  }
  addEventListener("scroll", function () {
    if (!progressTicking) { progressTicking = true; requestAnimationFrame(paintProgress); }
  }, { passive: true });
  paintProgress();

  /* ---------- Scroll spy: nav highlight + ruler + HUD readout ---------- */
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var navLinks = document.querySelectorAll("[data-spy]");
  var hud = document.querySelector(".hud");
  var hudSheet = hud && hud.querySelector(".hud__sheet");
  var hudName = hud && hud.querySelector(".hud__name");
  var sheetTotal = sheets.length < 10 ? "0" + sheets.length : String(sheets.length);
  var currentSheetNum = 1;

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      currentSheetNum = parseInt(el.dataset.sheet, 10) || currentSheetNum;
      readoutNo.textContent = el.dataset.sheet;
      readoutLabel.textContent = el.dataset.name;
      if (hudSheet) hudSheet.textContent = el.dataset.sheet + " / " + sheetTotal;
      if (hudName) hudName.textContent = el.dataset.name;
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

  /* ---------- Sheet-wipe page transitions ---------- */
  var wipe = document.querySelector(".wipe");
  var wipeBusy = false;

  document.querySelectorAll("[data-wipe]").forEach(function (link) {
    link.addEventListener("click", function (ev) {
      var href = link.getAttribute("href");
      var target = document.querySelector(href);
      if (!target) return; // fall through to default anchor behavior
      ev.preventDefault();
      closeMenu();

      function jump() {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        history.replaceState(null, "", href);
      }

      if (reduceMotion) { jump(); return; }

      // Preferred: native View Transitions — a drafting-paper page turn.
      if (document.startViewTransition) {
        var tNum = parseInt((href.match(/\d+/) || ["99"])[0], 10);
        root.dataset.vt = tNum >= currentSheetNum ? "fwd" : "back";
        var vt = document.startViewTransition(jump);
        vt.finished.then(function () { delete root.dataset.vt; },
                         function () { delete root.dataset.vt; });
        return;
      }

      // Fallback: the brass/ink sheet-wipe.
      if (wipeBusy) { jump(); return; }
      wipeBusy = true;
      wipe.classList.add("run");
      setTimeout(jump, 430);
      setTimeout(function () { wipe.classList.remove("run"); wipeBusy = false; }, 950);
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
    boxImg.src = a.getAttribute("href");
    boxImg.alt = a.querySelector("img") ? a.querySelector("img").alt : "";
    boxCaption.textContent = a.dataset.caption || "";
    boxCounter.textContent = (current.index + 1) + " / " + items.length;
  }
  function step(delta) {
    var items = galleries[current.group];
    current.index = (current.index + delta + items.length) % items.length;
    paintBox();
  }

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

  /* ---------- Bespoke registration-mark cursor ---------- */
  var cursorEl = document.querySelector(".cursor");
  if (cursorEl && matchMedia("(pointer: fine)").matches && !reduceMotion) {
    document.body.classList.add("cursor-on");
    var labelEl = cursorEl.querySelector(".cursor__label");
    var cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    function renderCursor() {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22;
      cursorEl.style.transform = "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(renderCursor);
    }
    addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    renderCursor();

    var INTERACTIVE = "a, button, [data-cursor], summary, input, textarea";
    addEventListener("mouseover", function (e) {
      var t = e.target.closest(INTERACTIVE);
      if (!t) return;
      cursorEl.classList.add("hot");
      var lbl = t.getAttribute("data-cursor");
      if (lbl) { labelEl.textContent = lbl; cursorEl.classList.add("labelled"); }
    });
    addEventListener("mouseout", function (e) {
      if (e.target.closest(INTERACTIVE)) cursorEl.classList.remove("hot", "labelled");
    });
    document.addEventListener("mouseleave", function () { cursorEl.style.opacity = "0"; });
    document.addEventListener("mouseenter", function () { cursorEl.style.opacity = ""; });
  }

  /* ---------- HUD: live drafting coordinates ---------- */
  if (hud && matchMedia("(pointer: fine)").matches) {
    var hudX = hud.querySelector(".hud__x");
    var hudY = hud.querySelector(".hud__y");
    var mx = 0, my = 0, hudTick = false;
    function pad4(n) { n = String(Math.max(0, Math.round(n))); return "0000".slice(n.length) + n; }
    addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!hudTick) {
        hudTick = true;
        requestAnimationFrame(function () { hudX.textContent = pad4(mx); hudY.textContent = pad4(my); hudTick = false; });
      }
    }, { passive: true });
  }

  /* ---------- Footer year ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
