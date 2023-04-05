import { MatSnackBar } from '@angular/material/snack-bar';
import { Bytes } from '@firebase/firestore';
import {
  gzip,
  ungzip,
} from 'pako';
import {
  firstValueFrom,
  from,
  map,
  Observable,
  Subject,
  tap,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { GameStateType } from '../common/domain/game-state-type';
import { Namer } from '../common/namer';
import { StateEntry } from '../overlays/manage-state-dialog/state-entry';
import { StateRow } from '../overlays/manage-state-dialog/state-row';
import { DataService } from './data.service';
import { StateGame } from './json-interfaces/state-game';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { AbstractUniverseBuilderService } from './universe-builder.abstract.service';

export abstract class AbstractStateService {

  protected abstract context: GameStateType;

  protected abstract universeBuilderService: AbstractUniverseBuilderService;
  protected abstract dataService: DataService;
  protected abstract snackBar: MatSnackBar;

  private name: string;
  private autoSaveUnsubscribe$ = new Subject<void>();
  private lastStateRecord: string;

  setStateRecord() {
    this.lastStateRecord = JSON.stringify(this.state)
  }

  get stateIsUnsaved(): boolean {
    return this.lastStateRecord !== JSON.stringify(this.state);
  }

  get state(): StateGame {
    let planets = this.universeBuilderService.planets$.value;
    return {
      name: this.name,
      timestamp: new Date(),
      context: this.context,
      version: environment.APP_VERSION.split('.').map(t => t.toNumber()),
      celestialBodies: planets?.map(b => b.toJson()) as StateSpaceObject[],
    };
  }

  get stateRow(): StateRow {
    let {name, timestamp, version} = this.state;
    return new StateRow({
      name, version, state: JSON.stringify(this.state),
      timestamp: {seconds: timestamp.getTime() * .001},
    });
  }

  loadState(state?: string): Observable<void> {
    let buildStateResult: Observable<void>;
    if (state) {
      // @fix v1.2.6:webp format planet images introduced, but old savegames have .png in details
      let imageFormatFix = state.replace(/.png/g, '.webp');

      let parsedState: StateGame = JSON.parse(imageFormatFix);
      this.name = parsedState.name;
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
