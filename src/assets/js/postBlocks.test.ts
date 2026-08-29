import { describe, expect, it } from "vitest";
import {
  SECONDS_PER_CODE_LINE,
  WORDS_PER_MINUTE,
  parseBlock,
  parseBlocks,
  readingMinutes,
  toSpans,
} from "./postBlocks";

describe("toSpans", () => {
  it("returns a single plain span when there are no backticks", () => {
    expect(toSpans("plain text")).toEqual([{ code: false, text: "plain text" }]);
  });

  it("marks text between single backticks as inline code", () => {
    expect(toSpans("use `ref()` here")).toEqual([
      { code: false, text: "use " },
      { code: true, text: "ref()" },
      { code: false, text: " here" },
    ]);
  });

  it("handles multiple inline-code runs in one line", () => {
    const spans = toSpans("`a` ve `b`");
    expect(spans.filter((s) => s.code).map((s) => s.text)).toEqual(["a", "b"]);
  });
});

describe("parseBlock", () => {
  it("parses a fenced block with a language tag", () => {
    const block = parseBlock("```ts\nconst x = 1;\n```");
    expect(block).toEqual({ kind: "code", lang: "ts", code: "const x = 1;" });
  });

  it("parses a fenced block without a language tag", () => {
    const block = parseBlock("```\nplain\n```");
    expect(block).toEqual({ kind: "code", lang: "", code: "plain" });
  });

  it("preserves braces, pipes and blank lines inside code", () => {
    const code = 'type T = { a: string } | { b: number };\n\nif (x) { run(); }';
    const block = parseBlock("```ts\n" + code + "\n```");
    expect(block).toEqual({ kind: "code", lang: "ts", code });
  });

  it("parses a section heading", () => {
    expect(parseBlock("## Başlık")).toEqual({
      kind: "h2",
      spans: [{ code: false, text: "Başlık" }],
    });
  });

  it("parses a pull quote", () => {
    expect(parseBlock("> Alıntı")).toEqual({
      kind: "quote",
      spans: [{ code: false, text: "Alıntı" }],
    });
  });

  it("falls back to a paragraph", () => {
    expect(parseBlock("Sıradan metin.")).toEqual({
      kind: "p",
      spans: [{ code: false, text: "Sıradan metin." }],
    });
  });
});

describe("parseBlocks", () => {
  it("parses blocks in document order", () => {
    const kinds = parseBlocks([
      "## H",
      "para",
      "> q",
      "```js\n1\n```",
    ]).map((b) => b.kind);
    expect(kinds).toEqual(["h2", "p", "quote", "code"]);
  });

  it("returns an empty array for an empty body", () => {
    expect(parseBlocks([])).toEqual([]);
  });
});

describe("readingMinutes", () => {
  /** Build a paragraph of `n` single-syllable words. */
  const words = (n: number): string =>
    Array.from({ length: n }, () => "w").join(" ");

  it("returns at least one minute for an empty body", () => {
    expect(readingMinutes([])).toBe(1);
  });

  it("rounds a body of exactly one minute of prose to one minute", () => {
    expect(readingMinutes([words(WORDS_PER_MINUTE)])).toBe(1);
  });

  it("rounds up once the prose exceeds a whole minute", () => {
    expect(readingMinutes([words(WORDS_PER_MINUTE + 1)])).toBe(2);
  });

  it("counts words across prose blocks, including headings and quotes", () => {
    const half = WORDS_PER_MINUTE / 2;
    expect(
      readingMinutes([`## ${words(half)}`, `> ${words(half)}`, words(1)]),
    ).toBe(2);
  });

  it("counts inline code as words", () => {
    expect(readingMinutes([`use \`${words(WORDS_PER_MINUTE)}\` here`])).toBe(2);
  });

  it("ignores runs of whitespace when counting words", () => {
    expect(readingMinutes(["a  b \n c"])).toBe(1);
  });

  it("budgets code blocks per line rather than per word", () => {
    const linesPerMinute = 60 / SECONDS_PER_CODE_LINE;
    const code = Array.from({ length: linesPerMinute + 1 }, () => "x").join(
      "\n",
    );
    expect(readingMinutes(["```ts\n" + code + "\n```"])).toBe(2);
  });

  it("does not count an empty code block", () => {
    expect(readingMinutes(["```\n```"])).toBe(1);
  });

  it("adds prose and code time together", () => {
    const linesPerMinute = 60 / SECONDS_PER_CODE_LINE;
    const code = Array.from({ length: linesPerMinute }, () => "x").join("\n");
    expect(
      readingMinutes([
        words(WORDS_PER_MINUTE),
        "```js\n" + code + "\n```",
        words(1),
      ]),
    ).toBe(3);
  });
});
