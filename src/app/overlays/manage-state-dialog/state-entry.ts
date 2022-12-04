import { UsableRoutes } from '../../usable-routes';
import { Bytes } from '@firebase/firestore';

export interface StateEntry {
  context: UsableRoutes;
  name: string;
  timestamp: { seconds };
  version: number[];
  state: string | Bytes;
}
