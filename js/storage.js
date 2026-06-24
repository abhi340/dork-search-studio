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
