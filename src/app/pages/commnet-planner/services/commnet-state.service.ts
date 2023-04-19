import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { GameStateType } from '../../../common/domain/game-state-type';
import { DataService } from '../../../services/data.service';
import { StateCommnetPlanner } from '../../../services/json-interfaces/state-commnet-planner';
import { StateCraft } from '../../../services/json-interfaces/state-craft';
import { StateUniverse } from '../../../services/json-interfaces/state-universe';
import { AbstractUniverseStateService } from '../../../services/domain/universe-state.abstract.service';
import { DifficultySetting } from '../components/difficulty-settings-dialog/difficulty-setting';
import { CommnetUniverseBuilderService } from './commnet-universe-builder.service';

@Injectable()
export class CommnetStateService extends AbstractUniverseStateService {

  protected context = GameStateType.CommnetPlanner;

  constructor(
    protected universeBuilderService: CommnetUniverseBuilderService,
    protected dataService: DataService,
    protected snackBar: MatSnackBar,
  ) {
    super();
  }

  get state(): StateCommnetPlanner {
    let state = super.state;
    let craft = this.universeBuilderService.craft$.value;
      return {
      ...state,
      settings: {
        ...state.settings,
        difficulty: this.universeBuilderService.difficultySetting,
      },
      craft: craft?.map(b => b.toJson()) as StateCraft[],
    };
  }

  protected buildExistingState(state: string): Observable<any> {
    return this.universeBuilderService.buildState(state);
  }

  protected buildFreshState(): Observable<any> {
    return this.universeBuilderService.buildStockState();
  }

  protected setStatefulDetails(parsedState: StateUniverse) {
    this.universeBuilderService.updateDifficultySetting(DifficultySetting.fromObject(parsedState.settings.difficulty));
  }

  protected setStatelessDetails() {
    this.universeBuilderService.updateDifficultySetting(DifficultySetting.normal);
  }

}
