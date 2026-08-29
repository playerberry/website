<script setup lang="ts">
/**
 * Site header.
 *
 * A sticky, glassy navigation bar with the PlayerBerry wordmark, the primary
 * menu, a language dropdown (built from the supported-locale list, showing
 * each language's native name) and a contact call-to-action. On narrow
 * screens the menu collapses into a UIkit off-canvas drawer.
 */
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import UIkit from "uikit";
import { LOCALE_QUERY_PARAM, activateLocale, saveLocaleChoice } from "../i18n";
import {
  DEFAULT_LOCALE,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "../assets/js/locales";

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

/** DOM id of the off-canvas drawer. */
const MENU_ID = "sidenav";

/** Whether the mobile off-canvas menu is open (mirrors UIkit's state). */
const menuOpen = ref(false);

/** Close the mobile off-canvas menu (used after a nav link is tapped). */
const closeMenu = () => UIkit.offcanvas(`#${MENU_ID}`).hide();

/** Keep `menuOpen` in step with UIkit's show/hide events for `aria-expanded`. */
const onMenuShow = () => (menuOpen.value = true);
const onMenuHide = () => (menuOpen.value = false);

onMounted(() => {
  const menu = document.getElementById(MENU_ID);
  menu?.addEventListener("show", onMenuShow);
  menu?.addEventListener("hide", onMenuHide);
});

onUnmounted(() => {
  const menu = document.getElementById(MENU_ID);
  menu?.removeEventListener("show", onMenuShow);
  menu?.removeEventListener("hide", onMenuHide);
});

/**
 * Language switches queue up so that, when the visitor changes the selection
 * several times before a catalogue has finished loading, they are applied in
 * the order chosen and the last choice wins.
 */
let switching: Promise<void> = Promise.resolve();

/**
 * Switch the active UI language (loading its catalogue on first use),
 * persist the choice — a manual choice overrides the country-based detection
 * on later visits — and mirror it into the URL's `?lang=` parameter so the
 * address bar matches the page's canonical, shareable language URL.
 *
 * A failed catalogue download leaves the current language in place and
 * resets the `<select>` to it, so the control never shows a language the
 * page is not actually in.
 *
 * @param value - The locale to activate.
 * @param select - The `<select>` that requested the change.
 */
const setLocale = (value: Locale, select: HTMLSelectElement): void => {
  switching = switching
    .then(async () => {
      await activateLocale(value);
      saveLocaleChoice(value);
      const query = { ...route.query };
      if (value === DEFAULT_LOCALE) delete query[LOCALE_QUERY_PARAM];
      else query[LOCALE_QUERY_PARAM] = value;
      await router.replace({ path: route.path, query, hash: route.hash });
    })
    .catch(() => {
      select.value = locale.value;
    });
};

/**
 * Handle a change on one of the language `<select>` elements.
 *
 * @param event - The change event whose target holds the chosen locale.
 */
const onLocaleChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  if (isSupportedLocale(select.value)) setLocale(select.value, select);
};
</script>

<template>
  <header class="pb-header">
    <div class="uk-container uk-container-large">
      <nav uk-navbar>
        <div class="uk-navbar-left">
          <RouterLink to="/" class="uk-navbar-item uk-logo pb-logo">
            player<span class="pb-logo-berry">berry</span
            ><span class="pb-logo-cursor">_</span>
          </RouterLink>
        </div>
        <div class="uk-navbar-right">
          <ul class="uk-navbar-nav uk-visible@m">
            <li>
              <RouterLink to="/projects">{{ $t("menu.projects") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/blog">{{ $t("menu.blog") }}</RouterLink>
            </li>
            <li>
              <RouterLink to="/store">{{ $t("menu.store") }}</RouterLink>
            </li>
          </ul>
          <div class="pb-lang uk-navbar-item uk-visible@m">
            <select
              class="pb-lang-select"
              :aria-label="$t('a11y.language')"
              :value="locale"
              @change="onLocaleChange"
            >
              <option
                v-for="code in SUPPORTED_LOCALES"
                :key="code"
                :value="code"
                :lang="code"
              >
                {{ LOCALE_NAMES[code] }}
              </option>
            </select>
          </div>
          <div class="uk-navbar-item uk-visible@m">
            <RouterLink
              to="/contact"
              class="uk-button uk-button-primary uk-button-small"
              >{{ $t("menu.contact") }}</RouterLink
            >
          </div>
          <button
            class="uk-navbar-toggle uk-hidden@m"
            type="button"
            uk-navbar-toggle-icon
            :uk-toggle="`target: #${MENU_ID}`"
            :aria-label="$t('a11y.menu')"
            :aria-controls="MENU_ID"
            :aria-expanded="menuOpen"
          ></button>
        </div>
      </nav>
    </div>
  </header>
  <div :id="MENU_ID" uk-offcanvas="flip: true; overlay: true">
    <div class="uk-offcanvas-bar">
      <button
        class="uk-offcanvas-close"
        type="button"
        uk-close
        :aria-label="$t('a11y.close')"
      ></button>
      <ul class="uk-nav uk-margin-large-top">
        <li>
          <RouterLink to="/" @click="closeMenu">{{
            $t("menu.home")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/projects" @click="closeMenu">{{
            $t("menu.projects")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/blog" @click="closeMenu">{{
            $t("menu.blog")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/store" @click="closeMenu">{{
            $t("menu.store")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink to="/contact" @click="closeMenu">{{
            $t("menu.contact")
          }}</RouterLink>
        </li>
      </ul>
      <div class="pb-lang pb-lang-mobile uk-margin-top">
        <select
          class="pb-lang-select"
          :aria-label="$t('a11y.language')"
          :value="locale"
          @change="onLocaleChange"
        >
          <option
            v-for="code in SUPPORTED_LOCALES"
            :key="code"
            :value="code"
            :lang="code"
          >
            {{ LOCALE_NAMES[code] }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
