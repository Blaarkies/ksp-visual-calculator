import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithDestroy } from '../../common/with-destroy';
import { WidgetData } from './domain/widget-data';
import { PartsSelectorComponent } from './parts-selector/parts-selector.component';
import { CraftPartStatisticsComponent } from './craft-part-statistics/craft-part-statistics.component';
import { PlanetMoonSelectorComponent } from './planet-moon-selector/planet-moon-selector.component';
import { StockEntitiesCacheService } from './stock-entities-cache.service';
import { MiningBaseControlComponent } from './mining-base-control/mining-base-control.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IsruWidgetService } from './isru-widget.service';

@Component({
  standalone: true,
  selector: 'cp-isru-heat-and-power-widget',
  templateUrl: './isru-heat-and-power-widget.component.html',
  styleUrls: ['./isru-heat-and-power-widget.component.scss'],
  providers: [
    StockEntitiesCacheService,
    IsruWidgetService,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PartsSelectorComponent,
    CraftPartStatisticsComponent,
    PlanetMoonSelectorComponent,
    MiningBaseControlComponent,
  ],
})
export class IsruHeatAndPowerWidgetComponent extends WithDestroy() implements OnDestroy {

  @Input() set data(value: WidgetData) {
  }

  constructor(private isruService: IsruWidgetService) {
    super();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.isruService.destroy();
  }

}
