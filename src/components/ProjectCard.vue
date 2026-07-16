<script setup lang="ts">
/**
 * ProjectCard
 *
 * Portfolio card showing a project's gradient thumbnail (with its initial),
 * category/year meta, localised title and description, and technology chips.
 * The `v-spotlight` directive adds a pointer-following glow on hover.
 *
 * @prop project - The {@link Project} metadata to render.
 */
import { useI18n } from "vue-i18n";
import type { Project } from "../data/projects";

defineProps<{ project: Project }>();

const { t } = useI18n();
</script>

<template>
  <div v-spotlight class="uk-card uk-card-default uk-card-hover uk-card-body">
    <div
      class="pb-project-thumb"
      :style="{ backgroundImage: project.gradient }"
    >
      <span class="pb-project-initial">{{
        project.id.charAt(0).toUpperCase()
      }}</span>
    </div>
    <div class="pb-project-meta">
      <span>{{ t(`projects.categories.${project.category}`) }}</span>
      <span>{{ project.year }}</span>
    </div>
    <h3 class="uk-card-title">{{ t(`projects.items.${project.id}.title`) }}</h3>
    <p>{{ t(`projects.items.${project.id}.description`) }}</p>
    <div class="pb-chip-row">
      <span v-for="tech in project.tech" :key="tech" class="pb-chip">{{
        tech
      }}</span>
    </div>
  </div>
</template>
