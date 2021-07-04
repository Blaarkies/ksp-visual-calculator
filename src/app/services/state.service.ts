import { Injectable } from '@angular/core';
import { UsableRoutes } from '../usable-routes';
import { SetupService } from './setup.service';
import { StateSignalCheck } from './json-interfaces/state-signal-check';
import { version as APP_VERSION } from '../../../package.json';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { StateCraft } from './json-interfaces/state-craft';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObjectService } from './space-object.service';
import { Uid } from '../common/uid';
import { DataService } from './data.service';
import { StateGame } from './json-interfaces/state-game';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, zip } from 'rxjs';
import { StateRow } from '../dialogs/manage-state-dialog/state.row';
import { StateEntry } from '../dialogs/manage-state-dialog/state.entry';
import { delay, filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StateService {

  private name: string;

  private _pageContext: UsableRoutes.SignalCheck;
  set pageContext(value: UsableRoutes.SignalCheck) {
    this._pageContext = value;
    this.name = undefined;
  }

  get earlyState(): Observable<StateSignalCheck> {
    return zip(this.setupService.stockPlanets$,
      this.setupService.availableAntennae$.pipe(filter(a => !!a.length)))
      .pipe(
        take(1),
        delay(0),
        map(() => this.state));
  }

  get state(): StateSignalCheck {
    // todo: check pageContext to save correct properties

    let state: StateSignalCheck = {
      name: this.name || Uid.new,
      timestamp: new Date(),
      context: this._pageContext,
      version: APP_VERSION.split('.').map(t => t.toNumber()),
      settings: {
        difficulty: this.setupService.difficultySetting,
      },
      celestialBodies: this.spaceObjectContainerService.celestialBodies$.value
        .map(b => b.toJson()) as StateSpaceObject[],
      craft: this.spaceObjectContainerService.crafts$.value
        .map(b => b.toJson()) as StateCraft[],
    };

    this.name = state.name;

    return state;
  }

  get stateRow(): StateRow {
    let state = this.state;
    return new StateRow({
      name: state.name,
      timestamp: {seconds: state.timestamp.getTime() * .001},
      version: state.version,
      state: JSON.stringify(state),
    });
  }

  constructor(
    private dataService: DataService,
    private setupService: SetupService,
    private spaceObjectContainerService: SpaceObjectContainerService,
    private spaceObjectService: SpaceObjectService,
    private snackBar: MatSnackBar,
  ) {
  }

  loadState(state?: string) {
    if (state) {
      this.name = JSON.parse(state).name;
      this.spaceObjectService.buildState(state);
    } else {
      this.spaceObjectService.buildStockState();
      this.name = Uid.new;
    }
  }

  addStateToStore(state: StateGame): Promise<void> {
    return this.dataService.write('states',
      {
        [state.name]: {
          name: state.name,
          context: state.context,
          timestamp: state.timestamp,
          version: state.version,
          state: JSON.stringify(state),
        },
      },
      {merge: true});
  }

  async removeStateFromStore(name: string): Promise<void> {
    return this.dataService.delete('states', name)
      .catch(error => {
        this.snackBar.open(`Could not remove "${name}" from cloud storage`);
        throw console.error(error);
      });
  }

  getStates(): Observable<StateEntry[]> {
    return this.dataService.readAll<StateEntry>('states');
  }

  getStatesInContext(): Observable<StateEntry[]> {
    return this.getStates()
      .pipe(
        map(states => states.filter(s => s.context === this._pageContext)
          .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)));
  }

  importState(stateString: string) {
    this.loadState(stateString);
  }

  saveState(state: StateRow): Promise<void> {
    return this.addStateToStore(state.toUpdatedStateGame());
  }

  renameCurrentState(name: string) {
    this.name = name;
  }

  getTimelessState(state: StateSignalCheck): StateSignalCheck {
    let safeToChange = JSON.stringify(state);
    let reparsed: StateSignalCheck = JSON.parse(safeToChange);
    reparsed.timestamp = undefined;
    return reparsed;
  }
}
