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

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
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
        if (lenis) lenis.scrollTo(target, { immediate: true }); // Lenis honors scroll-margin-top
        else target.scrollIntoView({ behavior: "instant", block: "start" });
        history.replaceState(null, "", href);
      }

      if (reduceMotion || wipeBusy) { jump(); return; }

      // The signature bold transition: brass + ink panels sweep across the
      // viewport like turning a drafting sheet; the jump happens under cover.
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
    track.setAttribute("data-cursor", "DRAG");

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

  // Every lightbox anchor earns the cursor's VIEW label
  document.querySelectorAll("[data-lightbox]").forEach(function (a) {
    if (!a.hasAttribute("data-cursor")) a.setAttribute("data-cursor", "VIEW");
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

  /* ---------- Bespoke registration-mark cursor ---------- */
  var cursorEl = document.querySelector(".cursor");
  if (cursorEl && matchMedia("(pointer: fine)").matches && !reduceMotion) {
    document.body.classList.add("cursor-on");
    var labelEl = cursorEl.querySelector(".cursor__label");

    // The OS cursor is hidden, so this mark IS the pointer — it must track 1:1.
    // Any smoothing here reads as input latency, not style.
    addEventListener("mousemove", function (e) {
      cursorEl.style.transform =
        "translate3d(" + e.clientX + "px," + e.clientY + "px,0) translate(-50%,-50%)";
    }, { passive: true });

    var INTERACTIVE = "a, button, [data-cursor], summary, input, textarea";
    addEventListener("mouseover", function (e) {
      var t = e.target.closest(INTERACTIVE);
      if (!t) return;
      cursorEl.classList.add("hot");
      var lbl = t.getAttribute("data-cursor");
      if (lbl) { labelEl.textContent = lbl; cursorEl.classList.add("labelled"); }
    });
    addEventListener("mouseout", function (e) {
      if (!e.target.closest(INTERACTIVE)) return;
      // Ignore moves between nested children of the same interactive element
      var still = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(INTERACTIVE);
      if (!still) cursorEl.classList.remove("hot", "labelled");
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
