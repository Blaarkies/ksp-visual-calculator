import { ChangeDetectorRef, Component } from '@angular/core';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { CraftDetailsDialogComponent, CraftDetailsDialogData } from '../../dialogs/craft-details-dialog/craft-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, map, startWith, takeUntil } from 'rxjs/operators';
import { SpaceObjectService } from '../../services/space-object.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DifficultySettingsDialogComponent } from '../../dialogs/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { SetupService } from '../../services/setup.service';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { WithDestroy } from '../../common/with-destroy';
import { ManageStateDialogComponent, ManageStateDialogData } from '../../dialogs/manage-state-dialog/manage-state-dialog.component';
import { UsableRoutes } from '../../usable-routes';
import { AuthService } from '../../services/auth.service';
import { AccountDialogComponent } from '../../dialogs/account-dialog/account-dialog.component';

@Component({
  selector: 'cp-edit-universe-action-panel',
  templateUrl: './edit-universe-action-panel.component.html',
  styleUrls: ['./edit-universe-action-panel.component.scss'],
})
export class EditUniverseActionPanelComponent extends WithDestroy() {

  actions: ActionOption[];

  constructor(dialog: MatDialog,
              spaceObjectService: SpaceObjectService,
              setupService: SetupService,
              cdr: ChangeDetectorRef,
              snackBar: MatSnackBar,
              analyticsService: AnalyticsService,
              authService: AuthService) {
    super();

  }

}
