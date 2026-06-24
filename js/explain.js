/* explain.js — turns the builder fields into a plain-English sentence so
   beginners understand exactly what their dork does. Exposes explainQuery(). */

(function () {
  "use strict";

  function v(fields, key) {
    return (fields[key] || "").trim();
  }

  const FILE_NAMES = {
    pdf: "PDF",
    doc: "Word",
    docx: "Word",
    xls: "Excel",
    xlsx: "Excel",
    csv: "CSV",
    ppt: "PowerPoint",
    txt: "text",
  };

  window.explainQuery = function explainQuery(fields) {
    // nothing meaningful yet
    if (typeof buildQuery === "function" && !buildQuery(fields)) return "";

    const ft = v(fields, "filetype");
    let subject = ft ? `Find ${FILE_NAMES[ft] || ft.toUpperCase()} files` : "Find pages";

    const bits = [];
    if (v(fields, "keywords")) bits.push(`about ${v(fields, "keywords")}`);
    if (v(fields, "exact")) bits.push(`containing the exact phrase “${v(fields, "exact")}”`);
    if (v(fields, "or")) {
      const alts = v(fields, "or").split(",").map((s) => s.trim()).filter(Boolean);
      if (alts.length) bits.push(`mentioning any of: ${alts.join(", ")}`);
    }
    if (v(fields, "around")) {
      const p = v(fields, "around").split(",").map((s) => s.trim()).filter(Boolean);
      if (p.length >= 2) bits.push(`where “${p[0]}” appears near “${p[1]}”`);
    }
    if (v(fields, "numrange")) bits.push(`with a number in the range ${v(fields, "numrange")}`);
    if (v(fields, "site")) bits.push(`on ${v(fields, "site")}`);
    if (v(fields, "related")) bits.push(`from sites similar to ${v(fields, "related")}`);
    if (v(fields, "intitle")) bits.push(`with “${v(fields, "intitle")}” in the title`);
    if (v(fields, "allintitle")) bits.push(`with all of “${v(fields, "allintitle")}” in the title`);
    if (v(fields, "inurl")) bits.push(`with “${v(fields, "inurl")}” in the URL`);
    if (v(fields, "intext")) bits.push(`with “${v(fields, "intext")}” in the page text`);
    if (v(fields, "exclude")) {
      const ex = v(fields, "exclude").split(/[\s,]+/).filter(Boolean);
      if (ex.length) bits.push(`excluding ${ex.join(", ")}`);
    }
    if (v(fields, "after")) bits.push(`published after ${v(fields, "after")}`);
    if (v(fields, "before")) bits.push(`published before ${v(fields, "before")}`);

    return bits.length ? `${subject} ${bits.join(", ")}.` : `${subject}.`;
  };
})();
