# Dork Search Studio

A friendly website that helps you **find exactly what you're looking for** online
by building **precise** search queries — instead of typing a few words and
scrolling through pages of noise. It's powered by well-known search-engine
operators (often called **"Google dorking"**): `site:`, `filetype:`,
`intitle:`, `inurl:`, `intext:`, `"exact phrase"`, `-exclude`, `OR`, and date
filters.

> **Built by [Abhiram Kodicherla](https://github.com/abhi340) together with
> [Claude](https://claude.com/claude-code)** (Anthropic's Claude Code, model
> Opus 4.8). A human-directed, AI-implemented project — see
> [How this was built](#how-this-was-built-human--claude) below.

**Built for every skill level (level 1 → n):**

- **Beginners** use the single-screen **builder** — fill in plain fields ("What
  are you looking for?", a file-type chip, a site) and the precise query builds
  itself live. Advanced operators stay tucked behind a **More filters** expander
  so nothing feels cluttered.
- **Power users** get a complete, copy-ready dork, plus a **Templates** page of
  instant recipes.
- **Curious?** The **Learn** page explains every operator with a copy-ready
  example.

**End-to-end features:**

- **Two-column builder** with a **live query** and a **plain-English explainer**
  that updates as you type ("Find PDF files on nasa.gov containing …").
- **7 search engines:** Google, Bing, DuckDuckGo, Brave, Startpage, Yandex, and
  Google Scholar.
- **Rich operators:** site, filetype, exact phrase, in-title/url/text,
  all-in-title, OR, exclude, date range, `related:`, `AROUND(n)` proximity, and
  number ranges.
- **13 file-type categories:** PDF, Word, Excel, PowerPoint, **Video, Audio,
  Image, Archive, Code, Data, Text, E-book** — a category with multiple
  extensions expands to an OR group (e.g. Video → `(filetype:mp4 OR filetype:mov OR …)`).
- **Saved dorks & recent history** — name and re-run your queries (stored locally).
- **Shareable links** — "Copy link" encodes your whole setup into a URL;
  templates deep-link straight into the builder, pre-filled.
- **QuackOverflow, the helper** — a floating, animated mascot that answers common
  questions and drops search tips in a deadpan-professional tone. Auto-greets
  once on first visit. Fully scripted (canned answers) — **not an AI**, no model,
  no network calls.
- **Reverse dork parser** — paste an existing query (`site:x.com filetype:pdf "y" -z`)
  and it loads into the builder *and* explains it. The tool reads dorks, not just writes them.
- **Domain Recon Pack** (`recon.html`) — enter one domain, get a ready-made set of
  useful dorks (open directories, login pages, exposed files, configs…). For
  learning and **authorised** testing only.
- **Backup & power tools** — export/import saved dorks as JSON, "Open all engines"
  at once, and keyboard shortcuts (`/` focus search, `Ctrl/Cmd+Enter` to search).
- **Installable PWA** — add to home screen and use **fully offline** (manifest +
  service worker; cache-first for same-origin assets, never caches search engines).

Design: **playful neo-brutalism** — bold borders and chunky offset shadows, but
rounded, bright, bouncy and spacious. **Light & dark themes** (toggle in the
header, remembered across visits). System fonts only — no external requests,
which keeps the security policy strict and the site offline-safe.

## Pages

| Page             | What's there                                  |
| ---------------- | --------------------------------------------- |
| `index.html`     | The single-screen query builder (home)        |
| `templates.html` | One-click ready-made search recipes           |
| `recon.html`     | Domain Recon Pack — dorks for one domain       |
| `learn.html`     | Every operator explained                      |
| `about.html`     | What the tool is and how it works             |
| `privacy.html`   | Privacy policy (we collect nothing)           |
| `terms.html`     | Terms of use / responsible-use policy         |

## How to run

No build step, no install. It's a static site.

- **Easiest:** double-click `index.html` (or run `start index.html`).
- **Recommended (clipboard + new-tab behave best over http):**
  ```
  python -m http.server 8000
  ```
  then open <http://localhost:8000>.

## Deploy (Cloudflare Pages)

Static site, so there's no build command.

1. Push the folder to a Git repo, then in the Cloudflare dashboard:
   **Workers & Pages → Create → Pages → Connect to Git**
   - Build command: *(leave empty)*
   - Build output directory: `/`
2. Or deploy from your machine with Wrangler:
   ```
   npx wrangler pages deploy . --project-name dork-search-studio
   ```

The `_headers` file is picked up automatically and applies the security headers
(CSP, HSTS, X-Frame-Options, etc.) to every route.

## Project structure

```
index.html / templates.html / recon.html / learn.html
about.html / privacy.html / terms.html
_headers              # Cloudflare Pages security headers
manifest.webmanifest  # PWA manifest (installable)
sw.js                 # service worker (offline cache-first)
css/styles.css        # neo-brutalist theme + light/dark + animations
js/theme.js           # light/dark theme + persistence (loads in <head>)
js/layout.js          # shared header (nav + theme toggle) + footer + scroll reveals
js/operators.js       # every operator — single source of truth
js/engines.js         # query assembly + search-engine URLs (7 engines)
js/filetypes.js       # file-type categories (docs, video, audio, image, code…)
js/explain.js         # plain-English explanation of the current query
js/parse.js           # reverse parser (query string -> builder fields)
js/storage.js         # saved dorks + recent history + export/import (localStorage)
js/share.js           # encode/decode builder state in the URL hash
js/templates.js       # preset recipes (data)
js/learn.js           # teaching tips (data)
js/builder.js         # the two-column query builder (home)
js/render.js          # renders the templates + learn grids
js/recon.js           # Domain Recon Pack generator
js/duck.js            # "QuackOverflow" — the scripted animated mascot helper
js/pwa.js             # registers the service worker
```

Add a new operator in `operators.js` and it appears in the Learn page
automatically. Reference its key in `builder.js` to surface it in the builder.

## Security

- **No backend, no secrets, no third-party scripts** — nothing to breach.
- **XSS-proof rendering:** every node is built with `createElement` +
  `textContent` (never `innerHTML`), so no data can be parsed as markup.
- **Strict CSP** via both a `<meta>` tag (portable, works on `file://`) and the
  `_headers` file: `default-src 'none'`, only same-origin scripts/styles.
- **Hardened links:** searches open with `noopener,noreferrer`;
  `Referrer-Policy: no-referrer`.
- **Clickjacking blocked:** `frame-ancestors 'none'` / `X-Frame-Options: DENY`.
- **No tracking:** the only thing stored locally is your theme choice.

## How this was built (human + Claude)

This project was built **conversationally** — a back-and-forth between a human
with the vision and an AI that wrote the code.

- **Abhiram Kodicherla** ([@abhi340](https://github.com/abhi340)) — the human.
  Came up with the idea ("a simple site to search all sites and find exactly what
  you want — Google dorking"), made every product and design call, and steered the
  project through many rounds of feedback: pick the brutalist look, simplify the
  flow, fix the mobile header, widen the desktop layout, add real features, and
  "add a funny duck that helps people."
- **Claude** ([Claude Code](https://claude.com/claude-code), model **Opus 4.8**) —
  the AI pair-programmer. Turned each request into working code: the builder and
  operator engine, the live plain-English explainer, saved dorks & history,
  shareable links, the 7-engine launcher, the neo-brutalist + light/dark theming,
  the animations, and **QuackOverflow** the mascot. Also wrote the tests
  (a jsdom smoke-test harness verified every page renders with zero runtime
  errors), kept it dependency-free, and hardened security (strict CSP, XSS-proof
  DOM rendering, security headers).

**How it actually went:** the site was rebuilt and refined live across the
conversation — from a first plain version, to bold brutalism, to a step-by-step
wizard, back to a clean single-screen builder, then feature-by-feature until it
became what's here. Every commit is human intent translated into code by Claude.

The whole thing is **vanilla HTML/CSS/JS — no frameworks, no build step, no
dependencies** — so it stays easy to read, run, and host.

## Responsible use

This tool only builds standard, public search queries and surfaces pages already
indexed by search engines. Use it for learning, research, and systems you own or
are authorised to test — not to access or misuse private data. See `terms.html`.
