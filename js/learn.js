/* learn.js — extra teaching content for the "Understand dorking" section.
   The per-operator cards are generated from operators.js; these are the
   broader tips and combo recipes that don't map to a single field. */

const LEARN_TIPS = [
  {
    title: "What is Google dorking?",
    body:
      "“Dorking” just means using a search engine's advanced operators to filter results precisely instead of typing plain words. Same public search box — far sharper aim.",
  },
  {
    title: "Combine operators",
    body:
      "Operators stack. site:example.com filetype:pdf intitle:report finds PDF reports on one site. The more you stack, the narrower (and more useful) the result set.",
  },
  {
    title: "Quotes = exact",
    body:
      'Wrap words in quotes for an exact phrase: "data protection policy". Without quotes the engine may reorder or drop words.',
  },
  {
    title: "Minus removes",
    body:
      "Prefix a word with a minus to exclude it: jaguar -car returns the animal, not the vehicle. Great for cutting noise.",
  },
  {
    title: "OR widens",
    body:
      "Use OR (capitalised) or grouping to catch alternatives: (login OR signin OR admin). Handy for synonyms and naming variants.",
  },
  {
    title: "Wildcards fill blanks",
    body:
      'An asterisk * acts as a placeholder for unknown words: "how to * a website". The engine fills in the gap.',
  },
  {
    title: "Use it responsibly",
    body:
      "Dorking only surfaces pages that are already public and indexed. Use it for learning, research, and systems you own or are authorised to test — not to access or misuse private data.",
  },
];
