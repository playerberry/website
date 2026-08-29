<script setup lang="ts">
/**
 * Site footer.
 *
 * Holds the wordmark and tagline, social links, grouped navigation and legal
 * links, plus a tongue-in-cheek "no ___ was harmed" line whose subject is a
 * random phrase (linked to a web search) picked fresh on each render.
 */
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import sentence from "../assets/js/random.ts";
import { feedPathFor } from "../assets/js/locales";
import { useLocalePath } from "../composables/useLocalePath";

const { locale } = useI18n();

/** A random absurd phrase for the playful footer disclaimer. */
const randomizedFunny = sentence();

/** Current year, shown in the copyright line. */
const year = new Date().getFullYear();

/** The RSS feed matching the active locale. */
const feedHref = computed(() => feedPathFor(locale.value));

/** Maps language-neutral paths to the active language's URL. */
const lp = useLocalePath();
</script>

<template>
  <footer class="relative mt-20 md:mt-28">
    <div class="divider-glow" aria-hidden="true"></div>
    <div class="container-pb py-16 md:py-20">
      <div class="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div class="max-w-sm">
          <div
            class="font-display text-2xl font-bold tracking-tight text-ink-strong"
          >
            player<span class="text-berry">berry</span
            ><span class="animate-blink text-berry" aria-hidden="true">_</span>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-muted">
            {{ $t("footer.tagline") }}
          </p>
          <h2 class="footer-heading mt-8">{{ $t("footer.follow") }}</h2>
          <div class="mt-4 flex flex-wrap gap-2.5">
            <a
              href="https://instagram.com/playerberry"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              class="social"
              ><Icon name="instagram"
            /></a>
            <a
              href="https://twitch.tv/playerberry"
              target="_blank"
              rel="noopener"
              aria-label="Twitch"
              class="social"
              ><Icon name="twitch"
            /></a>
            <a
              href="https://youtube.com/@playerberry"
              target="_blank"
              rel="noopener"
              aria-label="YouTube"
              class="social"
              ><Icon name="youtube"
            /></a>
            <a
              href="https://x.com/playerberry"
              target="_blank"
              rel="noopener"
              aria-label="X"
              class="social"
              ><Icon name="twitter"
            /></a>
            <a
              href="https://facebook.com/playerberry"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              class="social"
              ><Icon name="facebook"
            /></a>
          </div>
        </div>

        <div>
          <h2 class="footer-heading">{{ $t("footer.nav") }}</h2>
          <ul class="footer-links">
            <li>
              <RouterLink :to="lp('/')">{{ $t("menu.home") }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/projects')">{{
                $t("menu.projects")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/blog')">{{ $t("menu.blog") }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/store')">{{ $t("menu.store") }}</RouterLink>
            </li>
            <li>
              <a :href="feedHref" target="_blank" rel="alternate noopener"
                ><Icon name="rss" class="mr-1.5 text-[0.8em] text-amber" />{{
                  $t("footer.rss")
                }}</a
              >
            </li>
          </ul>
        </div>

        <div>
          <h2 class="footer-heading">{{ $t("footer.legal") }}</h2>
          <ul class="footer-links">
            <li>
              <RouterLink :to="lp('/privacy-policy')">{{
                $t("footer.privacy")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/cookies-policy')">{{
                $t("footer.cookies")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/terms-and-conditions')">{{
                $t("footer.terms")
              }}</RouterLink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="footer-heading">{{ $t("footer.contact") }}</h2>
          <ul class="footer-links">
            <li>
              <RouterLink :to="lp('/about-us')">{{
                $t("footer.about")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/contact')">{{
                $t("footer.contact")
              }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-14 flex flex-col gap-3 border-t border-line pt-8 text-xs text-muted md:flex-row md:items-center md:justify-between"
      >
        <p>
          {{ $t("footer.randomized.part0")
          }}<a
            :href="
              'https://www.google.com/search?q=' +
              encodeURIComponent(randomizedFunny)
            "
            target="_blank"
            rel="noopener"
            class="text-ink underline decoration-berry/50 decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-berry"
            ><span class="sentence">{{ randomizedFunny }}</span></a
          >{{ $t("footer.randomized.part1") }}
        </p>
        <p class="font-mono tracking-[0.06em] whitespace-nowrap">
          {{ $t("footer.rights") }} &copy; {{ year }} PlayerBerry
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-heading {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 1rem;
}
.footer-links a {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  font-size: 0.875rem;
  color: var(--color-ink);
  transition: color 0.2s ease;
}
.footer-links a:hover {
  color: var(--color-berry);
}
.social {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  color: var(--color-ink);
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    transform 0.4s var(--ease-out-expo);
}
.social:hover {
  border-color: color-mix(in oklab, var(--color-berry) 50%, transparent);
  color: var(--color-berry);
  transform: translateY(-2px);
}
</style>
