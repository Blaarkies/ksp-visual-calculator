import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Antenna } from '../../common/domain/antenna';
import { Icons } from '../../common/domain/icons';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { ControlMetaSelect } from '../../common/domain/input-fields/control-meta-select';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { SpaceObjectType } from '../../common/domain/space-objects/space-object-type';
import { CommonValidators } from '../../common/validators/common-validators';
import { InputFieldListComponent } from '../../components/controls/input-field-list/input-field-list.component';
import { CommnetUniverseBuilderService } from '../../pages/commnet-planner/services/commnet-universe-builder.service';
import { CelestialBodyDetails } from './celestial-body-details';

export class PlanetoidDetailsDialogData {
  forbiddenNames: string[];
  edit?: Planetoid;
  universeBuilderHandler: CommnetUniverseBuilderService;
}

@Component({
  selector: 'cp-celestial-body-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    InputFieldListComponent,
  ],
  templateUrl: './planetoid-details-dialog.component.html',
  styleUrls: ['./planetoid-details-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PlanetoidDetailsDialogComponent {

  private trackingStationOptions = this.data.universeBuilderHandler.antennae$.value
    .filter(a => a.label.includes('Tracking Station'))
    .map(a => new LabeledOption<Antenna>(a.label, a))
    .concat(new LabeledOption<Antenna>('None', null));

  inputFields = {
    name: {
      label: 'Name',
      control: new UntypedFormControl(this.data.edit?.label ?? 'Untitled Celestial Body', [
        Validators.required,
        Validators.maxLength(128),
        CommonValidators.uniqueString(this.data.forbiddenNames.except([this.data.edit?.label]))],
      ),
      controlMeta: new ControlMetaInput(),
    },
    celestialBodyType: {
      label: 'Type',
      control: new UntypedFormControl(this.data.edit?.type ?? PlanetoidType.Planet, Validators.required),
      controlMeta: new ControlMetaSelect(
        SpaceObjectType.List,
        new Map<SpaceObjectType, string>(SpaceObjectType.List.map(so => [so.value, so.value.icon])),
        'Describes its role in the solar system'),
    },
    size: {
      label: 'Size',
      control: new UntypedFormControl(this.data.edit?.size.toFixed(2).toNumber() ?? 40, [
        Validators.required,
        Validators.min(1),
        Validators.max(100)]),
      controlMeta: new ControlMetaNumber(20, 80, 3, 'px', 'Apparent visual size'),
    },
    orbitColor: {
      label: 'Color',
      control: new UntypedFormControl(this.data.edit?.draggable.orbit?.color ?? '#ff0000', [Validators.required]),
      controlMeta: new ControlMetaInput('color', 'Color of orbital line'),
    },
    currentDsn: {
      label: 'Current Tracking Station',
      control: new UntypedFormControl(this.data.edit?.communication.antennae[0]?.item),
      controlMeta: new ControlMetaSelect(
        this.trackingStationOptions,
        new Map<Antenna, string>(this.trackingStationOptions.map(a => [a.value, a.value?.icon ?? Icons.Delete])),
        'Ground relay station'),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new UntypedFormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<PlanetoidDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PlanetoidDetailsDialogData) {
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
