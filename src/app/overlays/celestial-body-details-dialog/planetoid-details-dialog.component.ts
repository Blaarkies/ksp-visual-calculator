import { CommonModule } from '@angular/common';
import {
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Antenna } from '../../pages/commnet-planner/models/antenna';
import { Icons } from '../../common/domain/icons';
import { ControlMetaInput } from '../../common/domain/input-fields/control-meta-input';
import { ControlMetaNumber } from '../../common/domain/input-fields/control-meta-number';
import { ControlMetaSelect } from '../../common/domain/input-fields/control-meta-select';
import { InputFields } from '../../common/domain/input-fields/input-fields';
import { LabeledOption } from '../../common/domain/input-fields/labeled-option';
import { Planetoid } from '../../common/domain/space-objects/planetoid';
import { PlanetoidType } from '../../common/domain/space-objects/planetoid-type';
import { CommonValidators } from '../../common/validators/common-validators';
import { InputFieldListComponent } from '../../components/controls/input-field-list/input-field-list.component';
import { CommnetUniverseBuilderService } from '../../pages/commnet-planner/services/commnet-universe-builder.service';
import { PlanetoidDetails } from './planetoid-details';

export class PlanetoidDetailsDialogData {
  forbiddenNames: string[];
  edit?: Planetoid;
  universeBuilderHandler: CommnetUniverseBuilderService;
}

@Component({
  selector: 'cp-planetoid-details-dialog',
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
      control: new FormControl(this.data.edit?.label ?? 'Untitled Planetoid', [
        Validators.required,
        Validators.maxLength(128),
        CommonValidators.uniqueString(this.data.forbiddenNames.except([this.data.edit?.label]))],
      ),
      controlMeta: new ControlMetaInput(),
    },
    planetoidType: {
      label: 'Type',
      control: new FormControl(this.data.edit?.planetoidType ?? PlanetoidType.Planet, Validators.required),
      controlMeta: new ControlMetaSelect(
        PlanetoidType.List,
        new Map<PlanetoidType, string>(PlanetoidType.List.map(so => [so.value, so.value.icon])),
        'Describes its role in the star system'),
    },
    size: {
      label: 'Size',
      control: new FormControl(this.data.edit?.size.toFixed(2).toNumber() ?? 40, [
        Validators.required,
        Validators.min(1),
        Validators.max(100)]),
      controlMeta: new ControlMetaNumber(20, 80, 3, 'px', 'Apparent visual size'),
    },
    orbitColor: {
      label: 'Color',
      control: new FormControl(this.data.edit?.draggable.orbit?.color ?? '#ff0000', [Validators.required]),
      controlMeta: new ControlMetaInput('color', 'Color of orbital line'),
    },
    currentDsn: {
      label: 'Current Tracking Station',
      control: new FormControl(this.data.edit?.communication?.antennaeFull[0]?.item),
      controlMeta: new ControlMetaSelect(
        this.trackingStationOptions,
        new Map<Antenna, string>(this.trackingStationOptions.map(a => [a.value, a.value?.icon ?? Icons.Delete])),
        'Ground relay station'),
    },
  } as InputFields;
  inputFieldsList = Object.values(this.inputFields);

  form = new FormArray(this.inputFieldsList.map(field => field.control));

  constructor(private dialogRef: MatDialogRef<PlanetoidDetailsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PlanetoidDetailsDialogData) {
  }

  submitDetails() {
    let details = new PlanetoidDetails(
      this.inputFields.name.control.value,
      this.inputFields.planetoidType.control.value,
      this.inputFields.size.control.value,
      this.inputFields.orbitColor.control.value,
      this.inputFields.currentDsn.control.value);
    this.dialogRef.close(details);
  }

}
