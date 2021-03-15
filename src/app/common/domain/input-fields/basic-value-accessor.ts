import { ControlValueAccessor } from '@angular/forms';

export class BasicValueAccessor implements ControlValueAccessor {

  value: any;
  onChange: (value: any) => void;
  onTouched: (value: any) => void;
  disabled: boolean;

  writeValue(value: any) {}
  registerOnChange(fn: any) {}
  registerOnTouched(fn: any) {}
  setDisabledState(isDisabled: boolean) {}

}
