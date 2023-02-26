import { Component } from '@angular/core';
import {AccountDetailsComponent} from "../../components/account-details/account-details.component";

@Component({
  selector: 'cp-account-dialog',
  standalone: true,
  imports: [AccountDetailsComponent],
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss'],
})
export class AccountDialogComponent {
}
