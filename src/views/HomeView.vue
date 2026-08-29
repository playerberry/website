<script setup lang="ts">
/**
 * HomeView (`/`)
 *
 * The landing page: hero, an infinite tech-stack marquee, services, the work
 * process, a featured-projects grid, a preview of the latest blog posts and a
 * closing call-to-action. All copy is localised; the project/post cards reuse
 * the shared card components.
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
  <section class="pb-hero">
    <div class="uk-container uk-text-center">
      <h1 class="pb-hero-title">
        {{ t("hero.titleTop") }}<br />
        <span class="super-text">{{ t("hero.titleHighlight") }}</span>
      </h1>
      <p class="pb-hero-lead">{{ t("hero.description") }}</p>
      <div class="pb-hero-actions">
        <RouterLink
          :to="lp('/projects')"
          class="uk-button uk-button-primary uk-button-large"
          >{{ t("hero.ctaPrimary") }}</RouterLink
        >
        <RouterLink
          :to="lp('/contact')"
          class="uk-button uk-button-default uk-button-large"
          >{{ t("hero.ctaSecondary") }}</RouterLink
        >
      </div>
      <div class="pb-hero-stats">
        <div v-for="stat in stats" :key="stat" class="pb-stat">
          <div class="pb-stat-value">{{ t(`hero.stats.${stat}.value`) }}</div>
          <div class="pb-stat-label">{{ t(`hero.stats.${stat}.label`) }}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Tech stack marquee -->
  <div class="pb-marquee" aria-hidden="true">
    <div class="pb-marquee-track">
      <span
        v-for="(item, i) in [...techStack, ...techStack]"
        :key="i"
        class="pb-marquee-item"
        >{{ item }}</span
      >
    </div>
  </div>

  <!-- Services -->
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head uk-text-center">
        <p class="pb-eyebrow">{{ t("home.services.eyebrow") }}</p>
        <h2>{{ t("home.services.title") }}</h2>
        <p class="pb-section-lead uk-margin-auto">
          {{ t("home.services.lead") }}
        </p>
      </div>
      <div
        class="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-4@m"
        uk-grid
        uk-scrollspy="cls: uk-animation-slide-bottom-small; target: > div; delay: 100"
      >
        <div v-for="svc in services" :key="svc.key">
          <div v-spotlight class="uk-card uk-card-default uk-card-hover uk-card-body">
            <div class="pb-icon-tile" :class="svc.tone">
              <Icon :name="svc.icon" />
            </div>
            <h3 class="uk-card-title">
              {{ t(`home.services.items.${svc.key}.title`) }}
            </h3>
            <p>{{ t(`home.services.items.${svc.key}.description`) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Process -->
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head">
        <p class="pb-eyebrow">{{ t("home.process.eyebrow") }}</p>
        <h2>{{ t("home.process.title") }}</h2>
        <p class="pb-section-lead">{{ t("home.process.lead") }}</p>
      </div>
      <div
        class="uk-grid uk-child-width-1-2@s uk-child-width-1-4@m"
        uk-grid
        uk-scrollspy="cls: uk-animation-slide-bottom-small; target: > div; delay: 100"
      >
        <div v-for="(step, i) in steps" :key="step">
          <div class="pb-step">
            <span class="pb-step-num">0{{ i + 1 }}</span>
            <h3>{{ t(`home.process.steps.${step}.title`) }}</h3>
            <p>{{ t(`home.process.steps.${step}.description`) }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured work -->
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head pb-section-head-row">
        <div>
          <p class="pb-eyebrow">{{ t("home.work.eyebrow") }}</p>
          <h2>{{ t("home.work.title") }}</h2>
          <p class="pb-section-lead">{{ t("home.work.lead") }}</p>
        </div>
        <RouterLink :to="lp('/projects')" class="pb-link-arrow"
          >{{ t("home.work.viewAll") }}
          <Icon name="arrow-right" /></RouterLink>
      </div>
      <div
        class="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-3@m"
        uk-grid
        uk-scrollspy="cls: uk-animation-slide-bottom-small; target: > div; delay: 100"
      >
        <div v-for="project in featured" :key="project.id">
          <ProjectCard :project="project" />
        </div>
      </div>
    </div>
  </section>

  <!-- Blog preview -->
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head pb-section-head-row">
        <div>
          <p class="pb-eyebrow">{{ t("home.journal.eyebrow") }}</p>
          <h2>{{ t("home.journal.title") }}</h2>
          <p class="pb-section-lead">{{ t("home.journal.lead") }}</p>
        </div>
        <RouterLink :to="lp('/blog')" class="pb-link-arrow"
          >{{ t("home.journal.viewAll") }}
          <Icon name="arrow-right" /></RouterLink>
      </div>
      <div
        class="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-3@m"
        uk-grid
        uk-scrollspy="cls: uk-animation-slide-bottom-small; target: > div; delay: 100"
      >
        <div v-for="post in latestPosts" :key="post.slug">
          <PostCard :post="post" />
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-cta">
        <h2>{{ t("home.cta.title") }}</h2>
        <p>{{ t("home.cta.description") }}</p>
        <RouterLink
          :to="lp('/contact')"
          class="uk-button uk-button-primary uk-button-large"
          >{{ t("home.cta.button") }}</RouterLink
        >
      </div>
    </div>
  </section>
</template>
