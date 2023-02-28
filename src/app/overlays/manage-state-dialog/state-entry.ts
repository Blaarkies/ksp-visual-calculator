import { Bytes } from '@firebase/firestore';
import { GameStateType } from '../../common/domain/game-state-type';

export interface StateEntry {
  context: GameStateType;
  name: string;
  timestamp: { seconds };
  version: number[];
  state: string | Bytes;
}
