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

@Injectable({
  providedIn: 'root',
})
export class StateService {

  pageContext: UsableRoutes.SignalCheck;

  get state(): StateSignalCheck {
    // todo: check pageContext to save correct properties

    let state: StateSignalCheck = {
      name: Uid.new,
      timestamp: new Date(),
      context: this.pageContext,
      version: APP_VERSION.split('.').map(t => t.toNumber()),
      settings: {
        difficulty: this.setupService.difficultySetting,
      },
      celestialBodies: this.spaceObjectContainerService.celestialBodies$.value
        .map(b => b.toJson()) as StateSpaceObject[],
      craft: this.spaceObjectContainerService.crafts$.value
        .map(b => b.toJson()) as StateCraft[],
    };

    return state;
  }

  constructor(
    private dataService: DataService,
    private setupService: SetupService,
    private spaceObjectContainerService: SpaceObjectContainerService,
    private spaceObjectService: SpaceObjectService,
    private snackBar: MatSnackBar,
  ) {
  }

  loadState() {
    let lastState = localStorage.getItem('ksp-commnet-planner-last-state');
    if (lastState) {
      this.spaceObjectService.buildState(lastState);
      return;
    }

    this.spaceObjectService.buildStockState();
  }

  addStateToStore(state: StateGame) {
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
}
