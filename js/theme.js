/* theme.js — light/dark theme with persistence.
   Loaded in <head> (blocking) so the theme is applied BEFORE first paint,
   which avoids a flash of the wrong theme. Exposes a global `Theme`. */

(function () {
  "use strict";
  const KEY = "dork-theme";
  const root = document.documentElement;

  function preferred() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {}
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function apply(theme) {
    root.dataset.theme = theme;
  }

  window.Theme = {
    get() {
      return root.dataset.theme || "light";
    },
    set(theme) {
      apply(theme);
      try {
        localStorage.setItem(KEY, theme);
      } catch (_) {}
    },
    toggle() {
      this.set(this.get() === "dark" ? "light" : "dark");
      return this.get();
    },
  };

  apply(preferred()); // run immediately
})();
