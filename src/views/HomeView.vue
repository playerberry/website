<script setup lang="ts">
/**
 * HomeView (`/`)
 *
 * The landing page, composed as an editorial sequence rather than a stack
 * of centred sections:
 *
 * 1. Asymmetric hero — meta line, two-line display headline, a typewriter
 *    of what we build, lead and buttons on the left; a self-running
 *    terminal window on the right; vertical rails in the corners. A
 *    hairlined statistics strip (count-up numbers) closes it.
 * 2. Two counter-rotating marquees of hollow tech-stack names.
 * 3. Services as a bento grid.
 * 4. The four-step process with a sticky heading column.
 * 5. Selected work as hairlined rows with a pointer-following preview.
 * 6. The latest posts as editorial rows.
 * 7. A full-bleed gradient call-to-action band.
 *
 * All copy is localised; project rows and post rows read the same data the
 * portfolio and blog pages use.
 */
import { computed, ref, type ComponentPublicInstance } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { projects } from "../data/projects";
import { posts } from "../data/posts";
import { SUPPORTED_LOCALES } from "../assets/js/locales";
import { formatPostDate } from "../assets/js/dates.ts";
import ProjectRow from "../components/ProjectRow.vue";
import TerminalCard from "../components/TerminalCard.vue";
import Typewriter from "../components/Typewriter.vue";
import { useCountUp } from "../composables/useCountUp";
import { useLocalePath } from "../composables/useLocalePath";
import { usePostContent } from "../composables/usePostContent";

const { t, tm, locale } = useI18n();
const { getPost } = usePostContent();

/** Projects flagged `featured`, listed in the home "selected work" rows. */
const featured = projects.filter((p) => p.featured);

/** The three most recent posts for the blog preview. */
const latestPosts = posts.slice(0, 3);

/** Latest posts paired with their localised content (title, excerpt, …). */
const journal = computed(() =>
  latestPosts.map((post) => ({ post, content: getPost(post.slug) })),
);

/** Labels for the hollow tech-stack marquees under the hero. */
const techStack = [
  "Vue",
  "TypeScript",
  "Swift",
  "SwiftUI",
  "Node.js",
  "Fastify",
  "PostgreSQL",
  "Redis",
  "Docker",
  "Kubernetes",
  "Vite",
  "Figma",
];

/**
 * Service tiles; `key` resolves localised copy, `icon`/`tone` style the
 * tile and `span` places it in the bento grid.
 */
const services = [
  { key: "web", icon: "code", tone: "", span: "md:col-span-4" },
  {
    key: "mobile",
    icon: "mobile-screen",
    tone: "is-violet",
    span: "md:col-span-2 md:row-span-2",
  },
  { key: "design", icon: "palette", tone: "is-blue", span: "md:col-span-2" },
  { key: "devops", icon: "cloud", tone: "is-cyan", span: "md:col-span-2" },
];

/** i18n key suffixes for the four numbered process steps. */
const steps = ["discover", "design", "build", "launch"];

/** i18n key suffixes for the statistic strip under the hero. */
const stats = ["years", "projects", "clients", "uptime"];

/**
 * One statistic cell: the element to watch and the counting text. Each
 * value counts up from zero the first time its cell scrolls into view.
 */
interface StatCell {
  key: string;
  el: ReturnType<typeof ref<HTMLElement | null>>;
  text: ReturnType<typeof useCountUp>;
}

const statCells: StatCell[] = stats.map((key) => {
  const el = ref<HTMLElement | null>(null);
  const value = computed(() => t(`hero.stats.${key}.value`));
  return { key, el, text: useCountUp(value, el) };
});

/**
 * Template-ref callback for a statistic cell.
 *
 * @param cell - The cell to bind.
 * @param node - The mounted element (or `null` on unmount).
 */
const bindStat = (
  cell: StatCell,
  node: Element | ComponentPublicInstance | null,
): void => {
  cell.el.value = node instanceof HTMLElement ? node : null;
};

/** The rotating phrases typed out under the headline. */
const rotating = computed(() => tm("hero.rotating") as string[]);

/** The services eyebrow without its `// ` prefix, for the hero meta line. */
const servicesLabel = computed(() =>
  t("home.services.eyebrow").replace(/^\/\/\s*/, ""),
);

/** Locale codes for the hero's vertical rail. */
const localeRail = SUPPORTED_LOCALES.join(" · ");

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();

/**
 * Two-digit index for section heads and rows (`01`, `02`, …).
 *
 * @param n - 1-based position.
 * @returns The zero-padded label.
 */
const pad = (n: number): string => String(n).padStart(2, "0");
</script>

<template>
  <!-- 1. Hero -->
  <section
    class="grid-lines relative isolate flex min-h-[92vh] items-center overflow-hidden"
  >
    <div class="container-pb w-full pt-32 pb-24 lg:pt-36 lg:pb-28">
      <div class="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div class="lg:col-span-7">
          <p v-reveal class="meta-row">
            <span>// est. 2018</span>
            <span class="text-berry" aria-hidden="true">·</span>
            <span>{{
              t("hero.languages", { count: SUPPORTED_LOCALES.length })
            }}</span>
            <span class="text-berry" aria-hidden="true">·</span>
            <span>{{ servicesLabel }}</span>
          </p>

          <h1
            v-reveal="80"
            class="display-xl mt-8 text-[clamp(3.25rem,9vw,4.75rem)] lg:text-[clamp(3.5rem,6.3vw,5.6rem)]"
          >
            {{ t("hero.titleTop") }}<br />
            <span class="gradient-text">{{ t("hero.titleHighlight") }}</span>
          </h1>

          <p
            v-reveal="160"
            class="mt-8 flex items-baseline gap-3 font-mono text-lg text-cyan sm:text-2xl"
          >
            <span class="text-berry" aria-hidden="true">❯</span>
            <Typewriter :phrases="rotating" />
          </p>

          <p v-reveal="220" class="lead mt-7 max-w-xl">
            {{ t("hero.description") }}
          </p>

          <div v-reveal="280" class="mt-10 flex flex-wrap items-center gap-3">
            <RouterLink
              v-magnetic
              :to="lp('/projects')"
              class="btn btn-primary btn-lg"
              >{{ t("hero.ctaPrimary") }} <Icon name="arrow-right"
            /></RouterLink>
            <RouterLink :to="lp('/contact')" class="btn btn-secondary btn-lg">{{
              t("hero.ctaSecondary")
            }}</RouterLink>
          </div>
        </div>

        <!-- Terminal window with drifting light behind it (lg+). -->
        <div v-reveal="200" class="relative isolate hidden lg:col-span-5 lg:block">
          <div
            class="absolute -top-16 -right-10 -z-10 size-72 animate-float rounded-full [background-image:radial-gradient(closest-side,rgba(255,61,119,0.38),transparent)]"
            aria-hidden="true"
          ></div>
          <div
            class="absolute -bottom-20 -left-14 -z-10 size-80 animate-float-slow rounded-full [background-image:radial-gradient(closest-side,rgba(60,240,197,0.22),transparent)]"
            aria-hidden="true"
          ></div>
          <div
            class="absolute top-1/3 -right-24 -z-10 size-48 animate-float rounded-full [animation-delay:-4s] [background-image:radial-gradient(closest-side,rgba(139,92,246,0.35),transparent)]"
            aria-hidden="true"
          ></div>
          <TerminalCard v-tilt="4" class="rotate-[-2deg]" />
        </div>
      </div>
    </div>

    <!-- Scroll hint rail (bottom left). -->
    <div
      class="absolute bottom-8 left-3 hidden flex-col items-center gap-4 sm:flex lg:left-4"
      aria-hidden="true"
    >
      <span class="rail">{{ t("hero.scroll") }}</span>
      <span class="block h-14 w-px overflow-hidden bg-line">
        <span class="block h-full w-full animate-scroll-hint bg-berry"></span>
      </span>
    </div>

    <!-- Locale rail (top right, lg+). -->
    <div
      class="rail absolute top-32 right-5 hidden lg:block"
      aria-hidden="true"
    >
      {{ localeRail }}
    </div>
  </section>

  <!-- Statistics strip -->
  <div class="border-y border-line">
    <div class="container-pb">
      <dl class="grid grid-cols-2 md:grid-cols-4">
        <div
          v-for="(cell, i) in statCells"
          :key="cell.key"
          :ref="(node) => bindStat(cell, node)"
          v-reveal="i * 80"
          class="flex flex-col-reverse border-line px-2 py-8 sm:px-6 md:py-10 [&:nth-child(even)]:border-l [&:nth-child(n+3)]:border-t md:[&:nth-child(n+2)]:border-l md:[&:nth-child(n+3)]:border-t-0"
        >
          <dt class="meta-row mt-3">
            {{ t(`hero.stats.${cell.key}.label`) }}
          </dt>
          <dd
            class="font-display text-4xl font-semibold tracking-tight text-ink-strong tabular-nums md:text-5xl"
          >
            {{ cell.text }}
          </dd>
        </div>
      </dl>
    </div>
  </div>

  <!-- 2. Tech-stack marquees -->
  <div class="overflow-hidden border-b border-line py-8 md:py-10">
    <ul class="sr-only">
      <li v-for="item in techStack" :key="item">{{ item }}</li>
    </ul>
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <span
          v-for="(item, i) in [...techStack, ...techStack]"
          :key="i"
          class="flex items-center"
        >
          <span
            class="outline-text display-lg px-5 leading-[1.15] whitespace-nowrap sm:px-8"
            >{{ item }}</span
          >
          <span class="text-xl text-berry sm:text-3xl">✦</span>
        </span>
      </div>
    </div>
    <div class="marquee mt-2 md:mt-3" aria-hidden="true">
      <div class="marquee-track animate-marquee-reverse">
        <span
          v-for="(item, i) in [...techStack, ...techStack].reverse()"
          :key="i"
          class="flex items-center"
        >
          <span
            class="outline-text display-lg px-5 leading-[1.15] whitespace-nowrap sm:px-8"
            >{{ item }}</span
          >
          <span class="text-xl text-berry sm:text-3xl">✦</span>
        </span>
      </div>
    </div>
  </div>

  <!-- 3. Services — bento -->
  <section class="section">
    <div class="container-pb">
      <div v-reveal class="section-head">
        <span class="index">{{ pad(1) }}</span>
        <span>{{ t("home.services.eyebrow") }}</span>
      </div>
      <div
        class="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12"
      >
        <h2 v-reveal="60" class="display-md lg:col-span-7">
          {{ t("home.services.title") }}
        </h2>
        <p v-reveal="120" class="lead lg:col-span-5">
          {{ t("home.services.lead") }}
        </p>
      </div>

      <div
        class="mt-14 grid auto-rows-[minmax(220px,auto)] grid-cols-1 gap-4 md:grid-cols-6"
      >
        <div
          v-for="(svc, i) in services"
          :key="svc.key"
          v-reveal="i * 90"
          :class="svc.span"
        >
          <article
            v-spotlight
            v-tilt="3"
            class="card group relative flex h-full flex-col overflow-hidden"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="icon-tile" :class="svc.tone">
                <Icon :name="svc.icon" />
              </div>
              <span class="num" aria-hidden="true">{{ pad(i + 1) }}</span>
            </div>
            <h3
              class="card-title mt-8 text-2xl"
              :class="{ 'lg:text-3xl': svc.key === 'web' }"
            >
              {{ t(`home.services.items.${svc.key}.title`) }}
            </h3>
            <p class="mt-3 max-w-md text-[0.95rem]">
              {{ t(`home.services.items.${svc.key}.description`) }}
            </p>

            <!-- Decorative corner numeral on the wide tile. -->
            <span
              v-if="svc.key === 'web'"
              class="outline-text absolute -right-4 -bottom-12 hidden font-display text-[11rem] leading-none font-bold tracking-[-0.06em] select-none md:block"
              aria-hidden="true"
              >{{ pad(1) }}</span
            >
            <!-- Signal bars fill the tall tile. -->
            <div
              v-if="svc.key === 'mobile'"
              class="mt-auto flex items-end gap-2 pt-10"
              aria-hidden="true"
            >
              <span
                v-for="(h, j) in [28, 44, 36, 60, 48, 76, 56, 92]"
                :key="j"
                class="flex-1 origin-bottom rounded-full bg-linear-to-t from-violet/20 to-violet/70 transition-transform duration-700 ease-out-expo group-hover:scale-y-105"
                :style="{ height: `${h}px` }"
              ></span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>

  <!-- 4. Process — sticky heading, hairlined steps -->
  <section class="section pt-0">
    <div class="container-pb">
      <div class="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div class="self-start lg:sticky lg:top-28 lg:col-span-4">
          <div v-reveal class="section-head">
            <span class="index">{{ pad(2) }}</span>
            <span>{{ t("home.process.eyebrow") }}</span>
          </div>
          <h2 v-reveal="60" class="display-md mt-10">
            {{ t("home.process.title") }}
          </h2>
          <p v-reveal="120" class="lead mt-6">{{ t("home.process.lead") }}</p>
        </div>

        <ol class="lg:col-span-8">
          <li
            v-for="(step, i) in steps"
            :key="step"
            v-reveal="i * 90"
            class="group grid grid-cols-[3.5rem_1fr] gap-x-4 border-t border-line py-8 last:border-b sm:grid-cols-[6rem_1fr] md:py-10"
          >
            <span
              class="font-display text-4xl leading-none font-semibold text-ink/10 transition-colors duration-500 group-hover:text-berry sm:text-6xl"
              aria-hidden="true"
              >{{ pad(i + 1) }}</span
            >
            <div>
              <h3 class="font-display text-2xl font-semibold md:text-3xl">
                {{ t(`home.process.steps.${step}.title`) }}
              </h3>
              <p class="mt-3 max-w-xl leading-relaxed text-muted">
                {{ t(`home.process.steps.${step}.description`) }}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  </section>

  <!-- 5. Selected work — editorial rows -->
  <section class="section pt-0">
    <div class="container-pb">
      <div v-reveal class="section-head">
        <span class="index">{{ pad(3) }}</span>
        <span>{{ t("home.work.eyebrow") }}</span>
      </div>
      <div
        class="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6"
      >
        <div class="max-w-3xl">
          <h2 v-reveal="60" class="display-md">{{ t("home.work.title") }}</h2>
          <p v-reveal="120" class="lead mt-6">{{ t("home.work.lead") }}</p>
        </div>
        <RouterLink
          v-reveal="180"
          :to="lp('/projects')"
          class="link-arrow min-h-11"
          >{{ t("home.work.viewAll") }} <Icon name="arrow-right"
        /></RouterLink>
      </div>

      <div class="mt-10 border-b border-line">
        <ProjectRow
          v-for="(project, i) in featured"
          :key="project.id"
          v-reveal="i * 80"
          :project="project"
          :index="i + 1"
        />
      </div>
    </div>
  </section>

  <!-- 6. Blog — editorial rows -->
  <section class="section pt-0">
    <div class="container-pb">
      <div v-reveal class="section-head">
        <span class="index">{{ pad(4) }}</span>
        <span>{{ t("home.journal.eyebrow") }}</span>
      </div>
      <div
        class="mt-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6"
      >
        <div class="max-w-3xl">
          <h2 v-reveal="60" class="display-md">
            {{ t("home.journal.title") }}
          </h2>
          <p v-reveal="120" class="lead mt-6">{{ t("home.journal.lead") }}</p>
        </div>
        <RouterLink
          v-reveal="180"
          :to="lp('/blog')"
          class="link-arrow min-h-11"
          >{{ t("home.journal.viewAll") }} <Icon name="arrow-right"
        /></RouterLink>
      </div>

      <div class="mt-14 border-b border-line">
        <article
          v-for="({ post, content }, i) in journal"
          :key="post.slug"
          v-reveal="i * 80"
          class="group relative grid gap-x-8 gap-y-3 border-t border-line py-8 transition-colors duration-300 hover:border-ink/30 hover:bg-surface md:grid-cols-[10rem_1fr_auto] md:items-start md:py-10"
        >
          <div class="meta-row flex-col items-start gap-y-1.5 md:pt-2">
            <span>{{ formatPostDate(post.date, locale) }}</span>
            <span>{{
              t("blog.readingTime", { minutes: content?.minutes })
            }}</span>
          </div>
          <div
            :lang="
              content && content.lang !== locale ? content.lang : undefined
            "
            class="min-w-0"
          >
            <h3 class="font-display text-2xl leading-tight md:text-3xl">
              <RouterLink
                :to="lp(`/blog/${post.slug}`)"
                class="link-line static transition-colors duration-300 group-hover:text-berry after:absolute after:inset-0 after:content-['']"
                >{{ content?.title }}</RouterLink
              >
            </h3>
            <p class="mt-3 line-clamp-2 max-w-2xl leading-relaxed text-muted">
              {{ content?.excerpt }}
            </p>
          </div>
          <span
            class="hidden size-11 place-items-center rounded-full border border-line text-muted transition duration-300 ease-out-soft group-hover:border-berry group-hover:bg-berry/10 group-hover:text-berry md:grid"
            aria-hidden="true"
          >
            <Icon name="arrow-right" />
          </span>
        </article>
      </div>
    </div>
  </section>

  <!-- 7. Call to action — full-bleed band -->
  <section class="band">
    <span
      class="outline-text absolute -right-6 -bottom-[0.18em] -z-10 font-display text-[clamp(10rem,32vw,30rem)] leading-none font-bold tracking-[-0.06em] select-none animate-float-slow [-webkit-text-stroke-color:rgba(255,255,255,0.35)]"
      aria-hidden="true"
      >PB</span
    >
    <div class="container-pb py-24 md:py-36">
      <div class="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-8">
          <h2 v-reveal class="display-lg text-white">
            {{ t("home.cta.title") }}
          </h2>
          <p v-reveal="80" class="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            {{ t("home.cta.description") }}
          </p>
        </div>
        <div v-reveal="160" class="lg:col-span-4 lg:flex lg:justify-end">
          <RouterLink
            v-magnetic
            :to="lp('/contact')"
            class="btn btn-lg bg-white text-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] hover:bg-[#e8e8ed]"
            >{{ t("home.cta.button") }} <Icon name="arrow-right"
          /></RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * `.tilt` (added by `v-tilt`) overrides the card's transition shorthand with
 * a transform-only one; restore the hover transitions alongside it.
 */
.card.tilt {
  transition:
    transform 0.6s var(--ease-out-expo),
    border-color 0.35s ease,
    background-color 0.35s ease,
    box-shadow 0.35s ease,
    --pb-spot-color 0.35s ease;
}
</style>
