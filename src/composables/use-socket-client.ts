import { ref } from 'vue'
import { io, Socket } from "socket.io-client";
import { nanoid } from 'nanoid';
import { ClientType } from '../types/main.type';

import { useMainStore } from '../stores/main.store';
import { storeToRefs } from 'pinia';

export function useSocketClient() {
  const mainStore = useMainStore();
  const { client } = storeToRefs(mainStore);

  function connect(type: `${ClientType}`) {
    if (!mainStore.clientId) {
      mainStore.setClientId(nanoid());
    }

    // 已經存在
    if (mainStore.client) {
      mainStore.client.connect();
      return mainStore.client;
    }

    // 建立連線，傳送 query data
    const client: Socket = io({
      query: {
        clientId: mainStore.clientId,
        type
      }
    });

    mainStore.setClient(client, type);
    return client;
  }

  function close() {
    mainStore.client?.close();
  }

  return {
    client,
    connect,
    close
  }
}