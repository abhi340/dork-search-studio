/* storage.js — saved dorks + recent-search history, persisted in localStorage.
   Exposes window.DorkStore. Everything stays on the user's device. */

(function () {
  "use strict";

  const SKEY = "dork-saved";
  const HKEY = "dork-history";
  const MAX_SAVED = 50;
  const MAX_HISTORY = 20;

  function read(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return Array.isArray(v) ? v : [];
    } catch (_) {
      return [];
    }
  }

  function write(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (_) {}
  }

  window.DorkStore = {
    listSaved() {
      return read(SKEY);
    },
    saveDork(name, query, fields) {
      if (!query) return;
      const arr = read(SKEY);
      arr.unshift({
        id: String(Date.now()) + Math.random().toString(36).slice(2, 6),
        name: (name || query).slice(0, 80),
        query,
        fields: fields || {},
      });
      write(SKEY, arr.slice(0, MAX_SAVED));
    },
    deleteSaved(id) {
      write(SKEY, read(SKEY).filter((x) => x.id !== id));
    },
    clearSaved() {
      write(SKEY, []);
    },
    exportSaved() {
      return JSON.stringify(read(SKEY), null, 2);
    },
    importSaved(json) {
      try {
        const incoming = JSON.parse(json);
        if (!Array.isArray(incoming)) return -1;
        const clean = incoming.filter((x) => x && x.query).map((x) => ({
          id: x.id || String(Date.now()) + Math.random().toString(36).slice(2, 6),
          name: String(x.name || x.query).slice(0, 80),
          query: String(x.query),
          fields: x.fields && typeof x.fields === "object" ? x.fields : {},
        }));
        const merged = clean.concat(read(SKEY));
        // de-dup by query, keep first
        const seen = new Set();
        const deduped = merged.filter((x) => (seen.has(x.query) ? false : seen.add(x.query)));
        write(SKEY, deduped.slice(0, MAX_SAVED));
        return clean.length;
      } catch (_) {
        return -1;
      }
    },

    listHistory() {
      return read(HKEY);
    },
    addHistory(query, fields) {
      if (!query) return;
      const arr = read(HKEY).filter((x) => x.query !== query);
      arr.unshift({ query, fields: fields || {}, t: Date.now() });
      write(HKEY, arr.slice(0, MAX_HISTORY));
    },
    clearHistory() {
      write(HKEY, []);
    },
  };
})();
