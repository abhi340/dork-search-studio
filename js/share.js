/* share.js — encode/decode the builder state in the URL hash so a configured
   search can be bookmarked, shared, or deep-linked from a template.
   Exposes window.DorkShare. */

(function () {
  "use strict";

  window.DorkShare = {
    /* fields object -> "k=v&k=v" (empty values dropped) */
    encode(fields) {
      const p = new URLSearchParams();
      Object.keys(fields || {}).forEach((k) => {
        const val = fields[k];
        if (val != null && String(val).trim() !== "") p.set(k, String(val).trim());
      });
      return p.toString();
    },

    /* "k=v&k=v" -> fields object */
    decode(str) {
      const out = {};
      try {
        const p = new URLSearchParams(str || "");
        for (const [k, v] of p) out[k] = v;
      } catch (_) {}
      return out;
    },

    /* full shareable URL for the current page (works on file:// and http) */
    link(fields) {
      const base = location.href.split("#")[0];
      return base + "#" + this.encode(fields);
    },

    /* read fields from the current location hash */
    fromHash() {
      return this.decode((location.hash || "").replace(/^#/, ""));
    },
  };
})();
