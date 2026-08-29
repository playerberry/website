<script setup lang="ts">
/**
 * Root application shell.
 *
 * Provides the persistent chrome shared by every page — a keyboard-only
 * "skip to content" link, the scroll-progress bar, the site header and footer
 * — and renders the active route in between via `<RouterView>`.
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
  <a class="pb-skip-link" href="#main">{{ $t("a11y.skipToContent") }}</a>
  <ScrollProgress />
  <Header />
  <main id="main" ref="main" tabindex="-1">
    <RouterView />
  </main>
  <Footer />
</template>
