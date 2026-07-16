<script setup lang="ts">
/**
 * PostCard
 *
 * Compact blog card showing a post's date, reading time, localised title
 * (linking to the article) and excerpt, plus topic chips. The `v-spotlight`
 * directive adds a pointer-following glow on hover.
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

/** Raw (uncompiled) title and excerpt for this card's post. */
const content = computed(() => getPost(props.post.slug));
</script>

<template>
  <div v-spotlight class="uk-card uk-card-default uk-card-hover uk-card-body">
    <div class="pb-post-meta">
      <span>{{ formatPostDate(post.date, locale) }}</span>
      <span>·</span>
      <span>{{ t("blog.readingTime", { minutes: post.minutes }) }}</span>
    </div>
    <h3 class="uk-card-title pb-post-title">
      <RouterLink :to="`/blog/${post.slug}`">{{ content?.title }}</RouterLink>
    </h3>
    <p>{{ content?.excerpt }}</p>
    <div class="pb-chip-row">
      <span v-for="tag in post.tags" :key="tag" class="pb-chip">{{ tag }}</span>
    </div>
  </div>
</template>
