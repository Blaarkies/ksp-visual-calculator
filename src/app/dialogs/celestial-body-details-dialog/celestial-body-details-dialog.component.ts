import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, Validators } from '@angular/forms';
import { CommonValidators } from '../../common/validators/common-validators';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { ControlMetaSelect } from '../../common/domain/input-fields/control-meta-select';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CelestialBodyDetails } from './celestial-body-details';
import { SpaceObject, SpaceObjectType } from '../../common/domain/space-objects/space-object';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { ControlMetaToggle } from '../../common/domain/input-fields/control-meta-toggle';

export class CelestialBodyDetailsDialogData {
  forbiddenNames: string[];
  edit?: SpaceObject;
}

@Component({
  selector: 'cp-celestial-body-details-dialog',
  templateUrl: './celestial-body-details-dialog.component.html',
  styleUrls: ['./celestial-body-details-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CelestialBodyDetailsDialogComponent {

  inputFields = {
    name: {
      label: 'Name',
      control: new FormControl(this.data.edit?.label ?? 'Untitled Celestial Body', [Validators.required,
        CommonValidators.uniqueString(this.data.forbiddenNames.except([this.data.edit?.label]))],
      ),
      controlMeta: new ControlMetaInput(),
    },
    celestialBodyType: {
      label: 'Type',
      control: new FormControl(this.data.edit?.type ?? SpaceObjectType.Planet, Validators.required),
      controlMeta: new ControlMetaSelect(SpaceObjectType.List),
    },
    size: {
      label: 'Size',
      control: new FormControl(this.data.edit?.size.toFixed(2).toNumber() ?? 50,
        [Validators.required, Validators.min(1), Validators.max(100)]),
      controlMeta: new ControlMetaNumber(),
    },
    orbitColor: {
      label: 'Color',
      control: new FormControl(this.data.edit?.draggableHandle.orbit?.color ?? '#FF0000', [Validators.required]),
      controlMeta: new ControlMetaInput('color'),
    },
    hasDsn: {
      label: 'Tracking Station',
      control: new FormControl(this.data.edit?.hasDsn),
      controlMeta: new ControlMetaToggle(),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<CelestialBodyDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CelestialBodyDetailsDialogData) {
  }

  submitDetails() {
    let details = new CelestialBodyDetails(
      this.inputFields.name.control.value,
      this.inputFields.celestialBodyType.control.value,
      this.inputFields.size.control.value,
      this.inputFields.orbitColor.control.value,
      this.inputFields.hasDsn.control.value);
    this.dialogRef.close(details);
  }

}
