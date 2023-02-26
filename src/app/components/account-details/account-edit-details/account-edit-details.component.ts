import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasicAnimations } from '../../../common/animations/basic-animations';
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'cp-account-edit-details',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './account-edit-details.component.html',
  styleUrls: ['./account-edit-details.component.scss'],
  animations: [BasicAnimations.fade],
})
export class AccountEditDetailsComponent {

  @Input() isCustomer: boolean;
  @Input() validatingCustomer: boolean;
  @Input() uploadingImage: boolean;
  @Input() deletingAccount: boolean;
  @Input() editingDetails: boolean;

  @Output() validateAccount = new EventEmitter<void>();
  @Output() uploadImage = new EventEmitter<void>();
  @Output() editDetails = new EventEmitter<void>();
  @Output() deleteAccount = new EventEmitter<void>();
}
