<template>
  <q-avatar
    :color="color"
    text-color="black"
    size="6rem"
  >
    {{ props.codeName }}

    <div class="balloon-box">
      <transition name="balloon">
        <div
          v-if="messageInfo.text !== ''"
          :key="messageInfo.id"
          class="balloon"
        >
          <q-icon
            color="black"
            :name="keyNameToIconName(messageInfo.text)"
          />
        </div>
      </transition>
    </div>
  </q-avatar>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { getPlayerColor } from '../common/utils';
import {debounce} from 'lodash-es'
import { nanoid } from 'nanoid';
import { KeyName } from '../types/player.type';

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

const messageInfo = reactive({
  id: '',
  text: ''
})

const hideBalloon = debounce(()=>{
  messageInfo.text = ''
}, 2000)

const showBalloon = (text:string) => {
  const id = nanoid()

  messageInfo.id = id
  messageInfo.text = text

  hideBalloon()
}

const keyToIcon = [
  {
    keyName: KeyName.UP,
    icon: 'arrow_drop_up'
  },
  {
    keyName: KeyName.LEFT,
    icon: 'arrow_left'
  },
  {
    keyName: KeyName.RIGHT,
    icon: 'arrow_right'
  },
  {
    keyName: KeyName.DOWN,
    icon: 'arrow_drop_down'
  },
  {
    keyName: KeyName.CONFIRM,
    icon: 'done'
  },
]

const keyNameToIconName = (name: string) => {
  const target = keyToIcon.find(({keyName})=> keyName === name)

  return target?.icon ?? 'question_mark'
}

defineExpose({
  playerId: props.playerId,
  showBalloon
});

</script>

<style scoped lang="sass">
.balloon-enter-active, .balloon-leave-active
  transition-duration: 0.4s
  transition-timing-function: cubic-bezier(0.150, 1.535, 0.625, 1.015)
.balloon-leave-active
  transition-timing-function: cubic-bezier(1.000, 0.005, 0.150, 1.005)
.balloon-enter-from, .balloon-leave-to
  transform: translateY(100%) rotate(-30deg) !important
  opacity: 0 !important
.balloon-leave-to
  transform: translateY(100%) scale(0.4) !important

.balloon-box
  position: absolute
  top: 0
  left: 50%
  transform: translate(-50%, -100%)
  width: 100%
  height: 80%
.balloon
  position: absolute
  background: white
  box-shadow: 5px 5px 10px rgba(#000, 0.1)
  border-radius: 9999px
  padding: 1rem 2rem
  font-size: 2rem
  &::before
    content: ''
    width: 2rem
    height: 2rem
    position: absolute
    left: 30%
    bottom: 0
    transform: translateX(-40%) rotate(30deg)
    background: white
    box-shadow: 5px 5px 10px rgba(#000, 0.01)
</style>
