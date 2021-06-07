import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormControlError } from '../../common/domain/input-fields/form-control-error';
import { BasicValueAccessor } from '../../common/domain/input-fields/basic-value-accessor';
import { InputFieldComponent } from '../input-field/input-field.component';
import { MatSlider } from '@angular/material/slider';

@Component({
  selector: 'cp-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputNumberComponent),
    multi: true,
  }],
})
export class InputNumberComponent extends BasicValueAccessor implements OnInit {

  @Input() label: string;
  @Input() hint: string;
  @Input() suffix: string;
  @Input() errors: FormControlError;

  @Output() output = new EventEmitter<number>();

  @ViewChild('input', {static: true}) inputRef: InputFieldComponent;
  @ViewChild('slider', {static: true}) sliderRef: MatSlider;

  isActive: boolean;

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  writeValue(value: any) {
    this.value = value;
    this.inputRef.writeValue(value);
    this.sliderRef.value = value;
  }

  registerOnChange(fn: (value: any) => any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    // this.inputRef.nativeElement.disabled = isDisabled;
    this.sliderRef.setDisabledState(isDisabled);
  }

  userInputChange(value: number) {
    this.writeValue(value);
    this.onChange && this.onChange(value);
    this.output.emit(value);
  }

  focus() {
    // this.inputRef.nativeElement.focus();
  }

  ngOnInit() {
    this.inputRef.inputRef.nativeElement.autocomplete = 'off';
    this.inputRef.inputRef.nativeElement.oninput = (event: Event & any) => {
      if (event.target.value.toNumber().isNaN()
        // || formControl.validators fail
      ) {
        event.preventDefault();
      }
    };

    this.sliderRef.min = 1;
  }

  inputChange(value: string) {
    let numberValue = value.toNumber();
    this.value = numberValue;
    this.sliderRef.value = this.value.pow(1 / 1.1).toInt();
    this.onChange && this.onChange(this.value);
    this.output.emit(this.value);
  }

  sliderChange(value: number) {
    let scaledNumber = value.pow(1.1).toInt();
    this.value = scaledNumber;
    this.inputRef.writeValue(scaledNumber);
    this.onChange && this.onChange(value);
    this.output.emit(value);
    window.requestAnimationFrame(() => this.cdr.markForCheck());
  }
}
