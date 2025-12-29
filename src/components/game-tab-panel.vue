<template>
  <div class="panel relative rounded-[3rem]">
    <video
      :src="selectedGame.videoSrc"
      autoplay
      muted
      loop
      class="absolute h-full w-full"
    />
    <div class="description">
      <div class="name">
        {{ selectedGame.name }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export enum GameName {
  THE_FIRST_PENGUIN = 'the-first-penguin',
}

export interface GameInfo {
  name: string;
  description: string;
  gameName: `${GameName}`;
  routeName: `${RouteName}`;
  videoSrc: string;
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from 'vue-router'
import { RouteName } from "../router/router";
import {debounce} from 'lodash-es'
import { useClientGameConsole } from '../composables/use-client-game-console';

const gameConsole = useClientGameConsole();
const router = useRouter()

const games: GameInfo[] = [
  {
    name: '第一只企鹅',
    description: '企鹅群下水前，会将最前头的企鹅踢下水，确认水中没有天敌后才会下水，努力不要被踢下水吧！',
    gameName: 'the-first-penguin',
    routeName: 'game-console-the-first-penguin',
    videoSrc: '/games/the-first-penguin/preview.mp4'
  }
]

const currentIndex = ref(0);
const selectedGame = computed(() => games[currentIndex.value]);

function prev() {
  currentIndex.value--;
  if (currentIndex.value < 0) {
    currentIndex.value += games.length;
  }
}

function next() {
  currentIndex.value++;
  currentIndex.value %= games.length;
}

const start = debounce(() => {
  gameConsole.setGameName(selectedGame.value.gameName)
  gameConsole.setStatus('playing')

  router.push({
    name: selectedGame.value.routeName
  })
}, 3000, {
  leading: true,
  trailing: false
})

defineExpose({
  prev,next,start
})
</script>

<style scoped lang="sass">
.panel
  width: 84vmin
  height: 84vmin
  background: rgba(white, 0.8)
  overflow: hidden
  border: 1rem solid white
.description
  position: absolute
  bottom: 0
  left: 0
  width: 100%
  display: flex
  justify-content: center
  align-items: center
  padding: 2rem
  background: rgba(#67785d, 0.4)

.name
  color: white
  font-size: 2.4rem
  text-shadow: 0 0 10px rgba(#67785d, 0.6)
</style>