<script setup lang="ts">
import {ref, computed} from 'vue'

interface Props {
  /** 尺寸 */
  size?: string;
  /** 按鈕內 icon 名稱 */
  icon?: string;
  /** 按鈕底色 */
  color?: string;
  /** 按鈕觸發底色 */
  activeColor?: string,
}
const props = withDefaults(defineProps<Props>(), {
  size: '2rem',
  icon: undefined,
  color: 'grey-10',
  activeColor: 'grey-3',
});

const emit = defineEmits<{
  (e: 'click'): void;
  (e: 'trigger', status: boolean): void;
}>();

const status = ref(false);

const color = computed(() =>
  status.value ? props.activeColor : props.color
);

function onClick() {
  emit('click');
}

function onUp(e: TouchEvent | MouseEvent) {
  e.preventDefault();

  status.value = false;
  emit('trigger', false);

  onClick();
}
function onDown(e: TouchEvent | MouseEvent) {
  e.preventDefault();

  status.value = true;
  emit('trigger', true);
}
</script>

<template>
  <q-btn
    round
    unelevated
    :size="props.size"
    :icon="props.icon"
    :color="color"
    @mouseup="onUp"
    @mousedown="onDown"
    @touchend="onUp"
    @touchstart="onDown"
    @contextmenu="(e:any) => e.preventDefault()"
  >
    <slot />
  </q-btn>
</template>