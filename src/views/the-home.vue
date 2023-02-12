<template>
  <background-polygons-floating class="absolute inset-0">
    <polygon-base
      class="bg-polygon-lt"
      size="50rem"
      fill="fence"
      shape="square"
      rotate="30deg"
      opacity="0.1"
      color="#e09c48"
    />

    <polygon-base
      class="bg-polygon-rb"
      size="80rem"
      fill="spot"
      shape="round"
      rotate="30deg"
      opacity="0.1"
      color="#f0a53c"
    />
  </background-polygons-floating>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import backgroundPolygonsFloating from '_c/background-polygons-floating.vue';
import polygonBase from '_c/polygon-base.vue';

interface Props {
  label?: string;
}
const props = withDefaults(defineProps<Props>(), {
  label: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<style scoped lang="sass">
.bg-polygon-lt
  position: absolute
  left: -25rem
  top: -25rem
  animation: polygon-swing 40s infinite ease-in-out
.bg-polygon-rb
  position: absolute
  right: -25rem
  bottom: -50rem
  transform: translate(30%, 30%)
  animation: polygon-swing 28s infinite ease-in-out

@keyframes polygon-swing
  0%, 100%
    transform: rotate(0deg)
  50%
    transform: rotate(20deg)
</style>
