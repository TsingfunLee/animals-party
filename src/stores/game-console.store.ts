import { defineStore } from 'pinia';

/** 遊戲狀態 */
export enum GameConsoleStatus {
  /** 首頁 */
  HOME = 'home',
  /** 大廳等待中 */
  LOBBY = 'lobby',
  /** 遊戲中 */
  PLAYING = 'playing',
}

/** 遊戲名稱列舉 */
export enum GameName { }

/** 玩家 */
export interface Player {
  clientId: string;
}

/** 更新遊戲機狀態
 * 
 * roomId 不可變更，以外參數允許持續更新
 */
export type UpdateGameConsoleState = Partial<Omit<State, 'roomId'>>;

interface State {
  status: `${GameConsoleStatus}`;
  gameName?: `${GameName}`;
  roomId?: string;
  players: Player[];
}

export const useGameConsoleStore = defineStore('game-console', {
  state: (): State => ({
    status: 'home',
    gameName: undefined,
    /** 房間 ID，6 位數字 */
    roomId: undefined,
    players: [],
  }),

  actions: {
    updateState(state: UpdateGameConsoleState) {
      this.$patch({
        ...state
      });
    },
    setRoomId(roomId: string) {
      this.$patch({
        roomId
      });
    },
  }
})