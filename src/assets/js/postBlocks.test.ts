import { describe, expect, it } from "vitest";
import { parseBlock, parseBlocks, toSpans } from "./postBlocks";

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
