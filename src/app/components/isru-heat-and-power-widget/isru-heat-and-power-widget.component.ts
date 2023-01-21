import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithDestroy } from '../../common/with-destroy';
import { WidgetData } from './domain/widget-data';
import { PartsSelectorComponent } from './parts-selector/parts-selector.component';
import { PartProperties } from './domain/craft-part';
import { Group } from '../../common/domain/group';
import { CraftPartStatisticsComponent } from './craft-part-statistics/craft-part-statistics.component';
import { CelestialBody } from '../../services/json-interfaces/kerbol-system-characteristics';
import { PlanetMoonSelectorComponent } from './planet-moon-selector/planet-moon-selector.component';

@Component({
  standalone: true,
  selector: 'cp-isru-heat-and-power-widget',
  templateUrl: './isru-heat-and-power-widget.component.html',
  styleUrls: ['./isru-heat-and-power-widget.component.scss'],
  imports: [
    CommonModule,
    PartsSelectorComponent,
    CraftPartStatisticsComponent,
    PlanetMoonSelectorComponent,
  ],
})
export class IsruHeatAndPowerWidgetComponent extends WithDestroy() {

  @Input() set data(value: WidgetData) {
  }

  selectedParts: Group<PartProperties>[];
  selectedBody: CelestialBody;

  constructor() {
    super();
  }

  updateParts(parts: Group<PartProperties>[]) {
    this.selectedParts = parts;
  }

  updatePlanet(body: CelestialBody) {
    this.selectedBody = body;
  }
}