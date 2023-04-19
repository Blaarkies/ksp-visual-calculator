import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { GameStateType } from '../../../common/domain/game-state-type';
import { DataService } from '../../../services/data.service';
import { AbstractBaseStateService } from '../../../services/domain/base-state.abstract.service';
import { StateBase } from '../../../services/json-interfaces/state-base';
import { MiningBaseService } from './mining-base.service';
import { StateIsru } from '../domain/state-isru';

@Injectable()
export class IsruStateService extends AbstractBaseStateService {

  protected context = GameStateType.Isru;

  constructor(
    protected dataService: DataService,
    protected snackBar: MatSnackBar,
    private miningBaseService: MiningBaseService,
  ) {
    super();
  }

  get state(): StateIsru {
    let state = super.state;
    return {
      ...state,
      landed: true,
      distanceFromStar: null,
      planet: this.miningBaseService.planet$.value?.id,
      oreConcentration: this.miningBaseService.oreConcentration$.value,
      engineerBonus: this.miningBaseService.engineerBonus$.value,
      activeConverters: this.miningBaseService.activeConverters$.value,
      craftPartGroups: this.miningBaseService.craftPartGroups$
        .value?.map(({item, count}) =>
          ({id: item.label, count})),
    };
  }

  protected buildExistingState(state: string): Observable<any> {
    console.log('parsed state', JSON.parse(state));
    return this.miningBaseService.buildState(JSON.parse(state));
  }

  protected buildFreshState(): Observable<any> {
    return this.miningBaseService.buildState();
  }

  protected setStatefulDetails(parsedState: StateBase) {
  }

  protected setStatelessDetails() {
  }

}
