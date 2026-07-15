<script setup lang="ts">
/**
 * CodeBlock
 *
 * A fenced code block for blog articles with a language label, syntax
 * highlighting and a one-click copy button.
 *
 * Highlighting uses highlight.js with only the languages the blog needs
 * registered (to keep the bundle small). The highlighted markup is produced by
 * highlight.js from our own trusted content — highlight.js HTML-escapes the
 * source first — so rendering it with `v-html` is safe here.
 */
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
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

// Register once at module load (this module is a singleton).
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("css", css);
hljs.registerLanguage("less", less);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("csharp", csharp);

const props = defineProps<{
  /** The raw source code to display. */
  code: string;
  /** The fence language tag (e.g. "ts", "swift", "c++"). */
  lang?: string;
}>();

const { t } = useI18n();

/** Fence tags → highlight.js language ids (covers common aliases). */
const languageAliases: Record<string, string> = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  css: "css",
  less: "less",
  html: "xml",
  xml: "xml",
  swift: "swift",
  c: "c",
  cpp: "cpp",
  "c++": "cpp",
  cs: "csharp",
  "c#": "csharp",
  csharp: "csharp",
};

/** Human-readable label shown in the code block header. */
const displayNames: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  css: "CSS",
  less: "LESS",
  xml: "HTML",
  swift: "Swift",
  c: "C",
  cpp: "C++",
  csharp: "C#",
};

/** The resolved highlight.js language id, or `""` when unknown. */
const hljsLang = computed(() => {
  const key = (props.lang ?? "").trim().toLowerCase();
  return languageAliases[key] ?? "";
});

/** The label to show in the header (falls back to the raw fence tag). */
const label = computed(
  () => displayNames[hljsLang.value] ?? (props.lang ?? "").trim(),
);

/** The highlighted HTML for the code, or escaped plain text as a fallback. */
const highlighted = computed(() => {
  if (hljsLang.value && hljs.getLanguage(hljsLang.value)) {
    return hljs.highlight(props.code, { language: hljsLang.value }).value;
  }
  return hljs.highlightAuto(props.code).value;
});

/** Whether the "copied" confirmation is currently showing. */
const copied = ref(false);

/**
 * Legacy clipboard fallback for contexts where the async Clipboard API is
 * unavailable or blocked. Copies via a hidden, momentarily-selected textarea.
 *
 * @param text - The text to copy.
 * @returns Whether the copy command reported success.
 */
const fallbackCopy = (text: string): boolean => {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};

/** Copy the raw (un-highlighted) source to the clipboard, then confirm. */
const copy = async (): Promise<void> => {
  let ok = false;
  try {
    await navigator.clipboard.writeText(props.code);
    ok = true;
  } catch {
    ok = fallbackCopy(props.code);
  }
  if (ok) {
    copied.value = true;
    window.setTimeout(() => (copied.value = false), 2000);
  }
};
</script>

<template>
  <div class="pb-code-wrap">
    <div class="pb-code-bar">
      <span class="pb-code-lang">{{ label }}</span>
      <button
        class="pb-code-copy"
        type="button"
        :aria-label="copied ? t('blog.copied') : t('blog.copy')"
        @click="copy"
      >
        <i :class="copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'"></i>
        <span>{{ copied ? t("blog.copied") : t("blog.copy") }}</span>
      </button>
    </div>
    <pre class="pb-post-code"><code class="hljs" v-html="highlighted"></code></pre>
  </div>
</template>
