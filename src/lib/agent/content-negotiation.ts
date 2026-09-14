export type DocumentRepresentation = "html" | "markdown" | null;

type MediaRange = {
  type: string;
  subtype: string;
  quality: number;
  parameters: Map<string, string>;
};

/** Split HTTP lists without treating quoted parameter delimiters as separators. */
function splitHeader(value: string, delimiter: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let quoted = false;
  let escaped = false;
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (escaped) { escaped = false; continue; }
    if (quoted && character === "\\") { escaped = true; continue; }
    if (character === '"') quoted = !quoted;
    if (!quoted && character === delimiter) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

function mediaRanges(accept: string): MediaRange[] {
  return splitHeader(accept, ",").flatMap((entry) => {
    const [mediaType, ...fields] = splitHeader(entry, ";");
    const match = /^([!#$%&'*+.^_`|~\w-]+)\/([!#$%&'*+.^_`|~\w-]+)$/.exec(mediaType.trim().toLowerCase());
    if (!match || (match[1] === "*" && match[2] !== "*")) return [];
    const parameters = new Map<string, string>();
    let quality = 1;
    let weighted = false;
    for (const field of fields) {
      const separator = field.indexOf("=");
      if (separator < 0) return [];
      const name = field.slice(0, separator).trim().toLowerCase();
      const raw = field.slice(separator + 1).trim();
      if (name === "q") {
        if (weighted || !/^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(raw)) return [];
        quality = Number(raw);
        weighted = true;
      } else if (!weighted) {
        const value = raw.startsWith('"') && raw.endsWith('"')
          ? raw.slice(1, -1).replace(/\\(.)/g, "$1") : raw;
        parameters.set(name, value.toLowerCase());
      }
    }
    return [{ type: match[1], subtype: match[2], quality, parameters }];
  });
}

function preference(ranges: MediaRange[], subtype: string) {
  let specificity = -1;
  let quality = 0;
  for (const range of ranges) {
    if (range.type !== "text" && range.type !== "*") continue;
    if (range.subtype !== subtype && range.subtype !== "*") continue;
    // Our documents use UTF-8 with no media-type variant parameter.
    if ([...range.parameters].some(([name, value]) => name !== "charset" || value !== "utf-8")) continue;
    const rank = (range.type === "*" ? 0 : range.subtype === "*" ? 1 : 2) * 100 + range.parameters.size;
    if (rank > specificity || (rank === specificity && range.quality > quality)) {
      specificity = rank;
      quality = range.quality;
    }
  }
  return { quality, explicit: specificity >= 200 };
}

/** RFC 9110: the most specific matching range supplies each representation's q. */
export function negotiateDocument(accept: string | null): DocumentRepresentation {
  if (!accept?.trim()) return "html";
  const ranges = mediaRanges(accept);
  const html = preference(ranges, "html");
  const markdown = preference(ranges, "markdown");
  if (html.quality === 0 && markdown.quality === 0) return null;
  if (markdown.quality > html.quality) return "markdown";
  if (markdown.quality === html.quality && markdown.explicit) return "markdown";
  return "html";
}

export function acceptsMarkdown(accept: string | null): boolean {
  return !accept?.trim() || preference(mediaRanges(accept), "markdown").quality > 0;
}

export function acceptsReactStream(accept: string | null): boolean {
  return mediaRanges(accept ?? "").some(range =>
    range.type === "text" && range.subtype === "x-component" && range.quality > 0,
  );
}

/** Preserve upstream cache keys, including Next.js's React Server Component fields. */
export function appendVary(current: string | null, ...fields: string[]): string {
  const values = (current ?? "").split(",").map(value => value.trim()).filter(Boolean);
  if (values.includes("*")) return "*";
  const seen = new Set(values.map(value => value.toLowerCase()));
  for (const field of fields) {
    if (!seen.has(field.toLowerCase())) { values.push(field); seen.add(field.toLowerCase()); }
  }
  return values.join(", ");
}
