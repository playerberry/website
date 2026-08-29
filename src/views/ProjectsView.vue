<script setup lang="ts">
/**
 * ProjectsView (`/projects`)
 *
 * The full portfolio with a category filter. Selecting a pill narrows the grid
 * to a single discipline; "all" shows everything. Cards fade and scale in and
 * out of the grid through a `TransitionGroup`, and the survivors slide to
 * their new slot (FLIP move) so filtering feels continuous.
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
  <section class="section">
    <div class="container-pb">
      <div v-reveal>
        <p class="eyebrow">{{ t("projects.eyebrow") }}</p>
        <h1 class="section-title mt-3">{{ t("projects.title") }}</h1>
        <p class="lead mt-4">{{ t("projects.lead") }}</p>
      </div>

      <div
        v-reveal="120"
        class="mt-10 flex flex-wrap gap-2"
        role="group"
        :aria-label="t('projects.filterLabel')"
      >
        <button
          v-for="cat in categories"
          :key="cat"
          class="h-9 rounded-full border px-4 font-mono text-xs transition duration-300 ease-out-soft"
          :class="
            active === cat
              ? 'border-berry/50 bg-berry/12 text-ink-strong'
              : 'border-line text-muted hover:border-line-strong hover:bg-white/[0.03] hover:text-ink'
          "
          type="button"
          :aria-pressed="active === cat"
          @click="active = cat"
        >
          {{ t(`projects.categories.${cat}`) }}
        </button>
      </div>

      <div v-reveal="200" class="mt-10">
        <TransitionGroup
          name="grid"
          tag="div"
          class="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
</style>
