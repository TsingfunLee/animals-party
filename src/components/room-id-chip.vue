<template>
  <div class="room-id py-8 px-16 rounded-full">
    {{ roomId }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useGameConsoleStore } from '../stores/game-console.store';

interface Props {
  color?: string;
}
const props = withDefaults(defineProps<Props>(), {
  color: '#111',
});

const gameConsoleStore = useGameConsoleStore();

const roomId = computed(() => gameConsoleStore.roomId);
</script>

<style scoped lang="sass">
.room-id
  background: rgba(white, 0.4)
  color: v-bind('props.color')
  font-size: 2rem
  letter-spacing: 2px
  font-weight: 700
</style>