import { FormControl, Validators } from '@angular/forms';
import { Antenna } from '../../common/domain/antenna';

export class AntennaInput {

  antennaControl: FormControl;
  countControl: FormControl;

  constructor(public selectedAntenna: Antenna, count: number = 1) {
    this.antennaControl = new FormControl(selectedAntenna.label, Validators.required);
    this.antennaControl.disable();

    this.countControl = new FormControl(count, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^-?(0|[1-9]\d*)?$/),
    ]);
  }

}
