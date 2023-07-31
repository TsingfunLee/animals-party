import { computed, onBeforeUnmount } from 'vue';

import { useSocketClient } from './use-socket-client';
import { Room } from '../types/socket.type';
import { createEventHook } from '@vueuse/core';
import { UpdateGameConsoleState } from '../stores/game-console.store';

export function useClientPlayer() {
  const { client, connect } = useSocketClient();

  function joinRoom(roomId: string): Promise<Room> {
    return new Promise((resolve, reject) => {
      // client 尚未連線，先進行連線
      if (!client?.value?.connected) {
        const client = connect('player');

        client.once('connect', () => {
          client.removeAllListeners();
          emitJoinRoom(client, roomId)
            .then(resolve)
            .catch(reject)
        });

        // 發生連線異常
        client.once('connect_error', (error) => {
          client.removeAllListeners();
          reject(error);
        });
        return;
      }

      // client 已經連線，發出事件
      emitJoinRoom(client.value, roomId)
        .then(resolve)
        .catch(reject)
    });
  }

  function emitJoinRoom(targetClient: ReturnType<typeof connect>, roomId: string): Promise<Room> {
    return new Promise((resolve, reject) => {
      targetClient.timeout(3000).emit('player:join-room', roomId, (err, res) => {
        if (err) {
          return reject(err);
        }

        if (res.status === 'err') {
          return reject(res);
        }

        resolve(res.data);
      });
    });
  }

  const stateUpdateHook = createEventHook<UpdateGameConsoleState>();
  client?.value?.on('game-console:state-update', stateUpdateHook.trigger);
  onBeforeUnmount(() => {
    client?.value?.removeListener('game-console:state-update', stateUpdateHook.trigger);
  });

  async function requestGameConsoleState() {
    if (!client?.value?.connected) {
      return Promise.reject('client 尚未連線');
    }
    client.value.emit('player:request-game-console-state');
  }

  return {
    joinRoom,
    onGameConsoleStateUpdate: stateUpdateHook.on,
    requestGameConsoleState,
  }
}