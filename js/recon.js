/* recon.js — Domain Recon Pack. Enter one domain, get a set of useful dorks
   generated for it. For learning + AUTHORISED testing only. Reuses operators.js,
   engines.js, share.js. DOM-safe (no innerHTML). */

(function () {
  "use strict";

  const root = document.getElementById("recon-root");
  if (!root) return;

  /* each item builds a fields object from the cleaned domain */
  const RECON = [
    { title: "Open directory listings", desc: "Exposed file/folder index pages.", f: (d) => ({ site: d, intitle: "index of" }) },
    { title: "Login & admin portals", desc: "Sign-in / admin entry points.", f: (d) => ({ site: d, or: "login, signin, admin, dashboard, portal" }) },
    { title: "Documents & spreadsheets", desc: "PDFs, Office docs and data files.", f: (d) => ({ site: d, filetype: "pdf,doc,docx,xls,xlsx,csv" }) },
    { title: "Config, backup & logs", desc: "Sensitive text/config/backup files.", f: (d) => ({ site: d, or: "config, backup, dump, env", filetype: "txt,xml,json,sql,log" }) },
    { title: "Subdomains", desc: "Indexed subdomains (excluding www).", f: (d) => ({ site: "*." + d, exclude: "www" }) },
    { title: "Source / version control", desc: "Repo and source-control paths.", f: (d) => ({ site: d, inurl: ".git" }) },
    { title: "Secrets mentioned in text", desc: "Pages referencing keys/passwords.", f: (d) => ({ site: d, or: "api_key, apikey, password, secret, token" }) },
    { title: "Error & debug pages", desc: "Stack traces and debug output.", f: (d) => ({ site: d, or: "error, warning, exception, stack trace" }) },
    { title: "Upload directories", desc: "Upload / media folders.", f: (d) => ({ site: d, inurl: "upload" }) },
    { title: "Old / archived copies", desc: "Backups and stale pages.", f: (d) => ({ site: d, or: "old, bak, backup, archive" }) },
  ];

  const ENGINES_SHOWN = ENGINES.slice(0, 3); // Google, Bing, DuckDuckGo per card

  function el(tag, opts, ...kids) {
    const n = document.createElement(tag);
    if (opts) {
      if (opts.class) n.className = opts.class;
      if (opts.text != null) n.textContent = opts.text;
      if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) n.setAttribute(k, v);
      if (opts.on) for (const [e, fn] of Object.entries(opts.on)) n.addEventListener(e, fn);
    }
    kids.forEach((k) => k != null && n.append(k));
    return n;
  }

  function cleanDomain(v) {
    return String(v || "")
      .trim()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  async function copyText(text, btn) {
    const original = btn.textContent;
    const done = (ok) => {
      btn.textContent = ok ? "Copied!" : "Failed";
      btn.classList.add("flash");
      setTimeout(() => { btn.textContent = original; btn.classList.remove("flash"); }, 1200);
    };
    try { await navigator.clipboard.writeText(text); done(true); }
    catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.append(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove(); done(ok);
    }
  }

  const grid = el("div", { class: "grid" });

  function render(domain) {
    grid.replaceChildren();
    const d = cleanDomain(domain);
    if (!d) {
      grid.append(el("p", { class: "empty-note", text: "Enter a domain above to generate a recon pack." }));
      return;
    }
    RECON.forEach((item) => {
      const fields = item.f(d);
      const query = buildQuery(fields);

      const engines = el("div", { class: "engine-row" });
      const styles = ["btn-primary", "btn-violet", "btn-teal"];
      ENGINES_SHOWN.forEach((engine, i) => {
        engines.append(el("button", {
          class: "btn " + (styles[i] || "btn-primary"),
          attrs: { type: "button" }, text: engine.name,
          on: { click: () => launchSearch(engine, query) },
        }));
      });

      const copyBtn = el("button", { class: "btn btn-ghost mini", attrs: { type: "button" }, text: "Copy",
        on: { click: (e) => copyText(query, e.currentTarget) } });
      const openLink = el("a", { class: "btn mini", text: "Open in builder",
        attrs: { href: "index.html" + (typeof DorkShare !== "undefined" ? "#" + DorkShare.encode(fields) : "") } });

      grid.append(el("div", { class: "card reveal" },
        el("h3", { text: item.title }),
        el("p", { text: item.desc }),
        el("code", { text: query }),
        engines,
        el("div", { class: "step-nav" }, copyBtn, el("div", { class: "spacer" }), openLink)
      ));
    });
    if (window.DorkLayout && window.DorkLayout.reveal) window.DorkLayout.reveal();
  }

  const input = el("input", {
    class: "input-lg recon-input",
    attrs: { type: "text", placeholder: "example.com", "aria-label": "Domain", autocomplete: "off", spellcheck: "false", maxlength: "120" },
  });
  const genBtn = el("button", { class: "btn btn-primary", attrs: { type: "button" }, text: "Generate pack",
    on: { click: () => render(input.value) } });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); render(input.value); } });

  root.append(
    el("div", { class: "step-card recon-form" },
      el("label", { class: "field-label field-label-lg", text: "Domain to investigate", attrs: { for: "recon-domain" } }),
      el("div", { class: "recon-row" }, input, genBtn),
      el("p", { class: "engine-note", text: "For learning and AUTHORISED testing only. These dorks only surface pages search engines already index publicly." })
    ),
    grid
  );
  input.id = "recon-domain";

  // pre-fill from ?hash deep link or default empty state
  render("");
})();
