import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export class SimpleDialogData {
  title: string;
  descriptions: string[];
  cancelButtonText: string;
  okButtonText: string;
}

@Component({
  selector: 'cp-simple-dialog',
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.scss'],
})
export class SimpleDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: SimpleDialogData) {
  }

}
