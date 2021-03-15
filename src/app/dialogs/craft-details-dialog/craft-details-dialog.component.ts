import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { CraftType } from '../../common/domain/craft-type';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { ControlMetaSelect } from '../../common/domain/input-fields/control-meta-select';
import { ControlMetaAntennaSelector } from '../../common/domain/input-fields/control-meta-antenna-selector';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { ControlMetaType } from '../../common/domain/input-fields/control-meta-type';

export class CraftDetailsDialogData {
}

@Component({
  selector: 'cp-craft-details-dialog',
  templateUrl: './craft-details-dialog.component.html',
  styleUrls: ['./craft-details-dialog.component.scss'],
})
export class CraftDetailsDialogComponent implements OnInit {

  controlMetaTypes = ControlMetaType;
  inputFields = {
    name: {
      label: 'Craft Name',
      control: new FormControl('Untitled Space Craft', Validators.required),
      controlMeta: new ControlMetaInput(),
    },
    craftType: {
      label: 'Craft Type',
      control: new FormControl(CraftType.Relay, Validators.required),
      controlMeta: new ControlMetaSelect(CraftType.List),
    },
    antennaSelection: {
      label: 'Antennae Onboard',
      control: new FormControl(null, Validators.required),
      controlMeta: new ControlMetaAntennaSelector(),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  constructor(public dialogRef: MatDialogRef<CraftDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CraftDetailsDialogData) {

  }

  ngOnInit(): void {
  }

}
