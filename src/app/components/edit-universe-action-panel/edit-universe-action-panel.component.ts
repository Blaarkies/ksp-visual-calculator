import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { CraftDetailsDialogComponent, CraftDetailsDialogData } from '../../dialogs/craft-details-dialog/craft-details-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogPosition } from '@angular/material/dialog/dialog-config';

@Component({
  selector: 'cp-edit-universe-action-panel',
  templateUrl: './edit-universe-action-panel.component.html',
  styleUrls: ['./edit-universe-action-panel.component.scss'],
})
export class EditUniverseActionPanelComponent implements OnInit, OnDestroy {

  actions: ActionOption[];
  unsubscribe$ = new Subject();

  constructor(dialog: MatDialog) {
    this.actions = [
      new ActionOption('New Craft', Icons.Craft, () => {
        dialog.open(CraftDetailsDialogComponent, {
          data: {} as CraftDetailsDialogData,
          position: {left: '10px'} as DialogPosition,
        })
          .afterClosed()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(result => {
            console.log(result);
          });
      }),
    ];
  }

  ngOnInit(): void {
    this.actions[0].action();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
