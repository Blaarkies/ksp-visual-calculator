import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { CraftDetailsDialogComponent, CraftDetailsDialogData } from '../../dialogs/craft-details-dialog/craft-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, takeUntil, takeWhile } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogPosition } from '@angular/material/dialog/dialog-config';
import { SpaceObjectService } from '../../services/space-object.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'cp-edit-universe-action-panel',
  templateUrl: './edit-universe-action-panel.component.html',
  styleUrls: ['./edit-universe-action-panel.component.scss'],
})
export class EditUniverseActionPanelComponent implements OnDestroy {

  actions: ActionOption[];
  unsubscribe$ = new Subject();

  constructor(dialog: MatDialog,
              spaceObjectService: SpaceObjectService,
              cdr: ChangeDetectorRef,
              snackBar: MatSnackBar) {
    this.actions = [
      new ActionOption('New Craft', Icons.Craft, {
        action: () => {
          dialog.open(CraftDetailsDialogComponent, {
            data: {
              forbiddenNames: spaceObjectService.crafts$.value.map(c => c.label),
            } as CraftDetailsDialogData,
          })
            .afterClosed()
            .pipe(
              filter(craftDetails => craftDetails),
              takeUntil(this.unsubscribe$))
            .subscribe(craftDetails => {
              spaceObjectService.addCraftToUniverse(craftDetails);
              cdr.markForCheck();
            });
        },
      }),
      new ActionOption('New Celestial Body', Icons.Planet, {
        action: () => {
          snackBar.open('Adding moons, planets, and stars are coming soon!');
        },
      }),
    ];
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
