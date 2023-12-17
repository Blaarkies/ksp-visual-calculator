import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  firstValueFrom,
  map,
  Observable,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { Icons } from '../../common/domain/icons';
import { NegatePipe } from '../../common/negate.pipe';
import { WithDestroy } from '../../common/with-destroy';
import {
  ActionBottomSheetComponent,
  ActionBottomSheetData,
} from '../../overlays/list-bottom-sheet/action-bottom-sheet.component';
import { HudService } from '../../services/hud.service';
import { UserProfileComponent } from '../account/user-profile/user-profile.component';
import { ActionFabComponent } from './action-fab/action-fab.component';
import { ActionGroupType } from './action-group-type';
import { ActionPanelDetails } from './action-panel-details';
import { ActionPanelComponent } from './action-panel/action-panel.component';

@Component({
  selector: 'cp-hud',
  standalone: true,
  imports: [
    CommonModule,
    ActionFabComponent,
    ActionPanelComponent,
    UserProfileComponent,
    NegatePipe,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBottomSheetModule,
  ],
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss'],
  animations: [BasicAnimations.fade],
})
export class HudComponent extends WithDestroy() {

  @Input() tooltip: string;
  @Input() icon: string;
  @Input() contextPanelDetails: ActionPanelDetails;

  navigationOptions = this.hudService.navigationOptions;
  infoOptions = this.hudService.infoOptions;

  isHandset$: Observable<boolean>;
  icons = Icons;
  actionGroupTypes = ActionGroupType;

  constructor(private hudService: HudService,
              breakpointObserver: BreakpointObserver,
              private bottomSheet: MatBottomSheet) {
    super();

    this.isHandset$ = breakpointObserver.observe([
      '(max-width: 600px)',
      '(max-height: 800px)',
    ])
      .pipe(map(bp => bp.matches));
  }

  async openBottomSheet(group: ActionGroupType, updateUnreadCountCallback: () => void) {
    let result: MatBottomSheetRef;
    switch (group) {
      case ActionGroupType.General:
        result = await this.bottomSheet.open(ActionBottomSheetComponent, {
          data: {
            startTitle: 'KSP Visual Calculator',
            actionOptions: this.navigationOptions,
          } as ActionBottomSheetData,
          panelClass: ['bottom-sheet-panel', 'green'],
        });
        break;
      case ActionGroupType.Information:
        result = await this.bottomSheet.open(ActionBottomSheetComponent, {
          data: {
            startTitle: 'Account',
            actionOptions: this.infoOptions,
          } as ActionBottomSheetData,
          panelClass: ['bottom-sheet-panel', 'cosmic-blue'],
        });
        break;
      case ActionGroupType.Context:
        let panel = this.contextPanelDetails;
        result = await this.bottomSheet.open(ActionBottomSheetComponent, {
          data: {
            startTitle: panel.startTitle,
            actionOptions: panel.options,
          } as ActionBottomSheetData,
          panelClass: ['bottom-sheet-panel', 'orange'],
        });
        break;
      default:
        throw new Error(`No bottom-sheet defined for "${group}"`);
    }

    await firstValueFrom(result?.afterDismissed());

    updateUnreadCountCallback();
  }

}
