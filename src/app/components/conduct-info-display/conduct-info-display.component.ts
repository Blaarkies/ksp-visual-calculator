import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Icons } from '../../common/domain/icons';

@Component({
  selector: 'cp-conduct-info-display',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './conduct-info-display.component.html',
  styleUrls: ['./conduct-info-display.component.scss'],
})
export class ConductInfoDisplayComponent {
  icons = Icons;
}
