import { FormControl } from '@angular/forms';

export interface ControlItem<T, U> {
  label?: string;
  value?: T;
  control: FormControl<U>;
}
