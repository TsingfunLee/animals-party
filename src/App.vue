<template>
  <router-view />
  <loading-overlay />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import LoadingOverlay from './components/loading-overlay.vue';


document.title += ` v${import.meta.env.PACKAGE_VERSION}`;
</script>

<style lang="sass">
html, body, #app
  width: 100%
  height: 100%
  padding: 0
  margin: 0

#app
  display: flex
  flex-direction: column
</style>
