<script setup lang="ts">
/**
 * ContactView (`/contact`)
 *
 * A focused contact card with the studio email and social links. No form —
 * the primary call to action is a `mailto:` link.
 */
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <section class="pb-section">
    <div class="uk-container uk-text-center">
      <div class="pb-section-head">
        <p class="pb-eyebrow">{{ t("contact.eyebrow") }}</p>
        <h1>{{ t("contact.title") }}</h1>
        <p class="pb-section-lead uk-margin-auto">{{ t("contact.lead") }}</p>
      </div>
      <div
        class="uk-card uk-card-default uk-card-hover uk-card-body uk-width-large uk-margin-auto"
        v-spotlight
      >
        <a class="pb-contact-email" href="mailto:hello@playerberry.com"
          >hello@playerberry.com</a
        >
        <p class="pb-muted uk-margin-small-top">{{ t("contact.note") }}</p>
        <div class="pb-social uk-flex-center">
          <a
            href="https://instagram.com/playerberry"
            target="_blank"
            aria-label="Instagram"
            ><i class="fa-brands fa-instagram"></i
          ></a>
          <a
            href="https://twitch.tv/playerberry"
            target="_blank"
            aria-label="Twitch"
            ><i class="fa-brands fa-twitch"></i
          ></a>
          <a
            href="https://youtube.com/@playerberry"
            target="_blank"
            aria-label="YouTube"
            ><i class="fa-brands fa-youtube"></i
          ></a>
          <a href="https://x.com/playerberry" target="_blank" aria-label="X"
            ><i class="fa-brands fa-twitter"></i
          ></a>
        </div>
      </div>
    </div>
  </section>
</template>
