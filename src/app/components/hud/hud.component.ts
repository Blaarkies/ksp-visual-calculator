import { Component } from '@angular/core';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { HudService } from '../../services/hud.service';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { FaqDialogComponent, FaqDialogData } from '../../overlays/faq-dialog/faq-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CameraService } from '../../services/camera.service';
import { WithDestroy } from '../../common/with-destroy';
import { Observable, of } from 'rxjs';
import { ActionPanelColors } from '../action-panel/action-panel.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, take } from 'rxjs/operators';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActionBottomSheetComponent, ActionBottomSheetData } from '../../overlays/list-bottom-sheet/action-bottom-sheet.component';

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
})
export class HudComponent extends WithDestroy() {

  navigationOptions: ActionOption[];
  infoOptions: ActionOption[];

  get contextPanel$(): Observable<ActionPanelDetails> {
    return this.hudService.contextPanel$.asObservable();
  }

  isHandset$: Observable<boolean>;
  icons = Icons;
  actionGroupTypes = ActionGroupType;
  cameraZoomLimits = CameraService.zoomLimits;
  scaleToShowMoons = CameraService.scaleToShowMoons;

  get scale(): number {
    return this.cameraService.scale;
  }

  constructor(private hudService: HudService,
              private analyticsService: AnalyticsService,
              private dialog: MatDialog,
              private cameraService: CameraService,
              breakpointObserver: BreakpointObserver,
              private bottomSheet: MatBottomSheet) {
    super();

    this.navigationOptions = hudService.navigationOptions;
    this.infoOptions = hudService.infoOptions;

    this.isHandset$ = breakpointObserver.observe([
      '(max-width: 600px)',
      '(max-height: 800px)',
    ])
      .pipe(map(bp => bp.matches));
  }

  openFaq() {
    this.analyticsService.logEvent('Open faq dialog', {
      category: EventLogs.Category.Help,
    });

    this.dialog.open(FaqDialogComponent, {
      data: {} as FaqDialogData,
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
        let panel = await this.contextPanel$.pipe(take(1)).toPromise();
        result = await this.bottomSheet.open(ActionBottomSheetComponent, {
          data: {
            startTitle: panel.startTitle,
            actionOptions: panel.options,
          } as ActionBottomSheetData,
          panelClass: ['bottom-sheet-panel', 'orange'],
        }).afterDismissed().toPromise();
        break;
      default:
        throw console.error(`No bottom-sheet defined for "${group}"`);
    }

    await result?.afterDismissed()?.toPromise();

    updateUnreadCountCallback();
  }

}
