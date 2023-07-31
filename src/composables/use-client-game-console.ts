import { useSocketClient } from "./use-socket-client";
import { GameConsoleStatus, GameName, UpdateGameConsoleState, useGameConsoleStore } from '../stores/game-console.store';

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

  return {
    // 建立连接，并回传房间id
    startParty,
    // 设定游戏状态，自动同步至房间内所有玩家
    setStatus,
    // 设定游戏名称，自动同步至房间内所有玩家
    setGameName
  }
}