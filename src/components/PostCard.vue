<script setup lang="ts">
/**
 * PostCard
 *
 * Compact blog card showing a post's date, reading time, localised title
 * (linking to the article) and excerpt, plus topic chips. The title link is
 * stretched over the whole card with a pseudo-element, so the entire surface
 * is clickable while the accessible name stays the title. Self-contained: it
 * fills the height of whatever grid cell it is dropped into. The
 * `v-spotlight` directive adds a pointer-following glow on hover.
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
import { useLocalePath } from "../composables/useLocalePath";

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

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <article v-spotlight class="card group flex h-full flex-col">
    <!-- Per-post colour accent (decorative). -->
    <span
      class="mb-5 block h-1 w-10 rounded-full"
      :style="{ backgroundImage: post.gradient }"
      aria-hidden="true"
    ></span>

    <div class="meta-row">
      <span>{{ formatPostDate(post.date, locale) }}</span>
      <span class="text-berry" aria-hidden="true">·</span>
      <span>{{ t("blog.readingTime", { minutes: content?.minutes }) }}</span>
    </div>

    <div :lang="contentLang" class="mt-3 flex flex-1 flex-col">
      <h3 class="card-title text-xl leading-snug">
        <RouterLink
          :to="lp(`/blog/${post.slug}`)"
          class="transition-colors duration-300 group-hover:text-berry after:absolute after:inset-0 after:rounded-card after:content-['']"
          >{{ content?.title }}</RouterLink
        >
      </h3>
      <p class="mt-2 flex-1 text-[0.95rem]">{{ content?.excerpt }}</p>
    </div>

    <div class="mt-5 flex flex-wrap gap-2">
      <span v-for="tag in post.tags" :key="tag" class="chip">{{ tag }}</span>
    </div>
  </article>
</template>
