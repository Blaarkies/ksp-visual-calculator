import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icons } from '../../../common/domain/icons';
import { BasicValueAccessor } from '../../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../../common/domain/input-fields/form-control-error';
import { NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { Common } from '../../../common/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'cp-input-rating',
  templateUrl: './input-rating.component.html',
  styleUrls: ['./input-rating.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputRatingComponent),
    multi: true,
  }],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
  ],
})
export class InputRatingComponent extends BasicValueAccessor {

  @Input() label: string;
  @Input() hint: string;
  @Input() count = 5;
  @Input() iconOn = Icons.StarFull;
  @Input() iconOff = Icons.StarEmpty;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() errors: FormControlError;

  @Input() set formControl(value: UntypedFormControl) {
    this.setDisabledState(value?.disabled);
  }

  @Output() output = new EventEmitter<number>();

  isActive: boolean;
  icons = Icons;
  stars = Common.makeIntRange(5);
  activeValue = 3;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: any) {
    this.activeValue = value;
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
    this.cdr.detectChanges();
  }

  userInputChange(value: number) {
    let toggleValue = value === this.activeValue ? 0 : value;
    this.writeValue(toggleValue);
    this.onChange && this.onChange(toggleValue);
    this.output.emit(toggleValue);
  }

}
