import {
  Inject,
  Injectable,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { GameStateType } from '../../../common/domain/game-state-type';
import { AUTO_SAVE_INTERVAL } from '../../../common/token';
import { CameraService } from '../../../services/camera.service';
import { DataService } from '../../../services/data.service';
import { AbstractUniverseStateService } from '../../../services/domain/universe-state.abstract.service';
import { StateCommnetPlannerDto } from '../../../common/domain/dtos/state-commnet-planner.dto';
import { DifficultySetting } from '../components/difficulty-settings-dialog/difficulty-setting';
import { CommnetUniverseBuilderService } from './commnet-universe-builder.service';

@Injectable()
export class CommnetStateService extends AbstractUniverseStateService {

  protected context = GameStateType.CommnetPlanner;

  constructor(
    protected universeBuilderService: CommnetUniverseBuilderService,
    protected dataService: DataService, // used by abstract
    protected cameraService: CameraService, // used by abstract
    protected snackBar: MatSnackBar,
    @Inject(AUTO_SAVE_INTERVAL) protected autoSaveInterval: number,
  ) {
    super();
  }

  get stateContextual(): StateCommnetPlannerDto {
    let universe = super.stateContextual;
    let craft = this.universeBuilderService.craft$.value;
    return {
      ...universe,
      settings: {
        difficulty: this.universeBuilderService.difficultySetting,
      },
      craft: craft?.map(b => b.toJson()),
    };
  }

  protected buildExistingState(state: string): Observable<any> {
    return this.universeBuilderService.buildState(state);
  }

  protected buildFreshState(): Observable<any> {
    return this.universeBuilderService.buildStockState();
  }

  protected setStatefulDetails(parsedState: StateCommnetPlannerDto) {
    this.universeBuilderService.updateDifficultySetting(DifficultySetting.fromObject(parsedState.settings.difficulty));
  }

  protected setStatelessDetails() {
    this.universeBuilderService.updateDifficultySetting(DifficultySetting.normal);
  }

}
