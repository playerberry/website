<script setup lang="ts">
/**
 * TwitterView (`/link/twitter`, alias `/link/x`)
 *
 * Interstitial shown for a split second while the route guard redirects the
 * visitor to the PlayerBerry X/Twitter profile. See the router's `socialLinks` map.
 */
</script>

<template>
  <h1
    class="font-display text-2xl font-semibold tracking-tight text-balance text-ink-strong sm:text-3xl md:text-4xl"
  >
    {{ $t("redirect.twitter") }}
  </h1>
</template>
