import { StateGame } from '../../services/json-interfaces/state-game';
import { version as APP_VERSION } from '../../../../package.json';

export class StateRow {

  name: string;
  timestamp: string;
  version: string;
  state: string;

  constructor(stateEntry: any) {
    this.name = stateEntry.name;
    this.timestamp = new Date(stateEntry.timestamp.seconds * 1e3).toLocaleString();
    this.version = 'v' + stateEntry.version.join('.');
    this.state = stateEntry.state;
  }

  toUpdatedStateGame(): StateGame {
    let parsedState: StateGame = JSON.parse(this.state);
    parsedState.name = this.name;
    parsedState.timestamp = new Date();
    parsedState.version = APP_VERSION.split('.').map(t => t.toNumber());
    return parsedState;
  }
}
