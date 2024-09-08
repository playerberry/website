<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <nav class="uk-navbar-container uk-margin-small-top">
    <div class="uk-container">
      <div uk-navbar>
        <div class="uk-navbar-left">
          <RouterLink to="/" class="uk-navbar-item uk-logo"
            >PlayerBerry</RouterLink
          >
        </div>
        <div class="uk-navbar-right">
          <ul class="uk-navbar-nav">
            <li>
              <RouterLink to="/">Hakkımızda</RouterLink>
            </li>
            <li>
              <RouterLink to="/">Projeler</RouterLink>
            </li>
            <li>
              <RouterLink to="/">Blog</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>
