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
  distinctUntilChanged,
  map,
  mergeAll,
  mergeMap,
  Observable,
  shareReplay,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { BasicAnimations } from '../../../../animations/basic-animations';
import { Group } from '../../../../common/domain/group';
import { Icons } from '../../../../common/domain/icons';
import { ControlMetaNumber } from '../../../../common/domain/input-fields/control-meta-number';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { Option } from '../../../../components/controls/input-section-selection-list/domain/option';
import { InputSectionSelectionListComponent } from '../../../../components/controls/input-section-selection-list/input-section-selection-list.component';
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

  private selectedGroups: Group<CraftPart>[];
  private stopControls$ = new Subject<void>();
  private stopSetupValues$ = new Subject<void>();

  constructor(private cacheService: StockEntitiesCacheService,
              private miningBaseService: MiningBaseService) {
    super();

    let miningParts$ = cacheService.miningParts$;
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

    miningBaseService.loadState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.setupValues());

    this.controlSelectedParts
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        let partGroups = this.getPartsMatches(value, this.selectedGroups);
        this.clearControlListeners();
        this.createPartControlEntries(partGroups, {emit: true});
      });
  }

  private setupValues() {
    let groups = this.miningBaseService.partSelection;
    this.selectedGroups = groups;

    this.parts$
      .pipe(
        take(1),
        takeUntil(this.stopSetupValues$))
      .subscribe(options => {
        let selection = groups.map(g => g.item);
        let selectedOptions = selection.map(s => options.find(o => o.value === s));
        if (selectedOptions.equal(this.controlSelectedParts.value)) {
          return;
        }
        this.controlSelectedParts.setValue(selectedOptions);
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
    this.stopSetupValues$.next();
    this.stopSetupValues$.complete();
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
    this.selectedGroups = newGroupList;
  }

  private eventDeltaUpdate(value: number, entity: CraftPart) {
    this.miningBaseService.updatePartCount(value, entity);
  }

}
