import { Component, Input } from '@angular/core';
import { Widget, WidgetType } from '../pocket-grid/pocket-grid.component';
import { CommonModule } from '@angular/common';
import { IsruHeatAndPowerWidgetComponent } from '../isru-heat-and-power-widget/isru-heat-and-power-widget.component';

@Component({
  standalone: true,
  selector: 'cp-widget-window',
  templateUrl: './widget-window.component.html',
  styleUrls: ['./widget-window.component.scss'],
  imports: [
    CommonModule,
    IsruHeatAndPowerWidgetComponent,
  ],
})
export class WidgetWindowComponent {

  @Input() widget: Widget;

  WidgetTypes = WidgetType;

}
