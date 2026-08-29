/**
 * Syntax highlighting for blog code blocks.
 *
 * Wraps highlight.js with only the languages the blog needs registered. The
 * module is imported lazily by `CodeBlock.vue` after the article has painted,
 * so the (comparatively heavy) highlighter never sits on the critical path of
 * a post: readers see escaped plain code first and colours a moment later.
 */
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import less from "highlight.js/lib/languages/less";
import xml from "highlight.js/lib/languages/xml";
import swift from "highlight.js/lib/languages/swift";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("less", less);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);

/**
 * Highlight a snippet. The output is HTML produced by highlight.js from
 * trusted, HTML-escaped input (safe for `v-html`).
 *
 * @param code - Raw source code.
 * @param language - A registered highlight.js language id, or `""` to
 *   auto-detect.
 * @returns The highlighted HTML.
 */
export const highlightCode = (code: string, language: string): string =>
  language && hljs.getLanguage(language)
    ? hljs.highlight(code, { language }).value
    : hljs.highlightAuto(code).value;
