import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabeledOption } from '../../../common/domain/input-fields/labeled-option';
import {
  CelestialBody,
  KerbolSystemCharacteristics
} from '../../../services/json-interfaces/kerbol-system-characteristics';
import { InputSelectComponent } from '../../controls/input-select/input-select.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, map, Observable, ReplaySubject, shareReplay, take, takeUntil, withLatestFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { WithDestroy } from '../../../common/with-destroy';
import { SpaceObjectType } from '../../../common/domain/space-objects/space-object-type';
import { StockEntitiesCacheService } from '../stock-entities-cache.service';

type BodyFilter = 'star' | 'planet' | 'moon';

@Component({
  standalone: true,
  selector: 'cp-planet-moon-selector',
  templateUrl: './planet-moon-selector.component.html',
  styleUrls: ['./planet-moon-selector.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSelectComponent,
  ],
})
export class PlanetMoonSelectorComponent extends WithDestroy() {

  @Input() title = 'Location';

  @Input() set filter(value: BodyFilter[]) {
    this.filter$.next(value);
  }

  @Output() update = new EventEmitter<CelestialBody>();

  planetOptions$: Observable<LabeledOption<CelestialBody>[]>;
  planetIcons$: Observable<Map<CelestialBody, string>>;

  control = new FormControl<CelestialBody>(null);

  private filter$ = new BehaviorSubject<BodyFilter[]>(['planet']);

  constructor(cacheService: StockEntitiesCacheService) {
    super();

    this.planetOptions$ = cacheService.planets$.pipe(
      withLatestFrom(this.filter$),
      map(([data, filter]) => data.bodies.filter(b => filter.includes(<BodyFilter>b.type))),
      map(bodies => bodies.map(b => new LabeledOption(b.name, b))));

    this.planetIcons$ = this.planetOptions$.pipe(
      map(bodies => new Map(bodies.map(b => [
          b.value,
          SpaceObjectType.fromString(b.value.type).icon.toString(),
        ])
      )));

    this.control
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(body => this.update.emit(body));

    this.planetOptions$
      .pipe(take(1))
      .subscribe(options => this.control.setValue(
        options.find(b => b.value.name === 'Kerbin')?.value))
  }

}
