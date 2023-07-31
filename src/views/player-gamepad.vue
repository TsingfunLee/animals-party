<template>
  <div class="w-full h-full bg-black">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { RouteName } from '../router/router';

import { useRouter } from 'vue-router';
import { useGameConsoleStore } from '../stores/game-console.store';
import { useClientPlayer } from '../composables/use-client-player';

const gameConsoleStore = useGameConsoleStore();
const router = useRouter();
const player = useClientPlayer();

function init() {
  if (!gameConsoleStore.roomId) {
    router.push({
      name: RouteName.HOME
    });
    return;
  }

  player.onGameConsoleStateUpdate((state) => {
    const { status } = state;

    console.log(`[ onGameConsoleStateUpdate ] state : `, state);
    gameConsoleStore.updateState(state);

    if (status === 'home') {
      router.push({
        name: RouteName.HOME
      });
    }else if (status === 'lobby') {
      router.push({
        name: RouteName.PLAYER_GAMEPAD_LOBBY
      });
    }
  });

  player.requestGameConsoleState();
}
init();
</script>