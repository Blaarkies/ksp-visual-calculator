import { environment } from '../../../environments/environment';
import { StateBase } from '../../services/json-interfaces/state-base';

export class StateRow {

  name: string;
  timestamp: string;
  version: string;
  state: string;

  constructor(stateEntry: any) {
    this.name = stateEntry.name;
    // firebase firestore uses `timestamp.seconds` object structure
    this.timestamp = new Date(stateEntry.timestamp.seconds * 1e3).toLocaleString();
    this.version = 'v' + stateEntry.version.join('.');
    this.state = stateEntry.state;
  }

  toUpdatedStateGame(): StateBase | { state } {
    let parsedState: StateBase = JSON.parse(this.state);
    parsedState.name = this.name;
    parsedState.timestamp = new Date();
    parsedState.version = environment.APP_VERSION.split('.').map(t => t.toNumber());
    return parsedState;
  }

}
