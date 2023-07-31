<template>
  <q-avatar
    :color="color"
    text-color="black"
    size="6rem"
  >
    {{ props.codeName }}
  </q-avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getPlayerColor } from '../common/utils';

interface Props {
  /** 玩家 ID，同 client ID */
  playerId: string;
  /** 玩家代號 */
  codeName: string;
}
const props = withDefaults(defineProps<Props>(), {});

const color = computed(() =>
  getPlayerColor({ codeName: props.codeName })
);
</script>

<style scoped lang="sass">
</style>