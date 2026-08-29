<script setup lang="ts">
/**
 * BlogView (`/blog`)
 *
 * The blog index: the latest post is highlighted in a large split card, with
 * the remaining posts laid out in a grid of {@link PostCard}s below.
 */
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { posts } from "../data/posts";
import PostCard from "../components/PostCard.vue";
import { usePostContent } from "../composables/usePostContent";
import { formatPostDate } from "../assets/js/dates.ts";
import { feedPathFor } from "../assets/js/locales";
import { useLocalePath } from "../composables/useLocalePath";

const { t, locale } = useI18n();
const { getPost } = usePostContent();

/** `featured` is the newest post; `rest` are the remaining posts for the grid. */
const [featured, ...rest] = posts;

/** Raw (uncompiled) content for the highlighted featured post. */
const featuredContent = computed(() => getPost(featured.slug));

/**
 * The featured content's language when it differs from the active locale
 * (fallback to English), or `undefined` to omit the `lang` attribute.
 */
const featuredLang = computed(() =>
  featuredContent.value && featuredContent.value.lang !== locale.value
    ? featuredContent.value.lang
    : undefined,
);

/** The RSS feed matching the active locale. */
const feedHref = computed(() => feedPathFor(locale.value));

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head">
        <p class="pb-eyebrow">{{ t("blog.eyebrow") }}</p>
        <h1>{{ t("blog.title") }}</h1>
        <p class="pb-section-lead">{{ t("blog.lead") }}</p>
        <a
          class="pb-rss-link"
          :href="feedHref"
          target="_blank"
          rel="alternate noopener"
        >
          <Icon name="rss" /><span>RSS</span>
        </a>
      </div>

      <!-- Featured (latest) post -->
      <div
        v-spotlight
        class="uk-card uk-card-default uk-card-hover uk-margin-medium-bottom"
      >
        <div class="uk-grid uk-grid-collapse uk-child-width-1-2@m" uk-grid>
          <div>
            <div
              class="pb-post-cover"
              :style="{ backgroundImage: featured.gradient }"
            ></div>
          </div>
          <div>
            <div class="uk-card-body">
              <div class="pb-post-meta">
                <span>{{ formatPostDate(featured.date, locale) }}</span>
                <span>·</span>
                <span>{{
                  t("blog.readingTime", { minutes: featuredContent?.minutes })
                }}</span>
              </div>
              <div :lang="featuredLang">
                <h2 class="uk-card-title pb-post-title">
                  <RouterLink :to="lp(`/blog/${featured.slug}`)">{{
                    featuredContent?.title
                  }}</RouterLink>
                </h2>
                <p>{{ featuredContent?.excerpt }}</p>
              </div>
              <div class="pb-chip-row">
                <span
                  v-for="tag in featured.tags"
                  :key="tag"
                  class="pb-chip"
                  >{{ tag }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Remaining posts -->
      <div
        class="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-3@m"
        uk-grid
      >
        <div v-for="post in rest" :key="post.slug">
          <PostCard :post="post" />
        </div>
      </div>
    </div>
  </section>
</template>
