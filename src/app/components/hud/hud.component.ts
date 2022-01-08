import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { HudService } from '../../services/hud.service';
import { AnalyticsService } from '../../services/analytics.service';
import { FaqDialogComponent, FaqDialogData } from '../../overlays/faq-dialog/faq-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CameraService } from '../../services/camera.service';
import { WithDestroy } from '../../common/with-destroy';
import { firstValueFrom, map, Observable, take, takeUntil } from 'rxjs';
import { ActionPanelColors } from '../action-panel/action-panel.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import {
  ActionBottomSheetComponent,
  ActionBottomSheetData
} from '../../overlays/list-bottom-sheet/action-bottom-sheet.component';
import { GlobalStyleClass } from '../../common/global-style-class';
import { EventLogs } from '../../services/event-logs';
import { UsableRoutes } from '../../usable-routes';
import { BuyMeACoffeeDialogComponent } from '../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { AuthService } from '../../services/auth.service';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { DomPortal } from '@angular/cdk/portal';
import { ThemeService, ThemeTypeEnum } from '../../services/theme.service';

export class ActionPanelDetails {
  startTitle?: string;
  color: ActionPanelColors;
  startIcon: Icons;
  options: ActionOption[];
}

export class ActionGroupType {
  static General = 'general';
  static Information = 'information';
  static Context = 'context';
}

@Component({
  selector: 'cp-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.scss'],
  animations: [CustomAnimation.fade],
})
export class HudComponent extends WithDestroy() implements AfterViewInit {

  navigationOptions = this.hudService.navigationOptions;
  infoOptions = this.hudService.infoOptions;

  get contextPanel$(): Observable<ActionPanelDetails> {
    return this.hudService.contextPanel$.asObservable();
  }

  context$ = this.hudService.context$;
  contextTypes = UsableRoutes;

  isHandset$: Observable<boolean>;
  icons = Icons;
  actionGroupTypes = ActionGroupType;
  cameraZoomLimits = CameraService.zoomLimits;
  scaleToShowMoons = CameraService.scaleToShowMoons;
  pageContextInfo: { icon, tooltip };
  hasBoughtCoffee$ = this.auth.user$.pipe(map(u => u?.isCustomer));

  lastTheme: string;
  themeIconMap = {
    [ThemeTypeEnum.Light]: Icons.ThemeLight,
    [ThemeTypeEnum.Dark]: Icons.ThemeDark,
  };

  @ViewChild('baseContent') baseContent: ElementRef<HTMLElement>;
  domPortal: DomPortal;

  get scale(): number {
    return this.cameraService.scale;
  }

  constructor(private hudService: HudService,
              private analyticsService: AnalyticsService,
              private auth: AuthService,
              private dialog: MatDialog,
              private cameraService: CameraService,
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

    let contextVisualMap = {
      [UsableRoutes.DvPlanner]: {
        icon: Icons.DeltaV,
        tooltip: 'This page handles Delta-v calculations, click the green menu for others',
      },
      [UsableRoutes.SignalCheck]: {
        icon: Icons.Relay,
        tooltip: 'This page handles CommNet calculations, click the green menu for others',
      }
    };

    hudService.pageContextChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(context => this.pageContextInfo = contextVisualMap[context]);
  }

  ngAfterViewInit() {
    this.domPortal = new DomPortal(this.baseContent);
    this.cdr.detectChanges();
  }

  toggleTheme() {
    this.lastTheme = this.themeService.toggleTheme();
  }

  openFaq() {
    this.analyticsService.logEvent('Open faq dialog', {
      category: EventLogs.Category.Help,
    });

    this.dialog.open(FaqDialogComponent, {
      data: {} as FaqDialogData,
      backdropClass: GlobalStyleClass.MobileFriendly,
    });
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
        let panel = await firstValueFrom(this.contextPanel$);
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
