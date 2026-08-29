<script setup lang="ts">
/**
 * ScrollProgress
 *
 * A thin gradient bar pinned to the very top of the viewport that fills from
 * left to right as the visitor scrolls the document. It is a small, always-on
 * cue that reinforces PlayerBerry's motion-forward, dynamic brand feel and
 * gives readers a sense of how far through a page they are.
 *
 * The bar is decorative (`aria-hidden`) and animates via `transform: scaleX`
 * (compositor-only — no layout or paint per frame). Scroll/resize events and
 * document-size changes (observed with a `ResizeObserver`, so the ratio stays
 * correct when content grows or shrinks without a scroll — a locale switch,
 * a lazily loaded route, fonts arriving) are coalesced through
 * `requestAnimationFrame` so the ratio is computed at most once per frame.
 * All listeners and the observer are removed when the component unmounts.
 */
import { onMounted, onUnmounted, ref } from "vue";

/** Current scroll completion as a 0–1 ratio (drives `scaleX`). */
const progress = ref(0);

/** Pending rAF id, or `0` when no frame is scheduled. */
let frame = 0;

/** Observer re-measuring when the document's height changes. */
let observer: ResizeObserver | undefined;

/**
 * Recompute the scroll ratio for the current viewport position. When the page
 * is not tall enough to scroll, the bar stays empty.
 */
const measure = (): void => {
  frame = 0;
  const scrollable =
    document.documentElement.scrollHeight - window.innerHeight;
  progress.value = scrollable > 0 ? window.scrollY / scrollable : 0;
};

/** Schedule a measurement on the next animation frame (at most one pending). */
const schedule = (): void => {
  if (!frame) frame = requestAnimationFrame(measure);
};

onMounted(() => {
  measure();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  // Observe both the root and the body: the body carries the content height,
  // and the root covers the case where it is later given a fixed height.
  observer = new ResizeObserver(schedule);
  observer.observe(document.documentElement);
  observer.observe(document.body);
});

onUnmounted(() => {
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  observer?.disconnect();
  observer = undefined;
  if (frame) cancelAnimationFrame(frame);
});
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-linear-to-r from-berry via-violet to-cyan will-change-transform"
    :style="{ transform: `scaleX(${progress})` }"
    aria-hidden="true"
  ></div>
</template>
