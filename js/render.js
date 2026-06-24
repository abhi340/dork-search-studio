/* render.js — renders the Templates grid and/or the Learn grid, whichever
   container exists on the current page. Reuses operators.js, templates.js,
   learn.js, engines.js. DOM-safe (no innerHTML). */

(function () {
  "use strict";

  function el(tag, opts, ...kids) {
    const n = document.createElement(tag);
    if (opts) {
      if (opts.class) n.className = opts.class;
      if (opts.text != null) n.textContent = opts.text;
      if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) n.setAttribute(k, v);
      if (opts.on) for (const [e, f] of Object.entries(opts.on)) n.addEventListener(e, f);
    }
    kids.forEach((k) => k != null && n.append(k));
    return n;
  }

  function flash(btn, text) {
    const original = btn.dataset.label || btn.textContent;
    btn.dataset.label = original;
    btn.textContent = text;
    btn.classList.add("flash");
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("flash");
    }, 1200);
  }

  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      flash(btn, "Copied!");
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      ta.remove();
      flash(btn, ok ? "Copied!" : "Copy failed");
    }
  }

  /* ---- Templates ---- */
  function renderTemplates() {
    const grid = document.getElementById("templates-grid");
    if (!grid || typeof TEMPLATES === "undefined") return;

    TEMPLATES.forEach((tpl) => {
      const query = buildQuery(tpl.fields);

      const engines = el("div", { class: "engine-row" });
      const styles = ["btn-primary", "btn-violet", "btn-teal"];
      ENGINES.forEach((engine, i) => {
        engines.append(
          el("button", {
            class: "btn " + (styles[i] || "btn-primary"),
            attrs: { type: "button" },
            text: engine.name,
            on: { click: () => launchSearch(engine, query) },
          })
        );
      });

      const copyBtn = el("button", {
        class: "btn btn-ghost",
        attrs: { type: "button" },
        text: "Copy",
        on: { click: (e) => copyText(query, e.currentTarget) },
      });

      // deep-link into the builder, pre-filled with this template's fields
      const openLink = el("a", {
        class: "btn mini",
        text: "Open in builder",
        attrs: {
          href:
            "index.html" +
            (typeof DorkShare !== "undefined" ? "#" + DorkShare.encode(tpl.fields) : ""),
        },
      });

      const card = el(
        "div",
        { class: "card reveal" },
        el("h3", { text: tpl.title }),
        el("p", { text: tpl.description }),
        el("code", { text: query }),
        engines,
        el("div", { class: "step-nav" }, copyBtn, el("div", { class: "spacer" }), openLink)
      );
      grid.append(card);
    });
  }

  /* ---- Learn ---- */
  function renderLearn() {
    const grid = document.getElementById("learn-grid");
    if (!grid || typeof OPERATORS === "undefined") return;

    OPERATORS.forEach((op) => {
      grid.append(
        el(
          "div",
          { class: "card learn-card reveal" },
          el("h3", { text: op.label }),
          el("code", { text: op.example }),
          el("p", { text: op.help }),
          el("small", { class: "good-for", text: `Good for: ${op.goodFor}` })
        )
      );
    });

    if (typeof LEARN_TIPS !== "undefined") {
      LEARN_TIPS.forEach((tip) => {
        grid.append(
          el(
            "div",
            { class: "card learn-card tip reveal" },
            el("h3", { text: tip.title }),
            el("p", { text: tip.body })
          )
        );
      });
    }
  }

  function init() {
    renderTemplates();
    renderLearn();
    // reveal the cards we just added (layout's first scan ran before they existed)
    if (window.DorkLayout && window.DorkLayout.reveal) window.DorkLayout.reveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
