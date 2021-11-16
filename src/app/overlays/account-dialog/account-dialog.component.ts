import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'cp-account-dialog',
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss'],
})
export class AccountDialogComponent {

  constructor(private dialogRef: MatDialogRef<AccountDialogComponent>) {
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
