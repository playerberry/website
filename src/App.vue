<script setup lang="ts">
/**
 * Root application shell.
 *
 * Provides the persistent chrome shared by every page — the scroll-progress
 * bar, the site header and footer — and renders the active route in between
 * via `<RouterView>`.
 */
import { RouterView } from "vue-router";
import ScrollProgress from "./components/ScrollProgress.vue";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <ScrollProgress />
  <Header />
  <main>
    <RouterView />
  </main>
  <Footer />
</template>
