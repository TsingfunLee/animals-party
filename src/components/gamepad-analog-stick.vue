<template>
  <div
    class="pad rounded-full bg-grey-10" 
    @contextmenu="e => e.preventDefault()"
  >
    <div class="thumb" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '34rem'
})

const emit = defineEmits<{
  (e: 'trigger', data: { x: number, y: number }): void;
}>();
</script>

<style scoped lang="sass">
.pad
  width: v-bind('props.size')
  height: v-bind('props.size')
  display: flex
  justify-content: center
  align-items: center
.thumb
  width: 40%
  height: 40%
  background: white
  border-radius: 9999px
  opacity: 0.2
</style>