import { defineStore } from 'pinia';
import { ClientType } from '../types/main.type';
import {ClientSocket} from '../types/socket.type';
import { nanoid } from 'nanoid';

interface State {
  /** 儲存於 LocalStorage 中，識別是否為同一個連線 */
  clientId: string,

  /** Socket.io Client 物件 */
  client?: ClientSocket,
  type?: `${ClientType}`,
}

export const useMainStore = defineStore('main', {
  state: (): State => {
    const clientId = localStorage.getItem(`animals-party:clientId`) ?? nanoid();

    return {
      clientId,
      client: undefined,
      type: undefined,
    }
  },

  actions: {
    setClientId(id: string) {
      this.$patch({
        clientId: id
      });

      localStorage.setItem(`animals-party:clientId`, id);
    },

    setClient(client: ClientSocket, type: `${ClientType}`) {
      this.$patch({
        client,
        type
      });
    }
  }
})