/* operators.js — single source of truth for every dork operator.
   Each operator knows how to render itself (label/placeholder/help) AND
   how to turn a raw input value into a query fragment via build().
   Add a new operator here and it shows up in the builder + learn section. */

const OPERATORS = [
  {
    key: "keywords",
    label: "Keywords",
    placeholder: "annual report renewable energy",
    example: "renewable energy report",
    help: "Plain words to match. The base of your search — everything else narrows it down.",
    goodFor: "Starting point for any search.",
    build: (v) => v.trim(),
  },
  {
    key: "exact",
    label: "Exact phrase",
    placeholder: "annual report 2023",
    example: '"annual report 2023"',
    help: 'Wraps your text in quotes so the engine matches the phrase exactly, in that order.',
    goodFor: "Finding a precise title, quote, or error message.",
    build: (v) => {
      const t = v.trim();
      return t ? `"${t.replace(/"/g, "")}"` : "";
    },
  },
  {
    key: "site",
    label: "Site / domain",
    placeholder: "example.com",
    example: "site:example.com",
    help: "Restricts results to one website or domain. Works with TLDs too, e.g. site:gov.in.",
    goodFor: "Searching inside one site, or a whole class of sites (site:edu).",
    build: (v) => (v.trim() ? `site:${v.trim()}` : ""),
  },
  {
    key: "filetype",
    label: "File type",
    placeholder: "pdf",
    example: "filetype:pdf",
    help: "Finds a specific file extension: pdf, doc, docx, xls, xlsx, csv, ppt, txt, sql, log...",
    goodFor: "Hunting documents, datasets, slide decks.",
    build: (v) => (v.trim() ? `filetype:${v.trim().replace(/^\./, "")}` : ""),
  },
  {
    key: "intitle",
    label: "In title",
    placeholder: "index of",
    example: 'intitle:"index of"',
    help: "Word(s) must appear in the page's title. Quote multi-word values for an exact title match.",
    goodFor: "Open directory listings, specific page titles.",
    build: (v) => {
      const t = v.trim();
      if (!t) return "";
      return t.includes(" ") ? `intitle:"${t.replace(/"/g, "")}"` : `intitle:${t}`;
    },
  },
  {
    key: "inurl",
    label: "In URL",
    placeholder: "login",
    example: "inurl:login",
    help: "Word(s) must appear in the page's URL/path.",
    goodFor: "Login pages, admin panels, API paths.",
    build: (v) => (v.trim() ? `inurl:${v.trim()}` : ""),
  },
  {
    key: "intext",
    label: "In body text",
    placeholder: "confidential",
    example: 'intext:"confidential"',
    help: "Word(s) must appear in the page body. Quote multi-word values for an exact match.",
    goodFor: "Pages that mention a specific term in their content.",
    build: (v) => {
      const t = v.trim();
      if (!t) return "";
      return t.includes(" ") ? `intext:"${t.replace(/"/g, "")}"` : `intext:${t}`;
    },
  },
  {
    key: "or",
    label: "Any of these (OR)",
    placeholder: "login, signin, admin",
    example: "(login OR signin OR admin)",
    help: "Match ANY of several alternatives. Separate terms with commas.",
    goodFor: "Catching synonyms or variants in one search.",
    build: (v) => {
      const parts = v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0];
      return `(${parts.join(" OR ")})`;
    },
  },
  {
    key: "exclude",
    label: "Exclude words",
    placeholder: "template sample draft",
    example: "-template -sample",
    help: "Removes results containing these words. Separate with spaces or commas.",
    goodFor: "Filtering out noise, samples, and unrelated topics.",
    build: (v) =>
      v
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => `-${s.replace(/^-/, "")}`)
        .join(" "),
  },
  {
    key: "after",
    label: "After date",
    placeholder: "2023-01-01",
    type: "date",
    example: "after:2023-01-01",
    help: "Only results published/indexed on or after this date (YYYY-MM-DD).",
    goodFor: "Recent results only.",
    build: (v) => (v.trim() ? `after:${v.trim()}` : ""),
  },
  {
    key: "before",
    label: "Before date",
    placeholder: "2024-12-31",
    type: "date",
    example: "before:2024-12-31",
    help: "Only results published/indexed on or before this date (YYYY-MM-DD).",
    goodFor: "Limiting to an older time window.",
    build: (v) => (v.trim() ? `before:${v.trim()}` : ""),
  },
  {
    key: "allintitle",
    label: "All words in title",
    placeholder: "annual financial report",
    example: "allintitle: annual financial report",
    help: "Every one of these words must appear in the page title (not just one).",
    goodFor: "Tightly matching multi-word titles.",
    build: (v) => (v.trim() ? `allintitle: ${v.trim()}` : ""),
  },
  {
    key: "related",
    label: "Similar to site",
    placeholder: "nytimes.com",
    example: "related:nytimes.com",
    help: "Find websites similar to a given domain.",
    goodFor: "Discovering competitors or alternatives.",
    build: (v) => (v.trim() ? `related:${v.trim().replace(/^https?:\/\//, "")}` : ""),
  },
  {
    key: "around",
    label: "Words near each other",
    placeholder: "tesla, battery, 5",
    example: "tesla AROUND(5) battery",
    help: "Two terms must appear within N words of each other. Format: word1, word2, distance.",
    goodFor: "Finding related ideas mentioned close together.",
    build: (v) => {
      const p = v.split(",").map((s) => s.trim()).filter(Boolean);
      if (p.length < 2) return "";
      const n = p[2] && /^\d+$/.test(p[2]) ? p[2] : "5";
      return `${p[0]} AROUND(${n}) ${p[1]}`;
    },
  },
  {
    key: "numrange",
    label: "Number range",
    placeholder: "100..500",
    example: "100..500",
    help: "Match any number in a range. Use min..max (or 'min max').",
    goodFor: "Prices, years, quantities.",
    build: (v) => {
      const t = v.trim();
      if (!t) return "";
      if (t.includes("..")) return t;
      const parts = t.split(/[\s-]+/).filter(Boolean);
      return parts.length === 2 ? `${parts[0]}..${parts[1]}` : t;
    },
  },
];
