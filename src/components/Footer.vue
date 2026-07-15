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

const { locale } = useI18n();

/** A random absurd phrase for the playful footer disclaimer. */
const randomizedFunny = sentence();

/** Current year, shown in the copyright line. */
const year = new Date().getFullYear();

/** The RSS feed matching the active locale. */
const feedHref = computed(() => (locale.value === "en" ? "/rss-en.xml" : "/rss.xml"));
</script>

<template>
  <footer class="pb-footer">
    <div class="uk-container uk-container-large">
      <div class="uk-grid uk-grid-large" uk-grid>
        <div class="uk-width-1-1 uk-width-2-5@m">
          <div class="pb-logo">
            player<span class="pb-logo-berry">berry</span
            ><span class="pb-logo-cursor">_</span>
          </div>
          <p class="pb-footer-tagline">{{ $t("footer.tagline") }}</p>
          <div class="pb-social">
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
            <a
              href="https://facebook.com/playerberry"
              target="_blank"
              aria-label="Facebook"
              ><i class="fa-brands fa-facebook"></i
            ></a>
          </div>
        </div>
        <div class="uk-width-1-1 uk-width-1-3@s uk-width-1-5@m">
          <h4 class="pb-footer-heading">{{ $t("footer.nav") }}</h4>
          <ul class="pb-footer-links">
            <li>
              <RouterLink to="/">{{ $t("menu.home") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/projects">{{ $t("menu.projects") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/blog">{{ $t("menu.blog") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/store">{{ $t("menu.store") }}</RouterLink>
            </li>
            <li>
              <a :href="feedHref" target="_blank" rel="alternate">{{
                $t("footer.rss")
              }}</a>
            </li>
          </ul>
        </div>
        <div class="uk-width-1-1 uk-width-1-3@s uk-width-1-5@m">
          <h4 class="pb-footer-heading">{{ $t("footer.legal") }}</h4>
          <ul class="pb-footer-links">
            <li>
              <RouterLink to="/privacy-policy">{{
                $t("footer.privacy")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/cookies-policy">{{
                $t("footer.cookies")
              }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/terms-and-conditions">{{
                $t("footer.terms")
              }}</RouterLink>
            </li>
          </ul>
        </div>
        <div class="uk-width-1-1 uk-width-1-3@s uk-width-1-5@m">
          <h4 class="pb-footer-heading">{{ $t("footer.contact") }}</h4>
          <ul class="pb-footer-links">
            <li>
              <RouterLink to="/about-us">{{ $t("footer.about") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/contact">{{ $t("footer.contact") }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
      <div class="pb-footer-bottom">
        <p>
          {{ $t("footer.randomized.part0")
          }}<a
            :href="'https://www.google.com/search?q=' + randomizedFunny"
            target="_blank"
            ><span class="sentence">{{ randomizedFunny }}</span></a
          >{{ $t("footer.randomized.part1") }}
        </p>
        <p>{{ $t("footer.rights") }} &copy; {{ year }} PlayerBerry</p>
      </div>
    </div>
  </footer>
</template>
