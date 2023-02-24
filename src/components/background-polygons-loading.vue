<template>
  <div
    class="flex flex-center overflow-hidden"
    :style="backgroundStyle"
  >
    <div class="flex gap-16">
      <div
        v-for="(poly, i) in polygons"
        :key="poly.id"
        class="box"
      >
        <polygon-base
          class="jelly-bounce"
          size="7.4rem"
          :shape="poly.shape"
          fill="solid"
          :color="poly.color"
          opacity="0.1"
          :style="`animation-delay: ${i * 0.1}s`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { colors } from 'quasar';
import PolygonBase from './polygon-base.vue';
import {ShapeType} from './polygon.type';
const { lighten, textToRgb, rgbToHsv, hsvToRgb, rgbToHex } = colors;

const polygons = ref<{
  id: string;
  shape: `${ShapeType}`;
  color: string;
}[]>([
  {
    id: '1',
    shape: 'square',
    color: `#FA9500`,
  },
  {
    id: '2',
    shape: 'round',
    color: `#EB6424`,
  },
  {
    id: '3',
    shape: 'triangle',
    color: `#F07167`,
  },
]);

interface Props {
  mainColor?: string;
}
const props = withDefaults(defineProps<Props>(), {
  mainColor: '#c8e6b1',
});

const backgroundStyle = computed(() => {
  // 變亮
  const lightenColor = lighten(props.mainColor, 20);

  // 變暗並偏移色相
  const darkColor = lighten(props.mainColor, -14);

  const hsvColor = rgbToHsv(textToRgb(darkColor));
  hsvColor.h -= 15;

  const offsetColor = rgbToHex(hsvToRgb(hsvColor));

  return {
    background: `linear-gradient(-30deg, ${offsetColor}, ${props.mainColor}, ${lightenColor}, ${props.mainColor}, ${offsetColor})`
  }
});


</script>

<style scoped lang="sass">
.box
  mix-blend-mode: difference
.jelly-bounce 
  animation: jelly-bounce 1.4s infinite ease-in-out
  transform-origin: 50% 100%

@keyframes jump
  0%
    transform: translateY(-30%)
  45%
    transform: translateY(0%)
  100%
    transform: translateY(-30%)

@keyframes jelly-bounce
  0%
    transform: scale( 1 )
  30%
    transform: scale( 1 )
  50%
    transform: scale( 1.2, 0.8 )
  70%
    transform: scale( 0.85, 1.15 )
  80%
    transform: scale( 1.05, 0.95 )
  90%
    transform: scale( 0.98, 1.02 )
  100%
    transform: scale( 1 )
</style>