<script setup lang="ts">
/**
 * Site footer.
 *
 * Opens with a full-width, hollow `playerberry_` wordmark that fills in on
 * hover, followed by four columns — the studio tagline with the social
 * profiles, the site map, the legal pages and the contact links — each under
 * a numbered monospace heading. The closing hairline carries the copyright
 * and a tongue-in-cheek "no ___ was harmed" line whose subject is a random
 * phrase (linked to a web search) picked fresh on each render.
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

/** Social profiles rendered as round icon buttons. */
const socials = [
  { name: "Instagram", icon: "instagram", href: "https://instagram.com/playerberry" },
  { name: "Twitch", icon: "twitch", href: "https://twitch.tv/playerberry" },
  { name: "YouTube", icon: "youtube", href: "https://youtube.com/@playerberry" },
  { name: "X", icon: "twitter", href: "https://x.com/playerberry" },
  { name: "Facebook", icon: "facebook", href: "https://facebook.com/playerberry" },
];
</script>

<template>
  <footer class="relative mt-24 border-t border-line bg-surface md:mt-32">
    <!-- Giant hollow wordmark; sized from the container so it never wraps
         or overflows, and clipped as a last resort. -->
    <div class="overflow-hidden" aria-hidden="true">
      <div class="container-pb @container pt-14 md:pt-20">
        <div
          class="footer-mark outline-text display-xl leading-none whitespace-nowrap select-none"
        >
          playerberry_
        </div>
      </div>
    </div>

    <div class="container-pb pt-14 pb-8 md:pt-20">
      <div class="grid gap-12 md:grid-cols-12 md:gap-8">
        <div class="md:col-span-5 lg:col-span-4">
          <p class="max-w-sm text-base leading-relaxed text-muted">
            {{ $t("footer.tagline") }}
          </p>
          <h2 class="section-head mt-10">
            <span class="index">//</span>{{ $t("footer.follow") }}
          </h2>
          <ul class="mt-5 flex flex-wrap gap-2.5">
            <li v-for="social in socials" :key="social.icon">
              <a
                :href="social.href"
                target="_blank"
                rel="noopener"
                :aria-label="social.name"
                class="social grid size-11 place-items-center rounded-full border border-line text-ink"
                ><Icon :name="social.icon"
              /></a>
            </li>
          </ul>
        </div>

        <div
          class="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:col-span-7 md:col-start-6"
        >
          <div>
            <h2 class="section-head">
              <span class="index">01</span>{{ $t("footer.nav") }}
            </h2>
            <ul class="footer-links">
              <li>
                <RouterLink :to="lp('/')"
                  ><span class="link-line">{{ $t("menu.home") }}</span></RouterLink
                >
              </li>
              <li>
                <RouterLink :to="lp('/projects')"
                  ><span class="link-line">{{
                    $t("menu.projects")
                  }}</span></RouterLink
                >
              </li>
              <li>
                <RouterLink :to="lp('/blog')"
                  ><span class="link-line">{{ $t("menu.blog") }}</span></RouterLink
                >
              </li>
              <li>
                <RouterLink :to="lp('/store')"
                  ><span class="link-line">{{
                    $t("menu.store")
                  }}</span></RouterLink
                >
              </li>
              <li>
                <a :href="feedHref" target="_blank" rel="alternate noopener"
                  ><Icon name="rss" class="mr-2 text-[0.8em] text-amber" /><span
                    class="link-line"
                    >{{ $t("footer.rss") }}</span
                  ></a
                >
              </li>
            </ul>
          </div>

          <div>
            <h2 class="section-head">
              <span class="index">02</span>{{ $t("footer.legal") }}
            </h2>
            <ul class="footer-links">
              <li>
                <RouterLink :to="lp('/privacy-policy')"
                  ><span class="link-line">{{
                    $t("footer.privacy")
                  }}</span></RouterLink
                >
              </li>
              <li>
                <RouterLink :to="lp('/cookies-policy')"
                  ><span class="link-line">{{
                    $t("footer.cookies")
                  }}</span></RouterLink
                >
              </li>
              <li>
                <RouterLink :to="lp('/terms-and-conditions')"
                  ><span class="link-line">{{
                    $t("footer.terms")
                  }}</span></RouterLink
                >
              </li>
            </ul>
          </div>

          <div>
            <h2 class="section-head">
              <span class="index">03</span>{{ $t("footer.contact") }}
            </h2>
            <ul class="footer-links">
              <li>
                <RouterLink :to="lp('/about-us')"
                  ><span class="link-line">{{
                    $t("footer.about")
                  }}</span></RouterLink
                >
              </li>
              <li>
                <RouterLink :to="lp('/contact')"
                  ><span class="link-line">{{
                    $t("footer.contact")
                  }}</span></RouterLink
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="mt-16 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[0.72rem] tracking-[0.06em] text-muted md:flex-row md:items-center md:justify-between"
      >
        <p>&copy; {{ year }} PlayerBerry &mdash; {{ $t("footer.rights") }}</p>
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
      </div>
    </div>
  </footer>
</template>

<style scoped>
/*
 * The wordmark's size follows the container's inline size (`cqi`) so the
 * twelve glyphs always span the column: measured width ≈ 5.8× the font
 * size, hence ~16.8cqi fills 97% of the width. Capped for very wide screens.
 */
.footer-mark {
  font-size: clamp(3rem, 16.8cqi, 14rem);
}

.footer-links {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}
.footer-links a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  font-size: 0.9rem;
  color: var(--color-ink);
  transition: color 0.2s ease;
}
.footer-links a:hover {
  color: var(--color-ink-strong);
}
.footer-links .link-line {
  color: inherit;
  padding-bottom: 0.1em;
}
.footer-links a:hover .link-line {
  background-size: 100% 1px;
}

.social {
  transition:
    border-color 0.25s ease,
    color 0.25s ease,
    transform 0.4s var(--ease-out-expo);
}
.social:hover {
  border-color: color-mix(in oklab, var(--color-berry) 60%, transparent);
  color: var(--color-berry);
  transform: translateY(-2px);
}
</style>
