<script setup lang="ts">
/**
 * LinkView (`/link`)
 *
 * Thin layout wrapper for the `/link/<platform>` redirect shorteners. It only
 * hosts a `<RouterView>` inside a centred "redirecting…" interstitial (a
 * spinner plus the child view's message); each child route immediately
 * redirects to the matching external social profile (see the router
 * configuration).
 */
import { RouterView } from "vue-router";
</script>

<template>
  <section
    class="section flex min-h-[70vh] items-center"
    aria-live="polite"
    aria-busy="true"
  >
    <div class="container-pb flex flex-col items-center gap-8 text-center">
      <div class="relative size-16" aria-hidden="true">
        <div
          class="absolute inset-0 rounded-full border-2 border-line-strong"
        ></div>
        <div
          class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-berry border-r-violet"
        ></div>
      </div>
      <RouterView />
    </div>
  </section>
</template>
