import { UntypedFormControl } from '@angular/forms';
import { ControlMeta } from './control-meta';

export class InputFields {
  [key: string]: InputField;
}

export class InputField {
  label: string;
  control: UntypedFormControl;
  controlMeta?: ControlMeta;
}
