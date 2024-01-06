import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  BehaviorSubject,
  map,
  Observable,
  switchMap,
  takeUntil,
  withLatestFrom,
} from 'rxjs';
import { PlanetoidAssetDto } from '../../../../common/domain/dtos/planetoid-asset.dto';
import { LabeledOption } from '../../../../common/domain/input-fields/labeled-option';
import { PlanetoidType } from '../../../../common/domain/space-objects/planetoid-type';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputSelectComponent } from '../../../../components/controls/input-select/input-select.component';
import { StockEntitiesCacheService } from '../../../../services/stock-entities-cache.service';

type BodyFilter = 'star' | 'planet' | 'moon';

@Component({
  selector: 'cp-planet-moon-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSelectComponent,
  ],
  templateUrl: './planet-moon-selector.component.html',
  styleUrls: ['./planet-moon-selector.component.scss'],
})
export class PlanetMoonSelectorComponent extends WithDestroy() {

  @Input() title = 'Location';

  @Input() set selected(body: PlanetoidAssetDto) {
    this.planetOptions$
      .pipe(
        map(list => this.getBodyMatch(body, list)),
        switchMap(selected => {
          this.control = new FormControl<PlanetoidAssetDto>(selected);
          return this.control.valueChanges;
        }),
        takeUntil(this.destroy$))
      .subscribe(valueChange => this.update.emit(valueChange));
  }

  @Input() set filter(value: BodyFilter[]) {
    this.filter$.next(value);
  }

  @Output() update = new EventEmitter<PlanetoidAssetDto>();

  planetOptions$: Observable<LabeledOption<PlanetoidAssetDto>[]>;
  planetIcons$: Observable<Map<PlanetoidAssetDto, string>>;
  control: FormControl<PlanetoidAssetDto>;

  private filter$ = new BehaviorSubject<BodyFilter[]>(['planet']);

  constructor(cacheService: StockEntitiesCacheService) {
    super();

    this.planetOptions$ = cacheService.planetoids$.pipe(
      withLatestFrom(this.filter$),
      map(([data, filter]) => data.planetoids.filter(b => filter.includes(<BodyFilter>b.type))),
      map(bodies => bodies.map(b => new LabeledOption(b.name, b))));

    this.planetIcons$ = this.planetOptions$.pipe(
      map(bodies => new Map(bodies.map(b => [
          b.value,
          PlanetoidType.fromString(b.value.type).icon.toString(),
        ]),
      )));
  }

  private getBodyMatch(body: PlanetoidAssetDto, list: LabeledOption<PlanetoidAssetDto>[]) {
    if (!body) {
      return list.find(b => b.value.name === 'Kerbin')?.value;
    }

    let match = list.find(({value}) => value.id === body.id)?.value;
    if (match) {
      return match;
    }

    return list.find(b => b.value.name === 'Kerbin')?.value;
  }

}
