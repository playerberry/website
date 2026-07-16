<script setup lang="ts">
/**
 * BlogPostView (`/blog/:slug`)
 *
 * Renders a single article resolved from the route `slug`. Falls back to the
 * 404 view when no post matches. Sets the document title to the post's title
 * so the browser tab and shared links are meaningful.
 *
 * Article content is read raw (see {@link usePostContent}) so it may contain
 * arbitrary code. The body is parsed into typed blocks by the pure helpers in
 * {@link module:postBlocks} — see that module for the inline convention.
 */
import { computed, watchEffect } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { posts } from "../data/posts";
import { usePostContent } from "../composables/usePostContent";
import { formatPostDate } from "../assets/js/dates.ts";
import { applyPageMeta } from "../assets/js/meta";
import { parseBlocks, type Block } from "../assets/js/postBlocks";
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

/** The article body parsed into typed, render-ready blocks. */
const blocks = computed<Block[]>(() => parseBlocks(content.value?.body ?? []));

// Reflect the resolved (localised) article in the page metadata: tab title,
// meta description (the excerpt), canonical URL and social-card mirrors.
// Re-runs when the locale changes, keeping the metadata in the active language.
watchEffect(() => {
  if (content.value && post.value) {
    applyPageMeta({
      title: content.value.title,
      description: content.value.excerpt,
      path: `/blog/${post.value.slug}`,
    });
  }
});
</script>

<template>
  <section v-if="post" class="pb-section">
    <div class="uk-container">
      <RouterLink to="/blog" class="pb-link-arrow"
        ><Icon name="arrow-left" />
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
