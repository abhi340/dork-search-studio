/* builder.js — single-screen, two-column query builder (home page).
   Left: the form. Right: live query + plain-English explainer + engines +
   save/copy-link. Below: saved dorks & recent searches.
   Reuses operators.js, engines.js, explain.js, storage.js, share.js. */

(function () {
  "use strict";

  const root = document.getElementById("builder-root");
  if (!root) return;

  function isoYearsAgo(years) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d.toISOString().slice(0, 10);
  }

  // shared categories from filetypes.js (fallback kept for safety)
  const FILETYPES = typeof FILE_GROUPS !== "undefined" ? FILE_GROUPS : [
    { label: "Any", value: "" },
    { label: "PDF", value: "pdf" },
    { label: "Word", value: "doc,docx" },
    { label: "Text", value: "txt" },
  ];
  const RECENCY = [
    { label: "Any time", value: "" },
    { label: "Past year", value: () => isoYearsAgo(1) },
    { label: "Past 3 years", value: () => isoYearsAgo(3) },
    { label: "Since 2020", value: "2020-01-01" },
  ];

  const TEXT_KEYS = [
    "keywords", "exact", "site", "exclude",
    "intitle", "inurl", "intext", "allintitle", "or", "around", "related", "numrange", "before",
  ];
  const chipState = { filetype: "", after: "" };

  /* ---- DOM helper ---- */
  function el(tag, opts, ...kids) {
    const n = document.createElement(tag);
    if (opts) {
      if (opts.class) n.className = opts.class;
      if (opts.text != null) n.textContent = opts.text;
      if (opts.type) n.type = opts.type;
      if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) n.setAttribute(k, v);
      if (opts.on) for (const [e, f] of Object.entries(opts.on)) n.addEventListener(e, f);
    }
    kids.forEach((k) => k != null && n.append(k));
    return n;
  }

  function textField(key, label, placeholder, type, big) {
    return el(
      "div",
      { class: "step-field" },
      el("label", { class: "field-label" + (big ? " field-label-lg" : ""), text: label, attrs: { for: `f-${key}` } }),
      el("input", {
        type: type || "text",
        class: big ? "input-lg" : "",
        attrs: {
          id: `f-${key}`,
          placeholder: placeholder || "",
          autocomplete: "off",
          spellcheck: "false",
          maxlength: "240",
          "aria-label": label,
        },
      })
    );
  }

  function chipField(key, label, choices) {
    const grid = el("div", { class: "choices", attrs: { "data-key": key } });
    choices.forEach((c) => {
      const resolved = typeof c.value === "function" ? c.value() : c.value;
      grid.append(
        el("button", {
          class: "choice",
          attrs: { type: "button", "data-value": resolved },
          text: c.label,
          on: {
            click: () => {
              setChip(key, resolved);
              updateAll();
            },
          },
        })
      );
    });
    return el("div", { class: "step-field" }, el("label", { class: "field-label", text: label }), grid);
  }

  function setChip(key, value) {
    chipState[key] = value;
    document
      .querySelectorAll(`.choices[data-key="${key}"] .choice`)
      .forEach((b) => b.classList.toggle("selected", b.getAttribute("data-value") === value));
  }

  function readAll() {
    const fields = { filetype: chipState.filetype, after: chipState.after };
    TEXT_KEYS.forEach((k) => {
      const input = document.getElementById(`f-${k}`);
      if (input) fields[k] = input.value;
    });
    return fields;
  }

  function applyFields(fields) {
    TEXT_KEYS.forEach((k) => {
      const input = document.getElementById(`f-${k}`);
      if (input) input.value = fields[k] != null ? fields[k] : "";
    });
    setChip("filetype", fields.filetype || "");
    setChip("after", fields.after || "");
    // reveal advanced if any advanced field is set
    const advKeys = ["intitle", "inurl", "intext", "allintitle", "or", "around", "related", "numrange", "before"];
    if (advKeys.some((k) => (fields[k] || "").trim())) advanced.open = true;
    updateAll();
  }

  /* ================= LEFT: form ================= */
  const form = el("div", { class: "step-card builder-main" });
  form.append(textField("keywords", "What are you looking for?", "e.g. climate change report", "text", true));
  form.append(
    el("div", { class: "builder-grid" },
      textField("exact", "Exact phrase", "must appear word-for-word"),
      textField("site", "Specific site", "e.g. nasa.gov  (or .gov)")
    )
  );
  form.append(chipField("filetype", "File type", FILETYPES));
  form.append(textField("exclude", "Exclude words", "e.g. sample template draft"));
  form.append(chipField("after", "Recency", RECENCY));

  const advGrid = el("div", { class: "builder-grid" },
    textField("intitle", "In page title", "e.g. index of"),
    textField("allintitle", "All words in title", "e.g. annual report"),
    textField("inurl", "In URL", "e.g. login"),
    textField("intext", "In body text", "e.g. confidential"),
    textField("or", "Any of these (comma-sep)", "e.g. login, signin, admin"),
    textField("around", "Words near each other", "word1, word2, distance"),
    textField("related", "Similar to site", "e.g. nytimes.com"),
    textField("numrange", "Number range", "e.g. 100..500"),
    textField("before", "Published before", "", "date")
  );
  const advanced = el("details", { class: "advanced" },
    el("summary", { text: "More filters (advanced operators)" }), advGrid);
  form.append(advanced);

  /* ================= RIGHT: live preview + actions ================= */
  const previewBox = el("code", { class: "result-query empty", text: "Your dork query will appear here…" });
  const explainerBox = el("p", { class: "explainer", text: "" });

  const engineGrid = el("div", { class: "engine-grid" });
  ENGINES.forEach((engine) => {
    engineGrid.append(
      el("button", {
        class: "btn engine-pick",
        attrs: { type: "button", disabled: "" },
        text: engine.name,
        on: { click: () => runSearch(engine) },
      })
    );
  });

  const copyBtn = el("button", { class: "btn", attrs: { type: "button", disabled: "" }, text: "Copy query",
    on: { click: (e) => copyText(buildQuery(readAll()), e.currentTarget) } });
  const linkBtn = el("button", { class: "btn", attrs: { type: "button", disabled: "" }, text: "Copy link",
    on: { click: (e) => copyText(DorkShare.link(readAll()), e.currentTarget) } });
  const clearBtn = el("button", { class: "btn btn-ghost", attrs: { type: "button" }, text: "Clear",
    on: { click: clearAll } });

  const nameInput = el("input", { type: "text", class: "save-name",
    attrs: { placeholder: "name this dork…", maxlength: "80", "aria-label": "Name this dork" } });
  const saveBtn = el("button", { class: "btn btn-primary", attrs: { type: "button", disabled: "" }, text: "Save",
    on: { click: doSave } });

  const previewCard = el("div", { class: "step-card preview-card" },
    el("span", { class: "preview-label", text: "Your query" }),
    previewBox,
    explainerBox,
    el("span", { class: "preview-label", text: "Search on" }),
    engineGrid,
    el("p", { class: "engine-note", text: "Google & Bing honor the most operators. Scholar, Yandex & Brave support fewer." }),
    el("div", { class: "action-row" }, copyBtn, linkBtn, clearBtn),
    el("div", { class: "save-row" }, nameInput, saveBtn)
  );

  const layout = el("div", { class: "builder-layout" }, form, el("aside", { class: "builder-side" }, previewCard));

  /* ================= BELOW: saved & recent ================= */
  const savedList = el("div", { class: "saved-list" });
  const recentList = el("div", { class: "saved-list" });

  const savedSection = el("section", { class: "section saved-section" },
    el("div", { class: "saved-head" },
      el("h2", { class: "section-title", text: "Saved dorks" }),
      el("button", { class: "btn btn-ghost mini", attrs: { type: "button" }, text: "Clear all",
        on: { click: () => { DorkStore.clearSaved(); renderSaved(); } } })
    ),
    savedList,
    el("div", { class: "saved-head" },
      el("h2", { class: "section-title", text: "Recent searches" }),
      el("button", { class: "btn btn-ghost mini", attrs: { type: "button" }, text: "Clear",
        on: { click: () => { DorkStore.clearHistory(); renderRecent(); } } })
    ),
    recentList
  );

  root.append(layout, savedSection);

  /* ================= behaviour ================= */
  function updatePreview() {
    const fields = readAll();
    const query = buildQuery(fields);
    if (query) {
      previewBox.textContent = query;
      previewBox.classList.remove("empty");
      explainerBox.textContent = typeof explainQuery === "function" ? explainQuery(fields) : "";
    } else {
      previewBox.textContent = "Your dork query will appear here…";
      previewBox.classList.add("empty");
      explainerBox.textContent = "";
    }
    const disabled = !query;
    [copyBtn, linkBtn, saveBtn].forEach((b) => (b.disabled = disabled));
    engineGrid.querySelectorAll("button").forEach((b) => (b.disabled = disabled));
    return query;
  }

  function updateAll() {
    updatePreview();
  }

  function runSearch(engine) {
    const fields = readAll();
    const query = buildQuery(fields);
    if (!query) return;
    DorkStore.addHistory(query, fields);
    renderRecent();
    document.dispatchEvent(new CustomEvent("dork:search")); // QuackOverflow cheers
    launchSearch(engine, query);
  }

  function doSave() {
    const fields = readAll();
    const query = buildQuery(fields);
    if (!query) return;
    DorkStore.saveDork(nameInput.value.trim(), query, fields);
    nameInput.value = "";
    renderSaved();
  }

  function clearAll() {
    root.querySelectorAll("input").forEach((i) => (i.value = ""));
    setChip("filetype", "");
    setChip("after", "");
    updateAll();
  }

  function renderSaved() {
    savedList.replaceChildren();
    const items = DorkStore.listSaved();
    if (!items.length) {
      savedList.append(el("p", { class: "empty-note", text: "No saved dorks yet — build one and hit Save." }));
      return;
    }
    items.forEach((it) => savedList.append(savedRow(it)));
  }

  function savedRow(it) {
    return el("div", { class: "saved-item" },
      el("div", { class: "saved-meta" },
        el("strong", { text: it.name }),
        el("code", { class: "saved-q", text: it.query })
      ),
      el("div", { class: "saved-actions" },
        el("button", { class: "btn mini", attrs: { type: "button" }, text: "Load",
          on: { click: () => { applyFields(it.fields); scrollTop(); } } }),
        el("button", { class: "btn mini btn-primary", attrs: { type: "button" }, text: "Run",
          on: { click: () => { DorkStore.addHistory(it.query, it.fields); renderRecent(); launchSearch(ENGINES[0], it.query); } } }),
        el("button", { class: "btn mini btn-ghost", attrs: { type: "button" }, text: "Delete",
          on: { click: () => { DorkStore.deleteSaved(it.id); renderSaved(); } } })
      )
    );
  }

  function renderRecent() {
    recentList.replaceChildren();
    const items = DorkStore.listHistory();
    if (!items.length) {
      recentList.append(el("p", { class: "empty-note", text: "Your recent searches will show up here." }));
      return;
    }
    items.forEach((it) =>
      recentList.append(
        el("div", { class: "saved-item" },
          el("div", { class: "saved-meta" }, el("code", { class: "saved-q", text: it.query })),
          el("div", { class: "saved-actions" },
            el("button", { class: "btn mini", attrs: { type: "button" }, text: "Load",
              on: { click: () => { applyFields(it.fields); scrollTop(); } } }),
            el("button", { class: "btn mini btn-primary", attrs: { type: "button" }, text: "Run",
              on: { click: () => launchSearch(ENGINES[0], it.query) } })
          )
        )
      )
    );
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyText(text, btn) {
    if (!text) return;
    const original = btn.textContent;
    const done = (ok) => {
      btn.textContent = ok ? "Copied!" : "Failed";
      btn.classList.add("flash");
      setTimeout(() => { btn.textContent = original; btn.classList.remove("flash"); }, 1200);
    };
    try {
      await navigator.clipboard.writeText(text);
      done(true);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      done(ok);
    }
  }

  /* Enter in any input launches Google */
  root.addEventListener("input", updatePreview);
  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target !== nameInput) {
      e.preventDefault();
      runSearch(ENGINES[0]);
    }
  });

  /* restore from a shared/bookmarked link, then first paint */
  const fromHash = DorkShare.fromHash();
  if (Object.keys(fromHash).length) applyFields(fromHash);
  updatePreview();
  renderSaved();
  renderRecent();
})();
