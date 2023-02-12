<template>
  <div
    class="overflow-hidden"
    :style="backgroundStyle"
  >
    <slot />

    <polygon-base
      v-for="[key, polygon] in polygonsMap"
      :key="key"
      class="absolute polygon-move"
      :style="`left: ${polygon.left}; top: ${polygon.top}; animation-duration: ${polygon.animationDuration}`"
      :color="polygon.color"
      :rotate="polygon.rotate"
      :shape="polygon.shape"
      :fill="polygon.fill"
      :size="polygon.size"
      :opacity="polygon.opacity"
      @animationend="removePolygon(key)"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import {colors} from 'quasar'
import PolygonBase from './polygon-base.vue';
import {ShapeType, FillType} from './polygon.type'
import { random, sample ,cloneDeep} from 'lodash-es';
import { nanoid } from 'nanoid';
import { promiseTimeout } from '@vueuse/core';

interface Props {
  mainColor?: string;
  /** 初始數量，畫面出現時，內部初始方塊數量 */
  initialQuantity?: number;
  /** 色塊最大數量，超過此數量時，會暫停產生方塊 */
  maxQuantity?: number;
  /** 產生間距，越短生成速度越快，單位 ms */
  generateInterval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  mainColor: '#ffce5c',
  initialQuantity: 10,
  maxQuantity: 30,
  generateInterval: 500,
})

const {lighten, textToRgb, rgbToHsv, hsvToRgb, rgbToHex} = colors

const backgroundStyle = computed(()=>{
  // 变亮
  const lightenColor = lighten(props.mainColor, 10)

  // 变暗并偏移色相
  const darkenColor = lighten(props.mainColor,-10)

  const hsvColor = rgbToHsv(textToRgb(darkenColor))
  hsvColor.h -= 10

  const offsetColor = rgbToHex(hsvToRgb(hsvColor))

  return {
    background: `linear-gradient(-30deg, ${offsetColor}, ${props.mainColor}, ${lightenColor}, ${props.mainColor}, ${offsetColor})`
  }
})

interface PolygonParams {
  left: string;
  top: string;
  size: string;
  rotate: string;
  opacity: string | number;
  shape: `${ShapeType}`;
  fill: `${FillType}`;
  color: string;
  animationDuration: string;
}

function createPolygonParams() {
  // 變暗、偏移色相、提升飽和度，作為 polygon 候選顏色
  const darkColor = lighten(props.mainColor, -10);
  const hsvColor = rgbToHsv(textToRgb(darkColor));
  hsvColor.s += 20;

  const hsvColor01 = cloneDeep(hsvColor);
  hsvColor01.h -= 10;

  const hsvColor02 = cloneDeep(hsvColor);
  hsvColor02.h += 10;

  const colors = [
    rgbToHex(hsvToRgb(hsvColor)),
    rgbToHex(hsvToRgb(hsvColor01)),
    rgbToHex(hsvToRgb(hsvColor02))
  ];

  const params: PolygonParams = {
    left: `${random(0, 100)}%`,
    top: `${random(0, 100)}%`,
    size: `${random(5, 20)}rem`,
    rotate: `${random(0, 90)}deg`,
    opacity: random(0.1, 0.2, true),
    color: sample(colors) ?? '',
    shape: sample(Object.values(ShapeType)) ?? 'round',
    fill: sample(Object.values(FillType)) ?? 'solid',
    animationDuration: `${random(5, 20)}s`,
  }
  return params;
}

const polygonsMap = ref<Map<string, PolygonParams>>(new Map());

function addPolygon(params: PolygonParams) {
  polygonsMap.value.set(nanoid(), params);
}
function removePolygon(id: string) {
  polygonsMap.value.delete(id);
}

let timer: ReturnType<typeof setInterval>;

/** 若 generateInterval 參數有變化，則自動重新建立 timer */
watch(() => props.generateInterval, (generateInterval) => {
  clearInterval(timer);

  timer = setInterval(async () => {
    // 到達最大數量後，停止生成
    if (polygonsMap.value.size >= props.maxQuantity) return;

    // 刻意延遲隨機時間，讓多邊形生成不會過度固定而顯得死板
    await promiseTimeout(random(300, 1000));
    addPolygon(createPolygonParams());
  }, generateInterval);
}, {
  immediate: true
});

function init() {
  // 預先建立多邊錫
  for (let i = 0; i < props.initialQuantity; i++) {
    addPolygon(createPolygonParams());
  }
}
init();

onBeforeUnmount(() => {
  clearInterval(timer);
});
</script>

<style lang="sass" scoped>
.polygon-move
  animation: polygon-move 10s forwards linear
  
@keyframes polygon-move
  0%
    transform: translate(0px, 0px) rotate(0deg)
    opacity: 0   
    
  10%
    opacity: 1    
    
  90%
    opacity: 1   
    
  100%
    transform: translate(-10rem, 10rem) rotate(6deg)
    opacity: 0 
  
</style>
