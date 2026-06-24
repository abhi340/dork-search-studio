/* parse.js — reverse dork parser. Turns an existing query string back into the
   builder's fields object so it can be loaded + explained. Best-effort: handles
   the common operators, quoted phrases, exclusions, OR groups, AROUND, ranges.
   Exposes window.parseQuery. */

(function () {
  "use strict";

  function parseQuery(input) {
    let str = " " + String(input || "").trim() + " ";
    if (!str.trim()) return {};
    const f = {};
    const exclude = [];

    // word AROUND(n) word
    str = str.replace(/(\S+)\s+AROUND\((\d+)\)\s+(\S+)/gi, (m, a, n, b) => {
      f.around = `${a}, ${b}, ${n}`;
      return " ";
    });

    // parenthesised OR groups
    str = str.replace(/\(([^)]*)\)/g, (m, inner) => {
      const parts = inner.split(/\s+OR\s+/i).map((s) => s.trim()).filter(Boolean);
      if (parts.length && parts.every((p) => /^(filetype|ext):/i.test(p))) {
        f.filetype = parts.map((p) => p.replace(/^(filetype|ext):/i, "")).join(",");
        return " ";
      }
      if (parts.length && parts.every((p) => /^[\w.\-]+$/.test(p))) {
        f.or = parts.join(", ");
        return " ";
      }
      return " " + inner.replace(/\s+OR\s+/gi, " ") + " "; // fall back to keywords
    });

    // allintitle: rest-of-words (until the next operator or end)
    str = str.replace(/\ballintitle:\s*([^]*?)(?=\s+-?[a-z]+:|\s*$)/i, (m, v) => {
      f.allintitle = v.trim().replace(/"/g, "");
      return " ";
    });

    // operator:value (value may be "quoted" or bare)
    const opMap = {
      site: "site", filetype: "filetype", ext: "filetype", intitle: "intitle",
      inurl: "inurl", intext: "intext", related: "related", before: "before", after: "after",
    };
    str = str.replace(
      /(-?)\b(site|filetype|ext|intitle|inurl|intext|related|before|after):("([^"]*)"|\S+)/gi,
      (m, neg, op, val, q) => {
        let value = q !== undefined ? q : val;
        value = value.replace(/^"|"$/g, "");
        if (neg) {
          exclude.push(op.toLowerCase() + ":" + value);
          return " ";
        }
        const key = opMap[op.toLowerCase()];
        if (key === "filetype") f.filetype = f.filetype ? f.filetype + "," + value : value;
        else f[key] = value;
        return " ";
      }
    );

    // number range
    str = str.replace(/\b(\d+\.\.\d+)\b/g, (m) => {
      f.numrange = m;
      return " ";
    });

    // exclusions: -word or -"phrase"
    str = str.replace(/(^|\s)-("([^"]*)"|\S+)/g, (m, sp, val, q) => {
      const v = (q !== undefined ? q : val).replace(/^"|"$/g, "");
      if (v) exclude.push(v);
      return " ";
    });

    // remaining quoted phrases => exact
    const phrases = [];
    str = str.replace(/"([^"]+)"/g, (m, p) => {
      phrases.push(p);
      return " ";
    });
    if (phrases.length) f.exact = phrases.join(" ");

    // leftover bare words => keywords
    const kw = str.replace(/\bOR\b/gi, " ").split(/\s+/).map((s) => s.trim()).filter(Boolean);
    if (kw.length) f.keywords = kw.join(" ");
    if (exclude.length) f.exclude = exclude.join(" ");

    return f;
  }

  window.parseQuery = parseQuery;
})();
