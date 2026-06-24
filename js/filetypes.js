/* filetypes.js — shared file-type categories used by the builder chips and the
   explainer. Each category's `value` is a comma-separated extension list; the
   filetype operator turns multiple extensions into an OR group. */

const FILE_GROUPS = [
  { label: "Any", value: "", name: "" },
  { label: "PDF", value: "pdf", name: "PDF" },
  { label: "Word", value: "doc,docx", name: "Word" },
  { label: "Excel", value: "xls,xlsx", name: "Excel" },
  { label: "PowerPoint", value: "ppt,pptx", name: "PowerPoint" },
  { label: "Video", value: "mp4,mov,avi,mkv,webm", name: "video" },
  { label: "Audio", value: "mp3,wav,flac,m4a,ogg", name: "audio" },
  { label: "Image", value: "jpg,png,gif,svg,webp", name: "image" },
  { label: "Archive", value: "zip,rar,7z,tar,gz", name: "archive" },
  { label: "Code", value: "js,py,php,java,cpp,rb,go", name: "source-code" },
  { label: "Data", value: "csv,json,xml,sql", name: "data" },
  { label: "Text", value: "txt", name: "text" },
  { label: "E-book", value: "epub,mobi,azw3", name: "e-book" },
];

/* single-extension fallback names (for templates / shared links that use one ext) */
const FILE_SINGLE = {
  pdf: "PDF", doc: "Word", docx: "Word", xls: "Excel", xlsx: "Excel", csv: "CSV",
  ppt: "PowerPoint", pptx: "PowerPoint", mp4: "video", mov: "video", mp3: "audio",
  wav: "audio", jpg: "image", jpeg: "image", png: "image", gif: "image", svg: "image",
  zip: "archive", rar: "archive", txt: "text", json: "data", xml: "data", sql: "data",
  epub: "e-book",
};

/* friendly name for a filetype value (exact group, else first-extension fallback) */
function fileTypeName(value) {
  if (!value) return "";
  const exact = FILE_GROUPS.find((g) => g.value === value);
  if (exact) return exact.name;
  const first = String(value).split(/[\s,]+/)[0].replace(/^\./, "").toLowerCase();
  return FILE_SINGLE[first] || first.toUpperCase();
}
