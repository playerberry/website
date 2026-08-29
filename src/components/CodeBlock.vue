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
 * registered, loaded lazily after the article has painted (see
 * `assets/js/highlight.ts`). The highlighted markup is produced by
 * highlight.js from our own trusted content — highlight.js HTML-escapes the
 * source first — so rendering it with `v-html` is safe here.
 */
import { computed, onUnmounted, ref, watchEffect } from "vue";
import { escapeHtml } from "../assets/js/seo";
import { useI18n } from "vue-i18n";

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

/**
 * The code as HTML: escaped plain text at first, replaced by highlight.js
 * markup once the lazily loaded highlighter (`assets/js/highlight.ts`) has
 * arrived — so the article paints before the highlighter downloads.
 */
const highlighted = ref(escapeHtml(props.code));

watchEffect(async (onCleanup) => {
  const code = props.code;
  const language = hljsLang.value;
  highlighted.value = escapeHtml(code);
  let stale = false;
  onCleanup(() => {
    stale = true;
  });
  try {
    // Yield until the browser is idle so the article's text, fonts and
    // layout paint before the highlighter competes for bandwidth.
    await new Promise<void>((resolve) => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => resolve(), { timeout: 1500 });
      } else {
        window.setTimeout(resolve, 200);
      }
    });
    const { highlightCode } = await import("../assets/js/highlight");
    if (!stale) highlighted.value = highlightCode(code, language);
  } catch {
    // Highlighter unavailable (offline chunk); plain code stays readable.
  }
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
  <div
    class="my-8 overflow-hidden rounded-tile border border-white/10 bg-[#0b0b14] text-[#f2f2f7]"
  >
    <!-- Header strip: terminal dots + language label, copy button (≥ 40px) -->
    <div
      class="flex min-h-12 items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] py-1.5 pr-1.5 pl-4"
    >
      <span class="flex min-w-0 items-center gap-3">
        <span class="flex shrink-0 gap-1.5" aria-hidden="true">
          <span class="size-2 rounded-full bg-berry/70"></span>
          <span class="size-2 rounded-full bg-amber/70"></span>
          <span class="size-2 rounded-full bg-cyan/70"></span>
        </span>
        <span
          class="truncate font-mono text-xs tracking-[0.12em] text-[#9a9aab] uppercase"
          ><span class="text-berry/80" aria-hidden="true">// </span
          >{{ label || "code" }}</span
        >
      </span>
      <button
        class="btn h-10 shrink-0 border border-white/15 px-4 font-mono text-xs text-white/85 hover:bg-white/10 hover:text-white"
        :class="{ 'border-cyan/40 text-cyan': status === 'copied' }"
        type="button"
        @click="copy"
      >
        <Icon :name="status === 'copied' ? 'check' : 'copy'" />
        <span>{{ buttonText }}</span>
      </button>
    </div>
    <!-- Always in the DOM so screen readers pick up the first announcement. -->
    <span class="sr-only" role="status" aria-live="polite">{{
      announcement
    }}</span>
    <!-- highlight.js escapes source text itself; its output is safe HTML. -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <pre class="m-0 overflow-x-auto rounded-none border-0 bg-transparent p-5 font-mono text-[0.9rem] leading-relaxed"><code class="hljs" v-html="highlighted"></code></pre>
  </div>
</template>
