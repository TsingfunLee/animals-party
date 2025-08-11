<template>
  <canvas
    ref="canvas"
    class="w-full h-full outline-none"
  />
</template>

<script setup lang="ts">
import {ref} from 'vue';

import {useLoading} from '../../composables/use-loading';

const loading = useLoading();

const canvas = ref<HTMLCanvasElement>();

function init() {
  loading.hide();
}

init()
</script>