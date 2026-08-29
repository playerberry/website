<script setup lang="ts">
/**
 * NotFoundView
 *
 * The 404 page shown for unmatched routes (and reused by BlogPostView when a
 * slug does not resolve). Offers a gradient "404", a message and a link home.
 */
import { RouterLink } from "vue-router";
import { useLocalePath } from "../composables/useLocalePath";

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <section class="section relative flex min-h-[60vh] items-center">
    <div class="grid-bg absolute inset-0 -z-10" aria-hidden="true"></div>
    <div class="container-pb text-center">
      <h1
        class="gradient-text font-display text-[clamp(6rem,22vw,11rem)] leading-none font-bold tracking-tighter"
      >
        404
      </h1>
      <h2 class="section-title mt-2">{{ $t("notFound.title") }}</h2>
      <p class="lead mx-auto mt-4">{{ $t("notFound.description") }}</p>
      <RouterLink :to="lp('/')" class="btn btn-primary mt-10">
        <Icon name="arrow-left" />
        {{ $t("notFound.button") }}
      </RouterLink>
    </div>
  </section>
</template>
