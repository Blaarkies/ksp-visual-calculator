import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ActionOption, ActionOptionType } from '../../common/domain/action-option';

export class ActionBottomSheetData {
  title: string;
  actionOptions: ActionOption[];
}

@Component({
  selector: 'cp-action-bottom-sheet',
  templateUrl: './action-bottom-sheet.component.html',
  styleUrls: ['./action-bottom-sheet.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ActionBottomSheetComponent {

  actionTypes = ActionOptionType;

  constructor(public bottomSheetRef: MatBottomSheetRef<ActionBottomSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: ActionBottomSheetData) {
  }

}
