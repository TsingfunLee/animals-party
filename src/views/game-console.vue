<template>
  <router-view />
</template>

<script setup lang="ts">
import { RouteName } from '../router/router';

import { useRouter } from 'vue-router';
import { useLoading } from '../composables/use-loading';
import { useGameConsoleStore } from '../stores/game-console.store';
import { useClientGameConsole } from '../composables/use-client-game-console';

import {Player} from '../stores/game-console.store'

const loading = useLoading();
const router = useRouter();
const gameConsoleStore = useGameConsoleStore();
const gameConsole = useClientGameConsole();

function init() {
  // 房間 ID 不存在，跳回首頁
  if (!gameConsoleStore.roomId) {
    router.push({
      name: RouteName.HOME
    });
    loading.hide();
    return;
  }

  gameConsole.onPlayerUpdate((players: Player[]) => {
    gameConsoleStore.updateState({
      players,
    })
  })

  // 跳轉至遊戲大廳
  router.push({
    name: RouteName.GAME_CONSOLE_LOBBY
  });
}
init();
</script>

<style scoped lang="sass">
</style>