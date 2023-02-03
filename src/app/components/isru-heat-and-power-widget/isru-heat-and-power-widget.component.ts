import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
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
import { IsruWarningsComponent } from './isru-warnings/isru-warnings.component';
import { Observable } from 'rxjs';
import { Group } from '../../common/domain/group';
import { CraftPart } from './domain/craft-part';

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
    MiningBaseControlComponent,
    IsruWarningsComponent,
  ],
})
export class IsruHeatAndPowerWidgetComponent extends WithDestroy() implements OnDestroy {

  @Input() set data(value: WidgetData) {
  }

  selectedParts$: Observable<Group<CraftPart>[]>;

  constructor(private isruService: IsruWidgetService) {
    super();

    this.selectedParts$ = isruService.craftPartGroups$;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.isruService.destroy();
  }

}
