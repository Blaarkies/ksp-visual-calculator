import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Icons } from '../../common/domain/icons';
import { AnalyticsService } from '../../services/analytics.service';
import { MatDialog } from '@angular/material/dialog';
import { AccountDialogComponent } from '../../overlays/account-dialog/account-dialog.component';
import { WithDestroy } from '../../common/with-destroy';
import { EventLogs } from '../../services/domain/event-logs';
import { GlobalStyleClass } from '../../common/global-style-class';
import { BasicAnimations } from '../../animations/basic-animations';
import { CommonModule } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'cp-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatRippleModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  animations: [BasicAnimations.fade],
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

    this.dialog.open(AccountDialogComponent, {backdropClass: GlobalStyleClass.MobileFriendly});
  }

}
