import { ControlValueAccessor } from '@angular/forms';

export class BasicValueAccessor<T = any> implements ControlValueAccessor {

  value: T;
  onChange: (value: T) => void;
  onTouched: (value: T) => void;
  disabled: boolean;

  writeValue(value: T) {
  }

  registerOnChange(fn: (value: T) => T) {
  }

  registerOnTouched(fn: () => void) {
  }

  setDisabledState(isDisabled: boolean) {
  }

}
