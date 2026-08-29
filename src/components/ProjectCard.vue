<script setup lang="ts">
/**
 * ProjectCard
 *
 * Portfolio card for the projects page: a gradient cover with a giant
 * hollow initial spilling out of its corner and a glass meta pill (category
 * · year), then the localised title and description, technology chips and —
 * for shipped products with a public URL — an external "visit" link.
 * Self-contained: it fills the height of whatever grid cell it is dropped
 * into. `v-spotlight` adds the pointer-following glow and `v-tilt` a subtle
 * 3D lean; the hollow initial fills in while the card is hovered.
 *
 * @prop project - The {@link Project} metadata to render.
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Project } from "../data/projects";

const props = defineProps<{ project: Project }>();

const { t } = useI18n();

/** Upper-cased first letter of the project id, drawn as the cover initial. */
const initial = computed(() => props.project.id.charAt(0).toUpperCase());
</script>

<template>
  <article
    v-spotlight
    v-tilt="5"
    class="card group flex h-full flex-col overflow-hidden p-0 sm:p-0"
  >
    <!-- Cover: gradient + dot texture + hollow initial (decorative) and
         the category · year pill. -->
    <div class="relative aspect-[4/3] overflow-hidden">
      <div class="absolute inset-0" aria-hidden="true">
        <div
          class="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
          :style="{ backgroundImage: project.gradient }"
        ></div>
        <div
          class="absolute inset-0 opacity-60 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1.4px)] [background-size:14px_14px]"
        ></div>
        <div
          class="absolute inset-0 bg-linear-to-t from-bg/70 via-transparent to-white/10"
        ></div>
        <span
          class="initial outline-text absolute -right-4 -bottom-10 font-display text-[8rem] leading-none font-bold tracking-[-0.06em] select-none"
          >{{ initial }}</span
        >
      </div>
      <span
        class="meta-row absolute top-4 left-4 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-white"
      >
        <span>{{ t(`projects.categories.${project.category}`) }}</span>
        <span class="text-berry" aria-hidden="true">·</span>
        <span>{{ project.year }}</span>
      </span>
    </div>

    <div class="flex flex-1 flex-col p-7">
      <h2 class="card-title text-2xl leading-tight">
        {{ t(`projects.items.${project.id}.title`) }}
      </h2>
      <p class="mt-3 flex-1 text-[0.95rem]">
        {{ t(`projects.items.${project.id}.description`) }}
      </p>

      <div class="mt-6 flex flex-wrap gap-2">
        <span v-for="tech in project.tech" :key="tech" class="chip">{{
          tech
        }}</span>
      </div>

      <a
        v-if="project.url"
        :href="project.url"
        class="btn btn-primary btn-sm mt-7 self-start"
        target="_blank"
        rel="noopener"
        >{{ t("projects.visit") }} <Icon name="arrow-up-right-from-square"
      /></a>
    </div>
  </article>
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

/* The hollow initial fills in while the whole card is hovered. */
.initial {
  -webkit-text-stroke-color: rgba(255, 255, 255, 0.45);
}
.card:hover .initial {
  color: rgba(255, 255, 255, 0.85);
  -webkit-text-stroke-color: transparent;
}
</style>
