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
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { Antenna } from '../../common/domain/antenna';
import { SetupService } from '../../services/setup.service';

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
      control: new FormControl(this.data.edit?.label ?? 'Untitled Celestial Body', [
        Validators.required,
        Validators.maxLength(128),
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
      control: new FormControl(this.data.edit?.draggableHandle.orbit?.color ?? '#ff0000', [Validators.required]),
      controlMeta: new ControlMetaInput('color'),
    },
    currentDsn: {
      label: 'Current Tracking Station',
      control: new FormControl(this.data.edit?.antennae[0]?.item),
      controlMeta: new ControlMetaSelect(this.setupService.availableAntennae$.value
        .filter(a => a.label.includes('Tracking Station'))
        .map(a => new LabeledOption<Antenna>(a.label, a))
        .concat(new LabeledOption<Antenna>('None', null))),
      // tooltip: ''
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<CelestialBodyDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CelestialBodyDetailsDialogData,
              private setupService: SetupService) {
  }

  submitDetails() {
    let details = new CelestialBodyDetails(
      this.inputFields.name.control.value,
      this.inputFields.celestialBodyType.control.value,
      this.inputFields.size.control.value,
      this.inputFields.orbitColor.control.value,
      this.inputFields.currentDsn.control.value);
    this.dialogRef.close(details);
  }

}
