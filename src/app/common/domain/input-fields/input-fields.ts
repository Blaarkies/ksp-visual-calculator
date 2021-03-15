import { FormControl } from '@angular/forms';
import { ControlMeta } from './control-meta';

export class InputFields {
  [key: string]: InputField;
}

class InputField {
  label: string;
  control: FormControl;
  controlMeta?: ControlMeta;
}
