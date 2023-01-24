import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { PlanetMoonSelectorComponent } from '../planet-moon-selector/planet-moon-selector.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberComponent } from '../../controls/input-number/input-number.component';
import { EngineerSkillSelectorComponent } from './engineer-skill-selector/engineer-skill-selector.component';
import { IsruWidgetService } from '../isru-widget.service';
import { map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { WithDestroy } from '../../../common/with-destroy';
import { ResourceProcessorsComponent } from './resource-processors/resource-processors.component';
import { Converter } from '../domain/craft-part';

export class ControlItem<T, U> {
  label?: string;
  value?: T;
  control: FormControl<U>;
}

@Component({
  standalone: true,
  selector: 'cp-mining-base-control',
  templateUrl: './mining-base-control.component.html',
  styleUrls: ['./mining-base-control.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PlanetMoonSelectorComponent,
    InputNumberComponent,
    EngineerSkillSelectorComponent,
    ResourceProcessorsComponent,
  ],
})
export class MiningBaseControlComponent extends WithDestroy() implements OnDestroy {

  @Input() title = 'Mining Base Controls';

  converters$: Observable<Converter[]>;
  controlOreConcentration = new FormControl<number>(5);
  controlEngineerBonus = new FormControl<number>(0);

  private stopControls$ = new Subject<void>();

  constructor(private isruService: IsruWidgetService) {
    super();

    this.converters$ = this.isruService.craftPartGroups$.pipe(
      map(groups => groups
        .filter(g => g.item.converters)
        .map(g => g.item.converters)
        .flatMap()));

    this.controlOreConcentration.valueChanges.pipe(
      startWith(this.controlOreConcentration.value),
      takeUntil(this.destroy$))
      .subscribe(value => this.isruService.updateOreConcentration(value));

    this.controlEngineerBonus.valueChanges.pipe(
      startWith(this.controlOreConcentration.value),
      takeUntil(this.destroy$))
      .subscribe(value => this.isruService.updateEngineerBonus(value));

    this.updateConverters([]);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.stopControls$.next();
    this.stopControls$.complete();
  }

  updatePlanet(body: CelestialBody) {
    this.isruService.updatePlanet(body);
  }

  updateConverters(activeConverters: string[]) {
    this.isruService.updateConverters(activeConverters);
  }

}
