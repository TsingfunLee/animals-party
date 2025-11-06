<template>
  <div
    ref="pad"
    v-touch-pan.prevent="handleTouch" 
    class="pad rounded-full bg-grey-10"
    @contextmenu="e => e.preventDefault()"
  >
    <div
      class="thumb"
      :style="thumbStyle"
      :class="{
        active: thumb.active
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { computed, reactive, ref } from 'vue';
import { Vector2 } from '@babylonjs/core';
import { throttle } from 'lodash';

interface Props {
  size?: string
}

interface PenDetails {
  touch: boolean;
  mouse: boolean;
  position: {
    top: number;
    left: number;
  };
  direction: 'up' | 'right' | 'down' | 'left';
  isFirst: boolean;
  isFinal: boolean;
  duration: number;
  distance: {
    x: number;
    y: number;
  };
  offset: {
    x: number;
    y: number;
  };
  delta: {
    x: number;
    y: number;
  }
}

const props = withDefaults(defineProps<Props>(), {
  size: '34rem'
})

const emit = defineEmits<{
  (e: 'trigger', data: { x: number, y: number }): void;
}>();

const pad = ref<HTMLElement>();
const { width, height } = useElementSize(pad);

const padCenterPosition = computed(() => {
  const top = pad.value?.offsetTop ?? 0;
  const left = pad.value?.offsetLeft ?? 0;

  return {
    top: top + height.value / 2,
    left: left + width.value / 2,
  }
})

const thumb = reactive({
  offset: {
    x: 0,
    y: 0
  },
  active: false,
})

const thumbStyle = computed(() => ({
  transform: `translate(${thumb.offset.x}px, ${thumb.offset.y}px)`,
  opacity: thumb.active ? 0.8 : undefined,
}));

function handleTouch(details: PenDetails) {
  const { position, isFirst, isFinal } = details;
  const offsetX = position.left - padCenterPosition.value.left;
  const offsetY = position.top - padCenterPosition.value.top;

  const vectorMagnitude = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
  const xMax = (offsetX / vectorMagnitude) * (width.value / 2);
  const yMax = (offsetY / vectorMagnitude) * (height.value / 2);

  thumb.offset.x = offsetX;
  thumb.offset.y = offsetY;

  if(Math.abs(offsetX) > Math.abs(xMax)){
    thumb.offset.x = xMax;
  }
  if(Math.abs(offsetY) > Math.abs(yMax)){
    thumb.offset.y = yMax;
  }

  if(isFirst){
    thumb.active = true;
  }

  if(isFinal){
    thumb.offset.x = 0;
    thumb.offset.y = 0;
    thumb.active = false;
  }
}
</script>

<style scoped lang="sass">
.pad
  width: v-bind('props.size')
  height: v-bind('props.size')
  display: flex
  justify-content: center
  align-items: center
.thumb
  width: 40%
  height: 40%
  background: white
  border-radius: 9999px
  opacity: 0.2
  transition-duration: 0.3s
  transition-timing-function: cubic-bezier(0.000, 1.650, 0.190, 1.005)
  &.active
    transition-duration: 0s
</style>