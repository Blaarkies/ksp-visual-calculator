import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlItem } from '../mining-base-control.component';
import { InputToggleComponent } from '../../../../../components/controls/input-toggle/input-toggle.component';
import { merge, mergeAll, Subject, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { WithDestroy } from '../../../../../common/with-destroy';

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

  @Input() set converters(value: string[]) {
    this.setupControls(value ?? []);
  };

  @Output() update = new EventEmitter<string[]>();

  controlEntities: ControlItem<string, boolean>[];

  private stopControls$ = new Subject<void>();

  constructor() {
    super();

    // TODO: pre-select 1 converter
    let handle = setInterval(() => {
      if (this.controlEntities?.length) {
        this.controlEntities[0].control.setValue(true);
        clearInterval(handle);
      }
    }, 200);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopControls$.next();
    this.stopControls$.complete();
  }

  private setupControls(value: string[]) {
    this.stopControls$.next();

    if (!value || !value.length) {
      this.controlEntities = [];
      this.eventUpdate();
      return;
    }

    this.controlEntities = this.controlEntities
      ?.filter(ce => value.some(name => ce.label === name));
    this.controlEntities.push(
      ...value
        .filter(name => !this.controlEntities.some(ce => ce.label === name))
        .map(c => ({
          label: c, value: c,
          control: new FormControl<boolean>(false),
        }))
    );
    this.eventUpdate();

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
