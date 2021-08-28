import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Icons } from '../../common/domain/icons';
import { AnalyticsService} from '../../services/analytics.service';
import { MatDialog } from '@angular/material/dialog';
import { AccountDialogComponent } from '../../overlays/account-dialog/account-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { WithDestroy } from '../../common/with-destroy';
import { EventLogs } from '../../services/event-logs';

@Component({
  selector: 'cp-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent extends WithDestroy() {

  icons = Icons;

  constructor(public authService: AuthService,
              private analyticsService: AnalyticsService,
              private dialog: MatDialog) {
    super();
  }

  openAccountDialog() {
    this.analyticsService.logEvent('Call account dialog', {
      category: EventLogs.Category.Account,
    });

    this.dialog.open(AccountDialogComponent)
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

}
