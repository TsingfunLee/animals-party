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

  <div class="absolute inset-0 flex flex-col flex-center gap-20">
    <btn-base
      label="建立派对"
      label-hover-color="#ff9a1f"
      stroke-color="#856639"
      stroke-hover-color="white"
      class="menu-btn"
      @click="startParty"
    >
      <template #default="{ state }">
        <div
          class="btn-content absolute inset-0"
          :class="{ 'hover': state.hover }"
        >
          <polygon-base
            class="absolute btn-polygon-lt"
            size="14rem"
            shape="round"
            fill="spot"
          />

          <q-icon
            name="sports_esports"
            color="white"
            size="8rem"
            class="absolute game-icon"
          />
        </div>
      </template>
    </btn-base>

    <btn-base
      class="menu-btn"
      label="加入游戏"
      label-hover-color="#ff9a1f"
      stroke-color="#856639"
      stroke-hover-color="white"
      @click="joinParty"
    >
      <template #default="{ state }">
        <div
          class="btn-content absolute inset-0"
          :class="{ 'hover': state.hover }"
        >
          <polygon-base
            class="absolute btn-polygon-lt"
            size="14rem"
            rotate="144deg"
            shape="pentagon"
          />
          <q-icon
            name="person_add"
            color="white"
            size="7.8rem"
            class="absolute join-icon"
          />
        </div>
      </template>
    </btn-base>
  </div>
</template>

<script setup lang="ts">
import backgroundPolygonsFloating from '_c/background-polygons-floating.vue';
import polygonBase from '_c/polygon-base.vue';
import BtnBase from '_c/btn-base.vue';
import { RouteName } from '../router/router';
import { useLoading } from '../composables/use-loading';
import { useRouter } from 'vue-router';
import { useClientGameConsole } from '../composables/use-client-game-console';
import { useQuasar } from 'quasar';
import to from 'await-to-js';
import {useGameConsoleStore} from '../stores/game-console.store';
import DialogJoinParty from '../components/dialog-join-party.vue';

const loading = useLoading();
const router = useRouter();
const gameConsole = useClientGameConsole();
const $q = useQuasar();
const gameConsoleStore = useGameConsoleStore();

async function startParty() {
  await loading.show();

  const [err, roomId] = await to(gameConsole.startParty());

  if (err) {
    console.error(`[ startParty ] err : `, err);
    $q.notify({
      type: 'negative',
      message: '建立派对失败，请换个姿势稍后尝试'
    });
    return;
  }

  console.log(`[ startParty ] roomId : `, roomId);
  gameConsoleStore.setRoomId(roomId);

  router.push({
    name: RouteName.GAME_CONSOLE
  });
}

async function joinParty() {
  $q.dialog({
    component: DialogJoinParty,
  }).onOk(async () => {
    $q.notify({
      type: 'positive',
      message: '加入房间成功'
    });

    await loading.show();

    router.push({
      name: RouteName.PLAYER_GAMEPAD
    })
  });
}

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

.menu-btn
  width: 30rem

.btn-polygon-lt
  left: 0
  top: 0
  transform: translate(-50%, -60%)

.game-icon
  right: 0
  bottom: 0
  transform: translate(12%, 24%) rotate(-10deg)
  opacity: 0.6

.btn-content
  transform: scale(1)
  transition-duration: 0.4s
  transition-timing-function: cubic-bezier(0.545, 1.650, 0.520, 1.305)
  &.hover
    transform: scale(0.96) rotate(-2deg)
    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1)
</style>
