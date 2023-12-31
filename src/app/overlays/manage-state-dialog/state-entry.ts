import { Bytes } from '@firebase/firestore';
import { GameStateType } from '../../common/domain/game-state-type';
import { VersionValue } from '../../common/semver';

export interface StateEntry {
  id: string;
  name: string;
  context: GameStateType;
  timestamp: { seconds };
  version: VersionValue;
  state: string | Bytes;
}
