<script setup lang="ts">
/**
 * ProjectRow
 *
 * One featured project on the home page, laid out as a product feature: a
 * large gradient panel carrying the project's initial on one side and, on
 * the other, the mono index, category and year, the title in display type,
 * the description, the technology chips and — for shipped products with a
 * public `url` — a "visit" button. Consecutive rows alternate the panel side
 * (zig-zag). Hover only breathes the panel; the row itself keeps its ground.
 *
 * @prop project - The {@link Project} metadata to render.
 * @prop index - 1-based position in the list, shown as `01`, `02`, …
 */
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Project } from "../data/projects";

const props = defineProps<{ project: Project; index: number }>();

const { t } = useI18n();

/** Index rendered with a leading zero (`01`, `02`, …). */
const label = computed(() => String(props.index).padStart(2, "0"));

/** Upper-cased first letter of the project id, drawn on the panel. */
const initial = computed(() => props.project.id.charAt(0).toUpperCase());

/** Even rows put the panel on the right. */
const flipped = computed(() => props.index % 2 === 0);
</script>

<template>
  <article
    class="group grid items-center gap-8 border-t border-line py-12 md:py-16 lg:grid-cols-12 lg:gap-12"
  >
    <!-- Gradient panel -->
    <div
      class="relative aspect-[16/11] overflow-hidden rounded-card lg:col-span-6"
      :class="flipped ? 'lg:order-2' : ''"
      aria-hidden="true"
    >
      <div
        class="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        :style="{ backgroundImage: project.gradient }"
      >
        <div
          class="absolute inset-0 opacity-60 mix-blend-overlay [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1.4px)] [background-size:14px_14px]"
        ></div>
        <div
          class="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-white/10"
        ></div>
      </div>
      <span
        class="absolute top-5 left-6 font-mono text-[0.68rem] tracking-[0.28em] text-white/85 uppercase"
        >{{ t(`projects.categories.${project.category}`) }} ·
        {{ project.year }}</span
      >
      <span
        class="outline-text absolute -right-3 -bottom-[0.16em] font-display text-[clamp(9rem,26vw,20rem)] leading-none font-bold [-webkit-text-stroke-color:rgba(255,255,255,0.5)] select-none"
        >{{ initial }}</span
      >
    </div>

    <!-- Copy -->
    <div class="lg:col-span-6" :class="flipped ? 'lg:order-1' : ''">
      <div class="meta-row">
        <span class="text-berry">{{ label }}</span>
        <span>{{ t(`projects.categories.${project.category}`) }}</span>
        <span class="text-line-strong" aria-hidden="true">·</span>
        <span>{{ project.year }}</span>
      </div>
      <h3 class="display-md mt-5">
        {{ t(`projects.items.${project.id}.title`) }}
      </h3>
      <p class="mt-5 max-w-xl text-lg leading-relaxed text-muted">
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
        class="btn btn-primary mt-9"
        target="_blank"
        rel="noopener"
        >{{ t("projects.visit") }} <Icon name="arrow-up-right-from-square"
      /></a>
    </div>
  </article>
</template>
