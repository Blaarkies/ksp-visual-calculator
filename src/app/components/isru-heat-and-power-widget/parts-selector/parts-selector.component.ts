import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { Icons } from '../../../common/domain/icons';
import { ControlMetaNumber } from '../../../common/domain/input-fields/control-meta-number';
import { takeUntil, throttleTime } from 'rxjs';
import { InputSelectComponent } from '../../controls/input-select/input-select.component';
import { InputNumberComponent } from '../../controls/input-number/input-number.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CraftPart, PartProperties } from '../domain/craft-part';
import { categoryIconMap } from '../domain/part-category-icon-map';
import { WithDestroy } from '../../../common/with-destroy';
import { Group } from '../../../common/domain/group';


let kspParts: CraftPart[] = [
  {
    label: 'Convert-O-Tron 250',
    category: 'converter',
    properties: {
      produceHeat: 4000,
      drawEc: 100,
      produceFuel: 1.8,
    },
  },
  {
    label: 'Radiator Panel (large)',
    category: 'radiator',
    properties: {
      drawHeat: 400,
    },
  },
  {
    label: 'Gigantor XL Solar Array',
    category: 'solar-panel',
    properties: {
      produceSolarEc: 24.4,
    },
  },
  {
    label: 'PB-NUK Radioisotope Thermoelectric Generator',
    category: 'rtg',
    properties: {
      produceEc: .75,
    },
  },
  {
    label: 'Fuel Cell',
    category: 'fuel-cell',
    properties: {
      produceEc: 1.5,
      drawLf: 0.0016875,
      drawOx: 0.0020625,
    },
  },
  {
    label: 'Z-4K Rechargeable Battery Bank',
    category: 'battery',
    properties: {
      storageEc: 4000,
    },
  },
];

let kspPartsLabelOptions = kspParts.map((p) => new LabeledOption<CraftPart>(p.label, p));

class CraftPartEntry {
  control: FormControl<number>;
  part: CraftPart;
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

  craftPartsEntries: CraftPartEntry[] = [];
  partOptions: LabeledOption<CraftPart>[] = kspPartsLabelOptions;
  partIcons = new Map<CraftPart, string>(
    this.partOptions.map(p => [
      p.value,
      categoryIconMap.get(p.value.category),
    ]));

  controlAddPart = new FormControl<CraftPart>(null);
  defaultControlMeta = new ControlMetaNumber(0, 100, 3, 'x');
  formArray = new FormArray<FormControl<number>>([]);

  icons = Icons;

  constructor() {
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

        this.refreshPartOptions();
      });

    setTimeout(() => {
      this.controlAddPart.setValue(kspPartsLabelOptions[0].value);
    }, 500)

    this.formArray
      .valueChanges
      .pipe(
        throttleTime(200),
        takeUntil(this.destroy$))
      .subscribe(() => this.eventUpdate());
  }

  removeEntry(entry: CraftPartEntry) {
    this.craftPartsEntries.remove(entry);
    this.refreshPartOptions(true);
  }

  private refreshPartOptions(doReset: boolean = false) {
    let selected = new Set<CraftPart>(this.craftPartsEntries.map(e => e.part));
    let source = doReset ? kspPartsLabelOptions : this.partOptions;
    this.partOptions = source.filter(lo => !selected.has(lo.value));

    this.eventUpdate();
  }


  private eventUpdate() {
    let newGroupList = this.craftPartsEntries.map(cpe =>
      new Group<PartProperties>(cpe.part.properties, cpe.control.value));
    this.update.emit(newGroupList);
  }
}
