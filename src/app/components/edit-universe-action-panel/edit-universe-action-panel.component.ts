import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { CraftDetailsDialogComponent, CraftDetailsDialogData } from '../../dialogs/craft-details-dialog/craft-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SpaceObjectService } from '../../services/space-object.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DifficultySettingsDialogComponent } from '../../dialogs/difficulty-settings-dialog/difficulty-settings-dialog.component';
import { SetupService } from '../../services/setup.service';
import { AnalyticsService, EventLogs } from '../../services/analytics.service';
import { WithDestroy } from '../../common/withDestroy';

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
              analyticsService: AnalyticsService) {
    super();

    this.actions = [
      new ActionOption('New Craft', Icons.Craft, {
        action: () => {
          analyticsService.logEvent('Call new craft dialog', {
            category: EventLogs.Category.Craft,
          });

          dialog.open(CraftDetailsDialogComponent, {
            data: {
              forbiddenNames: spaceObjectService.crafts$.value.map(c => c.label),
            } as CraftDetailsDialogData,
          })
            .afterClosed()
            .pipe(
              filter(craftDetails => craftDetails),
              takeUntil(this.destroy$))
            .subscribe(craftDetails => {
              spaceObjectService.addCraftToUniverse(craftDetails);
              cdr.markForCheck();
            });
        },
      }),
      new ActionOption('New Celestial Body', Icons.Planet, {
        action: () => {
          analyticsService.logEvent('Call new celestial body dialog', {
            category: EventLogs.Category.CelestialBody,
          });

          snackBar.open('Adding moons, planets, and stars are coming soon!');
        },
      }),
      new ActionOption('Difficulty Settings', Icons.Difficulty, {
        action: () => {
          analyticsService.logEvent('Call difficulty settings dialog', {
            category: EventLogs.Category.Difficulty,
          });

          dialog.open(DifficultySettingsDialogComponent,
            {data: setupService.difficultySetting})
            .afterClosed()
            .pipe(
              filter(details => details),
              takeUntil(this.destroy$))
            .subscribe(details => {
              setupService.updateDifficultySetting(details);
              cdr.markForCheck();
              // todo: refresh universe, because 0 strength transmission lines are still visible
            });
        },
      }),
    ];
  }

}
