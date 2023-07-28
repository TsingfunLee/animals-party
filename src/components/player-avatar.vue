<template>
  <q-avatar
    color="white"
    text-color="black"
    size="6rem"
  >
    {{ props.codeName }}
  </q-avatar>
</template>

<script setup lang="ts">
interface Props {
  /** 玩家 ID，同 client ID */
  playerId: string;
  /** 玩家代號 */
  codeName: string;
}
const props = withDefaults(defineProps<Props>(), {});
</script>

<style scoped lang="sass">
</style>