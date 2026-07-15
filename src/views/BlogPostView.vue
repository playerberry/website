<script setup lang="ts">
/**
 * BlogPostView (`/blog/:slug`)
 *
 * Renders a single article resolved from the route `slug`. Falls back to the
 * 404 view when no post matches. Sets the document title to the post's title
 * so the browser tab and shared links are meaningful.
 *
 * Article content is read raw (see {@link usePostContent}) so it may contain
 * arbitrary code. The body is parsed into typed blocks with a tiny inline
 * convention: a leading `## ` is a section heading, a leading `> ` is a pull
 * quote, and a ```` ``` ````-fenced string is a code block. Within paragraphs,
 * headings and quotes, text wrapped in single backticks becomes inline code.
 */
import { computed, watchEffect } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { posts } from "../data/posts";
import { usePostContent } from "../composables/usePostContent";
import { formatPostDate } from "../assets/js/dates.ts";
import CodeBlock from "../components/CodeBlock.vue";
import NotFoundView from "./NotFoundView.vue";

const route = useRoute();
const { t, locale } = useI18n();
const { getPost } = usePostContent();

/** The post metadata matching the current route slug, or `undefined`. */
const post = computed(() =>
  posts.find((p) => p.slug === route.params.slug),
);

/** Raw (uncompiled) localised content for the current post. */
const content = computed(() =>
  post.value ? getPost(post.value.slug) : undefined,
);

/** A run of text that is either plain or inline code. */
interface InlineSpan {
  code: boolean;
  text: string;
}

/** A rendered article block. */
type Block =
  | { kind: "code"; code: string; lang: string }
  | { kind: "h2" | "quote" | "p"; spans: InlineSpan[] };

/**
 * Split a line into alternating plain / inline-code spans on single backticks.
 * Odd segments (between a pair of backticks) are rendered as inline code.
 *
 * @param text - The line to split.
 * @returns The ordered spans.
 */
const toSpans = (text: string): InlineSpan[] =>
  text.split("`").map((part, i) => ({ code: i % 2 === 1, text: part }));

/** The article body parsed into typed, render-ready blocks. */
const blocks = computed<Block[]>(() =>
  (content.value?.body ?? []).map((raw): Block => {
    if (raw.startsWith("```")) {
      // Capture the ```lang tag, then strip the opening line and closing fence.
      const lang = (raw.match(/^```([^\n]*)/)?.[1] ?? "").trim();
      const code = raw
        .replace(/^```[^\n]*\n?/, "")
        .replace(/\n?```\s*$/, "");
      return { kind: "code", code, lang };
    }
    if (raw.startsWith("## ")) return { kind: "h2", spans: toSpans(raw.slice(3)) };
    if (raw.startsWith("> ")) return { kind: "quote", spans: toSpans(raw.slice(2)) };
    return { kind: "p", spans: toSpans(raw) };
  }),
);

// Reflect the resolved (localised) post title in the browser tab title.
watchEffect(() => {
  if (content.value) {
    document.title = `${content.value.title} — PlayerBerry`;
  }
});
</script>

<template>
  <section v-if="post" class="pb-section">
    <div class="uk-container">
      <RouterLink to="/blog" class="pb-link-arrow"
        ><i class="fa-solid fa-arrow-left"></i>
        {{ t("blog.back") }}</RouterLink
      >
      <div class="pb-post-meta uk-margin-medium-top">
        <span>{{ formatPostDate(post.date, locale) }}</span>
        <span>·</span>
        <span>{{ t("blog.readingTime", { minutes: post.minutes }) }}</span>
      </div>
      <h1 class="uk-margin-small-top">{{ content?.title }}</h1>
      <div class="pb-post-divider"></div>
      <div class="pb-post-body">
        <template v-for="(block, i) in blocks" :key="i">
          <CodeBlock
            v-if="block.kind === 'code'"
            :code="block.code"
            :lang="block.lang"
          />
          <h2 v-else-if="block.kind === 'h2'" class="pb-post-h2">
            <template v-for="(s, j) in block.spans" :key="j"
              ><code v-if="s.code" class="pb-code-inline">{{ s.text }}</code
              ><template v-else>{{ s.text }}</template></template
            >
          </h2>
          <blockquote v-else-if="block.kind === 'quote'" class="pb-post-quote">
            <template v-for="(s, j) in block.spans" :key="j"
              ><code v-if="s.code" class="pb-code-inline">{{ s.text }}</code
              ><template v-else>{{ s.text }}</template></template
            >
          </blockquote>
          <p v-else>
            <template v-for="(s, j) in block.spans" :key="j"
              ><code v-if="s.code" class="pb-code-inline">{{ s.text }}</code
              ><template v-else>{{ s.text }}</template></template
            >
          </p>
        </template>
      </div>
      <div class="pb-chip-row">
        <span v-for="tag in post.tags" :key="tag" class="pb-chip">{{
          tag
        }}</span>
      </div>
    </div>
  </section>
  <NotFoundView v-else />
</template>
