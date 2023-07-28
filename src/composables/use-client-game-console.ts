import { useSocketClient } from "./use-socket-client";

export function useClientGameConsole(){
  const {connect, close} = useSocketClient();

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

  return {
    // 建立连接，并回传房间id
    startParty
  }
}