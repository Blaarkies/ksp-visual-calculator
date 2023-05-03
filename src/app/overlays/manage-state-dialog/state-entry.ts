import { Bytes } from '@firebase/firestore';
import { GameStateType } from '../../common/domain/game-state-type';

export interface StateEntry {
  id: string;
  name: string;
  context: GameStateType;
  timestamp: { seconds };
  version: number[];
  state: string | Bytes;
}
