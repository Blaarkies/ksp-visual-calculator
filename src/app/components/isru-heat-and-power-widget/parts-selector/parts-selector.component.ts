import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import { Icons } from '../../../common/domain/icons';
import { ControlMetaNumber } from '../../../common/domain/input-fields/control-meta-number';
import {
  BehaviorSubject,
  combineLatestWith,
  delay, distinctUntilChanged,
  map,
  mergeAll,
  mergeMap,
  Observable,
  shareReplay,
  Subject,
  take,
  takeUntil, tap
} from 'rxjs';
import { InputSelectComponent } from '../../controls/input-select/input-select.component';
import { InputNumberComponent } from '../../controls/input-number/input-number.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CraftPart } from '../domain/craft-part';
import { categoryIconMap } from '../domain/part-category-icon-map';
import { WithDestroy } from '../../../common/with-destroy';
import { Group } from '../../../common/domain/group';
import { StockEntitiesCacheService } from '../stock-entities-cache.service';
import { IsruWidgetService } from '../isru-widget.service';
import { ControlItem } from '../mining-base-control/mining-base-control.component';

export class CraftPartEntry {
  control: FormControl<number>;
  part: CraftPart;
}

export class DeltaUpdate<T, U> {
  entity: T;
  value: U;
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
export class PartsSelectorComponent extends WithDestroy() implements OnDestroy {

  @Input() title = 'Parts';

  controlEntities$ = new BehaviorSubject<ControlItem<CraftPart, number>[]>([]);

  allPartOptions$: Observable<LabeledOption<CraftPart>[]>;
  filteredPartOptions$: Observable<LabeledOption<CraftPart>[]>;
  partIcons$: Observable<Map<CraftPart, string>>;

  controlAddPart = new FormControl<CraftPart>(null);
  defaultControlMeta = new ControlMetaNumber(0.499, 100, 3, 'x');
  icons = Icons;

  private miningParts$ = this.cacheService.miningParts$;
  private stopControls$ = new Subject<void>();

  constructor(private cacheService: StockEntitiesCacheService,
              private isruService: IsruWidgetService) {
    super();

    this.allPartOptions$ = this.miningParts$.pipe(
      map(parts => parts.map(p => new LabeledOption<CraftPart>(p.label, p))),
      shareReplay(1));

    this.filteredPartOptions$ = this.allPartOptions$.pipe(
      combineLatestWith(this.controlEntities$),
      map(([parts, controlEntities]) => {
        let selectedList = controlEntities.map(cp => cp.value);
        return controlEntities.length
          ? parts.filter(p => !selectedList.includes(p.value))
          : parts;
      }));

    this.partIcons$ = this.miningParts$.pipe(
      map(parts => new Map<CraftPart, string>(
        parts.map(p => [p, categoryIconMap.get(p.category)]))),
      shareReplay(1));

    this.controlAddPart
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(part => this.createPartControlEntry(part));

    this.controlEntities$.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.addControlListeners());

    // TODO: auto select some default parts
    this.allPartOptions$.pipe(
      take(1),
      delay(500),
      tap(parts => {
        let splits = parts.splitFilter(p => {
          let cat = p.value.category;
          return cat === 'isru' ? 0
            : cat === 'drill' ? 1
              : cat === 'radiator' ? 2
                : cat === 'battery' ? 3
                  : cat === 'solar-panel' ? 4
                    : cat === 'resource-tank' ? 5
                      : cat === 'fuel-cell' ? 6
                        : cat === 'rtg' ? 7 : 8;
        });

        let newEntries: ControlItem<CraftPart, number>[] = [
          splits[0][0],
          splits[1][1],
          splits[2][4],
          splits[3][3],
          splits[4][8],
          splits[5][26],
          splits[6][1],
          // splits[7][0],
        ].map(p => ({control: new FormControl(1), value: p.value}));

        let controlEntities = this.controlEntities$.value;
        controlEntities.push(...newEntries);
        this.controlEntities$.next(controlEntities);
        this.eventUpdate();
      }),
      )
      .subscribe();
  }

  private createPartControlEntry(part: CraftPart) {
    let newEntry: ControlItem<CraftPart, number> = {
      control: new FormControl(1),
      value: part,
    };
    let controlEntities = this.controlEntities$.value;
    controlEntities.push(newEntry);
    this.controlEntities$.next(controlEntities);
    this.eventUpdate();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopControls$.next();
    this.stopControls$.complete();
  }

  private addControlListeners() {
    this.stopControls$.next();
    this.controlEntities$.pipe(
      mergeMap(groups => groups
        .map(g => g.control.valueChanges.pipe(
          distinctUntilChanged(),
          map(change => ({value: change, part: g.value}))))),
      mergeAll(),
      takeUntil(this.destroy$),
      takeUntil(this.stopControls$))
      .subscribe(({value, part}) => this.eventDeltaUpdate(value, part));
  }

  getEntryLabel(index: number, item: ControlItem<CraftPart, number>): string {
    return item.value.label;
  }

  removeEntry(entry: ControlItem<CraftPart, number>, index: number) {
    let controlEntities = this.controlEntities$.value;
    controlEntities.splice(index, 1);
    this.controlEntities$.next(controlEntities);

    this.eventUpdate()
  }

  private eventUpdate() {
    let newGroupList = this.controlEntities$.value
      .map(ce => new Group(ce.value, ce.control.value));
    this.isruService.updatePartList(newGroupList);
  }

  private eventDeltaUpdate(value: number, entity: CraftPart) {
    this.isruService.updatePartCount(value, entity);
  }

}
