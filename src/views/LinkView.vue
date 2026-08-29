<script setup lang="ts">
/**
 * LinkView (`/link`)
 *
 * Thin layout wrapper for the `/link/<platform>` redirect shorteners. It only
 * hosts a `<RouterView>` inside a centred "redirecting…" interstitial: an
 * orbiting neon ring around the destination platform's mark, a mono
 * annotation of the path and the child view's message. Each child route
 * immediately redirects to the matching external profile (see the router
 * configuration).
 */
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";

const route = useRoute();

/** Brand icons bundled for the redirect targets (see `Icon.vue`). */
const BRAND_ICONS = new Set([
  "discord",
  "instagram",
  "twitch",
  "youtube",
  "twitter",
  "facebook",
  "tiktok",
]);

/** Icon drawn inside the ring: the platform's mark, or a generic "leave" arrow. */
const icon = computed(() => {
  const platform = route.path.split("/").pop() ?? "";
  const name = platform === "x" ? "twitter" : platform;
  return BRAND_ICONS.has(name) ? name : "arrow-up-right-from-square";
});
</script>

<template>
  <section
    class="section relative flex min-h-[70vh] items-center overflow-hidden"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="container-pb flex flex-col items-center gap-10 text-center">
      <div
        class="relative grid size-44 place-items-center sm:size-56"
        aria-hidden="true"
      >
        <span class="absolute inset-0 rounded-full border border-line"></span>
        <span
          class="orbit-ring animate-orbit absolute inset-0 rounded-full border-2 border-berry"
        ></span>
        <span
          class="orbit-ring-inner animate-spin-slow absolute inset-5 rounded-full border border-dashed border-cyan/50"
        ></span>
        <Icon :name="icon" class="text-4xl text-ink-strong sm:text-5xl" />
      </div>

      <div class="flex max-w-2xl flex-col items-center gap-4">
        <p class="meta-row justify-center">
          <span class="text-berry" aria-hidden="true">//</span>
          <span>{{ route.path }}</span>
        </p>
        <RouterView />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Only an arc of the ring is visible; the arc travels around the circle. */
.orbit-ring {
  mask-image: conic-gradient(from 0deg, black, transparent 60%);
  -webkit-mask-image: conic-gradient(from 0deg, black, transparent 60%);
}
.orbit-ring-inner {
  animation-direction: reverse;
}
</style>
