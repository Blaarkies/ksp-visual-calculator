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
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
} from 'rxjs';
import { WithDestroy } from '../../../../common/with-destroy';
import { InputNumberComponent } from '../../../../components/controls/input-number/input-number.component';
import { CelestialBody } from '../../../../services/json-interfaces/kerbol-system-characteristics';
import { MiningBaseService } from '../../services/mining-base.service';
import { EngineerSkillSelectorComponent } from '../engineer-skill-selector/engineer-skill-selector.component';
import { PlanetMoonSelectorComponent } from '../planet-moon-selector/planet-moon-selector.component';
import { ResourceProcessorsComponent } from '../resource-processors/resource-processors.component';

@Component({
  selector: 'cp-mining-base-control',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PlanetMoonSelectorComponent,
    InputNumberComponent,
    EngineerSkillSelectorComponent,
    ResourceProcessorsComponent,
  ],
  templateUrl: './mining-base-control.component.html',
  styleUrls: ['./mining-base-control.component.scss'],
})
export class MiningBaseControlComponent extends WithDestroy() implements OnDestroy {

  @Input() title = 'Environment';

  selectedPlanet = this.miningBaseService.planet$;
  controlOreConcentration: FormControl<number>;
  controlEngineerBonus: FormControl<number>;

  constructor(private miningBaseService: MiningBaseService) {
    super();

    miningBaseService.oreConcentration$
      .pipe(
        distinctUntilChanged(),
        map(value => (value * 100).round(2)),
        filter(scaledValue => scaledValue !== this.controlOreConcentration?.value),
        switchMap(scaledValue => {
          this.controlOreConcentration = new FormControl<number>(scaledValue);
          return this.controlOreConcentration.valueChanges;
        }),
        takeUntil(this.destroy$))
      .subscribe(valueChange =>
        this.miningBaseService.updateOreConcentration(valueChange * .01));

    miningBaseService.engineerBonus$
      .pipe(
        distinctUntilChanged(),
        switchMap(value => {
          this.controlEngineerBonus = new FormControl<number>(value);
          return this.controlEngineerBonus.valueChanges;
        }),
        takeUntil(this.destroy$))
      .subscribe(valueChange =>
        this.miningBaseService.updateEngineerBonus(valueChange));
  }

  updatePlanet(body: CelestialBody) {
    this.miningBaseService.updatePlanet(body);
  }

}
