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
  <section class="pb-section uk-text-center">
    <div class="uk-container">
      <h1 class="pb-404 super-text">404</h1>
      <h2>{{ $t("notFound.title") }}</h2>
      <p class="pb-muted">{{ $t("notFound.description") }}</p>
      <RouterLink :to="lp('/')" class="uk-button uk-button-primary uk-margin-top">{{
        $t("notFound.button")
      }}</RouterLink>
    </div>
  </section>
</template>
