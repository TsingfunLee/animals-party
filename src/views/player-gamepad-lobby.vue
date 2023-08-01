<template>
  <div
    class="w-full h-full flex text-white select-none"
    @touchmove="(e)=>e.preventDefault()"
  >
    <gamepad-d-pad class="absolute bottom-5 left-8" />
    <gamepad-btn
      class="absolute bottom-10 right-20"
      size="6rem"
      icon="done"
    />

    <div
      class="code-name"
      :class="codeNameClass"
    >
      {{ codeName }}
    </div>
  </div>

  <q-dialog
    v-model="isPortrait"
    persistent
  >
    <q-card class="p-8">
      <q-card-section class="flex flex-col items-center gap-6">
        <q-spinner-box
          color="primary"
          size="10rem"
        />
        <div class="text-4xl">
          请将手机转为横向
        </div>
        <div class="text-base">
          转为横向后，此视窗会自动关闭
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useLoading } from '../composables/use-loading';
import GamepadBtn from '../components/gamepad-btn.vue';
import GamepadDPad from '../components/gamepad-d-pad.vue';
import { useScreenOrientation } from '@vueuse/core';
import {computed} from 'vue'
import { getPlayerColor } from '../common/utils';
import { useClientPlayer } from '../composables/use-client-player';

const loading = useLoading();
const { orientation } = useScreenOrientation();
const player = useClientPlayer();

function init() {
  loading.hide();
}
init();

// 轉向
const isPortrait = computed(() => orientation.value?.includes('portrait'));

// 玩家信息
const codeName = computed(() => player.codeName.value);
const playerColorName = computed(() => getPlayerColor({
  codeName: codeName.value
}));
const codeNameClass = computed(() => `bg-${playerColorName.value}`);
</script>

<style scoped lang="sass">
.code-name
  position: absolute
  top: 0
  left: 50%
  transform: translateX(-50%)
  width: 20rem
  height: 20rem
  display: flex
  justify-content: center
  padding: 0.1rem
  clip-path: circle(50% at 50% 0)
  font-size: 4rem
  text-shadow: 0px 0px 2px rgba(#000, 0.6)
</style>