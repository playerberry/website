<script setup lang="ts">
/**
 * ScrollProgress
 *
 * A thin gradient bar pinned to the very top of the viewport that fills from
 * left to right as the visitor scrolls the document. It is a small, always-on
 * cue that reinforces PlayerBerry's motion-forward, dynamic brand feel and
 * gives readers a sense of how far through a page they are.
 *
 * The bar is decorative (`aria-hidden`) and updates on passive scroll/resize
 * listeners that are removed when the component unmounts.
 */
import { onMounted, onUnmounted, ref } from "vue";

/** Current scroll completion, from `0` (top) to `100` (bottom), in percent. */
const progress = ref(0);

/**
 * Recompute the scroll ratio for the current viewport position. When the page
 * is not tall enough to scroll, the bar stays empty.
 */
const update = (): void => {
  const scrollable =
    document.documentElement.scrollHeight - window.innerHeight;
  progress.value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
};

onMounted(() => {
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
});

onUnmounted(() => {
  window.removeEventListener("scroll", update);
  window.removeEventListener("resize", update);
});
</script>

<template>
  <div class="pb-scroll-progress" aria-hidden="true">
    <div class="pb-scroll-progress-bar" :style="{ width: `${progress}%` }"></div>
  </div>
</template>
