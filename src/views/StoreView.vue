<script setup lang="ts">
/**
 * StoreView (`/store`)
 *
 * Grid of digital products (templates, component kits, starter kits, apps).
 * Products with a `url` link out to their own page; for the rest the purchase
 * button is intentionally inert for now and shows a "coming soon" tooltip.
 * A price of `0` is shown as the localised "free" label.
 */
import { useI18n } from "vue-i18n";
import { products } from "../data/products";

const { t } = useI18n();
</script>

<template>
  <section class="pb-section">
    <div class="uk-container uk-container-large">
      <div class="pb-section-head">
        <p class="pb-eyebrow">{{ t("store.eyebrow") }}</p>
        <h1>{{ t("store.title") }}</h1>
        <p class="pb-section-lead">{{ t("store.lead") }}</p>
      </div>
      <div
        class="uk-grid uk-grid-match uk-child-width-1-2@s uk-child-width-1-3@m"
        uk-grid
      >
        <div v-for="prod in products" :key="prod.id">
          <div
            v-spotlight
            class="uk-card uk-card-default uk-card-hover uk-card-body pb-product-card"
          >
            <span
              v-if="prod.badge"
              class="pb-badge"
              :class="{ 'is-new': prod.badge === 'new' }"
              >{{ t(`store.badges.${prod.badge}`) }}</span
            >
            <div class="pb-icon-tile" :class="prod.tone">
              <Icon :name="prod.icon" />
            </div>
            <div class="pb-project-meta">
              <span>{{ t(`store.items.${prod.id}.category`) }}</span>
            </div>
            <h3 class="uk-card-title">
              {{ t(`store.items.${prod.id}.title`) }}
            </h3>
            <p>{{ t(`store.items.${prod.id}.description`) }}</p>
            <div class="pb-price-row">
              <span class="pb-price">{{
                prod.price > 0 ? `$${prod.price}` : t("store.free")
              }}</span>
              <a
                v-if="prod.url"
                :href="prod.url"
                class="uk-button uk-button-primary uk-button-small"
                target="_blank"
                rel="noopener"
              >
                {{ t("store.get") }}
              </a>
              <button
                v-else
                class="uk-button uk-button-primary uk-button-small"
                type="button"
                :uk-tooltip="`title: ${t('store.soon')}`"
              >
                {{ t("store.buy") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
