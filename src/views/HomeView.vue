<script setup lang="ts">
/**
 * HomeView (`/`)
 *
 * The landing page: hero (blueprint grid, ambient light, staggered reveal),
 * an infinite tech-stack marquee, services, the work process as a numbered
 * timeline, a featured-projects grid, a preview of the latest blog posts and
 * a closing gradient-bordered call-to-action. All copy is localised; the
 * project/post cards reuse the shared card components.
 */
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { projects } from "../data/projects";
import { posts } from "../data/posts";
import ProjectCard from "../components/ProjectCard.vue";
import PostCard from "../components/PostCard.vue";
import { useLocalePath } from "../composables/useLocalePath";

const { t } = useI18n();

/** Projects flagged `featured`, shown in the home "selected work" grid. */
const featured = projects.filter((p) => p.featured);

/** The three most recent posts for the blog preview strip. */
const latestPosts = posts.slice(0, 3);

/** Labels for the scrolling tech-stack marquee under the hero. */
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

/** Service cards; `key` resolves localised copy, `icon`/`tone` style the tile. */
const services = [
  { key: "web", icon: "code", tone: "" },
  { key: "mobile", icon: "mobile-screen", tone: "is-violet" },
  { key: "design", icon: "palette", tone: "is-blue" },
  { key: "devops", icon: "cloud", tone: "is-cyan" },
];

/** i18n key suffixes for the four numbered process steps. */
const steps = ["discover", "design", "build", "launch"];

/** i18n key suffixes for the hero statistic tiles. */
const stats = ["years", "projects", "clients", "uptime"];

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <!-- Hero -->
  <section
    class="relative isolate flex min-h-[88vh] items-center overflow-hidden"
  >
    <div class="grid-bg absolute inset-0 -z-10" aria-hidden="true"></div>
    <!-- Ambient light: a soft berry/violet wash behind the title and two
         drifting orbs (transform-only motion). -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute top-[42%] left-1/2 h-[34rem] w-[64rem] max-w-[160vw] -translate-x-1/2 -translate-y-1/2 rounded-full [background-image:radial-gradient(closest-side,rgba(255,61,119,0.2),rgba(139,92,246,0.11)_48%,transparent_100%)]"
      ></div>
      <div
        class="absolute top-[18%] left-[8%] size-40 animate-float rounded-full [background-image:radial-gradient(closest-side,rgba(139,92,246,0.32),transparent)] sm:left-[14%]"
      ></div>
      <div
        class="absolute right-[6%] bottom-[16%] size-56 animate-float rounded-full [animation-delay:-4s] [animation-duration:13s] [background-image:radial-gradient(closest-side,rgba(60,240,197,0.2),transparent)] sm:right-[12%]"
      ></div>
    </div>

    <div class="container-pb py-24 text-center md:py-32">
      <h1
        v-reveal
        class="mx-auto max-w-6xl text-5xl leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl"
      >
        {{ t("hero.titleTop") }}<br />
        <span class="gradient-text">{{ t("hero.titleHighlight") }}</span>
      </h1>
      <p v-reveal="100" class="lead mx-auto mt-7 text-center">
        {{ t("hero.description") }}
      </p>
      <div
        v-reveal="200"
        class="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <RouterLink :to="lp('/projects')" class="btn btn-primary btn-lg">{{
          t("hero.ctaPrimary")
        }}</RouterLink>
        <RouterLink :to="lp('/contact')" class="btn btn-secondary btn-lg">{{
          t("hero.ctaSecondary")
        }}</RouterLink>
      </div>
      <div
        v-reveal="300"
        class="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0"
      >
        <div
          v-for="stat in stats"
          :key="stat"
          class="px-3 sm:border-l sm:border-line sm:first:border-l-0"
        >
          <div
            class="font-display text-3xl font-bold tracking-tight text-ink-strong tabular-nums sm:text-4xl"
          >
            {{ t(`hero.stats.${stat}.value`) }}
          </div>
          <div class="meta-row mt-2 justify-center text-center">
            {{ t(`hero.stats.${stat}.label`) }}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tech stack marquee -->
  <div class="border-y border-line py-5" aria-hidden="true">
    <div class="marquee">
      <div class="marquee-track">
        <span
          v-for="(item, i) in [...techStack, ...techStack]"
          :key="i"
          class="flex items-center gap-10 pr-10"
        >
          <span class="font-mono text-sm text-muted">{{ item }}</span>
          <span class="size-1.5 rounded-full bg-berry/70"></span>
        </span>
      </div>
    </div>
  </div>

  <!-- Services -->
  <section class="section">
    <div class="container-pb">
      <div v-reveal class="mx-auto max-w-2xl text-center">
        <p class="eyebrow">{{ t("home.services.eyebrow") }}</p>
        <h2 class="section-title mt-3">{{ t("home.services.title") }}</h2>
        <p class="lead mx-auto mt-4">{{ t("home.services.lead") }}</p>
      </div>
      <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(svc, i) in services"
          :key="svc.key"
          v-reveal="i * 90"
          class="h-full"
        >
          <article v-spotlight class="card h-full">
            <div class="icon-tile" :class="svc.tone">
              <Icon :name="svc.icon" />
            </div>
            <h3 class="card-title mt-6">
              {{ t(`home.services.items.${svc.key}.title`) }}
            </h3>
            <p class="mt-2 text-[0.95rem]">
              {{ t(`home.services.items.${svc.key}.description`) }}
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>

  <!-- Process -->
  <section class="section pt-0">
    <div class="container-pb">
      <div class="divider-glow mb-20 md:mb-28" aria-hidden="true"></div>
      <div v-reveal class="max-w-2xl">
        <p class="eyebrow">{{ t("home.process.eyebrow") }}</p>
        <h2 class="section-title mt-3">{{ t("home.process.title") }}</h2>
        <p class="lead mt-4">{{ t("home.process.lead") }}</p>
      </div>
      <ol class="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        <li v-for="(step, i) in steps" :key="step" v-reveal="i * 90">
          <div class="flex items-center gap-4" aria-hidden="true">
            <span class="font-mono text-sm tracking-[0.12em] text-berry"
              >0{{ i + 1 }}</span
            >
            <span
              class="h-px flex-1 bg-linear-to-r from-berry/60 via-violet/30 to-transparent"
            ></span>
          </div>
          <h3 class="mt-5 font-display text-xl font-semibold">
            {{ t(`home.process.steps.${step}.title`) }}
          </h3>
          <p class="mt-2 text-[0.95rem] leading-relaxed text-muted">
            {{ t(`home.process.steps.${step}.description`) }}
          </p>
        </li>
      </ol>
    </div>
  </section>

  <!-- Featured work -->
  <section class="section">
    <div class="container-pb">
      <div
        v-reveal
        class="flex flex-wrap items-end justify-between gap-x-10 gap-y-5"
      >
        <div class="max-w-2xl">
          <p class="eyebrow">{{ t("home.work.eyebrow") }}</p>
          <h2 class="section-title mt-3">{{ t("home.work.title") }}</h2>
          <p class="lead mt-4">{{ t("home.work.lead") }}</p>
        </div>
        <RouterLink :to="lp('/projects')" class="link-arrow min-h-10"
          >{{ t("home.work.viewAll") }} <Icon name="arrow-right"
        /></RouterLink>
      </div>
      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(project, i) in featured"
          :key="project.id"
          v-reveal="i * 90"
          class="h-full"
        >
          <ProjectCard :project="project" />
        </div>
      </div>
    </div>
  </section>

  <!-- Blog preview -->
  <section class="section pt-0">
    <div class="container-pb">
      <div
        v-reveal
        class="flex flex-wrap items-end justify-between gap-x-10 gap-y-5"
      >
        <div class="max-w-2xl">
          <p class="eyebrow">{{ t("home.journal.eyebrow") }}</p>
          <h2 class="section-title mt-3">{{ t("home.journal.title") }}</h2>
          <p class="lead mt-4">{{ t("home.journal.lead") }}</p>
        </div>
        <RouterLink :to="lp('/blog')" class="link-arrow min-h-10"
          >{{ t("home.journal.viewAll") }} <Icon name="arrow-right"
        /></RouterLink>
      </div>
      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(post, i) in latestPosts"
          :key="post.slug"
          v-reveal="i * 90"
          class="h-full"
        >
          <PostCard :post="post" />
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="section pt-0">
    <div class="container-pb">
      <div
        v-reveal
        class="rounded-card bg-linear-to-r from-berry via-violet to-cyan p-px shadow-glow"
      >
        <div
          class="relative isolate overflow-hidden rounded-[calc(var(--radius-card)-1px)] bg-bg px-6 py-16 text-center sm:px-12 md:py-24"
        >
          <div
            class="grid-bg absolute inset-0 -z-10 opacity-70"
            aria-hidden="true"
          ></div>
          <div
            class="absolute inset-0 -z-10 [background-image:radial-gradient(60%_90%_at_50%_0%,rgba(255,61,119,0.16),transparent_70%)]"
            aria-hidden="true"
          ></div>
          <h2 class="section-title mx-auto max-w-3xl">
            {{ t("home.cta.title") }}
          </h2>
          <p class="lead mx-auto mt-4 text-center">
            {{ t("home.cta.description") }}
          </p>
          <RouterLink :to="lp('/contact')" class="btn btn-primary btn-lg mt-9">{{
            t("home.cta.button")
          }}</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
