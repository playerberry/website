<script setup lang="ts">
/**
 * BlogPostView (`/blog/:slug`)
 *
 * Renders a single article resolved from the route `slug`. Falls back to the
 * 404 view (with the 404 page metadata) when no post matches. Sets the
 * document title to the post's title so the browser tab and shared links are
 * meaningful. When the article falls back to English under another active
 * locale, the title, body and tags are wrapped in an element with `lang="en"`.
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
import { ARTICLE_LOCALES } from "../assets/js/seo";
import type { Locale } from "../assets/js/locales";
import { parseBlocks, type Block } from "../assets/js/postBlocks";
import CodeBlock from "../components/CodeBlock.vue";
import NotFoundView from "./NotFoundView.vue";
import { useLocalePath } from "../composables/useLocalePath";

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

/**
 * The content's language when it differs from the active locale (fallback
 * to English), or `undefined` to omit the `lang` attribute.
 */
const contentLang = computed(() =>
  content.value && content.value.lang !== locale.value
    ? content.value.lang
    : undefined,
);

// Reflect the resolved (localised) article in the page metadata: tab title,
// meta description (the excerpt), canonical URL and social-card mirrors.
// Re-runs when the locale changes, keeping the metadata in the active language.
// The route opts out of the router's own metadata handling, so an unknown slug
// must apply the 404 metadata here too — otherwise the previous page's title,
// description and canonical URL would linger under the not-found view.
watchEffect(() => {
  if (content.value && post.value) {
    const path = `/blog/${post.value.slug}`;
    applyPageMeta({
      title: content.value.title,
      description: content.value.excerpt,
      path,
      // Metadata describes the article actually shown (English when the
      // active locale has no translation), so the canonical and hreflang
      // set only cover the languages the article exists in.
      locale: content.value.lang as Locale,
      contentLocales: ARTICLE_LOCALES,
      breadcrumb: [
        { name: t("menu.blog"), path: "/blog" },
        { name: content.value.title, path },
      ],
      article: {
        datePublished: post.value.date,
        tags: post.value.tags,
        inLanguage: content.value.lang,
      },
    });
  } else {
    applyPageMeta({
      title: t("notFound.title"),
      description: t("notFound.description"),
      path: route.path,
      noindex: true,
    });
  }
});

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <section v-if="post" class="pb-section">
    <div class="uk-container">
      <RouterLink :to="lp('/blog')" class="pb-link-arrow"
        ><Icon name="arrow-left" />
        {{ t("blog.back") }}</RouterLink
      >
      <div class="pb-post-meta uk-margin-medium-top">
        <span>{{ formatPostDate(post.date, locale) }}</span>
        <span>·</span>
        <span>{{ t("blog.readingTime", { minutes: content?.minutes }) }}</span>
      </div>
      <!-- Title, body and tags share the content's language; the meta row
           above stays in the active locale, so it sits outside. -->
      <article :lang="contentLang">
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
            <blockquote
              v-else-if="block.kind === 'quote'"
              class="pb-post-quote"
            >
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
      </article>
    </div>
  </section>
  <NotFoundView v-else />
</template>
