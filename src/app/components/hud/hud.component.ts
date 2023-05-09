import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  firstValueFrom,
  map,
  Observable,
  of,
} from 'rxjs';
import { BasicAnimations } from '../../animations/basic-animations';
import { Icons } from '../../common/domain/icons';
import { NegatePipe } from '../../common/negate.pipe';
import { WithDestroy } from '../../common/with-destroy';
import { BuyMeACoffeeDialogComponent } from '../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import {
  ActionBottomSheetComponent,
  ActionBottomSheetData,
} from '../../overlays/list-bottom-sheet/action-bottom-sheet.component';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { EventLogs } from '../../services/domain/event-logs';
import { HudService } from '../../services/hud.service';
import {
  ThemeService,
  ThemeTypeEnum,
} from '../../services/theme.service';
import { ActionPanelComponent } from './action-panel/action-panel.component';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { ActionFabComponent } from './action-fab/action-fab.component';
import { ActionGroupType } from './action-group-type';
import { ActionPanelDetails } from './action-panel-details';

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
  // encapsulation: ViewEncapsulation.None,
  animations: [BasicAnimations.fade],
})
export class HudComponent extends WithDestroy() implements AfterViewInit {

  @Input() tooltip: string;
  @Input() icon: string;
  @Input() contextPanelDetails: ActionPanelDetails;

  navigationOptions = this.hudService.navigationOptions;
  infoOptions = this.hudService.infoOptions;

  isHandset$: Observable<boolean>;
  icons = Icons;
  actionGroupTypes = ActionGroupType;
  hasBoughtCoffee$ = this.auth.user$.pipe(map(u => u?.isCustomer));

  lastTheme: string;
  themeIconMap = {
    [ThemeTypeEnum.Light]: Icons.ThemeLight,
    [ThemeTypeEnum.Dark]: Icons.ThemeDark,
  };

  constructor(private hudService: HudService,
              private analyticsService: AnalyticsService,
              private auth: AuthService,
              private dialog: MatDialog,
              breakpointObserver: BreakpointObserver,
              private bottomSheet: MatBottomSheet,
              private cdr: ChangeDetectorRef,
              private themeService: ThemeService) {
    super();

    this.lastTheme = themeService.currentTheme;

    this.isHandset$ = breakpointObserver.observe([
      '(max-width: 600px)',
      '(max-height: 800px)',
    ])
      .pipe(map(bp => bp.matches));
  }

  ngAfterViewInit() {
    // this.cdr.detectChanges();
  }

  toggleTheme() {
    this.lastTheme = this.themeService.toggleTheme();
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
            startTitle: 'Information',
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

  openBuyMeACoffee() {
    this.analyticsService.logEvent('Call coffee dialog from hud', {
      category: EventLogs.Category.Coffee,
    });

    this.dialog.open(BuyMeACoffeeDialogComponent);
  }

}
