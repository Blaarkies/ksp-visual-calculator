import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  merge,
  Observable,
  take,
  takeUntil,
} from 'rxjs';
import { ActionOption } from '../../common/domain/action-option';
import { Group } from '../../common/domain/group';
import { Icons } from '../../common/domain/icons';
import { Craft } from '../../common/domain/space-objects/craft';
import { WithDestroy } from '../../common/with-destroy';
import { ActionPanelDetails } from '../../components/hud/action-panel-details';
import { HudComponent } from '../../components/hud/hud.component';
import { AuthService } from '../../services/auth.service';
import { engineerBonusMap } from './components/mining-base-control/engineer-skill-selector/engineer-skill-selector.component';
import { CraftPart } from './domain/craft-part';
import { IsruStateService } from './services/isru-state.service';
import { MiningBaseService } from './services/mining-base.service';
import { AnalyticsService } from '../../services/analytics.service';
import { EventLogs } from '../../services/domain/event-logs';
import { HudService } from '../../services/hud.service';
import { CraftPartStatisticsComponent } from './components/craft-part-statistics/craft-part-statistics.component';
import { IsruWarningsComponent } from './components/isru-warnings/isru-warnings.component';
import { MiningBaseControlComponent } from './components/mining-base-control/mining-base-control.component';
import { PartsSelectorComponent } from './components/parts-selector/parts-selector.component';

@Component({
  selector: 'cp-page-mining-station',
  standalone: true,
  imports: [
    CommonModule,
    HudComponent,
    ReactiveFormsModule,
    PartsSelectorComponent,
    CraftPartStatisticsComponent,
    MiningBaseControlComponent,
    IsruWarningsComponent,
  ],
  providers: [
    HudService,
    MiningBaseService,
    IsruStateService,
  ],
  templateUrl: './page-mining-station.component.html',
  styleUrls: ['./page-mining-station.component.scss'],
})
export default class PageMiningStationComponent extends WithDestroy() implements OnDestroy {

  icons = Icons;
  contextPanelDetails: ActionPanelDetails;
  selectedParts$: Observable<Group<CraftPart>[]>;
  // state = {
  //   craftPartGroups: [],
  //   oreConcentration: 5,
  //   engineerBonus: engineerBonusMap.get(-1),
  // };

  craftPartGroups$ = this.miningBaseService.craftPartGroups$;
  oreConcentration$ = this.miningBaseService.oreConcentration$;
  engineerBonus$ = this.miningBaseService.engineerBonus$;

  constructor(
    private miningBaseService: MiningBaseService,
    private isruStateService: IsruStateService,
    private authService: AuthService,
  ) {
    super();

    this.contextPanelDetails = this.getContextPanelDetails();

    merge(
      this.authService.user$.pipe(take(1)),
      this.authService.signIn$)
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => this.isruStateService.handleUserSingIn(u));
  }

  private getContextPanelDetails(): ActionPanelDetails {
    let options = [
      new ActionOption(
        'Share Link',
        Icons.Share,
        {
          action: () => {
            console.log('Resetting all inputs');
          },
        },
      ),
      new ActionOption(
        'Manage Savegame',
        Icons.Save,
        {
          action: () => {
            console.log('Resetting all inputs');
          },
        },
      ),
      new ActionOption(
        'Save',
        Icons.Save,
        {
          action: async () => {
            await this.isruStateService.saveState(this.isruStateService.stateRow);
          },
        },
      ),
      new ActionOption(
        'Reset All',
        Icons.DeleteAll,
        {
          action: () => {
            console.log('Resetting all inputs');
            this.miningBaseService.buildState()
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          },
        },
      ),
    ];

    return {
      startTitle: 'Mining Station',
      startIcon: Icons.OpenDetails,
      color: 'orange',
      options,
    };
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.miningBaseService.destroy();
  }

}
