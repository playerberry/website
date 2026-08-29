<script setup lang="ts">
/**
 * AboutUsView (`/about-us`)
 *
 * The studio story: intro, a short multi-paragraph narrative, the values grid,
 * the shared statistic tiles and a closing call-to-action. All copy is
 * localised under the `about.*` (and reused `hero.stats.*`) i18n keys.
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
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head">
        <p class="pb-eyebrow">{{ t("about.eyebrow") }}</p>
        <h1>{{ t("about.title") }}</h1>
        <p class="pb-section-lead">{{ t("about.lead") }}</p>
      </div>

      <div class="pb-post-body uk-margin-medium-bottom">
        <p v-for="(para, i) in story" :key="i">{{ para }}</p>
      </div>

      <div
        class="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-4@m"
        uk-grid
        uk-scrollspy="cls: uk-animation-slide-bottom-small; target: > div; delay: 100"
      >
        <div v-for="value in values" :key="value.key">
          <div v-spotlight class="uk-card uk-card-default uk-card-hover uk-card-body">
            <div class="pb-icon-tile" :class="value.tone">
              <Icon :name="value.icon" />
            </div>
            <h3 class="uk-card-title">
              {{ t(`about.values.${value.key}.title`) }}
            </h3>
            <p>{{ t(`about.values.${value.key}.description`) }}</p>
          </div>
        </div>
      </div>

      <div class="pb-hero-stats uk-margin-large-top">
        <div v-for="stat in stats" :key="stat" class="pb-stat">
          <div class="pb-stat-value">{{ t(`hero.stats.${stat}.value`) }}</div>
          <div class="pb-stat-label">{{ t(`hero.stats.${stat}.label`) }}</div>
        </div>
      </div>

      <div class="pb-cta uk-margin-large-top">
        <h2>{{ t("about.cta.title") }}</h2>
        <p>{{ t("about.cta.description") }}</p>
        <RouterLink
          :to="lp('/contact')"
          class="uk-button uk-button-primary uk-button-large"
          >{{ t("about.cta.button") }}</RouterLink
        >
      </div>
    </div>
  </section>
</template>
