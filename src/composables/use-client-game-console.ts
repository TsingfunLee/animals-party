import { useSocketClient } from "./use-socket-client";
import { GameConsoleStatus, GameName, UpdateGameConsoleState, useGameConsoleStore } from '../stores/game-console.store';
import { GamepadData } from "../types/player.type";
import { createEventHook } from "@vueuse/core";
import { onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { Player } from './../stores/game-console.store';
import { RouteName } from "../router/router";

const gameConsoleStore = useGameConsoleStore()

export function useClientGameConsole(){
  const {connect, close, client} = useSocketClient();

  async function startParty(){
    close();

    // 开始连线
    const client = connect('game-console');

    return new Promise<string>((resolve, reject)=>{
      // 5秒后超时
      const timer = setTimeout(()=>{
        close();
        client.removeAllListeners();

        reject('连线 timeout');
      }, 5000);

      // 发生连线异常
      client.once('connect_error', (error)=>{
        client.removeAllListeners();
        reject(error)
      })

      // 房间建立成功
      client.once('game-console:room-created', async ({id})=> {
        client.removeAllListeners();
        clearTimeout(timer);
        resolve(id);
      })
    })
  }

  function setStatus(status: `${GameConsoleStatus}`) {
    gameConsoleStore.updateState({
      status
    });

    if (!client?.value?.connected) {
      return Promise.reject('client 尚未連線');
    }

    client.value.emit('game-console:state-update', {
      status
    });
  }

  function setGameName(gameName: `${GameName}`) {
    gameConsoleStore.updateState({
      gameName
    });

    if (!client?.value?.connected) {
      return Promise.reject('client 尚未連線');
    }

    client.value.emit('game-console:state-update', {
      gameName
    });
  }

  function getPlayerCodeName(id: string){
    const index = gameConsoleStore.players.findIndex(({clientId})=>{
      clientId === id
    })

    if(index < 0){
      return 'unknown'
    }

    return `${index + 1}P`
  }

  function endParty(){
    client?.value?.disconnect();
    const router = useRouter();
    router.push({name: RouteName.HOME});
  }

  const gamepadDataHook = createEventHook<GamepadData>();
  client?.value?.on('player:gamepad-data', gamepadDataHook.trigger);
  onBeforeUnmount(() => {
    client?.value?.removeListener('player:gamepad-data', gamepadDataHook.trigger);
  });

  const playerUpdateHook = createEventHook<Player[]>();
  client?.value?.on('game-console:player-update', playerUpdateHook.trigger);
  onBeforeUnmount(()=>{
    client?.value?.removeListener('game-console:player-update', playerUpdateHook.trigger);
  });

  return {
    // 建立连接，并回传房间id
    startParty,
    // 设定游戏状态，自动同步至房间内所有玩家
    setStatus,
    // 设定游戏名称，自动同步至房间内所有玩家
    setGameName,
    // 摇杆控制信号事件
    onGamepadData: gamepadDataHook.on,
    onPlayerUpdate: playerUpdateHook.on,
    getPlayerCodeName,
    endParty,
  }
}