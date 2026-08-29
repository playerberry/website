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
  <section class="section">
    <div class="container-pb">
      <!-- Page heading with the feed link on the right -->
      <div
        class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="eyebrow">{{ t("blog.eyebrow") }}</p>
          <h1 class="section-title mt-3">{{ t("blog.title") }}</h1>
          <p class="lead mt-4">{{ t("blog.lead") }}</p>
        </div>
        <a
          class="link-arrow shrink-0 self-start sm:self-auto"
          :href="feedHref"
          target="_blank"
          rel="alternate noopener"
        >
          <Icon name="rss" /><span>RSS</span>
        </a>
      </div>

      <!-- Featured (latest) post: cover on the left, copy on the right. The
           title link stretches over the whole card via its ::after. -->
      <article
        v-spotlight
        v-reveal
        class="card mt-12 grid gap-4 p-3 md:grid-cols-2 md:gap-6"
      >
        <div
          class="relative aspect-[16/10] overflow-hidden rounded-tile md:aspect-auto md:min-h-[320px]"
          :style="{ backgroundImage: featured.gradient }"
          aria-hidden="true"
        >
          <!-- Dotted texture over the gradient -->
          <div
            class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1.2px)] bg-[size:14px_14px] opacity-40"
          ></div>
          <!-- Soft vignette so the cover reads as a surface, not a swatch -->
          <div
            class="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-white/5"
          ></div>
        </div>

        <div
          class="flex flex-col justify-center px-2 pt-2 pb-4 sm:px-4 sm:pb-5 md:px-6 md:py-8"
        >
          <div class="meta-row">
            <span>{{ formatPostDate(featured.date, locale) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{
              t("blog.readingTime", { minutes: featuredContent?.minutes })
            }}</span>
          </div>
          <div :lang="featuredLang" class="mt-4">
            <h2
              class="text-2xl leading-[1.15] sm:text-3xl lg:text-[2.25rem]"
            >
              <RouterLink
                :to="lp(`/blog/${featured.slug}`)"
                class="text-ink-strong transition-colors duration-200 after:absolute after:inset-0 after:rounded-card hover:text-berry"
                >{{ featuredContent?.title }}</RouterLink
              >
            </h2>
            <p class="mt-4 text-base sm:text-lg">
              {{ featuredContent?.excerpt }}
            </p>
          </div>
          <div class="mt-6 flex flex-wrap gap-2">
            <span v-for="tag in featured.tags" :key="tag" class="chip">{{
              tag
            }}</span>
          </div>
        </div>
      </article>

      <!-- Remaining posts -->
      <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(post, i) in rest"
          :key="post.slug"
          v-reveal="i * 80"
          class="grid"
        >
          <PostCard :post="post" />
        </div>
      </div>
    </div>
  </section>
</template>
