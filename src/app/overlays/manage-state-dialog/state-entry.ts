import { UsableRoutes } from '../../usable-routes';

export interface StateEntry {
  context: UsableRoutes;
  name: string;
  timestamp: { seconds };
  version: number[];
  state: string;
}
