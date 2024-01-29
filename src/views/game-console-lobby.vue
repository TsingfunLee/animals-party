<template>
  <div class="absolute flex w-full h-full">
    <div class="flex w-full h-full z-10">
      <!-- 選單 -->
      <div class="w-1/3 flex flex-col p-12">
        <div class="flex flex-col flex-1 justify-center items-center gap-14">
          <room-id-chip color="#67785d" />

          <btn-base
            label="开始游戏"
            class="w-96"
            label-hover-color="#7b916e"
            stroke-hover-color="white"
          >
            <template #default="{ state }">
              <transition name="opacity">
                <div
                  v-if="state.hover"
                  class="btn-content absolute inset-0"
                >
                  <div class="polygon-lt">
                    <polygon-base
                      size="13rem"
                      shape="round"
                      fill="spot"
                      class="polygon-beat"
                    />
                  </div>

                  <div class="polygon-rb">
                    <polygon-base
                      size="13rem"
                      shape="round"
                      fill="fence"
                      opacity="0.2"
                      class="polygon-beat"
                    />
                  </div>
                </div>
              </transition>
            </template>
          </btn-base>

          <btn-base
            label="结束派对"
            class="w-96"
            label-hover-color="#7b916e"
            stroke-hover-color="white"
          >
            <template #default="{ state }">
              <transition name="opacity">
                <div
                  v-if="state.hover"
                  class="btn-content absolute inset-0"
                >
                  <div class="polygon-lt">
                    <polygon-base
                      size="13.4rem"
                      shape="square"
                      fill="spot"
                      class="polygon-swing"
                    />
                  </div>
                  <div class="polygon-rb">
                    <polygon-base
                      size="13.3rem"
                      shape="square"
                      fill="fence"
                      opacity="0.2"
                      class="polygon-swing"
                    />
                  </div>
                </div>
              </transition>
            </template>
          </btn-base>
        </div>

        <!-- 玩家清單 -->
        <transition-group
          name="list"
          tag="div"
          class="flex justify-center items-center gap-4 h-32"
        >
          <player-avatar
            v-for="player in playersInfo"
            :key="player.id"
            ref="players"
            :player-id="player.id"
            :code-name="player.codeName"
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
import { useClientGameConsole } from '../composables/use-client-game-console';
import { useGameConsoleStore } from '../stores/game-console.store';
import {computed, ref} from 'vue'

const loading = useLoading();
const gameConsole = useClientGameConsole();
const gameConsoleStore = useGameConsoleStore();

function init(){
  gameConsole.setStatus('lobby')
  loading.hide();

  gameConsole.onGamepadData(data => {
    console.log(`[ onGamepadData ] data :`, data);

    players.value.find(({playerId}) => playerId === data.playerId)?.showBalloon(data.keys[0].name)
  });
}
init()

const playersInfo = computed(() => {
  const result = gameConsoleStore.players.map((player, i) =>({
    id: player.clientId,
    codeName: `${i + 1}P`
  }))

  return result;
})

const players = ref<InstanceType<typeof PlayerAvatar>[]>([]);

</script>

<style scoped lang="sass">
.btn-content
  background: #62a88a

.polygon-lt
  position: absolute
  left: -6rem
  top: -6rem
  animation: polygon-rotate 50s infinite linear
.polygon-rb
  position: absolute
  right: -6rem
  bottom: -6rem
  animation: polygon-rotate 40s infinite linear

@keyframes polygon-rotate
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

.polygon-beat
  animation: polygon-beat 1.4s infinite

.polygon-swing
  animation: polygon-swing 1.8s infinite

@keyframes polygon-beat
  0%
    transform: scale(1)
    animation-timing-function: cubic-bezier(0.000, 0.000, 1.000, 0.000)
  50%
    transform: scale(0.9)
    animation-timing-function: cubic-bezier(0.000, 1.000, 1.000, 1.000)
  100%
    transform: scale(1)

@keyframes polygon-swing
  0%
    transform: scale(1)
    animation-timing-function: cubic-bezier(0.870, 0.000, 0.180, 0.995)
  50%
    transform: scale(0.9)
    animation-timing-function: cubic-bezier(0.870, 0.000, 0.260, 1.375)
  100%
    transform: scale(1)
</style>