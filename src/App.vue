<template>
  <div class="flex">
    <q-btn
      icon="home"
      class="w-40"
    >
      安安 {{ store.data }}
    </q-btn>
  </div>
  <router-view />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMainStore } from './stores/main.store';

const store = useMainStore();

document.title += ` v${import.meta.env.PACKAGE_VERSION}`
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
