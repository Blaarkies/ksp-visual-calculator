import {
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { ActionOption } from '../../common/domain/action-option';
import { ActionListComponent } from '../../components/action-list/action-list.component';

export class ActionBottomSheetData {
  startIcon: string;
  startTitle: string;
  actionOptions: ActionOption[];
}

@Component({
  selector: 'cp-action-bottom-sheet',
  standalone: true,
  imports: [ActionListComponent],
  templateUrl: './action-bottom-sheet.component.html',
  styleUrls: ['./action-bottom-sheet.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActionBottomSheetComponent {

  constructor(public bottomSheetRef: MatBottomSheetRef<ActionBottomSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: ActionBottomSheetData) {
  }

}
