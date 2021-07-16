import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BasicValueAccessor } from '../../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../../common/domain/input-fields/form-control-error';
import { CustomAnimation } from '../../../common/domain/custom-animation';

@Component({
  selector: 'cp-input-text-area',
  templateUrl: './input-text-area.component.html',
  styleUrls: ['./input-text-area.component.scss'],
  animations: [CustomAnimation.animateFade],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputTextAreaComponent),
    multi: true,
  }],
})
export class InputTextAreaComponent extends BasicValueAccessor {

  @Input() label: string;
  @Input() hint: string;
  @Input() errors: FormControlError;

  @ViewChild('textarea', {static: true}) textarea: ElementRef<HTMLTextAreaElement>;

  isActive: boolean;

  constructor() {
    super();
  }

  writeValue(value: any) {
    this.textarea.nativeElement.value = value;
    this.value = value;
  }

  registerOnChange(fn: (value: any) => any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.textarea.nativeElement.disabled = isDisabled;
  }

  userInputChange(value: string) {
    this.writeValue(value);
    this.onChange && this.onChange(value);
  }

  focus() {
    this.textarea.nativeElement.focus();
  }

}
