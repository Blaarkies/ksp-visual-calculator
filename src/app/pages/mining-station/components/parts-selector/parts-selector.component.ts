import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  distinctUntilChanged,
  map,
  mergeAll,
  mergeMap,
  Observable,
  shareReplay,
  Subject,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Group } from '../../../../common/domain/group';
import { Icons } from '../../../../common/domain/icons';
import { ControlMetaNumber } from '../../../../common/domain/input-fields/control-meta-number';
import { LabeledOption } from '../../../../common/domain/input-fields/labeled-option';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { InputSelectComponent } from '../../../../components/controls/input-select/input-select.component';
import { StockEntitiesCacheService } from '../../../../services/stock-entities-cache.service';
import { ControlItem } from '../../domain/control-item';
import { CraftPart } from '../../domain/craft-part';
import { categoryIconMap } from '../../domain/part-category-icon-map';
import { MiningBaseService } from '../../services/mining-base.service';

@Component({
  selector: 'cp-parts-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSelectComponent,
    InputNumberComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './parts-selector.component.html',
  styleUrls: ['./parts-selector.component.scss'],
  animations: [BasicAnimations.expandY],
})
export class PartsSelectorComponent extends WithDestroy() implements OnDestroy {

  @Input() title = 'Parts';

  controlEntities$ = new BehaviorSubject<ControlItem<CraftPart, number>[]>([]);

  filteredPartOptions$: Observable<LabeledOption<CraftPart>[]>;
  partIcons$: Observable<Map<CraftPart, string>>;

  controlAddPart: FormControl<CraftPart>;
  defaultControlMeta = new ControlMetaNumber(0.499, 100, 3, 'x');
  icons = Icons;

  private stopControls$ = new Subject<void>();

  constructor(private cacheService: StockEntitiesCacheService,
              private miningBaseService: MiningBaseService) {
    super();

    let miningParts$ = this.cacheService.miningParts$;
    let allPartOptions$ = miningParts$.pipe(
      map(parts => parts.map(p => new LabeledOption<CraftPart>(p.label, p))),
      shareReplay(1));

    this.filteredPartOptions$ = allPartOptions$.pipe(
      combineLatestWith(this.controlEntities$),
      map(([parts, controlEntities]) => {
        let selectedList = controlEntities.map(cp => cp.value);
        return controlEntities.length
          ? parts.filter(p => !selectedList.includes(p.value))
          : parts;
      }),
      distinctUntilChanged((a, b) => a.some((value, i) => value === b[i])));

    this.partIcons$ = miningParts$.pipe(
      map(parts => new Map<CraftPart, string>(
        parts.map(p => [p, categoryIconMap.get(p.category)]))),
      shareReplay(1));

    this.controlAddPart = new FormControl<CraftPart>(null);
    this.controlAddPart.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(part => {
        this.createPartControlEntries([new Group(part, 1)]);
        this.controlAddPart.reset(null, {emitEvent: false});
      });

    combineLatest([
      this.filteredPartOptions$,
      this.miningBaseService.craftPartTypes$,
    ]).pipe(
      map(([options, selected]) => this.getPartsMatches(selected, options)),
      takeUntil(this.destroy$))
      .subscribe(partGroups => {
        this.clearControlListeners();
        this.createPartControlEntries(partGroups, {emit: false});
      });
  }

  private getPartsMatches(selected, options): Group<CraftPart>[] {
    return selected
      .map(s => {
        let matchItem = options.find(o => o.value.label === s.item.label)?.value;
        return new Group(matchItem, s.count);
      })
      .filter(g => g.item);
  }

  private createPartControlEntries(list: Group<CraftPart>[], {emit} = {emit: true}) {
    let newEntries: ControlItem<CraftPart, number>[] = list.map(g => ({
      control: new FormControl(g.count),
      value: g.item,
    }));
    let controlEntities = this.controlEntities$.value;
    controlEntities = controlEntities.concat(newEntries);
    this.controlEntities$.next(controlEntities);

    this.addListenersToControls(this.controlEntities$);

    if (emit) {
      this.eventUpdate();
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopControls$.next();
    this.stopControls$.complete();
  }

  private clearControlListeners() {
    this.stopControls$.next();
    this.controlEntities$.next([]);
  }

  private addListenersToControls(controls$: Observable<ControlItem<CraftPart, number>[]>) {
    this.stopControls$.next();
    controls$.pipe(
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

  removeControl(entry: ControlItem<CraftPart, number>, index: number) {
    let controlEntities = this.controlEntities$.value;
    controlEntities.splice(index, 1);
    this.controlEntities$.next(controlEntities);

    this.eventUpdate();
  }

  private eventUpdate() {
    let newGroupList = this.controlEntities$.value
      .map(ce => new Group(ce.value, ce.control.value));
    this.miningBaseService.updatePartList(newGroupList);
  }

  private eventDeltaUpdate(value: number, entity: CraftPart) {
    this.miningBaseService.updatePartCount(value, entity);
  }

}
