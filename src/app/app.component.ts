import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SimpleDialogComponent, SimpleDialogData } from './overlays/simple-dialog/simple-dialog.component';
import { WithDestroy } from './common/with-destroy';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { TutorialService } from './services/tutorial.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';
import { AccountDialogComponent } from './overlays/account-dialog/account-dialog.component';

@Component({
  selector: 'cp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent extends WithDestroy() implements OnInit {

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
    if (!localStorage.getItem('ksp-commnet-planner-first-visit')) {
      localStorage.setItem('ksp-commnet-planner-first-visit', true.toString());
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
        tap(ok => !ok && this.snackBar.open('Check out the control scheme by clicking the orange help button',
          null, {duration: 15e3})),
        filter(ok => ok),
        takeUntil(this.destroy$))
      .subscribe(() => {
        localStorage.setItem('ksp-commnet-planner-tutorial-viewed', true.toString());
        this.tutorialService.startFullTutorial();
      });
  }
}
