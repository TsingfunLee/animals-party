<template>
  <div class="flex">
    我是 game-console
  </div>
</template>

<script setup lang="ts">
import { useLoading } from '../composables/use-loading';

const loading = useLoading();
loading.hide();
</script>

<style scoped lang="sass">
</style>