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

  function materialRow(m) {
    var type = m.type ? '<span class="mat__type mono">' + esc(m.type) + "</span>" : "";
    var date = m.date ? '<span class="mat__date mono">' + fmtDate(m.date) + "</span>" : "";
    return (
      '<li class="mat">' +
      '<a class="mat__link" href="' + esc(m.file) + '" download>' +
      '<span class="mat__title">' + esc(m.title) + "</span>" +
      type + date +
      '<span class="mat__dl mono" aria-hidden="true">Download &darr;</span>' +
      "</a></li>"
    );
  }

  function courseCard(c) {
    var mats = Array.isArray(c.materials) ? c.materials : [];
    var body = mats.length
      ? '<ul class="mats">' + mats.map(materialRow).join("") + "</ul>"
      : '<p class="mats__empty mono">No materials posted yet.</p>';
    var term = c.term ? '<span>&ensp;&middot;&ensp;' + esc(c.term) + "</span>" : "";
    return (
      '<article class="course">' +
      '<header class="course__head">' +
      '<h2 class="course__title"><span class="course__code mono">' + esc(c.code) + "</span>" + esc(c.title) + "</h2>" +
      '<p class="course__meta mono">' + esc(c.description || "") + term + "</p>" +
      "</header>" +
      body +
      "</article>"
    );
  }

  fetch("courses.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      var courses = (data && data.courses) || [];
      mount.innerHTML = courses.map(courseCard).join("");
      if (stamp && data.updated) stamp.textContent = "Updated " + fmtDate(data.updated);
    })
    .catch(function (err) {
      mount.innerHTML =
        '<p class="mats__empty mono">Couldn\'t load the course list. If you just edited ' +
        "courses.json, check it for a typo (a missing comma or quote). Error: " +
        esc(err.message) + "</p>";
    });
})();
