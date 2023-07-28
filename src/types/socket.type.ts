import { Socket } from 'socket.io-client';

export interface Room {
  /** 房間 ID，6 位數字組成 */
  id: string;
  founderId: string;
  playerIds: string[];
}

interface OnEvents {
  'game-console:room-created': (data: Room) => void;
}

interface EmitEvents {
  '': () => void;
}

export type ClientSocket = Socket<OnEvents, EmitEvents>;