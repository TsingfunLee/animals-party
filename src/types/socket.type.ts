import { Socket } from 'socket.io-client';
import { UpdateGameConsoleState } from '../stores/game-console.store';
import { GamepadData } from './player.type';
import {Player} from '../stores/game-console.store'

export interface Room {
  /** 房間 ID，6 位數字組成 */
  id: string;
  founderId: string;
  playerIds: string[];
}

interface OnEvents {
  'game-console:room-created': (data: Room) => void;
  'game-console:state-update': (data: Required<UpdateGameConsoleState>) => void;
  'player:gamepad-data': (data: GamepadData) => void;
  'game-console:player-update': (data: Player[]) => void;
}

interface EmitEvents {
  'player:join-room': (roomId: string, callback?: (err: any, res: SocketResponse<Room>) => void) => void;
  'game-console:state-update': (data: UpdateGameConsoleState) => void;
  'player:request-game-console-state': () => void;
  'player:gamepad-data': (data: GamepadData) => void;
  
}

export interface SocketResponse<T = undefined> {
  status: 'err' | 'suc';
  message: string;
  data: T;
  error: any;
}

export type ClientSocket = Socket<OnEvents, EmitEvents>;