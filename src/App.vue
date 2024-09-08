<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div class="uk-container uk-container-large">
    <Header />
    <RouterView />
    <Footer />
  </div>
</template>
