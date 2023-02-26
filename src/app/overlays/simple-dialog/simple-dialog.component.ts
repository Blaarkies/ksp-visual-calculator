import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";

export class SimpleDialogData {
  title: string;
  descriptions: string[];
  cancelButtonText?: string;
  okButtonText?: string;
}

@Component({
  selector: 'cp-simple-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './simple-dialog.component.html',
  styleUrls: ['./simple-dialog.component.scss'],
})
export class SimpleDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: SimpleDialogData) {
  }

}
