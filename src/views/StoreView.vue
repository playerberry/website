<script setup lang="ts">
/**
 * StoreView (`/store`)
 *
 * Grid of digital products (templates, component kits, starter kits, apps).
 * Products with a `url` link out to their own page; for the rest the purchase
 * button is intentionally inert for now (`aria-disabled`) and a visible
 * "coming soon" label sits beside it. A price of `0` is shown as the
 * localised "free" label.
 */
import { useI18n } from "vue-i18n";
import { products } from "../data/products";

const { t } = useI18n();
</script>

<template>
  <section class="section">
    <div class="container-pb">
      <div v-reveal>
        <p class="eyebrow">{{ t("store.eyebrow") }}</p>
        <h1 class="section-title mt-3">{{ t("store.title") }}</h1>
        <p class="lead mt-4">{{ t("store.lead") }}</p>
      </div>

      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(prod, i) in products"
          :key="prod.id"
          v-reveal="i * 80"
          class="grid"
        >
          <article v-spotlight class="card flex h-full flex-col">
            <span
              v-if="prod.badge"
              class="badge absolute top-5 right-5 sm:top-6 sm:right-6"
              :class="{ 'is-new': prod.badge === 'new' }"
              >{{ t(`store.badges.${prod.badge}`) }}</span
            >
            <div class="icon-tile" :class="prod.tone">
              <Icon :name="prod.icon" />
            </div>
            <div class="meta-row mt-5 normal-case">
              <span>{{ t(`store.items.${prod.id}.category`) }}</span>
            </div>
            <h2 class="card-title mt-1.5">
              {{ t(`store.items.${prod.id}.title`) }}
            </h2>
            <p class="mt-2 flex-1">
              {{ t(`store.items.${prod.id}.description`) }}
            </p>
            <div
              class="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-5"
            >
              <span class="font-display text-2xl font-semibold text-ink-strong">
                {{ prod.price > 0 ? `$${prod.price}` : t("store.free") }}
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
                <span class="font-mono text-[0.68rem] tracking-[0.08em] text-muted">
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
