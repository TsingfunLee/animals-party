<template>
  <q-dialog
    ref="dialogRef"
    class="rounded-5xl"
    @hide="onDialogHide"
  >
    <div class="card flex flex-col p-14 gap-8">
      <div class="text-3xl text-center">
        输入派对房间ID
      </div>

      <q-input
        v-model="targetRoomId"
        type="number"
        color="secondary"
        outlined
        rounded
        placeholder="请输入6位数字"
        input-class="text-center"
        @keyup.enter="submit"
      />

      <q-btn
        unelevated
        rounded
        color="secondary"
        class="p-4"
        @click="submit"
      >
        加入
      </q-btn>
    </div>
  </q-dialog>
</template>

<script lang='ts' setup>
import {ref } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useClientPlayer } from '../composables/use-client-player';
import { useGameConsoleStore } from '../stores/game-console.store';
import to from 'await-to-js'

const emit = defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
  useDialogPluginComponent();

const $q = useQuasar();

const targetRoomId = ref('');

const player = useClientPlayer();
const gameConsoleStore = useGameConsoleStore();

async function submit() {
  if (!/^[0-9]{6}$/.test(targetRoomId.value)) {
    $q.notify({
      type: 'negative',
      message: '請輸入 6 位數字'
    });
    return;
  }

  /** 產生 loading 效果 */
  const notifyRef = $q.notify({
    type: 'ongoing',
    message: '加入房間中'
  });

  const [err, room] = await to(player.joinRoom(targetRoomId.value));
  notifyRef();

  if(err){
    $q.notify({
      type: 'negative',
      message: `加入房间失败：${err?.message}`
    })
    console.error(`加入房间失败：`, err);
    return;
  }

  console.log(`[joinRoom] room:`, room);
  gameConsoleStore.setRoomId(room.id);

  onDialogOK();
}
</script>

<style scoped lang='sass'>
.card
  border-radius: 2.5rem !important
  background: rgba(white, 0.9)
  backdrop-filter: blur(6px)
</style>