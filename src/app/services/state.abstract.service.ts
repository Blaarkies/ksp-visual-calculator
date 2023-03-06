import {
  firstValueFrom,
  from,
  map,
  Observable,
  Subject,
  tap,
} from 'rxjs';
import { GameStateType } from '../common/domain/game-state-type';
import { StateGame } from './json-interfaces/state-game';
import { StateSignalCheck } from './json-interfaces/state-signal-check';
import { StateDvPlanner } from './json-interfaces/state-dv-planner';
import { Namer } from '../common/namer';
import { environment } from '../../environments/environment';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { StateRow } from '../overlays/manage-state-dialog/state-row';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SetupService } from './setup.service';
import {
  gzip,
  ungzip,
} from 'pako';
import { Bytes } from '@firebase/firestore';
import { DataService } from './data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StateEntry } from '../overlays/manage-state-dialog/state-entry';

export abstract class AbstractStateService {

  protected abstract context: GameStateType;

  protected abstract spaceObjectContainerService: SpaceObjectContainerService;
  protected abstract setupService: SetupService;
  protected abstract dataService: DataService;
  protected abstract snackBar: MatSnackBar;

  private name: string;
  private autoSaveUnsubscribe$ = new Subject<void>();
  private lastStateRecord: string;

  setStateRecord() {
    this.lastStateRecord = JSON.stringify(this.state);
  }

  get stateIsUnsaved(): boolean {
    return this.lastStateRecord !== JSON.stringify(this.state);
  }

  get state(): StateGame | StateSignalCheck | StateDvPlanner {
    let state: StateGame = {
      name: this.name || Namer.savegame,
      timestamp: new Date(),
      context: this.context,
      version: environment.APP_VERSION.split('.').map(t => t.toNumber()),
      celestialBodies: this.spaceObjectContainerService.celestialBodies$.value
        .map(b => b.toJson()) as StateSpaceObject[],
    };

    this.name = state.name;

    return state;
  }

  get stateRow(): StateRow {
    let state = this.state;
    let {name, timestamp, version} = state;
    return new StateRow({
      name,
      timestamp: {seconds: timestamp.getTime() * .001},
      version,
      state: JSON.stringify(state),
    });
  }

  loadState(state?: string): Observable<void> {
    let buildStateResult: Observable<void>;
    if (state) {
      let parsedState: StateGame = JSON.parse(state);
      this.name = parsedState.name;
      // @fix v1.2.6:webp format planet images introduced, but old savegames have .png in details
      let imageFormatFix = state.replace(/.png/g, '.webp');

      this.setStatefulDetails(parsedState);
      buildStateResult = this.buildExistingState(imageFormatFix);
    } else {
      this.name = Namer.savegame;

      this.setStatelessDetails();
      buildStateResult = this.buildFreshState();
    }

    return buildStateResult.pipe(tap(() => this.setStateRecord()));
  }

  protected abstract setStatefulDetails(parsedState: StateGame)
  protected abstract setStatelessDetails()
  protected abstract buildExistingState(state: string): Observable<any>
  protected abstract buildFreshState(): Observable<any>

  async addStateToStore(state: StateGame) {
    let compressed = gzip(JSON.stringify(state));
    let bytes = Bytes.fromUint8Array(compressed);

    return this.dataService.write('states',
      {
        [state.name]: {
          name: state.name,
          context: state.context,
          timestamp: state.timestamp,
          version: state.version,
          state: bytes,
        },
      },
      {merge: true});
  }

  async removeStateFromStore(name: string) {
    // TODO: soft delete first
    return this.dataService.delete('states', name)
      .catch(error => {
        this.snackBar.open(`Could not remove "${name}" from cloud storage`);
        throw new Error(error);
      });
  }

  getStates(): Observable<StateEntry[]> {
    return from(this.dataService.readAll<StateEntry>('states'))
      .pipe(map(states => states
        .filter(s => s.name) // @fix v1.2.6: ignore other fields, like "isCompressed"
        .map(s => {
          // @fix v1.2.6: previous version savegames are not compressed
          if (typeof s.state === 'string') {
            return s;
          }

          // uncompress states
          let arrayBuffer = s.state.toUint8Array().buffer;
          let unzipped = ungzip(arrayBuffer, {to: 'string'});
          return ({...s, state: unzipped});
        })));
  }

  getStatesInContext(): Observable<StateEntry[]> {
    return this.getStates().pipe(map(states => states
      .filter(s => s.context === this.context)
      .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)));
  }

  async importState(stateString: string) {
    await firstValueFrom(this.loadState(stateString));
  }

  async saveState(state: StateRow) {
    return this.addStateToStore(state.toUpdatedStateGame());
  }

  renameCurrentState(name: string) {
    this.name = name;
  }

  getTimestamplessState(state: StateGame): StateGame {
    let safeToChange = JSON.stringify(state);
    let reparsed: StateGame = JSON.parse(safeToChange);
    reparsed.timestamp = undefined;
    return reparsed;
  }

  async renameState(oldName: string, state: StateRow) {
    return this.addStateToStore(state.toUpdatedStateGame())
      .then(() => this.removeStateFromStore(oldName))
      .catch(error => {
        this.snackBar.open(`Could not rename "${oldName}"`);
        throw error;
      })
      .then(() => this.snackBar.open(`Renamed "${oldName}" to "${state.name}"`));
  }

}
