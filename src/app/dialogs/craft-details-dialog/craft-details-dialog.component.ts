import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { CraftType } from '../../common/domain/craft-type';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { ControlMetaSelect } from '../../common/domain/input-fields/control-meta-select';
import { ControlMetaAntennaSelector } from '../../common/domain/input-fields/control-meta-antenna-selector';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { ControlMetaType } from '../../common/domain/input-fields/control-meta-type';
import { Antenna } from '../../common/domain/antenna';
import { Group } from '../../common/domain/group';
import { CommonValidators } from '../../common/validators/common-validators';
import { Craft } from '../../common/domain/craft';

export class CraftDetailsDialogData {
  forbiddenCraftNames: string[];
  edit?: Craft;
}

export class CraftDetails {

  constructor(
    public name: string,
    public craftType: CraftType,
    public antennae: Group<Antenna>[]) {
  }

}

@Component({
  selector: 'cp-craft-details-dialog',
  templateUrl: './craft-details-dialog.component.html',
  styleUrls: ['./craft-details-dialog.component.scss'],
})
export class CraftDetailsDialogComponent {

  controlMetaTypes = ControlMetaType;
  inputFields = {
    name: {
      label: 'Craft Name',
      control: new FormControl(this.data.edit?.label ?? 'Untitled Space Craft', [Validators.required,
        CommonValidators.uniqueString(this.data.forbiddenCraftNames.except([this.data.edit?.label]))],
      ),
      controlMeta: new ControlMetaInput(),
    },
    craftType: {
      label: 'Craft Type',
      control: new FormControl(this.data.edit?.craftType ?? CraftType.Relay, Validators.required),
      controlMeta: new ControlMetaSelect(CraftType.List),
    },
    antennaSelection: {
      label: 'Antennae Onboard',
      control: new FormControl(this.data.edit?.antennae, Validators.required),
      controlMeta: new ControlMetaAntennaSelector(Antenna.List),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<CraftDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CraftDetailsDialogData) {
  }

  submitCraftDetails() {
    let craftDetails = new CraftDetails(
      this.inputFields.name.control.value,
      this.inputFields.craftType.control.value,
      this.inputFields.antennaSelection.control.value);
    this.dialogRef.close(craftDetails);
  }

}
