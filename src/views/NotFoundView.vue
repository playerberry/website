<script setup lang="ts">
/**
 * NotFoundView
 *
 * The 404 page shown for unmatched routes (and reused by BlogPostView when a
 * slug does not resolve). Left-aligned on the site's structural grid: a mono
 * annotation quoting the requested path, a giant hollow "404" that fills in
 * on hover, the message and a link home.
 */
import { RouterLink, useRoute } from "vue-router";
import { useLocalePath } from "../composables/useLocalePath";

const route = useRoute();

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <section
    class="grid-lines section relative flex min-h-[70vh] items-center overflow-hidden"
  >
    <div class="container-pb relative">
      <p class="meta-row">
        <span class="text-berry" aria-hidden="true">//</span>
        <span class="break-all">{{ route.path }}</span>
      </p>
      <div
        class="outline-text display-xl mt-4 leading-none select-none"
        aria-hidden="true"
      >
        404
      </div>
      <h1 class="display-md mt-6 max-w-3xl">{{ $t("notFound.title") }}</h1>
      <p class="lead mt-5">{{ $t("notFound.description") }}</p>
      <RouterLink
        v-magnetic
        :to="lp('/')"
        class="btn btn-primary btn-lg is-back mt-10"
      >
        <Icon name="arrow-left" class="text-[0.8em]" />
        {{ $t("notFound.button") }}
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
/* The hollow numeral outgrows the display scale. */
.outline-text {
  font-size: clamp(7rem, 26vw, 18rem);
  -webkit-text-stroke-width: 2px;
}
/* A "back" arrow nudges left, not right. */
.is-back:hover .pb-icon {
  transform: translateX(-3px);
}
</style>
