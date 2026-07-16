<script setup lang="ts">
/**
 * Site header.
 *
 * A sticky, glassy navigation bar with the PlayerBerry wordmark, the primary
 * menu, a language dropdown (built from the supported-locale list, showing
 * each language's native name) and a contact call-to-action. On narrow
 * screens the menu collapses into a UIkit off-canvas drawer.
 */
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import UIkit from "uikit";
import { activateLocale } from "../i18n";
import {
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "../assets/js/locales";

const { locale } = useI18n();

/** Close the mobile off-canvas menu (used after a nav link is tapped). */
const closeMenu = () => UIkit.offcanvas("#sidenav").hide();

/**
 * Switch the active UI language (loading its catalogue on first use) and
 * persist the choice — a manual choice overrides the country-based
 * detection on later visits.
 *
 * @param value - The locale to activate.
 */
const setLocale = async (value: Locale) => {
  await activateLocale(value);
  localStorage.setItem("pb:locale", value);
};

/**
 * Handle a change on one of the language `<select>` elements.
 *
 * @param event - The change event whose target holds the chosen locale.
 */
const onLocaleChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  if (isSupportedLocale(value)) void setLocale(value);
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
              aria-label="Language"
              :value="locale"
              @change="onLocaleChange"
            >
              <option
                v-for="code in SUPPORTED_LOCALES"
                :key="code"
                :value="code"
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
          <a
            href="#"
            class="uk-navbar-toggle uk-hidden@m"
            uk-navbar-toggle-icon
            uk-toggle="target: #sidenav"
            aria-label="Menu"
          ></a>
        </div>
      </nav>
    </div>
  </header>
  <div id="sidenav" uk-offcanvas="flip: true; overlay: true">
    <div class="uk-offcanvas-bar">
      <button class="uk-offcanvas-close" type="button" uk-close></button>
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
          aria-label="Language"
          :value="locale"
          @change="onLocaleChange"
        >
          <option v-for="code in SUPPORTED_LOCALES" :key="code" :value="code">
            {{ LOCALE_NAMES[code] }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
