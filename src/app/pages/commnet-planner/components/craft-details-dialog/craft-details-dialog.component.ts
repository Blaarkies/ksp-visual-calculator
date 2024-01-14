import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntil } from 'rxjs';
import { Planetoid } from 'src/app/common/domain/space-objects/planetoid';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Group } from '../../../../common/domain/group';
import { Icons } from '../../../../common/domain/icons';
import { ControlMetaAntennaSelector } from '../../../../common/domain/input-fields/control-meta-antenna-selector';
import { ControlMetaInput } from '../../../../common/domain/input-fields/control-meta-input';
import { ControlMetaNumber } from '../../../../common/domain/input-fields/control-meta-number';
import { ControlMetaSelect } from '../../../../common/domain/input-fields/control-meta-select';
import { ControlMetaType } from '../../../../common/domain/input-fields/control-meta-type';
import {
  InputField,
  InputFields,
} from '../../../../common/domain/input-fields/input-fields';
import { LabeledOption } from '../../../../common/domain/input-fields/labeled-option';
import { Craft } from '../../../../common/domain/space-objects/craft';
import { CraftType } from '../../../../common/domain/space-objects/craft-type';
import { SpaceObject } from '../../../../common/domain/space-objects/space-object';
import { Uid } from '../../../../common/uid';
import { CommonValidators } from '../../../../common/validators/common-validators';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputFieldListComponent } from '../../../../components/controls/input-field-list/input-field-list.component';
import { Antenna } from '../../models/antenna';
import { CommnetUniverseBuilderService } from '../../services/commnet-universe-builder.service';
import { AntennaSelectorComponent } from '../antenna-selector/antenna-selector.component';
import { AdvancedPlacement } from './advanced-placement';
import { CraftDetails } from './craft-details';

export class CraftDetailsDialogData {
  forbiddenNames: string[];
  edit?: Craft;
  universeBuilderHandler: CommnetUniverseBuilderService;
}

@Component({
  selector: 'cp-craft-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    InputFieldListComponent,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatDividerModule,
    AntennaSelectorComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './craft-details-dialog.component.html',
  styleUrls: ['./craft-details-dialog.component.scss'],
  animations: [BasicAnimations.fade, BasicAnimations.height, BasicAnimations.flipVertical],
  encapsulation: ViewEncapsulation.None,
})
export class CraftDetailsDialogComponent extends WithDestroy() {

  advancedInputFieldsList: InputField[];
  advancedForm: FormGroup;
  advancedIsOpen = false
  form: FormArray;
  inputListCraft: InputField[];
  inputListAntenna: InputField[];
  antennaOptions = this.data.universeBuilderHandler.antennaList;
  icons = Icons;

  private inputFields: InputFields;
  private inputFieldsList: InputField[];
  private orbitParentOptions: LabeledOption<SpaceObject>[];
  private advancedInputFields: InputFields;

  constructor(private dialogRef: MatDialogRef<CraftDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CraftDetailsDialogData) {
    super();

    this.setupInputFields();

    this.updateAdvancedPlacementFields(126123); // Gilly Soi == 126123
    this.updateMainForm();

    this.advancedInputFields.orbitParent.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(parent => {
        let max = parent.sphereOfInfluence ?? 181e9; // 181e9 == 2x Eeloo's orbit
        this.updateAdvancedPlacementFields(max - parent.equatorialRadius);
        this.updateMainForm();
      });
  }

  private updateMainForm() {
    this.form = new FormArray([
      ...this.inputFieldsList.map(field => field.control),
      this.advancedForm]);
  }

  private updateAdvancedPlacementFields(soiSize: number) {
    this.advancedInputFields.altitude = this.getAltitudeInputField(soiSize);

    this.advancedInputFieldsList = Object.values(this.advancedInputFields);
    this.advancedForm = new FormGroup({
      orbitParent: this.advancedInputFields.orbitParent.control,
      altitude: this.advancedInputFields.altitude.control,
      angle: this.advancedInputFields.angle.control,
    }, this.getAdvancedPlacementValidator());
  }

  private getAltitudeInputField(soiSize: number) {
    return {
      label: 'Altitude',
      control: new FormControl<number>(null, [Validators.min(0), Validators.max(soiSize)]),
      controlMeta: {
        type: ControlMetaType.Number,
        min: 0,
        max: soiSize,
        suffix: 'm',
      } as ControlMetaNumber,
    };
  }

  submitCraftDetails() {
    let advancedPlacement = Object.values(this.advancedForm.value).some(v => v === null)
      ? undefined
      : AdvancedPlacement.fromObject(this.advancedForm.value, 'deg->rad');

    let craftDetails = new CraftDetails(
      this.data.edit?.id ?? Uid.new,
      this.inputFields.name.control.value,
      this.inputFields.craftType.control.value,
      this.inputFields.antennaSelection.control.value,
      advancedPlacement);
    this.dialogRef.close(craftDetails);
  }

  async remove() {
    await this.data.universeBuilderHandler.removeCraft(this.data.edit)
    this.dialogRef.close();
  }

  copy() {
    let thisCraft = this.data.edit;

    this.data.forbiddenNames.push(thisCraft.label);
    this.data.edit = undefined;

    let copyLabel = this.getCopyLabel(thisCraft.label);
    let copyAntennae = thisCraft.communication.antennaeFull
      .map(({item, count}) => new Group(item, count));
    this.setupInputFields(
      copyLabel,
      thisCraft.craftType,
      copyAntennae);
    this.updateMainForm();

    // Name control does not update validation error message
    this.inputFields.name.control.markAllAsTouched();
 }

  private getCopyLabel(label: string) {
    let copyOfString = 'Copy of ';

    let isCopy = label.startsWith(copyOfString);
    if (isCopy) {
      return 'Copy(1) of ' + label.split(copyOfString).at(-1);
    }

    let copyIteration = label.match(/^Copy\((\d{1,2})\) of /)?.[1]?.toNumber();
    if (copyIteration && copyIteration <= 99) {
      let copyNumber = copyIteration + 1;
      return label.replace(/^Copy\((\d{1,2})\) of /, () => `Copy(${copyNumber}) of `);
    }

    return copyOfString + label;
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

      let parent = value.orbitParent as Planetoid;
      if (parent.sphereOfInfluence < (value.altitude + parent.equatorialRadius)) {
        return {altitudeTooHigh: `Altitude is beyond the sphere of influence of ${parent.label}`};
      }

      return null;
    };
  }

  private setupInputFields(label?: string,
                           craftType?: CraftType,
                           antennaeGroups?: Group<Antenna>[]) {
    this.inputFields = {
      name: {
        label: 'Name',
        control: new FormControl(label
          ?? this.data.edit?.draggable?.label
          ?? 'Untitled Space Craft', [
          Validators.required,
          Validators.maxLength(128),
          CommonValidators.uniqueString(this.data.forbiddenNames.except([this.data.edit?.label]))],
        ),
        controlMeta: new ControlMetaInput(),
      },
      craftType: {
        label: 'Type',
        control: new FormControl(craftType
          ?? this.data.edit?.craftType
          ?? CraftType.Relay, Validators.required),
        controlMeta: new ControlMetaSelect(CraftType.List, undefined, 'Icon to represent this craft'),
      },
      antennaSelection: {
        label: 'Antennae Onboard',
        control: new FormControl(antennaeGroups
          ?? this.data.edit?.communication.antennaeFull
          ?? [new Group(this.data.universeBuilderHandler.getAntenna('Internal'))]),
        controlMeta: new ControlMetaAntennaSelector(this.data.universeBuilderHandler.antennaList),
      },
    } as InputFields;

    this.inputListCraft = [this.inputFields.name, this.inputFields.craftType];
    this.inputListAntenna = [this.inputFields.antennaSelection];
    this.inputFieldsList = Object.values(this.inputFields);

    this.orbitParentOptions = this.data.universeBuilderHandler.planetoids$.value
      .map(cb => new LabeledOption<SpaceObject>(cb.label, cb));

    this.advancedInputFields = {
      orbitParent: {
        label: 'Orbit Parent',
        control: new FormControl<SpaceObject>(null),
        controlMeta: new ControlMetaSelect(
          this.orbitParentOptions,
          new Map<SpaceObject, string>(this.orbitParentOptions.map(so => [so.value, so.value.type.icon]))),
      },
      altitude: {} as InputField,
      angle: {
        label: 'Angle',
        control: new FormControl<number>(null),
        controlMeta: {
          type: ControlMetaType.Number,
          min: 0,
          max: 360,
          factor: 1,
          suffix: '°',
        } as ControlMetaNumber,
      },
    } as InputFields;
  }

}
