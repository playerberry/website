<script setup lang="ts">
/**
 * AboutUsView (`/about-us`)
 *
 * The studio story told editorially: an opening spread, the narrative set as
 * a large-type manifesto, the four values as indexed hairline rows (not
 * cards), the shared statistic strip counting up on scroll, and a full-bleed
 * gradient band with the closing call to action. All copy is localised under
 * the `about.*` (and reused `hero.stats.*`) i18n keys.
 */
import { computed, ref, type ComponentPublicInstance, type Ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "../composables/useLocalePath";
import { useCountUp } from "../composables/useCountUp";

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

/** Value rows; `key` resolves localised copy, `icon`/`tone` style the tile. */
const values = [
  { key: "craft", icon: "gem", tone: "" },
  { key: "clarity", icon: "eye", tone: "is-violet" },
  { key: "partnership", icon: "handshake", tone: "is-blue" },
  { key: "longevity", icon: "seedling", tone: "is-cyan" },
];

/** One cell of the statistic strip: its element and the counting text. */
interface StatCell {
  /** i18n key suffix under `hero.stats.*`. */
  key: string;
  /** The rendered cell, observed for visibility by the count-up. */
  el: Ref<HTMLElement | null>;
  /** The animated value text. */
  text: Ref<string>;
}

/** The reused statistic tiles (`hero.stats.*`), each with its own counter. */
const stats: StatCell[] = ["years", "projects", "clients", "uptime"].map(
  (key) => {
    const el = ref<HTMLElement | null>(null);
    const value = computed(() => t(`hero.stats.${key}.value`));
    return { key, el, text: useCountUp(value, el) };
  },
);

/**
 * Template ref callback: stores a statistic cell's element for its counter.
 *
 * @param cell - The statistic the element belongs to.
 * @param node - The rendered element (or `null` on unmount).
 */
const bindStat = (
  cell: StatCell,
  node: Element | ComponentPublicInstance | null,
): void => {
  cell.el.value = node as HTMLElement | null;
};

/** Zero-padded index for the mono row markers ("01"). */
const pad = (n: number): string => String(n).padStart(2, "0");

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <div>
    <section class="section relative grid-lines overflow-hidden pb-0 md:pb-0">
      <div class="container-pb relative">
        <!-- Opening spread: copy left, a vertical rail on the right. -->
        <div class="grid gap-10 lg:grid-cols-12">
          <div v-reveal class="lg:col-span-8">
            <p class="section-head">
              <span class="index">01</span>
              <span>{{ t("about.eyebrow") }}</span>
            </p>
            <h1 class="display-lg mt-8">{{ t("about.title") }}</h1>
            <p class="lead mt-6">{{ t("about.lead") }}</p>
          </div>
          <div
            class="hidden lg:col-span-4 lg:flex lg:justify-end"
            aria-hidden="true"
          >
            <p class="rail border-l border-line pt-5 pl-5">
              // est. 2018 &nbsp;·&nbsp; playerberry_
            </p>
          </div>
        </div>

        <!-- Manifesto: the story set in large display type. -->
        <div class="mt-24 max-w-4xl space-y-10 md:mt-32 md:space-y-14">
          <div
            v-for="(para, i) in story"
            :key="i"
            v-reveal="i * 120"
            class="grid gap-3 md:grid-cols-[6rem_1fr]"
          >
            <span class="num pt-2 text-muted" aria-hidden="true">{{
              pad(i + 1)
            }}</span>
            <p
              class="font-display text-2xl leading-[1.25] font-medium tracking-tight text-ink-strong/90 sm:text-3xl md:text-4xl"
            >
              {{ para }}
            </p>
          </div>
        </div>

        <!-- Values as indexed hairline rows. -->
        <div class="mt-24 md:mt-36">
          <p v-reveal class="section-head">
            <span class="index">02</span>
            <span>{{ t("about.eyebrow") }}</span>
          </p>
          <div class="mt-10">
            <div
              v-for="(value, i) in values"
              :key="value.key"
              v-reveal="i * 90"
              class="group grid gap-4 border-t border-line py-8 last:border-b md:grid-cols-[6rem_1fr_2fr] md:gap-8 md:py-10"
            >
              <span
                class="num pt-1 text-muted transition-colors duration-300 group-hover:text-berry"
                aria-hidden="true"
                >{{ pad(i + 1) }}</span
              >
              <div class="flex items-center gap-4">
                <div class="icon-tile shrink-0" :class="value.tone">
                  <Icon :name="value.icon" />
                </div>
                <h2 class="font-display text-2xl font-semibold md:text-3xl">
                  {{ t(`about.values.${value.key}.title`) }}
                </h2>
              </div>
              <p class="max-w-xl leading-relaxed text-muted md:pt-2.5">
                {{ t(`about.values.${value.key}.description`) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Statistic strip: hairlines above and below, counting up on scroll. -->
        <div
          v-reveal
          class="mt-24 grid grid-cols-2 border-y border-line md:mt-36 md:grid-cols-4"
        >
          <div
            v-for="(stat, i) in stats"
            :key="stat.key"
            :ref="(node) => bindStat(stat, node)"
            class="border-line px-5 py-10 md:px-8 md:py-14"
            :class="{
              'border-r': i % 2 === 0,
              'md:border-r': i < stats.length - 1,
              'md:border-r-0': i === stats.length - 1,
              'border-t md:border-t-0': i >= 2,
            }"
          >
            <div
              class="font-display text-4xl font-semibold tracking-tight text-ink-strong tabular-nums md:text-5xl"
            >
              {{ stat.text.value }}
            </div>
            <div
              class="mt-3 font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase"
            >
              {{ t(`hero.stats.${stat.key}.label`) }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing call to action on a full-bleed gradient band. -->
    <section class="band mt-24 md:mt-36">
      <div
        class="outline-text pointer-events-none absolute -right-8 -bottom-16 font-display text-[clamp(10rem,30vw,26rem)] leading-none font-bold whitespace-nowrap select-none [-webkit-text-stroke-color:rgba(255,255,255,0.35)] animate-float-slow"
        aria-hidden="true"
      >
        PB
      </div>
      <div class="container-pb relative py-24 md:py-36">
        <div v-reveal class="max-w-3xl">
          <p
            class="flex items-center gap-4 font-mono text-xs tracking-[0.18em] text-white/70 uppercase"
          >
            <span class="text-white">03</span>
            <span>{{ t("about.eyebrow") }}</span>
          </p>
          <h2 class="display-lg mt-6 text-white">{{ t("about.cta.title") }}</h2>
          <p class="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            {{ t("about.cta.description") }}
          </p>
          <RouterLink
            v-magnetic
            :to="lp('/contact')"
            class="btn btn-lg mt-10 bg-white text-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] hover:bg-[#e8e8ed]"
          >
            {{ t("about.cta.button") }}
            <Icon name="arrow-right" />
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
