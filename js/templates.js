/* templates.js — ready-made dork presets. Clicking a card fills the builder.
   Each template's `fields` keys must match operator keys in operators.js. */

const TEMPLATES = [
  {
    title: "PDFs on a specific site",
    description: "Find every PDF document hosted on one website.",
    fields: { site: "example.com", filetype: "pdf" },
  },
  {
    title: "Open directory listings",
    description: 'Pages titled "index of" — exposed file/folder listings.',
    fields: { intitle: "index of", exclude: "html htm php asp" },
  },
  {
    title: "Login & admin pages",
    description: "URLs that look like sign-in or admin entry points.",
    fields: { site: "example.com", or: "login, signin, admin, dashboard" },
  },
  {
    title: "Spreadsheets & datasets on a domain",
    description: "Excel / CSV files published under a domain.",
    fields: { site: "example.com", filetype: "xls", or: "data, report, export" },
  },
  {
    title: "Exact-phrase research",
    description: "Match a precise phrase while cutting out sample noise.",
    fields: { exact: "annual report 2023", exclude: "template sample draft" },
  },
  {
    title: "Recent results only",
    description: "Keywords limited to a fresh time window.",
    fields: { keywords: "renewable energy policy", after: "2024-01-01" },
  },
  {
    title: "Government / academic sources",
    description: "Restrict a topic to .gov and .edu style domains.",
    fields: { keywords: "climate dataset", site: "gov", filetype: "pdf" },
  },
  {
    title: "Configuration & log files",
    description: "Common exposed text/config/log file types on a site.",
    fields: { site: "example.com", or: "config, backup, settings", filetype: "txt" },
  },
  {
    title: "Videos on a specific site",
    description: "Find video files (mp4, mov, avi, mkv, webm) on a website.",
    fields: { site: "example.com", filetype: "mp4,mov,avi,mkv,webm" },
  },
  {
    title: "Images on a domain",
    description: "Find image files (jpg, png, gif, svg, webp) on a site.",
    fields: { site: "example.com", filetype: "jpg,png,gif,svg,webp" },
  },
  {
    title: "Audio & podcasts",
    description: "Track down audio files (mp3, wav, flac, m4a, ogg).",
    fields: { keywords: "interview", filetype: "mp3,wav,flac,m4a,ogg" },
  },
  {
    title: "E-books to read",
    description: "Find e-book files (epub, mobi, azw3) by title or author.",
    fields: { exact: "book title", filetype: "epub,mobi,azw3" },
  },
];
