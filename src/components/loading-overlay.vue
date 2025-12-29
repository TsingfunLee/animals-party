<template>
  <transition-mask
    v-model="isLoading"
    class="absolute inset-0"
    @update="handleUpdate"
  >
    <background-polygons-loading class="absolute inset-0" />
  </transition-mask>
</template>

<script setup lang="ts">
import { } from 'vue';
import { useLoading } from '../composables/use-loading';

import TransitionMask from './transition-mask.vue';
import BackgroundPolygonsLoading from './background-polygons-loading.vue';

const { isLoading, handleUpdate } = useLoading();
</script>