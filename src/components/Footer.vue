<script setup lang="ts">
import sentences from "../assets/js/random.ts";
const sentence = sentences[Math.round((sentences.length - 1) * Math.random())];
</script>

<template>
  <p>
    bu sitenin yapımında hiçbir
    <span class="sentence">{{ sentence }}</span> zarar görmemiştir.
  </p>
</template>
