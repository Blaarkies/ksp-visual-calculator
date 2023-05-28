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
  distinctUntilChanged,
  filter,
  map,
  mergeAll,
  mergeMap,
  Observable,
  shareReplay,
  Subject,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Group } from '../../../../common/domain/group';
import { Icons } from '../../../../common/domain/icons';
import { ControlMetaNumber } from '../../../../common/domain/input-fields/control-meta-number';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { Option } from '../../../../components/controls/input-section-selection-list/domain/option';
import { InputSectionSelectionListComponent } from '../../../../components/controls/input-section-selection-list/input-section-selection-list.component';
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
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,

    InputSectionSelectionListComponent,
    InputNumberComponent,
  ],
  templateUrl: './parts-selector.component.html',
  styleUrls: ['./parts-selector.component.scss'],
  animations: [BasicAnimations.expandY],
})
export class PartsSelectorComponent extends WithDestroy() implements OnDestroy {

  @Input() title = 'Parts';

  controlEntities$ = new BehaviorSubject<ControlItem<CraftPart, number>[]>([]);
  defaultControlMeta = new ControlMetaNumber(0.499, 100, 3, 'x');
  icons = Icons;

  parts$: Observable<Option<CraftPart>[]>;
  sectionIcons$: Observable<Map<string, string>>;
  controlSelectedParts = new FormControl([], {});

  private stopControls$ = new Subject<void>();

  constructor(private cacheService: StockEntitiesCacheService,
              private miningBaseService: MiningBaseService) {
    super();

    let miningParts$ = this.cacheService.miningParts$;
    let partsOptions$: Observable<Option<CraftPart>[]> = miningParts$.pipe(
      map(parts => parts.map(p => ({
        label: p.label,
        value: p,
        searches: [p.category],
        section: p.category,
      }))),
      shareReplay(1));

    this.parts$ = partsOptions$;
    this.sectionIcons$ = partsOptions$.pipe(
      map(parts => new Map<string, string>(
        parts.map(p => [p.section, categoryIconMap.get(p.section)]),
      )));

    let serverUpdatesControl$ = this.miningBaseService.craftPartTypes$
      .pipe(
        filter(groups => {
          let selectedIds = this.controlSelectedParts.value.map(p => p.label);
          let serverIds = groups.map(g => g.item.label);
          let isUnchanged = selectedIds.equal(serverIds);
          return !isUnchanged;
        }),
        withLatestFrom(partsOptions$),
        tap(([groups, option]) => {
          let selection = groups.map(g => g.item);
          let options = selection.map(s => option.find(o => o.value === s));
          if (options.equal(this.controlSelectedParts.value)) {
            return;
          }
          this.controlSelectedParts.setValue(options);
        }),
        map(([groups]) => groups),
      );

    combineLatest([
      this.controlSelectedParts.valueChanges,
      serverUpdatesControl$,
    ]).pipe(
      distinctUntilChanged(([a1, b1], [a2, b2]) => a1.equal(a2) && b1.equal(b2)),
      map(([inputSelection, selectedGroups]) =>
        this.getPartsMatches(inputSelection, selectedGroups)),
      takeUntil(this.destroy$))
      .subscribe(partGroups => {
        this.clearControlListeners();
        this.createPartControlEntries(partGroups, {emit: true});
      });
  }

  private getPartsMatches(inputSelection: Option<CraftPart>[], selectedGroups: Group<CraftPart>[])
    : Group<CraftPart>[] {
    let groups = inputSelection.map(s => {
      let match = selectedGroups.find(g => g.item === s.value);
      return match ?? new Group(s.value, 1);
    });
    return groups;
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
    let newGroupList = this.controlEntities$
      .value
      .map(ce => new Group(ce.value, ce.control.value));
    this.miningBaseService.updatePartList(newGroupList);
  }

  private eventDeltaUpdate(value: number, entity: CraftPart) {
    this.miningBaseService.updatePartCount(value, entity);
  }

}
