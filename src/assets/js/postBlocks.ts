/**
 * Pure parsing helpers for article bodies.
 *
 * Article content is stored as an array of raw strings (one per block) so it
 * may contain arbitrary code. Each block follows a tiny inline convention: a
 * leading `## ` is a section heading, a leading `> ` is a pull quote, and a
 * ```` ``` ````-fenced string is a code block. Within headings, quotes and
 * paragraphs, text wrapped in single backticks becomes inline code.
 *
 * Kept free of Vue imports so the logic is unit-testable in isolation.
 */

/** A run of text that is either plain or inline code. */
export interface InlineSpan {
  code: boolean;
  text: string;
}

/** A rendered article block. */
export type Block =
  | { kind: "code"; code: string; lang: string }
  | { kind: "h2" | "quote" | "p"; spans: InlineSpan[] };

/**
 * Split a line into alternating plain / inline-code spans on single backticks.
 * Odd segments (between a pair of backticks) are rendered as inline code.
 *
 * @param text - The line to split.
 * @returns The ordered spans.
 */
export const toSpans = (text: string): InlineSpan[] =>
  text.split("`").map((part, i) => ({ code: i % 2 === 1, text: part }));

/**
 * Parse one raw block string into a typed, render-ready block.
 *
 * @param raw - The raw block text.
 * @returns The typed block.
 */
export const parseBlock = (raw: string): Block => {
  if (raw.startsWith("```")) {
    // Capture the ```lang tag, then strip the opening line and closing fence.
    const lang = (raw.match(/^```([^\n]*)/)?.[1] ?? "").trim();
    const code = raw.replace(/^```[^\n]*\n?/, "").replace(/\n?```\s*$/, "");
    return { kind: "code", code, lang };
  }
  if (raw.startsWith("## ")) return { kind: "h2", spans: toSpans(raw.slice(3)) };
  if (raw.startsWith("> ")) return { kind: "quote", spans: toSpans(raw.slice(2)) };
  return { kind: "p", spans: toSpans(raw) };
};

/**
 * Parse an article body into typed blocks.
 *
 * @param body - The raw block strings, in document order.
 * @returns The parsed blocks, in the same order.
 */
export const parseBlocks = (body: readonly string[]): Block[] =>
  body.map(parseBlock);

/** Average reading speed for prose, in words per minute. */
export const WORDS_PER_MINUTE = 200;

/** Time budgeted per line of code, in seconds (code reads slower than prose). */
export const SECONDS_PER_CODE_LINE = 2;

/**
 * Count the whitespace-separated words in a run of spans.
 *
 * @param spans - The spans of a heading, quote or paragraph.
 * @returns The number of words (inline code counts as words too).
 */
const countWords = (spans: readonly InlineSpan[]): number =>
  spans
    .map((span) => span.text)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

/**
 * Estimate the reading time of an article body.
 *
 * Prose (headings, quotes, paragraphs) is counted at {@link WORDS_PER_MINUTE};
 * code blocks are budgeted per line at {@link SECONDS_PER_CODE_LINE} since
 * they are scanned rather than read. The total is rounded up to whole minutes
 * and never drops below one, so short posts still show "1 min read".
 *
 * Words are split on whitespace, which suits the languages the blog ships in.
 *
 * @param body - The raw block strings, in document order.
 * @returns The estimated reading time in whole minutes (at least 1).
 */
export const readingMinutes = (body: readonly string[]): number => {
  let seconds = 0;
  for (const block of parseBlocks(body)) {
    if (block.kind === "code") {
      const lines = block.code ? block.code.split("\n").length : 0;
      seconds += lines * SECONDS_PER_CODE_LINE;
    } else {
      seconds += (countWords(block.spans) / WORDS_PER_MINUTE) * 60;
    }
  }
  return Math.max(1, Math.ceil(seconds / 60));
};
