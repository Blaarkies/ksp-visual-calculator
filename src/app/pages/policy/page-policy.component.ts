import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyDialogComponent } from '../../overlays/policy-dialog/policy-dialog.component';
import { ConductInfoDisplayComponent } from '../../components/conduct-info-display/conduct-info-display.component';

@Component({
  selector: 'cp-page-policy',
  standalone: true,
  imports: [
    CommonModule,
    PolicyDialogComponent,
    ConductInfoDisplayComponent,
  ],
  templateUrl: './page-policy.component.html',
  styleUrls: ['./page-policy.component.scss']
})
export class PagePolicyComponent {

}
