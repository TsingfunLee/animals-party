<template>
  <div
    class="overflow-hidden"
    :style="backgroundStyle"
  >
    <div class="pattern flex w-full h-full gap-10">
      <polygon-base
        v-for="(shape, i) in polygons"
        :key="i"
        size="2rem"
        fill="solid"
        :shape="shape"
        color="#f9fff0"
        class="polygon"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {colors} from 'quasar'
import PolygonBase from './polygon-base.vue';
import { ShapeType } from './polygon.type';

interface Props {
  mainColor?: string;
}
const props = withDefaults(defineProps<Props>(), {
  mainColor: '#b3e6d0',
});

const {lighten, textToRgb, rgbToHsv, hsvToRgb, rgbToHex} = colors

const backgroundStyle = computed(() => {
  // 變亮
  const lightenColor = lighten(props.mainColor, 10);

  // 變暗並偏移色相
  const darkColor = lighten(props.mainColor, -10);

  const hsvColor = rgbToHsv(textToRgb(darkColor));
  hsvColor.h -= 20;

  const offsetColor = rgbToHex(hsvToRgb(hsvColor));

  return {
    background: `linear-gradient(-30deg, ${offsetColor}, ${props.mainColor}, ${lightenColor}, ${props.mainColor}, ${offsetColor})`
  }
});

// 多边形
const shapeTypes = Object.values(ShapeType);
const polygons: ShapeType[] = [];
for (let i = 0; i < 300; i++) {
  polygons.push(shapeTypes[i % shapeTypes.length]);
}
</script>

<style scoped lang="sass">
.pattern
  transform: rotate(-6deg) translate(2%, -5%)

.polygon
  animation: polygon 3s infinite

@keyframes polygon
  0%, 100%
    opacity: 0.2
  30%, 70%
    opacity: 0.4
</style>