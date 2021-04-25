import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BasicValueAccessor } from '../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../common/domain/input-fields/form-control-error';

@Component({
  selector: 'cp-input-field',
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputFieldComponent),
    multi: true,
  }],
})
export class InputFieldComponent extends BasicValueAccessor {

  // todo: these only work for character input types (text, number, ...)
  @Input() type: 'button' | 'checkbox' | 'color' | 'date' | 'datetime' | 'email' | 'file'
    | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | /*'range' |*/ 'reset'
    | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week' = 'text';
  @Input() label: string;
  @Input() errors: FormControlError;

  @Input() set formControl(value: FormControl) {
    this.setDisabledState(value?.disabled);
  }

  @Output() output = new EventEmitter<string>();
  @Output() formTouch = new EventEmitter<string>();

  @ViewChild('input', {static: true}) inputRef: ElementRef<HTMLInputElement>;

  isActive: boolean;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  writeValue(value: any) {
    this.inputRef.nativeElement.value = value;
    this.value = value;
  }

  registerOnChange(fn: (value: any) => any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.inputRef.nativeElement.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  userInputChange(value: string) {
    this.writeValue(value);
    this.onChange && this.onChange(value);
    this.output.emit(value);
  }

  focus() {
    this.inputRef.nativeElement.focus();
  }

  touch() {
    this.onTouched && this.onTouched(true);
    this.formTouch.emit();
  }

}
