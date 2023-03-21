import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { GameStateType } from '../../../common/domain/game-state-type';
import { DifficultySetting } from '../components/difficulty-settings-dialog/difficulty-setting';
import { DataService } from '../../../services/data.service';
import { StateCommnetPlanner } from '../../../services/json-interfaces/state-commnet-planner';
import { StateCraft } from '../../../services/json-interfaces/state-craft';
import { StateGame } from '../../../services/json-interfaces/state-game';
import { AbstractStateService } from '../../../services/state.abstract.service';
import { CommnetUniverseBuilderService } from './commnet-universe-builder.service';

@Injectable({
  providedIn: 'root',
})
export class CommnetStateService extends AbstractStateService {

  protected context = GameStateType.CommnetPlanner;

  constructor(
    protected universeBuilderService: CommnetUniverseBuilderService,
    protected dataService: DataService,
    protected snackBar: MatSnackBar,
  ) {
    super();
    this.loadState().subscribe();
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

  protected setStatefulDetails(parsedState: StateGame) {
    this.universeBuilderService.updateDifficultySetting(DifficultySetting.fromObject(parsedState.settings.difficulty));
  }

  protected setStatelessDetails() {
    this.universeBuilderService.updateDifficultySetting(DifficultySetting.normal);
  }

  protected buildExistingState(state: string): Observable<any> {
    return this.universeBuilderService.buildState(state);
  }

  protected buildFreshState(): Observable<any> {
    return this.universeBuilderService.buildStockState();
  }

}
