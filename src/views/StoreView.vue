<script setup lang="ts">
/**
 * StoreView (`/store`)
 *
 * Digital products (templates, component kits, starter kits, apps) laid out
 * as a bento: the first product — our own app — takes a double-height,
 * double-width tile with a large icon, an oversized outline initial and a
 * site address in place of a price; the rest fill the remaining cells, the
 * odd one out stretching to a wide horizontal tile so the grid always closes
 * cleanly. Products with a `url` link out to their own page; for the rest the
 * purchase button is intentionally inert for now (`aria-disabled`) with a
 * visible "coming soon" label beside it. A price of `0` renders no price —
 * the product's site address takes that spot.
 */
import { useI18n } from "vue-i18n";
import { products, type Product } from "../data/products";

const { t } = useI18n();

/** Zero-padded index for the mono product list ("01"). */
const pad = (n: number): string => String(n).padStart(2, "0");

/** Price in dollars (products priced `0` show their site instead). */
const price = (prod: Product): string => `$${prod.price}`;

/** Bare host of a product's external page (`neredesin.co`). */
const host = (prod: Product): string =>
  prod.url ? new URL(prod.url).host.replace(/^www\./, "") : "";

/**
 * Grid placement of the product at `i` in a six-column bento. The first
 * product is the hero tile (4 × 2); the next two stack beside it; the rest
 * run three per row, and when that leaves a remainder the trailing tiles
 * widen (one → full width, two → half each) so no row is left ragged.
 *
 * @param i - Index of the product in the catalogue.
 * @param n - Total number of products.
 */
const span = (i: number, n: number): string => {
  if (i === 0) return "md:col-span-4 md:row-span-2";
  const tail = n - 3;
  const pos = i - 3;
  if (pos >= 0 && tail % 3 === 1 && pos === tail - 1) return "md:col-span-6";
  if (pos >= 0 && tail % 3 === 2 && pos >= tail - 2) return "md:col-span-3";
  return "md:col-span-2";
};

/** Whether the tile at `i` is the full-width horizontal variant. */
const isWide = (i: number): boolean => span(i, products.length) === "md:col-span-6";
</script>

<template>
  <section class="section relative grid-lines overflow-hidden">
    <div class="container-pb relative">
      <!-- Opening spread: copy left, mono catalogue index right. -->
      <div class="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div v-reveal class="lg:col-span-8">
          <p class="section-head">
            <span class="index">01</span>
            <span>{{ t("store.eyebrow") }}</span>
          </p>
          <h1 class="display-lg mt-8">{{ t("store.title") }}</h1>
          <p class="lead mt-6">{{ t("store.lead") }}</p>
        </div>

        <ol
          v-reveal="140"
          class="hidden lg:col-span-4 lg:block lg:justify-self-end lg:text-right"
        >
          <li
            v-for="(prod, i) in products"
            :key="prod.id"
            class="border-t border-line first:border-t-0"
          >
            <a
              :href="`#product-${prod.id}`"
              class="group flex min-h-11 items-center justify-end gap-4 py-2 font-mono text-xs tracking-[0.1em] text-muted uppercase transition-colors duration-200 hover:text-ink-strong"
            >
              <span>{{ t(`store.items.${prod.id}.title`) }}</span>
              <span
                class="text-berry/70 transition-colors duration-200 group-hover:text-berry"
                >{{ pad(i + 1) }}</span
              >
            </a>
          </li>
        </ol>
      </div>

      <!-- Bento catalogue. -->
      <div
        class="mt-16 grid grid-cols-1 gap-5 md:grid-cols-6 md:auto-rows-[minmax(15rem,auto)]"
      >
        <div
          v-for="(prod, i) in products"
          :id="`product-${prod.id}`"
          :key="prod.id"
          v-reveal="Math.min(i, 5) * 70"
          class="grid scroll-mt-28"
          :class="span(i, products.length)"
        >
          <!-- Hero tile: our own app. -->
          <article
            v-if="i === 0"
            v-spotlight
            v-tilt="3"
            class="card relative flex h-full flex-col overflow-hidden p-8 sm:p-10 lg:p-12"
          >
            <span
              class="outline-text pointer-events-none absolute -right-6 -bottom-12 font-display text-[14rem] leading-none font-bold select-none sm:-right-8 sm:-bottom-16 sm:text-[20rem]"
              aria-hidden="true"
              >{{ t(`store.items.${prod.id}.title`).charAt(0) }}</span
            >
            <div class="relative flex items-start justify-between gap-4">
              <div class="icon-tile size-16 text-2xl sm:size-20 sm:text-3xl" :class="prod.tone">
                <Icon :name="prod.icon" />
              </div>
              <span
                v-if="prod.badge"
                class="badge"
                :class="{ 'is-new': prod.badge === 'new' }"
                >{{ t(`store.badges.${prod.badge}`) }}</span
              >
            </div>
            <div class="meta-row mt-10 normal-case">
              <span class="text-berry">{{ pad(i + 1) }}</span>
              <span>{{ t(`store.items.${prod.id}.category`) }}</span>
            </div>
            <h2 class="mt-3 font-display text-4xl font-semibold text-ink-strong sm:text-5xl">
              {{ t(`store.items.${prod.id}.title`) }}
            </h2>
            <p class="relative mt-5 max-w-lg text-lg">
              {{ t(`store.items.${prod.id}.description`) }}
            </p>
            <div
              class="relative mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-5 border-t border-line pt-8"
            >
              <span
                v-if="prod.price > 0"
                class="font-display text-4xl font-semibold text-ink-strong sm:text-5xl"
              >
                {{ price(prod) }}
              </span>
              <span
                v-else-if="prod.url"
                class="inline-flex items-center gap-2.5 font-mono text-sm tracking-[0.04em] text-muted"
              >
                <Icon name="globe" class="text-berry" />{{ host(prod) }}
              </span>
              <a
                v-if="prod.url"
                v-magnetic
                :href="prod.url"
                class="btn btn-primary"
                target="_blank"
                rel="noopener"
              >
                {{ t("store.get") }}
                <Icon name="arrow-up-right-from-square" />
              </a>
              <div v-else class="flex items-center gap-3">
                <span class="font-mono text-[0.68rem] tracking-[0.08em] text-muted uppercase">
                  {{ t("store.soon") }}
                </span>
                <button
                  class="btn btn-secondary"
                  type="button"
                  aria-disabled="true"
                  :title="t('store.soon')"
                >
                  {{ t("store.buy") }}
                </button>
              </div>
            </div>
          </article>

          <!-- Standard tile (and its wide, horizontal variant). -->
          <article
            v-else
            v-spotlight
            v-tilt="4"
            class="card flex h-full flex-col"
            :class="{ 'md:flex-row md:items-end md:gap-10': isWide(i) }"
          >
            <span
              v-if="prod.badge"
              class="badge absolute top-5 right-5 sm:top-6 sm:right-6"
              :class="{ 'is-new': prod.badge === 'new' }"
              >{{ t(`store.badges.${prod.badge}`) }}</span
            >
            <div :class="isWide(i) ? 'md:flex-1' : 'pb-6'">
              <div class="icon-tile" :class="prod.tone">
                <Icon :name="prod.icon" />
              </div>
              <div class="meta-row mt-6 normal-case">
                <span class="text-berry">{{ pad(i + 1) }}</span>
                <span>{{ t(`store.items.${prod.id}.category`) }}</span>
              </div>
              <h2 class="card-title mt-1.5 text-2xl">
                {{ t(`store.items.${prod.id}.title`) }}
              </h2>
              <p class="mt-2" :class="{ 'md:max-w-xl': isWide(i) }">
                {{ t(`store.items.${prod.id}.description`) }}
              </p>
            </div>
            <div
              class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-5"
              :class="
                isWide(i)
                  ? 'mt-6 md:mt-0 md:min-w-64 md:flex-col md:items-end md:border-t-0 md:pt-0'
                  : 'mt-auto'
              "
            >
              <span
                v-if="prod.price > 0"
                class="font-display text-3xl font-semibold text-ink-strong"
              >
                {{ price(prod) }}
              </span>
              <span
                v-else-if="prod.url"
                class="inline-flex items-center gap-2 font-mono text-xs tracking-[0.04em] text-muted"
              >
                <Icon name="globe" class="text-berry" />{{ host(prod) }}
              </span>
              <a
                v-if="prod.url"
                :href="prod.url"
                class="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener"
              >
                {{ t("store.get") }}
              </a>
              <div v-else class="flex items-center gap-3">
                <span class="font-mono text-[0.68rem] tracking-[0.08em] text-muted uppercase">
                  {{ t("store.soon") }}
                </span>
                <button
                  class="btn btn-secondary btn-sm"
                  type="button"
                  aria-disabled="true"
                  :title="t('store.soon')"
                >
                  {{ t("store.buy") }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
