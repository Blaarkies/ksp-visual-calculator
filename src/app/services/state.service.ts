import { Injectable } from '@angular/core';
import { UsableRoutes } from '../usable-routes';
import { SetupService } from './setup.service';
import { StateSignalCheck } from './json-interfaces/state-signal-check';
import { version as APP_VERSION } from '../../../package.json';
import { StateSpaceObject } from './json-interfaces/state-space-object';
import { StateCraft } from './json-interfaces/state-craft';
import { SpaceObjectContainerService } from './space-object-container.service';
import { SpaceObjectService } from './space-object.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {

  pageContext: UsableRoutes.SignalCheck;

  get state(): any {
    // todo: check pageContext to save correct properties

    let state: StateSignalCheck = {
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

    return JSON.stringify(state);
  }

  constructor(
    private setupService: SetupService,
    private spaceObjectContainerService: SpaceObjectContainerService,
    private spaceObjectService: SpaceObjectService,
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

}
