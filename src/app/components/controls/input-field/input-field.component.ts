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
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { BasicValueAccessor } from '../../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../../common/domain/input-fields/form-control-error';
import { BasicAnimations } from '../../../animations/basic-animations';
import { Icons } from 'src/app/common/domain/icons';
import { ControlInputType } from '../../../common/domain/input-fields/control-meta-input';
import { fromEvent, Subject, takeUntil, timer } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WidthClass } from '../input-number/input-number.component';
import { ValidationMessageComponent } from '../validation-message/validation-message.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export type CpColors = 'primary' | 'accent' | 'warn';

@Component({
  selector: 'cp-input-field',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    ValidationMessageComponent,
  ],
  templateUrl: './input-field.component.html',
  styleUrls: ['./input-field.component.scss'],
  animations: [BasicAnimations.fade],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputFieldComponent),
    multi: true,
  }],
})
export class InputFieldComponent extends BasicValueAccessor implements OnInit, OnDestroy {

  @Input() type: ControlInputType = 'text';

  // todo: type only works some input types. check if these can be removed
  // 'button' | 'checkbox' | 'color' | 'date' | 'datetime' | 'email' | 'file'
  //   | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | /*'range' |*/ 'reset'
  //   | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week'
  @Input() color: CpColors = 'primary';
  @Input() label: string;
  @Input() hint: string;
  @Input() suffix: string;
  @Input() allowClear: boolean;
  @Input() errors: FormControlError;
  @Input() widthClass: WidthClass = 'normal';

  @Input() set formControl(value: UntypedFormControl) {
    this.setDisabledState(value?.disabled);
  }

  @Output() output = new EventEmitter<string>();
  @Output() formTouch = new EventEmitter<string>();

  @ViewChild('input', {static: true}) inputRef: ElementRef<HTMLInputElement>;

  isActive: boolean;
  icons = Icons;
  errorBlink$ = new Subject<boolean>();
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    fromEvent(this.inputRef.nativeElement, 'input')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: Event) => this.userInputChange((event.target as any).value));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.disabled = isDisabled;
    this.inputRef.nativeElement.disabled = isDisabled;
    this.cdr.detectChanges();
  }

  userInputChange(value: string) {
    this.writeValue(value);
    this.onChange && this.onChange(value);
    this.output.emit(value);
  }

  focus() {
    if (this.disabled) {
      return;
    }
    this.inputRef.nativeElement.focus();
  }

  touch() {
    this.onTouched && this.onTouched(true);
    this.formTouch.emit();
  }

  clear() {
    this.userInputChange(null);
  }

  blinkError() {
    this.errorBlink$.next(true);
    timer(300).pipe(takeUntil(this.destroy$))
      .subscribe(() => this.errorBlink$.next(false));
  }
}
