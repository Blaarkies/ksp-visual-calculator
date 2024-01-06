import { NgIf } from '@angular/common';
import {
  Component,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'cp-policy-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    NgIf,
  ],
  templateUrl: './policy-dialog.component.html',
  styleUrls: ['./policy-dialog.component.scss'],
})
export class PolicyDialogComponent {

  @Input() isDialog = true;

}
