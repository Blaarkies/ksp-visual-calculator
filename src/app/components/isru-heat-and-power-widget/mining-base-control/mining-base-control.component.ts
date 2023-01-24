import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { PlanetMoonSelectorComponent } from '../planet-moon-selector/planet-moon-selector.component';
import { InputRatingComponent } from '../input-rating/input-rating.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputToggleComponent } from '../../controls/input-toggle/input-toggle.component';
import { InputNumberComponent } from '../../controls/input-number/input-number.component';
import { EngineerSkillSelectorComponent } from './engineer-skill-selector/engineer-skill-selector.component';

@Component({
  standalone: true,
  selector: 'cp-mining-base-control',
  templateUrl: './mining-base-control.component.html',
  styleUrls: ['./mining-base-control.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PlanetMoonSelectorComponent,
    InputToggleComponent,
    InputNumberComponent,
    EngineerSkillSelectorComponent,
  ],
})
export class MiningBaseControlComponent {

  @Input() title = 'Mining Base Controls';

  converters = [
    {
      label: 'Lf+Ox',
      control: new FormControl<boolean>(false),
    },
    {
      label: 'MonoPropellant',
      control: new FormControl<boolean>(false),
    }
  ];

  controlOreConcentration = new FormControl<number>(5);
  controlEngineerBonus = new FormControl<number>(.05);

  getLabel(index: number, item: {label}): string {
    return item.label;
  }

  updatePlanet(body: CelestialBody) {
    // this.selectedBody = body;
  }

}
