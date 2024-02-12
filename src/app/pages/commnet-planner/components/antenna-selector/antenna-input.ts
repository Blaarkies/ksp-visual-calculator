import { UntypedFormControl, Validators } from '@angular/forms';
import { Antenna } from '../../models/antenna';

export class AntennaInput {

  antennaControl: UntypedFormControl;
  countControl: UntypedFormControl;

  constructor(public selectedAntenna: Antenna, count: number = 1) {
    this.antennaControl = new UntypedFormControl(selectedAntenna.label, Validators.required);
    this.antennaControl.disable();

    this.countControl = new UntypedFormControl(count, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^-?(0|[1-9]\d*)?$/),
    ]);
  }

}
