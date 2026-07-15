<script setup lang="ts">
/**
 * LinkView (`/link`)
 *
 * Thin layout wrapper for the `/link/<platform>` redirect shorteners. It only
 * hosts a `<RouterView>`; each child route immediately redirects to the
 * matching external social profile (see the router configuration).
 */
import { RouterView } from "vue-router";
</script>

<template>
  <section class="pb-redirect">
    <RouterView />
  </section>
</template>
