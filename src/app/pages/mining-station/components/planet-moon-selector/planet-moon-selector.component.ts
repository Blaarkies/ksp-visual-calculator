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
import { LabeledOption } from '../../../../common/domain/input-fields/labeled-option';
import { SpaceObjectType } from '../../../../common/domain/space-objects/space-object-type';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputSelectComponent } from '../../../../components/controls/input-select/input-select.component';
import { CelestialBody } from '../../../../services/json-interfaces/kerbol-system-characteristics';
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

  @Input() set selected(body: CelestialBody) {
    this.planetOptions$
      .pipe(
        map(list => this.getBodyMatch(body, list)),
        switchMap(selected => {
          this.control = new FormControl<CelestialBody>(selected);
          return this.control.valueChanges;
        }),
        takeUntil(this.destroy$))
      .subscribe(valueChange => this.update.emit(valueChange));
  }

  @Input() set filter(value: BodyFilter[]) {
    this.filter$.next(value);
  }

  @Output() update = new EventEmitter<CelestialBody>();

  planetOptions$: Observable<LabeledOption<CelestialBody>[]>;
  planetIcons$: Observable<Map<CelestialBody, string>>;
  control: FormControl<CelestialBody>;

  private filter$ = new BehaviorSubject<BodyFilter[]>(['planet']);

  constructor(private cacheService: StockEntitiesCacheService) {
    super();

    this.planetOptions$ = cacheService.planets$.pipe(
      withLatestFrom(this.filter$),
      map(([data, filter]) => data.bodies.filter(b => filter.includes(<BodyFilter>b.type))),
      map(bodies => bodies.map(b => new LabeledOption(b.name, b))));

    this.planetIcons$ = this.planetOptions$.pipe(
      map(bodies => new Map(bodies.map(b => [
          b.value,
          SpaceObjectType.fromString(b.value.type).icon.toString(),
        ]),
      )));
  }

  private getBodyMatch(body: CelestialBody, list: LabeledOption<CelestialBody>[]) {
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
