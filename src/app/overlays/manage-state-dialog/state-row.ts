import { environment } from '../../../environments/environment';
import { StateBaseDto } from '../../common/domain/dtos/state-base-dto';
import { GameStateType } from '../../common/domain/game-state-type';
import { VersionValue } from '../../common/semver';
import { StateEntry } from './state-entry';

export class StateRow {

  id: string;
  name: string;
  context: GameStateType;
  timestamp: string;
  version: VersionValue;
  versionLabel: string;
  deletedAt: Date | undefined;
  state: string;

  constructor({id, name, context, timestamp, version, deletedAt, state}: StateEntry) {
    this.id = id;
    this.name = name;
    this.context = context;
    // firebase firestore uses `timestamp.seconds` object structure
    this.timestamp = new Date(timestamp.seconds * 1e3).toLocaleString();
    this.version = version;
    this.versionLabel = 'v' + (version as number[]).join('.');
    this.deletedAt = deletedAt ?? null;
    this.state = state as string;
  }

  toUpdatedStateGame(): StateBaseDto | { state } {
    return {
      id: this.id,
      name: this.name,
      context: this.context,
      timestamp: new Date(),
      version: environment.APP_VERSION.split('.').map((t: string) => t.toNumber()),
      deletedAt: this.deletedAt,
      state: JSON.parse(this.state),
    };
  }

}
