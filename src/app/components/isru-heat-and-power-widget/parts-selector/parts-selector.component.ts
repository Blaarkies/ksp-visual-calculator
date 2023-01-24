import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { Icons } from '../../../common/domain/icons';
import { ControlMetaNumber } from '../../../common/domain/input-fields/control-meta-number';
import { delay, map, shareReplay, take, takeUntil, tap, throttleTime } from 'rxjs';
import { InputSelectComponent } from '../../controls/input-select/input-select.component';
import { InputNumberComponent } from '../../controls/input-number/input-number.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CraftPart, PartProperties } from '../domain/craft-part';
import { categoryIconMap } from '../domain/part-category-icon-map';
import { WithDestroy } from '../../../common/with-destroy';
import { Group } from '../../../common/domain/group';
import { StockEntitiesCacheService } from '../stock-entities-cache.service';

class CraftPartEntry {
  control: FormControl<number>;
  part: CraftPart;
}

class DeltaUpdate<T> {
  entity: T;
}

@Component({
  standalone: true,
  selector: 'cp-parts-selector',
  templateUrl: './parts-selector.component.html',
  styleUrls: ['./parts-selector.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSelectComponent,
    InputNumberComponent,
    MatIconModule,
    MatButtonModule,
  ],
})
export class PartsSelectorComponent extends WithDestroy() {

  @Input() title = 'Parts';

  @Output() update = new EventEmitter<Group<PartProperties>[]>();
  @Output() deltaUpdate = new EventEmitter<DeltaUpdate<Group<PartProperties>>>();

  craftPartsEntries: CraftPartEntry[] = [];

  partOptions$ = this.miningParts.pipe(
    map(parts => parts.map(p => new LabeledOption<CraftPart>(p.label, p))),
    shareReplay(1));
  partIcons$ = this.miningParts.pipe(
    map(parts => new Map<CraftPart, string>(
      parts.map(p => [p, categoryIconMap.get(p.category)]))),
    shareReplay(1));

  controlAddPart = new FormControl<CraftPart>(null);
  defaultControlMeta = new ControlMetaNumber(0, 100, 3, 'x');
  icons = Icons;

  private miningParts = this.cacheService.miningParts$;
  private formArray = new FormArray<FormControl<number>>([]);

  constructor(private cacheService: StockEntitiesCacheService) {
    super();

    this.controlAddPart
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(part => {
        let newEntry = {
          control: new FormControl(1),
          part,
        };
        this.craftPartsEntries.push(newEntry);
        this.formArray.push(newEntry.control);

        this.refreshPartOptions(this.craftPartsEntries.length - 1);
      });

    this.partOptions$
      .pipe(
        take(1),
        delay(500))
      .subscribe(parts => this.controlAddPart.setValue(parts[40].value));

    this.formArray
      .valueChanges
      .pipe(
        throttleTime(200),
        takeUntil(this.destroy$))
      .subscribe(() => {
        this.eventUpdate();
      });
  }

  getEntryLabel(index: number, item: CraftPartEntry): string {
    return item.part.label;
  }

  removeEntry(entry: CraftPartEntry, index: number) {
    this.craftPartsEntries.remove(entry);
    this.formArray.removeAt(index);
    this.refreshPartOptions(index);
  }

  private refreshPartOptions(deltaChangeIndex: number) {
    // let selected = new Set<CraftPart>(this.craftPartsEntries.map(e => e.part));
    // let source = doReset ? kspPartsLabelOptions : this.partOptions;
    // this.partOptions = source.filter(lo => !selected.has(lo.value));
    //
    // this.eventUpdate();
  }

  private eventUpdate() {
    let newGroupList = this.craftPartsEntries.map(cpe =>
      new Group(cpe.part.properties, cpe.control.value));
    this.update.emit(newGroupList);
  }

}
