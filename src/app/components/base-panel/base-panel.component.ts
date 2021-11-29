import { Component } from '@angular/core';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { Icons } from '../../common/domain/icons';
import { AuthService } from '../../services/auth.service';
import { WithDestroy } from '../../common/with-destroy';
import { Subject, timer } from 'rxjs';
import { filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { BuyMeACoffeeDialogComponent } from '../../overlays/buy-me-a-coffee-dialog/buy-me-a-coffee-dialog.component';

@Component({
  selector: 'cp-base-panel',
  templateUrl: './base-panel.component.html',
  styleUrls: ['./base-panel.component.scss'],
  animations: [CustomAnimation.height],
})
export class BasePanelComponent extends WithDestroy() {

  isOpen = false;
  icons = Icons;
  unsubscribePanel$ = new Subject();

  constructor(private authService: AuthService,
              private dialog: MatDialog) {
    super();

    timer(40e3)
      .pipe(
        take(1),
        filter(() => !this.isOpen),
        switchMap(() => authService.user$),
        filter(u => !u?.isCustomer),
        takeUntil(this.destroy$),
        takeUntil(this.unsubscribePanel$))
      .subscribe(() => this.isOpen = true);

    authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(u => {
        if (u?.isCustomer) {
          this.isOpen = false;
          this.unsubscribePanel$.next();
        } else {
          this.closePanel();
        }
      });
  }

  closePanel() {
    this.isOpen = false;
    this.unsubscribePanel$.next();

    timer(60e3)
      .pipe(
        take(1),
        filter(() => !this.isOpen),
        switchMap(() => this.authService.user$),
        filter(u => !u?.isCustomer),
        takeUntil(this.destroy$),
        takeUntil(this.unsubscribePanel$))
      .subscribe(() => this.isOpen = true);
  }

  openCoffeeDialog() {
    this.dialog.open(BuyMeACoffeeDialogComponent)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

}
