import { Component, ElementRef, forwardRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BasicValueAccessor } from '../../../common/domain/input-fields/basic-value-accessor';
import { FormControlError } from '../../../common/domain/input-fields/form-control-error';
import { InputFieldComponent } from '../input-field/input-field.component';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { MatSelect } from '@angular/material/select';
import { Icons } from '../../../common/domain/icons';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CustomAnimation } from '../../../common/domain/custom-animation';

@Component({
  selector: 'cp-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  animations: [CustomAnimation.fade],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputSelectComponent),
    multi: true,
  }],
})
export class InputSelectComponent extends BasicValueAccessor implements OnDestroy {

  @Input() set options(list: LabeledOption<any>[]) {
    this.unsubscribe$.next();
    this.searchValue$
      .pipe(
        map(search => search
          ? list.sortByRelevance((item: LabeledOption<any>) => item.label.relevanceScore(search))
          : list),
        takeUntil(this.unsubscribe$))
      .subscribe(options => {
        this.filteredOptions = options;
        this.searchBoxRef.nativeElement.parentElement?.scroll({behavior: 'smooth', top: 0});
      });
  }

  @Input() mapIcons: Map<any, string>;

  @Input() label: string;
  @Input() hint: string;
  @Input() errors: FormControlError;

  @ViewChild(InputFieldComponent, {static: true}) searchRef: InputFieldComponent;
  @ViewChild(MatSelect, {static: true}) selectRef: MatSelect;
  @ViewChild('searchBox', {static: true}) searchBoxRef: ElementRef<HTMLDivElement>;

  isActive: boolean;

  icons = Icons;
  searchValue$ = new BehaviorSubject<string>(null);
  filteredOptions: LabeledOption<any>[];
  private unsubscribe$ = new Subject();

  constructor() {
    super();
  }

  writeValue(value: any) {
    this.selectRef.value = value;
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
    if (isDisabled) {
      this.selectRef.close();
    }
  }

  userInputChange(value: any) {
    this.writeValue(value);
    this.onChange && this.onChange(value);
  }

  focus() {
    this.selectRef.open();
    this.isActive = true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.searchValue$.complete();
  }

  clearSearch(inputRef: InputFieldComponent) {
    this.searchValue$.next(null);
    inputRef.writeValue(null);
  }
}
