<script setup lang="ts">
/**
 * ProjectCard
 *
 * Portfolio card showing a project's gradient thumbnail (dotted texture plus
 * its initial, which lifts on hover), category/year meta, localised title
 * and description, technology chips and — for shipped products with a
 * public URL — an external "visit" link. Self-contained: it fills the height
 * of whatever grid cell it is dropped into. The `v-spotlight` directive adds
 * a pointer-following glow on hover.
 *
 * @prop project - The {@link Project} metadata to render.
 */
import { useI18n } from "vue-i18n";
import type { Project } from "../data/projects";

defineProps<{ project: Project }>();

const { t } = useI18n();
</script>

<template>
  <article v-spotlight class="card group flex h-full flex-col">
    <!-- Thumbnail: gradient + dot texture + oversized initial (decorative). -->
    <div
      class="relative aspect-[16/10] overflow-hidden rounded-tile"
      aria-hidden="true"
    >
      <div
        class="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        :style="{ backgroundImage: project.gradient }"
      ></div>
      <div
        class="absolute inset-0 opacity-70 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1.4px)] [background-size:14px_14px]"
      ></div>
      <div
        class="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-white/10"
      ></div>
      <span
        class="absolute right-5 -bottom-2 font-display text-7xl leading-none font-bold text-white/30 transition duration-500 ease-out-expo group-hover:-translate-y-1.5 group-hover:text-white/55"
        >{{ project.id.charAt(0).toUpperCase() }}</span
      >
    </div>

    <div class="meta-row mt-5">
      <span>{{ t(`projects.categories.${project.category}`) }}</span>
      <span class="text-berry" aria-hidden="true">·</span>
      <span>{{ project.year }}</span>
    </div>

    <h3 class="card-title mt-2 text-xl">
      {{ t(`projects.items.${project.id}.title`) }}
    </h3>
    <p class="mt-2 flex-1 text-[0.95rem]">
      {{ t(`projects.items.${project.id}.description`) }}
    </p>

    <div class="mt-5 flex flex-wrap gap-2">
      <span v-for="tech in project.tech" :key="tech" class="chip">{{
        tech
      }}</span>
    </div>

    <a
      v-if="project.url"
      :href="project.url"
      class="link-arrow mt-5 self-start"
      target="_blank"
      rel="noopener"
      >{{ t("projects.visit") }} <Icon name="arrow-up-right-from-square"
    /></a>
  </article>
</template>
