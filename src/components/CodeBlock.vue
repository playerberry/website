<script setup lang="ts">
/**
 * CodeBlock
 *
 * A fenced code block for blog articles with a language label, syntax
 * highlighting and a one-click copy button. The copy result ("copied" or
 * "failed") is shown on the button for two seconds and announced to assistive
 * technology through a visually hidden live region.
 *
 * Highlighting uses highlight.js with only the languages the blog needs
 * registered (to keep the bundle small). The highlighted markup is produced by
 * highlight.js from our own trusted content — highlight.js HTML-escapes the
 * source first — so rendering it with `v-html` is safe here.
 */
import { computed, onUnmounted, ref } from "vue";
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
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";

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
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);

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
  json: "json",
  yaml: "yaml",
  yml: "yaml",
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
  json: "JSON",
  yaml: "YAML",
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

/** Outcome of the last copy attempt while its feedback is showing. */
type CopyStatus = "idle" | "copied" | "failed";

/** The copy feedback currently showing (`"idle"` when none). */
const status = ref<CopyStatus>("idle");

/** How long the copy feedback stays visible, in milliseconds. */
const FEEDBACK_MS = 2000;

/** Pending timer that resets `status`, or `0` when none is scheduled. */
let feedbackTimer = 0;

/** The button caption for the current status. */
const buttonText = computed(() => {
  if (status.value === "copied") return t("blog.copied");
  if (status.value === "failed") return t("blog.copyFailed");
  return t("blog.copy");
});

/**
 * The live-region announcement: the feedback text while it shows, otherwise
 * empty. The region itself is always rendered so the first change is heard.
 */
const announcement = computed(() =>
  status.value === "idle" ? "" : buttonText.value,
);

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

/**
 * Copy the raw (un-highlighted) source to the clipboard, then show the
 * outcome for {@link FEEDBACK_MS}. A rapid second click restarts the timer
 * instead of letting the earlier one cut the new feedback short.
 */
const copy = async (): Promise<void> => {
  let ok: boolean;
  try {
    await navigator.clipboard.writeText(props.code);
    ok = true;
  } catch {
    ok = fallbackCopy(props.code);
  }
  status.value = ok ? "copied" : "failed";
  window.clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    status.value = "idle";
    feedbackTimer = 0;
  }, FEEDBACK_MS);
};

onUnmounted(() => window.clearTimeout(feedbackTimer));
</script>

<template>
  <div class="pb-code-wrap">
    <div class="pb-code-bar">
      <span class="pb-code-lang">{{ label }}</span>
      <button
        class="pb-code-copy"
        :class="{ 'is-copied': status === 'copied' }"
        type="button"
        @click="copy"
      >
        <Icon :name="status === 'copied' ? 'check' : 'copy'" />
        <span>{{ buttonText }}</span>
      </button>
    </div>
    <!-- Always in the DOM so screen readers pick up the first announcement. -->
    <span class="uk-hidden-visually" role="status" aria-live="polite">{{
      announcement
    }}</span>
    <!-- highlight.js escapes source text itself; its output is safe HTML. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <pre class="pb-post-code"><code class="hljs" v-html="highlighted"></code></pre>
  </div>
</template>
