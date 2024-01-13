import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BasicAnimations } from '../../../animations/basic-animations';
import { Icons } from '../../../common/domain/icons';
import { GlobalStyleClass } from '../../../common/global-style-class';
import { AccountDialogComponent } from '../../../overlays/account-dialog/account-dialog.component';
import { AnalyticsService } from '../../../services/analytics.service';
import { AuthService } from '../../../services/auth.service';
import { EventLogs } from '../../../services/domain/event-logs';

@Component({
  selector: 'cp-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  animations: [BasicAnimations.fade],
})
export class UserProfileComponent {

  icons = Icons;
  user$ = this.authService.user$;

  constructor(private authService: AuthService,
              private analyticsService: AnalyticsService,
              private dialog: MatDialog) {
  }

  openAccountDialog() {
    this.analyticsService.logEvent('Call account dialog', {
      category: EventLogs.Category.Account,
    });

    this.dialog.open(AccountDialogComponent, {backdropClass: GlobalStyleClass.MobileFriendly});
  }

}
