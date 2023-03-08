import { Injectable } from '@angular/core';
import { AbstractStateService } from '../../../services/state.abstract.service';
import { GameStateType } from '../../../common/domain/game-state-type';
import { SpaceObjectContainerService } from '../../../services/space-object-container.service';
import { SetupService } from '../../../services/setup.service';
import { DataService } from '../../../services/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StateGame } from '../../../services/json-interfaces/state-game';
import {
  combineLatest,
  map,
  Observable,
} from 'rxjs';
import { StateCraft } from '../../../services/json-interfaces/state-craft';
import { StateCommnetPlanner } from '../../../services/json-interfaces/state-commnet-planner';
import { DifficultySetting } from '../../../overlays/difficulty-settings-dialog/difficulty-setting';
import { CommnetUniverseBuilderService } from './commnet-universe-builder.service';

@Injectable({
  providedIn: 'any',
})
export class CommnetStateService extends AbstractStateService {

  protected context = GameStateType.CommnetPlanner;

  constructor(
    protected spaceObjectContainerService: SpaceObjectContainerService,
    protected universeBuilderService: CommnetUniverseBuilderService,
    protected setupService: SetupService,
    protected dataService: DataService,
    protected snackBar: MatSnackBar,
  ) {
    super();
    this.loadState().subscribe();
  }

  get state(): Observable<StateCommnetPlanner> {
    return combineLatest([super.state, this.universeBuilderService.crafts$])
      .pipe(
        map(([state, allCraft]) => ({
          ...state,
          settings: {
            ...state.settings,
            difficulty: this.setupService.difficultySetting,
          },
          craft: allCraft.map(b => b.toJson()) as StateCraft[],
        })),
      );
  }

  protected setStatefulDetails(parsedState: StateGame) {
    this.setupService.updateDifficultySetting(DifficultySetting.fromObject(parsedState.settings.difficulty));
  }

  protected setStatelessDetails() {
    this.setupService.updateDifficultySetting(DifficultySetting.normal);
  }

  protected buildExistingState(state: string): Observable<any> {
    return this.universeBuilderService.buildState(state);
  }

  protected buildFreshState(): Observable<any> {
    return this.universeBuilderService.buildStockState();
  }

}
