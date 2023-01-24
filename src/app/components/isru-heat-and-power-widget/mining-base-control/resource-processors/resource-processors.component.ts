import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlItem } from '../mining-base-control.component';
import { InputToggleComponent } from '../../../controls/input-toggle/input-toggle.component';
import { merge, mergeAll, Subject, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Converter } from '../../domain/craft-part';
import { WithDestroy } from '../../../../common/with-destroy';

@Component({
  standalone: true,
  selector: 'cp-resource-processors',
  templateUrl: './resource-processors.component.html',
  styleUrls: ['./resource-processors.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputToggleComponent,
  ]
})
export class ResourceProcessorsComponent extends WithDestroy() implements OnDestroy {

  @Input() set converters(value: Converter[]) {
    this.setupControls(value);
  };

  @Output() update = new EventEmitter<string[]>();

  controlEntities: ControlItem<string, boolean>[];

  private stopControls$ = new Subject<void>();

  constructor() {
    super();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopControls$.next();
    this.stopControls$.complete();
  }

  private setupControls(value: Converter[]) {
    this.stopControls$.next();

    if (!(value?.length)) {
      this.controlEntities = [];
      return;
    }
    this.controlEntities = value?.map(c => ({
      label: c.converterName,
      value: c.converterName,
      control: new FormControl<boolean>(false),
    }));

    let controls$ = this.controlEntities?.map(ce => ce.control.valueChanges);
    merge(controls$)
      .pipe(
        mergeAll(),
        takeUntil(this.stopControls$),
        takeUntil(this.destroy$))
      .subscribe(() => this.eventUpdate());
  }

  getLabel(index: number, item: ControlItem<string, boolean>): string {
    return item.label;
  }

  private eventUpdate() {
    let activeConverters = this.controlEntities
      .filter(ce => ce.control.value)
      .map(ce => ce.value);
    this.update.emit(activeConverters);
  }
}
