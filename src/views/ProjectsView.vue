<script setup lang="ts">
/**
 * ProjectsView (`/projects`)
 *
 * The full portfolio with a category filter. Selecting a pill narrows the grid
 * to a single discipline; "all" shows everything.
 */
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { projects, type ProjectCategory } from "../data/projects";
import ProjectCard from "../components/ProjectCard.vue";

/** A filter pill value: any project category, or `"all"` for no filter. */
type Filter = ProjectCategory | "all";

const { t } = useI18n();

/** Filter options rendered as pills, in display order. */
const categories: Filter[] = ["all", "web", "mobile", "design", "devops"];

/** The currently selected filter. */
const active = ref<Filter>("all");

/** Projects matching the active filter (all projects when `"all"`). */
const filtered = computed(() =>
  active.value === "all"
    ? projects
    : projects.filter((p) => p.category === active.value),
);
</script>

<template>
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head">
        <p class="pb-eyebrow">{{ t("projects.eyebrow") }}</p>
        <h1>{{ t("projects.title") }}</h1>
        <p class="pb-section-lead">{{ t("projects.lead") }}</p>
      </div>
      <div
        class="pb-filter"
        role="group"
        :aria-label="t('projects.filterLabel')"
      >
        <button
          v-for="cat in categories"
          :key="cat"
          class="pb-filter-btn"
          :class="{ 'is-active': active === cat }"
          type="button"
          :aria-pressed="active === cat"
          @click="active = cat"
        >
          {{ t(`projects.categories.${cat}`) }}
        </button>
      </div>
      <div
        class="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-3@m"
        uk-grid
      >
        <div v-for="project in filtered" :key="project.id">
          <ProjectCard :project="project" />
        </div>
      </div>
    </div>
  </section>
</template>
