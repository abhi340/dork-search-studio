/* sw.js — service worker for offline use. Cache-first for same-origin assets;
   never touches search-engine requests (those are cross-origin navigations). */

const CACHE = "dork-studio-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./templates.html",
  "./learn.html",
  "./recon.html",
  "./about.html",
  "./privacy.html",
  "./terms.html",
  "./favicon.svg",
  "./manifest.webmanifest",
  "./css/styles.css",
  "./js/theme.js",
  "./js/operators.js",
  "./js/engines.js",
  "./js/filetypes.js",
  "./js/explain.js",
  "./js/storage.js",
  "./js/share.js",
  "./js/parse.js",
  "./js/layout.js",
  "./js/builder.js",
  "./js/render.js",
  "./js/recon.js",
  "./js/templates.js",
  "./js/learn.js",
  "./js/duck.js",
  "./js/pwa.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave search engines alone
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    )
  );
});
