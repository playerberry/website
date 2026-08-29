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
import { saveLocaleChoice } from "../i18n";
import {
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "../assets/js/locales";
import { localePath, stripLocale } from "../assets/js/seo";
import { useLocalePath } from "../composables/useLocalePath";

const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const lp = useLocalePath();

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
 * Switch the UI language by navigating to the current page's URL in that
 * language (`/tr/projects`): the router's locale guard loads the catalogue
 * and activates it, and the address bar ends up on the page's canonical,
 * shareable URL. The choice is persisted so it overrides the country-based
 * detection on later visits. The router serialises navigations, so rapid
 * successive changes settle on the last one.
 *
 * If the catalogue cannot be fetched the guard keeps the current language;
 * the `<select>` is then reset to it so the control never shows a language
 * the page is not actually in.
 *
 * @param value - The locale to activate.
 * @param select - The `<select>` that requested the change.
 */
const setLocale = async (
  value: Locale,
  select: HTMLSelectElement,
): Promise<void> => {
  saveLocaleChoice(value);
  await router.replace({
    path: localePath(stripLocale(route.path), value),
    query: route.query,
    hash: route.hash,
  });
  select.value = locale.value;
};

/**
 * Handle a change on one of the language `<select>` elements.
 *
 * @param event - The change event whose target holds the chosen locale.
 */
const onLocaleChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  if (isSupportedLocale(select.value)) void setLocale(select.value, select);
};
</script>

<template>
  <header class="pb-header">
    <div class="uk-container uk-container-large">
      <nav uk-navbar>
        <div class="uk-navbar-left">
          <RouterLink :to="lp('/')" class="uk-navbar-item uk-logo pb-logo">
            player<span class="pb-logo-berry">berry</span
            ><span class="pb-logo-cursor">_</span>
          </RouterLink>
        </div>
        <div class="uk-navbar-right">
          <ul class="uk-navbar-nav uk-visible@m">
            <li>
              <RouterLink :to="lp('/projects')">{{ $t("menu.projects") }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/blog')">{{ $t("menu.blog") }}</RouterLink>
            </li>
            <li>
              <RouterLink :to="lp('/store')">{{ $t("menu.store") }}</RouterLink>
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
              :to="lp('/contact')"
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
          <RouterLink :to="lp('/')" @click="closeMenu">{{
            $t("menu.home")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink :to="lp('/projects')" @click="closeMenu">{{
            $t("menu.projects")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink :to="lp('/blog')" @click="closeMenu">{{
            $t("menu.blog")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink :to="lp('/store')" @click="closeMenu">{{
            $t("menu.store")
          }}</RouterLink>
        </li>
        <li>
          <RouterLink :to="lp('/contact')" @click="closeMenu">{{
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
