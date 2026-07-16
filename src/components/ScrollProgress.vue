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
 * (compositor-only — no layout or paint per frame). Scroll/resize events are
 * coalesced through `requestAnimationFrame` so the ratio is computed at most
 * once per frame. All listeners are removed when the component unmounts.
 */
import { onMounted, onUnmounted, ref } from "vue";

/** Current scroll completion as a 0–1 ratio (drives `scaleX`). */
const progress = ref(0);

/** Pending rAF id, or `0` when no frame is scheduled. */
let frame = 0;

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
});

onUnmounted(() => {
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) cancelAnimationFrame(frame);
});
</script>

<template>
  <div class="pb-scroll-progress" aria-hidden="true">
    <div
      class="pb-scroll-progress-bar"
      :style="{ transform: `scaleX(${progress})` }"
    ></div>
  </div>
</template>
