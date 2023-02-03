import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HudService } from '../../../services/hud.service';
import { ActionPanelComponent } from '../../action-panel/action-panel.component';
import { IsruHeatAndPowerWidgetComponent } from '../isru-heat-and-power-widget.component';

@Component({
  standalone: true,
  selector: 'cp-page-displayer',
  templateUrl: './page-displayer.component.html',
  styleUrls: ['./page-displayer.component.scss'],
  imports: [
    CommonModule,
    ActionPanelComponent,
    IsruHeatAndPowerWidgetComponent,
  ]
})
export class PageDisplayerComponent {


  constructor(
    public hudService: HudService,
  ) {
  }
}
