import {
  Inject,
  Injectable,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Observable,
  switchMap,
} from 'rxjs';
import { CheckpointPreferences } from '../../../common/domain/checkpoint-preferences';
import { GameStateType } from '../../../common/domain/game-state-type';
import { VersionValue } from '../../../common/semver';
import { AUTO_SAVE_INTERVAL } from '../../../common/token';
import { CameraService } from '../../../services/camera.service';
import { DataService } from '../../../services/data.service';
import { AbstractUniverseStateService } from '../../../services/domain/universe-state.abstract.service';
import { CheckpointDto } from '../../../common/domain/dtos/checkpoint-dto';
import { StateDvPlannerDto } from '../../../common/domain/dtos/state-dv-planner.dto';
import { DvUniverseBuilderService } from './dv-universe-builder.service';
import { TravelService } from './travel.service';

@Injectable()
export class DvStateService extends AbstractUniverseStateService {

  protected context = GameStateType.DvPlanner;

  constructor(
    protected universeBuilderService: DvUniverseBuilderService,
    protected dataService: DataService, // used by abstract
    protected cameraService: CameraService, // used by abstract
    protected snackBar: MatSnackBar,
    @Inject(AUTO_SAVE_INTERVAL) protected autoSaveInterval,

    private travelService: TravelService,
  ) {
    super();
  }

  get stateContextual(): StateDvPlannerDto {
    let universe = super.stateContextual;
    return {
      ...universe,
      settings: {
        preferences: this.universeBuilderService.checkpointPreferences$.value,
      },
      checkpoints: this.travelService.checkpoints$.value
        .map(c => c.toJson()) as CheckpointDto[],
    };
  }

  protected setStatefulDetails(parsedState: StateDvPlannerDto) {
    this.universeBuilderService.updateCheckpointPreferences(CheckpointPreferences.fromObject(parsedState.settings.preferences));
  }

  protected setStatelessDetails() {
    this.universeBuilderService.updateCheckpointPreferences(CheckpointPreferences.default);
  }

  protected buildExistingState(state: string): Observable<any> {
    return this.universeBuilderService.buildState(state);
  }

  protected buildFreshState(): Observable<any> {
    return this.universeBuilderService.buildStockState();
  }

}
