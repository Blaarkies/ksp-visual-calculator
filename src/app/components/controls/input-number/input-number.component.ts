import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputFieldComponent } from '../input-field/input-field.component';
import { MatSlider } from '@angular/material/slider';
import { BasicValueAccessor } from '../../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../../common/domain/input-fields/form-control-error';
import { MatMenuTrigger } from '@angular/material/menu';
import { fromEvent, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ControlMetaNumber } from '../../../common/domain/input-fields/control-meta-number';

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
export class InputNumberComponent extends BasicValueAccessor implements OnInit, OnDestroy {

  @Input() label: string;
  @Input() hint: string;
  @Input() suffix: string;
  @Input() errors: FormControlError;

  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() factor: number = 2;

  @Input() set controlMeta(value: ControlMetaNumber) {
    Object.entries(value).forEach(([k, v]) => this[k] = v);
  }

  @Input() set formControl(value: FormControl) {
    this.setDisabledState(value?.disabled);
  }

  @Output() output = new EventEmitter<number>();

  @ViewChild('input', {static: true}) inputRef: InputFieldComponent;
  @ViewChild('slider', {static: true}) sliderRef: MatSlider;
  @ViewChild('menuTrigger', {static: true}) menuTriggerRef: MatMenuTrigger;

  private isActive: boolean;
  private unsubscribe$ = new Subject();

  constructor(private cdr: ChangeDetectorRef,
              private self: ElementRef) {
    super();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  writeValue(value: any) {
    this.value = value;
    this.inputRef.writeValue(value);

    let minMaxDifference = this.max - this.min;
    this.sliderRef.value = (((this.value - this.min) / minMaxDifference))
      .pow(1 / this.factor)
      .let(v => v * 100)
      .toInt();
  }

  registerOnChange(fn: (value: any) => any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.inputRef.setDisabledState(isDisabled);
    this.sliderRef.setDisabledState(isDisabled);
    this.menuTriggerRef.menu && this.menuTriggerRef.closeMenu();

    this.self.nativeElement.style.pointerEvents = isDisabled ? 'none' : 'auto';
  }

  userInputChange(value: number) {
    this.writeValue(value);
    this.onChange && this.onChange(value);
    this.output.emit(value);
  }

  focus() {
    if (this.disabled) {
      return;
    }
    this.menuTriggerRef.menu && this.menuTriggerRef.openMenu();
    this.inputRef.focus();
    this.isActive = true;
  }

  ngOnInit() {
    if (this.max < this.min) {
      throw new Error(`InputNumberComponent expects max[${this.max}] to be greater than min[${this.min}]`);
    }

    let nativeInput = this.inputRef.inputRef.nativeElement;
    nativeInput.autocomplete = 'off';

    let valueChecks = {
      fromEmptyToFill: value => this.value === undefined && value !== '',
      fromFillToEmpty: value => this.value?.toString().length > value.length,
      fromShorterString: value => value.length <= Math.max(
        this.min.toString().length, this.max.toString().length),
    };

    fromEvent(nativeInput, 'input', {capture: true})
      .pipe(
        map((event: InputEvent) => [event, (event.target as any).value]),
        filter(([, value]) => {
          if (valueChecks.fromEmptyToFill(value) && valueChecks.fromShorterString(value)) {
            return false;
          }

          if (valueChecks.fromFillToEmpty(value) && valueChecks.fromShorterString(value)) {
            return false;
          }

          let numberValue = value.toNumber();
          return numberValue.isNaN()
            || !numberValue.between(this.min, this.max);
        }),
        takeUntil(this.unsubscribe$))
      .subscribe(([event]: [InputEvent]) => {
        event.stopImmediatePropagation();
        nativeInput.value = this.value?.toString() ?? '';
        this.inputRef.blinkError();
      });

    this.sliderRef.min = 0;
    this.sliderRef.max = 100;
  }

  inputChange(value: string) {
    let numberValue = value.toNumber();
    if (numberValue.isNaN()) {
      this.value = undefined;
      this.sliderRef.value = 0;
    } else {
      this.value = numberValue;

      let minMaxDifference = this.max - this.min;
      this.sliderRef.value = (((this.value - this.min) / minMaxDifference))
        .pow(1 / this.factor)
        .let(v => v * 100)
        .toInt();
    }

    this.onChange && this.onChange(this.value);
    this.output.emit(this.value);
  }

  sliderChange(value: number) {
    let concreteRatio = (value * .01).pow(this.factor);
    let scaledNumber = this.max.lerp(this.min, concreteRatio).toInt();
    this.value = scaledNumber;
    this.inputRef.writeValue(scaledNumber);

    this.onChange && this.onChange(scaledNumber);
    this.output.emit(scaledNumber);
    window.requestAnimationFrame(() => this.cdr.markForCheck());
  }
}
