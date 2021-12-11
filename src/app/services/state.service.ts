import { Injectable } from '@angular/core';
import { UsableRoutes } from '../usable-routes';
import { SetupService } from './setup.service';
import { StateSignalCheck } from './json-interfaces/state-signal-check';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { StateCraft } from './json-interfaces/state-craft';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObjectService } from './space-object.service';
import { Uid } from '../common/uid';
import { DataService } from './data.service';
import { StateGame } from './json-interfaces/state-game';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, from, interval, Observable, of, Subject, zip } from 'rxjs';
import { StateRow } from '../overlays/manage-state-dialog/state-row';
import { StateEntry } from '../overlays/manage-state-dialog/state-entry';
import {
  catchError,
  combineAll,
  delay,
  filter,
  map,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
  tap,
  throttleTime
} from 'rxjs/operators';
import { DifficultySetting } from '../overlays/difficulty-settings-dialog/difficulty-setting';
import { AccountDialogComponent } from '../overlays/account-dialog/account-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TravelService } from './travel.service';
import { StateCheckpoint } from './json-interfaces/state-checkpoint';
import { StateDvPlanner } from './json-interfaces/state-dv-planner';
import { CheckpointPreferences } from '../common/domain/checkpoint-preferences';
import { GlobalStyleClass } from '../common/global-style-class';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StateService {

  private name: string;
  private autoSaveUnsubscribe$ = new Subject();
  private context: UsableRoutes;

  private lastStateRecord: string;

  setStateRecord() {
    this.lastStateRecord = JSON.stringify(this.state);
  }

  get stateIsUnsaved(): boolean {
    return this.lastStateRecord !== JSON.stringify(this.state);
  }

  set pageContext(value: UsableRoutes) {
    this.context = value;
    this.name = undefined;
  }

  get earlyState(): Observable<StateGame> {
    return zip(
      this.setupService.stockPlanets$,
      this.setupService.availableAntennae$.pipe(filter(a => !!a.length)))
      .pipe(
        take(1),
        delay(0),
        // TODO: StateService should be independent of the specifics in the universe (crafts$ might not exist in other
        // universe types)
        switchMap(() => of(this.spaceObjectContainerService.celestialBodies$, this.spaceObjectContainerService.crafts$)),
        combineAll(),
        filter(([a, b]) => !!a && !!b),
        delay(0),
        map(() => this.state));
  }

  get state(): StateGame | StateSignalCheck | StateDvPlanner {
    let state: StateGame = {
      name: this.name || Uid.new,
      timestamp: new Date(),
      context: this.context,
      version: environment.APP_VERSION.split('.').map(t => t.toNumber()),
      celestialBodies: this.spaceObjectContainerService.celestialBodies$.value
        .map(b => b.toJson()) as StateSpaceObject[],
    };

    this.name = state.name;

    switch (this.context) {
      case UsableRoutes.SignalCheck:
        return {
          ...state,
          settings: {
            ...state.settings,
            difficulty: this.setupService.difficultySetting,
          },
          craft: this.spaceObjectContainerService.crafts$.value
            .map(b => b.toJson()) as StateCraft[],
        };
      case UsableRoutes.DvPlanner:
        return {
          ...state,
          settings: {
            ...state.settings,
            preferences: this.setupService.checkpointPreferences$.value,
          },
          checkpoints: this.travelService.checkpoints$.value
            .map(c => c.toJson()) as StateCheckpoint[],
        };
      default:
        throw new Error(`Could not process context "${this.context}"`);
    }
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

  constructor(private dataService: DataService,
              private setupService: SetupService,
              private spaceObjectContainerService: SpaceObjectContainerService,
              private spaceObjectService: SpaceObjectService,
              private travelService: TravelService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
  }

  loadState(state?: string): Observable<void> {
    // todo: use npm i `shrink-string` for 70% shorter strings
    let oldState: string;
    let setAndCompareState = () => {
      let newState = this.state;
      delete newState.timestamp;
      let newStateString = JSON.stringify(newState);
      let hasChanged = oldState && oldState !== newStateString;
      oldState = newStateString;
      return hasChanged;
    };

    this.autoSaveUnsubscribe$.next();
    this.earlyState
      .pipe(
        tap(setAndCompareState),
        switchMap(() => interval(10e3)),
        filter(setAndCompareState),
        switchMap(() => from(this.saveState(this.stateRow))
          .pipe(
            catchError(() => this.snackBar.open(`Cannot save changes without an account`, 'Sign In', {duration: 15e3})
              .onAction()
              .pipe(
                tap(() => this.dialog.open(AccountDialogComponent, {backdropClass: GlobalStyleClass.MobileFriendly})),
                switchMapTo(EMPTY), // stop this iteration of the stream here
                takeUntil(this.autoSaveUnsubscribe$))))),
        throttleTime(30e3),
        tap(() => this.snackBar.open(`Saved changes to "${this.name}"`)),
        takeUntil(this.autoSaveUnsubscribe$))
      .subscribe();

    let buildStateResult: Observable<void>;
    if (state) {
      let parsedState: StateGame = JSON.parse(state);
      this.name = parsedState.name;
      this.setContextualProperties({state, context: parsedState.context, parsedState});
      buildStateResult = this.spaceObjectService.buildState(state, parsedState.context);
    } else {
      this.name = Uid.new;
      this.setContextualProperties({state, context: this.context});
      buildStateResult = this.spaceObjectService.buildStockState(this.context);
    }

    return buildStateResult.pipe(tap(() => this.setStateRecord()));
  }

  private setContextualProperties({state, context, parsedState}:
                                    { state: string, context?: string, parsedState?: StateGame }) {
    if (state) {
      switch (context as UsableRoutes) {
        case UsableRoutes.SignalCheck:
          this.setupService.updateDifficultySetting(
            DifficultySetting.fromObject(parsedState.settings.difficulty));
          break;
        case UsableRoutes.DvPlanner:
          this.setupService.updateCheckpointPreferences(
            CheckpointPreferences.fromObject(parsedState.settings.preferences));
          break;
        default:
          throw new Error(`Context "${context}" does not exist`);
      }
    } else {
      switch (context as UsableRoutes) {
        case UsableRoutes.SignalCheck:
          this.setupService.updateDifficultySetting(DifficultySetting.normal);
          break;
        case UsableRoutes.DvPlanner:
          this.setupService.updateCheckpointPreferences(CheckpointPreferences.default);
          break;
        default:
          throw new Error(`Context "${context}" does not exist`);
      }
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
        throw new Error(error);
      });
  }

  getStates(): Observable<StateEntry[]> {
    return from(this.dataService.readAll<StateEntry>('states'));
  }

  getStatesInContext(): Observable<StateEntry[]> {
    return this.getStates().pipe(map(states => states
      .filter(s => s.context === this.context)
      .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)));
  }

  async importState(stateString: string): Promise<void> {
    await this.loadState(stateString).pipe(take(1)).toPromise();
  }

  async saveState(state: StateRow): Promise<void> {
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

  async renameState(oldName: string, state: StateRow): Promise<any> {
    return this.addStateToStore(state.toUpdatedStateGame())
      .then(() => this.removeStateFromStore(oldName))
      .catch(error => {
        this.snackBar.open(`Could not rename "${oldName}"`);
        throw error;
      })
      .then(() => this.snackBar.open(`Renamed "${oldName}" to "${state.name}"`));
  }

}
