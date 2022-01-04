import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WithDestroy } from './common/with-destroy';
import { filter, Subject, takeUntil, timer } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { PolicyDialogComponent } from './overlays/policy-dialog/policy-dialog.component';
import { FeedbackDialogComponent } from './overlays/feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'cp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends WithDestroy() implements OnDestroy {

  showHolidayTheme = false;
  unsubscribeHoliday$ = new Subject<void>();

  constructor(dialog: MatDialog,
              router: Router,
              cdr: ChangeDetectorRef) {
    super();

    let specialRoutes = {
      '/policy': () => dialog.open(PolicyDialogComponent),
      '/feedback': () => dialog.open(FeedbackDialogComponent),
    };

    router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$))
      .subscribe((e: NavigationEnd) => specialRoutes[e.url]?.());

    timer(30e3, 300e3)
      .pipe(
        takeUntil(this.unsubscribeHoliday$),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.showHolidayTheme = false;
        cdr.detectChanges();
        this.showHolidayTheme = true;
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.unsubscribeHoliday$.next();
    this.unsubscribeHoliday$.complete();
  }

}
