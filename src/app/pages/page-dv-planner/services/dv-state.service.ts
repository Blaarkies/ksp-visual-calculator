import { Injectable } from '@angular/core';
import { AbstractStateService } from '../../../services/state.abstract.service';
import { StateGame } from '../../../services/json-interfaces/state-game';
import { StateDvPlanner } from '../../../services/json-interfaces/state-dv-planner';
import { StateCheckpoint } from '../../../services/json-interfaces/state-checkpoint';
import { SetupService } from '../../../services/setup.service';
import { TravelService } from './travel.service';
import { CheckpointPreferences } from '../../../common/domain/checkpoint-preferences';
import { GameStateType } from '../../../common/domain/game-state-type';
import { DataService } from '../../../services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';
import { SpaceObjectService } from '../../../services/space-object.service';

@Injectable({
  providedIn: 'any',
})
export class DvStateService extends AbstractStateService {

  context = GameStateType.DvPlanner;

  constructor(
    private travelService: TravelService,
    protected spaceObjectContainerService: SpaceObjectContainerService,
    protected spaceObjectService: SpaceObjectService,
    protected setupService: SetupService,
    protected dataService: DataService,
    protected snackBar: MatSnackBar,
  ) {
    super();
    this.loadState().subscribe();
  }

  get state(): StateDvPlanner {
    let state = super.state;

    return {
      ...state,
      settings: {
        ...state.settings,
        preferences: this.setupService.checkpointPreferences$.value,
      },
      checkpoints: this.travelService.checkpoints$.value
        .map(c => c.toJson()) as StateCheckpoint[],
    };
  }

  setStatefulDetails(parsedState: StateGame) {
    this.setupService.updateCheckpointPreferences(CheckpointPreferences.fromObject(parsedState.settings.preferences));
  }

  setStatelessDetails() {
    this.setupService.updateCheckpointPreferences(CheckpointPreferences.default);
  }

}
