<script setup lang="ts">
/**
 * BlogView (`/blog`)
 *
 * The blog index, laid out editorially: a twelve-column featured spread for
 * the newest post (gradient cover with an oversized outline index on the
 * left, title and summary on the right) followed by the remaining posts as
 * hairline-separated rows in two columns — no cards.
 */
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { posts } from "../data/posts";
import { usePostContent, type PostContent } from "../composables/usePostContent";
import { formatPostDate } from "../assets/js/dates.ts";
import { feedPathFor } from "../assets/js/locales";
import { useLocalePath } from "../composables/useLocalePath";

const { t, locale } = useI18n();
const { getPost } = usePostContent();

/** `featured` is the newest post; `rest` are the remaining posts for the list. */
const [featured, ...rest] = posts;

/** Raw (uncompiled) content for the highlighted featured post. */
const featuredContent = computed(() => getPost(featured.slug));

/**
 * The language attribute for content resolved from a different locale than
 * the active one (English fallback), or `undefined` to omit `lang`.
 *
 * @param content - Resolved post content.
 * @returns The content's language when it differs from the active locale.
 */
const langFor = (content: PostContent | undefined): string | undefined =>
  content && content.lang !== locale.value ? content.lang : undefined;

/**
 * The featured content's language when it differs from the active locale
 * (fallback to English), or `undefined` to omit the `lang` attribute.
 */
const featuredLang = computed(() => langFor(featuredContent.value));

/** The remaining posts paired with their localised content, newest first. */
const entries = computed(() =>
  rest.map((post) => ({ post, content: getPost(post.slug) })),
);

/** The RSS feed matching the active locale. */
const feedHref = computed(() => feedPathFor(locale.value));

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();

/**
 * Two-digit editorial index for a list position (the featured post is "01").
 *
 * @param i - Zero-based position within `rest`.
 * @returns The zero-padded index, e.g. `"02"`.
 */
const index = (i: number): string => String(i + 2).padStart(2, "0");
</script>

<template>
  <section class="section relative grid-lines">
    <div class="container-pb">
      <!-- Page head: index + eyebrow on a hairline, display title, lead; the
           feed link sits on the right on wide screens. -->
      <header class="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-8">
          <p class="section-head">
            <span class="index">01</span>
            <span>{{ t("blog.eyebrow") }}</span>
          </p>
          <h1 class="display-lg mt-8">{{ t("blog.title") }}</h1>
          <p class="lead mt-6">{{ t("blog.lead") }}</p>
        </div>
        <div class="lg:col-span-4 lg:justify-self-end">
          <a
            class="link-arrow h-11"
            :href="feedHref"
            target="_blank"
            rel="alternate noopener"
          >
            <Icon name="rss" /><span>RSS</span>
          </a>
        </div>
      </header>

      <!-- Featured (latest) post: 7/5 split. The cover doubles as a link but
           is hidden from assistive technology; the heading carries the name. -->
      <article
        v-reveal
        class="mt-16 grid gap-8 md:mt-24 lg:grid-cols-12 lg:items-center lg:gap-12"
      >
        <RouterLink
          :to="lp(`/blog/${featured.slug}`)"
          class="group relative block aspect-[16/10] overflow-hidden rounded-card lg:col-span-7"
          :style="{ backgroundImage: featured.gradient }"
          aria-hidden="true"
          tabindex="-1"
        >
          <!-- Dotted texture over the gradient -->
          <span
            class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1.2px)] bg-[size:14px_14px] opacity-40"
          ></span>
          <!-- Soft vignette so the cover reads as a surface, not a swatch -->
          <span
            class="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-white/5"
          ></span>
          <!-- Corner annotations -->
          <span
            class="absolute top-5 left-6 font-mono text-[0.68rem] tracking-[0.28em] text-white/70 uppercase"
            >{{ t("blog.eyebrow") }}</span
          >
          <!-- Oversized outline index, bleeding off the bottom-right corner -->
          <span
            class="outline-text absolute -right-2 -bottom-[0.18em] [-webkit-text-stroke-color:rgba(255,255,255,0.45)] font-display text-[clamp(7rem,18vw,15rem)] leading-none font-semibold tracking-[-0.06em] select-none [-webkit-text-stroke-color:rgba(255,255,255,0.65)] group-hover:text-white group-hover:[-webkit-text-stroke-color:transparent]"
            >01</span
          >
        </RouterLink>

        <div class="min-w-0 lg:col-span-5">
          <p class="meta-row">
            <span>{{ formatPostDate(featured.date, locale) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{
              t("blog.readingTime", { minutes: featuredContent?.minutes })
            }}</span>
          </p>
          <div :lang="featuredLang" class="mt-6">
            <!-- Slightly under display-md on wide screens so long titles stay
                 within four lines beside the cover. -->
            <h2 class="display-md break-words lg:text-[clamp(2.5rem,3.6vw,3.25rem)]">
              <RouterLink
                :to="lp(`/blog/${featured.slug}`)"
                class="link-line transition-colors duration-300 hover:text-berry"
                >{{ featuredContent?.title }}</RouterLink
              >
            </h2>
            <p class="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {{ featuredContent?.excerpt }}
            </p>
            <div class="mt-6 flex flex-wrap gap-2">
              <span v-for="tag in featured.tags" :key="tag" class="chip">{{
                tag
              }}</span>
            </div>
          </div>
          <!-- Arrow-only affordance; the heading above is the accessible link. -->
          <RouterLink
            :to="lp(`/blog/${featured.slug}`)"
            class="link-arrow mt-8 h-11 text-xl"
            aria-hidden="true"
            tabindex="-1"
          >
            <Icon name="arrow-right" />
          </RouterLink>
        </div>
      </article>

      <!-- Remaining posts: editorial rows, two columns from `md` up -->
      <div class="mt-20 grid border-b border-line md:mt-28 md:grid-cols-2 md:gap-x-12">
        <article
          v-for="({ post, content }, i) in entries"
          :key="post.slug"
          v-reveal="(i % 2) * 90"
          class="group min-w-0 border-t border-line py-7"
        >
          <p class="meta-row">
            <span class="num">{{ index(i) }}</span>
            <span>{{ formatPostDate(post.date, locale) }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ t("blog.readingTime", { minutes: content?.minutes }) }}</span>
          </p>
          <div :lang="langFor(content)" class="mt-4">
            <h3 class="font-display text-2xl leading-[1.12] font-semibold break-words">
              <RouterLink
                :to="lp(`/blog/${post.slug}`)"
                class="link-line transition-colors duration-300 group-hover:text-berry"
                >{{ content?.title }}</RouterLink
              >
            </h3>
            <p class="mt-3 line-clamp-2 leading-relaxed text-muted">
              {{ content?.excerpt }}
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="tag in post.tags" :key="tag" class="chip">{{
                tag
              }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
