import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { CraftType } from '../../common/domain/space-objects/craft-type';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { ControlMetaSelect } from '../../common/domain/input-fields/control-meta-select';
import { ControlMetaAntennaSelector } from '../../common/domain/input-fields/control-meta-antenna-selector';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { CommonValidators } from '../../common/validators/common-validators';
import { Craft } from '../../common/domain/space-objects/craft';
import { CraftDetails } from './craft-details';
import { SetupService } from '../../services/setup.service';

export class CraftDetailsDialogData {
  forbiddenNames: string[];
  edit?: Craft;
}

@Component({
  selector: 'cp-craft-details-dialog',
  templateUrl: './craft-details-dialog.component.html',
  styleUrls: ['./craft-details-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CraftDetailsDialogComponent {

  inputFields = {
    name: {
      label: 'Name',
      control: new FormControl(this.data.edit?.label ?? 'Untitled Space Craft', [Validators.required,
        CommonValidators.uniqueString(this.data.forbiddenNames.except([this.data.edit?.label]))],
      ),
      controlMeta: new ControlMetaInput(),
    },
    craftType: {
      label: 'Type',
      control: new FormControl(this.data.edit?.craftType ?? CraftType.Relay, Validators.required),
      controlMeta: new ControlMetaSelect(CraftType.List),
    },
    antennaSelection: {
      label: 'Antennae Onboard',
      control: new FormControl(this.data.edit?.antennae),
      controlMeta: new ControlMetaAntennaSelector(this.setupService.antennaList),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<CraftDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CraftDetailsDialogData,
              private setupService: SetupService) {
  }

  submitCraftDetails() {
    let craftDetails = new CraftDetails(
      this.inputFields.name.control.value,
      this.inputFields.craftType.control.value,
      this.inputFields.antennaSelection.control.value);
    this.dialogRef.close(craftDetails);
  }

}
