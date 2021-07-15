import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UsableRoutes } from './usable-routes';
import { Icons } from './common/domain/icons';
import { ActionOption } from './common/domain/action-option';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent, SimpleDialogData } from './dialogs/simple-dialog/simple-dialog.component';
import { WithDestroy } from './common/with-destroy';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { TutorialService } from './services/tutorial.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';
import { AccountDialogComponent } from './dialogs/account-dialog/account-dialog.component';

@Component({
  selector: 'cp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent extends WithDestroy() implements OnInit {

  routes = UsableRoutes;
  pages: ActionOption[] = [
    new ActionOption(
      'Signal Check',
      Icons.PlanetSearch,
      {route: UsableRoutes.SignalCheck},
      'Page that calculates CommNet ranges'),
    new ActionOption(
      'Source Code - GitHub',
      Icons.SourceCode,
      {externalRoute: 'https://github.com/Blaarkies/ksp-commnet-planner'}),
    new ActionOption(
      'Blaarkies Hub',
      Icons.Blaarkies,
      {externalRoute: 'https://blaarkies.com/'},
      'More tools made by Blaarkies'),
  ];

  constructor(private dialog: MatDialog,
              private tutorialService: TutorialService,
              private snackBar: MatSnackBar,
              private authService: AuthService) {
    super();

    this.authService
      .user$
      .pipe(
        filter(user => user === null),
        take(1),
        takeUntil(this.destroy$))
      .subscribe(() => this.dialog.open(AccountDialogComponent));
  }

  ngOnInit() {
    let showFirstVisitDialog = () => {
      if (!localStorage.getItem('ksp-commnet-planner-first-visit')) {
        localStorage.setItem('ksp-commnet-planner-first-visit', true.toString());
        this.triggerFirstVisitDialog();
      }
    };

    // x912:y528 , minimum screen size to use the app
    if (window.innerWidth < 912
      || window.innerHeight < 528) {
      this.triggerUnsupportedScreenSizeDialog()
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => showFirstVisitDialog());
      return;
    }

    showFirstVisitDialog();
  }

  private triggerUnsupportedScreenSizeDialog(): Observable<void> {
    return this.dialog.open(SimpleDialogComponent, {
      disableClose: true,
      data: {
        title: 'Beta Support for Device',
        descriptions: [
          'The detected screen size indicates a mobile device.',
          'Touch screen control is in beta support currently, and some features may not function as intended.',
          'Please provide feedback if you find issues. The feedback form can be found under the "Information" menu -> "Feedback"',
        ],
        okButtonText: 'Continue',
        cancelButtonText: null,
      } as SimpleDialogData,
    })
      .afterClosed();
  }

  private triggerFirstVisitDialog() {
    this.dialog.open(SimpleDialogComponent, {
      disableClose: true,
      data: {
        title: 'First Visit?',
        descriptions: [
          'There is an orange quick-help button in the top-left corner that can explain the control scheme.',
          'You can start a detailed tutorial now, or if you prefer later, you can find it in the "Information" menu in the top-right corner.',
          'This is a tool to help players visualize their communication networks in Kerbal Space Program. Players can plan the details around a CommNet before even launching their first rocket.',
        ],
        okButtonText: 'Start Tutorial',
        cancelButtonText: 'Skip',
        focusOk: true,
      } as SimpleDialogData,
    })
      .afterClosed()
      .pipe(
        tap(ok => {
          if (!ok) {
            this.snackBar.open('Check out the control scheme by clicking the orange help button', null, {duration: 15e3});
          }
        }),
        filter(ok => ok),
        takeUntil(this.destroy$))
      .subscribe(() => this.tutorialService.startFullTutorial());
  }
}
