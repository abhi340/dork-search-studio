/* duck.js — "QuackOverflow", a floating, animated, talkative mascot helper.
   100% scripted: canned answers + keyword intents + reactions/jokes/easter eggs.
   NOT an AI — no model, no network, just a duck with a JSON-shaped soul.
   Built with DOM/SVG APIs (no innerHTML) so it stays CSP-safe. */

(function () {
  "use strict";

  const SVGNS = "http://www.w3.org/2000/svg";

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

  function s(tag, attrs, text) {
    const n = document.createElementNS(SVGNS, tag);
    for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v);
    if (text != null) n.textContent = text;
    return n;
  }

  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const pick = (r) => (typeof r === "function" ? r() : Array.isArray(r) ? rnd(r) : r);

  /* ---- artwork ---- */
  function duckArt() {
    const root = s("svg", { viewBox: "0 0 100 100", class: "duck-art", "aria-hidden": "true" });
    const ink = { stroke: "#0a0a0a", "stroke-width": "4", "stroke-linejoin": "round" };
    const add = (tag, attrs) => root.append(s(tag, Object.assign({}, attrs, ink)));
    root.append(s("path", Object.assign({ d: "M22 60 L8 54 L22 70 Z", fill: "#f5c400" }, ink)));
    root.append(s("ellipse", Object.assign({ cx: "52", cy: "64", rx: "31", ry: "23", fill: "#ffd23f" }, ink)));
    root.append(s("path", Object.assign({ class: "duck-wing", d: "M40 58 q18 -8 30 2 q-14 12 -30 -2 Z", fill: "#f5c400" }, ink)));
    root.append(s("circle", Object.assign({ cx: "70", cy: "40", r: "18", fill: "#ffd23f" }, ink)));
    root.append(s("path", Object.assign({ d: "M86 38 q14 2 14 7 q-2 5 -14 4 Z", fill: "#ff7a00" }, ink)));
    root.append(s("circle", { class: "duck-eye", cx: "74", cy: "35", r: "3.4", fill: "#0a0a0a" }));
    root.append(s("path", Object.assign({ d: "M46 86 l-6 8 M46 86 l6 8", fill: "none" }, ink)));
    // sleepy z's (shown only when .sleeping)
    const zzz = s("g", { class: "duck-zzz" });
    zzz.append(s("text", { x: "84", y: "22", "font-size": "13", "font-family": "monospace", "font-weight": "bold", fill: "#0a0a0a" }, "z"));
    zzz.append(s("text", { x: "92", y: "13", "font-size": "9", "font-family": "monospace", "font-weight": "bold", fill: "#0a0a0a" }, "z"));
    root.append(zzz);
    return el("span", { class: "duck-art-wrap" }, root);
  }

  /* ================= scripted content ================= */
  const GREETINGS = {
    "index.html": "Quack. I'm QuackOverflow — like Stack Overflow, but feathered and unhelpfully confident. Fill the boxes; I'll supervise. (Type to me, or tap a chip.)",
    "templates.html": "Recipes! Tap “Open in builder” on any card and tweak it. I'd cook, but I have no thumbs and questionable ethics.",
    "learn.html": "Operators are just polite-but-firm instructions for the search engine. Read on — I'll hover ominously.",
    "default": "Quack. Need a hand? Tap a chip or just type. Runtime: 1 duck. Dependencies: 0. AI: also 0.",
  };

  const CHIPS = [
    { label: "What's a dork?", a: "A precise search recipe — operators like site: and filetype: that tell the engine exactly what you want. No trench coat required." },
    { label: "Find PDFs", a: "Domain in “Specific site”, then tap PDF under File type. You now out-search 90% of humanity. Use it for good." },
    { label: "Find login pages", a: "Open “More filters” → “In URL” → type login, and add the site. For variants use Any-of: login, signin, admin, dashboard." },
    { label: "Exclude junk", a: "Use “Exclude words” for things like sample template draft. Each word gets a minus sign and a stern look." },
    { label: "Tell me a joke", a: () => rnd(JOKES) },
    { label: "Random tip", a: () => nextTip() },
  ];

  const TIPS = [
    "Quotes mean exact: \"data protection policy\" matches that phrase, in order.",
    "Stack operators: site:gov.in filetype:pdf intitle:report. Narrower = better.",
    "An asterisk * is a wildcard: \"how to * a website\" fills in the blank.",
    "before: and after: pin a time window. Great for fresh (or ancient) results.",
    "Save a dork you like — future-you will be smugly grateful.",
    "Use “Copy link” to send a fully-built search to a friend. Romance, basically.",
    "related:nytimes.com finds sites similar to a domain. Spy responsibly.",
    "AROUND(n) keeps two words close: tesla AROUND(5) battery.",
    "allintitle: demands ALL the words in the title. Very bossy. Very effective.",
  ];

  const JOKES = [
    "Why did the developer go broke? Too many cache misses. …I'll see myself to the pond.",
    "I'd tell you a UDP joke, but you might not get it.",
    "There are 10 kinds of people: those who read binary, and ducks.",
    "My favorite operator is site: — I love a homebody.",
    "Why don't ducks use Stack Overflow? Every answer is just 'have you tried migrating?'",
    "I tried to catch fog yesterday. Mist. Anyway, type a search.",
    "A SQL duck waddles up to two tables and asks: 'may I join you?'",
  ];

  const FORTUNES = [
    "Your next search returns exactly what you need on page 1. (Unlikely. Believe anyway.)",
    "A filetype:pdf is in your near future.",
    "You will forget a closing quote. The engine will forgive you.",
    "Great results come to those who use site:.",
    "Soon: you teach someone the intitle: trick and feel like a wizard.",
  ];

  const QUACKS = ["Quack.", "Quack quack.", "You speak duck? Impressive.", "Quack. (That's 'hello' in my one language.)"];
  const CHEERS = ["Launching. Godspeed, and mind the ads.", "Off you go — find something incriminating (ethically).", "Search away. I'll keep your seat warm.", "Deploying your dork. No take-backs."];

  const FALLBACKS = [
    "I'm scripted, not psychic — try a chip, or ask about PDFs, sites, login pages, or dorks.",
    "That one matched exactly none of my if-statements. Rephrase, or tap a chip?",
    "Above my pay grade (which is zero — I'm a duck). Ask me about searching?",
    "Try asking me to 'dance', 'tell a joke', or 'find pdfs'. I contain multitudes (six).",
  ];

  /* reactions: trigger an animation + a quip */
  const REACTIONS = [
    { re: /\b(dance|boogie|groove|moves?)\b/i, anim: "dance", a: ["Watch these moves. No knees, so temper your expectations.", "Behold: interpretive waddle."] },
    { re: /\b(spin|twirl|barrel ?roll|360)\b/i, anim: "spin", a: ["Wheee. Equilibrium: gone.", "360 no-scope. I'm basically a gamer."] },
    { re: /\b(jump|hop|leap|bounce)\b/i, anim: "jump", a: ["Hop complete. That's cardio for the year.", "Up! Down! Fitness duck!"] },
    { re: /\b(party|celebrate|confetti|woo+|yay)\b/i, anim: "party", a: ["PARTY MODE. BYOB — Bring Your Own Bread. (Don't. It's bad for me.)", "Confetti deployed. Cleanup is a problem for future duck."] },
    { re: /\b(sleep|nap|tired|bored|good ?night|night)\b/i, anim: "sleep", a: ["Powering down. Wake me with a good query. Zzz.", "Nap mode engaged. I dream of well-formed dorks."] },
    { re: /\b(wave|greetings)\b/i, anim: "wave", a: ["*waves wing aggressively*", "Hi. That was my entire arm. Wing. Whatever."] },
    { re: /\b(good (duck|boy|girl|job)|nice|well done|love you)\b/i, anim: "jump", a: ["I KNOW. Thank you. I'll treasure this forever.", "Validation! My one weakness."] },
    { re: /\b(bad duck|stupid|dumb|useless|shut up)\b/i, anim: "dance", a: ["Rude. I'm doing my best with zero neurons.", "Harsh, but I've been called worse by a linter."] },
  ];

  /* keyword intents for free-text */
  const INTENTS = [
    { re: /\b(hi|hello|hey|yo|sup|howdy)\b/i, a: ["Quack. State your search business.", "Hello, human. I've read zero of your emails — unlike some assistants.", "Hi. I'm legally and spiritually a duck."] },
    { re: /\b(pdfs?|document|file ?type|files?)\b/i, a: "Domain in “Specific site”, tap PDF under File type. Boom — every PDF on that site." },
    { re: /\b(login|log ?in|admin|sign ?in|dashboard)\b/i, a: "“More filters” → “In URL” → login. Add the site. For variety: Any-of: login, signin, admin." },
    { re: /\b(site|domain|website|url)\b/i, a: "Put the domain in “Specific site”. Use .gov or .edu to scope a whole category. Power move." },
    { re: /\b(exclude|remove|without|minus|ignore)\b/i, a: "“Exclude words” strips noise: sample template draft. Each word gets a minus and a stern look." },
    { re: /\b(exact|phrase|quote)\b/i, a: "Use the “Exact phrase” box — matched word-for-word, in order. No improvising allowed." },
    { re: /\b(dork|operator|advanced|syntax)\b/i, a: "A dork = operators stacked together. site: + filetype: + intitle: = laser focus. The Learn page has them all." },
    { re: /\b(date|recent|old|year|before|after)\b/i, a: "Use the Recency chips, or “Published before” for time-travel. Search responsibly across decades." },
    { re: /\b(save|share|link|bookmark)\b/i, a: "Hit Save to keep a dork, or “Copy link” to send your exact setup to someone. Friendship via query strings." },
    { re: /\b(ai|a\.i|chatgpt|gpt|robot|model|llm|neural)\b/i, a: ["I'm not an AI. I'm a duck with a JSON file and big dreams.", "No model, no neurons, no training data — just hard-coded sass.", "If I were an AI I'd be billing you. I'm a duck. It's free."] },
    { re: /\b(name|who are you|what are you)\b/i, a: ["QuackOverflow. Like Stack Overflow, but I close your questions with kindness.", "The name's Overflow. QuackOverflow."] },
    { re: /\b(debug|stuck|broken|error|bug|not working)\b/i, a: ["Classic rubber-duck debugging: explain the problem to me, out loud, slowly. I'll nod. You'll solve it. That's the trick.", "Tell me what it *should* do vs what it does. I won't understand, but you will. Science."] },
    { re: /\b(thanks|thank you|ty|cheers)\b/i, a: ["Anytime. Adding it to my list of zero accomplishments.", "You're welcome. Tip your duck.", "De-quack-o."] },
    { re: /\b(bye|cya|see ya|later|goodbye)\b/i, a: ["Quack out.", "Go find something. I believe in you, statistically.", "Bye. I'll be here, defying gravity in the corner."] },
    { re: /\b(joke|funny|laugh|meme)\b/i, a: () => rnd(JOKES) },
    { re: /\b(fortune|future|predict|horoscope)\b/i, a: () => rnd(FORTUNES) },
    { re: /\b(marry|cute|adorable|crush)\b/i, a: ["Flattered, but I'm married to my craft (floating).", "Kind of you. I'm a duck. This can't work, but I respect the ambition."] },
    { re: /\b(bread|food|eat|hungry|feed)\b/i, a: "No bread please — genuinely bad for ducks. Feed me well-formed queries instead." },
    { re: /\b(help|how|what can you|commands?)\b/i, a: "I explain operators, suggest searches, tell mediocre jokes, do tricks (try 'dance' or 'party'), and emotionally support your debugging." },
  ];

  let tipIx = Math.floor(Math.random() * TIPS.length);
  function nextTip() {
    tipIx = (tipIx + 1) % TIPS.length;
    return TIPS[tipIx];
  }

  function currentFile() {
    const p = location.pathname.split("/").pop();
    return p && p.length ? p : "index.html";
  }

  /* ================= widget ================= */
  function build() {
    const messages = el("div", { class: "duck-messages", attrs: { role: "log", "aria-live": "polite" } });

    function bubble(text, who) {
      messages.append(el("div", { class: "duck-bubble " + who, text }));
      messages.scrollTop = messages.scrollHeight;
    }

    /* chatbot-style typing indicator before each duck reply */
    function reply(text) {
      const dots = el("div", { class: "duck-bubble duck typing" },
        el("span", { class: "dot" }), el("span", { class: "dot" }), el("span", { class: "dot" }));
      messages.append(dots);
      messages.scrollTop = messages.scrollHeight;
      setTimeout(() => {
        dots.remove();
        bubble(text, "duck");
      }, 560);
    }

    /* ---- reactions / animations ---- */
    let confettiOn = false;
    function confetti() {
      if (confettiOn) return;
      confettiOn = true;
      const colors = ["#c8f000", "#2b4cff", "#ff4d8d", "#ffd23f"];
      for (let i = 0; i < 16; i++) {
        const c = el("span", { class: "duck-confetti" });
        c.style.left = 50 + (Math.random() * 70 - 35) + "%";
        c.style.background = colors[i % colors.length];
        c.style.setProperty("--dx", Math.random() * 140 - 70 + "px");
        c.style.setProperty("--dr", Math.random() * 540 + "deg");
        c.style.animationDelay = Math.random() * 0.12 + "s";
        widget.append(c);
        setTimeout(() => c.remove(), 1200);
      }
      setTimeout(() => (confettiOn = false), 700);
    }

    function react(type) {
      widget.classList.remove("sleeping");
      if (type === "sleep") {
        widget.classList.add("sleeping");
        return;
      }
      if (type === "party") confetti();
      const cls = { dance: "dancing", spin: "celebrate", jump: "jumping", wave: "waving", party: "celebrate" }[type] || "celebrate";
      widget.classList.remove(cls);
      void widget.offsetWidth; // restart animation
      widget.classList.add(cls);
      setTimeout(() => widget.classList.remove(cls), cls === "dancing" ? 1500 : 900);
    }

    let quackCount = 0;
    function respond(raw) {
      const t = (raw || "").trim();
      if (!t) return;
      bubble(t, "me");
      resetIdle();

      if (/\bquack+\b/i.test(t)) {
        quackCount++;
        react("spin");
        reply(quackCount >= 5
          ? "QUACK QUACK QUACK — okay, you found my entire personality. Still 0% AI."
          : rnd(QUACKS));
        return;
      }
      const rx = REACTIONS.find((r) => r.re.test(t));
      if (rx) {
        react(rx.anim);
        reply(pick(rx.a));
        return;
      }
      const hit = INTENTS.find((i) => i.re.test(t));
      reply(hit ? pick(hit.a) : rnd(FALLBACKS));
    }

    function ask(chip) {
      bubble(chip.label, "me");
      resetIdle();
      reply(pick(chip.a));
    }

    /* chips */
    const chips = el("div", { class: "duck-chips" });
    CHIPS.forEach((c) =>
      chips.append(el("button", {
        class: "duck-chip" + (c.label === "Random tip" ? " tip" : ""),
        attrs: { type: "button" }, text: c.label, on: { click: () => ask(c) },
      }))
    );

    /* type-to-me input */
    const input = el("input", {
      class: "duck-input",
      attrs: { type: "text", placeholder: "ask me something…", maxlength: "140", autocomplete: "off", "aria-label": "Ask QuackOverflow" },
    });
    const send = el("button", { class: "duck-send", attrs: { type: "button", "aria-label": "Send message" }, text: "Ask" });
    function submit() {
      const v = input.value;
      input.value = "";
      respond(v);
    }
    send.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } });
    input.addEventListener("focus", resetIdle);
    const inputRow = el("div", { class: "duck-inputrow" }, input, send);

    const closeBtn = el("button", { class: "duck-close", attrs: { type: "button", "aria-label": "Close helper" }, text: "✕" });

    const panel = el("div",
      { class: "duck-panel", attrs: { role: "dialog", "aria-label": "QuackOverflow helper", hidden: "" } },
      el("div", { class: "duck-header" }, el("strong", { text: "QuackOverflow" }),
        el("span", { class: "duck-tag", text: "0% AI · 100% duck" }), closeBtn),
      messages, chips, inputRow,
      el("div", { class: "duck-foot", text: "Scripted helper. No model, no internet, just vibes & search tips." })
    );

    const btn = el("button", {
      class: "duck-button",
      attrs: { type: "button", "aria-label": "Open QuackOverflow, the search helper", "aria-expanded": "false" },
    });
    btn.append(duckArt());

    const teaser = el("div",
      { class: "duck-teaser", attrs: { hidden: "", role: "button", tabindex: "0" } },
      el("span", { text: "Psst — new here? I'm QuackOverflow. Tap me, no signup, no AI, no shame." }),
      el("span", { class: "duck-teaser-x", attrs: { "aria-hidden": "true" }, text: "✕" })
    );

    const widget = el("div", { class: "duck-widget" }, teaser, panel, btn);

    /* idle → sleep while open */
    let idleTimer = null;
    function resetIdle() {
      widget.classList.remove("sleeping");
      clearTimeout(idleTimer);
      if (open) idleTimer = setTimeout(() => react("sleep"), 25000);
    }

    let teaserTimer = null;
    function hideTeaser() {
      widget.classList.remove("teasing");
      teaser.setAttribute("hidden", "");
      if (teaserTimer) { clearTimeout(teaserTimer); teaserTimer = null; }
    }

    let open = false;
    let greeted = false;
    function setOpen(v) {
      open = v;
      btn.setAttribute("aria-expanded", String(v));
      widget.classList.toggle("open", v);
      if (v) {
        hideTeaser();
        panel.removeAttribute("hidden");
        if (!greeted) { greeted = true; reply(GREETINGS[currentFile()] || GREETINGS.default); }
        resetIdle();
        setTimeout(() => input.focus(), 180);
      } else {
        panel.setAttribute("hidden", "");
        clearTimeout(idleTimer);
        widget.classList.remove("sleeping");
      }
    }

    btn.addEventListener("click", () => setOpen(!open));
    closeBtn.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setOpen(false); });

    teaser.addEventListener("click", (e) => {
      if (e.target.classList.contains("duck-teaser-x")) { hideTeaser(); return; }
      setOpen(true);
    });
    teaser.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); }
    });

    /* cross-component reactions (fired by builder + theme toggle) */
    document.addEventListener("dork:search", () => {
      react("jump");
      if (open) bubble(rnd(CHEERS), "duck");
    });
    document.addEventListener("dork:theme", (e) => {
      react("wave");
      if (open) {
        const dark = e.detail && e.detail.theme === "dark";
        bubble(dark ? "Dark mode. Mysterious. I approve." : "Light mode. Bold. My retinas send thanks.", "duck");
      }
    });

    document.body.append(widget);

    function isFirstVisit() {
      try {
        if (localStorage.getItem("dork-duck-greeted")) return false;
        localStorage.setItem("dork-duck-greeted", "1");
        return true;
      } catch (_) { return false; }
    }

    if (isFirstVisit()) {
      teaserTimer = setTimeout(() => {
        if (open) return;
        teaser.removeAttribute("hidden");
        widget.classList.add("teasing");
        teaserTimer = setTimeout(hideTeaser, 9000);
      }, 1400);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
