import { Component } from '@angular/core';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { HudService } from '../../services/hud.service';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { FaqDialogComponent, FaqDialogData } from '../../dialogs/faq-dialog/faq-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CameraService } from '../../services/camera.service';
import { WithDestroy } from '../../common/with-destroy';
import { Observable } from 'rxjs';
import { ActionPanelColors } from '../action-panel/action-panel.component';

export class ActionPanelDetails {
  startTitle?: string;
  color: ActionPanelColors;
  startIcon: Icons;
  options: ActionOption[];
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

  icons = Icons;
  cameraZoomLimits = CameraService.zoomLimits;
  scaleToShowMoons = CameraService.scaleToShowMoons;

  get scale(): number {
    return this.cameraService.scale;
  }

  constructor(private hudService: HudService,
              private analyticsService: AnalyticsService,
              private dialog: MatDialog,
              private cameraService: CameraService) {
    super();

    this.navigationOptions = hudService.navigationOptions;
    this.infoOptions = hudService.infoOptions;
  }

  openFaq() {
    this.analyticsService.logEvent('Open faq dialog', {
      category: EventLogs.Category.Help,
    });

    this.dialog.open(FaqDialogComponent, {
      data: {} as FaqDialogData,
    });
  }


}
