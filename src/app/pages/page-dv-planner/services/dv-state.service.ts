import { Injectable } from '@angular/core';
import { UniverseContainerInstance } from '../../../services/universe-container-instance.service';
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
import { DvUniverseBuilderService } from './dv-universe-builder.service';
import {
  map,
  Observable,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DvStateService extends AbstractStateService {

  protected context = GameStateType.DvPlanner;

  constructor(
    protected spaceObjectContainerService: UniverseContainerInstance,
    protected universeBuilderService: DvUniverseBuilderService,
    protected setupService: SetupService,
    protected dataService: DataService,
    protected snackBar: MatSnackBar,

    private travelService: TravelService,
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

  protected setStatefulDetails(parsedState: StateGame) {
    this.setupService.updateCheckpointPreferences(CheckpointPreferences.fromObject(parsedState.settings.preferences));
  }

  protected setStatelessDetails() {
    this.setupService.updateCheckpointPreferences(CheckpointPreferences.default);
  }

  protected buildExistingState(state: string): Observable<any> {
    return this.universeBuilderService.buildState(state);
  }

  protected buildFreshState(): Observable<any> {
    return this.universeBuilderService.buildStockState();
  }

}
