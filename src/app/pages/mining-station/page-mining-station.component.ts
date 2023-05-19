import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  merge,
  take,
  takeUntil,
} from 'rxjs';
import { GameStateType } from '../../common/domain/game-state-type';
import { Icons } from '../../common/domain/icons';
import { WithDestroy } from '../../common/with-destroy';
import { InputSectionSelectionListComponent } from '../../components/controls/input-section-selection-list/input-section-selection-list.component';
import { ActionPanelDetails } from '../../components/hud/action-panel-details';
import { HudComponent } from '../../components/hud/hud.component';
import { AuthService } from '../../services/auth.service';
import { HudService } from '../../services/hud.service';
import { CraftPartStatisticsComponent } from './components/craft-part-statistics/craft-part-statistics.component';
import { IsruWarningsComponent } from './components/isru-warnings/isru-warnings.component';
import { MiningBaseControlComponent } from './components/mining-base-control/mining-base-control.component';
import { PartsSelectorComponent } from './components/parts-selector/parts-selector.component';
import { AUTO_SAVE_INTERVAL } from './domain/config';
import { IsruStateService } from './services/isru-state.service';
import { MiningBaseService } from './services/mining-base.service';

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
        InputSectionSelectionListComponent,
    ],
  providers: [
    HudService,
    MiningBaseService,
    IsruStateService,
    {provide: AUTO_SAVE_INTERVAL, useValue: 10e3},
  ],
  templateUrl: './page-mining-station.component.html',
  styleUrls: ['./page-mining-station.component.scss'],
})
export default class PageMiningStationComponent extends WithDestroy() implements OnDestroy {

  icons = Icons;
  contextPanelDetails: ActionPanelDetails;

  constructor(
    private miningBaseService: MiningBaseService,
    private isruStateService: IsruStateService,
    private authService: AuthService,
    private hudService: HudService,
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
      this.hudService.createActionOptionManageSaveGames(ref => {
          let component = ref.componentInstance;
          component.context = GameStateType.Isru;
          component.contextTitle = 'Mining Station Planner';
          component.stateHandler = this.isruStateService;
        },
      ),
      this.hudService.createActionResetPage(
        'This will reset configurations and remove the selected parts',
        async () => {
          await this.miningBaseService.buildState();
          await this.isruStateService.save();
        }),
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
