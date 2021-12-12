import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent, SimpleDialogData } from './overlays/simple-dialog/simple-dialog.component';
import { WithDestroy } from './common/with-destroy';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { TutorialService } from './services/tutorial.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';
import { HudService } from './services/hud.service';
import { AccountDialogComponent } from './overlays/account-dialog/account-dialog.component';
import { GlobalStyleClass } from './common/global-style-class';

let localStorageKeyFirstVisitDeprecated = 'ksp-visual-calculator-first-visit';
let localStorageKeyTutorialViewed = 'ksp-visual-calculator-tutorial-viewed';

@Component({
  selector: 'cp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends WithDestroy() implements OnInit {

  constructor(private dialog: MatDialog,
              private tutorialService: TutorialService,
              private snackBar: MatSnackBar,
              private authService: AuthService,
              private hudService: HudService) {
    super();

    this.authService
      .user$
      .pipe(
        take(1),
        filter(user => user === null),
        takeUntil(this.destroy$))
      .subscribe(() => this.dialog.open(AccountDialogComponent,
        {backdropClass: GlobalStyleClass.MobileFriendly}));
  }

  ngOnInit() {
    if (!localStorage.getItem(localStorageKeyFirstVisitDeprecated)) {
      localStorage.setItem(localStorageKeyFirstVisitDeprecated, true.toString());
      this.triggerFirstVisitDialog();
    }
  }

  private triggerFirstVisitDialog() {
    this.dialog.open(SimpleDialogComponent, {
      disableClose: true,
      data: {
        title: 'First Visit?',
        descriptions: [
          'There is an orange quick-help button in the top-left corner that can explain the control scheme.',
          'You can start a detailed tutorial now, or if you prefer later, you can find it in the blue "Information" menu.',
          'This is a tool to help players visualize and solve their ideas in Kerbal Space Program. ',
        ],
        okButtonText: 'Start Tutorial',
        cancelButtonText: 'Skip',
        focusOk: true,
      } as SimpleDialogData,
    })
      .afterClosed()
      .pipe(
        tap(ok => !ok && this.snackBar.open('Check out the control scheme by clicking the orange help button',
          null, {duration: 15e3})),
        filter(ok => ok),
        takeUntil(this.destroy$))
      .subscribe(() => {
        localStorage.setItem(localStorageKeyTutorialViewed, true.toString());
        this.tutorialService.startFullTutorial(this.hudService.pageContext);
      });
  }
}
