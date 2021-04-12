import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { SimpleDialogComponent, SimpleDialogData } from '../../dialogs/simple-dialog/simple-dialog.component';
import { PrivacyDialogComponent } from '../../dialogs/privacy-dialog/privacy-dialog.component';
import { AccountDialogComponent } from '../../dialogs/account-dialog/account-dialog.component';
import { CreditsDialogComponent } from '../../dialogs/credits-dialog/credits-dialog.component';
import { BuyMeACoffeeDialogComponent } from '../../dialogs/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';
import { FeedbackDialogComponent } from '../../dialogs/feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'cp-app-info-action-panel',
  templateUrl: './app-info-action-panel.component.html',
  styleUrls: ['./app-info-action-panel.component.scss'],
})
export class AppInfoActionPanelComponent {

  infoOptions: ActionOption[];

  constructor(snackBar: MatSnackBar, dialog: MatDialog) {
    this.infoOptions = [
      new ActionOption('Tutorial', Icons.Help, {
          action: () => {
            dialog.open(SimpleDialogComponent, {
              data: {
                title: 'Start Tutorial',
                descriptions: [
                  'Do you want to start the tutorial?',
                  'This will take you through all the features and controls to navigate and use this application.',
                ],
                okButtonText: 'Start',
              } as SimpleDialogData,
            })
              .afterClosed()
              .pipe()
              .subscribe();
          },
        },
        true),
      new ActionOption('Privacy', Icons.Analytics, {
          action: () => {
            dialog.open(PrivacyDialogComponent)
              .afterClosed()
              .pipe()
              .subscribe();
          },
        },
        true),
      new ActionOption('Account', Icons.AccountSettings, {
        action: () => {
          dialog.open(AccountDialogComponent)
            .afterClosed()
            .pipe()
            .subscribe();
        },
      }),
      new ActionOption('Credits', Icons.Credits, {
        action: () => {
          dialog.open(CreditsDialogComponent)
            .afterClosed()
            .pipe()
            .subscribe();
        },
      }),
      new ActionOption('Buy me a Coffee', Icons.Coffee, {
        action: () => {
          dialog.open(BuyMeACoffeeDialogComponent)
            .afterClosed()
            .pipe()
            .subscribe();
        },
      }),
      new ActionOption('Feedback', Icons.Feedback, {
        action: () => {
          dialog.open(FeedbackDialogComponent)
            .afterClosed()
            .pipe()
            .subscribe();
        },
      }),
    ];
  }

}
