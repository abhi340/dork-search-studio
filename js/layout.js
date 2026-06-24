/* layout.js — injects the shared header (logo + nav + theme toggle) and footer
   into every page, highlights the active nav link, wires the theme button, and
   reveals .reveal elements on scroll. Built with DOM APIs (no innerHTML). */

(function () {
  "use strict";

  const NAV = [
    { href: "index.html", label: "Build" },
    { href: "templates.html", label: "Templates" },
    { href: "recon.html", label: "Recon" },
    { href: "learn.html", label: "Learn" },
    { href: "about.html", label: "About" },
  ];

  const FOOT = [
    { href: "about.html", label: "About" },
    { href: "privacy.html", label: "Privacy" },
    { href: "terms.html", label: "Terms" },
  ];

  function el(tag, opts, ...kids) {
    const n = document.createElement(tag);
    if (opts) {
      if (opts.class) n.className = opts.class;
      if (opts.text != null) n.textContent = opts.text;
      if (opts.href) n.href = opts.href;
      if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) n.setAttribute(k, v);
      if (opts.on) for (const [e, f] of Object.entries(opts.on)) n.addEventListener(e, f);
    }
    kids.forEach((k) => k != null && n.append(k));
    return n;
  }

  function currentFile() {
    const p = location.pathname.split("/").pop();
    return p && p.length ? p : "index.html";
  }

  const SVGNS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    return n;
  }

  /* animated sun/moon icon — CSS cross-fades + rotates them on theme change */
  function themeIcon() {
    const root = svg("svg", {
      viewBox: "0 0 24 24",
      class: "theme-icon",
      "aria-hidden": "true",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
    });

    const sun = svg("g", { class: "i-sun" });
    sun.append(svg("circle", { cx: "12", cy: "12", r: "4", fill: "currentColor", stroke: "none" }));
    const rays = svg("g", { class: "rays" });
    const R = [
      [12, 1, 12, 4], [12, 20, 12, 23], [1, 12, 4, 12], [20, 12, 23, 12],
      [4.2, 4.2, 6.3, 6.3], [17.7, 17.7, 19.8, 19.8],
      [4.2, 19.8, 6.3, 17.7], [17.7, 6.3, 19.8, 4.2],
    ];
    R.forEach(([x1, y1, x2, y2]) =>
      rays.append(svg("line", { x1, y1, x2, y2 }))
    );
    sun.append(rays);

    const moon = svg("path", {
      class: "i-moon",
      d: "M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8z",
      fill: "currentColor",
      stroke: "none",
    });

    root.append(sun, moon);
    return root;
  }

  function themeButton() {
    const btn = el("button", {
      class: "theme-toggle",
      attrs: { type: "button", "aria-label": "Toggle light/dark theme", title: "Toggle theme" },
    });
    btn.append(themeIcon());
    btn.addEventListener("click", () => {
      const theme = window.Theme.toggle();
      document.dispatchEvent(new CustomEvent("dork:theme", { detail: { theme } })); // QuackOverflow reacts
    });
    return btn;
  }

  function buildHeader() {
    const here = currentFile();
    const nav = el(
      "nav",
      { class: "top-nav" },
      ...NAV.map((item) =>
        el("a", {
          href: item.href,
          text: item.label,
          class: item.href === here ? "active" : "",
        })
      )
    );
    const inner = el(
      "div",
      { class: "wrap header-inner" },
      el("a", { class: "logo", href: "index.html" }, document.createTextNode("DORK"),
        el("span", { text: "//" }), document.createTextNode("STUDIO")),
      nav,
      themeButton()
    );
    return el("header", { class: "site-header" }, inner);
  }

  function buildFooter() {
    const blurb = el(
      "div",
      { class: "foot-blurb" },
      el("p", {}, el("strong", { text: "Responsible use. " }),
        document.createTextNode(
          "This tool only builds standard, public search queries for pages that are already indexed. Use it for learning, research, and systems you own or are authorised to test."
        ))
    );
    const navMain = el(
      "nav",
      {},
      el("strong", { text: "Explore" }),
      ...NAV.map((i) => el("a", { href: i.href, text: i.label }))
    );
    const navInfo = el(
      "nav",
      {},
      el("strong", { text: "Info" }),
      ...FOOT.map((i) => el("a", { href: i.href, text: i.label }))
    );
    const cols = el("div", { class: "foot-cols" }, blurb, navMain, navInfo);
    const bottom = el("div", {
      class: "foot-bottom",
      text: "© 2026 Dork Search Studio · runs entirely in your browser · no tracking.",
    });
    return el("footer", { class: "site-footer" }, el("div", { class: "wrap" }, cols, bottom));
  }

  function revealOnScroll() {
    const items = document.querySelectorAll(".reveal:not(.in)");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((i) => io.observe(i));
  }

  // exposed so late-rendered content (templates/learn cards) can be revealed too
  window.DorkLayout = { reveal: revealOnScroll };

  function init() {
    document.body.prepend(buildHeader());
    document.body.append(buildFooter());
    revealOnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
