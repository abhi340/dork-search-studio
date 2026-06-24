/* engines.js — assemble the final query and build per-engine search URLs.
   buildQuery() is a pure function: same fields in => same string out. */

/**
 * Build the final dork string from a {key: value} map of field inputs.
 * Runs each operator's build(), drops empties, joins with spaces.
 */
function buildQuery(fields) {
  return OPERATORS.map((op) => {
    const raw = fields[op.key];
    if (raw == null) return "";
    return op.build(String(raw)) || "";
  })
    .filter((frag) => frag.trim().length > 0)
    .join(" ")
    .trim();
}

/* Search engines we can launch the query against. */
const ENGINES = [
  {
    id: "google",
    name: "Google",
    url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "bing",
    name: "Bing",
    url: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "duckduckgo",
    name: "DuckDuckGo",
    url: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  },
  {
    id: "brave",
    name: "Brave",
    url: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "startpage",
    name: "Startpage",
    url: (q) => `https://www.startpage.com/sp/search?query=${encodeURIComponent(q)}`,
  },
  {
    id: "yandex",
    name: "Yandex",
    url: (q) => `https://yandex.com/search/?text=${encodeURIComponent(q)}`,
  },
  {
    id: "scholar",
    name: "Scholar",
    url: (q) => `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`,
  },
];

/** Open the query on a given engine in a new, isolated tab. */
function launchSearch(engine, query) {
  if (!query) return;
  window.open(engine.url(query), "_blank", "noopener,noreferrer");
}
