<template>
  <div class="absolute flex">
    <div class="flex w-full h-full z-10">
      <!-- 選單 -->
      <div class="w-1/3 flex flex-col p-12">
        <div class="flex flex-col flex-1 justify-center items-center gap-14">
          <room-id-chip color="#67785d" />

          <btn-base
            label="開始遊戲"
            class="w-96"
            label-hover-color="#7b916e"
            stroke-hover-color="white"
          />

          <btn-base
            label="結束派對"
            class="w-96"
            label-hover-color="#7b916e"
            stroke-hover-color="white"
          />
        </div>

        <!-- 玩家清單 -->
        <transition-group
          name="list"
          tag="div"
          class="flex justify-center items-center gap-4 h-32"
        >
          <player-avatar
            player-id="id"
            code-name="1P"
          />
        </transition-group>
      </div>

      <!-- 選擇遊戲 -->
      <div class="w-2/3 flex flex-nowrap justify-between items-center flex-1 px-16">
        <btn-base label="◀" />
        <game-tab-panel />
        <btn-base label="▶" />
      </div>
    </div>
    <background-polygons-pattern
      class="absolute h-full z-0"
    />
  </div>
</template>

<script setup lang="ts">
import BackgroundPolygonsPattern from '../components/background-polygons-pattern.vue';
import GameTabPanel from '../components/game-tab-panel.vue';
import PlayerAvatar from '../components/player-avatar.vue';
import RoomIdChip from '../components/room-id-chip.vue';
import BtnBase from '../components/btn-base.vue';
import { useLoading } from '../composables/use-loading';


const loading = useLoading();
loading.hide();
</script>

<style scoped lang="sass">
</style>