import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  merge,
  mergeAll,
  mergeWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { Group } from '../../../../common/domain/group';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputToggleComponent } from '../../../../components/controls/input-toggle/input-toggle.component';
import { ControlItem } from '../../domain/control-item';
import { converterSortMap } from '../../domain/converter-sort-map';
import { CraftPart } from '../../domain/craft-part';
import { MiningBaseService } from '../../services/mining-base.service';

@Component({
  selector: 'cp-resource-processors',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputToggleComponent,
  ],
  templateUrl: './resource-processors.component.html',
  styleUrls: ['./resource-processors.component.scss'],
})
export class ResourceProcessorsComponent extends WithDestroy() implements OnDestroy {

  controlEntities: ControlItem<string, boolean>[] = [];

  private stopControls$ = new Subject<void>();
  private latestActiveConverters = [];

  constructor(private miningBaseService: MiningBaseService) {
    super();

    let mb = miningBaseService;
    mb.partSelectionUpdated$
      .pipe(
        mergeWith(mb.loadState$),
        takeUntil(this.destroy$))
      .subscribe(() => this.setupValues(mb.partSelection, mb.activeConverters));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopControls$.next();
    this.stopControls$.complete();
  }

  trackByLabel(index: number, item: ControlItem<string, boolean>): string {
    return item.label;
  }

  private setupValues(parts: Group<CraftPart>[], converters: string[]) {
    let options = this.getConverterOptions(parts) ?? [];

    this.setupControls(options, converters);
  }

  private getConverterNames(groups: Group<CraftPart>[]): string[] {
    return groups
      .map(p => p.item.converters ?? [])
      .flatMap()
      .map(a => a.converterName);
  }

  private getConverterOptions(groups: Group<CraftPart>[]): string[] {
    if (!groups) {
      return [];
    }
    return this.getConverterNames(groups)
      .distinct()
      .sort((a, b) => converterSortMap.get(a) - converterSortMap.get(b));
  }

  private setupControls(options: string[], selected: string[]) {
    this.stopControls$.next();

    if (!options || !options.length) {
      this.controlEntities = [];
      this.eventUpdate();
      return;
    }

    this.controlEntities = this.getExistingMatches(options);

    let newControls = this.getNewControls(options);
    this.controlEntities.push(...newControls);

    this.controlEntities
      .filter(ce => selected.includes(ce.value))
      .forEach(ce => ce.control.setValue(true, {emitEvent: false}));

    this.eventUpdate();

    let controls$ = this.controlEntities?.map(ce => ce.control.valueChanges);
    merge(controls$)
      .pipe(
        mergeAll(),
        takeUntil(this.stopControls$),
        takeUntil(this.destroy$))
      .subscribe(() => this.eventUpdate());
  }

  private getNewControls(options: string[]) {
    return options
      .filter(name => !this.controlEntities.some(ce => ce.label === name))
      .map(c => ({
        label: c, value: c,
        control: new FormControl<boolean>(false),
      }));
  }

  private getExistingMatches(options: string[]) {
    return this.controlEntities
      ?.filter(ce => options.some(name => ce.label === name));
  }

  private eventUpdate() {
    let activeConverters = this.controlEntities
      .filter(ce => ce.control.value)
      .map(ce => ce.value);
    this.miningBaseService.updateActiveConverters(activeConverters);
    this.latestActiveConverters = activeConverters;
  }
}
