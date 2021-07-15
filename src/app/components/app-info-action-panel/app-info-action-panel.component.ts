import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { SimpleDialogComponent, SimpleDialogData } from '../../dialogs/simple-dialog/simple-dialog.component';
import { PrivacyDialogComponent } from '../../dialogs/privacy-dialog/privacy-dialog.component';
import { CreditsDialogComponent } from '../../dialogs/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../../dialogs/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { FeedbackDialogComponent } from '../../dialogs/feedback-dialog/feedback-dialog.component';
import { filter, takeUntil } from 'rxjs/operators';
import { TutorialService } from '../../services/tutorial.service';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';

@Component({
  selector: 'cp-app-info-action-panel',
  templateUrl: './app-info-action-panel.component.html',
  styleUrls: ['./app-info-action-panel.component.scss'],
})
export class AppInfoActionPanelComponent extends WithDestroy() {

  infoOptions: ActionOption[];

  constructor(snackBar: MatSnackBar,
              dialog: MatDialog,
              tutorialService: TutorialService,
              analyticsService: AnalyticsService) {
    super();

  }

}
