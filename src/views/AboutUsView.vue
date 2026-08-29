<script setup lang="ts">
/**
 * AboutUsView (`/about-us`)
 *
 * The studio story: intro, a short multi-paragraph narrative, the values grid,
 * the shared statistic tiles and a closing call-to-action framed by a
 * brand-gradient border. All copy is localised under the `about.*` (and
 * reused `hero.stats.*`) i18n keys.
 */
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "../composables/useLocalePath";

const { t, locale, getLocaleMessage } = useI18n();

/**
 * The narrative body as an array of paragraph strings, read raw from the
 * locale messages (bypassing the message compiler, same as blog content) so
 * future edits may freely contain `{`, `}` or `|`.
 */
const story = computed<string[]>(() => {
  const read = (loc: string): string[] | undefined =>
    (getLocaleMessage(loc) as { about?: { story?: string[] } })?.about?.story;
  return read(locale.value) ?? read("en") ?? [];
});

/** Value cards; `key` resolves localised copy, `icon`/`tone` style the tile. */
const values = [
  { key: "craft", icon: "gem", tone: "" },
  { key: "clarity", icon: "eye", tone: "is-violet" },
  { key: "partnership", icon: "handshake", tone: "is-blue" },
  { key: "longevity", icon: "seedling", tone: "is-cyan" },
];

/** i18n key suffixes for the reused statistic tiles (`hero.stats.*`). */
const stats = ["years", "projects", "clients", "uptime"];

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <section class="section">
    <div class="container-pb">
      <div v-reveal>
        <p class="eyebrow">{{ t("about.eyebrow") }}</p>
        <h1 class="section-title mt-3">{{ t("about.title") }}</h1>
        <p class="lead mt-4">{{ t("about.lead") }}</p>
      </div>

      <div
        v-reveal="120"
        class="mt-12 max-w-3xl space-y-5 text-lg leading-relaxed text-ink/90"
      >
        <p v-for="(para, i) in story" :key="i" class="first:text-xl">
          {{ para }}
        </p>
      </div>

      <div class="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(value, i) in values"
          :key="value.key"
          v-reveal="i * 90"
          class="grid"
        >
          <article v-spotlight class="card h-full">
            <div class="icon-tile" :class="value.tone">
              <Icon :name="value.icon" />
            </div>
            <h2 class="card-title mt-5">
              {{ t(`about.values.${value.key}.title`) }}
            </h2>
            <p class="mt-2">{{ t(`about.values.${value.key}.description`) }}</p>
          </article>
        </div>
      </div>

      <div v-reveal class="mt-20">
        <div class="divider-glow" aria-hidden="true"></div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-4">
          <div v-for="stat in stats" :key="stat" class="text-center">
            <div class="gradient-text font-display text-4xl font-semibold">
              {{ t(`hero.stats.${stat}.value`) }}
            </div>
            <div
              class="mt-2 font-mono text-xs tracking-[0.08em] text-muted uppercase"
            >
              {{ t(`hero.stats.${stat}.label`) }}
            </div>
          </div>
        </div>
        <div class="divider-glow" aria-hidden="true"></div>
      </div>

      <div
        v-reveal
        class="mt-20 rounded-card bg-gradient-to-r from-berry via-violet to-cyan p-px shadow-glow"
      >
        <div
          class="rounded-[calc(var(--radius-card)-1px)] bg-bg px-6 py-12 text-center sm:py-16"
        >
          <h2 class="text-2xl sm:text-3xl md:text-4xl">
            {{ t("about.cta.title") }}
          </h2>
          <p class="lead mx-auto mt-4">{{ t("about.cta.description") }}</p>
          <RouterLink
            :to="lp('/contact')"
            class="btn btn-primary btn-lg mt-8"
            >{{ t("about.cta.button") }}</RouterLink
          >
        </div>
      </div>
    </div>
  </section>
</template>
