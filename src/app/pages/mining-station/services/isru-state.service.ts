import { state } from '@angular/animations';
import {
  Inject,
  Injectable,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { GameStateType } from '../../../common/domain/game-state-type';
import { DataService } from '../../../services/data.service';
import { AbstractBaseStateService } from '../../../services/domain/base-state.abstract.service';
import { StateBase } from '../../../services/json-interfaces/state-base';
import { AUTO_SAVE_INTERVAL } from '../domain/config';
import { MiningBaseService } from './mining-base.service';
import { StateIsru } from '../domain/state-isru';

@Injectable()
export class IsruStateService extends AbstractBaseStateService {

  protected context = GameStateType.Isru;

  constructor(
    protected dataService: DataService,
    protected snackBar: MatSnackBar,
    @Inject(AUTO_SAVE_INTERVAL) protected autoSaveInterval,
    private miningBaseService: MiningBaseService,
  ) {
    super();
  }

  get stateContextual(): StateIsru {
    return {
      landed: true,
      distanceFromStar: null,
      planet: this.miningBaseService.planet.id,
      oreConcentration: this.miningBaseService.oreConcentration.round(2),
      engineerBonus: this.miningBaseService.engineerBonus,
      activeConverters: this.miningBaseService.activeConverters,
      craftPartGroups: this.miningBaseService.partSelection
        ?.map(({item, count}) => ({id: item.label, count})),
    };
  }

  protected buildExistingState(state: string): Observable<any> {
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
