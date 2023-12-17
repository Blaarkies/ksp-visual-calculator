import { environment } from '../../../environments/environment';
import { StateBaseDto } from '../../common/domain/dtos/state-base-dto';
import { StateEntry } from './state-entry';

export class StateRow {

  id: string;
  name: string;
  timestamp: string;
  version: string;
  state: string;

  constructor({id, name, timestamp, version, state}: Omit<StateEntry, 'context'>) {
    this.id = id;
    this.name = name;
    // firebase firestore uses `timestamp.seconds` object structure
    this.timestamp = new Date(timestamp.seconds * 1e3).toLocaleString();
    this.version = 'v' + version.join('.');
    this.state = state as string;
  }

  toUpdatedStateGame(): StateBaseDto | { state } {
    let parsedState: StateBaseDto = JSON.parse(this.state);
    parsedState.name = this.name;
    parsedState.timestamp = new Date();
    parsedState.version = environment.APP_VERSION.split('.').map(t => t.toNumber());
    return parsedState;
  }

}
