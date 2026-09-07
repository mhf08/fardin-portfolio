/* Course Q&A board — client.

   Plain JS in one external file because the CSP is script-src 'self' with no
   unsafe-inline: no inline handlers, no inline <script>, no framework. Every
   request goes to same-origin /api/, which connect-src 'self' already allows,
   which is why this whole feature needed no CSP change.

   Failure posture: if /api/ is unreachable this page says so plainly and points
   at email. The course materials page is a separate document with no runtime
   dependencies at all, so nothing here can take the slides down. */
(function () {
  "use strict";

  var coursesEl = document.getElementById("courses");
  var boardEl = document.getElementById("board");
  var adminBtn = document.getElementById("admin-toggle");

  var state = {
    course: null,
    sort: "new",
    admin: false,
    limits: { question: { min: 10, max: 1500 }, answer: { min: 2, max: 4000 },
              name: { min: 3, max: 60 }, studentId: 12 },
    questions: [],
    replyTo: null,
    opened: Date.now(),
    busy: false,
  };

  /* Their name and roll number go in localStorage, not a cookie, so they never
     travel with a request they did not trigger. Retyping both on a phone every
     time is exactly the friction that stops someone asking. */
  var REMEMBER = "mhfq_me";

  function remembered() {
    try {
      return JSON.parse(localStorage.getItem(REMEMBER)) || {};
    } catch (e) {
      return {};
    }
  }

  function remember(name, studentId) {
    try {
      localStorage.setItem(REMEMBER, JSON.stringify({ name: name, studentId: studentId }));
    } catch (e) {
      /* private mode, or storage disabled: they type it again, nothing breaks */
    }
  }

  var ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ESCAPES[c];
    });
  }

  function ago(iso) {
    var then = new Date(iso);
    if (isNaN(then)) return "";
    var mins = Math.round((Date.now() - then.getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    if (mins < 1440) return Math.round(mins / 60) + "h ago";
    if (mins < 10080) return Math.round(mins / 1440) + "d ago";
    return then.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function api(path, options) {
    var opts = Object.assign({ headers: { "Content-Type": "application/json" } }, options);
    return fetch(path, opts).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || data.ok === false) throw new Error(data.error || "Something went wrong.");
        return data;
      });
    });
  }

  /* ---------- course tabs ---------------------------------------------- */

  function renderCourses(codes) {
    coursesEl.innerHTML = codes
      .map(function (code) {
        return (
          '<button type="button" class="board__course" data-course="' + esc(code) + '"' +
          ' aria-current="' + (code === state.course ? "true" : "false") + '">' +
          esc(code) + "</button>"
        );
      })
      .join("");
  }

  /* ---------- composer -------------------------------------------------- */

  function composer(kind, parentId) {
    var isQ = kind === "question";
    var max = isQ ? state.limits.question.max : state.limits.answer.max;
    var domId = "ask-" + (parentId == null ? "new" : parentId);
    var placeholder = isQ
      ? "What did not make sense? Say which topic or which slide if you can."
      : "Answer in your own words. Say what you are unsure about, if you are.";

    var saved = remembered();
    var identity = state.admin
      ? '<span class="ask__hint">Posting as instructor.</span>'
      : '<div class="ask__who">' +
        '<input class="ask__field" type="text" name="name" maxlength="' + state.limits.name.max +
        '" placeholder="Your full name" autocomplete="name" required value="' +
        esc(saved.name || "") + '">' +
        '<input class="ask__field ask__field--id" type="text" name="studentId" inputmode="numeric" ' +
        'maxlength="' + state.limits.studentId + '" placeholder="Student ID" ' +
        'autocomplete="off" required value="' + esc(saved.studentId || "") + '">' +
        '</div>' +
        '<label class="ask__hide"><input type="checkbox" name="hidden">' +
        '<span>Hide my name from classmates. Sir will still see it.</span></label>';

    return (
      '<form class="ask" data-parent="' + (parentId == null ? "" : parentId) + '">' +
      '<label class="ask__label" for="' + domId + '">' +
      (isQ ? "Ask about " + esc(state.course) : "Write an answer") +
      "</label>" +
      '<textarea id="' + domId + '" name="body" maxlength="' + max +
      '" placeholder="' + placeholder + '" required></textarea>' +
      '<div class="ask__pot" aria-hidden="true"><label>Website' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      identity +
      '<div class="ask__row">' +
      '<button type="submit" class="ask__send">' + (isQ ? "Post question" : "Post answer") + "</button>" +
      "</div>" +
      '<p class="ask__msg" role="status"></p>' +
      "</form>"
    );
  }

  /* ---------- threads --------------------------------------------------- */

  function meta(post, extra) {
    var bits = [];
    if (post.instructor) bits.push('<span class="badge">Instructor</span>');
    bits.push('<span class="q__who">' + esc(post.who) + (post.mine ? " (you)" : "") + "</span>");

    // Only ever sent to a signed-in instructor, so this is dead markup for a
    // student even if they read the source.
    if (post.studentId) {
      bits.push('<span class="q__id">' + esc(post.realName) + " &middot; " + esc(post.studentId) +
        (post.hidden ? " &middot; hidden from class" : "") + "</span>");
    }

    bits.push("<span>" + esc(ago(post.at)) + "</span>");
    if (extra) bits.push(extra);
    // Shown on your own post and on everything when signed in as instructor.
    // Never on someone else's post, and the server enforces the same rule.
    if (post.mine || state.admin) {
      bits.push('<button type="button" class="linkbtn" data-delete="' + post.id + '">Delete</button>');
    }
    return bits.join("");
  }

  function answerHTML(a) {
    return (
      '<li class="a' + (a.instructor ? " a--instructor" : "") + '">' +
      '<div class="a__text">' + esc(a.body) + "</div>" +
      '<div class="a__meta">' + meta(a) + "</div>" +
      "</li>"
    );
  }

  function questionHTML(q) {
    var answers = q.answers.length
      ? '<ul class="as">' + q.answers.map(answerHTML).join("") + "</ul>"
      : "";
    var replyBtn = '<button type="button" class="linkbtn" data-reply="' + q.id + '">' +
      (q.answers.length ? "Add an answer" : "Answer this") + "</button>";
    var reply = state.replyTo === q.id
      ? '<div class="q__reply">' + composer("answer", q.id) + "</div>"
      : "";

    return (
      '<li class="q">' +
      '<div class="q__main">' +
      '<button type="button" class="vote" data-vote="' + q.id + '"' +
      ' aria-pressed="' + (q.voted ? "true" : "false") + '"' +
      ' aria-label="' + (q.voted ? "Remove your mark" : "I have this question too") + '">' +
      '<span class="vote__caret" aria-hidden="true"></span>' +
      '<span class="vote__n">' + q.votes + "</span>same</button>" +
      '<div class="q__body">' +
      '<div class="q__text">' + esc(q.body) + "</div>" +
      '<div class="q__meta">' + meta(q, replyBtn) + "</div>" +
      "</div></div>" +
      answers + reply +
      "</li>"
    );
  }

  function render() {
    var n = state.questions.length;
    var counted = n ? n + (n === 1 ? " question" : " questions") : "No questions yet";
    var head =
      '<div class="board__bar">' +
      '<span class="board__count">' + counted + "</span>" +
      '<div class="board__sorts">' +
      '<button type="button" class="board__sort" data-sort="new" aria-pressed="' +
      (state.sort === "new") + '">Newest</button>' +
      '<button type="button" class="board__sort" data-sort="top" aria-pressed="' +
      (state.sort === "top") + '">Most asked</button>' +
      "</div></div>";

    var body = n
      ? '<ul class="qs">' + state.questions.map(questionHTML).join("") + "</ul>"
      : '<p class="board__note mono">Nothing here yet. Ask the first one.</p>';

    boardEl.innerHTML = head + composer("question", null) + body;
    state.opened = Date.now();
  }

  // A server-sent message is already written for a student to read; a thrown
  // network error is not ("Failed to fetch" tells them nothing). Pass the first
  // through and replace the second.
  function niceError(err) {
    var m = err && err.message ? err.message : "";
    if (!m || /fetch|network|load failed|json/i.test(m)) {
      return "The question board is not loading right now.";
    }
    return m;
  }

  function problem(message) {
    boardEl.innerHTML =
      '<p class="board__note board__note--bad">' + esc(message) +
      ' In the meantime, email me at <a href="mailto:fardin@ipe.buet.ac.bd">fardin@ipe.buet.ac.bd</a>. ' +
      'The <a href="/teaching/">course materials</a> are unaffected.</p>';
  }

  /* ---------- data ------------------------------------------------------ */

  function load() {
    boardEl.innerHTML = '<p class="board__note mono">Loading questions&hellip;</p>';
    var url = "/api/board?course=" + encodeURIComponent(state.course) + "&sort=" + state.sort;
    return api(url)
      .then(function (data) {
        state.admin = data.admin;
        if (data.limits) state.limits = data.limits;
        state.questions = data.questions;
        state.replyTo = null;
        render();
        adminBtn.textContent = state.admin
          ? "Signed in as instructor, sign out"
          : "Instructor sign in";
      })
      .catch(function (err) {
        problem(niceError(err));
      });
  }

  function selectCourse(code) {
    state.course = code;
    var url = new URL(location.href);
    url.searchParams.set("c", code);
    history.replaceState(null, "", url);
    coursesEl.querySelectorAll(".board__course").forEach(function (b) {
      b.setAttribute("aria-current", b.dataset.course === code ? "true" : "false");
    });
    load();
  }

  /* ---------- events ---------------------------------------------------- */

  coursesEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".board__course");
    if (btn && btn.dataset.course !== state.course) selectCourse(btn.dataset.course);
  });

  boardEl.addEventListener("click", function (e) {
    var sortBtn = e.target.closest("[data-sort]");
    if (sortBtn) {
      if (state.sort === sortBtn.dataset.sort) return;
      state.sort = sortBtn.dataset.sort;
      load();
      return;
    }

    var voteBtn = e.target.closest("[data-vote]");
    if (voteBtn) {
      vote(voteBtn);
      return;
    }

    var replyBtn = e.target.closest("[data-reply]");
    if (replyBtn) {
      var id = Number(replyBtn.dataset.reply);
      state.replyTo = state.replyTo === id ? null : id;
      render();
      var box = boardEl.querySelector('form[data-parent="' + id + '"] textarea');
      if (box) box.focus();
      return;
    }

    var delBtn = e.target.closest("[data-delete]");
    if (delBtn) remove(Number(delBtn.dataset.delete));
  });

  boardEl.addEventListener("submit", function (e) {
    e.preventDefault();
    send(e.target);
  });

  function vote(btn) {
    if (state.busy) return;
    state.busy = true;
    var id = Number(btn.dataset.vote);
    api("/api/vote", { method: "POST", body: JSON.stringify({ id: id }) })
      .then(function (data) {
        // Patch in place rather than reloading. A full re-render on every tap is
        // a lot of work to send over a bad connection to move one number.
        btn.setAttribute("aria-pressed", data.voted ? "true" : "false");
        btn.querySelector(".vote__n").textContent = data.votes;
        var q = state.questions.filter(function (x) { return x.id === id; })[0];
        if (q) {
          q.votes = data.votes;
          q.voted = data.voted;
        }
      })
      .catch(function (err) { alert(err.message); })
      .then(function () { state.busy = false; });
  }

  function send(form) {
    if (state.busy) return;
    var textarea = form.querySelector("textarea");
    var nameInput = form.querySelector('input[name="name"]');
    var idInput = form.querySelector('input[name="studentId"]');
    var hideInput = form.querySelector('input[name="hidden"]');
    var potInput = form.querySelector('input[name="website"]');
    var msg = form.querySelector(".ask__msg");
    var button = form.querySelector(".ask__send");
    var parent = form.dataset.parent ? Number(form.dataset.parent) : null;

    var text = textarea.value.trim();
    var min = parent === null ? state.limits.question.min : state.limits.answer.min;
    if (text.length < min) {
      msg.textContent = "Please write at least " + min + " characters.";
      msg.className = "ask__msg ask__msg--bad";
      return;
    }

    var name = nameInput ? nameInput.value.trim() : "";
    var studentId = idInput ? idInput.value.trim().replace(/\s+/g, "") : "";
    if (nameInput && (name.length < state.limits.name.min || !/[A-Za-z]/.test(name))) {
      msg.textContent = "Please give your full name.";
      msg.className = "ask__msg ask__msg--bad";
      return;
    }
    if (idInput && !/^\d{7}$/.test(studentId)) {
      msg.textContent = "Student ID should be your 7-digit roll number.";
      msg.className = "ask__msg ask__msg--bad";
      return;
    }
    if (nameInput) remember(name, studentId);

    state.busy = true;
    button.disabled = true;
    msg.className = "ask__msg";
    msg.textContent = "Posting…";

    api("/api/board", {
      method: "POST",
      body: JSON.stringify({
        course: state.course,
        parent: parent,
        body: text,
        name: name,
        studentId: studentId,
        hidden: Boolean(hideInput && hideInput.checked),
        website: potInput ? potInput.value : "",
        elapsed: Date.now() - state.opened,
      }),
    })
      .then(function () { return load(); })
      .catch(function (err) {
        msg.textContent = err.message;
        msg.className = "ask__msg ask__msg--bad";
        button.disabled = false;
      })
      .then(function () { state.busy = false; });
  }

  function remove(id) {
    if (!confirm("Delete this post?")) return;
    api("/api/moderate", { method: "POST", body: JSON.stringify({ action: "delete", id: id }) })
      .then(load)
      .catch(function (err) { alert(err.message); });
  }

  adminBtn.addEventListener("click", function () {
    if (state.admin) {
      api("/api/moderate", { method: "POST", body: JSON.stringify({ action: "logout" }) })
        .then(load)
        .catch(function (err) { alert(err.message); });
      return;
    }
    var password = prompt("Instructor password");
    if (!password) return;
    api("/api/moderate", {
      method: "POST",
      body: JSON.stringify({ action: "login", password: password }),
    })
      .then(load)
      .catch(function (err) { alert(err.message); });
  });

  /* ---------- start ----------------------------------------------------- */

  // The course list comes from the same courses.json the materials page reads,
  // so adding a course in the CMS adds its board with no code change.
  fetch("/teaching/courses.json", { cache: "no-cache" })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var codes = ((data && data.courses) || [])
        .map(function (c) { return String(c.code || "").trim(); })
        .filter(Boolean);
      if (!codes.length) throw new Error("no courses are listed yet");

      var wanted = new URLSearchParams(location.search).get("c");
      state.course = codes.indexOf(wanted) >= 0 ? wanted : codes[0];
      renderCourses(codes);
      return load();
    })
    .catch(function (err) {
      problem("Could not load the course list (" + err.message + ").");
    });
})();
