import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasicAnimations } from '../../../common/animations/basic-animations';

@Component({
  selector: 'cp-account-edit-details',
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
