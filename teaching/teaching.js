/* Renders the Course Materials page from courses.json.
   No framework, no build step. Edit courses.json to change content. */
(function () {
  "use strict";

  var mount = document.getElementById("courses");
  var stamp = document.getElementById("updated");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(d) {
    if (!d) return "";
    var t = new Date(d);
    if (isNaN(t)) return esc(d);
    return t.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  // Materials can be listed relative (e.g. "files/ipe331/x.pdf"); resolve against
  // /teaching/ so links work whether the page URL has a trailing slash or not.
  function resolveFile(f) {
    f = String(f || "");
    if (/^https?:\/\//i.test(f) || f.charAt(0) === "/") return f;
    return "/teaching/" + f.replace(/^\.?\//, "");
  }

  function materialRow(m) {
    var type = m.type ? '<span class="mat__type mono">' + esc(m.type) + "</span>" : "";
    var date = m.date ? '<span class="mat__date mono">' + fmtDate(m.date) + "</span>" : "";
    return (
      '<li class="mat">' +
      '<a class="mat__link" href="' + esc(resolveFile(m.file)) + '" download>' +
      '<span class="mat__title">' + esc(m.title) + "</span>" +
      type + date +
      '<span class="mat__dl mono" aria-hidden="true">Download &darr;</span>' +
      "</a></li>"
    );
  }

  // The "Updated" stamp is derived automatically: the most recent material date
  // across all courses. Add a dated item and the stamp moves on its own — no need
  // to hand-edit anything. Falls back to the "updated" field in courses.json only
  // when nothing has a date yet.
  function latestDate(courses) {
    var newest = null;
    courses.forEach(function (c) {
      (c.materials || []).forEach(function (m) {
        if (!m.date) return;
        var t = new Date(m.date);
        if (!isNaN(t) && (newest === null || t > newest)) newest = t;
      });
    });
    return newest;
  }

  function courseCard(c) {
    var mats = Array.isArray(c.materials) ? c.materials : [];
    var body = mats.length
      ? '<ul class="mats">' + mats.map(materialRow).join("") + "</ul>"
      : '<p class="mats__empty mono">No materials posted yet.</p>';
    var term = c.term ? '<span>&ensp;&middot;&ensp;' + esc(c.term) + "</span>" : "";
    var count = mats.length
      ? '<span class="course__count mono">' + mats.length + (mats.length === 1 ? " item" : " items") + "</span>"
      : '<span class="course__count course__count--empty mono">empty</span>';
    // Native <details> gives us the collapse for free — no inline script, keyboard
    // and screen-reader accessible. Collapsed by default so a long list stays scannable.
    return (
      '<details class="course">' +
      '<summary class="course__head">' +
      '<span class="course__headmain">' +
      '<span class="course__title"><span class="course__code mono">' + esc(c.code) + "</span>" + esc(c.title) + count + "</span>" +
      '<span class="course__meta mono">' + esc(c.description || "") + term + "</span>" +
      "</span>" +
      '<span class="course__chev" aria-hidden="true"></span>' +
      "</summary>" +
      '<div class="course__body">' + body + "</div>" +
      "</details>"
    );
  }

  fetch("/teaching/courses.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      var courses = (data && data.courses) || [];
      // Toolbar to expand/collapse every course at once — only worth showing when
      // there's more than one course to manage.
      var toolbar = courses.length > 1
        ? '<div class="courses__tools">' +
          '<button type="button" class="courses__tool mono" data-action="expand">Expand all</button>' +
          '<button type="button" class="courses__tool mono" data-action="collapse">Collapse all</button>' +
          "</div>"
        : "";
      mount.innerHTML = toolbar + courses.map(courseCard).join("");

      var details = mount.querySelectorAll("details.course");
      mount.querySelectorAll(".courses__tool").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var open = btn.getAttribute("data-action") === "expand";
          details.forEach(function (d) { d.open = open; });
        });
      });

      if (stamp) {
        var when = latestDate(courses) || (data.updated ? new Date(data.updated) : null);
        stamp.textContent = when && !isNaN(when) ? "Updated " + fmtDate(when) : "";
      }
    })
    .catch(function (err) {
      mount.innerHTML =
        '<p class="mats__empty mono">Couldn\'t load the course list. If you just edited ' +
        "courses.json, check it for a typo (a missing comma or quote). Error: " +
        esc(err.message) + "</p>";
    });
})();
