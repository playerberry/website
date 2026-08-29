<script setup lang="ts">
/**
 * ProjectsView (`/projects`)
 *
 * The full portfolio as an editorial spread: title and lead on the left, an
 * oversized counter of the visible projects on the right, a segmented
 * category filter on a hairline, then the card grid. Picking a segment
 * narrows the grid to one discipline ("all" shows everything); cards fade
 * and scale in and out through a `TransitionGroup` and the survivors slide
 * to their new slot (FLIP move) so filtering feels continuous.
 */
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { projects, type ProjectCategory } from "../data/projects";
import ProjectCard from "../components/ProjectCard.vue";

/** A filter segment value: any project category, or `"all"` for no filter. */
type Filter = ProjectCategory | "all";

const { t } = useI18n();

/** Every category, in display order. */
const ALL_CATEGORIES: ProjectCategory[] = ["web", "mobile", "design", "devops"];

/**
 * Filter options rendered as segments: "all" plus only the categories that
 * have at least one project, so the control never offers an empty view.
 */
const categories: Filter[] = [
  "all",
  ...ALL_CATEGORIES.filter((c) => projects.some((p) => p.category === c)),
];

/** A filter is pointless with a single category; the bar is hidden then. */
const showFilter = categories.length > 2;

/** The currently selected filter. */
const active = ref<Filter>("all");

/** Projects matching the active filter (all projects when `"all"`). */
const filtered = computed(() =>
  active.value === "all"
    ? projects
    : projects.filter((p) => p.category === active.value),
);

/** Zero-padded count for the big counter and the mono "03 / 06" readout. */
const pad = (n: number): string => String(n).padStart(2, "0");

/** A grid cell's box relative to the grid (its offset parent), in pixels. */
interface CellBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Cell boxes measured when the first card of a filter change starts leaving,
 * i.e. before any card is taken out of flow. Vue fires `before-leave` per
 * card and applies `position: absolute` right after each call, which would
 * reflow the grid and skew later measurements — so all cells are measured
 * together on the first call. Cleared once the synchronous patch is over.
 */
let cellBoxes: Map<Element, CellBox> | null = null;

/**
 * Pins a card that is about to leave the grid to the slot it currently
 * occupies. The leave transition takes the card out of flow
 * (`position: absolute`, see the scoped styles) so the remaining cards can
 * slide into place; without these inline offsets the card would collapse to
 * the grid's top-left corner while fading out.
 *
 * @param el - The grid cell being removed (a `TransitionGroup` child).
 */
const pinLeaving = (el: Element): void => {
  if (!cellBoxes) {
    cellBoxes = new Map();
    for (const cell of Array.from(el.parentElement?.children ?? [])) {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } =
        cell as HTMLElement;
      cellBoxes.set(cell, {
        left: offsetLeft,
        top: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
      });
    }
    queueMicrotask(() => {
      cellBoxes = null;
    });
  }
  const box = cellBoxes.get(el);
  if (!box) return;
  const cell = el as HTMLElement;
  cell.style.left = `${box.left}px`;
  cell.style.top = `${box.top}px`;
  cell.style.width = `${box.width}px`;
  cell.style.height = `${box.height}px`;
};
</script>

<template>
  <section class="section relative grid-lines overflow-hidden">
    <div class="container-pb relative">
      <!-- Opening spread: copy left, oversized live counter right. -->
      <div class="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div v-reveal class="lg:col-span-7">
          <p class="section-head">
            <span class="index">01</span>
            <span>{{ t("projects.eyebrow") }}</span>
          </p>
          <h1 class="display-lg mt-8">{{ t("projects.title") }}</h1>
          <p class="lead mt-6">{{ t("projects.lead") }}</p>
        </div>

        <div
          v-reveal="140"
          class="hidden lg:col-span-5 lg:flex lg:flex-col lg:items-end lg:text-right"
          aria-hidden="true"
        >
          <div
            class="relative h-[7rem] overflow-hidden font-display text-[7rem] leading-none font-semibold tracking-[-0.05em] text-ink/8 select-none"
          >
            <Transition name="count" mode="out-in">
              <span :key="filtered.length" class="block">{{
                pad(filtered.length)
              }}</span>
            </Transition>
          </div>
          <p class="mt-3 font-mono text-xs tracking-[0.18em] text-muted uppercase">
            // {{ t(`projects.categories.${active}`) }}
          </p>
        </div>
      </div>

      <!-- Segmented filter on a hairline, with a mono "shown / total" readout. -->
      <div
        v-reveal="200"
        class="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-line pt-5"
      >
        <div
          v-if="showFilter"
          class="flex w-full flex-wrap gap-1 rounded-full border border-line bg-surface p-1 sm:inline-flex sm:w-auto"
          role="group"
          :aria-label="t('projects.filterLabel')"
        >
          <button
            v-for="cat in categories"
            :key="cat"
            class="h-11 flex-1 rounded-full px-2 font-mono text-xs tracking-[0.06em] uppercase transition duration-400 ease-out-soft sm:flex-none sm:px-5 sm:tracking-[0.1em]"
            :class="
              active === cat
                ? 'bg-ink-strong text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]'
                : 'text-muted hover:bg-black/5 hover:text-ink-strong'
            "
            type="button"
            :aria-pressed="active === cat"
            @click="active = cat"
          >
            {{ t(`projects.categories.${cat}`) }}
          </button>
        </div>

        <p
          class="font-mono text-xs tracking-[0.18em] text-muted uppercase"
          role="status"
          aria-live="polite"
        >
          <span class="text-berry">{{ pad(filtered.length) }}</span>
          <span class="mx-2 text-line-strong">/</span>
          <span>{{ pad(projects.length) }}</span>
          <span class="sr-only"> · {{ t(`projects.categories.${active}`) }}</span>
        </p>
      </div>

      <div v-reveal="260" class="mt-10">
        <TransitionGroup
          name="grid"
          tag="div"
          class="relative grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          @before-leave="pinLeaving"
        >
          <div v-for="project in filtered" :key="project.id" class="grid">
            <ProjectCard :project="project" />
          </div>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Filter transition: cards fade + scale (opacity/transform only), and the
 * cards that stay animate to their new slot. A leaving card is taken out of
 * flow so the others can move immediately; `pinLeaving` freezes its box.
 */
.grid-enter-active,
.grid-leave-active,
.grid-move {
  transition:
    opacity 0.3s ease,
    transform 0.3s var(--ease-out-expo);
}
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
.grid-leave-active {
  position: absolute;
  pointer-events: none;
}

/* The big counter rolls like an odometer when the filter changes. */
.count-enter-active,
.count-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.5s var(--ease-out-expo);
}
.count-enter-from {
  opacity: 0;
  transform: translateY(40%);
}
.count-leave-to {
  opacity: 0;
  transform: translateY(-40%);
}
</style>
