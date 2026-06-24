/* pwa.js — registers the service worker so the app works offline / is
   installable. Skips file:// (service workers need http(s) or localhost). */

(function () {
  "use strict";
  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {
        /* offline support simply unavailable — no problem */
      });
    });
  }
})();
