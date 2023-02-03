import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { PlanetMoonSelectorComponent } from '../planet-moon-selector/planet-moon-selector.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputNumberComponent } from '../../controls/input-number/input-number.component';
import {
  engineerBonusMap,
  EngineerSkillSelectorComponent
} from './engineer-skill-selector/engineer-skill-selector.component';
import { IsruWidgetService } from '../isru-widget.service';
import { delay, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { WithDestroy } from '../../../common/with-destroy';
import { ResourceProcessorsComponent } from './resource-processors/resource-processors.component';

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

  converters$: Observable<string[]>;
  controlOreConcentration = new FormControl<number>(5);
  controlEngineerBonus = new FormControl<number>(engineerBonusMap.get(-1));

  private stopControls$ = new Subject<void>();

  constructor(private isruService: IsruWidgetService) {
    super();

    let converterSortMap = new Map<string, number>([
      ['Liquid Fuel + Oxidizer', 1],
      ['Liquid Fuel', 2],
      ['Oxidizer', 3],
      ['Monopropellant', 4],
      ['Fuel Cell', 5],
    ]);
    this.converters$ = this.isruService.craftPartGroups$.pipe(
      map(groups => groups
        .map(g => g.item.converters ?? [])
        .flatMap()
        .map(c => c.converterName)
        .distinct()
        .sort((a,b) => converterSortMap.get(a) - converterSortMap.get(b))
      ));

    this.controlOreConcentration.valueChanges.pipe(
      startWith(this.controlOreConcentration.value),
      takeUntil(this.destroy$))
      .subscribe(value => this.isruService.updateOreConcentration(value));

    this.controlEngineerBonus.valueChanges.pipe(
      delay(0),
      startWith(this.controlEngineerBonus.value),
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
