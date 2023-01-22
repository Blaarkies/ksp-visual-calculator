import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CelestialBody } from '../../../services/json-interfaces/kerbol-system-characteristics';
import { PlanetMoonSelectorComponent } from '../planet-moon-selector/planet-moon-selector.component';
import { InputRatingComponent } from '../input-rating/input-rating.component';
import { FormControl } from '@angular/forms';
import { InputToggleComponent } from '../../controls/input-toggle/input-toggle.component';
import { InputNumberComponent } from '../../controls/input-number/input-number.component';

let convertersLabelMap = new Map<string, string>([
  ['Lf+Ox', 'Liquid Fuel + Oxidizer'],
  ['LiquidFuel', 'Liquid Fuel'],
  ['Oxidizer', 'Oxidizer'],
  ['Monoprop', 'Monopropellant'],
  ['MonoPropellant', 'Monopropellant'],
  ['Fuel Cell', 'Fuel Cell'],
]);

@Component({
  standalone: true,
  selector: 'cp-mining-base-control',
  templateUrl: './mining-base-control.component.html',
  styleUrls: ['./mining-base-control.component.scss'],
  imports: [
    CommonModule,
    PlanetMoonSelectorComponent,
    InputRatingComponent,
    InputToggleComponent,
    InputNumberComponent,
  ],
})
export class MiningBaseControlComponent {

  @Input() title = 'Mining Base Controls';

  converters = [
    {
      label: convertersLabelMap.get('Lf+Ox'),
      control: new FormControl<boolean>(false),
    },
    {
      label: convertersLabelMap.get('MonoPropellant'),
      control: new FormControl<boolean>(false),
    }
  ];

  controlOreConcentration = new FormControl<number>(5);

  updatePlanet(body: CelestialBody) {
    // this.selectedBody = body;
  }

}
