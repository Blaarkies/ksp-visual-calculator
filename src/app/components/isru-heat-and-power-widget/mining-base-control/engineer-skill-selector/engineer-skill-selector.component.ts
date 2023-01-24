import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { BasicValueAccessor } from '../../../../common/domain/input-fields/basic-value-accessor';
import { Icons } from '../../../../common/domain/icons';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSliderModule } from '@angular/material/slider';
import { Common } from '../../../../common/common';

@Component({
  standalone: true,
  selector: 'cp-engineer-skill-selector',
  templateUrl: './engineer-skill-selector.component.html',
  styleUrls: ['./engineer-skill-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EngineerSkillSelectorComponent),
    multi: true,
  }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSliderModule,
  ],
})
export class EngineerSkillSelectorComponent extends BasicValueAccessor {

  @Input() set formControl(control: FormControl<number>) {
    this.setDisabledState(control?.disabled);

    let mapEntries = Array.from(this.bonusMap.entries())
      .sort(([,av], [,bv]) => av - bv);
    let nearEntry = mapEntries.find(([,v]) => control.value <= v) ?? mapEntries.last();
    let starKey = nearEntry[0];

    this.controlSkillRating.setValue(starKey, {emitEvent: false});
  }

  @Output() output = new EventEmitter<number>();

  isActive: boolean;
  icons = Icons;

  controlSkillRating = new FormControl<number>(-1);
  stars = Common.makeIntRange(5);

  private destroy$ = new Subject<void>();
  private bonusMap = new Map<number, number>([
    [-1, .05],
    [0, .25],
    [1, .45],
    [2, .65],
    [3, .85],
    [4, 1.05],
    [5, 1.25],
  ]);

  constructor(private cdr: ChangeDetectorRef) {
    super();

    this.controlSkillRating
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(rating => this.userInputChange(rating));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  writeValue(value: any) {
    this.value = value;
    this.cdr.detectChanges();
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
    this.controlSkillRating.setValue(value, {emitEvent: false});

    let efficiencyBonus = this.bonusMap.get(value);
    this.writeValue(efficiencyBonus);
    this.onChange && this.onChange(efficiencyBonus);
    this.output.emit(efficiencyBonus);
  }

  /** TrackBy function for star elements */
  getValue(index: number, item: number): number {
    return item;
  }

}
