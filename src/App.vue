<script setup lang="ts">
/**
 * Root application shell.
 *
 * Provides the persistent chrome shared by every page — a keyboard-only
 * "skip to content" link, the scroll-progress bar, the site header and footer — and renders the active
 * route in between via `<RouterView>`, wiping new pages in with a short
 * rise-and-reveal transition.
 *
 * After each client-side navigation the `<main>` landmark receives focus so
 * keyboard and screen-reader users land on the new page's content instead of
 * staying on the link they activated (the equivalent of a full page load).
 */
import { nextTick, ref, watch } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import ScrollProgress from "./components/ScrollProgress.vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";

const route = useRoute();
const router = useRouter();

/** The main content landmark, focused after route changes. */
const main = ref<HTMLElement | null>(null);

/**
 * `false` until the initial navigation has resolved — a deep link to a
 * lazy-loaded route settles after mount, and that first change must not
 * move focus (it belongs at the top of the document on a fresh load).
 */
let ready = false;
void router.isReady().then(() => {
  ready = true;
});

watch(
  () => route.path,
  async () => {
    if (!ready) return;
    await nextTick();
    main.value?.focus({ preventScroll: true });
  },
);
</script>

<template>
  <a
    class="pb-skip-link sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:inline-flex focus:h-11 focus:items-center focus:rounded-full focus:bg-berry focus:px-5 focus:text-sm focus:font-medium focus:text-white focus:shadow-glow"
    href="#main"
    >{{ $t("a11y.skipToContent") }}</a
  >
  <ScrollProgress />
  <Header />
  <!-- At least a viewport tall, so the footer never sits in the first paint
       while a lazily loaded view is still on its way (no layout shift). -->
  <main id="main" ref="main" tabindex="-1" class="relative min-h-dvh outline-none">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <Footer />
</template>

<style>
/*
 * Page transition: the new page wipes in from the bottom while rising
 * slightly; the old one fades out. Transform/opacity/clip-path only.
 */
.page-enter-active {
  transition:
    opacity 0.45s ease,
    transform 0.6s var(--ease-out-expo),
    clip-path 0.6s var(--ease-out-expo);
}
.page-leave-active {
  transition: opacity 0.18s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(18px);
  clip-path: inset(6% 0 0 0);
}
.page-leave-to {
  opacity: 0;
}
</style>
