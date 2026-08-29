<script setup lang="ts">
/**
 * PostCard
 *
 * Compact blog card showing a post's date, reading time, localised title
 * (linking to the article) and excerpt, plus topic chips. The `v-spotlight`
 * directive adds a pointer-following glow on hover.
 *
 * The reading time is derived from the localised body (see
 * {@link usePostContent}). When the article falls back to English under
 * another active locale, the title and excerpt are marked with `lang="en"`.
 *
 * @prop post - The {@link Post} metadata to render.
 */
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import type { Post } from "../data/posts";
import { usePostContent } from "../composables/usePostContent";
import { formatPostDate } from "../assets/js/dates.ts";

const props = defineProps<{ post: Post }>();

const { t, locale } = useI18n();
const { getPost } = usePostContent();

/** Raw (uncompiled) content for this card's post (title, excerpt, minutes). */
const content = computed(() => getPost(props.post.slug));

/**
 * The content's language when it differs from the active locale (fallback
 * to English), or `undefined` to omit the `lang` attribute.
 */
const contentLang = computed(() =>
  content.value && content.value.lang !== locale.value
    ? content.value.lang
    : undefined,
);
</script>

<template>
  <div v-spotlight class="uk-card uk-card-default uk-card-hover uk-card-body">
    <div class="pb-post-meta">
      <span>{{ formatPostDate(post.date, locale) }}</span>
      <span>·</span>
      <span>{{ t("blog.readingTime", { minutes: content?.minutes }) }}</span>
    </div>
    <div :lang="contentLang">
      <h3 class="uk-card-title pb-post-title">
        <RouterLink :to="`/blog/${post.slug}`">{{ content?.title }}</RouterLink>
      </h3>
      <p>{{ content?.excerpt }}</p>
    </div>
    <div class="pb-chip-row">
      <span v-for="tag in post.tags" :key="tag" class="pb-chip">{{ tag }}</span>
    </div>
  </div>
</template>
