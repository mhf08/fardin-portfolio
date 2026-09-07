/* Optional class roster.

   Empty by default, and while it is empty every well-formed student ID is
   accepted — the ID field is then an attestation, not a proof. Fill a course in
   and the server starts rejecting anything not on that list for that course
   only, so you can turn real verification on one course at a time.

   To use it: paste the roll numbers between the brackets, as strings, then
   commit. No other file changes. Courses left out stay format-checked. */

export const ROSTER = {
  // "IPE 331": ["2004001", "2004002"],
  // "IPE 204": [],
};

const SETS = new Map();

function setFor(course) {
  if (!SETS.has(course)) {
    const list = ROSTER[course];
    SETS.set(course, Array.isArray(list) && list.length ? new Set(list.map(String)) : null);
  }
  return SETS.get(course);
}

/* Returns an error string, or null when the id is acceptable. */
export function checkRoster(course, studentId) {
  const set = setFor(course);
  if (!set) return null; // no roster for this course: format check already ran
  if (!set.has(String(studentId))) {
    return "That roll number is not on the list for this course. Check it, or email me.";
  }
  return null;
}
