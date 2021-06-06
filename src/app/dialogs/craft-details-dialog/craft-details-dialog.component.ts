import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CraftType } from '../../common/domain/space-objects/craft-type';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { ControlMetaSelect } from '../../common/domain/input-fields/control-meta-select';
import { ControlMetaAntennaSelector } from '../../common/domain/input-fields/control-meta-antenna-selector';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { CommonValidators } from '../../common/validators/common-validators';
import { Craft } from '../../common/domain/space-objects/craft';
import { CraftDetails } from './craft-details';
import { SetupService } from '../../services/setup.service';
import { Group } from '../../common/domain/group';
import { SpaceObjectService } from '../../services/space-object.service';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { WithDestroy } from '../../common/with-destroy';
import { Icons } from '../../common/domain/icons';
import { CustomAnimation } from '../../common/domain/custom-animation';
import { AdvancedPlacement } from './advanced-placement';

export class CraftDetailsDialogData {
  forbiddenNames: string[];
  edit?: Craft;
}

@Component({
  selector: 'cp-craft-details-dialog',
  templateUrl: './craft-details-dialog.component.html',
  styleUrls: ['./craft-details-dialog.component.scss'],
  animations: [CustomAnimation.animateFade],
  encapsulation: ViewEncapsulation.None,
})
export class CraftDetailsDialogComponent extends WithDestroy() {

  inputFields = {
    name: {
      label: 'Name',
      control: new FormControl(this.data.edit?.label ?? 'Untitled Space Craft', [
        Validators.required,
        Validators.maxLength(128),
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
      control: new FormControl(this.data.edit?.antennae ?? [new Group(this.setupService.getAntenna('Internal'))]),
      controlMeta: new ControlMetaAntennaSelector(this.setupService.antennaList),
    },
  } as InputFields;
  inputListCraft = [this.inputFields.name, this.inputFields.craftType];
  inputListAntenna = [this.inputFields.antennaSelection];
  inputFieldsList = Object.values(this.inputFields);

  private orbitParentOptions = this.spaceObjectService.celestialBodies$.value
    .map(cb => new LabeledOption<SpaceObject>(cb.label, cb));
  advancedInputFields = {
    orbitParent: {
      label: 'Orbit Parent',
      control: new FormControl(null),
      controlMeta: new ControlMetaSelect(
        this.orbitParentOptions,
        new Map<SpaceObject, string>(this.orbitParentOptions.map(so => [so.value, so.value.type.icon]))),
    },
    altitude: {
      label: 'Altitude',
      control: new FormControl(null, [Validators.min(0)]),
      controlMeta: new ControlMetaNumber('m'),
    },
    angle: {
      label: 'Angle',
      control: new FormControl(null),
      controlMeta: new ControlMetaNumber('°'),
    },
  } as InputFields;
  advancedInputFieldsList = Object.values(this.advancedInputFields);
  advancedForm = new FormGroup({
    orbitParent: this.advancedInputFields.orbitParent.control,
    altitude: this.advancedInputFields.altitude.control,
    angle: this.advancedInputFields.angle.control,
  }, this.getAdvancedPlacementValidator());

  form = new FormArray([
    ...this.inputFieldsList.map(field => field.control),
    this.advancedForm]);

  Icons = Icons;

  constructor(private dialogRef: MatDialogRef<CraftDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CraftDetailsDialogData,
              private setupService: SetupService,
              private spaceObjectService: SpaceObjectService) {
    super();
  }

  submitCraftDetails() {
    let advancedPlacement = Object.values(this.advancedForm.value).some(v => v === null)
      ? undefined
      : AdvancedPlacement.fromObject(this.advancedForm.value, 'deg->rad');

    let craftDetails = new CraftDetails(
      this.inputFields.name.control.value,
      this.inputFields.craftType.control.value,
      this.inputFields.antennaSelection.control.value,
      advancedPlacement);
    this.dialogRef.close(craftDetails);
  }

  remove() {
    this.spaceObjectService.removeCraft(this.data.edit);
    this.dialogRef.close();
  }

  private getAdvancedPlacementValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      let value = formGroup.value;
      let inputsCount = [value.orbitParent, value.altitude, value.angle]
        .map(v => v !== null ? 1 : 0)
        .sum();

      if (inputsCount.between(1, 2)) {
        return {allOrNone: 'All placement values are required'};
      } else if (inputsCount === 0) {
        return null;
      }

      let parent = value.orbitParent as SpaceObject;
      if (parent.sphereOfInfluence < (value.altitude + parent.equatorialRadius)) {
        return {altitudeTooHigh: `Altitude is beyond the sphere of influence of ${parent.label}`};
      }

      return null;
    };
  }
}
