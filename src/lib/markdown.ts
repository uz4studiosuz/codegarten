/**
 * The small markup a lesson's prose is allowed to use
 * ===================================================
 * Formatted text used to be authored in a `contenteditable` driven by
 * `document.execCommand`, which stored whatever HTML the browser happened to
 * produce. That failed in three ways at once: `execCommand` is deprecated and
 * each browser nests its tags differently, pasting from anywhere dragged foreign
 * markup and inline styles into the lesson, and the result went straight into
 * `dangerouslySetInnerHTML` — so a lesson file could carry arbitrary HTML.
 *
 * Text is now stored as plain markup and rendered here. The input is escaped
 * before a single rule runs, so the only tags that ever reach the page are the
 * ones this file emits. That also makes lesson JSON readable and diffable, and
 * lets an author type on a phone without a rich-text surface to fight.
 *
 * Supported, and deliberately nothing more:
 *
 *     # ## ###     sarlavha
 *     **qalin**    *kursiv*    ~~chizilgan~~    ==ajratilgan==
 *     `kod`
 *     [matn](https://...)
 *     - roʻyxat        1. raqamli roʻyxat
 *     > iqtibos
 *
 * Blank lines separate paragraphs.
 */

/** Escaped first, so nothing an author types can become a tag. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Only links that navigate. `javascript:` and `data:` are the two schemes that
 * turn a link into code, and a lesson never needs either.
 */
function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (href === "") return null;
  if (/^(https?:\/\/|mailto:|\/|#)/i.test(href)) return href;
  return null;
}

/** Inline marks, applied to text that is already escaped. */
function inline(text: string): string {
  let out = text;

  // Code first: whatever sits inside backticks must not pick up other marks.
  const codeSpans: string[] = [];
  out = out.replace(/`([^`]+)`/g, (_, code: string) => {
    codeSpans.push(code);
    // A distinctive marker rather than a bare digit run: prose like "1 2 3"
    // would otherwise be mistaken for a placeholder when the spans go back in.
    return `@@kod:${codeSpans.length - 1}@@`;
  });

  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, label: string, href: string) => {
    const safe = safeHref(href);
    if (!safe) return label;
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  out = out.replace(/==([^=]+)==/g, "<mark>$1</mark>");

  return out.replace(/@@kod:(\d+)@@/g, (_, index: string) => `<code>${codeSpans[Number(index)]}</code>`);
}

/** Renders the whole block. The output is safe to pass to the DOM as HTML. */
export function renderMarkdown(source: string): string {
  const lines = escapeHtml(source).split(/\r?\n/);
  const out: string[] = [];

  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    out.push(`<p>${inline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((item) => `<li>${inline(item)}</li>`).join("");
    out.push(`<${list.type}>${items}</${list.type}>`);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length === 0) return;
    out.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
    quote = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = /^-\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      flushQuote();
      // A bullet arriving mid-numbered-list starts a new list rather than
      // silently joining one of the wrong type.
      if (list && list.type !== "ul") flushList();
      if (!list) list = { type: "ul", items: [] };
      list.items.push(bullet[1]);
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (numbered) {
      flushParagraph();
      flushQuote();
      if (list && list.type !== "ol") flushList();
      if (!list) list = { type: "ol", items: [] };
      list.items.push(numbered[1]);
      continue;
    }

    const quoted = /^&gt;\s?(.*)$/.exec(trimmed);
    if (quoted) {
      flushParagraph();
      flushList();
      quote.push(quoted[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }

  flushAll();
  return out.join("");
}

/** Plain text, for previews and for counting how much an author has written. */
export function markdownToText(source: string): string {
  return source
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~=#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
